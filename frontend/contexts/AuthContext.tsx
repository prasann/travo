'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AppUser, toAppUser, signOut } from '@/lib/firebase/auth';
import { isEmailAllowed, isAllowlistConfigured } from '@/lib/auth/allowlist';

/**
 * Auth context state type
 */
interface AuthContextType {
  user: AppUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Auth context with default values
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
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
 * @param props - Component props
 * @returns Provider component wrapping children
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for redirect result first (in case user was redirected back)
    import('@/lib/firebase/auth').then(({ checkRedirectResult }) => {
      checkRedirectResult().catch((err) => {
        console.error('Redirect result error:', err);
        // Don't set error state for redirect failures, just log them
      });
    });

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (firebaseUser) {
            // Check if allowlist is configured
            if (isAllowlistConfigured()) {
              // Check if user's email is in the allowlist
              const userEmail = firebaseUser.email;
              
              if (!isEmailAllowed(userEmail)) {
                console.warn('🚫 Unauthorized email attempted sign in:', userEmail);
                
                // Sign out the user immediately
                await signOut();
                
                // Set error state
                setError(new Error(
                  'Access denied. Your email is not authorized to use this application. ' +
                  'Please contact the administrator for access.'
                ));
                setFirebaseUser(null);
                setUser(null);
                setLoading(false);
                return;
              }
              
              console.log('✅ Authorized user signed in:', userEmail);
            } else {
              console.warn('⚠️ Email allowlist not configured - all users can access the app');
            }
            
            // User is signed in and authorized
            setFirebaseUser(firebaseUser);
            setUser(toAppUser(firebaseUser));
          } else {
            // User is signed out
            setFirebaseUser(null);
            setUser(null);
          }
          setError(null);
        } catch (err) {
          console.error('Error in auth state change:', err);
          setError(err instanceof Error ? err : new Error('Unknown auth error'));
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        // Handle errors from onAuthStateChanged
        console.error('Auth state change error:', err);
        setError(err instanceof Error ? err : new Error('Auth state error'));
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
