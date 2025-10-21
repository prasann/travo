'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Register service worker on page load
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', {
            scope: '/',
            updateViaCache: 'none',
          })
          .then((registration) => {
            console.log('Service Worker registered successfully:', registration.scope);

            // Check for updates on page load
            registration.update();

            // Check for updates periodically (every hour)
            setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
