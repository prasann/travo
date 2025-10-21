# Debugging Offline Mode on Vercel

## Changes Made

### 1. Added Vercel Configuration (`/vercel.json`)
- Proper headers for service worker files
- Cache control for manifest
- Allows service worker to control all routes

### 2. Added Service Worker Registration Component
- `ServiceWorkerRegistration.tsx` - Explicitly registers the service worker
- Shows console logs for debugging
- Handles service worker updates
- Added to root layout for all pages

### 3. Added Offline Indicator
- `OfflineIndicator.tsx` - Visual feedback when offline/online
- Shows warning banner when offline
- Shows success banner when coming back online

### 4. Enhanced PWA Configuration
- Added runtime caching for Firebase/Google APIs
- Better cache strategies for offline functionality

### 5. Added PWA Test Page
- Visit `/pwa-test.html` on your deployed app
- Runs comprehensive diagnostics
- Shows all caches, service workers, and IndexedDB
- Provides testing tools

## How to Debug

### Step 1: Deploy Changes

```bash
git add .
git commit -m "Add PWA debugging and offline improvements"
git push origin main
```

Wait for Vercel to deploy (check the Vercel dashboard).

### Step 2: Test on Deployed URL

1. Visit your deployed Vercel URL
2. Open Chrome DevTools (F12)
3. Go to **Console** tab
4. Look for these messages:
   - `✅ Service Worker registered: https://your-app.vercel.app/`
   - This confirms SW is working

### Step 3: Use PWA Test Page

Visit: `https://your-app.vercel.app/pwa-test.html`

This will automatically:
- Check if service worker is registered
- List all caches
- Show IndexedDB databases
- Verify manifest
- Check HTTPS status

### Step 4: Manual Offline Test

1. Open DevTools → **Application** tab
2. Click **Service Workers** in left sidebar
3. Verify status shows "activated and running" (green dot)
4. Check the **Offline** checkbox
5. Try navigating to different pages
6. They should load from cache!

### Step 5: Check Cache Storage

1. DevTools → **Application** tab
2. Click **Cache Storage** in left sidebar
3. Should see caches like:
   - `start-url`
   - `pages`
   - `static-js-assets`
   - `static-style-assets`
   - etc.
4. Click each cache to see what's stored

### Step 6: Check Network Tab

1. DevTools → **Network** tab
2. Reload the page
3. Look at the **Size** column
4. Resources loaded from service worker show "(ServiceWorker)" or "(from ServiceWorker)"

## Common Issues & Solutions

### Issue: "Service Worker registration failed"

**Check:**
- Is the app deployed on HTTPS? (Vercel uses HTTPS by default)
- Check Vercel build logs for errors
- Look for `sw.js` at root: `https://your-app.vercel.app/sw.js`

**Solution:**
- If `sw.js` is missing, the build failed
- Check `next-pwa` is in `devDependencies` 
- Rebuild locally: `npm run build` and check for errors

### Issue: Service Worker registered but pages don't work offline

**Check:**
- Cache Storage in DevTools - are pages cached?
- Network tab - are requests going to SW?
- Console errors when offline?

**Solution:**
- The service worker might be caching but not serving
- Check `sw.js` content - should have route handlers
- Try clearing cache and rebuilding

### Issue: "Offline" checkbox doesn't work

**Solution:**
- Use **Network tab** → Throttle dropdown → "Offline" instead
- Or turn off WiFi/data on mobile device
- Or use "Disable cache" + "Offline" together

### Issue: IndexedDB works but pages don't load offline

**Diagnosis:**
- IndexedDB (your data) is separate from service worker (page caching)
- You need BOTH to work offline
- IndexedDB stores trip data
- Service Worker caches HTML/JS/CSS

**Solution:**
- Check that service worker is activated
- Check that routes are cached
- May need to visit pages online first so they cache

### Issue: Works on localhost but not Vercel

**Check:**
1. Environment variables in Vercel dashboard
2. Build logs for errors
3. `vercel.json` is committed and deployed
4. Service worker files are in the build output

## Testing Checklist

- [ ] Service worker registration message in console
- [ ] `/sw.js` file accessible
- [ ] `/manifest.json` file accessible
- [ ] Application → Service Workers shows "activated"
- [ ] Cache Storage shows multiple caches
- [ ] Can navigate while offline checkbox is checked
- [ ] IndexedDB shows `TravoDatabase`
- [ ] Offline indicator appears when going offline
- [ ] Online indicator appears when coming back online

## Browser Console Commands

Run these in the console on your deployed app:

```javascript
// Check if SW is registered
navigator.serviceWorker.getRegistrations().then(r => console.log(r));

// Check all caches
caches.keys().then(names => console.log('Caches:', names));

// Check what's in a specific cache
caches.open('pages').then(cache => cache.keys()).then(keys => console.log(keys));

// Check IndexedDB
indexedDB.databases().then(dbs => console.log('Databases:', dbs));

// Force SW update
navigator.serviceWorker.getRegistrations().then(regs => 
  Promise.all(regs.map(r => r.update()))
).then(() => console.log('Updated'));
```

## Next Steps if Still Not Working

1. **Check Vercel Build Logs**
   - Go to Vercel dashboard → Your deployment → Build Logs
   - Look for `next-pwa` output
   - Check for any errors or warnings

2. **Compare with Working PWA**
   - Visit a known PWA like `https://pwa-directory.com/`
   - Check their service worker setup
   - Compare with yours

3. **Enable Verbose Logging**
   - Add more console.logs in ServiceWorkerRegistration.tsx
   - Check what's happening during registration

4. **Check Browser Support**
   - Test in Chrome, Firefox, Safari
   - Mobile browsers behave differently
   - iOS Safari has PWA limitations

5. **Verify Build Output**
   - Run `npm run build` locally
   - Check `frontend/.next/` folder
   - Check `frontend/public/` for `sw.js` and `workbox-*.js`

## Expected Behavior

### Online:
- App loads normally
- Data syncs to Firestore
- Service worker caches pages in background

### Offline:
- Yellow warning banner appears
- Pages load from cache
- Data reads from IndexedDB
- Changes queued for sync
- Firebase requests fail gracefully

### Back Online:
- Green success banner appears
- Queued changes sync to Firestore
- Service worker updates cache
- App returns to normal operation

## Support

If issues persist, gather this info:
1. Screenshot of DevTools → Application → Service Workers
2. Screenshot of DevTools → Application → Cache Storage
3. Console errors (if any)
4. Vercel build logs
5. Browser and OS version
