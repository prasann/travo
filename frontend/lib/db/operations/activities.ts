/**
 * Activity Operations for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * CRUD operations for DailyActivity entities
 */

import { db } from '../schema';
import type { DailyActivity, Result } from '../models';
import { wrapDatabaseOperation } from '../errors';

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
