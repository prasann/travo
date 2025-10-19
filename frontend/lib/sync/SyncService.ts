/**
 * Sync Service - Push Operations to Firestore
 * 
 * Phase 4.2: Push Sync - Sync Service
 * Feature: firebase-integration
 * Date: 2025-10-14
 * 
 * This service handles pushing local changes to Firestore.
 * Processes the sync queue and uploads pending changes.
 */

'use client';

import { 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  serverTimestamp 
} from 'firebase/firestore';
import { db as firestore } from '../firebase/config';
import { 
  tripConverter, 
  flightConverter, 
  hotelConverter, 
  activityConverter, 
  restaurantConverter,
  tripToFirestore,
  flightToFirestore,
  hotelToFirestore,
  activityToFirestore,
  restaurantToFirestore
} from '../firebase/converter';
import { 
  getQueuedEntries, 
  removeFromQueue, 
  incrementRetry 
} from './SyncQueue';
import type { SyncQueueEntry } from '../db/models';
import type { 
  Trip, 
  Flight, 
  Hotel, 
  DailyActivity, 
  RestaurantRecommendation 
} from '../db/models';
import type {
  FirestoreTrip,
  FirestoreFlight,
  FirestoreHotel,
  FirestoreDailyActivity,
  FirestoreRestaurant
} from '../firebase/schema';

// Remove undefined fields from an object (Firestore rejects explicit undefined)
function sanitize<T extends Record<string, any>>(obj: T): T {
  const cleaned: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) cleaned[k] = v;
  }
  return cleaned as T;
}

/**
 * Maximum number of retries before giving up on a sync operation
 */
const MAX_RETRIES = 3;

/**
 * Push a trip to Firestore
 * 
 * @param trip Trip data to upload
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when upload is complete
 */
export async function pushTripToFirestore(trip: Trip, userEmail: string): Promise<void> {
  // console.log(`[Sync] Pushing trip to Firestore: ${trip.id}`);
  
  try {
    const tripRef = doc(firestore, 'trips', trip.id).withConverter(tripConverter);
    
    // Transform to Firestore format
    const firestoreTrip = tripToFirestore(trip);
    
    // Update metadata
    firestoreTrip.updated_by = userEmail;
    firestoreTrip.updated_at = new Date().toISOString();
    
    // Ensure user_access includes current user if not already present
    if (!firestoreTrip.user_access.includes(userEmail)) {
      firestoreTrip.user_access = [...firestoreTrip.user_access, userEmail];
    }
    
  await setDoc(tripRef, sanitize(firestoreTrip));
    // console.log(`[Sync] ✅ Trip pushed successfully: ${trip.id}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to push trip ${trip.id}:`, error);
    throw error;
  }
}

/**
 * Push a flight to Firestore (subcollection under trip)
 * 
 * @param flight Flight data to upload
 * @param tripId Parent trip ID
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when upload is complete
 */
export async function pushFlightToFirestore(
  flight: Flight, 
  tripId: string, 
  userEmail: string
): Promise<void> {
  console.log(`[Sync] Pushing flight to Firestore: ${flight.id} (trip: ${tripId})`);
  
  try {
    const flightRef = doc(firestore, 'trips', tripId, 'flights', flight.id)
      .withConverter(flightConverter);
    
    // Transform to Firestore format
    const firestoreFlight = flightToFirestore(flight);
    
    // Update metadata
    firestoreFlight.updated_by = userEmail;
    firestoreFlight.updated_at = new Date().toISOString();
    
  await setDoc(flightRef, sanitize(firestoreFlight));
    console.log(`[Sync] ✅ Flight pushed successfully: ${flight.id}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to push flight ${flight.id}:`, error);
    throw error;
  }
}

/**
 * Push a hotel to Firestore (subcollection under trip)
 * 
 * @param hotel Hotel data to upload
 * @param tripId Parent trip ID
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when upload is complete
 */
export async function pushHotelToFirestore(
  hotel: Hotel, 
  tripId: string, 
  userEmail: string
): Promise<void> {
  console.log(`[Sync] Pushing hotel to Firestore: ${hotel.id} (trip: ${tripId})`);
  
  try {
    const hotelRef = doc(firestore, 'trips', tripId, 'hotels', hotel.id)
      .withConverter(hotelConverter);
    
    // Transform to Firestore format
    const firestoreHotel = hotelToFirestore(hotel);
    
    // Update metadata
    firestoreHotel.updated_by = userEmail;
    firestoreHotel.updated_at = new Date().toISOString();
    
  await setDoc(hotelRef, sanitize(firestoreHotel));
    console.log(`[Sync] ✅ Hotel pushed successfully: ${hotel.id}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to push hotel ${hotel.id}:`, error);
    throw error;
  }
}

/**
 * Push an activity to Firestore (subcollection under trip)
 * 
 * @param activity Activity data to upload
 * @param tripId Parent trip ID
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when upload is complete
 */
export async function pushActivityToFirestore(
  activity: DailyActivity, 
  tripId: string, 
  userEmail: string
): Promise<void> {
  console.log(`[Sync] Pushing activity to Firestore: ${activity.id} (trip: ${tripId})`);
  
  try {
    const activityRef = doc(firestore, 'trips', tripId, 'activities', activity.id)
      .withConverter(activityConverter);
    
    // Transform to Firestore format
    const firestoreActivity = activityToFirestore(activity);
    
    // Update metadata
    firestoreActivity.updated_by = userEmail;
    firestoreActivity.updated_at = new Date().toISOString();
    
  await setDoc(activityRef, sanitize(firestoreActivity));
    console.log(`[Sync] ✅ Activity pushed successfully: ${activity.id}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to push activity ${activity.id}:`, error);
    throw error;
  }
}

/**
 * Push a restaurant to Firestore (subcollection under trip)
 * 
 * @param restaurant Restaurant data to upload
 * @param tripId Parent trip ID
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when upload is complete
 */
export async function pushRestaurantToFirestore(
  restaurant: RestaurantRecommendation, 
  tripId: string, 
  userEmail: string
): Promise<void> {
  console.log(`[Sync] Pushing restaurant to Firestore: ${restaurant.id} (trip: ${tripId})`);
  
  try {
    const restaurantRef = doc(firestore, 'trips', tripId, 'restaurants', restaurant.id)
      .withConverter(restaurantConverter);
    
    // Transform to Firestore format
    const firestoreRestaurant = restaurantToFirestore(restaurant);
    
    // Update metadata
    firestoreRestaurant.updated_by = userEmail;
    firestoreRestaurant.updated_at = new Date().toISOString();
    
  await setDoc(restaurantRef, sanitize(firestoreRestaurant));
    console.log(`[Sync] ✅ Restaurant pushed successfully: ${restaurant.id}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to push restaurant ${restaurant.id}:`, error);
    throw error;
  }
}

/**
 * Delete a trip from Firestore (soft delete - set deleted flag)
 * 
 * @param tripId Trip ID to delete
 * @param userEmail User's email (for updated_by field)
 * @returns Promise that resolves when delete is complete
 */
export async function deleteTripFromFirestore(tripId: string, userEmail: string): Promise<void> {
  console.log(`[Sync] Deleting trip from Firestore: ${tripId}`);
  
  try {
    const tripRef = doc(firestore, 'trips', tripId);
    
    // Soft delete: set deleted flag and updated_by
    await updateDoc(tripRef, {
      deleted: true,
      updated_by: userEmail,
      updated_at: new Date().toISOString(),
    });
    
    console.log(`[Sync] ✅ Trip deleted successfully: ${tripId}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to delete trip ${tripId}:`, error);
    throw error;
  }
}

/**
 * Delete an entity from Firestore (subcollection)
 * 
 * @param entityType Type of entity to delete
 * @param entityId Entity ID to delete
 * @param tripId Parent trip ID
 * @returns Promise that resolves when delete is complete
 */
export async function deleteEntityFromFirestore(
  entityType: 'flight' | 'hotel' | 'activity' | 'restaurant',
  entityId: string,
  tripId: string
): Promise<void> {
  console.log(`[Sync] Deleting ${entityType} from Firestore: ${entityId} (trip: ${tripId})`);
  
  try {
    const collectionName = `${entityType}s`; // flights, hotels, activities, restaurants
    const entityRef = doc(firestore, 'trips', tripId, collectionName, entityId);
    
    await deleteDoc(entityRef);
    console.log(`[Sync] ✅ ${entityType} deleted successfully: ${entityId}`);
  } catch (error) {
    console.error(`[Sync] ❌ Failed to delete ${entityType} ${entityId}:`, error);
    throw error;
  }
}

/**
 * Process a single sync queue entry
 * 
 * @param entry Sync queue entry to process
 * @param userEmail User's email for updated_by tracking
 * @returns Promise that resolves to true if successful, false if failed
 */
async function processSyncEntry(entry: SyncQueueEntry, userEmail: string): Promise<boolean> {
  try {
    console.log(`[Sync] Processing queue entry: ${entry.operation} ${entry.entity_type} ${entry.entity_id}`);
    
    // Handle delete operations
    if (entry.operation === 'delete') {
      if (entry.entity_type === 'trip') {
        await deleteTripFromFirestore(entry.entity_id, userEmail);
      } else if (entry.trip_id) {
        await deleteEntityFromFirestore(entry.entity_type, entry.entity_id, entry.trip_id);
      } else {
        throw new Error(`Missing trip_id for ${entry.entity_type} delete operation`);
      }
      return true;
    }
    
    // Handle create/update operations (both use setDoc with merge)
    if (!entry.data) {
      throw new Error(`Missing data for ${entry.operation} operation`);
    }
    
    switch (entry.entity_type) {
      case 'trip':
        await pushTripToFirestore(entry.data, userEmail);
        break;
        
      case 'flight':
        if (!entry.trip_id) {
          throw new Error('Missing trip_id for flight operation');
        }
        await pushFlightToFirestore(entry.data, entry.trip_id, userEmail);
        break;
        
      case 'hotel':
        if (!entry.trip_id) {
          throw new Error('Missing trip_id for hotel operation');
        }
        await pushHotelToFirestore(entry.data, entry.trip_id, userEmail);
        break;
        
      case 'activity':
        if (!entry.trip_id) {
          throw new Error('Missing trip_id for activity operation');
        }
        await pushActivityToFirestore(entry.data, entry.trip_id, userEmail);
        break;
        
      case 'restaurant':
        if (!entry.trip_id) {
          throw new Error('Missing trip_id for restaurant operation');
        }
        await pushRestaurantToFirestore(entry.data, entry.trip_id, userEmail);
        break;
        
      default:
        throw new Error(`Unknown entity type: ${entry.entity_type}`);
    }
    
    return true;
  } catch (error) {
    console.error(`[Sync] Failed to process entry ${entry.id}:`, error);
    return false;
  }
}

/**
 * Process all pending entries in the sync queue
 * Uploads changes to Firestore and removes successful entries
 * 
 * @param userEmail User's email for updated_by tracking
 * @returns Promise with summary of processed entries
 */
export async function processQueue(userEmail: string): Promise<{
  success: number;
  failed: number;
  total: number;
}> {
  console.log('[Sync] Starting queue processing...');
  
  const entries = await getQueuedEntries();
  const total = entries.length;
  
  if (total === 0) {
    console.log('[Sync] Queue is empty, nothing to process');
    return { success: 0, failed: 0, total: 0 };
  }
  
  console.log(`[Sync] Processing ${total} queue entries...`);
  
  let successCount = 0;
  let failedCount = 0;
  
  // Process each entry sequentially to avoid conflicts
  for (const entry of entries) {
    // Skip entries that have exceeded max retries
    if (entry.retries >= MAX_RETRIES) {
      console.warn(`[Sync] Skipping entry ${entry.id} - max retries exceeded`);
      failedCount++;
      continue;
    }
    
    const success = await processSyncEntry(entry, userEmail);
    
    if (success) {
      // Remove from queue on success
      await removeFromQueue(entry.id);
      successCount++;
    } else {
      // Increment retry count on failure
      const errorMsg = 'Sync operation failed';
      await incrementRetry(entry.id, errorMsg);
      failedCount++;
    }
  }
  
  console.log(`[Sync] Queue processing complete: ${successCount} success, ${failedCount} failed, ${total} total`);
  
  return {
    success: successCount,
    failed: failedCount,
    total
  };
}

/**
 * Trigger sync processing if user is authenticated
 * This is a convenience function that checks auth state and processes queue
 * 
 * @param userEmail User's email (optional, will skip if not provided)
 * @returns Promise with processing summary or null if user not authenticated
 */
export async function triggerSync(userEmail?: string | null): Promise<{
  success: number;
  failed: number;
  total: number;
} | null> {
  if (!userEmail) {
    console.log('[Sync] No user authenticated, skipping sync');
    return null;
  }
  
  return await processQueue(userEmail);
}
