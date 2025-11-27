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
        // Auto-detect APP_URL if not set in .env
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

        Response::macro('apiResponse', function ($e, $data = [], $message = '', $code = 500){
            $exception = $e->getMessage() . ' in ' . $e->getFile() . ' at line ' . $e->getLine();

            $data['status'] = false;

            $data['message'] = $message == '' ? 'contact admin' : 'contact admin';

            return response()->json($data, $code);
        });

    }
}
