'use client'

import { Navigation } from './Navigation'
import { TripTimeline } from './TripTimeline'
import type { Trip } from '@/types'
import { formatDate } from '@/lib/dateTime'

export interface TripDetailsProps {
  trip: Trip
}

/**
 * @deprecated This component is being replaced by the new trip detail page
 * using TripTimeline component. Kept for backward compatibility.
 */
export function TripDetails({ trip }: TripDetailsProps) {
  const activityCount = (trip.activities || []).length
  const flightCount = (trip.flights || []).length
  const hotelCount = (trip.hotels || []).length
  const totalItems = activityCount + flightCount + hotelCount

  return (
    <div>
      <Navigation title={trip.name} showBackButton={true} backHref="/" />
      
      <div className="page-container">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="badge badge-primary">{totalItems} items</div>
            <p className="text-sm text-base-content/60">
              {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
            </p>
          </div>
          
          {trip.description && (
            <p className="text-base-content/80 mb-6">{trip.description}</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Timeline</h2>
          <TripTimeline trip={trip} />
        </div>
      </div>
    </div>
  )
}
