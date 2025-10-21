# Offline Mode Debugging Guide

## Current Status
- **Framework**: Next.js 15.5.4 with next-pwa 5.6.0
- **Deployment**: Vercel
- **Local Storage**: IndexedDB via Dexie.js (working)
- **Issue**: PWA offline mode not working in production

## Debugging Steps

### 1. Verify Service Worker Registration in Production

Open your deployed app and check the browser console:

```javascript
// In Chrome DevTools Console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
  registrations.forEach(reg => console.log(reg.scope, reg.active));
});
```

**Expected**: Should show a registered service worker at your domain scope
**If not**: Service worker failed to register

### 2. Check Service Worker File

Visit: `https://your-app.vercel.app/sw.js`

**Expected**: Should return the service worker JavaScript file
**If 404**: Service worker not built/deployed properly

### 3. Check Manifest File

Visit: `https://your-app.vercel.app/manifest.json`

**Expected**: Should return your PWA manifest
**If 404**: Manifest not deployed

### 4. Inspect Application in Chrome DevTools

1. Open DevTools → Application tab
2. Check **Service Workers** section:
   - Should show "activated and running"
   - Status should be green
3. Check **Manifest** section:
   - Should show your app details
   - Icons should load
4. Check **Cache Storage**:
   - Should show caches like "start-url", "pages", "static-assets"
   - Click each to see cached resources

### 5. Test Offline Mode

1. With DevTools open, go to Application → Service Workers
2. Check "Offline" checkbox
3. Reload the page
4. Or: Network tab → Change throttle to "Offline"

**Expected**: App should load from cache
**If not**: Caching strategy issue

### 6. Check Network Requests

1. Network tab → Filter by "All"
2. Look for requests to your API routes
3. Check if they're coming from service worker (shows "Service Worker" in Size column)

## Common Issues & Fixes

### Issue 1: Service Worker Not Registering

**Symptom**: No service worker in DevTools
**Cause**: Vercel might be stripping files or next-pwa not building correctly

**Fix**: Add explicit service worker registration

### Issue 2: HTTPS Required

**Symptom**: Service worker fails on non-localhost
**Cause**: Service workers require HTTPS (except localhost)

**Check**: Ensure Vercel deployment uses HTTPS (it should by default)

### Issue 3: Trailing Slash Issues

**Symptom**: Routes work online but not offline
**Cause**: Your config has `trailingSlash: true` but routes might not match

**Check**: Ensure all cached URLs match your routing pattern

### Issue 4: Dynamic Routes Not Cached

**Symptom**: Main page works offline, but `/trip/[tripId]` routes don't
**Cause**: Dynamic routes need runtime caching strategy

**Current Strategy**: `NetworkFirst` with 10s timeout - should work but might need adjustment

### Issue 5: API Routes Blocking

**Symptom**: App loads but shows errors
**Cause**: API calls failing offline without proper fallback

**Current**: `/api/*` uses NetworkFirst - Firebase calls might be failing

## Production-Specific Checks

### Check Vercel Build Logs

1. Go to Vercel dashboard → Your deployment
2. Check build logs for:
   - `next-pwa` output
   - Service worker generation
   - Any warnings about PWA

### Check Vercel Headers

Vercel might need specific headers for PWA. Check if you need a `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        }
      ]
    }
  ]
}
```

### Check Environment Variables

In Vercel dashboard, ensure all Firebase env vars are set:
- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- etc.

## Testing Methodology

### Local Production Build Test

Before deploying, test locally:

```bash
cd frontend
npm run build
npm start  # Not npm run dev!
```

Then check if offline mode works on http://localhost:3000

### Vercel Preview Deployment Test

1. Push to a feature branch
2. Wait for Vercel preview deployment
3. Test offline mode on preview URL
4. Check DevTools thoroughly

## Quick Diagnostic Script

Run this in your browser console on the deployed app:

```javascript
async function diagnosePWA() {
  console.log('=== PWA Diagnostics ===');
  
  // Check Service Worker
  const registrations = await navigator.serviceWorker.getRegistrations();
  console.log('1. Service Workers:', registrations.length > 0 ? '✅' : '❌');
  registrations.forEach(reg => {
    console.log('   Scope:', reg.scope);
    console.log('   State:', reg.active?.state);
  });
  
  // Check Manifest
  const manifestLink = document.querySelector('link[rel="manifest"]');
  console.log('2. Manifest Link:', manifestLink ? '✅' : '❌', manifestLink?.href);
  
  // Check Cache Storage
  const cacheNames = await caches.keys();
  console.log('3. Caches:', cacheNames.length > 0 ? '✅' : '❌');
  cacheNames.forEach(name => console.log('   -', name));
  
  // Check if we can go offline
  console.log('4. Online Status:', navigator.onLine ? 'Online ✅' : 'Offline ⚠️');
  
  // Check IndexedDB
  const dbs = await window.indexedDB.databases();
  console.log('5. IndexedDB:', dbs.length > 0 ? '✅' : '❌');
  dbs.forEach(db => console.log('   -', db.name));
  
  console.log('\n=== Next Steps ===');
  if (registrations.length === 0) {
    console.log('❌ No service worker registered. Check build output and deployment.');
  } else if (cacheNames.length === 0) {
    console.log('⚠️ Service worker registered but no caches. Check network tab for SW errors.');
  } else {
    console.log('✅ PWA basics look good. Try going offline (DevTools → Application → Service Workers → Offline)');
  }
}

diagnosePWA();
```

## Recommended Fixes

Based on common issues, I recommend:

1. **Add explicit SW registration** in the app
2. **Add vercel.json** with proper headers
3. **Add SW update mechanism** for users
4. **Improve error handling** for offline API calls

See the following files for implementations.
