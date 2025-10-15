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
      <div className="card bg-base-100 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-200 cursor-pointer h-full border border-base-300/50 hover:border-primary/30">
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
