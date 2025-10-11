'use client'

import { Navigation } from './Navigation'
import { PlaceCard } from './PlaceCard'
import type { Trip } from '@/types'

export interface TripDetailsProps {
  trip: Trip
}

export function TripDetails({ trip }: TripDetailsProps) {
  const startDate = new Date(trip.start_date).toLocaleDateString()
  const endDate = new Date(trip.end_date).toLocaleDateString()

  return (
    <div>
      <Navigation title={trip.name} showBackButton={true} backHref="/" />
      
      <div className="page-container">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="badge badge-primary">{trip.places.length} places</div>
            <p className="text-sm text-base-content/60">
              {startDate} - {endDate}
            </p>
          </div>
          
          {trip.description && (
            <p className="text-base-content/80 mb-6">{trip.description}</p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Places to Visit</h2>
          {trip.places.length === 0 ? (
            <div className="alert alert-info">
              <span>No places added yet</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.places.map(place => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
