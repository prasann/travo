import { TripCard as DSCard } from './design-system/TripCard';
import type { TripCardProps } from '@/types';
import { formatDateRange, getPlaceCount, getTripDuration } from '@/lib/utils';

/**
 * TripCard component - Enhanced with design system
 * Uses the new design system TripCard with gradient backgrounds and improved typography
 */
export function TripCard({ trip, onClick, className }: TripCardProps) {
  const handleViewDetails = (tripId: string) => {
    onClick(tripId);
  };

  const dateRange = formatDateRange(trip.start_date, trip.end_date);
  const placeCount = getPlaceCount(trip);
  const duration = getTripDuration(trip.start_date, trip.end_date);

  // Transform trip data to match design system interface
  const dsTrip = {
    id: trip.id,
    title: trip.name,
    destination: trip.description || dateRange,
    startDate: trip.start_date,
    endDate: trip.end_date,
    duration: `${duration} ${duration === 1 ? 'day' : 'days'}`,
    placeCount: placeCount
  };

  return (
    <DSCard
      className={className}
      trip={dsTrip}
      onViewDetails={handleViewDetails}
      variant="gradient"
      size="md"
    />
  );
}