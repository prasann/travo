/**
 * Validation Utilities for Travo Database Layer
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 */

import type { TripInput, ValidationError } from './models';

/**
 * Validate UUID format (lenient - just checks it's a non-empty string)
 */
export function validateUUID(id: string): boolean {
  return typeof id === 'string' && id.length > 0;
}

/**
 * Validate date format (lenient - just checks it's a non-empty string)
 */
export function validateDateFormat(dateString: string): boolean {
  return typeof dateString === 'string' && dateString.length > 0;
}

/**
 * Validate trip input data (minimal validation)
 * Returns ValidationError if validation fails, null if valid
 */
export function validateTripInput(input: TripInput): ValidationError | null {
  const fields: Record<string, string> = {};
  
  // Only validate that required fields exist
  if (!input.name) {
    fields.name = 'Trip name is required';
  }
  
  if (!input.start_date) {
    fields.start_date = 'Start date is required';
  }
  
  if (!input.end_date) {
    fields.end_date = 'End date is required';
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
