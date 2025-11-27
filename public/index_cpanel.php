<?php

/**
 * cPanel Deployment Entry Point
 * 
 * This file is designed for shared hosting (cPanel) deployment.
 * It automatically detects the environment and sets up paths correctly.
 * 
 * For cPanel deployment:
 * 1. Copy this file to public_html/index.php
 * 2. Ensure Laravel core is in a parent directory or /laravel
 * 3. Update .env with correct paths
 */

// Auto-detect Laravel base path
// Try multiple possible locations for flexibility
$possiblePaths = [
    __DIR__ . '/../laravel/',            // cPanel: public_html -> laravel (PRIMARY)
    __DIR__ . '/../',                    // Standard Laravel structure
    __DIR__ . '/../../laravel/',         // Alternative cPanel structure
    dirname(dirname(__DIR__)) . '/laravel/', // Fallback with laravel folder
];

$laravelBasePath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path . 'bootstrap/app.php')) {
        $laravelBasePath = realpath($path);
        break;
    }
}

if (!$laravelBasePath) {
    die('Laravel application not found. Please check your deployment structure.');
}

// Define Laravel base path
define('LARAVEL_START', microtime(true));
define('LARAVEL_BASE_PATH', $laravelBasePath);

/*
|--------------------------------------------------------------------------
| Check If The Application Is Under Maintenance
|--------------------------------------------------------------------------
*/

$maintenanceFile = $laravelBasePath . '/storage/framework/maintenance.php';
if (file_exists($maintenanceFile)) {
    require $maintenanceFile;
}

/*
|--------------------------------------------------------------------------
| Register The Auto Loader
|--------------------------------------------------------------------------
*/

$autoloadPath = $laravelBasePath . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    die('Composer dependencies not found. Please ensure vendor/ folder is uploaded.');
}

require $autoloadPath;

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
*/

$bootstrapPath = $laravelBasePath . '/bootstrap/app.php';
if (!file_exists($bootstrapPath)) {
    die('Laravel bootstrap file not found at: ' . $bootstrapPath);
}

$app = require_once $bootstrapPath;

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);

