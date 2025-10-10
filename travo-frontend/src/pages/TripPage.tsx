import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TripDetails } from '@/components/TripDetails';
import type { Trip } from '@/types';
import tripsData from '@/data/trips.json';

/**
 * TripPage component - Page for displaying individual trip details
 * Loads specific trip data by ID and handles navigation back to trip list
 */
export function TripPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadTrip = async () => {
      try {
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Find the specific trip by ID
        const foundTrip = tripsData.trips.find(t => t.id === tripId);
        
        if (foundTrip) {
          setTrip(foundTrip);
          setNotFound(false);
        } else {
          setTrip(null);
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load trip:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      loadTrip();
    } else {
      setNotFound(true);
      setIsLoading(false);
    }
  }, [tripId]);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="page-container">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-10 bg-muted rounded w-32 mb-6"></div>
            
            <div className="border rounded-lg p-6 mb-6">
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>

            <div className="h-6 bg-muted rounded w-40 mb-4"></div>
            
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-grow border rounded-lg p-4">
                    <div className="h-5 bg-muted rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full mb-1"></div>
                    <div className="h-4 bg-muted rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || !trip) {
    return (
      <main className="min-h-screen bg-background">
        <div className="page-container">
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.291-2.209M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Trip Not Found
            </h1>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The trip you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Back to Trip List
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <TripDetails 
        trip={trip}
        onBack={handleBack}
      />
    </main>
  );
}