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
import { wrapDatabaseOperation } from '../errors';

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
