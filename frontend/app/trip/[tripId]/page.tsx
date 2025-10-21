'use client';

import { notFound } from 'next/navigation'
import { useShow } from '@refinedev/core'
import { Navigation } from '@/components/Navigation'
import { TripTimeline } from '@/components/TripTimeline'
import { RestaurantList } from '@/components/RestaurantList'
import TripMapView from '@/components/TripMapView'
import TripNotes from '@/components/TripNotes'
import { formatDate } from '@/lib/dateTime'
import { useEffect, useState } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { Calendar, Map, FileText } from 'lucide-react'
import type { TripWithRelations } from '@/lib/db'

type ViewMode = 'timeline' | 'map' | 'notes';

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
  const isOnline = useNetworkStatus();

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
            <div className="flex justify-between items-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-4xl font-bold">{trip.name}</h1>
              <div className="flex flex-col items-end gap-1">
                <a 
                  href={isOnline ? `/trip/${tripId}/edit` : undefined}
                  className={`btn btn-primary btn-sm ${!isOnline ? 'btn-disabled' : ''}`}
                  title={!isOnline ? 'Edit mode requires internet connection' : 'Edit trip details'}
                  onClick={(e) => {
                    if (!isOnline) {
                      e.preventDefault();
                    }
                  }}
                >
                  Edit Trip
                </a>
                {!isOnline && (
                  <span className="text-xs text-warning">Offline</span>
                )}
              </div>
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
              <Calendar className="w-4 h-4 mr-1" />
              Timeline
            </button>
            <button
              className={`tab ${viewMode === 'map' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('map')}
            > 
            <Map className="w-4 h-4 mr-1" />
            Map
            </button>
            <button
              className={`tab ${viewMode === 'notes' ? 'tab-active' : ''}`}
              onClick={() => setViewMode('notes')}
            >
              <FileText className="w-4 h-4 mr-1" />
              Notes
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
        
        {/* Notes View */}
        {viewMode === 'notes' && (
          <div>
            <TripNotes trip={trip} onUpdate={() => query.refetch()} />
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
