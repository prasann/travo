/**
 * Restaurant Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for RestaurantRecommendation entities
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../schema';
import type { RestaurantRecommendation, RestaurantInput, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';
import { addToQueue } from '@/lib/sync/SyncQueue';

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

/**
 * Create a new restaurant recommendation
 * Automatically generates ID and timestamp
 * Queues creation for Firestore sync
 */
export async function createRestaurant(input: RestaurantInput, userEmail?: string): Promise<Result<RestaurantRecommendation>> {
  return wrapDatabaseOperation(async () => {
    const now = new Date().toISOString();
    const restaurant: RestaurantRecommendation = {
      id: uuidv4(),
      ...input,
      updated_at: now,
      updated_by: userEmail || 'local'
    };
    
    await db.restaurants.add(restaurant);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'restaurant',
      entity_id: restaurant.id,
      operation: 'create',
      data: restaurant,
      trip_id: restaurant.trip_id
    });
    
    console.log(`[DB] Restaurant created and queued for sync: ${restaurant.id}`);
    
    return restaurant;
  });
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
  return wrapDatabaseOperation(async () => {
    const restaurant = await db.restaurants.get(id);
    
    if (!restaurant) {
      throw createNotFoundError('Restaurant', id);
    }
    
    const now = new Date().toISOString();
    const updatedRestaurant: RestaurantRecommendation = {
      ...restaurant,
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    };
    
    await db.restaurants.put(updatedRestaurant);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'restaurant',
      entity_id: id,
      operation: 'update',
      data: updatedRestaurant,
      trip_id: updatedRestaurant.trip_id
    });
    
    console.log(`[DB] Restaurant updated and queued for sync: ${id}`);
    
    return updatedRestaurant;
  });
}

/**
 * Delete a restaurant by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteRestaurant(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const restaurant = await db.restaurants.get(id);
    
    if (!restaurant) {
      throw createNotFoundError('Restaurant', id);
    }
    
    await db.restaurants.delete(id);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'restaurant',
      entity_id: id,
      operation: 'delete',
      trip_id: restaurant.trip_id
    });
    
    console.log(`[DB] Restaurant deleted and queued for sync: ${id}`);
  });
}
