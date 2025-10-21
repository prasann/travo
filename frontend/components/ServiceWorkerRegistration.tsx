'use client';

import { useEffect, useState } from 'react';

export function ServiceWorkerRegistration() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

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

            // Listen for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    console.log('New service worker available!');
                    setWaitingWorker(newWorker);
                    setShowUpdatePrompt(true);
                  }
                });
              }
            });

            // Check for updates immediately
            registration.update();

            // Check for updates when page regains focus
            window.addEventListener('focus', () => {
              registration.update();
            });

            // Check for updates periodically (every 5 minutes)
            setInterval(() => {
              registration.update();
            }, 5 * 60 * 1000);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New service worker activated, reloading page...');
          window.location.reload();
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="toast toast-top toast-center z-50">
      <div className="alert alert-info shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>A new version of Travo is available!</span>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-sm" onClick={handleDismiss}>Later</button>
          <button className="btn btn-sm btn-primary" onClick={handleUpdate}>Update Now</button>
        </div>
      </div>
    </div>
  );
}
