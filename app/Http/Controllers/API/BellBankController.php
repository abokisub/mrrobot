<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\BellBankService;
use App\Models\BellAccount;
use App\Models\BellTransaction;
use App\Models\BellKyc;
use App\Models\BellSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;

class BellBankController extends Controller
{
    protected $bellBankService;

    public function __construct(BellBankService $bellBankService)
    {
        $this->bellBankService = $bellBankService;
    }

    /**
     * Get list of supported banks
     */
    public function getBanks(Request $request)
    {
        try {
            $response = $this->bellBankService->getBanks();
            
            if (isset($response['success']) && $response['success']) {
                // Cache bank list in settings
                BellSetting::setValue('last_bank_list', json_encode($response['data']));
                
                return response()->json([
                    'status' => 'success',
                    'data' => $response['data'] ?? [],
                ]);
            }

            return response()->json([
                'status' => 'fail',
                'message' => $response['message'] ?? 'Failed to fetch banks',
            ], 400);

        } catch (\Exception $e) {
            Log::error('BellBank getBanks failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to fetch banks: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Name enquiry - verify account holder name
     */
    public function nameEnquiry(Request $request)
    {
        $request->validate([
            'account_number' => 'required|string',
            'bank_code' => 'required|string',
        ]);

        try {
            $response = $this->bellBankService->nameEnquiry(
                $request->account_number,
                $request->bank_code
            );

            if (isset($response['success']) && $response['success']) {
                return response()->json([
                    'status' => 'success',
                    'data' => $response['data'] ?? [],
                ]);
            }

            return response()->json([
                'status' => 'fail',
                'message' => $response['message'] ?? 'Name enquiry failed',
            ], 400);

        } catch (\Exception $e) {
            Log::error('BellBank nameEnquiry failed', [
                'error' => $e->getMessage(),
                'account_number' => substr($request->account_number, 0, 4) . '****', // Partial logging
            ]);
            return response()->json([
                'status' => 'fail',
                'message' => 'Name enquiry failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create virtual account for individual client
     */
    public function createVirtualAccount(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'phoneNumber' => 'required|string',
            'address' => 'required|string',
            'email' => 'required|email',
        ]);

        try {
            DB::beginTransaction();

            // Use BVN director info if user doesn't have KYC
            $director = config('bellbank.director');
            $bvn = $director['bvn'] ?? null;
            $useDirectorInfo = false;

            // Check if user has KYC
            $kyc = BellKyc::where('user_id', $user->id)->first();
            if ($kyc && $kyc->kyc_status === 'verified' && $kyc->bvn) {
                $bvn = $kyc->bvn;
            } else {
                // Use director info for users without KYC
                $useDirectorInfo = true;
            }

            $idempotencyKey = Str::uuid()->toString();
            
            // Build payload - use director info if user has no KYC
            $payload = [
                'firstname' => $useDirectorInfo ? ($director['firstname'] ?? $request->firstname) : $request->firstname,
                'lastname' => $useDirectorInfo ? ($director['lastname'] ?? $request->lastname) : $request->lastname,
                'middlename' => $useDirectorInfo ? ($director['middlename'] ?? null) : ($request->middlename ?? null),
                'phoneNumber' => $request->phoneNumber,
                'address' => $request->address,
                'bvn' => $bvn,
                'gender' => $request->gender ?? 'male',
                'dateOfBirth' => $useDirectorInfo ? ($director['date_of_birth'] ?? '1990-01-01') : ($request->dateOfBirth ?? '1990-01-01'),
                'metadata' => [
                    'user_id' => $user->id,
                    'created_by' => 'system',
                    'uses_director_info' => $useDirectorInfo,
                ],
            ];

            $response = $this->bellBankService->createIndividualClient($payload, $idempotencyKey);

            if (isset($response['success']) && $response['success'] && isset($response['data'])) {
                $data = $response['data'];
                
                // Check if account already exists
                $existingAccount = BellAccount::where('external_id', $data['id'] ?? $data['externalReference'] ?? null)
                    ->first();

                if ($existingAccount) {
                    DB::rollBack();
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Virtual account already exists',
                        'data' => $existingAccount,
                    ]);
                }

                $account = BellAccount::create([
                    'user_id' => $user->id,
                    'external_id' => $data['id'] ?? $data['externalReference'] ?? Str::uuid()->toString(),
                    'account_number' => $data['accountNumber'] ?? null,
                    'bank_code' => $data['bankCode'] ?? null,
                    'bank_name' => $data['bankName'] ?? 'BellBank',
                    'currency' => $data['currency'] ?? 'NGN',
                    'status' => 'active',
                    'metadata' => $data,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Virtual account created successfully',
                    'data' => $account,
                ], 201);
            }

            DB::rollBack();
            return response()->json([
                'status' => 'fail',
                'message' => $response['message'] ?? 'Failed to create virtual account',
            ], 400);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BellBank createVirtualAccount failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to create virtual account: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Initiate bank transfer
     */
    public function initiateTransfer(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'beneficiary_bank_code' => 'required|string',
            'beneficiary_account_number' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'narration' => 'required|string',
            'reference' => 'nullable|string|unique:bell_transactions,reference',
        ]);

        try {
            DB::beginTransaction();

            // Check for duplicate using idempotency
            $idempotencyKey = $request->reference ?? Str::uuid()->toString();
            $existingTransaction = BellTransaction::where('idempotency_key', $idempotencyKey)
                ->orWhere('reference', $idempotencyKey)
                ->first();

            if ($existingTransaction) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Transaction already processed',
                    'data' => $existingTransaction,
                ]);
            }

            $payload = [
                'beneficiaryBankCode' => $request->beneficiary_bank_code,
                'beneficiaryAccountNumber' => $request->beneficiary_account_number,
                'amount' => number_format($request->amount, 2, '.', ''),
                'narration' => $request->narration,
                'reference' => $idempotencyKey,
                'senderName' => $request->sender_name ?? config('app.name'),
            ];

            $response = $this->bellBankService->initiateTransfer($payload, $idempotencyKey);

            if (isset($response['success']) && $response['success'] && isset($response['data'])) {
                $data = $response['data'];
                
                $transaction = BellTransaction::create([
                    'user_id' => $user->id,
                    'external_id' => $data['sessionId'] ?? $data['transactionId'] ?? null,
                    'type' => 'transfer',
                    'amount' => $data['amount'] ?? $request->amount,
                    'currency' => 'NGN',
                    'status' => $data['status'] ?? 'pending',
                    'reference' => $data['reference'] ?? $idempotencyKey,
                    'idempotency_key' => $idempotencyKey,
                    'response' => $data,
                    'description' => $data['description'] ?? $request->narration,
                    'source_account_number' => $data['sourceAccountNumber'] ?? null,
                    'source_account_name' => $data['sourceAccountName'] ?? null,
                    'source_bank_code' => $data['sourceBankCode'] ?? null,
                    'source_bank_name' => $data['sourceBankName'] ?? null,
                    'destination_account_number' => $data['destinationAccountNumber'] ?? $request->beneficiary_account_number,
                    'destination_account_name' => $data['destinationAccountName'] ?? null,
                    'destination_bank_code' => $data['destinationBankCode'] ?? $request->beneficiary_bank_code,
                    'destination_bank_name' => $data['destinationBankName'] ?? null,
                    'charge' => $data['charge'] ?? 0,
                    'net_amount' => $data['netAmount'] ?? null,
                    'session_id' => $data['sessionId'] ?? null,
                    'transaction_type_name' => $data['transactionTypeName'] ?? 'bank_transfer',
                    'completed_at' => isset($data['completedAt']) ? date('Y-m-d H:i:s', $data['completedAt'] / 1000) : null,
                ]);

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => $response['message'] ?? 'Transfer initiated successfully',
                    'data' => $transaction,
                ], 201);
            }

            DB::rollBack();
            return response()->json([
                'status' => 'fail',
                'message' => $response['message'] ?? 'Transfer failed',
            ], 400);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('BellBank initiateTransfer failed', [
                'error' => $e->getMessage(),
                'user_id' => $user->id ?? null,
            ]);
            return response()->json([
                'status' => 'fail',
                'message' => 'Transfer failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get transaction status by reference
     */
    public function getTransactionStatus(Request $request, $reference)
    {
        try {
            $transaction = BellTransaction::where('reference', $reference)->first();
            
            if ($transaction) {
                return response()->json([
                    'status' => 'success',
                    'data' => $transaction,
                ]);
            }

            // Query BellBank API if not found locally
            $response = $this->bellBankService->getTransactionByReference($reference);
            
            if (isset($response['success']) && $response['success']) {
                return response()->json([
                    'status' => 'success',
                    'data' => $response['data'] ?? [],
                ]);
            }

            return response()->json([
                'status' => 'fail',
                'message' => 'Transaction not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('BellBank getTransactionStatus failed', [
                'error' => $e->getMessage(),
                'reference' => $reference,
            ]);
            return response()->json([
                'status' => 'fail',
                'message' => 'Failed to get transaction status: ' . $e->getMessage(),
            ], 500);
        }
    }
}

