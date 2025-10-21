# PWA Setup - Simple Approach

## Overview
Travo uses a simple, manual PWA setup following the official Next.js 15 guidelines. This approach prioritizes:
- **Simplicity**: No complex plugins or build tools
- **IndexedDB-first**: Offline data handled by Dexie.js
- **Installability**: PWA can be installed on all devices
- **Basic offline support**: Caches visited pages and static assets

## Architecture

### Service Worker (`public/sw.js`)
- **Install**: Caches core assets (/, manifest, icons)
- **Activate**: Cleans up old caches
- **Fetch**: Cache-first strategy for visited pages and static assets
- **Updates**: Automatically activates on reload

### Registration (`components/ServiceWorkerRegistration.tsx`)
- Registers service worker on production only
- Checks for updates on page load
- Periodic update checks every hour
- Simple, no complex update prompts

### Offline Data Strategy
1. **Online**: User visits pages, data loaded from Firestore
2. **Stored**: Data saved to IndexedDB via Dexie.js
3. **Offline**: 
   - Service worker serves cached page shell
   - React app boots and reads from IndexedDB
   - User sees their data even offline

## Files

### Core PWA Files
- `frontend/public/sw.js` - Service worker with simple caching
- `frontend/public/manifest.json` - PWA manifest (name, icons, theme)
- `frontend/components/ServiceWorkerRegistration.tsx` - SW registration component

### Configuration
- `frontend/next.config.ts` - Clean Next.js config (no PWA plugin)
- `vercel.json` - Headers for sw.js and manifest.json
- `frontend/package.json` - No next-pwa dependency

### Removed Files
- ❌ `next-pwa` dependency (outdated for Next.js 15)
- ❌ Complex workbox configuration
- ❌ Generated workbox-*.js files
- ❌ Complex update handling logic

## How It Works

### Installation
1. User visits site on mobile/desktop
2. Browser detects manifest.json
3. Shows "Add to Home Screen" prompt
4. User installs, gets app icon

### Offline Usage
1. User visits pages while online
2. Service worker caches:
   - HTML page shells
   - Static assets (/_next/static/)
   - Core assets (manifest, icons)
3. User goes offline
4. Service worker serves cached pages
5. React app reads data from IndexedDB
6. User sees their trips/activities offline

### Updates
1. User visits site with new version
2. Service worker detects update on page load
3. New SW installs in background
4. On next page reload, new SW activates
5. User gets latest version

## Testing

### Local Testing
```bash
cd frontend
npm run build
npm run start
# Visit http://localhost:3000
# Check DevTools > Application > Service Workers
```

### Production Testing
1. Deploy to Vercel
2. Visit site on mobile
3. Check DevTools > Application:
   - Service Workers: Should show "Activated"
   - Cache Storage: Should show "travo-v1" cache
   - IndexedDB: Should show TravoLocalDB
4. Turn off network
5. Refresh page - should still load
6. Open trip - should show data from IndexedDB

## Maintenance

### Update Cache Version
When making breaking changes, update `CACHE_NAME` in `sw.js`:
```javascript
const CACHE_NAME = 'travo-v2'; // Increment version
```

### Add Critical Assets
To cache additional assets on install, add to `ASSETS_TO_CACHE`:
```javascript
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/my-critical-asset.js', // Add here
];
```

### Debug Issues
1. Check browser console for SW registration errors
2. Check DevTools > Application > Service Workers for status
3. Click "Unregister" to test fresh registration
4. Hard refresh (Cmd+Shift+R) to bypass cache

## Reference
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
