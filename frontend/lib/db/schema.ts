/**
 * Dexie Database Schema for Travo Local Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Trip, Place } from './models';

/**
 * TravoDatabase - IndexedDB database wrapper using Dexie
 * 
 * Database: TravoLocalDB
 * Version: 1
 */
export class TravoDatabase extends Dexie {
  // Declare table types
  trips!: EntityTable<Trip, 'id'>;
  places!: EntityTable<Place, 'id'>;

  constructor() {
    super('TravoLocalDB');
    
    // Define schema version 1
    this.version(1).stores({
      // Trips table with indexes on id (PK), deleted (for filtering), updated_at (for sync)
      trips: 'id, deleted, updated_at',
      
      // Places table with indexes on id (PK), trip_id (for joins), order_index (for sorting), updated_at (for sync)
      places: 'id, trip_id, order_index, updated_at'
    });
  }
}

// Export singleton instance
export const db = new TravoDatabase();
