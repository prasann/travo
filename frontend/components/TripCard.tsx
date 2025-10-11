'use client'

import Link from 'next/link'
import type { Trip } from '@/types'

export interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  // Format dates consistently for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer h-full">
        <div className="card-body">
          <h2 className="card-title">{trip.name}</h2>
          <div className="text-xs text-base-content/50">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </div>
          {trip.description && (
            <p className="line-clamp-2 text-sm">{trip.description}</p>
          )}
          <div className="card-actions justify-end mt-4">
            <div className="badge badge-primary">{trip.places.length} places</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
