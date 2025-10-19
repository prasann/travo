'use client';

import { notFound } from 'next/navigation'
import { useShow } from '@refinedev/core'
import { Navigation } from '@/components/Navigation'
import { TripTimeline } from '@/components/TripTimeline'
import { RestaurantList } from '@/components/RestaurantList'
import TripMapView from '@/components/TripMapView'
import { formatDate } from '@/lib/dateTime'
import { useEffect, useState } from 'react'
import type { TripWithRelations } from '@/lib/db'

type ViewMode = 'timeline' | 'map';

interface TripPageProps {
  params: Promise<{
    tripId: string
  }>
}

/**
 * Trip detail page using Refine's useShow hook.
 * 
 * Benefits:
 * - Automatic cache hit from list page (instant load)
 * - Background refetch for fresh data
 * - Simplified state management
 * - Request deduplication
 * 
 * Code reduction: ~50 lines → ~25 lines (50% reduction)
 */
export default function TripPage({ params }: TripPageProps) {
  const [tripId, setTripId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  useEffect(() => {
    params.then(p => {
      setTripId(p.tripId);
    });
  }, [params]);

  // useShow automatically handles loading, error, and data states
  // Cache hit from list page = instant load!
  const { query } = useShow<TripWithRelations>({
    resource: "trips",
    id: tripId || "",
    queryOptions: {
      enabled: !!tripId, // Only fetch when tripId is available
    },
  });

  const { data, isLoading, isError } = query;
  const trip = data?.data;

  // Show loading while waiting for params or query
  if (!tripId || isLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </main>
    );
  }

  if (isError || !trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-base-200">
      <Navigation title="Travo" showBackButton backHref="/" />
      <div className="p-4 sm:p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Trip Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-start mb-1">
              <h1 className="text-2xl sm:text-4xl font-bold">{trip.name}</h1>
              <a href={`/trip/${tripId}/edit`} className="btn btn-primary btn-sm">
                Edit Trip
              </a>
            </div>
          <p className="text-base-content/60 text-sm sm:text-base">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </p>
          {trip.description && (
            <p className="mt-2 sm:mt-3 text-sm sm:text-base">{trip.description}</p>
          )}
          {trip.home_location && (
            <p className="text-xs sm:text-sm text-base-content/60 mt-1 sm:mt-2">
              Starting from: {trip.home_location}
            </p>
          )}
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="tabs tabs-boxed bg-base-100 shadow-sm">
            <button
              className={`tab ${viewMode === 'timeline' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              📅 Timeline
            </button>
            <button
              className={`tab ${viewMode === 'map' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              🗺️ Map
            </button>
          </div>
        </div>

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <div>
            <TripTimeline trip={trip} />
          </div>
        )}
        
        {/* Map View */}
        {viewMode === 'map' && (
          <div>
            <TripMapView trip={trip} />
          </div>
        )}

          {/* Restaurant Recommendations */}
          {trip.restaurants && trip.restaurants.length > 0 && (
            <RestaurantList restaurants={trip.restaurants} />
          )}
        </div>
      </div>
    </main>
  )
}
