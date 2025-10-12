/**
 * Trip CRUD Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12 (Enhanced Model)
 */

import { db } from '../schema';
import type { Trip, TripWithPlaces, TripWithRelations, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';

/**
 * Get all active trips (excludes soft-deleted)
 * Returns trips sorted by start_date descending (newest first)
 */
export async function getAllTrips(): Promise<Result<Trip[]>> {
  return wrapDatabaseOperation(async () => {
    const trips = await db.trips
      .where('deleted')
      .equals(0)  // IndexedDB stores boolean as 0 (false) or 1 (true)
      .reverse()
      .sortBy('start_date');
    return trips;
  });
}

/**
 * Get a single trip by ID
 * Returns NotFoundError if trip doesn't exist or is deleted
 */
export async function getTripById(id: string): Promise<Result<Trip>> {
  return wrapDatabaseOperation(async () => {
    const trip = await db.trips.get(id);
    
    if (!trip || trip.deleted) {
      throw createNotFoundError('Trip', id);
    }
    
    return trip;
  });
}

/**
 * Get trip with all associated places (DEPRECATED - use getTripWithRelations)
 * Maintained for backward compatibility
 */
export async function getTripWithPlaces(id: string): Promise<Result<TripWithPlaces>> {
  return wrapDatabaseOperation(async () => {
    // Get the trip
    const trip = await db.trips.get(id);
    
    if (!trip || trip.deleted) {
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

/**
 * Get trip with all related entities (Enhanced Model)
 * Combines trip with flights, hotels, activities, and restaurants
 */
export async function getTripWithRelations(id: string): Promise<Result<TripWithRelations>> {
  return wrapDatabaseOperation(async () => {
    // Get the base trip
    const trip = await db.trips.get(id);
    
    if (!trip || trip.deleted) {
      throw createNotFoundError('Trip', id);
    }
    
    // Get all related entities in parallel
    const [flights, hotels, activities, restaurants] = await Promise.all([
      db.flights.where('trip_id').equals(id).sortBy('departure_time'),
      db.hotels.where('trip_id').equals(id).sortBy('check_in_time'),
      db.activities.where('trip_id').equals(id).toArray(),
      db.restaurants.where('trip_id').equals(id).toArray()
    ]);
    
    // Sort activities by date and order_index (since toArray doesn't sort)
    activities.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.order_index - b.order_index;
    });
    
    return {
      ...trip,
      flights,
      hotels,
      activities,
      restaurants
    };
  });
}
