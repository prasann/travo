'use client'

import { Building2, ExternalLink } from 'lucide-react';
import type { Hotel } from '@/types';
import { formatInTimezone } from '@/lib/dateTime';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const checkInTime = formatInTimezone(
    hotel.check_in_time,
    hotel.check_in_timezone,
    'MMM dd, h:mm a'
  );
  
  const checkOutTime = formatInTimezone(
    hotel.check_out_time,
    hotel.check_out_timezone,
    'MMM dd, h:mm a'
  );
  
  const mapsUrl = getGoogleMapsUrl(hotel);
  
  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex-shrink-0">
        <Building2 className="w-5 h-5 text-secondary" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Hotel name */}
        <h3 className="font-semibold text-sm sm:text-base mb-1">
          {mapsUrl ? (
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
          )}
        </h3>
        
        {/* Check-in/out times */}
        <div className="text-xs sm:text-sm space-y-1 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base-content/60">Check-in:</span>
            <span className="text-base-content/70">{checkInTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base-content/60">Check-out:</span>
            <span className="text-base-content/70">{checkOutTime}</span>
          </div>
        </div>
        
        {/* City/Address */}
        {(hotel.city || hotel.address) && (
          <p className="text-xs text-base-content/60">
            {hotel.city && <span>{hotel.city}</span>}
            {hotel.city && hotel.address && <span> • </span>}
            {hotel.address && <span>{hotel.address}</span>}
          </p>
        )}
        
        {/* Confirmation */}
        {hotel.confirmation_number && (
          <p className="text-xs text-base-content/60 mt-1">
            Confirmation: {hotel.confirmation_number}
          </p>
        )}
        
        {/* Notes */}
        {hotel.notes && (
          <p className="text-xs text-base-content/70 mt-2 line-clamp-2">
            {hotel.notes}
          </p>
        )}
      </div>
    </div>
  );
}
