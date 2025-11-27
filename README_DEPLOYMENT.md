# 🚀 KoboPoint - Zero-Config cPanel Deployment

This is a **zero-configuration deployment package** designed for shared hosting (cPanel). No command line, no SSH, no advanced setup required!

## ✨ Features

- ✅ **Zero CLI Required** - Upload and configure via cPanel File Manager
- ✅ **Auto-Detection** - Automatically detects localhost vs production
- ✅ **No Hardcoded URLs** - All URLs come from environment variables
- ✅ **Beginner-Friendly** - Step-by-step guide included
- ✅ **Pre-Built** - React app pre-built, dependencies pre-installed

## 📦 What's Included

This deployment package includes:
- ✅ Laravel backend (pre-configured)
- ✅ React frontend (pre-built)
- ✅ Composer dependencies (vendor/ folder)
- ✅ Database migrations
- ✅ Environment templates
- ✅ Deployment guide

## 🎯 Quick Start (5 Steps)

### 1. Upload Files
Upload all project files to your cPanel server via File Manager or FTP.

### 2. Set Up Structure
- Copy `public/index_cpanel.php` to `public_html/index.php`
- Move Laravel core to `/laravel/` (outside public_html) OR keep everything in `public_html/`

### 3. Create Database
- Go to cPanel → MySQL Databases
- Create database and user
- Note credentials

### 4. Configure Environment
- Copy `env.example.laravel` to `.env` (in Laravel root)
- Update with your domain and database details:
  ```env
  APP_URL=https://yourdomain.com
  FRONTEND_URL=https://yourdomain.com
  API_URL=https://yourdomain.com/api
  DB_DATABASE=your_database
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  APP_KEY=base64:your32characterkey
  ADEX_APP_KEY=https://yourdomain.com,https://www.yourdomain.com
  ```

### 5. Import Database
- Go to phpMyAdmin
- Select your database
- Import `database/dump.sql`

**Done!** Visit your domain to see the application.

## 📚 Full Documentation

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for:
- Detailed step-by-step instructions
- Troubleshooting guide
- File structure recommendations
- Security checklist
- Environment variables reference

## 🔧 Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `APP_URL` | Your application URL | `https://yourdomain.com` |
| `FRONTEND_URL` | Frontend URL (usually same as APP_URL) | `https://yourdomain.com` |
| `API_URL` | API endpoint URL | `https://yourdomain.com/api` |
| `DB_*` | Database connection details | See `.env` file |
| `APP_KEY` | Application encryption key | Generate 32-char string |
| `ADEX_APP_KEY` | Allowed origins (comma-separated) | `https://yourdomain.com,https://www.yourdomain.com` |

### Optional Variables
- `ERROR_500` - Custom error page URL
- `CORS_ALLOWED_ORIGINS` - Additional CORS origins
- Payment gateway keys (Paystack, Monnify, etc.)
- Firebase credentials

## 🏗️ Project Structure

### Recommended cPanel Structure
```
/home/username/
├── public_html/          (Website root)
│   ├── index.php         (Entry point)
│   ├── static/           (React build)
│   └── assets/           (Laravel public assets)
├── laravel/              (Laravel core - outside public_html)
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── vendor/
│   └── .env
└── frontend/             (Source - optional)
```

### Simple Structure (All in public_html)
```
public_html/
├── index.php
├── app/
├── config/
├── database/
├── vendor/
├── public/ (React build)
└── .env
```

## 🛠️ Building from Source (Optional)

If you need to rebuild the React app:

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment variables:**
   ```bash
   cp env.example.react .env
   # Edit .env with your API URL
   ```

3. **Build:**
   ```bash
   npm run build
   ```

4. **Copy build files:**
   ```bash
   cp -r build/* ../public/
   ```

Or use the provided scripts:
- **Linux/Mac:** `./prepare-deployment.sh`
- **Windows:** `prepare-deployment.bat`

## 🔒 Security Notes

- ✅ `.env` file should NOT be publicly accessible
- ✅ Set `APP_DEBUG=false` in production
- ✅ Use strong `APP_KEY`
- ✅ Restrict `ADEX_APP_KEY` to your domains only
- ✅ Keep database credentials secure

## 📞 Support

### Common Issues

**"Laravel application not found"**
- Check that `bootstrap/app.php` exists in the correct path
- Verify `index.php` paths are correct

**"500 Internal Server Error"**
- Check `.env` file exists and has correct values
- Verify `APP_KEY` is set
- Check file permissions (folders: 755, files: 644)
- Check cPanel error logs

**"CORS Error"**
- Update `ADEX_APP_KEY` in `.env`
- Update `FRONTEND_URL` in `.env`
- Clear browser cache

**"Database connection failed"**
- Verify database credentials in `.env`
- Check database user permissions
- Ensure database exists

## 🎓 For Developers

### Auto-Detection Features

The application automatically:
- ✅ Detects environment (localhost vs production)
- ✅ Falls back to current request URL if env vars not set
- ✅ Auto-detects Laravel base path in cPanel
- ✅ Handles URL generation dynamically

### Helper Functions

The project includes helper functions in `app/Helpers/UrlHelper.php`:
- `getAppUrl()` - Get application URL with auto-detection
- `getFrontendUrl()` - Get frontend URL with auto-detection
- `getApiUrl()` - Get API URL
- `getErrorUrl()` - Get error page URL

## 📝 License

See LICENSE file for details.

## 🙏 Credits

Built with:
- Laravel 8
- React 18
- Material-UI
- And many other amazing open-source libraries

---

**Need help?** Check the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.




