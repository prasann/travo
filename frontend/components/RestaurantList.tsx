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
          
          <div className="space-y-3">
            {restaurantsByCity[city].map((restaurant) => (
              <div key={restaurant.id} className="card bg-base-100 shadow-md">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-warning/10 flex items-center justify-center rounded">
                      <Utensils className="w-8 h-8 sm:w-10 sm:h-10 text-warning" />
                    </div>
                    
                    {/* Restaurant info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg mb-1">{restaurant.name}</h4>
                      
                      {restaurant.cuisine_type && (
                        <p className="text-xs sm:text-sm text-base-content/70 mb-1">
                          {restaurant.cuisine_type}
                        </p>
                      )}
                      
                      {restaurant.address && (
                        <p className="text-xs sm:text-sm text-base-content/60">
                          {restaurant.address}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Additional details */}
                  {(restaurant.phone || restaurant.website || restaurant.notes || restaurant.plus_code) && (
                    <div className="mt-3 pt-3 border-t border-base-300 space-y-2">
                      {restaurant.phone && (
                        <p className="text-xs sm:text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${restaurant.phone}`} className="link link-hover">
                            {restaurant.phone}
                          </a>
                        </p>
                      )}
                      
                      {restaurant.website && (
                        <p className="text-xs sm:text-sm flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={restaurant.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="link link-hover"
                          >
                            Visit website
                          </a>
                        </p>
                      )}
                      
                      {restaurant.notes && (
                        <p className="text-xs sm:text-sm text-base-content/80 mt-2">
                          {restaurant.notes}
                        </p>
                      )}
                      
                      {restaurant.plus_code && (
                        <p className="text-xs text-base-content/40 mt-2">
                          Plus Code: {restaurant.plus_code}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
