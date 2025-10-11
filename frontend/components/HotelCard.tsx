/**
 * HotelCard component - displays hotel information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { Hotel as HotelIcon } from 'lucide-react';
import type { Hotel } from '@/types';
import { formatTime } from '@/lib/dateTime';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <HotelIcon className="w-5 h-5 text-secondary" />
          <h3 className="card-title text-lg">{hotel.name || 'Hotel'}</h3>
        </div>
        
        {hotel.address && (
          <p className="text-sm text-base-content/60">{hotel.address}</p>
        )}
        
        {hotel.check_in_time && hotel.check_out_time && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-base-content/60">Check-in</p>
              <p className="font-medium">{formatTime(hotel.check_in_time)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Check-out</p>
              <p className="font-medium">{formatTime(hotel.check_out_time)}</p>
            </div>
          </div>
        )}
        
        {hotel.confirmation_number && (
          <p className="text-sm text-base-content/60 mt-2">
            Confirmation: {hotel.confirmation_number}
          </p>
        )}
        
        {hotel.phone && (
          <p className="text-sm mt-2">📞 {hotel.phone}</p>
        )}
        
        {hotel.notes && (
          <p className="text-sm mt-2">{hotel.notes}</p>
        )}
      </div>
    </div>
  );
}
