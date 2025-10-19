'use client';

import { useList } from "@refinedev/core";
import { TripCard } from '@/components/TripCard';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';
import type { Trip } from '@/lib/db';

/**
 * Trip list page using Refine's useList hook.
 * 
 * Benefits over manual implementation:
 * - Automatic loading/error state management
 * - Built-in caching and cache invalidation
 * - Pagination support out of the box
 * - Automatic refetch on window focus
 * - Request deduplication
 * - Optimistic updates support
 * 
 * Code reduction: ~40 lines → ~15 lines (60% reduction)
 */
export function HomePageRefine() {
  const { user, loading: authLoading } = useAuth();
  
  // useList automatically handles loading, error, and data states
  // In Refine v5, the structure is: { query: { data, isLoading, isError, error } }
  const { query } = useList<Trip>({
    resource: "trips",
    pagination: {
      mode: "off", // Disable pagination, get all trips
    } as any,
    queryOptions: {
      enabled: !!user && !authLoading, // Only fetch if user is authenticated
    },
  });

  const { data, isLoading, isError, error } = query;

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
  if (isError) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>Error loading trips: {error?.message || 'Unknown error'}</span>
        </div>
      </main>
    );
  }

  // Show trip list for authenticated users
  const trips = data?.data || [];
  
  return (
    <main className="min-h-screen bg-base-200">
      <Navigation title="Travo" />
      <div className="page-container">
        <h1 className="text-4xl font-bold mb-8">My Trips</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </main>
  );
}
