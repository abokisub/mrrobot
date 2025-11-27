# cPanel Production Deployment Checklist

## ✅ Changes Are Production-Ready

All changes made are **environment-agnostic** and will work automatically in production. Here's why:

### 1. Frontend API URL Detection ✅
**File**: `frontend/src/config.js`

**How it works in production**:
```javascript
// Priority 1: Use REACT_APP_API_URL if set (you can set this during build)
if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
}

// Priority 2: Check if localhost:3000 (development only - won't match in production)
if (window.location.origin === 'http://localhost:3000') {
    return 'http://localhost:8000';
}

// Priority 3: Auto-detect from current domain (PRODUCTION FALLBACK)
return window.location.origin; // e.g., https://app.kobopoint.com
```

**Result**: In production, it will automatically use `https://app.kobopoint.com` for API calls. ✅

### 2. Backend Origin Validation ✅
**File**: `app/Http/Controllers/API/AppController.php`

**How it works**:
- Normalizes origins (lowercase, no trailing slashes)
- Uses `ADEX_APP_KEY` from `.env`
- Better matching logic

**Result**: Works with any domain you configure in `.env`. ✅

### 3. CORS Configuration ✅
**File**: `config/cors.php`

**How it works**:
- Dynamically reads from `ADEX_APP_KEY` environment variable
- No hardcoded domains

**Result**: Automatically uses your production domain from `.env`. ✅

## 📋 Pre-Upload Checklist

### Step 1: Build React with Production Settings (Optional but Recommended)

**Option A: Build without REACT_APP_API_URL** (Recommended - Auto-detection)
```bash
cd frontend
npm run build
```
The build will use `window.location.origin` automatically in production.

**Option B: Build with explicit API URL**
```bash
# Create frontend/.env.production
echo "REACT_APP_API_URL=https://app.kobopoint.com" > frontend/.env.production

# Build
npm run build
```

### Step 2: Prepare Files for Upload

Run the deployment script:
```bash
# Windows
prepare-deployment.bat

# Linux/Mac
chmod +x prepare-deployment.sh
./prepare-deployment.sh
```

This will:
- Build React app
- Copy build files to `public/`
- Optimize Laravel

### Step 3: Verify Files to Upload

**Must Include**:
- ✅ All Laravel files (app/, config/, routes/, etc.)
- ✅ `public/` directory (with React build inside)
- ✅ `vendor/` directory (if including for zero-deploy)
- ✅ `storage/` directory (with proper permissions)
- ✅ `.env.example` (template, no secrets)

**Must NOT Include**:
- ❌ `.env` (actual file with secrets)
- ❌ `node_modules/`
- ❌ `frontend/src/` (source files - only build needed)
- ❌ `.git/`

## 📤 Upload to cPanel

1. **Upload all files** to your cPanel account
2. **Extract** if uploaded as ZIP
3. **Ensure** `public/` contents are accessible via web

## ⚙️ Post-Upload Configuration

### 1. Update `.env` File

**Critical Settings**:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://app.kobopoint.com

# CRITICAL: Must match your exact domain
ADEX_APP_KEY=https://app.kobopoint.com,http://app.kobopoint.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**IMPORTANT for ADEX_APP_KEY**:
- ✅ No trailing slashes: `https://app.kobopoint.com` NOT `https://app.kobopoint.com/`
- ✅ Include both http and https versions
- ✅ Exact match with your domain
- ✅ Comma-separated if multiple domains

### 2. Set Permissions

Via cPanel Terminal or File Manager:
```bash
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 3. Create Storage Symlink

```bash
php artisan storage:link
```

### 4. Clear All Caches

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan view:cache
php artisan config:cache
php artisan route:cache
```

### 5. Import Database

Import your `database/dump.sql` via phpMyAdmin.

## 🧪 Testing After Upload

### 1. Test API Endpoints

Visit in browser:
- `https://app.kobopoint.com/api/website/app/setting`
- Should return JSON (not 403 or 404)

### 2. Test Frontend

- Visit `https://app.kobopoint.com`
- Open browser console (F12)
- Check Network tab:
  - API calls should go to `https://app.kobopoint.com/api/...`
  - No 403 or 404 errors

### 3. Test Login

- Try logging in
- Should work without errors

### 4. Check Logs

```bash
tail -n 200 storage/logs/laravel.log
```
Should show no fatal errors.

## 🔍 Troubleshooting

### Issue: Still getting 403 Forbidden

**Check**:
1. `ADEX_APP_KEY` in `.env` matches domain exactly
2. No trailing slashes in `ADEX_APP_KEY`
3. Both http and https versions included
4. Config cache cleared: `php artisan config:clear`

**Debug**:
- Check browser Network tab → Request Headers → `Origin`
- Compare with `ADEX_APP_KEY` in `.env`
- Must match exactly (case-insensitive, no trailing slash)

### Issue: API calls going to wrong URL

**Check**:
1. Browser console → Network tab
2. What URL are API calls using?
3. If wrong, check if `REACT_APP_API_URL` was set during build
4. Rebuild React if needed

### Issue: Images not loading

**Fix**:
```bash
php artisan storage:link
```
Ensure `public/storage` symlink exists.

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads at `https://app.kobopoint.com`
- [ ] No console errors in browser
- [ ] API calls go to `https://app.kobopoint.com/api/...`
- [ ] No 403 Forbidden errors
- [ ] Login works
- [ ] Settings load correctly
- [ ] Images load (if using storage)
- [ ] `storage/logs/laravel.log` has no fatal errors

## 🎯 Summary

**Yes, all changes are production-ready!**

The code automatically:
- ✅ Detects production domain from `window.location.origin`
- ✅ Uses `ADEX_APP_KEY` from `.env` for origin validation
- ✅ Works with any domain you configure
- ✅ No hardcoded URLs that break in production

**You just need to**:
1. Build React (or let it auto-detect)
2. Upload files
3. Set `.env` with correct `ADEX_APP_KEY`
4. Clear caches

That's it! 🚀

