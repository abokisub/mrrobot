@echo off
REM ============================================================
REM KoboPoint - cPanel Deployment Script (Windows)
REM This script prepares and deploys fixes to cPanel
REM ============================================================

echo.
echo ============================================================
echo   KoboPoint - cPanel Deployment Script
echo ============================================================
echo.

set "LARAVEL_ROOT=%~dp0"
cd /d "%LARAVEL_ROOT%"

REM Colors (if supported)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo %YELLOW%Step 1: Checking Git status...%NC%
git status --short
if errorlevel 1 (
    echo %RED%Warning: Git not found or not a git repository%NC%
    echo Continuing anyway...
) else (
    echo %GREEN%✓ Git status checked%NC%
)
echo.

echo %YELLOW%Step 2: Identifying files to upload...%NC%
echo.
echo Files that need to be uploaded to cPanel:
echo ----------------------------------------
echo   [CRITICAL] app\Http\Controllers\API\AppController.php
echo   [CRITICAL] app\Http\Controllers\API\Banks.php
echo   [CRITICAL] config\cors.php
echo   [CRITICAL] public\index.php
echo   [CRITICAL] public\index_cpanel.php
echo   [OPTIONAL] public\test-origin.php (diagnostic tool)
echo   [OPTIONAL] verify-installation.php
echo.

echo %YELLOW%Step 3: Creating deployment package...%NC%

REM Create deployment directory
if exist "deployment-package" rmdir /s /q "deployment-package"
mkdir "deployment-package"
mkdir "deployment-package\app"
mkdir "deployment-package\app\Http"
mkdir "deployment-package\app\Http\Controllers"
mkdir "deployment-package\app\Http\Controllers\API"
mkdir "deployment-package\config"
mkdir "deployment-package\public"

REM Copy critical files
echo Copying critical files...
xcopy /Y "app\Http\Controllers\API\AppController.php" "deployment-package\app\Http\Controllers\API\" >nul
xcopy /Y "app\Http\Controllers\API\Banks.php" "deployment-package\app\Http\Controllers\API\" >nul
xcopy /Y "config\cors.php" "deployment-package\config\" >nul
xcopy /Y "public\index.php" "deployment-package\public\" >nul
xcopy /Y "public\index_cpanel.php" "deployment-package\public\" >nul
xcopy /Y "public\test-origin.php" "deployment-package\public\" >nul
xcopy /Y "verify-installation.php" "deployment-package\" >nul

echo %GREEN%✓ Files copied to deployment-package\ folder%NC%
echo.

echo %YELLOW%Step 4: Creating .env template...%NC%
(
echo # ============================================================
echo # KoboPoint - Production .env Configuration
echo # ============================================================
echo # Copy this to your cPanel .env file and update values
echo # ============================================================
echo.
echo APP_ENV=production
echo APP_DEBUG=false
echo APP_URL=https://app.kobopoint.com
echo.
echo # CRITICAL: Must match your domain exactly
echo # - No trailing slashes
echo # - Include both http and https
echo # - Comma-separated (no spaces)
echo ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com
echo.
echo # Database Configuration
echo DB_CONNECTION=mysql
echo DB_HOST=localhost
echo DB_DATABASE=your_database_name
echo DB_USERNAME=your_database_user
echo DB_PASSWORD=your_database_password
echo.
echo # Other settings (keep your existing values)
) > "deployment-package\.env.production.template"

echo %GREEN%✓ .env template created%NC%
echo.

echo %YELLOW%Step 5: Creating deployment instructions...%NC%
(
echo ============================================================
echo   KoboPoint - cPanel Deployment Instructions
echo ============================================================
echo.
echo STEP 1: Upload Files
echo --------------------
echo Upload these files to your cPanel server:
echo.
echo   From: deployment-package\app\Http\Controllers\API\
echo   To:   app/Http/Controllers/API/
echo     - AppController.php
echo     - Banks.php
echo.
echo   From: deployment-package\config\
echo   To:   config/
echo     - cors.php
echo.
echo   From: deployment-package\public\
echo   To:   public/
echo     - index.php
echo     - index_cpanel.php
echo     - test-origin.php (optional - diagnostic tool)
echo.
echo   From: deployment-package\
echo   To:   root/
echo     - verify-installation.php (optional)
echo.
echo.
echo STEP 2: Update .env File
echo ------------------------
echo 1. Open .env file on cPanel
echo 2. Update these critical values:
echo.
echo    APP_ENV=production
echo    APP_DEBUG=false
echo    APP_URL=https://app.kobopoint.com
echo    ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com
echo.
echo    IMPORTANT:
echo    - No trailing slashes in URLs
echo    - Include both http and https versions
echo    - Exact domain match
echo.
echo.
echo STEP 3: Clear Laravel Caches
echo -----------------------------
echo Via cPanel Terminal/SSH, run:
echo.
echo    cd ~/public_html
echo    php artisan config:clear
echo    php artisan cache:clear
echo    php artisan route:clear
echo    php artisan view:clear
echo    php artisan config:cache
echo    php artisan route:cache
echo    php artisan view:cache
echo.
echo.
echo STEP 4: Create Storage Symlink
echo --------------------------------
echo    php artisan storage:link
echo.
echo.
echo STEP 5: Test Deployment
echo -----------------------
echo 1. Visit: https://app.kobopoint.com/test-origin.php
echo    - Check if "match" is true
echo    - Verify origin matches ADEX_APP_KEY
echo.
echo 2. Test API: https://app.kobopoint.com/api/website/app/setting
echo    - Should return JSON (not 403)
echo.
echo 3. Try logging in
echo    - Should work without 403 errors
echo.
echo.
echo STEP 6: Cleanup (After Testing)
echo --------------------------------
echo Delete diagnostic files:
echo    - public/test-origin.php
echo    - verify-installation.php
echo.
echo.
echo ============================================================
echo   Troubleshooting
echo ============================================================
echo.
echo If still getting 403 errors:
echo.
echo 1. Check .env ADEX_APP_KEY matches domain exactly
echo 2. Verify config cache cleared: php artisan config:clear
echo 3. Check Laravel logs: storage/logs/laravel.log
echo 4. Verify file permissions: chmod -R 755 storage bootstrap/cache
echo.
echo ============================================================
) > "deployment-package\DEPLOYMENT_INSTRUCTIONS.txt"

echo %GREEN%✓ Instructions created%NC%
echo.

echo %YELLOW%Step 6: Creating cPanel SSH commands file...%NC%
(
echo #!/bin/bash
echo # KoboPoint - cPanel Post-Upload Commands
echo # Run these commands on cPanel via SSH/Terminal
echo.
echo echo "Clearing Laravel caches..."
echo php artisan config:clear
echo php artisan cache:clear
echo php artisan route:clear
echo php artisan view:clear
echo.
echo echo "Rebuilding caches..."
echo php artisan config:cache
echo php artisan route:cache
echo php artisan view:cache
echo.
echo echo "Creating storage symlink..."
echo php artisan storage:link
echo.
echo echo "Setting permissions..."
echo chmod -R 755 storage bootstrap/cache
echo.
echo echo "Done! Test your site now."
) > "deployment-package\run-on-cpanel.sh"

echo %GREEN%✓ SSH commands file created%NC%
echo.

echo.
echo ============================================================
echo   %GREEN%Deployment Package Ready!%NC%
echo ============================================================
echo.
echo Package location: deployment-package\
echo.
echo Next steps:
echo   1. Review: deployment-package\DEPLOYMENT_INSTRUCTIONS.txt
echo   2. Upload files from deployment-package\ to cPanel
echo   3. Update .env on cPanel (see .env.production.template)
echo   4. Run commands from run-on-cpanel.sh on cPanel
echo   5. Test with test-origin.php
echo.
echo ============================================================
echo.
pause

