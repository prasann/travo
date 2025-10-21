// ========================================
// TRAVO SERVICE WORKER DEBUG SCRIPT
// ========================================
// Copy and paste this entire script into your browser console
// on your deployed Vercel site

console.log('🔍 Starting Service Worker Diagnostics...\n');

// 1. Check if we're in production
console.log('1️⃣ Environment Check:');
console.log('   NODE_ENV:', process?.env?.NODE_ENV || 'unknown (browser)');
console.log('   Location:', window.location.href);
console.log('   Protocol:', window.location.protocol);
console.log('   Is HTTPS or localhost?', window.location.protocol === 'https:' || window.location.hostname === 'localhost');

// 2. Check Service Worker support
console.log('\n2️⃣ Service Worker Support:');
console.log('   Supported?', 'serviceWorker' in navigator);

if (!('serviceWorker' in navigator)) {
  console.error('❌ Service Workers not supported in this browser!');
} else {
  // 3. Try to fetch sw.js
  console.log('\n3️⃣ Checking sw.js file:');
  fetch('/sw.js')
    .then(response => {
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
      console.log('   Content-Type:', response.headers.get('content-type'));
      console.log('   Service-Worker-Allowed:', response.headers.get('service-worker-allowed'));
      
      if (response.ok) {
        console.log('   ✅ sw.js file exists and is accessible');
        return response.text();
      } else {
        console.error('   ❌ sw.js file not found or not accessible');
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(text => {
      console.log('   File size:', text.length, 'bytes');
      console.log('   First 200 chars:', text.substring(0, 200));
    })
    .catch(error => {
      console.error('   ❌ Error fetching sw.js:', error);
    });

  // 4. Check manifest
  console.log('\n4️⃣ Checking manifest.json:');
  fetch('/manifest.json')
    .then(response => {
      console.log('   Status:', response.status);
      if (response.ok) {
        console.log('   ✅ manifest.json exists');
        return response.json();
      } else {
        console.error('   ❌ manifest.json not found');
        throw new Error(`HTTP ${response.status}`);
      }
    })
    .then(manifest => {
      console.log('   Name:', manifest.name);
      console.log('   Start URL:', manifest.start_url);
      console.log('   Icons:', manifest.icons?.length || 0);
    })
    .catch(error => {
      console.error('   ❌ Error fetching manifest:', error);
    });

  // 5. Check current registrations
  console.log('\n5️⃣ Current Service Worker Registrations:');
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('   Count:', registrations.length);
    if (registrations.length === 0) {
      console.error('   ❌ No service workers registered');
      console.log('   This means registration never succeeded or was cleared');
    } else {
      registrations.forEach((reg, i) => {
        console.log(`\n   Registration ${i + 1}:`);
        console.log('     Scope:', reg.scope);
        console.log('     Active:', reg.active?.state);
        console.log('     Installing:', reg.installing?.state);
        console.log('     Waiting:', reg.waiting?.state);
        console.log('     Update found:', reg.updatefound);
      });
    }
  });

  // 6. Check if ServiceWorkerRegistration component is working
  console.log('\n6️⃣ Component Check:');
  console.log('   Check if you see "Service Worker disabled in development" or registration messages above');
  
  // 7. Manual registration attempt
  console.log('\n7️⃣ Attempting manual registration now...');
  navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then(registration => {
      console.log('   ✅ REGISTRATION SUCCESSFUL!');
      console.log('   Scope:', registration.scope);
      console.log('   Active:', registration.active);
      console.log('   Installing:', registration.installing);
      console.log('   Waiting:', registration.waiting);
      
      // If nothing is active, wait for it
      if (!registration.active && registration.installing) {
        console.log('   ⏳ Service Worker is installing...');
        registration.installing.addEventListener('statechange', function() {
          console.log('   State changed to:', this.state);
        });
      }
    })
    .catch(error => {
      console.error('   ❌ REGISTRATION FAILED!');
      console.error('   Error type:', error.name);
      console.error('   Error message:', error.message);
      console.error('   Full error:', error);
      
      // Common error analysis
      if (error.message.includes('404')) {
        console.error('\n   💡 Fix: sw.js file is missing from your build');
        console.error('      - Check Vercel build logs');
        console.error('      - Ensure next-pwa is building the service worker');
        console.error('      - Try visiting https://your-app.vercel.app/sw.js directly');
      } else if (error.message.includes('bad-precaching-response')) {
        console.error('\n   💡 Fix: Service worker couldn\'t precache some files');
        console.error('      - Some URLs in the precache manifest returned errors');
        console.error('      - Check browser Network tab for 404s during SW install');
      } else if (error.message.includes('navigation-preload')) {
        console.error('\n   💡 Fix: Navigation preload feature issue');
        console.error('      - Try disabling navigationPreload in your SW config');
      } else if (error.message.includes('https')) {
        console.error('\n   💡 Fix: HTTPS required');
        console.error('      - Service Workers require HTTPS (or localhost)');
        console.error('      - Your site must be served over HTTPS');
      }
    });
}

// 8. Check manifest link in HTML
console.log('\n8️⃣ Checking HTML manifest link:');
const manifestLink = document.querySelector('link[rel="manifest"]');
if (manifestLink) {
  console.log('   ✅ Manifest link found:', manifestLink.href);
} else {
  console.error('   ❌ No manifest link in HTML <head>');
}

// 9. Check for Console Errors
console.log('\n9️⃣ Check Console:');
console.log('   Look above for any red errors that happened during page load');
console.log('   Common issues:');
console.log('   - "Failed to load resource: sw.js" = SW file missing');
console.log('   - "DOMException: Failed to register" = Registration blocked');
console.log('   - "SecurityError" = HTTPS or CORS issue');

console.log('\n✅ Diagnostics complete! Check the output above.\n');
console.log('📋 Next steps:');
console.log('   1. If sw.js is missing (404), check Vercel build logs');
console.log('   2. If registration fails, check the error message above');
console.log('   3. Try clearing all site data: DevTools → Application → Clear storage');
console.log('   4. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
