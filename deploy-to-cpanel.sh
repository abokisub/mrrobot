#!/bin/bash

# ============================================================
# KoboPoint - cPanel Deployment Script (Linux/Mac)
# This script prepares and deploys fixes to cPanel
# ============================================================

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "============================================================"
echo "  KoboPoint - cPanel Deployment Script"
echo "============================================================"
echo ""

LARAVEL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$LARAVEL_ROOT"

echo -e "${YELLOW}Step 1: Checking Git status...${NC}"
git status --short 2>/dev/null || echo -e "${RED}Warning: Git not found or not a git repository${NC}"
echo ""

echo -e "${YELLOW}Step 2: Identifying files to upload...${NC}"
echo ""
echo "Files that need to be uploaded to cPanel:"
echo "----------------------------------------"
echo "  [CRITICAL] app/Http/Controllers/API/AppController.php"
echo "  [CRITICAL] app/Http/Controllers/API/Banks.php"
echo "  [CRITICAL] config/cors.php"
echo "  [CRITICAL] public/index.php"
echo "  [CRITICAL] public/index_cpanel.php"
echo "  [OPTIONAL] public/test-origin.php (diagnostic tool)"
echo "  [OPTIONAL] verify-installation.php"
echo ""

echo -e "${YELLOW}Step 3: Creating deployment package...${NC}"

# Create deployment directory
rm -rf deployment-package
mkdir -p deployment-package/app/Http/Controllers/API
mkdir -p deployment-package/config
mkdir -p deployment-package/public

# Copy critical files
echo "Copying critical files..."
cp app/Http/Controllers/API/AppController.php deployment-package/app/Http/Controllers/API/
cp app/Http/Controllers/API/Banks.php deployment-package/app/Http/Controllers/API/
cp config/cors.php deployment-package/config/
cp public/index.php deployment-package/public/
cp public/index_cpanel.php deployment-package/public/
cp public/test-origin.php deployment-package/public/ 2>/dev/null || echo "test-origin.php not found (optional)"
cp verify-installation.php deployment-package/ 2>/dev/null || echo "verify-installation.php not found (optional)"

echo -e "${GREEN}✓ Files copied to deployment-package/ folder${NC}"
echo ""

echo -e "${YELLOW}Step 4: Creating .env template...${NC}"
cat > deployment-package/.env.production.template << 'EOF'
# ============================================================
# KoboPoint - Production .env Configuration
# ============================================================
# Copy this to your cPanel .env file and update values
# ============================================================

APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.kobopoint.com

# CRITICAL: Must match your domain exactly
# - No trailing slashes
# - Include both http and https
# - Comma-separated (no spaces)
ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Other settings (keep your existing values)
EOF

echo -e "${GREEN}✓ .env template created${NC}"
echo ""

echo -e "${YELLOW}Step 5: Creating deployment instructions...${NC}"
cat > deployment-package/DEPLOYMENT_INSTRUCTIONS.txt << 'EOF'
============================================================
  KoboPoint - cPanel Deployment Instructions
============================================================

STEP 1: Upload Files
--------------------
Upload these files to your cPanel server:

  From: deployment-package/app/Http/Controllers/API/
  To:   app/Http/Controllers/API/
    - AppController.php
    - Banks.php

  From: deployment-package/config/
  To:   config/
    - cors.php

  From: deployment-package/public/
  To:   public/
    - index.php
    - index_cpanel.php
    - test-origin.php (optional - diagnostic tool)

  From: deployment-package/
  To:   root/
    - verify-installation.php (optional)


STEP 2: Update .env File
------------------------
1. Open .env file on cPanel
2. Update these critical values:

   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://app.kobopoint.com
   ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com

   IMPORTANT:
   - No trailing slashes in URLs
   - Include both http and https versions
   - Exact domain match


STEP 3: Clear Laravel Caches
-----------------------------
Via cPanel Terminal/SSH, run:

   cd ~/public_html
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   php artisan view:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache


STEP 4: Create Storage Symlink
-------------------------------
   php artisan storage:link


STEP 5: Test Deployment
-----------------------
1. Visit: https://app.kobopoint.com/test-origin.php
   - Check if "match" is true
   - Verify origin matches ADEX_APP_KEY

2. Test API: https://app.kobopoint.com/api/website/app/setting
   - Should return JSON (not 403)

3. Try logging in
   - Should work without 403 errors


STEP 6: Cleanup (After Testing)
--------------------------------
Delete diagnostic files:
   - public/test-origin.php
   - verify-installation.php


============================================================
  Troubleshooting
============================================================

If still getting 403 errors:

1. Check .env ADEX_APP_KEY matches domain exactly
2. Verify config cache cleared: php artisan config:clear
3. Check Laravel logs: storage/logs/laravel.log
4. Verify file permissions: chmod -R 755 storage bootstrap/cache

============================================================
EOF

echo -e "${GREEN}✓ Instructions created${NC}"
echo ""

echo -e "${YELLOW}Step 6: Creating cPanel SSH commands file...${NC}"
cat > deployment-package/run-on-cpanel.sh << 'EOF'
#!/bin/bash
# KoboPoint - cPanel Post-Upload Commands
# Run these commands on cPanel via SSH/Terminal

echo "Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

echo "Rebuilding caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Creating storage symlink..."
php artisan storage:link

echo "Setting permissions..."
chmod -R 755 storage bootstrap/cache

echo "Done! Test your site now."
EOF

chmod +x deployment-package/run-on-cpanel.sh
echo -e "${GREEN}✓ SSH commands file created${NC}"
echo ""

echo ""
echo "============================================================"
echo -e "  ${GREEN}Deployment Package Ready!${NC}"
echo "============================================================"
echo ""
echo "Package location: deployment-package/"
echo ""
echo "Next steps:"
echo "  1. Review: deployment-package/DEPLOYMENT_INSTRUCTIONS.txt"
echo "  2. Upload files from deployment-package/ to cPanel"
echo "  3. Update .env on cPanel (see .env.production.template)"
echo "  4. Run: bash run-on-cpanel.sh on cPanel"
echo "  5. Test with test-origin.php"
echo ""
echo "============================================================"
echo ""

