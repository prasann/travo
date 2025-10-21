import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  },
};

export default withPWA({
  dest: 'public',
  register: false, // We register manually in ServiceWorkerRegistration component
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: ['app-build-manifest.json'], // Exclude build manifest that may not be deployed
  runtimeCaching: [
    // Cache the app shell for all page navigations
    // This allows the React app to boot offline and read from IndexedDB
    {
      urlPattern: ({ request, url }: any) => {
        const isSameOrigin = url.origin === self.location.origin;
        const isNavigationRequest = request.mode === 'navigate';
        const isApiRoute = url.pathname.startsWith('/api/');
        const isNextData = url.pathname.startsWith('/_next/data/');
        const isStatic = url.pathname.startsWith('/_next/static/');
        
        // Cache HTML page requests (but not API or data routes)
        return isSameOrigin && isNavigationRequest && !isApiRoute && !isNextData && !isStatic;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        networkTimeoutSeconds: 3, // Fast timeout for offline
      },
    },
    // Cache Firestore API calls
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'firestore-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
    // Cache other Google APIs
    {
      urlPattern: /^https:\/\/.*\.googleapis\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'google-apis-cache',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
})(nextConfig);
