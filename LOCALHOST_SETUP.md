# Localhost Development Setup Guide

## Problem
React app runs on `localhost:3000` but Laravel API runs on `localhost:8000`. The frontend needs to call the correct API URL.

## Solution
The code has been updated to automatically detect and use `http://localhost:8000` when React is running on `localhost:3000`.

## Setup Steps

### 1. Start Laravel Backend
```bash
cd C:\Users\Habukhan\Documents\kobopoint
php artisan serve
```
This will start Laravel on `http://localhost:8000`

### 2. Start React Frontend (in a new terminal)
```bash
cd C:\Users\Habukhan\Documents\kobopoint\frontend
npm start
```
This will start React on `http://localhost:3000`

### 3. Verify .env Files

**Laravel .env** (`C:\Users\Habukhan\Documents\kobopoint\.env`):
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
ADEX_APP_KEY=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000
```

**React .env** (`C:\Users\Habukhan\Documents\kobopoint\frontend\.env`):
```env
REACT_APP_API_URL=http://localhost:8000
```

**OR** leave `REACT_APP_API_URL` empty - the code will auto-detect `http://localhost:8000` when running on `localhost:3000`.

### 4. Test
1. Open `http://localhost:3000` in browser
2. Check browser console - API calls should go to `http://localhost:8000/api/...`
3. Login should work

## How It Works

The `frontend/src/config.js` file now includes this logic:

```javascript
// In development, React runs on port 3000 but Laravel API runs on port 8000
if (window.location.origin === 'http://localhost:3000' || window.location.origin === 'http://127.0.0.1:3000') {
    return 'http://localhost:8000';
}
```

This automatically routes API calls from React (port 3000) to Laravel (port 8000).

## Troubleshooting

### Issue: Still getting 404 errors
- **Check**: Is Laravel running? Visit `http://localhost:8000/api/test` directly
- **Check**: Browser console - what URL is being called?
- **Fix**: Restart both servers

### Issue: CORS errors
- **Check**: `.env` has `ADEX_APP_KEY` with `http://localhost:3000`
- **Fix**: Clear Laravel cache: `php artisan config:clear`

### Issue: 403 Forbidden
- **Check**: Origin header in browser Network tab
- **Check**: `ADEX_APP_KEY` in `.env` includes the exact origin
- **Fix**: Ensure no trailing slashes in `ADEX_APP_KEY`

