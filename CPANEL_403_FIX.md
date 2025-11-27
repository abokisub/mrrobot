# Fix 403 Forbidden Errors on cPanel

## What We Changed (Non-Destructive)

All changes are **backward compatible** and **non-destructive**:

1. **Origin Validation Normalization** - Made it case-insensitive and handle trailing slashes
2. **CORS Dynamic Configuration** - Uses `ADEX_APP_KEY` from `.env` instead of hardcoded values
3. **Better Error Handling** - More robust origin matching

**Nothing was removed or broken** - we only made the validation more flexible and reliable.

## Why You're Still Getting 403 Errors

The 403 errors mean the origin validation is failing. This happens when:

1. **Code changes not uploaded** - The updated files aren't on cPanel yet
2. **`.env` not configured correctly** - `ADEX_APP_KEY` doesn't match your domain
3. **Config cache not cleared** - Laravel is using old cached config

## Step-by-Step Fix

### Step 1: Upload Latest Code to cPanel

**Option A: Via Git (Recommended)**
```bash
# On cPanel via SSH/Terminal
cd ~/public_html  # or your Laravel root
git pull origin master
```

**Option B: Manual Upload**
1. Download latest from GitHub
2. Upload these files to cPanel:
   - `app/Http/Controllers/API/AppController.php`
   - `app/Http/Controllers/API/Banks.php`
   - `config/cors.php`
   - `public/index.php`
   - `public/index_cpanel.php`

### Step 2: Check/Update `.env` on cPanel

**Critical**: Your `.env` must have:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.kobopoint.com

# THIS IS THE KEY - Must match EXACTLY
ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com
```

**IMPORTANT Rules**:
- ✅ No trailing slashes: `https://app.kobopoint.com` NOT `https://app.kobopoint.com/`
- ✅ Include both http and https versions
- ✅ Comma-separated (no spaces around comma)
- ✅ Exact domain match

### Step 3: Clear All Caches

**Via cPanel Terminal/SSH**:
```bash
cd ~/public_html  # or your Laravel root
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Then rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Via cPanel File Manager** (if no terminal):
1. Delete `bootstrap/cache/config.php`
2. Delete `bootstrap/cache/routes-v7.php`
3. Delete `storage/framework/cache/data/*` (all files inside)
4. Delete `storage/framework/views/*` (all files inside)

### Step 4: Verify Origin Header

**Check what origin is being sent**:

1. Open browser → F12 → Network tab
2. Try to login or refresh page
3. Find the failed request (red)
4. Click on it → Headers tab
5. Look for `Origin: https://app.kobopoint.com`

**Compare with your `.env`**:
- Origin header: `https://app.kobopoint.com`
- ADEX_APP_KEY must include: `https://app.kobopoint.com`

### Step 5: Test API Directly

**Test if API works without origin check**:

Visit in browser:
```
https://app.kobopoint.com/api/website/app/setting
```

**Expected Results**:
- ✅ If returns JSON → Origin validation is working
- ❌ If returns 403 → Origin validation still failing
- ❌ If returns 404 → Route not found (different issue)

## Quick Diagnostic Script

Create a file `public/test-origin.php` on cPanel:

```php
<?php
header('Content-Type: application/json');

$origin = $_SERVER['HTTP_ORIGIN'] ?? 'not set';
$adexAppKey = getenv('ADEX_APP_KEY') ?: 'not set';
$allowedOrigins = explode(',', $adexAppKey);
$normalizedAllowed = array_map(function($url) {
    return strtolower(rtrim(trim($url), '/'));
}, $allowedOrigins);

$normalizedOrigin = strtolower(rtrim($origin, '/'));

echo json_encode([
    'origin_header' => $origin,
    'adex_app_key' => $adexAppKey,
    'allowed_origins' => $allowedOrigins,
    'normalized_allowed' => $normalizedAllowed,
    'normalized_origin' => $normalizedOrigin,
    'match' => in_array($normalizedOrigin, $normalizedAllowed),
    'app_env' => getenv('APP_ENV'),
    'app_url' => getenv('APP_URL'),
], JSON_PRETTY_PRINT);
```

Visit: `https://app.kobopoint.com/test-origin.php`

**Check**:
- Is `origin_header` set?
- Does `normalized_origin` match any in `normalized_allowed`?
- Is `match` = `true`?

## Common Issues & Solutions

### Issue 1: ADEX_APP_KEY Empty or Wrong

**Symptom**: `adex_app_key` shows "not set" or wrong domain

**Fix**:
```env
ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com
```

Then clear cache:
```bash
php artisan config:clear
php artisan config:cache
```

### Issue 2: Origin Header Not Set

**Symptom**: `origin_header` shows "not set"

**Possible Causes**:
- Browser not sending Origin header (unlikely)
- Server stripping headers (check `.htaccess`)

**Fix**: Check `.htaccess` doesn't strip headers

### Issue 3: Case Sensitivity

**Symptom**: Domains look same but don't match

**Fix**: Our code now handles this automatically (normalizes to lowercase)

### Issue 4: Trailing Slash Mismatch

**Symptom**: `https://app.kobopoint.com` vs `https://app.kobopoint.com/`

**Fix**: Our code now handles this automatically (removes trailing slashes)

### Issue 5: Config Cache Not Cleared

**Symptom**: Changes to `.env` not taking effect

**Fix**:
```bash
php artisan config:clear
php artisan config:cache
```

## Additional Fixes Needed

### Fix welcome.png Path

The error shows: `https://app.kobopoint.com/upload/welcome.png`

**This means**:
1. Frontend build still has old path, OR
2. Storage symlink not created

**Fix**:
```bash
# Create storage symlink
php artisan storage:link

# Move welcome.png to storage
# If file exists in public/upload/welcome.png:
mkdir -p storage/app/public
cp public/upload/welcome.png storage/app/public/welcome.png
```

### Fix Service Worker Error

The service worker redirect error is separate. To fix:

1. Check if `public/service-worker.js` exists
2. If not, create it or disable service worker registration
3. Check `.htaccess` for redirects

## Verification Checklist

After applying fixes:

- [ ] Code uploaded to cPanel
- [ ] `.env` has correct `ADEX_APP_KEY`
- [ ] Config cache cleared and rebuilt
- [ ] `test-origin.php` shows `match: true`
- [ ] API endpoint `/api/website/app/setting` returns JSON (not 403)
- [ ] Login works
- [ ] No 403 errors in browser console
- [ ] `welcome.png` loads from `/storage/welcome.png`

## Still Not Working?

If still getting 403 after all steps:

1. **Check Laravel logs**:
   ```bash
   tail -n 100 storage/logs/laravel.log
   ```

2. **Check exact error** in browser Network tab:
   - Request URL
   - Request Headers (especially `Origin`)
   - Response body

3. **Verify file permissions**:
   ```bash
   chmod -R 755 storage bootstrap/cache
   ```

4. **Test with curl**:
   ```bash
   curl -H "Origin: https://app.kobopoint.com" \
        https://app.kobopoint.com/api/website/app/setting
   ```

