'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { AppUser, toAppUser } from '@/lib/firebase/auth';

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
      (firebaseUser) => {
        try {
          if (firebaseUser) {
            // User is signed in
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
