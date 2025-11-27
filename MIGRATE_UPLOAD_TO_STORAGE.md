# Migration Guide: Moving Upload Files to Storage

## Overview
This application now uses Laravel's storage system instead of the `/upload/` directory. 
If you have existing files in `public/upload/`, follow these steps to migrate them.

## Steps

### 1. Create Storage Directory Structure
```bash
mkdir -p storage/app/public
chmod -R 755 storage/app/public
```

### 2. Move Files from public/upload/ to storage/app/public/
```bash
# Via Terminal/SSH:
cp -r public/upload/* storage/app/public/
# Or move if you want to remove from public:
mv public/upload/* storage/app/public/
```

### 3. Create Storage Symlink
```bash
php artisan storage:link
```

This creates `public/storage` → `storage/app/public`

### 4. Verify
- Files should now be accessible at: `https://yourdomain.com/storage/filename.png`
- Old path `/upload/welcome.png` → New path `/storage/welcome.png`

### 5. Update Database (if needed)
If your database stores file paths with `/upload/`, update them:
```sql
UPDATE your_table SET image_path = REPLACE(image_path, '/upload/', '/storage/');
```

## For New Installations
- Files should be uploaded to `storage/app/public/` directory
- Access them via `asset('storage/filename.png')` in Blade templates
- The `php artisan storage:link` command creates the public symlink automatically

