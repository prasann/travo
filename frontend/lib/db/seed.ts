/**
 * Seed Data Loader for Travo Database (Enhanced Model)
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * Loads trip data from multi-file structure:
 * - /frontend/data/trip-index.json (list of trip IDs)
 * - /frontend/data/trips/{id}.json (individual trip files)
 */

import { db } from './schema';
import type { 
  Trip, 
  Flight, 
  FlightLeg, 
  Hotel, 
  DailyActivity, 
  RestaurantRecommendation,
  Result,
  TripIndexFile,
  SeedTripFile 
} from './models';
import { wrapDatabaseOperation } from './errors';
import { validateDateFormat, validateUUID } from './validation';

/**
 * Load trip index from trip-index.json
 * Returns array of trip IDs to load
 */
async function loadTripIndex(): Promise<string[]> {
  try {
    const response = await fetch('/data/trip-index.json');
    if (!response.ok) {
      throw new Error(`Failed to load trip index: ${response.status} ${response.statusText}`);
    }
    
    const indexData = await response.json() as TripIndexFile;
    
    if (!indexData.trips || !Array.isArray(indexData.trips)) {
      throw new Error('Invalid trip index structure: missing trips array');
    }
    
    return indexData.trips.map(trip => trip.id);
  } catch (error) {
    throw new Error(
      `Failed to load trip index: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Load individual trip from /data/trips/{id}.json
 * Returns trip data with all nested entities
 */
async function loadTripFromFile(tripId: string): Promise<SeedTripFile> {
  try {
    const response = await fetch(`/data/trips/${tripId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load trip ${tripId}: ${response.status} ${response.statusText}`);
    }
    
    const tripData = await response.json() as SeedTripFile;
    
    // Validate trip structure
    if (!tripData.id || tripData.id !== tripId) {
      throw new Error(`Trip file ${tripId}.json has mismatched ID: ${tripData.id}`);
    }
    
    return tripData;
  } catch (error) {
    throw new Error(
      `Failed to load trip file ${tripId}: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate trip base properties
 * Throws error if validation fails
 */
function validateTripData(trip: SeedTripFile): void {
  // Minimal validation - only check required fields exist
  if (!trip.id) {
    throw new Error(`Trip missing id`);
  }
  
  if (!trip.name) {
    throw new Error(`Trip ${trip.id} missing name`);
  }
  
  if (!trip.start_date) {
    throw new Error(`Trip ${trip.id} missing start_date`);
  }
  
  if (!trip.end_date) {
    throw new Error(`Trip ${trip.id} missing end_date`);
  }
}

/**
 * Validate nested entity arrays exist (can be empty)
 * Provides defaults if arrays are missing
 */
function validateNestedStructure(trip: SeedTripFile): void {
  // Make arrays optional - provide defaults if missing
  trip.flights = trip.flights || [];
  trip.hotels = trip.hotels || [];
  trip.activities = trip.activities || [];
  trip.restaurants = trip.restaurants || [];
}

/**
 * Parse trip base properties from seed data
 * Converts to database Trip format (adds deleted field, removes nested arrays)
 */
function parseTripProperties(seedTrip: SeedTripFile): Trip {
  return {
    id: seedTrip.id,
    name: seedTrip.name,
    description: seedTrip.description,
    start_date: seedTrip.start_date,
    end_date: seedTrip.end_date,
    home_location: seedTrip.home_location,
    updated_at: seedTrip.updated_at,
    user_access: [], // Empty for seed data (will be set during Firestore sync)
    updated_by: 'seed', // Indicate this was from seed data
    deleted: false
  };
}

/**
 * Parse Flight entities from seed data
 * Extracts flight properties (without legs)
 */
function parseFlights(seedTrip: SeedTripFile): Flight[] {
  if (!seedTrip.flights || seedTrip.flights.length === 0) {
    return [];
  }
  
  return seedTrip.flights.map(flight => ({
    id: flight.id,
    trip_id: flight.trip_id,
    updated_at: flight.updated_at,
    updated_by: 'seed',
    airline: flight.airline,
    flight_number: flight.flight_number,
    departure_time: flight.departure_time,
    arrival_time: flight.arrival_time,
    departure_location: flight.departure_location,
    arrival_location: flight.arrival_location,
    confirmation_number: flight.confirmation_number,
    notes: flight.notes
  }));
}

/**
 * Parse FlightLeg entities from seed data
 * Flattens nested legs from all flights into single array
 */
function parseFlightLegs(seedTrip: SeedTripFile): FlightLeg[] {
  if (!seedTrip.flights || seedTrip.flights.length === 0) {
    return [];
  }
  
  const allLegs: FlightLeg[] = [];
  
  for (const flight of seedTrip.flights) {
    if (flight.legs && Array.isArray(flight.legs) && flight.legs.length > 0) {
      allLegs.push(...flight.legs);
    }
  }
  
  return allLegs;
}

/**
 * Parse Hotel entities from seed data
 */
function parseHotels(seedTrip: SeedTripFile): Hotel[] {
  if (!seedTrip.hotels || seedTrip.hotels.length === 0) {
    return [];
  }
  
  return seedTrip.hotels.map(hotel => ({
    id: hotel.id,
    trip_id: hotel.trip_id,
    updated_at: hotel.updated_at,
    updated_by: 'seed',
    name: hotel.name,
    address: hotel.address,
    city: hotel.city,
    check_in_time: hotel.check_in_time,
    check_out_time: hotel.check_out_time,
    confirmation_number: hotel.confirmation_number,
    phone: hotel.phone,
    notes: hotel.notes
  }));
}

/**
 * Parse DailyActivity entities from seed data
 */
function parseActivities(seedTrip: SeedTripFile): DailyActivity[] {
  if (!seedTrip.activities || seedTrip.activities.length === 0) {
    return [];
  }
  
  return seedTrip.activities.map(activity => ({
    id: activity.id,
    trip_id: activity.trip_id,
    updated_at: activity.updated_at,
    updated_by: 'seed',
    name: activity.name,
    date: activity.date,
    order_index: activity.order_index,
    city: activity.city,
    plus_code: activity.plus_code,
    google_maps_url: activity.google_maps_url,
    latitude: activity.latitude,
    longitude: activity.longitude,
    address: activity.address,
    image_url: activity.image_url,
    notes: activity.notes
  }));
}

/**
 * Parse RestaurantRecommendation entities from seed data
 */
function parseRestaurants(seedTrip: SeedTripFile): RestaurantRecommendation[] {
  if (!seedTrip.restaurants || seedTrip.restaurants.length === 0) {
    return [];
  }
  
  return seedTrip.restaurants.map(restaurant => ({
    id: restaurant.id,
    trip_id: restaurant.trip_id,
    updated_at: restaurant.updated_at,
    updated_by: 'seed',
    name: restaurant.name,
    city: restaurant.city,
    cuisine_type: restaurant.cuisine_type,
    address: restaurant.address,
    plus_code: restaurant.plus_code,
    phone: restaurant.phone,
    website: restaurant.website,
    notes: restaurant.notes
  }));
}

/**
 * Load seed data into database
 * Uses transaction to ensure atomicity
 * 
 * Process:
 * 1. Load trip-index.json to get list of trip IDs
 * 2. Load each trip file from /data/trips/{id}.json
 * 3. Validate and parse trip data
 * 4. Bulk insert all data in single transaction
 */
export async function loadSeedData(): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    // Step 1: Load trip index
    const tripIds = await loadTripIndex();
    
    if (tripIds.length === 0) {
      console.warn('No trips found in trip-index.json');
      return;
    }
    
    console.log(`Loading ${tripIds.length} trips from seed data...`);
    
    // Step 2 & 3: Load and parse all trip files
    const allTrips: Trip[] = [];
    const allFlights: Flight[] = [];
    const allFlightLegs: FlightLeg[] = [];
    const allHotels: Hotel[] = [];
    const allActivities: DailyActivity[] = [];
    const allRestaurants: RestaurantRecommendation[] = [];
    
    for (const tripId of tripIds) {
      try {
        // Load trip file
        const seedTrip = await loadTripFromFile(tripId);
        
        // Validate trip data
        validateTripData(seedTrip);
        validateNestedStructure(seedTrip);
        
        // Parse trip base properties
        const trip = parseTripProperties(seedTrip);
        allTrips.push(trip);
        
        // Parse nested entities
        const flights = parseFlights(seedTrip);
        const flightLegs = parseFlightLegs(seedTrip);
        const hotels = parseHotels(seedTrip);
        const activities = parseActivities(seedTrip);
        const restaurants = parseRestaurants(seedTrip);
        
        allFlights.push(...flights);
        allFlightLegs.push(...flightLegs);
        allHotels.push(...hotels);
        allActivities.push(...activities);
        allRestaurants.push(...restaurants);
        
        console.log(`  ✓ Loaded trip "${trip.name}" (${flights.length} flights, ${hotels.length} hotels, ${activities.length} activities, ${restaurants.length} restaurants)`);
      } catch (error) {
        // Re-throw with trip context
        throw new Error(
          `Failed to process trip ${tripId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
    
    // Step 4: Bulk insert all data in transaction
    console.log('Inserting data into database...');
    
    await db.transaction('rw', [
      db.trips, 
      db.flights, 
      db.flightLegs, 
      db.hotels, 
      db.activities, 
      db.restaurants
    ], async () => {
      // Insert trips first (parent entities)
      await db.trips.bulkAdd(allTrips);
      
      // Insert child entities in parallel (no dependencies between them)
      await Promise.all([
        allFlights.length > 0 ? db.flights.bulkAdd(allFlights) : Promise.resolve(),
        allFlightLegs.length > 0 ? db.flightLegs.bulkAdd(allFlightLegs) : Promise.resolve(),
        allHotels.length > 0 ? db.hotels.bulkAdd(allHotels) : Promise.resolve(),
        allActivities.length > 0 ? db.activities.bulkAdd(allActivities) : Promise.resolve(),
        allRestaurants.length > 0 ? db.restaurants.bulkAdd(allRestaurants) : Promise.resolve()
      ]);
    });
    
    console.log(`✓ Seed data loaded successfully: ${allTrips.length} trips with ${allFlights.length} flights, ${allHotels.length} hotels, ${allActivities.length} activities, ${allRestaurants.length} restaurants`);
  });
}

/**
 * Legacy function for backward compatibility
 * Can be removed once migration is complete
 */
export function validateSeedData(data: unknown): string | null {
  console.warn('validateSeedData() is deprecated - validation now happens during load');
  return null;
}
