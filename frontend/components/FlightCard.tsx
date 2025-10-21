/**
 * FlightCard component - displays flight information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 * Updated: 2025-10-21 - Added timezone display support
 */

import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatTimeWithTz } from '@/lib/dateTime';
import { TimelineCard } from './TimelineCard';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const title = `${flight.airline || 'Flight'} ${flight.flight_number || ''}`.trim();
  
  // Collapsed view: Only show departure → arrival locations
  const content = (
    <>
      {flight.departure_location && flight.arrival_location && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-base-content/80">
          <span className="font-medium">{flight.departure_location}</span>
          <span>→</span>
          <span className="font-medium">{flight.arrival_location}</span>
        </div>
      )}
      {flight.departure_time && (
        <p className="text-xs text-base-content/60 mt-0.5">
          {formatTimeWithTz(flight.departure_time)}
        </p>
      )}
    </>
  );
  
  // Expanded view: Show all details
  const details = (flight.departure_time || flight.arrival_time || flight.confirmation_number || flight.notes || (flight.legs && flight.legs.length > 0)) ? (
    <>
      {/* Detailed times */}
      {flight.departure_time && flight.arrival_time && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-base-content/60 mb-1">Departure</p>
            <p className="font-medium text-xs sm:text-sm">{flight.departure_location}</p>
            <p className="text-xs sm:text-sm">{formatTimeWithTz(flight.departure_time)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60 mb-1">Arrival</p>
            <p className="font-medium text-xs sm:text-sm">{flight.arrival_location}</p>
            <p className="text-xs sm:text-sm">{formatTimeWithTz(flight.arrival_time)}</p>
          </div>
        </div>
      )}
      
      {/* Airline (if not in title) */}
      {flight.airline && (
        <p className="text-xs sm:text-sm text-base-content/70 mt-2">
          <span className="font-semibold">Airline:</span> {flight.airline}
        </p>
      )}
      
      {/* Flight number (if not in title) */}
      {flight.flight_number && (
        <p className="text-xs sm:text-sm text-base-content/70">
          <span className="font-semibold">Flight:</span> {flight.flight_number}
        </p>
      )}
      
      {/* Confirmation number */}
      {flight.confirmation_number && (
        <p className="text-xs sm:text-sm text-base-content/60 mt-2">
          <span className="font-semibold">Confirmation:</span> {flight.confirmation_number}
        </p>
      )}
      
      {/* Flight legs */}
      {flight.legs && flight.legs.length > 0 && (
        <div className="mt-2">
          <div className="badge badge-outline badge-sm">
            {flight.legs.length} connection{flight.legs.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      {/* Notes */}
      {flight.notes && (
        <div className="mt-3 pt-3 border-t border-base-300/50">
          <p className="text-xs text-base-content/60 mb-1 font-semibold">Notes:</p>
          <p className="text-xs sm:text-sm text-base-content/80 whitespace-pre-wrap">
            {flight.notes}
          </p>
        </div>
      )}
    </>
  ) : undefined;
  
  return (
    <TimelineCard
      icon={<Plane className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
      iconColor="primary"
      title={title}
      content={content}
      details={details}
    />
  );
}
