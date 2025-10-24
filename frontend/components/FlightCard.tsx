import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatTimeWithTz } from '@/lib/dateTime';
import { getTimezoneLabel } from '@/lib/timezoneUtils';
import { TimelineCard } from './TimelineCard';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  const title = `${flight.airline || 'Flight'} ${flight.flight_number || ''}`.trim();
  
  const content = (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <div className="flex flex-col">
        {flight.departure_location && (
          <span className="font-medium text-base-content/80">{flight.departure_location}</span>
        )}
        {flight.departure_time && (
          <span className="text-base-content/60 text-xs">
            {formatTimeWithTz(flight.departure_time, flight.departure_timezone)}
          </span>
        )}
      </div>
      
      <span className="text-base-content/60">→</span>
      
      <div className="flex flex-col">
        {flight.arrival_location && (
          <span className="font-medium text-base-content/80">{flight.arrival_location}</span>
        )}
        {flight.arrival_time && (
          <span className="text-base-content/60 text-xs">
            {formatTimeWithTz(flight.arrival_time, flight.arrival_timezone)}
          </span>
        )}
      </div>
    </div>
  );
  
  const details = (flight.departure_time || flight.arrival_time || flight.confirmation_number || flight.notes || (flight.legs && flight.legs.length > 0)) ? (
    <>
      {flight.departure_time && flight.arrival_time && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-base-content/60 mb-1">Departure</p>
            <p className="font-medium text-xs sm:text-sm">{flight.departure_location}</p>
            <p className="text-xs sm:text-sm">{formatTimeWithTz(flight.departure_time, flight.departure_timezone, true)}</p>
            {flight.departure_timezone && (
              <p className="text-xs text-base-content/50 mt-0.5">
                {getTimezoneLabel(flight.departure_timezone)}
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-base-content/60 mb-1">Arrival</p>
            <p className="font-medium text-xs sm:text-sm">{flight.arrival_location}</p>
            <p className="text-xs sm:text-sm">{formatTimeWithTz(flight.arrival_time, flight.arrival_timezone, true)}</p>
            {flight.arrival_timezone && (
              <p className="text-xs text-base-content/50 mt-0.5">
                {getTimezoneLabel(flight.arrival_timezone)}
              </p>
            )}
          </div>
        </div>
      )}
      
      {flight.airline && (
        <p className="text-xs sm:text-sm text-base-content/70 mt-2">
          <span className="font-semibold">Airline:</span> {flight.airline}
        </p>
      )}
      
      {flight.flight_number && (
        <p className="text-xs sm:text-sm text-base-content/70">
          <span className="font-semibold">Flight:</span> {flight.flight_number}
        </p>
      )}
      
      {flight.confirmation_number && (
        <p className="text-xs sm:text-sm text-base-content/60 mt-2">
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
