'use client'

import { TripCard } from './TripCard'
import type { TripIndex } from '@/types'

export interface TripListProps {
  trips: TripIndex[]
  isLoading?: boolean
}

export function TripList({ trips, isLoading = false }: TripListProps) {
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-32 w-full"></div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="page-container">
        <div className="alert alert-info">
          <span>No trips found. Start planning your next adventure!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="text-4xl font-bold mb-8">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}
