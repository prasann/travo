'use client';

import { useList } from "@refinedev/core";
import { TripCard } from '@/components/TripCard';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/LoginButton';
import { useSyncStatus } from '@/components/SyncProvider';
import type { Trip } from '@/lib/db';
import { useState, useRef, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';

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
  const { pullNow, isPulling } = useSyncStatus();
  
  // Pull-to-refresh state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollContainer = useRef<HTMLDivElement>(null);
  const PULL_THRESHOLD = 80; // Distance to trigger refresh
  
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

  const { data, isLoading, isError, error, refetch } = query;

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainer.current && scrollContainer.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && scrollContainer.current && scrollContainer.current.scrollTop === 0) {
      setPullDistance(Math.min(diff, PULL_THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        // Trigger pull sync from Firestore
        await pullNow();
        // Also refetch the list to update UI
        await refetch();
      } catch (error) {
        console.error('Pull-to-refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    startY.current = 0;
  };

  // Reset pull state when pulling stops
  useEffect(() => {
    if (!isPulling && isRefreshing) {
      setIsRefreshing(false);
    }
  }, [isPulling, isRefreshing]);

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
  
  const isPullingOrRefreshing = isPulling || isRefreshing || pullDistance >= PULL_THRESHOLD;
  const pullProgress = Math.min((pullDistance / PULL_THRESHOLD) * 100, 100);
  
  return (
    <main className="min-h-screen bg-base-200">
      <Navigation title="Travo" />
      
      {/* Pull-to-refresh container */}
      <div
        ref={scrollContainer}
        className="page-container overflow-y-auto relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'pan-y' }}
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div 
            className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all"
            style={{ 
              height: `${pullDistance}px`,
              opacity: pullProgress / 100,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <ArrowDown 
                className={`w-6 h-6 text-primary transition-transform ${
                  isPullingOrRefreshing ? 'animate-bounce' : ''
                } ${pullDistance >= PULL_THRESHOLD ? 'rotate-180' : ''}`}
              />
              <span className="text-sm text-base-content/70">
                {pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div style={{ paddingTop: pullDistance > 0 ? `${pullDistance}px` : '0' }}>
          <h1 className="text-4xl font-bold mb-8">My Trips</h1>
          
          {isPullingOrRefreshing && (
            <div className="alert alert-info mb-4">
              <div className="loading loading-spinner loading-sm"></div>
              <span>Refreshing trips from cloud...</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
