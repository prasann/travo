import type { TripListProps } from '@/types';
import { Navigation } from './Navigation';
import { TripCard } from './TripCard';
import { Typography } from './ui/typography';
import { sortTripsByDate } from '@/lib/utils';

/**
 * TripList component - Container for displaying multiple trips in a grid layout
 * Handles trip sorting, loading states, and empty states
 */
export function TripList({ trips, onTripSelect, isLoading = false }: TripListProps) {
  // Sort trips by start date in chronological order
  const sortedTrips = sortTripsByDate(trips);

  if (isLoading) {
    return (
      <div>
        <Navigation 
          title="My Trips"
          showBackButton={false}
        />
        <div className="page-container pt-4">
          <div className="trip-grid">
          {/* Loading skeleton cards */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-6 animate-pulse"
            >
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    );
  }

  if (sortedTrips.length === 0) {
    return (
      <div>
        <Navigation 
          title="My Trips"
          showBackButton={false}
        />
        <div className="page-container pt-4">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <Typography variant="h2" className="mb-ds-sm">
            No trips planned yet
          </Typography>
          <Typography variant="body" color="muted" className="mb-ds-lg max-w-sm">
            Start planning your first adventure! Create a trip to get started with your travel itinerary.
          </Typography>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation Header */}
      <Navigation 
        title="My Trips"
        showBackButton={false}
      />
      
      <div className="page-container pt-4">
        <div className="mb-ds-lg">
          <Typography variant="body" color="muted">
            {sortedTrips.length} {sortedTrips.length === 1 ? 'trip' : 'trips'} planned
          </Typography>
        </div>

      <div className="trip-grid">
        {sortedTrips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            onClick={onTripSelect}
          />
        ))}
      </div>
      </div>
    </div>
  );
}