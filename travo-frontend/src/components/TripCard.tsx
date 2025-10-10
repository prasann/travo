import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TripCardProps } from '@/types';
import { formatDateRange, getPlaceCount, getTripDuration } from '@/lib/utils';

/**
 * TripCard component - Displays individual trip information in the trip list
 * Used in TripList to show trip summary with name, dates, description, and place count
 */
export function TripCard({ trip, onClick, className }: TripCardProps) {
  const handleClick = () => {
    onClick(trip.id);
  };

  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const placeCount = getPlaceCount(trip);
  const duration = getTripDuration(trip.start_date, trip.end_date);

  return (
    <Card 
      className={`trip-card ${className || ''}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-balance">
          {trip.name}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {dateRange} • {duration} {duration === 1 ? 'day' : 'days'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {trip.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {trip.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {placeCount} {placeCount === 1 ? 'place' : 'places'}
          </span>
          <span className="text-primary font-medium">
            View details →
          </span>
        </div>
      </CardContent>
    </Card>
  );
}