# PWA Update Instructions

## When Deploying a New Version

### 1. Update Cache Version
**File**: `frontend/public/sw.js`

Change the `CACHE_VERSION` constant:
```javascript
const CACHE_VERSION = '2025-10-21-02'; // Increment or use new date
```

### 2. Deploy
Build and deploy as normal:
```bash
cd frontend
npm run build
# Deploy to your hosting platform
```

### 3. User Experience
- Users will see an "Update Available" toast notification
- They can click "Update Now" to refresh immediately
- Or click "Later" and it will update on next page reload
- The app checks for updates:
  - On page load
  - When browser tab regains focus
  - Every 5 minutes

## For Users: How to Force Update in PWA

### Method 1: Accept the Update Prompt ✅ (Recommended)
- When you see "A new version of Travo is available!"
- Click "Update Now"
- App will refresh automatically

### Method 2: Clear Cache via Browser
1. **Android**: Settings → Apps → Travo → Storage → Clear Cache
2. **iOS**: Settings → Safari → Clear History and Website Data
3. **Desktop**: Right-click app icon → "Uninstall" → Reinstall from browser

### Method 3: Unregister Service Worker (Developer)
1. Open browser DevTools (F12)
2. Go to Application tab → Service Workers
3. Click "Unregister" next to Travo service worker
4. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)

## Current Caching Strategy

### What Gets Cached:
- HTML pages (all routes)
- Static assets (`/_next/static/`)
- Images (including Next.js optimized images)
- PWA icons and manifest

### What Doesn't Get Cached:
- API routes
- Non-GET requests
- IndexedDB data (stored separately)
- External resources

### Cache Lifetime:
- **New cache created** when `CACHE_VERSION` changes
- **Old cache deleted** automatically on service worker activation
- **Updates checked** every 5 minutes, on focus, and on load

## Troubleshooting

### "I'm not seeing the update prompt"
- Make sure you're using the **production build** (service worker only works in production)
- Check browser console for service worker errors
- Open DevTools → Application → Service Workers to see status

### "Update prompt appeared but app didn't update"
- Try closing and reopening the app
- If that doesn't work, uninstall and reinstall the PWA

### "I need to force all users to update immediately"
1. Change `CACHE_VERSION` in `sw.js`
2. Deploy
3. Users will be prompted on their next visit (within 5 minutes if app is open)

## Best Practices

1. **Always update `CACHE_VERSION`** when deploying changes
2. **Use descriptive versions**: Date-based (`2025-10-21-01`) or semantic (`v2.1.0`)
3. **Test in production** before announcing updates
4. **Communicate major updates** to users via release notes
