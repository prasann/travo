'use client'

import Link from 'next/link'
import type { TripIndex } from '@/types'
import { formatDate } from '@/lib/dateTime'

export interface TripCardProps {
  trip: TripIndex
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer h-full">
        <div className="card-body">
          <h2 className="card-title">{trip.name}</h2>
          <div className="text-xs text-base-content/50">
            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
          </div>
        </div>
      </div>
    </Link>
  )
}
