'use client';

import { TripList } from '@/components/TripList';
import { getAllTrips, isOk, unwrap, unwrapErr } from '@/lib/db';
import { useEffect, useState } from 'react';
import type { Trip } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      // Only load trips if user is authenticated
      if (!user) {
        setIsLoading(false);
        return;
      }

      const result = await getAllTrips();
      
      if (isOk(result)) {
        setTrips(unwrap(result));
      } else {
        setError(unwrapErr(result).message);
      }
      
      setIsLoading(false);
    }

    if (!authLoading) {
      loadTrips();
    }
  }, [user, authLoading]);

  // Show loading state during auth initialization
  if (authLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="text-lg">Initializing...</p>
        </div>
      </main>
    );
  }

  // Show login UI if not authenticated
  if (!user) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-3xl mb-4">Welcome to Travo</h2>
            <p className="mb-6">Your simple and elegant trip planner</p>
            <div className="card-actions">
              <LoginButton />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show loading state while trips are loading
  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </main>
    );
  }

  // Show error state if trips failed to load
  if (error) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>Error loading trips: {error}</span>
        </div>
      </main>
    );
  }

  // Show trip list for authenticated users
  return (
    <main className="min-h-screen bg-base-200">
      <TripList trips={trips} />
    </main>
  );
}
