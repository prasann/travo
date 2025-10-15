/**
 * Trip CRUD Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12 (Enhanced Model)
 */

import { db } from '../schema';
import type { Trip, TripWithRelations, TripUpdate, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';
import { addToQueue } from '@/lib/sync/SyncQueue';

/**
 * Get all active trips (excludes soft-deleted)
 * Returns trips sorted by start_date descending (newest first)
 */
export async function getAllTrips(): Promise<Result<Trip[]>> {
  return wrapDatabaseOperation(async () => {
    // Get all trips and filter out deleted ones (handles both boolean and number)
    const allTrips = await db.trips.toArray();
    const activeTrips = allTrips.filter(trip => !trip.deleted);
    
    // Sort by start_date descending (newest first)
    activeTrips.sort((a, b) => b.start_date.localeCompare(a.start_date));
    
    return activeTrips;
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

/**
 * Update an existing trip
 * Only updates provided fields, leaves others unchanged
 * Automatically updates updated_at timestamp
 * Queues update for sync to Firestore
 */
export async function updateTrip(update: TripUpdate, userEmail?: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const { id, ...updates } = update;
    
    // Verify trip exists and is not deleted
    const existingTrip = await db.trips.get(id);
    
    if (!existingTrip || existingTrip.deleted) {
      throw createNotFoundError('Trip', id);
    }
    
    // Update metadata
    const now = new Date().toISOString();
    const updatedData = {
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    };
    
    // Update the trip in IndexedDB
    await db.trips.update(id, updatedData);
    
    // Get the updated trip for sync queue
    const updatedTrip = await db.trips.get(id);
    if (!updatedTrip) {
      throw createNotFoundError('Trip', id);
    }
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'trip',
      entity_id: id,
      operation: 'update',
      data: updatedTrip
    });
    
    console.log(`[DB] Trip updated and queued for sync: ${id}`);
  });
}

/**
 * Soft delete a trip (sets deleted flag)
 * Also queues delete operation for Firestore sync
 */
export async function deleteTrip(id: string, userEmail?: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    // Verify trip exists
    const existingTrip = await db.trips.get(id);
    
    if (!existingTrip) {
      throw createNotFoundError('Trip', id);
    }
    
    if (existingTrip.deleted) {
      // Already deleted, nothing to do
      return;
    }
    
    // Soft delete the trip
    const now = new Date().toISOString();
    await db.trips.update(id, {
      deleted: true,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    });
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'trip',
      entity_id: id,
      operation: 'delete'
    });
    
    console.log(`[DB] Trip deleted and queued for sync: ${id}`);
  });
}
