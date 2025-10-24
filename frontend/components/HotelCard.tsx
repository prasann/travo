'use client'

import { Building2, ExternalLink } from 'lucide-react';
import type { Hotel } from '@/types';
import { formatInTimeZone } from 'date-fns-tz';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';
import { TimelineCard } from './TimelineCard';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const checkInTime = hotel.check_in_time && hotel.check_in_timezone
    ? formatInTimeZone(hotel.check_in_time, hotel.check_in_timezone, 'MMM dd, h:mm a')
    : 'N/A';
  
  const checkOutTime = hotel.check_out_time && hotel.check_out_timezone
    ? formatInTimeZone(hotel.check_out_time, hotel.check_out_timezone, 'MMM dd, h:mm a')
    : 'N/A';
  
  const mapsUrl = getGoogleMapsUrl(hotel);
  
  // Small inline icon (5x5)
  const icon = <Building2 className="w-5 h-5 text-secondary" />;
  
  // Make title clickable if we have a maps URL
  const title = mapsUrl ? (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-secondary transition-colors inline-flex items-center gap-1.5 group"
    >
      {hotel.name}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  ) : (
    hotel.name
  );
  
  // Collapsed view: Check-in/out times
  const content = (
    <div className="text-xs sm:text-sm space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-base-content/60">Check-in:</span>
        <span className="text-base-content/70">{checkInTime}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-base-content/60">Check-out:</span>
        <span className="text-base-content/70">{checkOutTime}</span>
      </div>
    </div>
  );
  
  // Expanded view: Full details
  const hasDetails = !!(hotel.address || hotel.city || hotel.confirmation_number || hotel.phone || hotel.notes || hotel.plus_code || hotel.latitude || hotel.longitude);
  
  const details = hasDetails ? (
    <>
      {hotel.address && (
        <p className="text-xs sm:text-sm text-base-content/70">
          <span className="font-semibold">Address:</span> {hotel.address}
        </p>
      )}
      
      {hotel.city && (
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          <span className="font-semibold">City:</span> {hotel.city}
        </p>
      )}
      
      {hotel.confirmation_number && (
        <p className="text-xs sm:text-sm text-base-content/60 mt-2">
          <span className="font-semibold">Confirmation:</span> {hotel.confirmation_number}
        </p>
      )}
      
      {hotel.phone && (
        <p className="text-xs sm:text-sm mt-1">
          <span className="font-semibold">Phone:</span> {hotel.phone}
        </p>
      )}
      
      {hotel.latitude && hotel.longitude && (
        <p className="text-xs text-base-content/60 mt-1">
          <span className="font-semibold">Coordinates:</span> {hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}
        </p>
      )}
      
      {hotel.plus_code && (
        <p className="text-xs text-base-content/60 mt-1">
          <span className="font-semibold">Plus Code:</span> {hotel.plus_code}
        </p>
      )}
      
      {hotel.notes && (
        <div className="mt-3 pt-3 border-t border-base-300/50">
          <p className="text-xs text-base-content/60 mb-1 font-semibold">Notes:</p>
          <p className="text-xs sm:text-sm text-base-content/80 whitespace-pre-wrap">
            {hotel.notes}
          </p>
        </div>
      )}
    </>
  ) : undefined;
  
  return (
    <TimelineCard
      icon={icon}
      iconColor="secondary"
      title={title}
      content={content}
      details={details}
    />
  );
}
