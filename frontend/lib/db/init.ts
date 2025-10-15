/**
 * Database Initialization Logic for Travo
 * 
 * Feature: 005-let-s-introduce (Enhanced Model)
 * Feature: Firebase Integration (Phase 3 - Pull Sync)
 * Date: 2025-10-14
 */

import { db } from './schema';
import type { Result } from './models';
import { wrapDatabaseOperation } from './errors';
import { isOk, unwrap, unwrapErr } from './resultHelpers';
import { loadSeedData } from './seed';
import { syncTripsFromFirestore } from '@/lib/firebase/sync';

/**
 * Check if the database has been initialized with data
 * Returns true if trips table contains data
 * 
 * Note: We only check trips table since seed loader ensures
 * all tables are populated together in a transaction
 */
export async function isInitialized(): Promise<boolean> {
  try {
    const count = await db.trips.count();
    return count > 0;
  } catch (error) {
    console.error('Error checking initialization status:', error);
    return false;
  }
}

/**
 * Initialize the database with Firestore sync support
 * 
 * If user is authenticated:
 *  - Opens database connection
 *  - Pulls trips from Firestore for the user
 *  - Saves to IndexedDB
 * 
 * If user is not authenticated:
 *  - Opens database connection only
 *  - Does not load any data (user must log in)
 * 
 * @param userEmail Optional user email for Firestore sync
 */
export async function initializeDatabase(userEmail?: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    console.log('[DB Init] Initializing database...');
    
    // Opening the database will automatically create tables based on schema
    // and run any pending migrations (e.g., v2 -> v3)
    await db.open();
    
    // Verify all tables exist by checking if we can access them
    await db.trips.count();
    await db.flights.count();
    await db.flightLegs.count();
    await db.hotels.count();
    await db.activities.count();
    await db.restaurants.count();
    
    // If user is authenticated, sync from Firestore
    if (userEmail) {
      console.log(`[DB Init] User authenticated: ${userEmail}`);
      
      // Check if we already have data
      const hasData = await isInitialized();
      if (hasData) {
        console.log('[DB Init] Database already has data, skipping initial sync');
        return;
      }
      
      // Pull trips from Firestore
      console.log('[DB Init] Pulling trips from Firestore...');
      const syncResult = await syncTripsFromFirestore(userEmail);
      
      if (!isOk(syncResult)) {
        console.error('[DB Init] Failed to sync from Firestore:', unwrapErr(syncResult).message);
        // Don't throw - allow app to continue even if sync fails
        // User can retry or add trips manually
      } else {
        console.log(`[DB Init] Successfully synced ${unwrap(syncResult)} trips from Firestore`);
      }
    } else {
      console.log('[DB Init] No user authenticated, skipping Firestore sync');
      
      // For development/testing: load seed data if database is empty and no user
      if (process.env.NODE_ENV === 'development') {
        const hasData = await isInitialized();
        if (!hasData) {
          console.log('[DB Init] Loading seed data for development...');
          const seedResult = await loadSeedData();
          if (!isOk(seedResult)) {
            console.warn('[DB Init] Failed to load seed data:', unwrapErr(seedResult).message);
          }
        }
      }
    }
    
    console.log('[DB Init] Database initialization complete');
  });
}
