/**
 * Client-side Firebase configuration
 * This file explicitly exports the config to ensure it's available in the browser
 */

export const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
} as const;

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('🔍 Client Config Loaded:', {
    hasApiKey: !!clientFirebaseConfig.apiKey,
    hasAuthDomain: !!clientFirebaseConfig.authDomain,
    hasProjectId: !!clientFirebaseConfig.projectId,
    projectId: clientFirebaseConfig.projectId,
  });
}
