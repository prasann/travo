/**
 * Activity Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * Refactored: 2025-10-15 (Using base operations)
 * 
 * CRUD operations for DailyActivity entities
 */

import { db } from '../schema';
import type { DailyActivity, ActivityInput, Result } from '../models';
import { wrapDatabaseOperation } from '../errors';
import { getByTripId, createEntity, updateEntity, deleteEntity } from './base';
import { addToQueue } from '@/lib/sync/SyncQueue';

/**
 * Get all activities for a trip
 * Returns activities sorted by date, then order_index
 */
export async function getActivitiesByTripId(tripId: string): Promise<Result<DailyActivity[]>> {
  return getByTripId(
    db.activities,
    tripId,
    (a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.order_index - b.order_index;
    }
  );
}

/**
 * Create a new activity
 * Automatically generates ID and timestamp
 * Queues creation for Firestore sync
 */
export async function createActivity(input: ActivityInput, userEmail?: string): Promise<Result<DailyActivity>> {
  return createEntity<DailyActivity, ActivityInput>(
    db.activities,
    'activity',
    input,
    userEmail
  );
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
  return updateEntity<DailyActivity>(
    db.activities,
    'activity',
    'Activity',
    id,
    updates,
    userEmail
  );
}

/**
 * Delete an activity by ID
 * Queues delete operation for Firestore sync
 */
export async function deleteActivity(id: string): Promise<Result<void>> {
  return deleteEntity<DailyActivity>(
    db.activities,
    'activity',
    'Activity',
    id
  );
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
