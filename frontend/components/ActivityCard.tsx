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
      <div className="card-body">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <h3 className="card-title text-lg">{activity.name}</h3>
        </div>
        
        {activity.image_url && (
          <figure className="mt-2">
            <img
              src={activity.image_url}
              alt={activity.name}
              className="rounded-lg w-full h-48 object-cover"
            />
          </figure>
        )}
        
        {activity.start_time && (
          <p className="text-sm font-medium mt-2">
            {formatTime(activity.start_time)}
            {activity.duration_minutes && ` • ${activity.duration_minutes} min`}
          </p>
        )}
        
        {activity.address && (
          <p className="text-sm text-base-content/60">{activity.address}</p>
        )}
        
        {activity.notes && (
          <p className="text-sm mt-2">{activity.notes}</p>
        )}
        
        {activity.plus_code && (
          <p className="text-xs text-base-content/40 mt-2">
            Plus Code: {activity.plus_code}
          </p>
        )}
      </div>
    </div>
  );
}
