'use client';

import { notFound } from 'next/navigation'
import { TripTimeline } from '@/components/TripTimeline'
import { RestaurantList } from '@/components/RestaurantList'
import { getTripWithRelations } from '@/lib/db'
import { formatDate } from '@/lib/dateTime'
import { useEffect, useState } from 'react'
import type { TripWithRelations } from '@/lib/db'

interface TripPageProps {
  params: Promise<{
    tripId: string
  }>
}

export default function TripPage({ params }: TripPageProps) {
  const [tripId, setTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setTripId(p.tripId));
  }, [params]);

  useEffect(() => {
    if (!tripId) return;

    async function loadTrip() {
      const result = await getTripWithRelations(tripId!);
      
      if (result.success) {
        setTrip(result.data);
      } else {
        setError(result.error.message);
      }
      
      setIsLoading(false);
    }

    loadTrip();
  }, [tripId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </main>
    );
  }

  if (error || !trip) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Trip Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-4xl font-bold mb-1">{trip.name}</h1>
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

        {/* Timeline */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Timeline</h2>
          <TripTimeline trip={trip} />
        </div>

        {/* Restaurant Recommendations */}
        {trip.restaurants && trip.restaurants.length > 0 && (
          <RestaurantList restaurants={trip.restaurants} />
        )}
      </div>
    </main>
  )
}
