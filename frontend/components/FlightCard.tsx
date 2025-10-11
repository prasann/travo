/**
 * FlightCard component - displays flight information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatTime } from '@/lib/dateTime';
import { TimelineCard } from './TimelineCard';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const title = `${flight.airline || 'Flight'} ${flight.flight_number || ''}`;
  
  const content = (
    <>
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
    </>
  );
  
  const details = (flight.confirmation_number || flight.notes || (flight.legs && flight.legs.length > 0)) ? (
    <>
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
    </>
  ) : undefined;
  
  return (
    <TimelineCard
      icon={<Plane className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />}
      iconColor="primary"
      title={title}
      content={content}
      details={details}
    />
  );
}
