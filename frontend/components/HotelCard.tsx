/**
 * HotelCard component - displays hotel information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { Hotel as HotelIcon, MapPin, ExternalLink } from 'lucide-react';
import type { Hotel } from '@/types';
import { formatTime } from '@/lib/dateTime';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';
import { TimelineCard } from './TimelineCard';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const mapsUrl = getGoogleMapsUrl(hotel);
  
  // Make title clickable if we have a maps URL
  const title = mapsUrl ? (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-secondary transition-colors inline-flex items-center gap-1.5 group"
    >
      {hotel.name || 'Hotel'}
      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  ) : (
    hotel.name || 'Hotel'
  );
  
  // Collapsed view: Only show check-in/check-out times
  const content = (
    <>
      {hotel.check_in_time && hotel.check_out_time && (
        <div className="flex gap-3 sm:gap-4">
          <div>
            <p className="text-xs text-base-content/60">Check-in</p>
            <p className="text-xs sm:text-sm font-medium">{formatTime(hotel.check_in_time)}</p>
          </div>
          <div>
            <p className="text-xs text-base-content/60">Check-out</p>
            <p className="text-xs sm:text-sm font-medium">{formatTime(hotel.check_out_time)}</p>
          </div>
        </div>
      )}
    </>
  );
  
  // Expanded view: Show all details
  const hasDetails = !!(
    hotel.address || 
    hotel.city || 
    hotel.confirmation_number || 
    hotel.phone || 
    hotel.notes || 
    hotel.plus_code || 
    hotel.latitude || 
    hotel.longitude
  );
  
  const details = hasDetails ? (
    <>
      {/* Address */}
      {hotel.address && (
        <p className="text-xs sm:text-sm text-base-content/70">
          <span className="font-semibold">Address:</span> {hotel.address}
        </p>
      )}
      
      {/* City */}
      {hotel.city && (
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          <span className="font-semibold">City:</span> {hotel.city}
        </p>
      )}
      
      {/* Confirmation number */}
      {hotel.confirmation_number && (
        <p className="text-xs sm:text-sm text-base-content/60 mt-2">
          <span className="font-semibold">Confirmation:</span> {hotel.confirmation_number}
        </p>
      )}
      
      {/* Phone */}
      {hotel.phone && (
        <p className="text-xs sm:text-sm mt-1">
          <span className="font-semibold">Phone:</span> {hotel.phone}
        </p>
      )}
      
      {/* Coordinates (if available) */}
      {hotel.latitude && hotel.longitude && (
        <p className="text-xs text-base-content/60 mt-1">
          <span className="font-semibold">Coordinates:</span> {hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}
        </p>
      )}
      
      {/* Plus Code */}
      {hotel.plus_code && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-3 h-3 text-base-content/40" />
          <p className="text-xs text-base-content/60 font-mono">
            {hotel.plus_code}
          </p>
        </div>
      )}
      
      {/* Notes */}
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
      icon={<HotelIcon className="w-6 h-6 sm:w-8 sm:h-8 text-secondary" />}
      iconColor="secondary"
      title={title}
      content={content}
      details={details}
    />
  );
}
