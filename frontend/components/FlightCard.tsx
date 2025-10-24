'use client'

import { Plane, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Flight } from '@/types';
import { formatInTimeZone } from 'date-fns-tz';
import { getTimezoneLabel } from '@/lib/timezoneUtils';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const departureTime = flight.departure_time && flight.departure_timezone
    ? formatInTimeZone(flight.departure_time, flight.departure_timezone, 'MMM dd, h:mm a')
    : 'N/A';
  
  const arrivalTime = flight.arrival_time && flight.arrival_timezone
    ? formatInTimeZone(flight.arrival_time, flight.arrival_timezone, 'MMM dd, h:mm a')
    : 'N/A';
  
  const hasDetails = !!(flight.confirmation_number || flight.notes || (flight.legs && flight.legs.length > 0));
  
  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <Plane className="w-5 h-5 text-info" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-base mb-1">
          {flight.airline} {flight.flight_number}
        </h3>
        
        {/* Collapsed view: Compact route info */}
        {!isExpanded && (
          <>
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
            
            {hasDetails && (
              <button
                onClick={() => setIsExpanded(true)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium mt-1"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </>
        )}
        
        {/* Expanded view: Full details with timezones */}
        {isExpanded && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-base-content/60 mb-1">Departure</p>
                <p className="font-medium text-xs sm:text-sm">{flight.departure_location}</p>
                <p className="text-xs sm:text-sm">{departureTime}</p>
                {flight.departure_timezone && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {getTimezoneLabel(flight.departure_timezone)}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-base-content/60 mb-1">Arrival</p>
                <p className="font-medium text-xs sm:text-sm">{flight.arrival_location}</p>
                <p className="text-xs sm:text-sm">{arrivalTime}</p>
                {flight.arrival_timezone && (
                  <p className="text-xs text-base-content/50 mt-0.5">
                    {getTimezoneLabel(flight.arrival_timezone)}
                  </p>
                )}
              </div>
            </div>
            
            {flight.confirmation_number && (
              <p className="text-xs sm:text-sm text-base-content/60">
                <span className="font-semibold">Confirmation:</span> {flight.confirmation_number}
              </p>
            )}
            
            {flight.legs && flight.legs.length > 0 && (
              <div className="mt-2">
                <div className="badge badge-outline badge-sm">
                  {flight.legs.length} connection{flight.legs.length > 1 ? 's' : ''}
                </div>
              </div>
            )}
            
            {flight.notes && (
              <div className="mt-3 pt-3 border-t border-base-300/50">
                <p className="text-xs text-base-content/60 mb-1 font-semibold">Notes:</p>
                <p className="text-xs sm:text-sm text-base-content/80 whitespace-pre-wrap">
                  {flight.notes}
                </p>
              </div>
            )}
            
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium mt-3"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
