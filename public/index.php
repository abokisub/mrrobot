<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Auto-detect Laravel base path for cPanel compatibility
|--------------------------------------------------------------------------
*/

$possiblePaths = [
    __DIR__ . '/../laravel/',            // cPanel: public_html -> laravel (PRIMARY)
    __DIR__ . '/../',                    // Standard Laravel structure
    __DIR__ . '/../../laravel/',         // Alternative cPanel structure
    dirname(dirname(__DIR__)) . '/laravel/', // Fallback with laravel folder
];

$laravelBasePath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path . 'vendor/autoload.php') && file_exists($path . 'bootstrap/app.php')) {
        $laravelBasePath = realpath($path);
        break;
    }
}

// If not found in separate laravel folder, use standard structure
if (!$laravelBasePath) {
    $laravelBasePath = dirname(__DIR__);
}

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
|
| If the application is in maintenance / demo mode via the "down" command
| we will load this file so that any pre-rendered content can be shown
| instead of starting the framework, which could cause an exception.
|
*/

if (file_exists($maintenance = $laravelBasePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
|
| Composer provides a convenient, automatically generated class loader for
| this application. We just need to utilize it! We'll simply require it
| into the script here so we don't need to manually load our classes.
|
*/

require $laravelBasePath . '/vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser, allowing them to enjoy our application.
|
*/

$app = require_once $laravelBasePath . '/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
