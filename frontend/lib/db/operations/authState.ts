/**
 * Auth State Operations for IndexedDB
 * 
 * Manages cached authentication state for offline-first operation.
 * Allows app to start immediately with cached user data while Firebase
 * revalidates in the background.
 */

import { db } from '../schema';
import type { Result } from '../models';
import { wrapDatabaseOperation } from '../errors';
import type { AppUser } from '@/lib/firebase/auth';

const AUTH_STATE_ID = 'current';
const CACHE_DURATION = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

/**
 * Cached auth state structure
 */
export interface CachedAuthState {
  id: string;
  user: AppUser | null;
  lastVerified: number; // Timestamp when this was last verified with Firebase
}

/**
 * Get cached authentication state from IndexedDB
 * Returns null if no cached state exists or if cache is expired
 */
export async function getCachedAuthState(): Promise<Result<AppUser | null>> {
  return wrapDatabaseOperation(async () => {
    const cached = await db.authState.get(AUTH_STATE_ID);
    
    if (!cached) {
      return null;
    }
    
    const now = Date.now();
    const age = now - cached.lastVerified;
    
    // Check if cache is expired (older than CACHE_DURATION)
    if (age > CACHE_DURATION) {
      await db.authState.delete(AUTH_STATE_ID);
      return null;
    }
    
    return cached.user;
  });
}

/**
 * Save authentication state to IndexedDB
 * This is called whenever Firebase auth state changes
 */
export async function saveCachedAuthState(user: AppUser | null): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const authState: CachedAuthState = {
      id: AUTH_STATE_ID,
      user,
      lastVerified: Date.now(),
    };
    
    await db.authState.put(authState);
  });
}

/**
 * Clear cached authentication state
 * Called on explicit logout
 */
export async function clearCachedAuthState(): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    await db.authState.delete(AUTH_STATE_ID);
  });
}

/**
 * Check if cached auth state exists and is valid
 */
export async function hasCachedAuth(): Promise<boolean> {
  try {
    const cached = await db.authState.get(AUTH_STATE_ID);
    if (!cached) return false;
    
    const now = Date.now();
    const age = now - cached.lastVerified;
    return age <= CACHE_DURATION;
  } catch (error) {
    console.error('[Auth Cache] Error checking cached auth:', error);
    return false;
  }
}
