'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Firebase configuration from environment variables
 * Using 'use client' directive to ensure this runs only on client side
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

/**
 * Validates that all required Firebase configuration values are present
 */
function validateFirebaseConfig(): void {
  const requiredFields = [
    { key: 'apiKey', value: firebaseConfig.apiKey },
    { key: 'authDomain', value: firebaseConfig.authDomain },
    { key: 'projectId', value: firebaseConfig.projectId },
    { key: 'storageBucket', value: firebaseConfig.storageBucket },
    { key: 'messagingSenderId', value: firebaseConfig.messagingSenderId },
    { key: 'appId', value: firebaseConfig.appId },
  ];

  const missingFields = requiredFields.filter(
    field => !field.value || field.value === '' || field.value === 'undefined'
  );

  if (missingFields.length > 0) {
    const missingKeys = missingFields.map(f => f.key);
    console.error('Missing Firebase configuration fields:', missingKeys);
    console.error('Current config:', firebaseConfig);
    console.error('\n⚠️  Firebase Setup Required:');
    console.error('1. Ensure frontend/.env.local exists');
    console.error('2. Add all NEXT_PUBLIC_FIREBASE_* variables (without quotes)');
    console.error('3. Restart the dev server completely (kill process and restart)');
    console.error('4. Clear browser cache or try incognito mode\n');
    
    throw new Error(
      `Missing required Firebase configuration: ${missingKeys.join(', ')}\n` +
      'Check the console for setup instructions.'
    );
  }
}

// Validate configuration before initializing
validateFirebaseConfig();

/**
 * Initialize Firebase app (singleton pattern)
 * This only runs on client side due to 'use client' directive
 */
let app: FirebaseApp;
if (getApps().length === 0) {
  console.log('🔥 Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
} else {
  console.log('♻️  Using existing Firebase app');
  app = getApps()[0];
}

/**
 * Firebase Authentication instance
 */
export const auth: Auth = getAuth(app);

/**
 * Firestore Database instance
 */
export const db: Firestore = getFirestore(app);

/**
 * Firebase app instance (for advanced use cases)
 */
export const firebaseApp: FirebaseApp = app;
