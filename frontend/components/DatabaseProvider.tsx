'use client';

/**
 * Database Provider for Travo
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * Initializes IndexedDB database on client-side app startup
 */

import { useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib/db';

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      console.log('[DatabaseProvider] Initializing database...');
      
      const result = await initializeDatabase();
      
      if (result.success) {
        console.log('[DatabaseProvider] ✓ Database initialized successfully');
        setIsInitialized(true);
      } else {
        console.error('[DatabaseProvider] ✗ Database initialization failed:', result.error);
        setError(result.error.message);
      }
    }

    init();
  }, []);

  // Show loading state while initializing
  if (!isInitialized && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4 text-base-content/70">Loading trip data...</p>
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
