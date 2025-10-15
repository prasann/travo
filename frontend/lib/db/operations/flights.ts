/**
 * Flight Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * Refactored: 2025-10-15 (Using base operations)
 * 
 * CRUD operations for Flight and FlightLeg entities
 */

import { db } from '../schema';
import type { Flight, FlightLeg, Result } from '../models';
import { wrapDatabaseOperation } from '../errors';
import { getByTripId, updateEntity, deleteEntity } from './base';

/**
 * Get all flights for a trip
 * Returns flights sorted by departure_time
 */
export async function getFlightsByTripId(tripId: string): Promise<Result<Flight[]>> {
  return getByTripId(
    db.flights,
    tripId,
    (a, b) => (a.departure_time || '').localeCompare(b.departure_time || '')
  );
}

/**
 * Get all flight legs for a specific flight
 * Returns legs sorted by leg_number
 */
export async function getFlightLegsByFlightId(flightId: string): Promise<Result<FlightLeg[]>> {
  return wrapDatabaseOperation(async () => {
    const legs = await db.flightLegs
      .where('flight_id')
      .equals(flightId)
      .sortBy('leg_number');
    
    return legs;
  });
}

/**
 * Update a flight's properties
 * Automatically updates timestamp
 * Queues update for Firestore sync
 */
export async function updateFlight(
  id: string,
  updates: Partial<Omit<Flight, 'id' | 'trip_id' | 'updated_at'>>,
  userEmail?: string
): Promise<Result<Flight>> {
  return updateEntity<Flight>(
    db.flights,
    'flight',
    'Flight',
    id,
    updates,
    userEmail
  );
}

/**
 * Delete a flight by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteFlight(id: string): Promise<Result<void>> {
  return deleteEntity<Flight>(
    db.flights,
    'flight',
    'Flight',
    id
  );
}
