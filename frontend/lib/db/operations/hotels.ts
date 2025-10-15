/**
 * Hotel Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * Refactored: 2025-10-15 (Using base operations)
 * 
 * CRUD operations for Hotel entities
 */

import { db } from '../schema';
import type { Hotel, HotelInput, Result } from '../models';
import { getByTripId, createEntity, updateEntity, deleteEntity } from './base';

/**
 * Get all hotels for a trip
 * Returns hotels sorted by check_in_time
 */
export async function getHotelsByTripId(tripId: string): Promise<Result<Hotel[]>> {
  return getByTripId(
    db.hotels,
    tripId,
    (a, b) => (a.check_in_time || '').localeCompare(b.check_in_time || '')
  );
}

/**
 * Create a new hotel
 * Automatically generates ID and timestamp
 * Queues creation for Firestore sync
 */
export async function createHotel(input: HotelInput, userEmail?: string): Promise<Result<Hotel>> {
  return createEntity<Hotel, HotelInput>(
    db.hotels,
    'hotel',
    input,
    userEmail
  );
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
  return updateEntity<Hotel>(
    db.hotels,
    'hotel',
    'Hotel',
    id,
    updates,
    userEmail
  );
}

/**
 * Delete a hotel by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteHotel(id: string): Promise<Result<void>> {
  return deleteEntity<Hotel>(
    db.hotels,
    'hotel',
    'Hotel',
    id
  );
}
