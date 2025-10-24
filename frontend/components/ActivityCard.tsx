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
  
  // Small inline icon (5x5)
  const icon = <MapPin className="w-5 h-5 text-accent" />;
  
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
  
  // Collapsed view: Show description only, with "Full details →" link
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
        Full details
        <ChevronRight className="w-3 h-3" />
      </Link>
    </>
  );
  
  // Expanded view: Show location details only
  const details = (activity.address || activity.city || activity.plus_code || activity.latitude || activity.longitude) ? (
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
        <p className="text-xs text-base-content/60 mt-1">
          <span className="font-semibold">Plus Code:</span> {activity.plus_code}
        </p>
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
