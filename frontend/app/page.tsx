'use client';

import { TripList } from '@/components/TripList';
import { getAllTrips } from '@/lib/db';
import { useEffect, useState } from 'react';
import type { Trip } from '@/lib/db';

export default function HomePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrips() {
      const result = await getAllTrips();
      
      if (result.success) {
        setTrips(result.data);
      } else {
        setError(result.error.message);
      }
      
      setIsLoading(false);
    }

    loadTrips();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>Error loading trips: {error}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base-200">
      <TripList trips={trips} />
    </main>
  );
}
