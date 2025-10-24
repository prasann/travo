/**
 * RecosTab - Restaurant Recommendations Tab with City Filter
 * 
 * Feature: Restaurant Recommendations Tab
 * Purpose: Display all restaurant recommendations with city-based filtering
 */

'use client';

import { useState, useMemo } from 'react';
import { RestaurantList } from './RestaurantList';
import type { RestaurantRecommendation } from '@/types';

interface RecosTabProps {
  restaurants: RestaurantRecommendation[];
}

export default function RecosTab({ restaurants }: RecosTabProps) {
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // Extract unique cities from restaurants
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    restaurants.forEach((restaurant) => {
      if (restaurant.city) {
        citySet.add(restaurant.city);
      }
    });
    return Array.from(citySet).sort();
  }, [restaurants]);

  // Filter restaurants by selected city
  const filteredRestaurants = useMemo(() => {
    if (selectedCity === 'all') {
      return restaurants;
    }
    return restaurants.filter((r) => r.city === selectedCity);
  }, [restaurants, selectedCity]);

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/60">
        No restaurant recommendations yet
      </div>
    );
  }

  return (
    <div>
      {/* City Filter */}
      {cities.length > 1 && (
        <div className="mb-6">
          <div className="form-control w-full max-w-xs">
            <label className="label">
              <span className="label-text font-semibold">Filter by City</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="all">All Cities ({restaurants.length})</option>
              {cities.map((city) => {
                const count = restaurants.filter((r) => r.city === city).length;
                return (
                  <option key={city} value={city}>
                    {city} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Restaurant List */}
      {filteredRestaurants.length > 0 ? (
        <RestaurantList restaurants={filteredRestaurants} />
      ) : (
        <div className="text-center py-8 text-base-content/60">
          No restaurants found in {selectedCity}
        </div>
      )}
    </div>
  );
}
