/**
 * Firestore Data Service - Pull Operations
 * 
 * Feature: Firebase Integration - Phase 3
 * Date: 2025-10-14
 * 
 * This service handles pulling trip data from Firestore to IndexedDB.
 * Implements read-only operations for Phase 3 (pull sync).
 */

'use client';

import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  CollectionReference,
  DocumentData
} from 'firebase/firestore';
import { db as firestore } from './config';
import { 
  tripConverter, 
  flightConverter, 
  hotelConverter, 
  activityConverter, 
  restaurantConverter 
} from './converter';
import type { 
  FirestoreTrip, 
  FirestoreFlight, 
  FirestoreHotel, 
  FirestoreDailyActivity, 
  FirestoreRestaurant 
} from './schema';
import type { Result } from '@/lib/db/models';
import { ok, err } from '@/lib/db/errors';
import { isOk, unwrap } from '@/lib/db/resultHelpers';

/**
 * Trip data with all related entities loaded from Firestore
 */
export interface FirestoreTripWithRelations {
  trip: FirestoreTrip;
  flights: FirestoreFlight[];
  hotels: FirestoreHotel[];
  activities: FirestoreDailyActivity[];
  restaurants: FirestoreRestaurant[];
}

/**
 * Pull all trips that a user has access to
 * 
 * @param userEmail User's email address
 * @returns Result with array of FirestoreTrip objects
 */
export async function pullTripsForUser(userEmail: string): Promise<Result<FirestoreTrip[]>> {
  try {
    console.log(`[Firestore] Pulling trips for user: ${userEmail}`);
    
    // Query trips where user_access array contains the user's email
    const tripsRef = collection(firestore, 'trips').withConverter(tripConverter);
    const q = query(
      tripsRef,
      where('user_access', 'array-contains', userEmail)
    );
    
    const querySnapshot = await getDocs(q);
    const trips: FirestoreTrip[] = [];
    
    querySnapshot.forEach((doc) => {
      const tripData = doc.data();
      if (tripData) {
        trips.push(tripData);
      }
    });
    
    console.log(`[Firestore] Found ${trips.length} trips for user`);
    
    return ok(trips);
  } catch (error) {
    console.error('[Firestore] Error pulling trips for user:', error);
    return err({
      type: 'database',
      message: `Failed to pull trips: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Pull a single trip with all related entities (subcollections)
 * 
 * @param tripId Trip document ID
 * @returns Result with trip and all related data
 */
export async function pullTripWithRelations(tripId: string): Promise<Result<FirestoreTripWithRelations>> {
  try {
    console.log(`[Firestore] Pulling trip with relations: ${tripId}`);
    
    // Get the trip document
    const tripRef = doc(firestore, 'trips', tripId).withConverter(tripConverter);
    const tripDoc = await getDoc(tripRef);
    
    if (!tripDoc.exists()) {
      return err({
        type: 'not_found',
        message: `Trip not found: ${tripId}`
      });
    }
    
    const trip = tripDoc.data();
    if (!trip) {
      return err({
        type: 'validation',
        message: `Trip data is invalid: ${tripId}`
      });
    }
    
    // Pull all subcollections in parallel
    const [flightsResult, hotelsResult, activitiesResult, restaurantsResult] = await Promise.all([
      pullFlightsForTrip(tripId),
      pullHotelsForTrip(tripId),
      pullActivitiesForTrip(tripId),
      pullRestaurantsForTrip(tripId)
    ]);
    
    // Check for errors
    if (!isOk(flightsResult)) {
      return err(flightsResult._unsafeUnwrapErr());
    }
    if (!isOk(hotelsResult)) {
      return err(hotelsResult._unsafeUnwrapErr());
    }
    if (!isOk(activitiesResult)) {
      return err(activitiesResult._unsafeUnwrapErr());
    }
    if (!isOk(restaurantsResult)) {
      return err(restaurantsResult._unsafeUnwrapErr());
    }
    
    const flights = unwrap(flightsResult);
    const hotels = unwrap(hotelsResult);
    const activities = unwrap(activitiesResult);
    const restaurants = unwrap(restaurantsResult);
    
    console.log(`[Firestore] Successfully pulled trip with ${flights.length} flights, ${hotels.length} hotels, ${activities.length} activities, ${restaurants.length} restaurants`);
    
    return ok({
      trip,
      flights,
      hotels,
      activities,
      restaurants
    });
  } catch (error) {
    console.error('[Firestore] Error pulling trip with relations:', error);
    return err({
      type: 'database',
      message: `Failed to pull trip: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Pull all flights for a trip (subcollection)
 * 
 * @param tripId Trip document ID
 * @returns Result with array of FirestoreFlight objects
 */
async function pullFlightsForTrip(tripId: string): Promise<Result<FirestoreFlight[]>> {
  try {
    const flightsRef = collection(firestore, 'trips', tripId, 'flights').withConverter(flightConverter);
    const querySnapshot = await getDocs(flightsRef);
    
    const flights: FirestoreFlight[] = [];
    querySnapshot.forEach((doc) => {
      const flightData = doc.data();
      if (flightData) {
        flights.push(flightData);
      }
    });
    
    return ok(flights);
  } catch (error) {
    console.error('[Firestore] Error pulling flights:', error);
    return err({
      type: 'database',
      message: `Failed to pull flights: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Pull all hotels for a trip (subcollection)
 * 
 * @param tripId Trip document ID
 * @returns Result with array of FirestoreHotel objects
 */
async function pullHotelsForTrip(tripId: string): Promise<Result<FirestoreHotel[]>> {
  try {
    const hotelsRef = collection(firestore, 'trips', tripId, 'hotels').withConverter(hotelConverter);
    const querySnapshot = await getDocs(hotelsRef);
    
    const hotels: FirestoreHotel[] = [];
    querySnapshot.forEach((doc) => {
      const hotelData = doc.data();
      if (hotelData) {
        hotels.push(hotelData);
      }
    });
    
    return ok(hotels);
  } catch (error) {
    console.error('[Firestore] Error pulling hotels:', error);
    return err({
      type: 'database',
      message: `Failed to pull hotels: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Pull all activities for a trip (subcollection)
 * 
 * @param tripId Trip document ID
 * @returns Result with array of FirestoreDailyActivity objects
 */
async function pullActivitiesForTrip(tripId: string): Promise<Result<FirestoreDailyActivity[]>> {
  try {
    const activitiesRef = collection(firestore, 'trips', tripId, 'activities').withConverter(activityConverter);
    const querySnapshot = await getDocs(activitiesRef);
    
    const activities: FirestoreDailyActivity[] = [];
    querySnapshot.forEach((doc) => {
      const activityData = doc.data();
      if (activityData) {
        activities.push(activityData);
      }
    });
    
    return ok(activities);
  } catch (error) {
    console.error('[Firestore] Error pulling activities:', error);
    return err({
      type: 'database',
      message: `Failed to pull activities: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

/**
 * Pull all restaurants for a trip (subcollection)
 * 
 * @param tripId Trip document ID
 * @returns Result with array of FirestoreRestaurant objects
 */
async function pullRestaurantsForTrip(tripId: string): Promise<Result<FirestoreRestaurant[]>> {
  try {
    const restaurantsRef = collection(firestore, 'trips', tripId, 'restaurants').withConverter(restaurantConverter);
    const querySnapshot = await getDocs(restaurantsRef);
    
    const restaurants: FirestoreRestaurant[] = [];
    querySnapshot.forEach((doc) => {
      const restaurantData = doc.data();
      if (restaurantData) {
        restaurants.push(restaurantData);
      }
    });
    
    return ok(restaurants);
  } catch (error) {
    console.error('[Firestore] Error pulling restaurants:', error);
    return err({
      type: 'database',
      message: `Failed to pull restaurants: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}
