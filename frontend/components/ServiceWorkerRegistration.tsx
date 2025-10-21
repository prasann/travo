'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Wait for page to load before registering
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('✅ Service Worker registered successfully');
            console.log('   Scope:', registration.scope);
            console.log('   Active:', registration.active?.state);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('🔄 Service Worker update found');
              
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  console.log('   New SW state:', newWorker.state);
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('✨ New Service Worker installed');
                    // Optionally notify user
                    if (confirm('New version available! Reload to update?')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((error) => {
            console.error('❌ Service Worker registration failed');
            console.error('   Error:', error);
            console.error('   This might be due to:');
            console.error('   - Missing sw.js file');
            console.error('   - HTTPS not enabled');
            console.error('   - Browser doesn\'t support Service Workers');
          });

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Service Worker controller changed - reloading page');
          window.location.reload();
        });
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('ℹ️ Service Worker disabled in development');
      } else if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported in this browser');
      }
    }
  }, []);

  return null;
}
