# Quick Start: Debugging Offline Mode

## 🚀 Deploy First

```bash
cd /Users/pnagarajan/projects/personal/travo
git add .
git commit -m "Add PWA debugging and offline mode improvements"
git push origin main
```

## 🧪 Test Immediately After Deploy

### 1. Open Your Deployed App in Chrome
Go to: `https://your-app.vercel.app`

### 2. Open DevTools Console (F12)
Look for: `✅ Service Worker registered: https://your-app.vercel.app/`

✅ **If you see this** → Service Worker is working!  
❌ **If you don't** → Check Step 3

### 3. Visit PWA Test Page
Go to: `https://your-app.vercel.app/pwa-test.html`

This shows:
- ✅ Service Worker status
- ✅ All caches
- ✅ IndexedDB databases  
- ✅ Manifest file

### 4. Test Offline

**Option A: DevTools**
1. Open DevTools (F12)
2. Application tab → Service Workers
3. Check "Offline" box
4. Navigate to `/trip/[some-trip-id]`
5. Should load! ✅

**Option B: Network Tab**
1. Network tab → Throttle dropdown
2. Select "Offline"
3. Refresh page
4. Should still work! ✅

## 📊 What Changed

| File | Purpose |
|------|---------|
| `vercel.json` | Headers for service worker |
| `ServiceWorkerRegistration.tsx` | Explicit SW registration |
| `OfflineIndicator.tsx` | Shows offline/online status |
| `layout.tsx` | Added both components |
| `next.config.ts` | Enhanced PWA caching |
| `pwa-test.html` | Diagnostic page |

## 🔍 Quick Diagnostic

Run this in your browser console:

```javascript
navigator.serviceWorker.getRegistrations().then(r => {
  console.log('SW:', r.length > 0 ? '✅' : '❌');
});

caches.keys().then(k => {
  console.log('Caches:', k.length, k);
});
```

## ❓ Still Not Working?

1. **Check Vercel Build Logs**
   - Look for errors during build
   - Verify `sw.js` was generated

2. **Verify Files Exist**
   - Visit: `https://your-app.vercel.app/sw.js`
   - Visit: `https://your-app.vercel.app/manifest.json`
   - Both should return content, not 404

3. **Check Environment Variables**
   - Vercel dashboard → Settings → Environment Variables
   - All NEXT_PUBLIC_FIREBASE_* variables set?

4. **Try Hard Refresh**
   - Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - This clears old cache

5. **Read Full Guide**
   - See `OFFLINE_DEBUG_GUIDE.md` for comprehensive debugging

## 🎯 Expected Behavior

### When Online:
- App works normally
- No special indicators
- Service worker caching in background

### When Going Offline:
- Yellow warning banner: "You're offline..."
- Pages still load from cache
- IndexedDB still works
- Can view trips, activities, etc.

### When Back Online:
- Green success banner: "Back online!"
- Queued changes sync to Firestore
- Banner dismisses after a few seconds

## 📱 Mobile Testing

### iOS Safari:
1. Add to Home Screen
2. Open from home screen
3. Turn on Airplane Mode
4. App should still work

### Android Chrome:
1. Menu → Install App
2. Open installed app
3. Turn on Airplane Mode
4. App should still work

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| "SW registration failed" | Check HTTPS, check build logs |
| Pages don't load offline | Visit pages online first to cache them |
| Data missing offline | IndexedDB issue, check DatabaseProvider |
| Old version showing | Clear cache, hard refresh |

## 📞 Need Help?

Share these from your deployed app:
1. Screenshot: DevTools → Application → Service Workers
2. Screenshot: DevTools → Application → Cache Storage
3. Console output (any red errors)
4. URL of your Vercel deployment
