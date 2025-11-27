# Deployment Package Preparation Guide

## What to Include in Final ZIP

### 1. Laravel Core Files
```
app/
bootstrap/
config/
database/
public/          (with React build inside)
resources/
routes/
storage/         (with .gitignore files)
vendor/          (include for zero-deploy)
.env.example
artisan
composer.json
composer.lock
```

### 2. React Build Files
- Copy `frontend/build/*` to `public/`
- Ensure `public/index.html` exists
- Ensure `public/static/` directory exists with CSS/JS

### 3. Documentation Files
- INSTALL.txt
- .env.example
- MIGRATE_UPLOAD_TO_STORAGE.md (optional)
- verify-installation.php (optional, delete after use)

### 4. Database
- database/dump.sql (or database/migrations/ if using migrations)

### 5. Exclude
- .git/
- .env (actual file with secrets)
- node_modules/
- frontend/ (source files, not needed - only build)
- storage/logs/*.log
- storage/framework/cache/*
- storage/framework/sessions/*
- storage/framework/views/*

## Package Structure

```
kobopoint-package.zip
├── app/
├── bootstrap/
├── config/
├── database/
│   └── dump.sql
├── public/
│   ├── index.html          (React build)
│   ├── static/            (React assets)
│   ├── index.php          (Laravel entry)
│   └── ...
├── resources/
├── routes/
├── storage/
│   └── (with .gitignore files)
├── vendor/                (for zero-deploy)
├── .env.example
├── INSTALL.txt
├── artisan
├── composer.json
└── composer.lock
```

## Pre-Package Commands

Before creating the ZIP, run:

```bash
# 1. Build React app
cd frontend
npm run build
cd ..

# 2. Copy React build to public
cp -r frontend/build/* public/

# 3. Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Ensure storage structure
mkdir -p storage/app/public
chmod -R 755 storage bootstrap/cache

# 5. Create .env.example (copy from .env, remove secrets)
# 6. Remove sensitive files
rm -f .env
rm -rf storage/logs/*.log
rm -rf storage/framework/cache/*
rm -rf storage/framework/sessions/*
rm -rf storage/framework/views/*

# 7. Create ZIP (excluding .git, node_modules, etc.)
zip -r kobopoint-package.zip . \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*frontend/src*" \
  -x "*.env" \
  -x "*storage/logs/*.log" \
  -x "*storage/framework/cache/*" \
  -x "*storage/framework/sessions/*" \
  -x "*storage/framework/views/*"
```

## Post-Installation Verification

After user installs, they should:

1. Visit: `https://yourdomain.com/verify-installation.php`
2. Check all items pass
3. Delete `verify-installation.php` for security
4. Test API: `https://yourdomain.com/api/test`
5. Check logs: `storage/logs/laravel.log` (should be empty or no errors)

## File Size Considerations

- **With vendor/**: ~50-100MB (zero-deploy, no composer needed)
- **Without vendor/**: ~5-10MB (requires `composer install`)

**Recommendation:** Include vendor/ for true zero-deploy experience.

