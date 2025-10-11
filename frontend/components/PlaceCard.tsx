'use client'

import type { Place } from '@/types'

export interface PlaceCardProps {
  place: Place
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="card bg-base-100 shadow-md compact">
      <div className="card-body">
        <h3 className="card-title text-lg">{place.name}</h3>
        <div className="text-sm space-y-1">
          <p className="text-base-content/70">
            <span className="font-semibold">Plus Code:</span> {place.plus_code}
          </p>
          {place.notes && (
            <p className="text-base-content/80">{place.notes}</p>
          )}
        </div>
      </div>
    </div>
  )
}
