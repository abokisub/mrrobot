<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BellWebhook;
use App\Models\BellTransaction;
use App\Models\BellAccount;
use App\Jobs\ProcessBellWebhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class BellBankWebhookController extends Controller
{
    /**
     * Handle incoming webhook from BellBank
     */
    public function handle(Request $request)
    {
        try {
            // Verify webhook signature
            if (!$this->verifySignature($request)) {
                Log::warning('BellBank webhook signature verification failed', [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['error' => 'Invalid signature'], 403);
            }

            // Store raw webhook
            $webhook = BellWebhook::create([
                'event' => $request->input('event', 'unknown'),
                'payload' => $request->all(),
                'headers' => $request->headers->all(),
                'received_at' => now(),
                'processed' => false,
            ]);

            // Dispatch job to process webhook asynchronously
            ProcessBellWebhook::dispatch($webhook->id);

            // Return 200 OK immediately
            return response()->json(['status' => 'ok'], 200);

        } catch (\Exception $e) {
            Log::error('BellBank webhook handling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Still return 200 to prevent retries from BellBank
            return response()->json(['status' => 'error', 'message' => 'Processing failed'], 200);
        }
    }

    /**
     * Verify webhook signature
     */
    protected function verifySignature(Request $request): bool
    {
        $secret = config('bellbank.webhook_secret');
        
        if (!$secret) {
            Log::warning('BellBank webhook secret not configured');
            return false;
        }

        // Get signature from header (adjust header name based on BellBank docs)
        $signature = $request->header('X-Bellbank-Signature') 
                  ?? $request->header('X-Signature')
                  ?? $request->header('Signature');

        if (!$signature) {
            return false;
        }

        // Get raw payload
        $payload = $request->getContent();
        
        // Generate expected signature (HMAC SHA256)
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        // Compare signatures (timing-safe comparison)
        return hash_equals($expectedSignature, $signature);
    }
}

