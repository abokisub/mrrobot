<?php

namespace App\Jobs;

use App\Models\BellWebhook;
use App\Models\BellTransaction;
use App\Models\BellAccount;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessBellWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [1, 5, 10]; // Exponential backoff in seconds

    protected $webhookId;

    /**
     * Create a new job instance.
     */
    public function __construct($webhookId)
    {
        $this->webhookId = $webhookId;
    }

    /**
     * Execute the job.
     */
    public function handle()
    {
        $webhook = BellWebhook::find($this->webhookId);
        
        if (!$webhook) {
            Log::error('BellBank webhook not found', ['id' => $this->webhookId]);
            return;
        }

        // Check if already processed (idempotency)
        if ($webhook->processed) {
            Log::info('BellBank webhook already processed', ['id' => $this->webhookId]);
            return;
        }

        try {
            DB::beginTransaction();

            $payload = $webhook->payload;
            $event = $webhook->event;

            // Handle different event types
            switch ($event) {
                case 'collection':
                case 'credit':
                    $this->handleCollection($payload);
                    break;

                case 'transfer':
                case 'debit':
                    $this->handleTransfer($payload);
                    break;

                default:
                    Log::warning('Unknown BellBank webhook event', [
                        'event' => $event,
                        'webhook_id' => $this->webhookId,
                    ]);
            }

            // Mark as processed
            $webhook->update(['processed' => true]);

            DB::commit();

        } catch (\Exception $e) {
            DB::rollBack();
            
            $webhook->update([
                'error' => $e->getMessage(),
            ]);

            Log::error('BellBank webhook processing failed', [
                'webhook_id' => $this->webhookId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e; // Re-throw to trigger retry
        }
    }

    /**
     * Handle collection/credit event (money received)
     */
    protected function handleCollection($payload)
    {
        $reference = $payload['reference'] ?? null;
        
        if (!$reference) {
            throw new \Exception('Reference missing in collection webhook');
        }

        // Check if transaction already exists (idempotency)
        $transaction = BellTransaction::where('reference', $reference)->first();

        // Credit user wallet if transaction is successful
        if (isset($payload['virtualAccount']) && ($payload['status'] ?? '') === 'successful') {
            $account = BellAccount::where('account_number', $payload['virtualAccount'])->first();
            
            if ($account && $account->user_id) {
                $user = \App\Models\User::find($account->user_id);
                
                if ($user) {
                    $amountReceived = $payload['amountReceived'] ?? 0;
                    $transactionFee = $payload['transactionFee'] ?? 0;
                    $netAmount = $payload['netAmount'] ?? ($amountReceived - $transactionFee);
                    
                    // Only credit if transaction doesn't already exist (idempotency)
                    if (!$transaction) {
                        // Credit user wallet
                        $oldBalance = (float) $user->bal;
                        $newBalance = $oldBalance + $netAmount;
                        
                        DB::table('user')->where('id', $user->id)->update([
                            'bal' => $newBalance
                        ]);
                        
                        // Create transaction record with user_id
                        BellTransaction::create([
                            'user_id' => $user->id,
                            'external_id' => $payload['sessionId'] ?? null,
                            'type' => 'credit',
                            'amount' => $amountReceived,
                            'currency' => $payload['sourceCurrency'] ?? 'NGN',
                            'status' => 'successful',
                            'reference' => $reference,
                            'response' => $payload,
                            'description' => $payload['remarks'] ?? 'Collection from ' . ($payload['sourceAccountName'] ?? 'Unknown'),
                            'source_account_number' => $payload['sourceAccountNumber'] ?? null,
                            'source_account_name' => $payload['sourceAccountName'] ?? null,
                            'source_bank_code' => $payload['sourceBankCode'] ?? null,
                            'source_bank_name' => $payload['sourceBankName'] ?? null,
                            'destination_account_number' => $payload['virtualAccount'] ?? null,
                            'charge' => $transactionFee,
                            'net_amount' => $netAmount,
                            'session_id' => $payload['sessionId'] ?? null,
                            'transaction_type_name' => 'collection',
                            'completed_at' => isset($payload['completedAt']) 
                                ? date('Y-m-d H:i:s', $payload['completedAt'] / 1000) 
                                : now(),
                        ]);
                        
                        // Create deposit record
                        $transid = 'BELL_' . time() . '_' . rand(1000, 9999);
                        DB::table('deposit')->insert([
                            'username' => $user->username,
                            'amount' => $amountReceived,
                            'oldbal' => $oldBalance,
                            'newbal' => $newBalance,
                            'wallet_type' => 'User Wallet',
                            'type' => 'BellBank Virtual Account',
                            'credit_by' => 'BellBank Automated Transfer',
                            'date' => now()->format('Y-m-d H:i:s'),
                            'status' => 1,
                            'transid' => $transid,
                            'charges' => $transactionFee,
                            'monify_ref' => $reference
                        ]);
                        
                        // Create message/notification
                        DB::table('message')->insert([
                            'username' => $user->username,
                            'amount' => $netAmount,
                            'message' => 'Account Credited By BellBank Virtual Account Transfer ₦' . number_format($netAmount, 2),
                            'oldbal' => $oldBalance,
                            'newbal' => $newBalance,
                            'adex_date' => now()->format('Y-m-d H:i:s'),
                            'plan_status' => 1,
                            'transid' => $transid,
                            'role' => 'credit'
                        ]);
                        
                        // Create notification
                        DB::table('notif')->insert([
                            'username' => $user->username,
                            'message' => 'Account Credited By BellBank Virtual Account Transfer ₦' . number_format($netAmount, 2),
                            'date' => now()->format('Y-m-d H:i:s'),
                            'adex' => 0
                        ]);
                        
                        Log::info('User wallet credited via BellBank webhook', [
                            'user_id' => $user->id,
                            'username' => $user->username,
                            'amount_received' => $amountReceived,
                            'net_amount' => $netAmount,
                            'old_balance' => $oldBalance,
                            'new_balance' => $newBalance,
                            'reference' => $reference,
                        ]);
                    }
                }
            }
        }
    }

    /**
     * Handle transfer/debit event (money sent)
     */
    protected function handleTransfer($payload)
    {
        $reference = $payload['reference'] ?? null;
        
        if (!$reference) {
            throw new \Exception('Reference missing in transfer webhook');
        }

        // Find transaction by reference
        $transaction = BellTransaction::where('reference', $reference)->first();

        if ($transaction) {
            // Update transaction status
            $transaction->update([
                'status' => $payload['status'] ?? 'successful',
                'response' => $payload,
                'completed_at' => isset($payload['completedAt']) 
                    ? date('Y-m-d H:i:s', $payload['completedAt'] / 1000) 
                    : now(),
            ]);
        } else {
            Log::warning('BellBank transfer webhook for unknown transaction', [
                'reference' => $reference,
            ]);
        }
    }
}

