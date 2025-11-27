# Quick Deployment Guide - Fix 403 Errors on cPanel

## 🚀 Fast Track (5 Minutes)

### Step 1: Run Deployment Script

**Windows:**
```bash
deploy-to-cpanel.bat
```

**Linux/Mac:**
```bash
chmod +x deploy-to-cpanel.sh
./deploy-to-cpanel.sh
```

This creates a `deployment-package/` folder with all files ready to upload.

### Step 2: Upload to cPanel

**Via cPanel File Manager:**
1. Go to File Manager
2. Navigate to your Laravel root
3. Upload files from `deployment-package/` maintaining folder structure:
   - `app/Http/Controllers/API/AppController.php`
   - `app/Http/Controllers/API/Banks.php`
   - `config/cors.php`
   - `public/index.php`
   - `public/index_cpanel.php`
   - `public/test-origin.php` (optional)

**Via FTP:**
- Upload files maintaining the same folder structure

### Step 3: Update .env on cPanel

Open `.env` file and update:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.kobopoint.com
ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com
```

**CRITICAL**: 
- No trailing slashes
- Include both http and https
- Exact domain match

### Step 4: Run Commands on cPanel

**Via cPanel Terminal/SSH:**

```bash
cd ~/public_html  # or your Laravel root

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink
php artisan storage:link

# Set permissions
chmod -R 755 storage bootstrap/cache
```

**OR** upload `run-on-cpanel.sh` and run:
```bash
bash run-on-cpanel.sh
```

### Step 5: Test

1. **Diagnostic Test:**
   Visit: `https://app.kobopoint.com/test-origin.php`
   - Should show `"match": true`
   - Origin should match ADEX_APP_KEY

2. **API Test:**
   Visit: `https://app.kobopoint.com/api/website/app/setting`
   - Should return JSON (not 403)

3. **Login Test:**
   - Try logging in
   - Should work without 403 errors

### Step 6: Cleanup

After everything works, delete:
- `public/test-origin.php`
- `verify-installation.php`

## 📋 Files in Deployment Package

```
deployment-package/
├── app/
│   └── Http/
│       └── Controllers/
│           └── API/
│               ├── AppController.php  [CRITICAL]
│               └── Banks.php          [CRITICAL]
├── config/
│   └── cors.php                       [CRITICAL]
├── public/
│   ├── index.php                      [CRITICAL]
│   ├── index_cpanel.php               [CRITICAL]
│   └── test-origin.php                [OPTIONAL]
├── verify-installation.php            [OPTIONAL]
├── .env.production.template            [REFERENCE]
├── DEPLOYMENT_INSTRUCTIONS.txt         [GUIDE]
└── run-on-cpanel.sh                    [AUTOMATION]
```

## ⚠️ Troubleshooting

### Still Getting 403?

1. **Check .env:**
   ```bash
   # On cPanel, verify ADEX_APP_KEY
   grep ADEX_APP_KEY .env
   ```

2. **Check Origin:**
   - Visit `test-origin.php`
   - Compare `normalized_origin` with `normalized_allowed`
   - Must match exactly

3. **Clear Cache Again:**
   ```bash
   php artisan config:clear
   php artisan config:cache
   ```

4. **Check Logs:**
   ```bash
   tail -n 100 storage/logs/laravel.log
   ```

### Files Not Uploading?

- Check file permissions on cPanel
- Ensure folder structure matches
- Verify files are not corrupted during upload

### Cache Not Clearing?

- Try deleting manually:
  ```bash
  rm -f bootstrap/cache/config.php
  rm -f bootstrap/cache/routes-v7.php
  rm -rf storage/framework/cache/data/*
  ```

## ✅ Success Checklist

- [ ] Files uploaded to cPanel
- [ ] `.env` updated with correct `ADEX_APP_KEY`
- [ ] Caches cleared and rebuilt
- [ ] Storage symlink created
- [ ] `test-origin.php` shows `match: true`
- [ ] API endpoint returns JSON (not 403)
- [ ] Login works
- [ ] No 403 errors in browser console
- [ ] Diagnostic files deleted

## 🎯 Expected Result

After deployment:
- ✅ No 403 Forbidden errors
- ✅ API calls work correctly
- ✅ Login works
- ✅ Settings load
- ✅ All features functional

---

**Need Help?** Check `CPANEL_403_FIX.md` for detailed troubleshooting.

