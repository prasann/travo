// Travo Service Worker
// Simple caching strategy for offline-first PWA with IndexedDB

// IMPORTANT: Change this version number when deploying updates
// This forces the service worker to update and clear old caches
const CACHE_VERSION = '2025-10-24-04'; // Format: YYYY-MM-DD-XX
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

// Fetch event - network-first for documents/scripts, cache-first for images
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);
  const isDocument = event.request.destination === 'document';
  const isScript = event.request.destination === 'script';
  const isStyle = event.request.destination === 'style';
  const isImage = event.request.destination === 'image';

  // Network-first strategy for HTML/JS/CSS (always get fresh content)
  if (isDocument || isScript || isStyle || url.pathname.includes('/_next/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for documents
            if (isDocument) {
              return caches.match(OFFLINE_URL);
            }
          });
        })
    );
    return;
  }

  // Cache-first strategy for images (they rarely change)
  if (isImage) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // For everything else, try network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
