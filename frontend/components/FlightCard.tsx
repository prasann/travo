/**
 * FlightCard component - displays flight information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatTime } from '@/lib/dateTime';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h3 className="card-title text-lg">
            {flight.airline || 'Flight'} {flight.flight_number || ''}
          </h3>
        </div>
        
        {flight.departure_time && flight.arrival_time && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-base-content/60">Departure</p>
              <p className="font-medium">{flight.departure_location}</p>
              <p className="text-sm">{formatTime(flight.departure_time)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Arrival</p>
              <p className="font-medium">{flight.arrival_location}</p>
              <p className="text-sm">{formatTime(flight.arrival_time)}</p>
            </div>
          </div>
        )}
        
        {flight.confirmation_number && (
          <p className="text-sm text-base-content/60 mt-2">
            Confirmation: {flight.confirmation_number}
          </p>
        )}
        
        {flight.notes && (
          <p className="text-sm mt-2">{flight.notes}</p>
        )}
        
        {flight.legs && flight.legs.length > 0 && (
          <div className="badge badge-outline mt-2">
            {flight.legs.length} connection{flight.legs.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
