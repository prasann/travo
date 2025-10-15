/**
 * Error Handling Utilities for Travo Database Layer
 * 
 * Feature: 005-let-s-introduce
 * Date: 2025-10-12
 * Refactored: 2025-10-15 (neverthrow integration)
 */

import { ok, err } from 'neverthrow';
import type { 
  DbError, 
  ValidationError, 
  QuotaExceededError, 
  DatabaseError, 
  NotFoundError,
  Result 
} from './models';

// ============================================================================
// Neverthrow Export (for cleaner imports)
// ============================================================================

export { ok, err } from 'neverthrow';

/**
 * Create a validation error
 */
export function createValidationError(
  message: string,
  fields: Record<string, string>
): ValidationError {
  return {
    type: 'validation',
    message,
    fields
  };
}

/**
 * Create a quota exceeded error
 */
export function createQuotaExceededError(message?: string): QuotaExceededError {
  return {
    type: 'quota_exceeded',
    message: message || 'Storage quota exceeded. Please free up space.'
  };
}

/**
 * Create a generic database error
 */
export function createDatabaseError(message?: string): DatabaseError {
  return {
    type: 'database',
    message: message || 'A database error occurred. Please try again.'
  };
}

/**
 * Create a not found error
 */
export function createNotFoundError(entityType: string, id: string): NotFoundError {
  return {
    type: 'not_found',
    message: `${entityType} with id '${id}' not found.`
  };
}

/**
 * Wrap a database operation with error handling
 * Converts exceptions into Result type using neverthrow
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await operation();
    return ok(data);
  } catch (error) {
    // Handle quota exceeded errors
    if (error instanceof Error && 
        (error.name === 'QuotaExceededError' || 
         error.message.includes('quota') ||
         error.message.includes('storage'))) {
      return err(createQuotaExceededError());
    }
    
    // Handle other database errors
    return err(createDatabaseError(
      error instanceof Error ? error.message : 'Unknown database error'
    ));
  }
}
