/**
 * Result Utilities - Helper functions for working with neverthrow Results
 * 
 * Provides convenient patterns for accessing and transforming Result values.
 * Use these helpers for cleaner error handling code.
 * 
 * Refactored: 2025-10-15 (neverthrow integration)
 */

import type { Result, DbError } from './models';

/**
 * Check if Result is successful
 * 
 * @example
 * if (isOk(result)) {
 *   console.log('Success!', unwrap(result));
 * }
 */
export function isOk<T>(result: Result<T>): boolean {
  return result.isOk();
}

/**
 * Check if Result is an error
 * 
 * @example
 * if (isErr(result)) {
 *   console.error('Failed:', unwrapErr(result).message);
 * }
 */
export function isErr<T>(result: Result<T>): boolean {
  return result.isErr();
}

/**
 * Safely unwrap a successful Result
 * Throws if Result is an error - use isOk() check first
 * 
 * @example
 * if (isOk(result)) {
 *   const data = unwrap(result);
 * }
 */
export function unwrap<T>(result: Result<T>): T {
  return result._unsafeUnwrap();
}

/**
 * Safely unwrap an error Result
 * Throws if Result is successful - use isErr() check first
 * 
 * @example
 * if (isErr(result)) {
 *   const error = unwrapErr(result);
 * }
 */
export function unwrapErr<T>(result: Result<T>): DbError {
  return result._unsafeUnwrapErr();
}

/**
 * Get data from Result or return a default value
 * 
 * @example
 * const trips = unwrapOr(result, []);
 */
export function unwrapOr<T>(result: Result<T>, defaultValue: T): T {
  return result.unwrapOr(defaultValue);
}

/**
 * Transform Result data or return a default value if error
 * 
 * @example
 * const tripCount = mapOr(result, trips => trips.length, 0);
 */
export function mapOr<T, U>(
  result: Result<T>,
  fn: (value: T) => U,
  defaultValue: U
): U {
  return result.isOk() ? fn(result._unsafeUnwrap()) : defaultValue;
}

/**
 * Pattern match on Result (functional style)
 * 
 * @example
 * const message = match(
 *   result,
 *   data => `Found ${data.length} trips`,
 *   error => `Error: ${error.message}`
 * );
 */
export function match<T, U>(
  result: Result<T>,
  onSuccess: (value: T) => U,
  onError: (error: DbError) => U
): U {
  return result.match(onSuccess, onError);
}

/**
 * Execute side effects based on Result (for logging, UI updates, etc.)
 * Returns the original Result for chaining
 * 
 * @example
 * tap(
 *   result,
 *   data => console.log('Success:', data),
 *   error => console.error('Error:', error.message)
 * );
 */
export function tap<T>(
  result: Result<T>,
  onSuccess?: (value: T) => void,
  onError?: (error: DbError) => void
): Result<T> {
  if (result.isOk() && onSuccess) {
    onSuccess(result._unsafeUnwrap());
  } else if (result.isErr() && onError) {
    onError(result._unsafeUnwrapErr());
  }
  return result;
}

/**
 * Combine multiple Results into a single Result
 * If all are successful, returns array of values
 * If any fails, returns the first error
 * 
 * @example
 * const results = await combineResults([
 *   getFlights(tripId),
 *   getHotels(tripId),
 *   getActivities(tripId)
 * ]);
 * 
 * if (isOk(results)) {
 *   const [flights, hotels, activities] = unwrap(results);
 * }
 */
export async function combineResults<T extends readonly unknown[]>(
  results: Promise<Result<T[number]>>[]
): Promise<Result<T>> {
  const resolved = await Promise.all(results);
  
  for (const result of resolved) {
    if (result.isErr()) {
      return result as any;
    }
  }
  
  const values = resolved.map(r => r._unsafeUnwrap()) as unknown as T;
  const { ok } = await import('neverthrow');
  return ok(values);
}
