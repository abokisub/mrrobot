#!/bin/bash
# Simple restore - just fixes the system() method in AppController.php

cd ~/public_html

# Backup first
cp app/Http/Controllers/API/AppController.php app/Http/Controllers/API/AppController.php.backup

# Create a PHP script to do the replacement
php << 'PHPRESTORE'
<?php
$file = 'app/Http/Controllers/API/AppController.php';
$content = file_get_contents($file);

// Find and replace the system() method
$oldPattern = '/public function system\(Request \$request\)\s*\{.*?\n    \}/s';

$newMethod = 'public function system(Request $request)
    {
        $explode_url = explode(\',\', env(\'ADEX_APP_KEY\'));
        if (in_array($request->headers->get(\'origin\'), $explode_url)) {
            return response()->json([
                \'status\' => \'success\',
                \'setting\' => $this->core(),
                \'feature\' => $this->feature(),
                \'general\' => $this->general(),
                \'bank\' => DB::table(\'adex_key\')->select(\'account_number\', \'account_name\', \'bank_name\', \'min\', \'max\')->first()
            ]);
        } else {
            return redirect(env(\'ERROR_500\'));
            return response()->json([
                \'status\' => 403,
                \'message\' => \'Unable to Authenticate System\'
            ])->setStatusCode(403);
        }
    }';

$content = preg_replace($oldPattern, $newMethod, $content);
file_put_contents($file, $content);
echo "✓ AppController.php system() method restored!\n";
PHPRESTORE

echo ""
echo "Now run:"
echo "  php artisan config:clear"
echo "  php artisan cache:clear"

