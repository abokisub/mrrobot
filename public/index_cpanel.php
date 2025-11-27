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

