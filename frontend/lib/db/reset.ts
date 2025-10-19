/**
 * Database Reset Utility
 * 
 * Feature: Database Management
 * Date: 2025-10-19
 * 
 * Provides functionality to completely delete the local IndexedDB
 * and force a fresh sync from Firestore.
 */

import { db } from './schema';
import { initializeDatabase } from './init';
import type { Result } from './models';
import { wrapDatabaseOperation } from './errors';
import { isOk, unwrapErr } from './resultHelpers';

/**
 * Delete the entire IndexedDB database
 * This will remove all local data and force a fresh sync from Firestore
 * 
 * @returns Promise with Result indicating success or failure
 */
export async function deleteDatabase(): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    console.log('[DB Reset] Deleting IndexedDB database...');
    
    // Close the database connection first
    db.close();
    
    // Delete the database
    await db.delete();
    
    console.log('[DB Reset] ✓ Database deleted successfully');
  });
}

/**
 * Reset the database: delete and reinitialize with fresh Firestore data
 * 
 * @param userEmail User's email for Firestore sync (required for re-sync)
 * @returns Promise with Result indicating success or failure
 */
export async function resetDatabase(userEmail?: string): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    console.log('[DB Reset] Starting database reset...');
    
    // Step 1: Delete existing database
    const deleteResult = await deleteDatabase();
    if (!isOk(deleteResult)) {
      throw unwrapErr(deleteResult);
    }
    
    // Step 2: Reinitialize with fresh data from Firestore
    console.log('[DB Reset] Reinitializing database...');
    const initResult = await initializeDatabase(userEmail);
    if (!isOk(initResult)) {
      throw unwrapErr(initResult);
    }
    
    console.log('[DB Reset] ✓ Database reset complete - fresh data synced from Firestore');
  });
}
