/**
 * Travo Local Database - Public API
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * This is the main entry point for the database layer.
 * All database operations should be accessed through this module.
 */

// Re-export types
export type {
  Trip,
  Place,
  TripInput,
  TripUpdate,
  PlaceInput,
  PlaceUpdate,
  TripWithPlaces,
  DbError,
  ValidationError,
  QuotaExceededError,
  DatabaseError,
  NotFoundError,
  Result,
  SeedData
} from './models';

// Re-export type guards
export {
  isValidationError,
  isQuotaExceededError,
  isDatabaseError,
  isNotFoundError
} from './models';

// Initialization
export { initializeDatabase, isInitialized } from './init';

// Trip operations
export { getAllTrips, getTripById, getTripWithPlaces } from './operations/trips';

// Place operations
export { getPlacesByTripId, getPlaceById } from './operations/places';
