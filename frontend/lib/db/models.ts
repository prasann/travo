/**
 * TypeScript Interface Contracts for Travo Local Database Layer
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * 
 * This file defines the TypeScript interfaces for the local database layer.
 * These interfaces serve as the contract between the database layer and consumers.
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Trip entity representing a travel itinerary
 */
export interface Trip {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Trip name/title */
  name: string;
  
  /** Detailed trip description (optional) */
  description?: string;
  
  /** Trip start date in ISO 8601 format (YYYY-MM-DD) */
  start_date: string;
  
  /** Trip end date in ISO 8601 format (YYYY-MM-DD) */
  end_date: string;
  
  /** Soft delete flag (true = deleted, false = active) */
  deleted: boolean;
  
  /** Last modification timestamp in ISO 8601 format */
  updated_at: string;
}

/**
 * Place entity representing a location within a trip
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
// Input Types (for Create/Update operations)
// ============================================================================

/**
 * Input type for creating a new trip (omits generated fields)
 */
export type TripInput = Omit<Trip, 'id' | 'updated_at' | 'deleted'>;

/**
 * Input type for updating an existing trip (all fields optional except id)
 */
export type TripUpdate = Partial<Omit<Trip, 'id' | 'updated_at' | 'deleted'>> & {
  id: string;
};

/**
 * Input type for creating a new place (omits generated fields)
 */
export type PlaceInput = Omit<Place, 'id' | 'updated_at'>;

/**
 * Input type for updating an existing place (all fields optional except id)
 */
export type PlaceUpdate = Partial<Omit<Place, 'id' | 'updated_at'>> & {
  id: string;
};

// ============================================================================
// Query Result Types
// ============================================================================

/**
 * Trip with associated places included
 */
export interface TripWithPlaces extends Trip {
  /** Array of places belonging to this trip */
  places: Place[];
}

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
// Seed Data Types
// ============================================================================

/**
 * Structure of seed data JSON file
 */
export interface SeedData {
  trips: SeedTrip[];
}

/**
 * Trip structure in seed data (includes nested places)
 */
export interface SeedTrip extends Omit<Trip, 'deleted'> {
  places: SeedPlace[];
}

/**
 * Place structure in seed data
 */
export type SeedPlace = Place;

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
