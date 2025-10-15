'use client';

/**
 * Database Provider for Travo
 * 
 * Feature: 005-let-s-introduce (Enhanced Model)
 * Feature: Firebase Integration (Phase 3 - Pull Sync)
 * Date: 2025-10-14
 * 
 * Initializes IndexedDB database on client-side app startup.
 * Waits for auth state before initializing to support Firestore sync.
 */

import { useEffect, useState } from 'react';
import { initializeDatabase, isOk, unwrapErr } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { isEmailAllowed, isAllowlistConfigured } from '@/lib/auth/allowlist';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before initializing database
    if (authLoading) {
      console.log('[DatabaseProvider] Waiting for auth...');
      return;
    }

    async function init() {
      console.log('[DatabaseProvider] Initializing database...');
      console.log('[DatabaseProvider] User:', user?.email || 'not authenticated');
      
      // SECURITY: Check allowlist before downloading any data
      if (user?.email && isAllowlistConfigured()) {
        if (!isEmailAllowed(user.email)) {
          console.warn('[DatabaseProvider] 🚫 User not in allowlist, skipping data sync');
          // Don't initialize database with user email - this prevents Firestore sync
          // The AuthContext will handle signing the user out
          return;
        }
      }
      
      // Pass user email to enable Firestore sync if authenticated and authorized
      const userEmail = user?.email || undefined;
      const result = await initializeDatabase(userEmail);
      
      if (isOk(result)) {
        console.log('[DatabaseProvider] ✓ Database initialized successfully');
        setIsInitialized(true);
      } else {
        const error = unwrapErr(result);
        console.error('[DatabaseProvider] ✗ Database initialization failed:', error);
        setError(error.message);
      }
    }

    init();
  }, [user, authLoading]);

  // Show loading state while initializing
  if (!isInitialized && !error) {
    const loadingMessage = authLoading 
      ? 'Checking authentication...'
      : user 
        ? 'Syncing your trips...'
        : 'Loading app...';
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold">Database Error</h3>
              <div className="text-sm">{error}</div>
            </div>
          </div>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render children once initialized
  return <>{children}</>;
}
