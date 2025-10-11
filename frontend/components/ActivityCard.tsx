/**
 * ActivityCard component - displays activity information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { MapPin } from 'lucide-react';
import type { DailyActivity } from '@/types';
import { formatTime } from '@/lib/dateTime';

interface ActivityCardProps {
  activity: DailyActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Image + Key info */}
        <div className="flex gap-3">
          {/* Image or Icon */}
          <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-accent/10 flex items-center justify-center rounded overflow-hidden">
            {activity.image_url ? (
              <img
                src={activity.image_url}
                alt={activity.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // On error, hide image and show icon instead
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="w-8 h-8 sm:w-10 sm:h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
                  }
                }}
              />
            ) : (
              <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-accent" />
            )}
          </div>
          
          {/* Key info beside image */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-1">{activity.name}</h3>
            
            {activity.start_time && (
              <p className="text-xs sm:text-sm font-medium text-base-content/80">
                {formatTime(activity.start_time)}
                {activity.duration_minutes && ` • ${activity.duration_minutes} min`}
              </p>
            )}
            
            {activity.address && (
              <p className="text-xs sm:text-sm text-base-content/60 mt-1">{activity.address}</p>
            )}
          </div>
        </div>
        
        {/* Bottom section: Full width content */}
        {(activity.notes || activity.plus_code) && (
          <div className="mt-3 pt-3 border-t border-base-300">
            {activity.notes && (
              <p className="text-xs sm:text-sm">{activity.notes}</p>
            )}
            
            {activity.plus_code && (
              <div className="flex items-center gap-2 mt-2">
                <MapPin className="w-3 h-3 text-base-content/40" />
                <p className="text-xs text-base-content/60 font-mono">
                  {activity.plus_code}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
