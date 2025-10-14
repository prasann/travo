/**
 * Activity Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for DailyActivity entities
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../schema';
import type { DailyActivity, ActivityInput, Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';
import { addToQueue } from '@/lib/sync/SyncQueue';

/**
 * Get all activities for a trip
 * Returns activities sorted by date, then order_index
 */
export async function getActivitiesByTripId(tripId: string): Promise<Result<DailyActivity[]>> {
  return wrapDatabaseOperation(async () => {
    const activities = await db.activities
      .where('trip_id')
      .equals(tripId)
      .toArray();
    
    // Sort by date and order_index
    activities.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.order_index - b.order_index;
    });
    
    return activities;
  });
}

/**
 * Create a new activity
 * Automatically generates ID and timestamp
 * Queues creation for Firestore sync
 */
export async function createActivity(input: ActivityInput, userEmail?: string): Promise<Result<DailyActivity>> {
  return wrapDatabaseOperation(async () => {
    const now = new Date().toISOString();
    const activity: DailyActivity = {
      id: uuidv4(),
      ...input,
      updated_at: now,
      updated_by: userEmail || 'local'
    };
    
    await db.activities.add(activity);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'activity',
      entity_id: activity.id,
      operation: 'create',
      data: activity,
      trip_id: activity.trip_id
    });
    
    console.log(`[DB] Activity created and queued for sync: ${activity.id}`);
    
    return activity;
  });
}

/**
 * Update an activity's properties
 * Automatically updates timestamp
 * Queues update for Firestore sync
 */
export async function updateActivity(
  id: string,
  updates: Partial<Omit<DailyActivity, 'id' | 'trip_id' | 'date' | 'updated_at'>>,
  userEmail?: string
): Promise<Result<DailyActivity>> {
  return wrapDatabaseOperation(async () => {
    const activity = await db.activities.get(id);
    
    if (!activity) {
      throw createNotFoundError('Activity', id);
    }
    
    const now = new Date().toISOString();
    const updatedActivity: DailyActivity = {
      ...activity,
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    };
    
    await db.activities.put(updatedActivity);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'activity',
      entity_id: id,
      operation: 'update',
      data: updatedActivity,
      trip_id: updatedActivity.trip_id
    });
    
    console.log(`[DB] Activity updated and queued for sync: ${id}`);
    
    return updatedActivity;
  });
}

/**
 * Delete an activity by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteActivity(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const activity = await db.activities.get(id);
    
    if (!activity) {
      throw createNotFoundError('Activity', id);
    }
    
    await db.activities.delete(id);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: 'activity',
      entity_id: id,
      operation: 'delete',
      trip_id: activity.trip_id
    });
    
    console.log(`[DB] Activity deleted and queued for sync: ${id}`);
  });
}

/**
 * Bulk update activities (for reordering)
 * Updates order_index for multiple activities
 * Queues each update for Firestore sync
 */
export async function bulkUpdateActivities(
  updates: Array<{ id: string; order_index: number }>,
  userEmail?: string
): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const now = new Date().toISOString();
    
    // Update each activity in a transaction
    await db.transaction('rw', db.activities, async () => {
      for (const update of updates) {
        const activity = await db.activities.get(update.id);
        
        if (activity) {
          const updatedActivity = {
            ...activity,
            order_index: update.order_index,
            updated_at: now,
            ...(userEmail && { updated_by: userEmail })
          };
          
          await db.activities.put(updatedActivity);
          
          // Queue for sync to Firestore
          await addToQueue({
            entity_type: 'activity',
            entity_id: update.id,
            operation: 'update',
            data: updatedActivity,
            trip_id: activity.trip_id
          });
        }
      }
    });
    
    console.log(`[DB] ${updates.length} activities reordered and queued for sync`);
  });
}
