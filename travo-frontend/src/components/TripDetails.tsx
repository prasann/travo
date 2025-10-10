import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceCard } from './PlaceCard';
import type { TripDetailsProps } from '@/types';
import { formatDateRange, getTripDuration, sortPlacesByOrder } from '@/lib/utils';

/**
 * TripDetails component - Displays comprehensive trip information and all places
 * Shows trip header info, description, and ordered list of places
 */
export function TripDetails({ trip, onBack }: TripDetailsProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const duration = getTripDuration(trip.start_date, trip.end_date);
  const sortedPlaces = sortPlacesByOrder(trip.places);

  return (
    <div className="page-container">
      {/* Header with back button */}
      <div className="nav-header mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="p-2 hover:bg-muted"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Trips
        </Button>
      </div>

      {/* Trip Information Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-balance">
            {trip.name}
          </CardTitle>
          <CardDescription className="text-base">
            {dateRange} • {duration} {duration === 1 ? 'day' : 'days'}
          </CardDescription>
        </CardHeader>
        
        {trip.description && (
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {trip.description}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Places Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Itinerary
        </h2>
        <p className="text-muted-foreground">
          {sortedPlaces.length} {sortedPlaces.length === 1 ? 'place' : 'places'} planned
        </p>
      </div>

      {/* Places List */}
      {sortedPlaces.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent className="pt-6">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
            <h3 className="font-semibold text-foreground mb-2">
              No places added yet
            </h3>
            <p className="text-muted-foreground">
              Start planning your itinerary by adding places to visit.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedPlaces.map((place, index) => (
            <div key={place.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mt-1">
                {index + 1}
              </div>
              <div className="flex-grow">
                <PlaceCard place={place} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}