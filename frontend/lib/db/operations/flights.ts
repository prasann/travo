/**
 * Flight Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for Flight and FlightLeg entities
 */

import { db } from '../schema';
import type { Flight, FlightLeg, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';
import { addToQueue } from '@/lib/sync/SyncQueue';

/**
 * Get all flights for a trip
 * Returns flights sorted by departure_time
 */
export async function getFlightsByTripId(tripId: string): Promise<Result<Flight[]>> {
  return wrapDatabaseOperation(async () => {
    const flights = await db.flights
      .where('trip_id')
      .equals(tripId)
      .sortBy('departure_time');
    
    return flights;
  });
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
  return wrapDatabaseOperation(async () => {
    const flight = await db.flights.get(id);
    
    if (!flight) {
      throw createNotFoundError('Flight', id);
    }
    
    const now = new Date().toISOString();
    const updatedFlight: Flight = {
      ...flight,
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    };
    
    await db.flights.put(updatedFlight);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'flight',
      entity_id: id,
      operation: 'update',
      data: updatedFlight,
      trip_id: updatedFlight.trip_id
    });
    
    console.log(`[DB] Flight updated and queued for sync: ${id}`);
    
    return updatedFlight;
  });
}

/**
 * Delete a flight by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteFlight(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const flight = await db.flights.get(id);
    
    if (!flight) {
      throw createNotFoundError('Flight', id);
    }
    
    await db.flights.delete(id);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'flight',
      entity_id: id,
      operation: 'delete',
      trip_id: flight.trip_id
    });
    
    console.log(`[DB] Flight deleted and queued for sync: ${id}`);
  });
}
