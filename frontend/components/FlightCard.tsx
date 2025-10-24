'use client'

import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatInTimezone } from '@/lib/dateTime';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const departureTime = formatInTimezone(
    flight.departure_time,
    flight.departure_timezone,
    'MMM dd, h:mm a'
  );
  
  const arrivalTime = formatInTimezone(
    flight.arrival_time,
    flight.arrival_timezone,
    'MMM dd, h:mm a'
  );
  
  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex-shrink-0">
        <Plane className="w-5 h-5 text-info" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Flight number and airline */}
        <h3 className="font-semibold text-sm sm:text-base mb-1">
          {flight.airline} {flight.flight_number}
        </h3>
        
        {/* Route */}
        <div className="text-xs sm:text-sm space-y-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base-content/60">From:</span>
            <span className="font-medium">{flight.departure_location}</span>
            <span className="text-base-content/60">•</span>
            <span className="text-base-content/70">{departureTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base-content/60">To:</span>
            <span className="font-medium">{flight.arrival_location}</span>
            <span className="text-base-content/60">•</span>
            <span className="text-base-content/70">{arrivalTime}</span>
          </div>
        </div>
        
        {/* Confirmation */}
        {flight.confirmation_number && (
          <p className="text-xs text-base-content/60">
            Confirmation: {flight.confirmation_number}
          </p>
        )}
        
        {/* Notes */}
        {flight.notes && (
          <p className="text-xs text-base-content/70 mt-2 line-clamp-2">
            {flight.notes}
          </p>
        )}
      </div>
    </div>
  );
}
