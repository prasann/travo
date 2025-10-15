'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * Firebase configuration interface
 */
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Unified Firebase service with lazy initialization
 * Singleton pattern for consistent access across the app
 */
export class Firebase {
  private static instance: Firebase | null = null;
  private _app: FirebaseApp | null = null;
  private _auth: Auth | null = null;
  private _firestore: Firestore | null = null;
  private _googleProvider: GoogleAuthProvider | null = null;
  private config: FirebaseConfig;

  private constructor(config: FirebaseConfig) {
    this.config = config;
  }

  /**
   * Get or create the Firebase singleton instance
   * @throws Error if Firebase configuration is missing or invalid
   */
  public static getInstance(): Firebase {
    if (!Firebase.instance) {
      const config = Firebase.loadConfig();
      Firebase.validateConfig(config);
      Firebase.instance = new Firebase(config);
    }
    return Firebase.instance;
  }

  /**
   * Load Firebase configuration from environment variables
   */
  private static loadConfig(): FirebaseConfig {
    return {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    };
  }

  /**
   * Validate that all required Firebase configuration values are present
   * @throws Error with detailed setup instructions if config is invalid
   */
  private static validateConfig(config: FirebaseConfig): void {
    const requiredFields: Array<{ key: keyof FirebaseConfig; value: string }> = [
      { key: 'apiKey', value: config.apiKey },
      { key: 'authDomain', value: config.authDomain },
      { key: 'projectId', value: config.projectId },
      { key: 'storageBucket', value: config.storageBucket },
      { key: 'messagingSenderId', value: config.messagingSenderId },
      { key: 'appId', value: config.appId },
    ];

    const missingFields = requiredFields.filter(
      field => !field.value || field.value === '' || field.value === 'undefined'
    );

    if (missingFields.length > 0) {
      const missingKeys = missingFields.map(f => f.key);
      console.error('❌ Missing Firebase configuration fields:', missingKeys);
      console.error('Current config:', config);
      console.error('\n⚠️  Firebase Setup Required:');
      console.error('1. Ensure frontend/.env.local exists');
      console.error('2. Add all NEXT_PUBLIC_FIREBASE_* variables (without quotes)');
      console.error('3. Restart the dev server completely (kill process and restart)');
      console.error('4. Clear browser cache or try incognito mode\n');
      
      throw new Error(
        `Firebase initialization failed: Missing required configuration fields: ${missingKeys.join(', ')}\n` +
        'Check the console for detailed setup instructions.'
      );
    }
  }

  /**
   * Get Firebase app instance (lazy initialization)
   */
  public get app(): FirebaseApp {
    if (!this._app) {
      if (getApps().length === 0) {
        console.log('🔥 Initializing Firebase app...');
        this._app = initializeApp(this.config);
      } else {
        console.log('♻️  Using existing Firebase app');
        this._app = getApps()[0];
      }
    }
    return this._app;
  }

  /**
   * Get Firebase Authentication instance (lazy initialization)
   */
  public get auth(): Auth {
    if (!this._auth) {
      this._auth = getAuth(this.app);
    }
    return this._auth;
  }

  /**
   * Get Firestore Database instance (lazy initialization)
   */
  public get firestore(): Firestore {
    if (!this._firestore) {
      this._firestore = getFirestoreInstance(this.app);
    }
    return this._firestore;
  }

  /**
   * Get Google Auth Provider instance (lazy initialization)
   * Pre-configured with optimal settings
   */
  public get googleProvider(): GoogleAuthProvider {
    if (!this._googleProvider) {
      this._googleProvider = new GoogleAuthProvider();
      this._googleProvider.setCustomParameters({
        prompt: 'select_account', // Allow user to select account
      });
    }
    return this._googleProvider;
  }

  /**
   * Check if Firebase is properly initialized
   */
  public isInitialized(): boolean {
    return this._app !== null;
  }

  /**
   * Reset the singleton instance (useful for testing)
   * @internal
   */
  public static resetInstance(): void {
    Firebase.instance = null;
  }
}

// Export convenience getters for backward compatibility and cleaner imports
export const getFirebaseAuth = () => Firebase.getInstance().auth;
export const getFirestoreDb = () => Firebase.getInstance().firestore;
export const getFirebaseApp = () => Firebase.getInstance().app;
export const getGoogleProvider = () => Firebase.getInstance().googleProvider;

// Export singleton instance for direct access
export default Firebase;
