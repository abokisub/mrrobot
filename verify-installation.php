<?php
/**
 * Installation Verification Script
 * 
 * Run this after installation to verify everything is configured correctly.
 * Access via: https://yourdomain.com/verify-installation.php
 * 
 * IMPORTANT: Delete this file after verification for security!
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>KoboPoint Installation Verification</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .pass { color: green; }
        .fail { color: red; }
        .warning { color: orange; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        h1 { color: #333; }
        h2 { color: #666; border-bottom: 2px solid #eee; padding-bottom: 10px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔍 KoboPoint Installation Verification</h1>
    
    <?php
    $checks = [];
    $warnings = [];
    
    // Check 1: .env file exists
    echo '<div class="section">';
    echo '<h2>1. Environment Configuration</h2>';
    
    $envPath = __DIR__ . '/../.env';
    if (file_exists($envPath)) {
        echo '<p class="pass">✅ .env file exists</p>';
        $checks[] = true;
        
        // Check critical .env values
        $envContent = file_get_contents($envPath);
        $required = ['APP_URL', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'];
        $missing = [];
        foreach ($required as $key) {
            if (!preg_match("/^{$key}=/m", $envContent)) {
                $missing[] = $key;
            }
        }
        
        if (empty($missing)) {
            echo '<p class="pass">✅ All required .env variables are set</p>';
            $checks[] = true;
        } else {
            echo '<p class="fail">❌ Missing .env variables: ' . implode(', ', $missing) . '</p>';
            $checks[] = false;
        }
        
        // Check APP_DEBUG
        if (preg_match('/APP_DEBUG=false/', $envContent)) {
            echo '<p class="pass">✅ APP_DEBUG is set to false (production mode)</p>';
        } else {
            echo '<p class="warning">⚠️ APP_DEBUG should be false in production</p>';
            $warnings[] = 'APP_DEBUG should be false';
        }
    } else {
        echo '<p class="fail">❌ .env file not found</p>';
        $checks[] = false;
    }
    echo '</div>';
    
    // Check 2: Storage permissions
    echo '<div class="section">';
    echo '<h2>2. File Permissions</h2>';
    
    $storagePath = __DIR__ . '/../storage';
    $cachePath = __DIR__ . '/../bootstrap/cache';
    
    if (is_writable($storagePath)) {
        echo '<p class="pass">✅ storage/ directory is writable</p>';
        $checks[] = true;
    } else {
        echo '<p class="fail">❌ storage/ directory is NOT writable (should be 755)</p>';
        $checks[] = false;
    }
    
    if (is_writable($cachePath)) {
        echo '<p class="pass">✅ bootstrap/cache/ directory is writable</p>';
        $checks[] = true;
    } else {
        echo '<p class="fail">❌ bootstrap/cache/ directory is NOT writable (should be 755)</p>';
        $checks[] = false;
    }
    
    // Check storage symlink
    $storageLink = __DIR__ . '/storage';
    if (is_link($storageLink) || file_exists($storageLink)) {
        echo '<p class="pass">✅ public/storage symlink exists</p>';
        $checks[] = true;
    } else {
        echo '<p class="warning">⚠️ public/storage symlink not found. Run: php artisan storage:link</p>';
        $warnings[] = 'Storage symlink missing';
    }
    echo '</div>';
    
    // Check 3: Database connection
    echo '<div class="section">';
    echo '<h2>3. Database Connection</h2>';
    
    if (file_exists($envPath)) {
        // Try to load Laravel and test DB connection
        $basePath = dirname(__DIR__);
        $autoload = $basePath . '/vendor/autoload.php';
        
        if (file_exists($autoload)) {
            require_once $autoload;
            $app = require_once $basePath . '/bootstrap/app.php';
            
            try {
                \DB::connection()->getPdo();
                echo '<p class="pass">✅ Database connection successful</p>';
                $checks[] = true;
            } catch (\Exception $e) {
                echo '<p class="fail">❌ Database connection failed: ' . htmlspecialchars($e->getMessage()) . '</p>';
                $checks[] = false;
            }
        } else {
            echo '<p class="warning">⚠️ Cannot test database (vendor/autoload.php not found)</p>';
            $warnings[] = 'Vendor directory missing';
        }
    }
    echo '</div>';
    
    // Check 4: Laravel paths
    echo '<div class="section">';
    echo '<h2>4. Laravel Path Detection</h2>';
    
    $basePath = dirname(__DIR__);
    $vendorPath = $basePath . '/vendor/autoload.php';
    $bootstrapPath = $basePath . '/bootstrap/app.php';
    
    if (file_exists($vendorPath)) {
        echo '<p class="pass">✅ vendor/autoload.php found</p>';
        $checks[] = true;
    } else {
        echo '<p class="fail">❌ vendor/autoload.php not found</p>';
        $checks[] = false;
    }
    
    if (file_exists($bootstrapPath)) {
        echo '<p class="pass">✅ bootstrap/app.php found</p>';
        $checks[] = true;
    } else {
        echo '<p class="fail">❌ bootstrap/app.php not found</p>';
        $checks[] = false;
    }
    echo '</div>';
    
    // Check 5: API endpoint test
    echo '<div class="section">';
    echo '<h2>5. API Endpoints</h2>';
    echo '<p>Test these URLs in your browser:</p>';
    echo '<ul>';
    echo '<li><a href="/api/website/app/setting" target="_blank">/api/website/app/setting</a> (should return JSON)</li>';
    echo '<li><a href="/api/test" target="_blank">/api/test</a> (should return {"status":"ok"})</li>';
    echo '</ul>';
    echo '</div>';
    
    // Summary
    echo '<div class="section">';
    echo '<h2>📊 Summary</h2>';
    $passed = count(array_filter($checks));
    $total = count($checks);
    $percentage = $total > 0 ? round(($passed / $total) * 100) : 0;
    
    echo "<p><strong>Checks Passed: {$passed}/{$total} ({$percentage}%)</strong></p>";
    
    if ($passed === $total) {
        echo '<p class="pass"><strong>✅ All critical checks passed! Your installation looks good.</strong></p>';
    } else {
        echo '<p class="fail"><strong>❌ Some checks failed. Please review the errors above.</strong></p>';
    }
    
    if (!empty($warnings)) {
        echo '<p class="warning"><strong>⚠️ Warnings:</strong></p><ul>';
        foreach ($warnings as $warning) {
            echo "<li>{$warning}</li>";
        }
        echo '</ul>';
    }
    echo '</div>';
    
    echo '<div class="section">';
    echo '<h2>🔒 Security Reminder</h2>';
    echo '<p class="warning"><strong>⚠️ IMPORTANT: Delete this file (verify-installation.php) after verification for security!</strong></p>';
    echo '</div>';
    ?>
</body>
</html>

