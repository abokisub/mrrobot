<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| ZERO-DEPLOYMENT SYSTEM (Universal index.php)
|--------------------------------------------------------------------------
| This file automatically detects the Laravel base path for ANY deployment:
| - Localhost (XAMPP/Laragon)
| - cPanel (public_html -> ../laravel)
| - Subdomains
| - Nested folders
|
| NO MANUAL EDITING REQUIRED.
*/

$laravelBasePath = null;

// 1. Check for manual override in Environment
if (isset($_ENV['APP_BASE_PATH']) && !empty($_ENV['APP_BASE_PATH'])) {
    $testPath = realpath($_ENV['APP_BASE_PATH']);
    if ($testPath && file_exists($testPath . '/vendor/autoload.php')) {
        $laravelBasePath = $testPath;
    }
}

// 2. Auto-detect by searching upwards (up to 5 levels)
if (!$laravelBasePath) {
    $currentDir = __DIR__;
    for ($i = 1; $i <= 5; $i++) {
        $testPath = realpath($currentDir . str_repeat('/..', $i));

        // Check for key Laravel files to confirm this is the root
        if (
            $testPath &&
            file_exists($testPath . '/vendor/autoload.php') &&
            file_exists($testPath . '/bootstrap/app.php') &&
            file_exists($testPath . '/artisan')
        ) {

            $laravelBasePath = $testPath;
            break;
        }
    }
}

// 3. Fallback: Check specific cPanel patterns if auto-detect failed
if (!$laravelBasePath) {
    $cpanelPaths = [
        realpath(__DIR__ . '/../laravel'), // Standard cPanel
        realpath(__DIR__ . '/../../laravel'), // Nested public
        realpath($_SERVER['DOCUMENT_ROOT'] . '/../laravel'), // Root relative
    ];

    foreach ($cpanelPaths as $path) {
        if ($path && file_exists($path . '/vendor/autoload.php')) {
            $laravelBasePath = $path;
            break;
        }
    }
}

// 4. Final Safety Check
if (!$laravelBasePath || !file_exists($laravelBasePath . '/vendor/autoload.php')) {
    // Friendly Error Message
    header('HTTP/1.1 503 Service Unavailable');
    die("
        <div style='font-family: sans-serif; text-align: center; padding: 50px;'>
            <h1>Deployment Error</h1>
            <p>Could not locate the Laravel application files.</p>
            <p>Please ensure the <code>vendor</code> folder exists and is uploaded.</p>
            <hr>
            <small>Zero-Deployment System v1.0</small>
        </div>
    ");
}

// Set the detected path for Laravel
if (!isset($_ENV['APP_BASE_PATH'])) {
    $_ENV['APP_BASE_PATH'] = $laravelBasePath;
    putenv('APP_BASE_PATH=' . $laravelBasePath);
}

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
*/

if (file_exists($maintenance = $laravelBasePath . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
*/

require $laravelBasePath . '/vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
*/

$app = require_once $laravelBasePath . '/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
