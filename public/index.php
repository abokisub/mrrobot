<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Auto-detect Laravel base path for cPanel compatibility
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Auto-detect Laravel base path for both deployment patterns:
| 1. Standard: Laravel core outside web root (public_html -> ../laravel)
| 2. Simple: Everything in public_html (Laravel root = parent of public)
|--------------------------------------------------------------------------
*/

$laravelBasePath = null;

// Try standard structure first (parent directory)
$standardPath = realpath(__DIR__ . '/..');
if ($standardPath && file_exists($standardPath . '/vendor/autoload.php') && file_exists($standardPath . '/bootstrap/app.php')) {
    $laravelBasePath = $standardPath;
}

// If not found, try cPanel pattern (laravel folder)
if (!$laravelBasePath) {
    $cpanelPaths = [
        __DIR__ . '/../laravel/',
        __DIR__ . '/../../laravel/',
        dirname(dirname(__DIR__)) . '/laravel/',
    ];
    
    foreach ($cpanelPaths as $path) {
        $realPath = realpath($path);
        if ($realPath && file_exists($realPath . '/vendor/autoload.php') && file_exists($realPath . '/bootstrap/app.php')) {
            $laravelBasePath = $realPath;
            break;
        }
    }
}

// Final fallback: use parent directory (simple deployment)
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
