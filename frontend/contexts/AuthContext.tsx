'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AppUser, toAppUser, signOut } from '@/lib/firebase/auth';
import { isEmailAllowed, isAllowlistConfigured } from '@/lib/auth/allowlist';
import { getCachedAuthState, saveCachedAuthState, clearCachedAuthState } from '@/lib/db/operations/authState';
import { isOk, unwrap } from '@/lib/db/resultHelpers';

/**
 * Auth context state type
 */
interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: Error | null;
  isOffline: boolean; // New: indicates if using cached auth
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  isOffline: false,
});

/**
 * Props for AuthProvider component
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides it to child components
 * 
 * OFFLINE-FIRST ARCHITECTURE:
 * 1. Immediately loads cached auth from IndexedDB (non-blocking)
 * 2. App can start and display data while Firebase verifies in background
 * 3. Firebase auth state syncs and updates cache when online
 * 
 * @param props - Component props
 * @returns Provider component wrapping children
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [hasCachedAuth, setHasCachedAuth] = useState<boolean>(false);

  useEffect(() => {
    // STEP 1: Load cached auth immediately (non-blocking)
    (async () => {
      try {
        // Ensure database is open before reading auth cache
        const { db } = await import('@/lib/db/schema');
        if (!db.isOpen()) {
          await db.open();
        }
        
        const cachedResult = await getCachedAuthState();
        if (isOk(cachedResult)) {
          const cachedUser = unwrap(cachedResult);
          if (cachedUser) {
            setUser(cachedUser);
            setIsOffline(true);
            setHasCachedAuth(true);
            setLoading(false); // App can start immediately!
          }
        }
      } catch (err) {
        console.error('[Auth] Failed to load cached auth:', err);
        // Continue with Firebase auth even if cache fails
      }
    })();
    
    // STEP 2: Check for redirect result (in case user was redirected back)
    import('@/lib/firebase/auth').then(({ checkRedirectResult }) => {
      checkRedirectResult().catch(() => {
        // Silently ignore errors - likely offline or network issues
      });
    });

    // STEP 3: Subscribe to Firebase auth state changes (background verification)
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Check allowlist - deny access if not configured OR if email not in list
            const userEmail = firebaseUser.email;
            
            if (!isAllowlistConfigured()) {
              console.error('🚫 Email allowlist not configured - denying access');
              
              // Sign out the user immediately
              await signOut();
              
              // Clear cached auth
              await clearCachedAuthState();
              
              // Set error state
              setError(new Error(
                'Access denied. Application is not configured properly. ' +
                'Please contact the administrator.'
              ));
              setFirebaseUser(null);
              setUser(null);
              setIsOffline(false);
              setLoading(false);
              return;
            }
            
            if (!isEmailAllowed(userEmail)) {
              console.warn('🚫 Unauthorized email attempted sign in:', userEmail);
              
              // Sign out the user immediately
              await signOut();
              
              // Clear cached auth
              await clearCachedAuthState();
              
              // Set error state
              setError(new Error(
                'Access denied. Your email is not authorized to use this application. ' +
                'Please contact the administrator for access.'
              ));
              setFirebaseUser(null);
              setUser(null);
              setIsOffline(false);
              setLoading(false);
              return;
            }
            
            // User is signed in and authorized
            const appUser = toAppUser(firebaseUser);
            setFirebaseUser(firebaseUser);
            setUser(appUser);
            setIsOffline(false); // We're online and verified
            setHasCachedAuth(false); // No longer using cache
            
            // Cache the verified auth state for offline use
            await saveCachedAuthState(appUser);
          } else {
            // Firebase says user is signed out
            // Only clear local state if we don't have cached auth
            if (!hasCachedAuth) {
              setFirebaseUser(null);
              setUser(null);
              setIsOffline(false);
              
              // Clear cached auth on sign out
              await clearCachedAuthState();
            }
            // If we have cached auth, keep it (we're probably offline)
          }
          setError(null);
        } catch (err) {
          console.error('Error in auth state change:', err);
          // Don't set error if we have cached auth and are offline
          if (!isOffline) {
            setError(err instanceof Error ? err : new Error('Unknown auth error'));
          }
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        // Handle errors from onAuthStateChanged
        console.error('Auth state change error:', err);
        // Don't set error if we have cached auth
        if (!isOffline) {
          setError(err instanceof Error ? err : new Error('Auth state error'));
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    isOffline,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 * 
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
