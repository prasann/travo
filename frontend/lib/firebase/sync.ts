/**
 * Sync Service - Firestore to IndexedDB Synchronization
 * 
 * Feature: Firebase Integration - Phase 3
 * Date: 2025-10-14
 * 
 * This service handles syncing data from Firestore to IndexedDB.
 * Transforms Firestore documents to IndexedDB format and saves them.
 */

import { db } from '@/lib/db/schema';
import { 
  pullTripsForUser, 
  pullTripWithRelations,
  type FirestoreTripWithRelations 
} from '@/lib/firebase/firestore';
import type { Result } from '@/lib/db/models';
import { 
  tripFromFirestore,
  flightFromFirestore,
  hotelFromFirestore,
  activityFromFirestore,
  restaurantFromFirestore
} from '@/lib/firebase/converter';

/**
 * Save a trip with all related entities to IndexedDB
 * Uses a transaction to ensure all-or-nothing save
 */
async function saveTripToIndexedDB(tripData: FirestoreTripWithRelations): Promise<Result<void>> {
  try {
    console.log(`[Sync] Saving trip to IndexedDB: ${tripData.trip.name}`);
    
    // Transform all entities using bidirectional converters
    const trip = tripFromFirestore(tripData.trip);
    const flights = tripData.flights.map(flightFromFirestore);
    const hotels = tripData.hotels.map(hotelFromFirestore);
    const activities = tripData.activities.map(activityFromFirestore);
    const restaurants = tripData.restaurants.map(restaurantFromFirestore);
    
    // Save in a transaction
    await db.transaction('rw', [db.trips, db.flights, db.hotels, db.activities, db.restaurants], async () => {
      // Save trip
      await db.trips.put(trip);
      
      // Save all related entities
      if (flights.length > 0) {
        await db.flights.bulkPut(flights);
      }
      if (hotels.length > 0) {
        await db.hotels.bulkPut(hotels);
      }
      if (activities.length > 0) {
        await db.activities.bulkPut(activities);
      }
      if (restaurants.length > 0) {
        await db.restaurants.bulkPut(restaurants);
      }
    });
    
    console.log(`[Sync] Successfully saved trip: ${trip.name} (${flights.length} flights, ${hotels.length} hotels, ${activities.length} activities, ${restaurants.length} restaurants)`);
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[Sync] Error saving trip to IndexedDB:', error);
    return {
      success: false,
      error: {
        type: 'database',
        message: `Failed to save trip: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

/**
 * Pull all trips for a user from Firestore and save to IndexedDB
 * 
 * @param userEmail User's email address
 * @returns Result with count of synced trips
 */
export async function syncTripsFromFirestore(userEmail: string): Promise<Result<number>> {
  try {
    console.log(`[Sync] Starting sync for user: ${userEmail}`);
    
    // Pull trip list from Firestore
    const tripsResult = await pullTripsForUser(userEmail);
    if (!tripsResult.success) {
      return tripsResult as Result<number>;
    }
    
    const trips = tripsResult.data;
    console.log(`[Sync] Found ${trips.length} trips to sync`);
    
    // Pull and save each trip with relations
    let successCount = 0;
    const errors: string[] = [];
    
    for (const trip of trips) {
      const tripResult = await pullTripWithRelations(trip.id);
      if (!tripResult.success) {
        console.error(`[Sync] Failed to pull trip ${trip.id}:`, tripResult.error.message);
        errors.push(`${trip.name}: ${tripResult.error.message}`);
        continue;
      }
      
      const saveResult = await saveTripToIndexedDB(tripResult.data);
      if (!saveResult.success) {
        console.error(`[Sync] Failed to save trip ${trip.id}:`, saveResult.error.message);
        errors.push(`${trip.name}: ${saveResult.error.message}`);
        continue;
      }
      
      successCount++;
    }
    
    if (errors.length > 0) {
      console.warn(`[Sync] Completed with ${errors.length} errors:`, errors);
    }
    
    console.log(`[Sync] Successfully synced ${successCount}/${trips.length} trips`);
    
    return {
      success: true,
      data: successCount
    };
  } catch (error) {
    console.error('[Sync] Error during sync:', error);
    return {
      success: false,
      error: {
        type: 'database',
        message: `Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}

/**
 * Clear all local data from IndexedDB
 * Useful for testing and forcing a fresh sync
 */
export async function clearLocalData(): Promise<Result<void>> {
  try {
    console.log('[Sync] Clearing all local data...');
    
    await db.transaction('rw', [db.trips, db.flights, db.hotels, db.activities, db.restaurants], async () => {
      await db.trips.clear();
      await db.flights.clear();
      await db.hotels.clear();
      await db.activities.clear();
      await db.restaurants.clear();
    });
    
    console.log('[Sync] Local data cleared successfully');
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error('[Sync] Error clearing local data:', error);
    return {
      success: false,
      error: {
        type: 'database',
        message: `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
  }
}
