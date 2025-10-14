import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

/**
 * Custom user type for application use
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Google Auth Provider instance
 */
const googleProvider = new GoogleAuthProvider();

// Configure provider for maximum token validity
googleProvider.setCustomParameters({
  prompt: 'select_account', // Allow user to select account
});

/**
 * Sign in with Google using popup (preferred method)
 * Falls back to redirect if popup is blocked
 * @returns Promise with user credential
 * @throws Error if sign-in fails
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    console.log('🔐 Attempting Google sign in with popup...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Sign in successful');
    return result;
  } catch (error: any) {
    console.error('❌ Error signing in with Google:', error);
    
    // If popup was blocked, try redirect method
    if (error?.code === 'auth/popup-blocked') {
      console.log('🔄 Popup blocked, trying redirect method...');
      await signInWithRedirect(auth, googleProvider);
      // Redirect happens, so this promise never resolves
      return new Promise(() => {}); // Keep promise pending
    }
    
    throw error;
  }
}

/**
 * Check for redirect result after page loads
 * Call this on app initialization
 */
export async function checkRedirectResult(): Promise<UserCredential | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Redirect sign in successful');
    }
    return result;
  } catch (error) {
    console.error('❌ Error getting redirect result:', error);
    throw error;
  }
}

/**
 * Sign out current user
 * @throws Error if sign-out fails
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Convert Firebase User to AppUser
 * @param user Firebase User object
 * @returns AppUser object with essential fields
 */
export function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

/**
 * Check if user is authenticated
 * @returns true if user is signed in, false otherwise
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}
