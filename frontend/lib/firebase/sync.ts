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
import type { 
  Trip, 
  Flight, 
  FlightLeg,
  Hotel, 
  DailyActivity, 
  RestaurantRecommendation,
  Result 
} from '@/lib/db/models';
import type { 
  FirestoreTrip, 
  FirestoreFlight,
  FirestoreHotel, 
  FirestoreDailyActivity, 
  FirestoreRestaurant 
} from '@/lib/firebase/schema';
import { Timestamp } from 'firebase/firestore';

/**
 * Transform Firestore Trip to IndexedDB Trip format
 * 
 * Note: Firestore has a simplified schema. Some IndexedDB fields are
 * set to defaults or omitted since they don't exist in Firestore.
 */
function transformTrip(firestoreTrip: FirestoreTrip): Trip {
  return {
    id: firestoreTrip.id,
    name: firestoreTrip.name,
    description: `Trip to ${firestoreTrip.destination}`, // Map destination to description
    start_date: firestoreTrip.start_date,
    end_date: firestoreTrip.end_date,
    home_location: undefined, // Not stored in Firestore
    updated_at: firestoreTrip.updated_at, // Already ISO string
    deleted: false, // Trips from Firestore are active (not deleted)
    user_access: firestoreTrip.user_access,
    updated_by: firestoreTrip.updated_by
  };
}

/**
 * Transform Firestore Flight to IndexedDB Flight format
 * 
 * Note: Firestore flight schema is simplified with just direction
 * and legs. Most flight details are in legs (embedded).
 */
function transformFlight(firestoreFlight: FirestoreFlight): Flight {
  return {
    id: firestoreFlight.id,
    trip_id: firestoreFlight.trip_id,
    airline: undefined, // Flight details are in legs
    flight_number: undefined,
    departure_time: undefined,
    arrival_time: undefined,
    departure_location: undefined,
    arrival_location: undefined,
    confirmation_number: undefined,
    notes: `${firestoreFlight.direction} flight`, // Just store the direction
    updated_at: firestoreFlight.updated_at,
    updated_by: firestoreFlight.updated_by,
    legs: [] // Legs are stored separately in IndexedDB
  };
}

/**
 * Transform Firestore Hotel to IndexedDB Hotel format
 * 
 * Note: Firestore uses dates (check_in_date/check_out_date) instead of times
 */
function transformHotel(firestoreHotel: FirestoreHotel): Hotel {
  return {
    id: firestoreHotel.id,
    trip_id: firestoreHotel.trip_id,
    name: firestoreHotel.name,
    address: firestoreHotel.address,
    city: firestoreHotel.city,
    plus_code: firestoreHotel.plus_code,
    check_in_time: firestoreHotel.check_in_date, // Use date as time
    check_out_time: firestoreHotel.check_out_date, // Use date as time
    confirmation_number: undefined, // Not stored in Firestore
    phone: undefined, // Not stored in Firestore
    notes: undefined, // Not stored in Firestore
    updated_at: firestoreHotel.updated_at,
    updated_by: firestoreHotel.updated_by
  };
}

/**
 * Transform Firestore Activity to IndexedDB Activity format
 * 
 * Note: Firestore uses time_of_day instead of start_time
 */
function transformActivity(firestoreActivity: FirestoreDailyActivity): DailyActivity {
  return {
    id: firestoreActivity.id,
    trip_id: firestoreActivity.trip_id,
    name: firestoreActivity.name,
    date: firestoreActivity.date,
    start_time: undefined, // Firestore uses time_of_day instead
    duration_minutes: undefined, // Not stored in Firestore
    order_index: firestoreActivity.order_index,
    city: firestoreActivity.city,
    plus_code: firestoreActivity.plus_code,
    address: firestoreActivity.address,
    image_url: undefined, // Not stored in Firestore
    notes: firestoreActivity.notes,
    updated_at: firestoreActivity.updated_at,
    updated_by: firestoreActivity.updated_by
  };
}

/**
 * Transform Firestore Restaurant to IndexedDB Restaurant format
 */
function transformRestaurant(firestoreRestaurant: FirestoreRestaurant): RestaurantRecommendation {
  return {
    id: firestoreRestaurant.id,
    trip_id: firestoreRestaurant.trip_id,
    name: firestoreRestaurant.name,
    city: firestoreRestaurant.city,
    cuisine_type: firestoreRestaurant.cuisine_type,
    address: firestoreRestaurant.address,
    plus_code: firestoreRestaurant.plus_code,
    phone: undefined, // Not stored in Firestore
    website: undefined, // Not stored in Firestore  
    notes: firestoreRestaurant.notes,
    updated_at: firestoreRestaurant.updated_at,
    updated_by: firestoreRestaurant.updated_by
  };
}

/**
 * Save a trip with all related entities to IndexedDB
 * Uses a transaction to ensure all-or-nothing save
 */
async function saveTripToIndexedDB(tripData: FirestoreTripWithRelations): Promise<Result<void>> {
  try {
    console.log(`[Sync] Saving trip to IndexedDB: ${tripData.trip.name}`);
    
    // Transform all entities
    const trip = transformTrip(tripData.trip);
    const flights = tripData.flights.map(transformFlight);
    const hotels = tripData.hotels.map(transformHotel);
    const activities = tripData.activities.map(transformActivity);
    const restaurants = tripData.restaurants.map(transformRestaurant);
    
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
    
    await db.transaction('rw', [db.trips, db.flights, db.hotels, db.activities, db.restaurants, db.places], async () => {
      await db.trips.clear();
      await db.flights.clear();
      await db.hotels.clear();
      await db.activities.clear();
      await db.restaurants.clear();
      await db.places.clear();
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
