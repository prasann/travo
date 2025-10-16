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
  
  const content = (
    <>
      {hotel.address && (
        <p className="text-xs sm:text-sm text-base-content/60 mb-2">{hotel.address}</p>
      )}
      
      {hotel.check_in_time && hotel.check_out_time && (
        <div className="flex gap-3 sm:gap-4 mt-1">
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
  
  const details = (hotel.confirmation_number || hotel.phone || hotel.notes || hotel.plus_code) ? (
    <>
      {hotel.confirmation_number && (
        <p className="text-xs sm:text-sm text-base-content/60">
          Confirmation: {hotel.confirmation_number}
        </p>
      )}
      
      {hotel.phone && (
        <p className="text-xs sm:text-sm mt-1">📞 {hotel.phone}</p>
      )}
      
      {hotel.notes && (
        <p className="text-xs sm:text-sm mt-2 text-base-content/80">{hotel.notes}</p>
      )}
      
      {hotel.plus_code && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-3 h-3 text-base-content/40" />
          <p className="text-xs text-base-content/60 font-mono">
            {hotel.plus_code}
          </p>
        </div>
      )}
    </>
  ) : undefined;
  
  return (
    <TimelineCard
      icon={<HotelIcon className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />}
      iconColor="secondary"
      title={title}
      content={content}
      details={details}
    />
  );
}
