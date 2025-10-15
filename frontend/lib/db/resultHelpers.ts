/**
 * Result Helper Functions
 * 
 * Minimal helpers for working with neverthrow Results.
 * These provide a cleaner API than calling ._unsafeUnwrap() directly.
 */

import type { Result } from './models';

/**
 * Check if Result is successful
 */
export function isOk<T>(result: Result<T>): boolean {
  return result.isOk();
}

/**
 * Check if Result is an error
 */
export function isErr<T>(result: Result<T>): boolean {
  return result.isErr();
}

/**
 * Get success value from Result (throws if error)
 */
export function unwrap<T>(result: Result<T>): T {
  return result._unsafeUnwrap();
}

/**
 * Get error from Result (throws if success)
 */
export function unwrapErr<T>(result: Result<T>) {
  return result._unsafeUnwrapErr();
}
