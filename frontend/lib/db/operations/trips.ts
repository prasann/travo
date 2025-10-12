/**
 * Trip CRUD Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import { db } from '../schema';
import type { Trip, TripWithPlaces, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';

/**
 * Get all active trips (excludes soft-deleted)
 */
export async function getAllTrips(): Promise<Result<Trip[]>> {
  return wrapDatabaseOperation(async () => {
    const trips = await db.trips
      .where('deleted')
      .equals(0)  // IndexedDB stores boolean as 0 (false) or 1 (true)
      .toArray();
    return trips;
  });
}

/**
 * Get a single trip by ID
 */
export async function getTripById(id: string): Promise<Result<Trip>> {
  return wrapDatabaseOperation(async () => {
    const trip = await db.trips.get(id);
    
    if (!trip) {
      throw createNotFoundError('Trip', id);
    }
    
    return trip;
  });
}

/**
 * Get trip with all associated places
 */
export async function getTripWithPlaces(id: string): Promise<Result<TripWithPlaces>> {
  return wrapDatabaseOperation(async () => {
    // Get the trip
    const trip = await db.trips.get(id);
    
    if (!trip) {
      throw createNotFoundError('Trip', id);
    }
    
    // Get associated places, sorted by order_index
    const places = await db.places
      .where('trip_id')
      .equals(id)
      .sortBy('order_index');
    
    // Combine into TripWithPlaces
    const tripWithPlaces: TripWithPlaces = {
      ...trip,
      places
    };
    
    return tripWithPlaces;
  });
}
