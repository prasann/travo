/**
 * Firebase Configuration Module
 * 
 * This module provides backward-compatible exports for Firebase services.
 * The actual implementation uses the unified Firebase class for better
 * organization and lazy initialization.
 * 
 * @deprecated Prefer importing from './Firebase' directly for new code
 */

'use client';

import Firebase from './Firebase';

/**
 * Firebase Authentication instance
 */
export const auth = Firebase.getInstance().auth;

/**
 * Firestore Database instance
 */
export const db = Firebase.getInstance().firestore;

/**
 * Firebase app instance (for advanced use cases)
 */
export const firebaseApp = Firebase.getInstance().app;
