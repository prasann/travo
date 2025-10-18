import { isOk, unwrap, unwrapErr } from "@/lib/db/resultHelpers";
import type { Result } from "@/lib/db/models";

/**
 * Converts our Result<T> pattern to Refine's Promise<T> pattern.
 * 
 * Our database operations return Result<T> which is either:
 * - Ok({ data: T }) - Success case
 * - Err({ error: DatabaseError }) - Failure case
 * 
 * Refine expects operations to:
 * - Resolve the promise with data on success
 * - Reject the promise with an error on failure
 * 
 * @param result - The Result<T> from database operation
 * @returns Promise that resolves with data or rejects with error
 * 
 * @example
 * const result = await getAllTrips();
 * const trips = await resultToPromise(result); // Throws on error
 */
export async function resultToPromise<T>(result: Result<T>): Promise<T> {
  if (isOk(result)) {
    return unwrap(result);
  } else {
    const error = unwrapErr(result);
    throw new Error(error.message);
  }
}

/**
 * Wraps a function that returns Result<T> to return Promise<T> instead.
 * Useful for partially applying the conversion.
 * 
 * @param fn - Function that returns Result<T>
 * @returns Function that returns Promise<T>
 * 
 * @example
 * const getAllTripsPromise = wrapResult(getAllTrips);
 * const trips = await getAllTripsPromise(); // Throws on error
 */
export function wrapResult<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<Result<T>>
): (...args: Args) => Promise<T> {
  return async (...args: Args) => {
    const result = await fn(...args);
    return resultToPromise(result);
  };
}
