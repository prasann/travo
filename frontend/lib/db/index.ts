/**
 * Travo Local Database - Public API
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12 (Enhanced Model)
 * 
 * This is the main entry point for the database layer.
 * All database operations should be accessed through this module.
 */

// Re-export types
export type {
  Trip,
  Place,
  Flight,
  FlightLeg,
  Hotel,
  DailyActivity,
  RestaurantRecommendation,
  TripInput,
  TripUpdate,
  PlaceInput,
  PlaceUpdate,
  TripWithPlaces,
  TripWithRelations,
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
export { 
  getAllTrips, 
  getTripById, 
  getTripWithPlaces,
  getTripWithRelations,
  updateTrip,
  deleteTrip
} from './operations/trips';

// Flight operations
export { 
  getFlightsByTripId, 
  getFlightLegsByFlightId,
  updateFlight,
  deleteFlight
} from './operations/flights';

// Hotel operations
export { 
  getHotelsByTripId,
  createHotel,
  updateHotel,
  deleteHotel
} from './operations/hotels';

// Activity operations
export { 
  getActivitiesByTripId,
  createActivity,
  updateActivity,
  deleteActivity,
  bulkUpdateActivities
} from './operations/activities';

// Restaurant operations
export { 
  getRestaurantsByTripId,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} from './operations/restaurants';

// Sync operations
export { 
  processQueue,
  triggerSync
} from '../sync/SyncService';
export {
  getQueuedEntries,
  getFailedEntries,
  getPendingCount,
  clearQueue
} from '../sync/SyncQueue';

// Place operations (DEPRECATED - maintained for backward compatibility)
export { getPlacesByTripId, getPlaceById } from './operations/places';
