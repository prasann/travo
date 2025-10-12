/**
 * Validation Utilities for Travo Database Layer
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import type { TripInput, PlaceInput, ValidationError } from './models';

/**
 * Validate UUID v4 format
 */
export function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate ISO 8601 date format (YYYY-MM-DD)
 */
export function validateDateFormat(dateString: string): boolean {
  // Check format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  
  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate trip input data
 * Returns ValidationError if validation fails, null if valid
 */
export function validateTripInput(input: TripInput): ValidationError | null {
  const fields: Record<string, string> = {};
  
  // Validate required fields
  if (!input.name || input.name.trim() === '') {
    fields.name = 'Trip name is required';
  }
  
  if (!input.start_date) {
    fields.start_date = 'Start date is required';
  } else if (!validateDateFormat(input.start_date)) {
    fields.start_date = 'Start date must be in YYYY-MM-DD format';
  }
  
  if (!input.end_date) {
    fields.end_date = 'End date is required';
  } else if (!validateDateFormat(input.end_date)) {
    fields.end_date = 'End date must be in YYYY-MM-DD format';
  }
  
  // Return error if any validation failed
  if (Object.keys(fields).length > 0) {
    return {
      type: 'validation',
      message: 'Trip validation failed',
      fields
    };
  }
  
  return null;
}

/**
 * Validate place input data
 * Returns ValidationError if validation fails, null if valid
 */
export function validatePlaceInput(input: PlaceInput): ValidationError | null {
  const fields: Record<string, string> = {};
  
  // Validate required fields
  if (!input.name || input.name.trim() === '') {
    fields.name = 'Place name is required';
  }
  
  if (!input.trip_id || input.trip_id.trim() === '') {
    fields.trip_id = 'Trip ID is required';
  } else if (!validateUUID(input.trip_id)) {
    fields.trip_id = 'Trip ID must be a valid UUID';
  }
  
  if (input.order_index === undefined || input.order_index === null) {
    fields.order_index = 'Order index is required';
  } else if (input.order_index < 0) {
    fields.order_index = 'Order index must be non-negative';
  }
  
  // Return error if any validation failed
  if (Object.keys(fields).length > 0) {
    return {
      type: 'validation',
      message: 'Place validation failed',
      fields
    };
  }
  
  return null;
}
