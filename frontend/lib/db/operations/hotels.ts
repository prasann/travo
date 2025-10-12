/**
 * Hotel Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for Hotel entities
 */

import { db } from '../schema';
import type { Hotel, Result } from '../models';
import { wrapDatabaseOperation } from '../errors';

/**
 * Get all hotels for a trip
 * Returns hotels sorted by check_in_time
 */
export async function getHotelsByTripId(tripId: string): Promise<Result<Hotel[]>> {
  return wrapDatabaseOperation(async () => {
    const hotels = await db.hotels
      .where('trip_id')
      .equals(tripId)
      .sortBy('check_in_time');
    
    return hotels;
  });
}
