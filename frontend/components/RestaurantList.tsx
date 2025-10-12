/**
 * RestaurantList component - displays restaurant recommendations grouped by city
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { Utensils, Phone, Globe } from 'lucide-react';
import type { RestaurantRecommendation } from '@/types';

interface RestaurantListProps {
  restaurants: RestaurantRecommendation[];
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  // Group restaurants by city
  const restaurantsByCity = restaurants.reduce((acc, restaurant) => {
    const city = restaurant.city || 'Other';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(restaurant);
    return acc;
  }, {} as Record<string, RestaurantRecommendation[]>);

  const cities = Object.keys(restaurantsByCity).sort();

  return (
    <div className="mt-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Restaurant Recommendations</h2>
      
      {cities.map((city) => (
        <div key={city} className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-base-content/80">{city}</h3>
          
          <div className="space-y-2">
            {restaurantsByCity[city].map((restaurant) => (
              <div key={restaurant.id} className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-2 sm:p-3">
                  <div className="flex gap-2 items-start">
                    {/* Compact icon */}
                    <div className="flex-shrink-0 w-10 h-10 bg-warning/10 flex items-center justify-center rounded">
                      <Utensils className="w-5 h-5 text-warning" />
                    </div>
                    
                    {/* Restaurant info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base leading-tight">{restaurant.name}</h4>
                      
                      {restaurant.cuisine_type && (
                        <p className="text-xs text-base-content/70">
                          {restaurant.cuisine_type}
                        </p>
                      )}
                      
                      {restaurant.address && (
                        <p className="text-xs text-base-content/60 mt-0.5">
                          {restaurant.address}
                        </p>
                      )}
                      
                      {/* Inline contact info */}
                      <div className="flex flex-wrap gap-3 mt-1">
                        {restaurant.phone && (
                          <a href={`tel:${restaurant.phone}`} className="text-xs link link-hover flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {restaurant.phone}
                          </a>
                        )}
                        
                        {restaurant.website && (
                          <a 
                            href={restaurant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs link link-hover flex items-center gap-1"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                      
                      {restaurant.notes && (
                        <p className="text-xs text-base-content/70 mt-1.5 italic">
                          {restaurant.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
