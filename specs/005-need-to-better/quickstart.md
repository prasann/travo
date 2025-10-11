# Quickstart Guide: Enhanced Trip Data Model

**Feature**: 005-need-to-better  
**Date**: 2025-10-11  
**Audience**: Developers implementing this feature

## Overview

This guide provides practical examples and step-by-step instructions for implementing the enhanced trip data model with flights, hotels, activities, and restaurant recommendations.

## Prerequisites

- Node.js 20+ installed
- Familiarity with TypeScript and Next.js App Router
- Understanding of React 19 Server/Client Components
- DaisyUI 5.2.0 and Tailwind CSS 4.1.14 already configured

## Quick Reference

### Key Files to Modify

```
frontend/
├── types/index.ts                    # Add new interfaces
├── lib/
│   ├── utils.ts                     # Add chronological sorting
│   ├── dateTime.ts                  # NEW: Timezone utilities
│   └── tripLoader.ts                # NEW: Load trip JSON files
├── components/
│   ├── TripCard.tsx                 # Update for new data
│   ├── TripDetails.tsx              # Update for timeline view
│   ├── TripTimeline.tsx             # NEW: Timeline component
│   ├── FlightCard.tsx               # NEW
│   ├── HotelCard.tsx                # NEW
│   ├── ActivityCard.tsx             # NEW
│   └── RestaurantList.tsx           # NEW
└── data/
    ├── trips/                       # NEW: Individual trip files
    └── trip-index.json              # NEW: Trip list index
```

## Step-by-Step Implementation

### Step 1: Update TypeScript Interfaces

Copy interfaces from `contracts/interfaces.ts` to `frontend/types/index.ts`:

```typescript
// frontend/types/index.ts

export interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  home_location?: string;
  updated_at: string;
  flights?: Flight[];
  hotels?: Hotel[];
  activities?: DailyActivity[];
  restaurants?: RestaurantRecommendation[];
}

export interface Flight {
  id: string;
  trip_id: string;
  updated_at: string;
  airline?: string;
  flight_number?: string;
  departure_time?: string;  // ISO 8601 with timezone
  arrival_time?: string;    // ISO 8601 with timezone
  departure_location?: string;
  arrival_location?: string;
  confirmation_number?: string;
  notes?: string;
  legs?: FlightLeg[];
}

// ... (copy remaining interfaces)
```

### Step 2: Create Date/Time Utilities

```typescript
// frontend/lib/dateTime.ts

/**
 * Format ISO datetime string with timezone to readable format
 * 
 * @param isoString ISO 8601 datetime with timezone (e.g., "2025-04-01T10:30:00-07:00")
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date/time string
 */
export function formatDateTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }
): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format ISO datetime to time only with timezone
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Time string (e.g., "10:30 AM PST")
 */
export function formatTime(isoString: string): string {
  return formatDateTime(isoString, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Format ISO date string to readable format
 * 
 * @param isoDate ISO 8601 date (YYYY-MM-DD)
 * @returns Formatted date (e.g., "Apr 1, 2025")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
```

### Step 3: Create Chronological Sorting

```typescript
// frontend/lib/utils.ts (add to existing file)

import type { Flight, Hotel, DailyActivity } from '@/types';

export type TimelineItem = Flight | Hotel | DailyActivity;

/**
 * Extract timestamp from timeline item for sorting
 */
export function getTimestamp(item: TimelineItem): Date | null {
  if ('departure_time' in item && item.departure_time) {
    return new Date(item.departure_time);
  }
  if ('check_in_time' in item && item.check_in_time) {
    return new Date(item.check_in_time);
  }
  if ('start_time' in item && item.start_time) {
    return new Date(item.start_time);
  }
  return null;
}

/**
 * Sort timeline items chronologically
 * 
 * Priority:
 * 1. Items with timestamps (sorted by time)
 * 2. Items without timestamps (sorted by order_index if available)
 */
export function sortChronologically(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => {
    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);
    
    // Both have timestamps: sort by time
    if (timeA && timeB) {
      const diff = timeA.getTime() - timeB.getTime();
      
      // Same timestamp: use order_index for activities
      if (diff === 0 && 'order_index' in a && 'order_index' in b) {
        return a.order_index - b.order_index;
      }
      
      return diff;
    }
    
    // Items without timestamps go last, sorted by order_index if available
    if (!timeA && !timeB && 'order_index' in a && 'order_index' in b) {
      return a.order_index - b.order_index;
    }
    
    return timeA ? -1 : 1;
  });
}
```

### Step 4: Create Trip Loader

```typescript
// frontend/lib/tripLoader.ts

import type { Trip, TripIndexFile } from '@/types';

/**
 * Load trip index for list view
 */
export async function loadTripIndex(): Promise<TripIndexFile> {
  const response = await fetch('/data/trip-index.json');
  if (!response.ok) {
    throw new Error('Failed to load trip index');
  }
  return response.json();
}

/**
 * Load individual trip by ID
 */
export async function loadTrip(tripId: string): Promise<Trip> {
  const response = await fetch(`/data/trips/${tripId}.json`);
  if (!response.ok) {
    throw new Error(`Failed to load trip ${tripId}`);
  }
  return response.json();
}
```

### Step 5: Create Timeline Components

#### FlightCard Component

```tsx
// frontend/components/FlightCard.tsx

import { Plane } from 'lucide-react';
import type { Flight } from '@/types';
import { formatDateTime, formatTime } from '@/lib/dateTime';

interface FlightCardProps {
  flight: Flight;
}

export function FlightCard({ flight }: FlightCardProps) {
  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          <h3 className="card-title text-lg">
            {flight.airline || 'Flight'} {flight.flight_number || ''}
          </h3>
        </div>
        
        {flight.departure_time && flight.arrival_time && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <p className="text-sm text-base-content/60">Departure</p>
              <p className="font-medium">{flight.departure_location}</p>
              <p className="text-sm">{formatTime(flight.departure_time)}</p>
            </div>
            <div>
              <p className="text-sm text-base-content/60">Arrival</p>
              <p className="font-medium">{flight.arrival_location}</p>
              <p className="text-sm">{formatTime(flight.arrival_time)}</p>
            </div>
          </div>
        )}
        
        {flight.confirmation_number && (
          <p className="text-sm text-base-content/60 mt-2">
            Confirmation: {flight.confirmation_number}
          </p>
        )}
        
        {flight.notes && (
          <p className="text-sm mt-2">{flight.notes}</p>
        )}
        
        {flight.legs && flight.legs.length > 0 && (
          <div className="badge badge-outline mt-2">
            {flight.legs.length} connection{flight.legs.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
```

#### HotelCard Component

```tsx
// frontend/components/HotelCard.tsx

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
```

#### ActivityCard Component

```tsx
// frontend/components/ActivityCard.tsx

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
```

#### TripTimeline Component

```tsx
// frontend/components/TripTimeline.tsx

import type { Trip } from '@/types';
import { sortChronologically, type TimelineItem } from '@/lib/utils';
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
        if ('airline' in item || 'flight_number' in item) {
          return <FlightCard key={item.id} flight={item} />;
        }
        if ('check_in_time' in item) {
          return <HotelCard key={item.id} hotel={item} />;
        }
        return <ActivityCard key={item.id} activity={item} />;
      })}
    </div>
  );
}
```

### Step 6: Update Trip Detail Page

```tsx
// frontend/app/trip/[tripId]/page.tsx

import { loadTrip } from '@/lib/tripLoader';
import { TripTimeline } from '@/components/TripTimeline';
import { formatDate } from '@/lib/dateTime';

export default async function TripDetailPage({
  params,
}: {
  params: { tripId: string };
}) {
  const trip = await loadTrip(params.tripId);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{trip.name}</h1>
        <p className="text-base-content/60">
          {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
        </p>
        {trip.description && (
          <p className="mt-4 text-lg">{trip.description}</p>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mb-4">Timeline</h2>
      <TripTimeline trip={trip} />
      
      {trip.restaurants && trip.restaurants.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Restaurant Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trip.restaurants.map((restaurant) => (
              <div key={restaurant.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <h3 className="card-title">{restaurant.name}</h3>
                  {restaurant.cuisine_type && (
                    <p className="text-sm badge badge-outline">
                      {restaurant.cuisine_type}
                    </p>
                  )}
                  {restaurant.notes && (
                    <p className="text-sm mt-2">{restaurant.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Data Migration

### Step 1: Create Migration Script

```typescript
// scripts/migrate-trips.ts

import fs from 'fs';
import path from 'path';
import type { LegacyTripsFile, Trip, DailyActivity } from '../frontend/types';

const DATA_DIR = path.join(__dirname, '../frontend/data');
const TRIPS_DIR = path.join(DATA_DIR, 'trips');

// Read old trips.json
const legacyData: LegacyTripsFile = JSON.parse(
  fs.readFileSync(path.join(DATA_DIR, 'trips.json'), 'utf-8')
);

// Create trips directory
if (!fs.existsSync(TRIPS_DIR)) {
  fs.mkdirSync(TRIPS_DIR, { recursive: true });
}

// Migrate each trip
const tripIndex = legacyData.trips.map((legacyTrip) => {
  // Convert places to activities
  const activities: DailyActivity[] = legacyTrip.places.map((place) => ({
    ...place,
    name: place.name,
    date: legacyTrip.start_date, // Default to first day (adjust manually)
    order_index: place.order_index,
  }));
  
  // Create new trip structure
  const newTrip: Trip = {
    id: legacyTrip.id,
    name: legacyTrip.name,
    description: legacyTrip.description,
    start_date: legacyTrip.start_date,
    end_date: legacyTrip.end_date,
    updated_at: legacyTrip.updated_at,
    flights: [],
    hotels: [],
    activities,
    restaurants: [],
  };
  
  // Write individual trip file
  fs.writeFileSync(
    path.join(TRIPS_DIR, `${newTrip.id}.json`),
    JSON.stringify(newTrip, null, 2)
  );
  
  // Return index entry
  return {
    id: newTrip.id,
    name: newTrip.name,
    start_date: newTrip.start_date,
    end_date: newTrip.end_date,
    updated_at: newTrip.updated_at,
  };
});

// Write trip index
fs.writeFileSync(
  path.join(DATA_DIR, 'trip-index.json'),
  JSON.stringify({ trips: tripIndex }, null, 2)
);

console.log(`Migrated ${tripIndex.length} trips`);
```

### Step 2: Run Migration

```bash
cd /Users/pnagarajan/projects/personal/travo
npx tsx scripts/migrate-trips.ts
```

## Testing Checklist

- [ ] Trip list loads from trip-index.json
- [ ] Individual trip loads from trips/{id}.json
- [ ] Timeline displays flights, hotels, activities in chronological order
- [ ] Same-day activities respect order_index
- [ ] Activities without timestamps appear last
- [ ] Timezone-aware times display correctly (e.g., "10:30 AM PST")
- [ ] Optional fields don't cause errors when missing
- [ ] Restaurant recommendations appear separately
- [ ] Images load from URLs
- [ ] Plus Codes display correctly
- [ ] Responsive layout works on mobile

## Common Issues

**Issue**: Timezone strings not parsing correctly
**Solution**: Ensure ISO 8601 format with timezone offset (e.g., "2025-04-01T10:30:00-07:00")

**Issue**: Activities not sorting correctly
**Solution**: Check that order_index is set for all activities, start with 0

**Issue**: Images not loading
**Solution**: Verify image URLs are absolute paths and CORS is enabled

**Issue**: Type errors with optional fields
**Solution**: Use optional chaining (`trip.flights?.length`) or nullish coalescing

## Next Steps

1. Implement data editing UI (forms for flights, hotels, activities)
2. Add data validation layer
3. Create export/import functionality
4. Add calendar view for timeline
5. Implement search/filter functionality

## Resources

- [Data Model Documentation](./data-model.md)
- [TypeScript Interfaces](./contracts/interfaces.ts)
- [Research Decisions](./research.md)
- [DaisyUI Timeline Component](https://daisyui.com/components/timeline/)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
