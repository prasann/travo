/**
 * Dexie Database Schema for Travo Local Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12 (Enhanced Model - Schema v2)
 */

import Dexie, { type EntityTable } from 'dexie';
import type { 
  Trip, 
  Place, 
  Flight, 
  FlightLeg, 
  Hotel, 
  DailyActivity, 
  RestaurantRecommendation 
} from './models';

/**
 * TravoDatabase - IndexedDB database wrapper using Dexie
 * 
 * Database: TravoLocalDB
 * Version: 2 (Enhanced with flights, hotels, activities, restaurants)
 */
export class TravoDatabase extends Dexie {
  // Declare table types
  trips!: EntityTable<Trip, 'id'>;
  places!: EntityTable<Place, 'id'>;
  flights!: EntityTable<Flight, 'id'>;
  flightLegs!: EntityTable<FlightLeg, 'id'>;
  hotels!: EntityTable<Hotel, 'id'>;
  activities!: EntityTable<DailyActivity, 'id'>;
  restaurants!: EntityTable<RestaurantRecommendation, 'id'>;

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
  }
}

// Export singleton instance
export const db = new TravoDatabase();
