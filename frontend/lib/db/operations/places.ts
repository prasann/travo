/**
 * Place CRUD Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import { db } from '../schema';
import type { Place, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';

/**
 * Get all places for a specific trip
 */
export async function getPlacesByTripId(tripId: string): Promise<Result<Place[]>> {
  return wrapDatabaseOperation(async () => {
    const places = await db.places
      .where('trip_id')
      .equals(tripId)
      .sortBy('order_index');
    return places;
  });
}

/**
 * Get a single place by ID
 */
export async function getPlaceById(id: string): Promise<Result<Place>> {
  return wrapDatabaseOperation(async () => {
    const place = await db.places.get(id);
    
    if (!place) {
      throw createNotFoundError('Place', id);
    }
    
    return place;
  });
}
