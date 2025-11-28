#!/bin/bash
# Debug why banks aren't showing up

cd ~/public_html

echo "=== Testing Banks API ==="
echo ""

# Test 1: Check if verifytoken works
php artisan tinker --execute="
\$token = '92V646533059699';
\$user = DB::table('user')->where('adex_key', \$token)->first();
if (\$user) {
    echo 'Token verification: SUCCESS' . PHP_EOL;
    echo 'User ID: ' . \$user->id . PHP_EOL;
    echo 'Username: ' . \$user->username . PHP_EOL;
    echo 'Status: ' . \$user->status . PHP_EOL;
    echo 'PalmPay: ' . (\$user->palmpay ?? 'NULL') . PHP_EOL;
    echo 'PalmPay is_null: ' . (is_null(\$user->palmpay) ? 'YES' : 'NO') . PHP_EOL;
    echo 'PalmPay empty: ' . (empty(\$user->palmpay) ? 'YES' : 'NO') . PHP_EOL;
} else {
    echo 'Token verification: FAILED' . PHP_EOL;
}
"

echo ""
echo "=== Testing with actual API call ==="

# Test 2: Simulate the API call
php artisan tinker --execute="
\$token = '92V646533059699';
\$user_id = DB::table('user')->where('adex_key', \$token)->value('id');
if (\$user_id) {
    \$auth_user = DB::table('user')->where('status', 1)->where('id', \$user_id)->first();
    if (\$auth_user) {
        echo 'User found: ' . \$auth_user->username . PHP_EOL;
        echo 'PalmPay value: ' . var_export(\$auth_user->palmpay, true) . PHP_EOL;
        echo 'PalmPay check (!is_null): ' . (!is_null(\$auth_user->palmpay) ? 'TRUE - Will be added' : 'FALSE - Will be skipped') . PHP_EOL;
        
        \$banks_array = [];
        if (!is_null(\$auth_user->palmpay)) {
            \$banks_array[] = ['name' => 'PALMPAY', 'account' => \$auth_user->palmpay];
            echo 'PalmPay added to array' . PHP_EOL;
        }
        
        echo 'Banks array count: ' . count(\$banks_array) . PHP_EOL;
        echo 'Banks: ' . json_encode(\$banks_array) . PHP_EOL;
    } else {
        echo 'User not found or status != 1' . PHP_EOL;
    }
} else {
    echo 'User ID not found for token' . PHP_EOL;
}
"

