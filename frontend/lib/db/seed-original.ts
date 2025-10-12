/**
 * Seed Data Loader for Travo Database
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import { db } from './schema';
import type { SeedData, Trip, Place, Result } from './models';
import { createDatabaseError, wrapDatabaseOperation } from './errors';
import { validateDateFormat, validateUUID } from './validation';

/**
 * Validate seed data structure and content
 * Returns error message if invalid, null if valid
 */
export function validateSeedData(data: unknown): string | null {
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    return 'Seed data must be a valid JSON object';
  }
  
  const seedData = data as Record<string, unknown>;
  
  // Check if trips array exists
  if (!Array.isArray(seedData.trips)) {
    return 'Seed data must contain a "trips" array';
  }
  
  // Validate each trip
  for (let i = 0; i < seedData.trips.length; i++) {
    const trip = seedData.trips[i];
    
    if (!trip || typeof trip !== 'object') {
      return `Trip at index ${i} is not a valid object`;
    }
    
    const tripObj = trip as Record<string, unknown>;
    
    // Validate required trip fields
    if (!tripObj.id || typeof tripObj.id !== 'string') {
      return `Trip at index ${i} missing valid id`;
    }
    
    if (!validateUUID(tripObj.id as string)) {
      return `Trip at index ${i} has invalid UUID format`;
    }
    
    if (!tripObj.name || typeof tripObj.name !== 'string' || tripObj.name.trim() === '') {
      return `Trip at index ${i} missing valid name`;
    }
    
    if (!tripObj.start_date || typeof tripObj.start_date !== 'string') {
      return `Trip at index ${i} missing start_date`;
    }
    
    if (!validateDateFormat(tripObj.start_date as string)) {
      return `Trip at index ${i} has invalid start_date format`;
    }
    
    if (!tripObj.end_date || typeof tripObj.end_date !== 'string') {
      return `Trip at index ${i} missing end_date`;
    }
    
    if (!validateDateFormat(tripObj.end_date as string)) {
      return `Trip at index ${i} has invalid end_date format`;
    }
    
    if (!tripObj.updated_at || typeof tripObj.updated_at !== 'string') {
      return `Trip at index ${i} missing updated_at`;
    }
    
    // Validate places array
    if (!Array.isArray(tripObj.places)) {
      return `Trip at index ${i} missing places array`;
    }
    
    // Validate each place
    for (let j = 0; j < (tripObj.places as unknown[]).length; j++) {
      const place = (tripObj.places as unknown[])[j];
      
      if (!place || typeof place !== 'object') {
        return `Trip ${i}, place ${j} is not a valid object`;
      }
      
      const placeObj = place as Record<string, unknown>;
      
      if (!placeObj.id || typeof placeObj.id !== 'string') {
        return `Trip ${i}, place ${j} missing valid id`;
      }
      
      if (!validateUUID(placeObj.id as string)) {
        return `Trip ${i}, place ${j} has invalid UUID format`;
      }
      
      if (!placeObj.trip_id || placeObj.trip_id !== tripObj.id) {
        return `Trip ${i}, place ${j} has mismatched trip_id`;
      }
      
      if (!placeObj.name || typeof placeObj.name !== 'string' || placeObj.name.trim() === '') {
        return `Trip ${i}, place ${j} missing valid name`;
      }
      
      if (typeof placeObj.order_index !== 'number' || placeObj.order_index < 0) {
        return `Trip ${i}, place ${j} has invalid order_index`;
      }
      
      if (!placeObj.updated_at || typeof placeObj.updated_at !== 'string') {
        return `Trip ${i}, place ${j} missing updated_at`;
      }
    }
  }
  
  return null;
}

/**
 * Transform nested seed data structure to flat database records
 */
function transformSeedData(seedData: SeedData): { trips: Trip[]; places: Place[] } {
  const trips: Trip[] = [];
  const places: Place[] = [];
  
  for (const seedTrip of seedData.trips) {
    // Transform trip (add deleted field)
    const trip: Trip = {
      id: seedTrip.id,
      name: seedTrip.name,
      description: seedTrip.description,
      start_date: seedTrip.start_date,
      end_date: seedTrip.end_date,
      deleted: false,
      updated_at: seedTrip.updated_at
    };
    trips.push(trip);
    
    // Extract places
    for (const place of seedTrip.places) {
      places.push(place);
    }
  }
  
  return { trips, places };
}

/**
 * Load seed data into database
 * Uses transaction to ensure atomicity
 */
export async function loadSeedData(): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    // Read seed data file
    let seedData: SeedData;
    try {
      const response = await fetch('/data/trips.json');
      if (!response.ok) {
        throw new Error('Failed to load seed data file');
      }
      seedData = await response.json() as SeedData;
    } catch (error) {
      throw new Error(
        `Failed to load seed data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    
    // Validate seed data
    const validationError = validateSeedData(seedData);
    if (validationError) {
      throw new Error(`Seed data validation failed: ${validationError}`);
    }
    
    // Transform nested structure to flat tables
    const { trips, places } = transformSeedData(seedData);
    
    // Load data in transaction
    await db.transaction('rw', [db.trips, db.places], async () => {
      // Bulk insert trips
      await db.trips.bulkAdd(trips);
      
      // Bulk insert places
      await db.places.bulkAdd(places);
    });
  });
}
