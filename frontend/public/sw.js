// Travo Service Worker
// Simple caching strategy for offline-first PWA with IndexedDB

// IMPORTANT: Change this version number when deploying updates
// This forces the service worker to update and clear old caches
const CACHE_VERSION = '2025-10-21-02'; // Format: YYYY-MM-DD-XX
const CACHE_NAME = `travo-v${CACHE_VERSION}`;
const OFFLINE_URL = '/';

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/travo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses for HTML pages, images, and static assets
        const url = new URL(event.request.url);
        const shouldCache = 
          url.origin === location.origin &&
          (
            event.request.destination === 'document' ||
            event.request.destination === 'image' ||
            event.request.url.includes('/_next/static/') ||
            event.request.url.includes('/_next/image/')
          );
        
        if (shouldCache) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // If network fails and no cache, return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
