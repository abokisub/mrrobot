#!/bin/bash
# Test the Banks API to see why it's not returning banks

cd ~/public_html

echo "Testing Banks API..."
echo ""

# Get user's adex_key (token)
php artisan tinker --execute="
\$username = 'Habukhan';
\$user = DB::table('user')->where('username', \$username)->first();
if (\$user) {
    echo 'User ID: ' . \$user->id . PHP_EOL;
    echo 'User adex_key: ' . (\$user->adex_key ?? 'NULL') . PHP_EOL;
    echo 'PalmPay: ' . (\$user->palmpay ?? 'NULL') . PHP_EOL;
    echo 'Status: ' . \$user->status . PHP_EOL;
}
"

