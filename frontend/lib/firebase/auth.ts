import {
  signInWithPopup,
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
 * Sign in with Google using popup
 * @returns Promise with user credential
 * @throws Error if sign-in fails
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
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
