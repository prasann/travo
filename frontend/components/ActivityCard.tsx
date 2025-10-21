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
import { TimelineCard } from './TimelineCard';

interface ActivityCardProps {
  activity: DailyActivity;
  tripId: string;
}

export function ActivityCard({ activity, tripId }: ActivityCardProps) {
  const mapsUrl = getGoogleMapsUrl(activity);
  
  // Make title clickable if we have a maps URL
  const title = mapsUrl ? (
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
  );
  
  // Icon or image with fallback
  const icon = activity.image_url ? (
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
          parent.innerHTML = '<svg class="w-6 h-6 sm:w-8 sm:h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>';
        }
      }}
    />
  ) : (
    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
  );
  
  // Collapsed view: Show description only, with "More →" link
  const content = (
    <>
      {activity.description && (
        <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2">
          {activity.description}
        </p>
      )}
      <Link 
        href={`/trip/${tripId}/activity/${activity.id}`}
        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-focus transition-colors font-medium"
      >
        More
        <ChevronRight className="w-3 h-3" />
      </Link>
    </>
  );
  
  // Expanded view: Show location details only (no notes, no AI summary)
  const details = (activity.description || activity.address || activity.city || activity.plus_code || activity.latitude || activity.longitude) ? (
    <>
      {/* Description */}
      {activity.description && (
        <p className="text-xs sm:text-sm text-base-content/80 mb-3">
          {activity.description}
        </p>
      )}
      
      {/* City */}
      {activity.city && (
        <p className="text-xs sm:text-sm text-base-content/70">
          <span className="font-semibold">City:</span> {activity.city}
        </p>
      )}
      
      {/* Address */}
      {activity.address && (
        <p className="text-xs sm:text-sm text-base-content/70 mt-1">
          <span className="font-semibold">Address:</span> {activity.address}
        </p>
      )}
      
      {/* Coordinates (if available) */}
      {activity.latitude && activity.longitude && (
        <p className="text-xs text-base-content/60 mt-1">
          <span className="font-semibold">Coordinates:</span> {activity.latitude.toFixed(4)}, {activity.longitude.toFixed(4)}
        </p>
      )}
      
      {/* Plus Code */}
      {activity.plus_code && (
        <div className="flex items-center gap-2 mt-2">
          <MapPin className="w-3 h-3 text-base-content/40" />
          <p className="text-xs text-base-content/60 font-mono">
            {activity.plus_code}
          </p>
        </div>
      )}
    </>
  ) : undefined;
  
  return (
    <TimelineCard
      icon={icon}
      iconColor="accent"
      title={title}
      content={content}
      details={details}
    />
  );
}
