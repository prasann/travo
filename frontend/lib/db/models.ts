/**
 * TypeScript Interface Contracts for Travo Local Database Layer
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12 (Enhanced Model)
 * 
 * This file defines the TypeScript interfaces for the local database layer.
 * Base domain types are imported from @/types (single source of truth).
 * Database-specific extensions and utility types are defined here.
 */

// ============================================================================
// Import Base Domain Types (Single Source of Truth)
// ============================================================================

import type {
  Trip as BaseTripType,
  Flight as FlightType,
  FlightLeg as FlightLegType,
  Hotel as HotelType,
  DailyActivity as DailyActivityType,
  RestaurantRecommendation as RestaurantRecommendationType,
  TripIndex as TripIndexType,
  TripIndexFile as TripIndexFileType,
} from '@/types';

// Re-export base types with database extensions for convenience
export type TripIndex = TripIndexType;
export type TripIndexFile = TripIndexFileType;

/**
 * Flight entity with database-specific fields
 * Extends base Flight type with sync tracking
 */
export interface Flight extends FlightType {
  /** Email of user who last modified this flight */
  updated_by: string;
}

/**
 * FlightLeg entity (no database extensions)
 */
export type FlightLeg = FlightLegType;

/**
 * Hotel entity with database-specific fields
 * Extends base Hotel type with sync tracking
 */
export interface Hotel extends HotelType {
  /** Email of user who last modified this hotel */
  updated_by: string;
}

/**
 * DailyActivity entity with database-specific fields
 * Extends base DailyActivity type with sync tracking
 */
export interface DailyActivity extends DailyActivityType {
  /** Email of user who last modified this activity */
  updated_by: string;
}

/**
 * RestaurantRecommendation entity with database-specific fields
 * Extends base RestaurantRecommendation type with sync tracking
 */
export interface RestaurantRecommendation extends RestaurantRecommendationType {
  /** Email of user who last modified this restaurant */
  updated_by: string;
}

// ============================================================================
// Database-Specific Type Extensions
// ============================================================================

/**
 * Trip entity with database-specific fields
 * Extends base Trip type with soft delete support and Firebase sync fields
 */
export interface Trip extends Omit<BaseTripType, 'flights' | 'hotels' | 'activities' | 'restaurants'> {
  /** Soft delete flag (true = deleted, false = active) */
  deleted: boolean;
  
  /** Array of user emails with access to this trip (for sharing) */
  user_access: string[];
  
  /** Email of user who last modified this trip */
  updated_by: string;
}

/**
 * Legacy Place entity (DEPRECATED - use DailyActivity instead)
 * Maintained for backward compatibility during migration
 */
export interface Place {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Foreign key reference to parent Trip */
  trip_id: string;
  
  /** Place name/title */
  name: string;
  
  /** Google Plus Code for location (optional, 8 characters) */
  plus_code?: string;
  
  /** User notes about the place (optional) */
  notes?: string;
  
  /** Display order within the trip (0-based index) */
  order_index: number;
  
  /** Last modification timestamp in ISO 8601 format */
  updated_at: string;
}

// ============================================================================
// Input Types (for Create operations - omit generated fields)
// ============================================================================

/**
 * Input type for creating a new trip (omits generated fields)
 */
export type TripInput = Omit<Trip, 'id' | 'updated_at' | 'deleted' | 'user_access' | 'updated_by'>;

/**
 * Input type for creating a new flight (omits generated fields)
 */
export type FlightInput = Omit<Flight, 'id' | 'updated_at' | 'updated_by' | 'legs'>;

/**
 * Input type for creating a new flight leg (omits generated fields)
 */
export type FlightLegInput = Omit<FlightLeg, 'id'>;

/**
 * Input type for creating a new hotel (omits generated fields)
 */
export type HotelInput = Omit<Hotel, 'id' | 'updated_at' | 'updated_by'>;

/**
 * Input type for creating a new activity (omits generated fields)
 */
export type ActivityInput = Omit<DailyActivity, 'id' | 'updated_at' | 'updated_by'>;

/**
 * Input type for creating a new restaurant (omits generated fields)
 */
export type RestaurantInput = Omit<RestaurantRecommendation, 'id' | 'updated_at' | 'updated_by'>;

/**
 * Input type for creating a new place (DEPRECATED - omits generated fields)
 */
export type PlaceInput = Omit<Place, 'id' | 'updated_at'>;

// ============================================================================
// Update Types (for Update operations - partial with id required)
// ============================================================================

/**
 * Input type for updating an existing trip (all fields optional except id)
 */
export type TripUpdate = Partial<Omit<Trip, 'id' | 'updated_at' | 'deleted' | 'updated_by'>> & {
  id: string;
};

/**
 * Input type for updating an existing flight (all fields optional except id)
 */
export type FlightUpdate = Partial<Omit<Flight, 'id' | 'updated_at' | 'updated_by' | 'legs'>> & {
  id: string;
};

/**
 * Input type for updating an existing flight leg (all fields optional except id)
 */
export type FlightLegUpdate = Partial<Omit<FlightLeg, 'id'>> & {
  id: string;
};

/**
 * Input type for updating an existing hotel (all fields optional except id)
 */
export type HotelUpdate = Partial<Omit<Hotel, 'id' | 'updated_at' | 'updated_by'>> & {
  id: string;
};

/**
 * Input type for updating an existing activity (all fields optional except id)
 */
export type ActivityUpdate = Partial<Omit<DailyActivity, 'id' | 'updated_at' | 'updated_by'>> & {
  id: string;
};

/**
 * Input type for updating an existing restaurant (all fields optional except id)
 */
export type RestaurantUpdate = Partial<Omit<RestaurantRecommendation, 'id' | 'updated_at' | 'updated_by'>> & {
  id: string;
};

/**
 * Input type for updating an existing place (DEPRECATED - all fields optional except id)
 */
export type PlaceUpdate = Partial<Omit<Place, 'id' | 'updated_at'>> & {
  id: string;
};

// ============================================================================
// Query Result Types (with related entities)
// ============================================================================

/**
 * Trip with all associated entities included
 * Used for full trip detail queries with all related data
 */
export interface TripWithRelations extends Trip {
  /** Array of flights belonging to this trip */
  flights: Flight[];
  
  /** Array of hotels belonging to this trip */
  hotels: Hotel[];
  
  /** Array of activities belonging to this trip */
  activities: DailyActivity[];
  
  /** Array of restaurant recommendations for this trip */
  restaurants: RestaurantRecommendation[];
}

/**
 * Flight with flight legs included
 * Used for flight detail queries with connection legs
 */
export interface FlightWithLegs extends Flight {
  /** Array of flight legs (connections) */
  legs: FlightLeg[];
}

/**
 * Trip with associated places included (DEPRECATED)
 * Maintained for backward compatibility
 */
export interface TripWithPlaces extends Trip {
  /** Array of places belonging to this trip */
  places: Place[];
}

// ============================================================================
// Seed Data Types
// ============================================================================

/**
 * Structure of individual trip JSON file
 * Matches the structure in /frontend/data/trips/{id}.json
 */
export interface SeedTripFile extends Omit<BaseTripType, 'updated_at'> {
  updated_at: string;
}

/**
 * Legacy seed data structure (single trips.json file)
 * DEPRECATED - now using multi-file structure
 */
export interface SeedData {
  trips: SeedTrip[];
}

/**
 * Legacy trip structure in seed data (DEPRECATED)
 */
export interface SeedTrip extends Omit<Trip, 'deleted'> {
  places: Place[];
}

/**
 * Legacy place structure in seed data (DEPRECATED)
 */
export type SeedPlace = Place;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error type for database operations
 */
export interface DbError {
  /** Error type discriminator */
  type: 'validation' | 'quota_exceeded' | 'database' | 'not_found';
  
  /** Human-readable error message */
  message: string;
  
  /** Optional field-specific errors for validation */
  fields?: Record<string, string>;
}

/**
 * Validation error when data doesn't meet requirements
 */
export interface ValidationError extends DbError {
  type: 'validation';
  fields: Record<string, string>;
}

/**
 * Error when browser storage quota is exceeded
 */
export interface QuotaExceededError extends DbError {
  type: 'quota_exceeded';
}

/**
 * Generic database operation error
 */
export interface DatabaseError extends DbError {
  type: 'database';
}

/**
 * Error when requested entity is not found
 */
export interface NotFoundError extends DbError {
  type: 'not_found';
}

// ============================================================================
// Operation Result Types
// ============================================================================

/**
 * Result type for operations that may fail
 * Uses discriminated union for type-safe error handling
 */
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: DbError };

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if error is a validation error
 */
export function isValidationError(error: DbError): error is ValidationError {
  return error.type === 'validation';
}

/**
 * Type guard to check if error is a quota exceeded error
 */
export function isQuotaExceededError(error: DbError): error is QuotaExceededError {
  return error.type === 'quota_exceeded';
}

/**
 * Type guard to check if error is a database error
 */
export function isDatabaseError(error: DbError): error is DatabaseError {
  return error.type === 'database';
}

/**
 * Type guard to check if error is a not found error
 */
export function isNotFoundError(error: DbError): error is NotFoundError {
  return error.type === 'not_found';
}
