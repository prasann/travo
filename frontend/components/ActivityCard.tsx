/**
 * ActivityCard component - displays activity information
 * Feature: Enhanced Trip Data Model & Itinerary Management
 * 
 * Updates:
 * - Collapsed view shows description only
 * - "More →" link to dedicated activity detail page
 * - Expanded view shows location details without notes
 */

'use client'

import { MapPin, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { DailyActivity } from '@/types';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';

interface ActivityCardProps {
  activity: DailyActivity;
  tripId: string;
}

export function ActivityCard({ activity, tripId }: ActivityCardProps) {
  const mapsUrl = getGoogleMapsUrl(activity);
  
  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex-shrink-0">
        <MapPin className="w-5 h-5 text-accent" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <h3 className="font-semibold text-sm sm:text-base mb-1">
          {mapsUrl ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors inline-flex items-center gap-1.5 group"
            >
              {activity.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ) : (
            activity.name
          )}
        </h3>
        
        {/* Description */}
        {activity.description && (
          <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2">
            {activity.description}
          </p>
        )}
        
        {/* City/Address */}
        {(activity.city || activity.address) && (
          <p className="text-xs text-base-content/60">
            {activity.city && <span>{activity.city}</span>}
            {activity.city && activity.address && <span> • </span>}
            {activity.address && <span>{activity.address}</span>}
          </p>
        )}
        
        {/* More link */}
        <Link 
          href={`/trip/${tripId}/activity/${activity.id}`}
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium mt-2"
        >
          More details
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
