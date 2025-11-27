<?php
/**
 * Origin Validation Diagnostic Tool
 * 
 * This script helps diagnose 403 Forbidden errors by showing:
 * - What origin header is being sent
 * - What ADEX_APP_KEY is configured
 * - Whether they match
 * 
 * Access: https://yourdomain.com/test-origin.php
 * 
 * IMPORTANT: Delete this file after diagnosis for security!
 */

header('Content-Type: application/json');

// Try to load Laravel environment
$basePath = dirname(__DIR__);
$autoload = $basePath . '/vendor/autoload.php';

$results = [
    'origin_header' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
    'http_host' => $_SERVER['HTTP_HOST'] ?? 'not set',
    'request_uri' => $_SERVER['REQUEST_URI'] ?? 'not set',
];

if (file_exists($autoload)) {
    require_once $autoload;
    
    try {
        $app = require_once $basePath . '/bootstrap/app.php';
        
        $adexAppKey = env('ADEX_APP_KEY', 'not set');
        $allowedOrigins = array_filter(array_map('trim', explode(',', $adexAppKey)));
        
        // Normalize origins
        $normalizedAllowed = array_map(function($url) {
            return strtolower(rtrim(trim($url), '/'));
        }, $allowedOrigins);
        
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $normalizedOrigin = $origin ? strtolower(rtrim($origin, '/')) : 'not set';
        
        $results = array_merge($results, [
            'adex_app_key' => $adexAppKey,
            'allowed_origins' => $allowedOrigins,
            'normalized_allowed' => $normalizedAllowed,
            'normalized_origin' => $normalizedOrigin,
            'match' => $normalizedOrigin !== 'not set' && in_array($normalizedOrigin, $normalizedAllowed),
            'app_env' => env('APP_ENV', 'not set'),
            'app_url' => env('APP_URL', 'not set'),
            'app_debug' => env('APP_DEBUG', 'not set'),
        ]);
    } catch (\Exception $e) {
        $results['error'] = 'Could not load Laravel: ' . $e->getMessage();
    }
} else {
    $results['error'] = 'Laravel autoload not found. Running in standalone mode.';
    $results['adex_app_key'] = getenv('ADEX_APP_KEY') ?: 'not set (check .env file)';
}

echo json_encode($results, JSON_PRETTY_PRINT);

