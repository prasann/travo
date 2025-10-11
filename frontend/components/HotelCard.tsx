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
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Icon + Key info */}
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-secondary/10 flex items-center justify-center rounded">
            <HotelIcon className="w-8 h-8 sm:w-10 sm:h-10 text-secondary" />
          </div>
          
          {/* Key info beside icon */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-1">{hotel.name || 'Hotel'}</h3>
            
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
          </div>
        </div>
        
        {/* Bottom section: Full width content */}
        {(hotel.confirmation_number || hotel.phone || hotel.notes) && (
          <div className="mt-3 pt-3 border-t border-base-300">
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
          </div>
        )}
      </div>
    </div>
  );
}
