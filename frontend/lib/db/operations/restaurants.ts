/**
 * Restaurant Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * Refactored: 2025-10-15 (Using base operations)
 * 
 * CRUD operations for RestaurantRecommendation entities
 */

import { db } from '../schema';
import type { RestaurantRecommendation, RestaurantInput, Result } from '../models';
import { getByTripId, createEntity, updateEntity, deleteEntity } from './base';

/**
 * Get all restaurant recommendations for a trip
 * Returns restaurants grouped by city (sorted alphabetically by city, then by name)
 */
export async function getRestaurantsByTripId(tripId: string): Promise<Result<RestaurantRecommendation[]>> {
  return getByTripId(
    db.restaurants,
    tripId,
    (a, b) => {
      const cityA = a.city || '';
      const cityB = b.city || '';
      const cityCompare = cityA.localeCompare(cityB);
      if (cityCompare !== 0) return cityCompare;
      return a.name.localeCompare(b.name);
    }
  );
}

/**
 * Create a new restaurant recommendation
 * Automatically generates ID and timestamp
 * Queues creation for Firestore sync
 */
export async function createRestaurant(input: RestaurantInput, userEmail?: string): Promise<Result<RestaurantRecommendation>> {
  return createEntity<RestaurantRecommendation, RestaurantInput>(
    db.restaurants,
    'restaurant',
    input,
    userEmail
  );
}

/**
 * Update a restaurant's properties
 * Automatically updates timestamp
 * Queues update for Firestore sync
 */
export async function updateRestaurant(
  id: string,
  updates: Partial<Omit<RestaurantRecommendation, 'id' | 'trip_id' | 'updated_at'>>,
  userEmail?: string
): Promise<Result<RestaurantRecommendation>> {
  return updateEntity<RestaurantRecommendation>(
    db.restaurants,
    'restaurant',
    'Restaurant',
    id,
    updates,
    userEmail
  );
}

/**
 * Delete a restaurant by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteRestaurant(id: string): Promise<Result<void>> {
  return deleteEntity<RestaurantRecommendation>(
    db.restaurants,
    'restaurant',
    'Restaurant',
    id
  );
}
