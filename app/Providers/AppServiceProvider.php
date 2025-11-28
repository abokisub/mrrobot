<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Response;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {

    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // ZERO-CONFIG: Auto-detect APP_URL if not set in .env
        if (empty(config('app.url'))) {
            try {
                $request = request();
                if ($request) {
                    $detectedUrl = $request->getSchemeAndHttpHost();
                    config(['app.url' => $detectedUrl]);
                }
            } catch (\Exception $e) {
                // Fallback handled in helper functions
            }
        }

        // ZERO-CONFIG: Ensure storage directories exist (auto-create on first run)
        $this->ensureStorageDirectoriesExist();

        Response::macro('apiResponse', function ($e, $data = [], $message = '', $code = 500){
            $exception = $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine();

            $data['status'] = false;

            $data['message'] = $message == '' ? 'contact admin' : 'contact admin';

            return response()->json($data, $code);
        });

    }

    /**
     * Ensure all required storage directories exist
     * This makes deployment zero-config - directories auto-create on first run
     *
     * @return void
     */
    protected function ensureStorageDirectoriesExist()
    {
        $storagePath = storage_path();
        $directories = [
            'app/public',
            'app/profile_image',
            'framework/cache',
            'framework/cache/data',
            'framework/sessions',
            'framework/testing',
            'framework/views',
            'logs',
        ];

        foreach ($directories as $dir) {
            $fullPath = $storagePath . '/' . $dir;
            if (!is_dir($fullPath)) {
                @mkdir($fullPath, 0755, true);
            }
        }

        // Ensure storage/logs/laravel.log file exists (create empty if not exists)
        $logFile = storage_path('logs/laravel.log');
        if (!file_exists($logFile)) {
            @touch($logFile);
            @chmod($logFile, 0664);
        }

        // ZERO-CONFIG: Auto-create storage symlink if it doesn't exist (optional, may fail on some hosts)
        $publicStorageLink = public_path('storage');
        $storageTarget = storage_path('app/public');
        if (!file_exists($publicStorageLink) && is_dir($storageTarget)) {
            // Try to create symlink (may fail on Windows or restricted hosts, that's OK)
            if (function_exists('symlink')) {
                try {
                    @symlink($storageTarget, $publicStorageLink);
                } catch (\Exception $e) {
                    // Silently fail - user can run php artisan storage:link manually if needed
                }
            }
        }
    }
}
