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
 */
export async function updateFlight(
  id: string,
  updates: Partial<Omit<Flight, 'id' | 'trip_id' | 'updated_at'>>
): Promise<Result<Flight>> {
  return wrapDatabaseOperation(async () => {
    const flight = await db.flights.get(id);
    
    if (!flight) {
      throw createNotFoundError('Flight', id);
    }
    
    const updatedFlight: Flight = {
      ...flight,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await db.flights.put(updatedFlight);
    
    return updatedFlight;
  });
}
