import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TripList } from '@/components/TripList';
import type { Trip } from '@/types';
import tripsData from '@/data/trips.json';

/**
 * HomePage component - Main page displaying the list of trips
 * Loads hardcoded trip data and handles navigation to trip details
 */
export function HomePage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for better UX (in real app this would be an API call)
    const loadTrips = async () => {
      try {
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Load trips from hardcoded data
        setTrips(tripsData.trips);
      } catch (error) {
        console.error('Failed to load trips:', error);
        // In a real app, you'd handle this error properly
        setTrips([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, []);

  const handleTripSelect = (tripId: string) => {
    // Navigate to trip details page
    navigate(`/trip/${tripId}`);
  };

  return (
    <main className="min-h-screen bg-background">
      <TripList 
        trips={trips}
        onTripSelect={handleTripSelect}
        isLoading={isLoading}
      />
    </main>
  );
}