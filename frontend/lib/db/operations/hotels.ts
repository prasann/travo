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
import { addToQueue } from '@/lib/sync/SyncQueue';

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
 * Queues creation for Firestore sync
 */
export async function createHotel(input: HotelInput, userEmail?: string): Promise<Result<Hotel>> {
  return wrapDatabaseOperation(async () => {
    const now = new Date().toISOString();
    const hotel: Hotel = {
      ...input,
      id: uuidv4(),
      updated_at: now,
      updated_by: userEmail || 'local'
    };
    
    await db.hotels.add(hotel);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'hotel',
      entity_id: hotel.id,
      operation: 'create',
      data: hotel,
      trip_id: hotel.trip_id
    });
    
    console.log(`[DB] Hotel created and queued for sync: ${hotel.id}`);
    
    return hotel;
  });
}

/**
 * Update a hotel's properties
 * Automatically updates timestamp
 * Queues update for Firestore sync
 */
export async function updateHotel(
  id: string,
  updates: Partial<Omit<Hotel, 'id' | 'trip_id' | 'updated_at'>>,
  userEmail?: string
): Promise<Result<Hotel>> {
  return wrapDatabaseOperation(async () => {
    const hotel = await db.hotels.get(id);
    
    if (!hotel) {
      throw createNotFoundError('Hotel', id);
    }
    
    const now = new Date().toISOString();
    const updatedHotel: Hotel = {
      ...hotel,
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    };
    
    await db.hotels.put(updatedHotel);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'hotel',
      entity_id: id,
      operation: 'update',
      data: updatedHotel,
      trip_id: updatedHotel.trip_id
    });
    
    console.log(`[DB] Hotel updated and queued for sync: ${id}`);
    
    return updatedHotel;
  });
}

/**
 * Delete a hotel by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteHotel(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const hotel = await db.hotels.get(id);
    
    if (!hotel) {
      throw createNotFoundError('Hotel', id);
    }
    
    await db.hotels.delete(id);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'hotel',
      entity_id: id,
      operation: 'delete',
      trip_id: hotel.trip_id
    });
    
    console.log(`[DB] Hotel deleted and queued for sync: ${id}`);
  });
}
