/**
 * Dexie Database Schema for Travo Local Database
 * 
 * Feature: 005-let-s-introduce (Enhanced Model - Schema v2)
 * Feature: Firebase Integration (Schema v3 - Sharing & Sync)
 * Date: 2025-10-14
 */

import Dexie, { type EntityTable } from 'dexie';
import type { 
  Trip, 
  Flight, 
  FlightLeg, 
  Hotel, 
  DailyActivity, 
  RestaurantRecommendation,
  SyncQueueEntry
} from './models';

/**
 * TravoDatabase - IndexedDB database wrapper using Dexie
 * 
 * Database: TravoLocalDB
 * Version: 6 (Added location fields for map view)
 */
export class TravoDatabase extends Dexie {
  // Declare table types
  trips!: EntityTable<Trip, 'id'>;
  flights!: EntityTable<Flight, 'id'>;
  flightLegs!: EntityTable<FlightLeg, 'id'>;
  hotels!: EntityTable<Hotel, 'id'>;
  activities!: EntityTable<DailyActivity, 'id'>;
  restaurants!: EntityTable<RestaurantRecommendation, 'id'>;
  syncQueue!: EntityTable<SyncQueueEntry, 'id'>;

  constructor() {
    super('TravoLocalDB');
    
    // Define schema version 1 (legacy - for migration)
    this.version(1).stores({
      // Trips table with indexes on id (PK), deleted (for filtering), updated_at (for sync)
      trips: 'id, deleted, updated_at',
      
      // Places table with indexes on id (PK), trip_id (for joins), order_index (for sorting), updated_at (for sync)
      places: 'id, trip_id, order_index, updated_at'
    });
    
    // Define schema version 2 (enhanced model)
    this.version(2).stores({
      // Trips table - updated indexes to support date range queries
      trips: 'id, deleted, updated_at, start_date, end_date',
      
      // Places table - maintained for backward compatibility (DEPRECATED)
      places: 'id, trip_id, order_index, updated_at',
      
      // Flights table - indexes for trip relationship, departure sorting, sync
      flights: 'id, trip_id, departure_time, updated_at',
      
      // Flight Legs table - indexes for flight relationship, leg ordering
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      
      // Hotels table - indexes for trip relationship, check-in sorting, city grouping, sync
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      
      // Activities table - indexes for trip relationship, date sorting, city grouping, sync
      // Compound index [trip_id+date+order_index] for efficient daily timeline queries
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      
      // Restaurants table - indexes for trip relationship, city grouping, sync
      restaurants: 'id, trip_id, city, updated_at'
    });
    
    // Define schema version 3 (Firebase integration - sharing and sync)
    this.version(3).stores({
      // Trips table - add user_access for multi-index on user_access array
      trips: 'id, deleted, updated_at, start_date, end_date, *user_access',
      
      // Places table - add updated_by field (no new indexes)
      places: 'id, trip_id, order_index, updated_at',
      
      // Flights table - add updated_by field (no new indexes)
      flights: 'id, trip_id, departure_time, updated_at',
      
      // Flight Legs table - no changes (inherits from flights)
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      
      // Hotels table - add updated_by field (no new indexes)
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      
      // Activities table - add updated_by field (no new indexes)
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      
      // Restaurants table - add updated_by field (no new indexes)
      restaurants: 'id, trip_id, city, updated_at'
    }).upgrade(async (trans) => {
      // Migration from v2 to v3: Add sharing and sync fields
      console.log('Migrating database from v2 to v3...');
      
      // Add user_access and updated_by to all trips
      await trans.table('trips').toCollection().modify((trip: any) => {
        if (!trip.user_access) {
          trip.user_access = []; // Initialize as empty array (will be populated on first sync)
        }
        if (!trip.updated_by) {
          trip.updated_by = 'local'; // Mark as local-only data
        }
      });
      
      // Add updated_by to all flights
      await trans.table('flights').toCollection().modify((flight: any) => {
        if (!flight.updated_by) {
          flight.updated_by = 'local';
        }
      });
      
      // Add updated_by to all hotels
      await trans.table('hotels').toCollection().modify((hotel: any) => {
        if (!hotel.updated_by) {
          hotel.updated_by = 'local';
        }
      });
      
      // Add updated_by to all activities
      await trans.table('activities').toCollection().modify((activity: any) => {
        if (!activity.updated_by) {
          activity.updated_by = 'local';
        }
      });
      
      // Add updated_by to all restaurants
      await trans.table('restaurants').toCollection().modify((restaurant: any) => {
        if (!restaurant.updated_by) {
          restaurant.updated_by = 'local';
        }
      });
      
      console.log('Database migration to v3 complete!');
    });
    
    // Define schema version 4 (Push sync - sync queue)
    this.version(4).stores({
      // Keep all v3 tables unchanged
      trips: 'id, deleted, updated_at, start_date, end_date, *user_access',
      places: 'id, trip_id, order_index, updated_at',
      flights: 'id, trip_id, departure_time, updated_at',
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      restaurants: 'id, trip_id, city, updated_at',
      
      // NEW: Sync queue table for tracking pending Firestore operations
      syncQueue: 'id, entity_type, entity_id, created_at, retries'
    });
    
    // Define schema version 5 (Remove deprecated places table)
    this.version(5).stores({
      trips: 'id, deleted, updated_at, start_date, end_date, *user_access',
      places: null, // Remove places table
      flights: 'id, trip_id, departure_time, updated_at',
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      restaurants: 'id, trip_id, city, updated_at',
      syncQueue: 'id, entity_type, entity_id, created_at, retries'
    }).upgrade(async (trans) => {
      console.log('[Migration] Removing deprecated places table from v4 to v5...');
      // No data migration needed - places table was already deprecated and unused
      console.log('[Migration] Deprecated places table removed successfully');
    });
    
    // Define schema version 6 (Add location fields for map view)
    // New optional fields: google_maps_url, latitude, longitude
    // No new indexes needed - these fields are for display/rendering only
    this.version(6).stores({
      trips: 'id, deleted, updated_at, start_date, end_date, *user_access',
      flights: 'id, trip_id, departure_time, updated_at',
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      restaurants: 'id, trip_id, city, updated_at',
      syncQueue: 'id, entity_type, entity_id, created_at, retries'
    }).upgrade(async (trans) => {
      console.log('[Migration] Upgrading to v6: Adding location fields (google_maps_url, latitude, longitude)');
      // No data migration needed - new fields are optional
      // Existing data will continue to work, new entries will include location data
      console.log('[Migration] Schema v6 upgrade complete - location fields available');
    });
  }
}

// Export singleton instance
export const db = new TravoDatabase();
