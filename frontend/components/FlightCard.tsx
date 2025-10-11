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
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Icon + Key info */}
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 flex items-center justify-center rounded">
            <Plane className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
          </div>
          
          {/* Key info beside icon */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-1">
              {flight.airline || 'Flight'} {flight.flight_number || ''}
            </h3>
            
            {flight.departure_time && flight.arrival_time && (
              <div className="flex gap-3 sm:gap-4 mt-1">
                <div>
                  <p className="text-xs text-base-content/60">Departure</p>
                  <p className="font-medium text-xs sm:text-sm">{flight.departure_location}</p>
                  <p className="text-xs sm:text-sm">{formatTime(flight.departure_time)}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/60">Arrival</p>
                  <p className="font-medium text-xs sm:text-sm">{flight.arrival_location}</p>
                  <p className="text-xs sm:text-sm">{formatTime(flight.arrival_time)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom section: Full width content */}
        {(flight.confirmation_number || flight.notes || (flight.legs && flight.legs.length > 0)) && (
          <div className="mt-3 pt-3 border-t border-base-300">
            {flight.confirmation_number && (
              <p className="text-xs sm:text-sm text-base-content/60">
                Confirmation: {flight.confirmation_number}
              </p>
            )}
            
            {flight.notes && (
              <p className="text-xs sm:text-sm mt-2 text-base-content/80">{flight.notes}</p>
            )}
            
            {flight.legs && flight.legs.length > 0 && (
              <div className="badge badge-outline badge-sm mt-2">
                {flight.legs.length} connection{flight.legs.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
