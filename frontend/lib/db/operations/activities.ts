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
 */
export async function createActivity(input: ActivityInput): Promise<Result<DailyActivity>> {
  return wrapDatabaseOperation(async () => {
    const activity: DailyActivity = {
      id: uuidv4(),
      updated_at: new Date().toISOString(),
      ...input
    };
    
    await db.activities.add(activity);
    
    return activity;
  });
}

/**
 * Update an activity's properties
 * Automatically updates timestamp
 */
export async function updateActivity(
  id: string,
  updates: Partial<Omit<DailyActivity, 'id' | 'trip_id' | 'date' | 'updated_at'>>
): Promise<Result<DailyActivity>> {
  return wrapDatabaseOperation(async () => {
    const activity = await db.activities.get(id);
    
    if (!activity) {
      throw createNotFoundError('Activity', id);
    }
    
    const updatedActivity: DailyActivity = {
      ...activity,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await db.activities.put(updatedActivity);
    
    return updatedActivity;
  });
}

/**
 * Delete an activity by ID
 */
export async function deleteActivity(id: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const activity = await db.activities.get(id);
    
    if (!activity) {
      throw createNotFoundError('Activity', id);
    }
    
    await db.activities.delete(id);
  });
}

/**
 * Bulk update activities (for reordering)
 * Updates order_index for multiple activities
 */
export async function bulkUpdateActivities(
  updates: Array<{ id: string; order_index: number }>
): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    // Update each activity in a transaction
    await db.transaction('rw', db.activities, async () => {
      for (const update of updates) {
        const activity = await db.activities.get(update.id);
        
        if (activity) {
          await db.activities.update(update.id, {
            order_index: update.order_index,
            updated_at: new Date().toISOString()
          });
        }
      }
    });
  });
}
