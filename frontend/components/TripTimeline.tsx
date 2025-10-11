/**
 * TripTimeline component - displays chronological timeline of trip items
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import type { Trip, TimelineItem } from '@/types';
import { isFlight, isHotel, isActivity } from '@/types';
import { sortChronologically } from '@/lib/utils';
import { FlightCard } from './FlightCard';
import { HotelCard } from './HotelCard';
import { ActivityCard } from './ActivityCard';

interface TripTimelineProps {
  trip: Trip;
}

export function TripTimeline({ trip }: TripTimelineProps) {
  // Combine all timeline items
  const timelineItems: TimelineItem[] = [
    ...(trip.flights || []),
    ...(trip.hotels || []),
    ...(trip.activities || []),
  ];
  
  // Sort chronologically
  const sortedItems = sortChronologically(timelineItems);
  
  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No itinerary items yet
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {sortedItems.map((item) => {
        if (isFlight(item)) {
          return <FlightCard key={item.id} flight={item} />;
        }
        if (isHotel(item)) {
          return <HotelCard key={item.id} hotel={item} />;
        }
        if (isActivity(item)) {
          return <ActivityCard key={item.id} activity={item} />;
        }
        return null;
      })}
    </div>
  );
}
