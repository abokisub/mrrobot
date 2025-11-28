# cPanel Final Fixes Required

## Critical Issues Fixed in Code

### ✅ 1. Admin Endpoints 500 Errors
**Fixed:** Updated `SecureController` and `AdminController` methods to use `config('adex.app_key')` instead of `env('ADEX_APP_KEY')` for proper config caching support.

**Methods Fixed:**
- `Airtimelock()` in SecureController
- `RDataPlan()` in SecureController  
- `AirtimeDiscount()` in AdminController
- `userRequest()` in AdminController
- All `redirect(env('ERROR_500'))` replaced with `redirect(config('adex.error_500', '/500'))`

### ✅ 2. 403 Forbidden on Account Endpoint
**Already Fixed:** `AuthController::account()` uses `config('adex.app_key')` - but you need to clear config cache.

### ✅ 3. Service Worker 404
**Issue:** `service-worker.js` file missing or not being served correctly.

### ✅ 4. Manifest Icon Error
**Issue:** Still trying to load `/upload/welcome.png` instead of `/storage/welcome.png`.

## Required Actions on cPanel

### 1. Update `.env` File
Make sure your `.env` file has:
```env
APP_URL=https://app.kobopoint.com
ADEX_APP_KEY=https://app.kobopoint.com
ADEX_DEVICE_KEY=your_device_key_here
ERROR_500=/500
```

**CRITICAL:** The `ADEX_APP_KEY` must match your domain exactly (no trailing slash).

### 2. Clear ALL Laravel Cache
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
```

**IMPORTANT:** After clearing cache, you MUST run `php artisan config:cache` to rebuild the config cache with the new `config()` calls.

### 3. Fix Service Worker
The `service-worker.js` file should be in your `public/` directory. If it's missing:
- Copy it from your React build output
- Or disable service worker registration in production

### 4. Fix Manifest Icon
Update `public/manifest.json` (or the one in your React build) to use:
```json
{
  "icons": [
    {
      "src": "/storage/welcome.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

And ensure `welcome.png` exists in `storage/app/public/` directory.

### 5. Database Lock Status Issue
If plans show as locked even when unlocked in admin:

1. **Check the `general` table:**
   ```sql
   SELECT * FROM `general` LIMIT 1;
   ```

2. **Check network lock fields:**
   ```sql
   SELECT mtn_g, glo_g, airtel_g, mobile_g, 
          mtn_cg, glo_cg, airtel_cg, mobile_cg,
          mtn_sme, glo_sme, airtel_sme, mobile_sme
   FROM `general`;
   ```

3. **Unlock all if needed:**
   ```sql
   UPDATE `general` SET 
     mtn_g = 0, glo_g = 0, airtel_g = 0, mobile_g = 0,
     mtn_cg = 0, glo_cg = 0, airtel_cg = 0, mobile_cg = 0,
     mtn_sme = 0, glo_sme = 0, airtel_sme = 0, mobile_sme = 0;
   ```

4. **Check data_plan status:**
   ```sql
   SELECT COUNT(*) FROM `data_plan` WHERE `plan_status` = 1;
   ```

### 6. Auto-Logout on Refresh
This is caused by the 403 error on `/api/account/my-account/...`. After fixing the config cache, this should resolve.

**Temporary fix:** Check browser console for the exact error and verify:
- The origin header is being sent correctly
- The `ADEX_APP_KEY` in `.env` matches your domain exactly
- Config cache has been cleared and rebuilt

## Verification Steps

After applying fixes:

1. **Test Account Endpoint:**
   ```bash
   curl -H "Origin: https://app.kobopoint.com" \
        -H "Authorization: Bearer YOUR_TOKEN" \
        https://app.kobopoint.com/api/account/my-account/YOUR_USER_ID
   ```
   Should return 200, not 403.

2. **Test Admin Endpoint:**
   ```bash
   curl -X POST \
        -H "Origin: https://app.kobopoint.com" \
        -H "Content-Type: application/json" \
        https://app.kobopoint.com/api/edit/airtime/lock/account/YOUR_ADMIN_ID/adex/secure
   ```
   Should return 200, not 500.

3. **Check Laravel Logs:**
   ```bash
   tail -f storage/logs/laravel.log
   ```
   Look for any errors related to config or origin validation.

## Notes

- All code fixes have been pushed to GitHub
- You MUST clear and rebuild config cache after pulling changes
- The 500 errors were caused by `env()` calls not working with config cache
- The 403 errors will be fixed once config cache is properly rebuilt

