/**
 * Restaurant Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for RestaurantRecommendation entities
 */

import { db } from '../schema';
import type { RestaurantRecommendation, Result } from '../models';
import { wrapDatabaseOperation } from '../errors';

/**
 * Get all restaurant recommendations for a trip
 * Returns restaurants grouped by city (sorted alphabetically by city, then by name)
 */
export async function getRestaurantsByTripId(tripId: string): Promise<Result<RestaurantRecommendation[]>> {
  return wrapDatabaseOperation(async () => {
    const restaurants = await db.restaurants
      .where('trip_id')
      .equals(tripId)
      .toArray();
    
    // Sort by city, then by name
    restaurants.sort((a, b) => {
      const cityA = a.city || '';
      const cityB = b.city || '';
      const cityCompare = cityA.localeCompare(cityB);
      if (cityCompare !== 0) return cityCompare;
      return a.name.localeCompare(b.name);
    });
    
    return restaurants;
  });
}
