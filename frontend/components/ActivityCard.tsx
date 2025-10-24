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

import { MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { DailyActivity } from '@/types';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';

interface ActivityCardProps {
  activity: DailyActivity;
  tripId: string;
}

export function ActivityCard({ activity, tripId }: ActivityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const mapsUrl = getGoogleMapsUrl(activity);
  
  const hasDetails = !!(activity.address || activity.city || activity.plus_code || activity.latitude || activity.longitude);
  
  return (
    <div className="flex gap-3 p-3 sm:p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Icon */}
      <div className="flex-shrink-0 pt-0.5">
        <MapPin className="w-5 h-5 text-accent" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title with expand/collapse button */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm sm:text-base">
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
          
          {hasDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 text-primary hover:text-primary-focus transition-colors"
              aria-label={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {/* Collapsed view: Description only */}
        {!isExpanded && (
          <>
            {activity.description && (
              <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2">
                {activity.description}
              </p>
            )}
            
            <Link 
              href={`/trip/${tripId}/activity/${activity.id}`}
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium mt-1 ml-4"
            >
              Full details
              <ExternalLink className="w-3 h-3" />
            </Link>
          </>
        )}
        
        {/* Expanded view: Location details */}
        {isExpanded && (
          <>
            {activity.description && (
              <p className="text-xs sm:text-sm text-base-content/80 mb-3">
                {activity.description}
              </p>
            )}
            
            {activity.city && (
              <p className="text-xs sm:text-sm text-base-content/70">
                <span className="font-semibold">City:</span> {activity.city}
              </p>
            )}
            
            {activity.address && (
              <p className="text-xs sm:text-sm text-base-content/70 mt-1">
                <span className="font-semibold">Address:</span> {activity.address}
              </p>
            )}
            
            {activity.latitude && activity.longitude && (
              <p className="text-xs text-base-content/60 mt-1">
                <span className="font-semibold">Coordinates:</span> {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
              </p>
            )}
            
            {activity.plus_code && (
              <p className="text-xs text-base-content/60 mt-1">
                <span className="font-semibold">Plus Code:</span> {activity.plus_code}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
