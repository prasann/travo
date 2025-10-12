/**
 * Hotel Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for Hotel entities
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../schema';
import type { Hotel, HotelInput, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';

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

/**
 * Create a new hotel
 * Automatically generates ID and timestamp
 */
export async function createHotel(input: HotelInput): Promise<Result<Hotel>> {
  return wrapDatabaseOperation(async () => {
    const hotel: Hotel = {
      id: uuidv4(),
      updated_at: new Date().toISOString(),
      ...input
    };
    
    await db.hotels.add(hotel);
    
    return hotel;
  });
}

/**
 * Update a hotel's properties
 * Automatically updates timestamp
 */
export async function updateHotel(
  id: string,
  updates: Partial<Omit<Hotel, 'id' | 'trip_id' | 'updated_at'>>
): Promise<Result<Hotel>> {
  return wrapDatabaseOperation(async () => {
    const hotel = await db.hotels.get(id);
    
    if (!hotel) {
      throw createNotFoundError('Hotel', id);
    }
    
    const updatedHotel: Hotel = {
      ...hotel,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await db.hotels.put(updatedHotel);
    
    return updatedHotel;
  });
}

/**
 * Delete a hotel by ID
 */
export async function deleteHotel(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const hotel = await db.hotels.get(id);
    
    if (!hotel) {
      throw createNotFoundError('Hotel', id);
    }
    
    await db.hotels.delete(id);
  });
}
