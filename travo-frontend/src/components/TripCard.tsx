import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin } from "lucide-react"
import type { TripCardProps } from '@/types';
import { formatDateRange, getPlaceCount, getTripDuration } from '@/lib/utils';

/**
 * TripCard component - Simplified enhanced version
 * Uses enhanced Card component with gradient backgrounds and hover effects
 */
export function TripCard({ trip, onClick, className }: TripCardProps) {
  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const placeCount = getPlaceCount(trip);
  const duration = getTripDuration(trip.start_date, trip.end_date);

  return (
    <Card 
      variant="gradient" 
      interactive 
      onClick={() => onClick(trip.id)}
      className={`hover:shadow-lg transition-shadow ${className || ''}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">{trip.name}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{trip.description || 'Trip destination'}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{dateRange}</span>
          </div>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span className="px-2 py-1 bg-secondary rounded">{duration} {duration === 1 ? 'day' : 'days'}</span>
            <span className="px-2 py-1 border rounded">{placeCount} {placeCount === 1 ? 'place' : 'places'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}