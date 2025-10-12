/**
 * Database Initialization Logic for Travo
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import { db } from './schema';
import type { Result } from './models';
import { wrapDatabaseOperation } from './errors';
import { loadSeedData } from './seed';

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
 * Initialize the database
 * Opens the database connection, ensures schema is created,
 * and loads seed data if database is empty
 */
export async function initializeDatabase(): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    // Opening the database will automatically create tables based on schema
    await db.open();
    
    // Verify all tables exist by checking if we can access them
    await db.trips.count();
    await db.flights.count();
    await db.flightLegs.count();
    await db.hotels.count();
    await db.activities.count();
    await db.restaurants.count();
    
    // Places table maintained for backward compatibility
    await db.places.count();
    
    // Load seed data if database is empty
    const initialized = await isInitialized();
    if (!initialized) {
      const seedResult = await loadSeedData();
      if (!seedResult.success) {
        throw new Error(seedResult.error.message);
      }
    }
  });
}
