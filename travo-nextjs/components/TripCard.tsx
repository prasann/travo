'use client'

import Link from 'next/link'
import type { Trip } from '@/types'

export interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  const startDate = new Date(trip.start_date).toLocaleDateString()
  const endDate = new Date(trip.end_date).toLocaleDateString()

  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer h-full">
        <div className="card-body">
          <h2 className="card-title">{trip.name}</h2>
          <p className="text-xs text-base-content/50">
            {startDate} - {endDate}
          </p>
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
