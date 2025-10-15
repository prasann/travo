# Neverthrow Migration Guide

This guide helps you migrate from the old `Result<T>` pattern to neverthrow's Result type.

## What Changed?

We've integrated [neverthrow](https://github.com/supermacro/neverthrow) for better error handling with Railway Oriented Programming patterns.

### Before (Old Pattern)
```typescript
const result = await getTripById(id);

if (result.success) {
  console.log('Trip:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### After (Neverthrow Pattern)
```typescript
const result = await getTripById(id);

// Option 1: Using match() (recommended)
result.match(
  trip => console.log('Trip:', trip),
  error => console.error('Error:', error.message)
);

// Option 2: Using isOk()
if (result.isOk()) {
  console.log('Trip:', result.value);
} else {
  console.error('Error:', result.error.message);
}

// Option 3: Using our helper utilities
import { isOk, unwrap, unwrapErr } from '@/lib/db';

if (isOk(result)) {
  const trip = unwrap(result);
  console.log('Trip:', trip);
} else {
  const error = unwrapErr(result);
  console.error('Error:', error.message);
}
```

## Key Differences

| Old Pattern | Neverthrow | Helper Utility |
|-------------|------------|----------------|
| `result.success` | `result.isOk()` | `isOk(result)` |
| `result.data` | `result.value` or `result._unsafeUnwrap()` | `unwrap(result)` |
| `result.error` | `result.error` or `result._unsafeUnwrapErr()` | `unwrapErr(result)` |

## Benefits of Neverthrow

### 1. Composable Error Handling

```typescript
// Chain operations - stops at first error
const result = await getUserId()
  .andThen(id => getTripById(id))
  .andThen(trip => validateTrip(trip))
  .andThen(trip => saveTrip(trip));

result.match(
  trip => console.log('Saved:', trip.name),
  error => console.error('Failed:', error.message)
);
```

### 2. Transform Data with map()

```typescript
// Transform success value without unwrapping
const tripName = await getTripById(id)
  .map(trip => trip.name);

tripName.match(
  name => console.log('Trip name:', name),
  error => console.error('Error:', error.message)
);
```

### 3. Transform Errors with mapErr()

```typescript
// Enhance error messages
const result = await getTripById(id)
  .mapErr(error => ({
    ...error,
    message: `Failed to load trip ${id}: ${error.message}`
  }));
```

### 4. Async Operations

```typescript
import { ResultAsync } from 'neverthrow';

// Wrap async operations
const result = ResultAsync.fromPromise(
  fetch('/api/trips'),
  error => ({ type: 'network', message: String(error) })
);

await result
  .andThen(response => ResultAsync.fromPromise(
    response.json(),
    () => ({ type: 'parse', message: 'Invalid JSON' })
  ))
  .match(
    data => console.log('Data:', data),
    error => console.error('Error:', error.message)
  );
```

### 5. Combine Multiple Results

```typescript
import { combineResults } from '@/lib/db';

// Load multiple entities in parallel
const results = await combineResults([
  getFlights(tripId),
  getHotels(tripId),
  getActivities(tripId)
]);

results.match(
  ([flights, hotels, activities]) => {
    console.log('All data loaded successfully');
  },
  error => console.error('Failed to load data:', error.message)
);
```

## Migration Strategy

### Phase 1: Add Neverthrow (✅ Complete)
- Install neverthrow package
- Update Result type definition
- Add helper utilities
- Ensure backward compatibility

### Phase 2: Update New Code (Current)
- Use neverthrow patterns in new features
- Use `.match()` for new error handling
- Use `.andThen()` for operation chaining

### Phase 3: Gradual Refactoring (Future)
- Update existing code file-by-file
- Start with isolated modules
- Update components last
- Test thoroughly after each change

## Common Patterns

### Pattern 1: Early Return on Error
```typescript
// Before
async function processTrip(id: string) {
  const result = await getTripById(id);
  if (!result.success) {
    return result; // Return error result
  }
  const trip = result.data;
  // ... process trip
}

// After
async function processTrip(id: string) {
  const tripResult = await getTripById(id);
  if (tripResult.isErr()) {
    return tripResult; // Type-safe error propagation
  }
  const trip = tripResult.value;
  // ... process trip
}
```

### Pattern 2: Default Values
```typescript
// Before
const trips = result.success ? result.data : [];

// After (using helper)
import { unwrapOr } from '@/lib/db';
const trips = unwrapOr(result, []);

// After (native neverthrow)
const trips = result.unwrapOr([]);
```

### Pattern 3: Transform and Display
```typescript
// Before
const message = result.success 
  ? `Loaded ${result.data.length} trips`
  : `Error: ${result.error.message}`;

// After (using helper)
import { match } from '@/lib/db';
const message = match(
  result,
  trips => `Loaded ${trips.length} trips`,
  error => `Error: ${error.message}`
);

// After (native neverthrow)
const message = result.match(
  trips => `Loaded ${trips.length} trips`,
  error => `Error: ${error.message}`
);
```

### Pattern 4: Side Effects (Logging, UI Updates)
```typescript
// Before
if (result.success) {
  console.log('Success:', result.data);
  setTrips(result.data);
} else {
  console.error('Error:', result.error);
  setError(result.error.message);
}

// After (using helper)
import { tap, isOk, unwrap, unwrapErr } from '@/lib/db';

tap(
  result,
  trips => {
    console.log('Success:', trips);
    setTrips(trips);
  },
  error => {
    console.error('Error:', error);
    setError(error.message);
  }
);
```

## Helper Utilities Reference

We provide helper functions for easier migration:

```typescript
import {
  ok,           // Create successful Result
  err,          // Create error Result
  isOk,         // Check if Result is successful
  isErr,        // Check if Result is an error
  unwrap,       // Get success value (throws if error)
  unwrapErr,    // Get error value (throws if success)
  unwrapOr,     // Get value or default
  mapOr,        // Transform value or return default
  match,        // Pattern match on Result
  tap,          // Execute side effects
  combineResults // Combine multiple Results
} from '@/lib/db';
```

## Resources

- [Neverthrow Documentation](https://github.com/supermacro/neverthrow)
- [Railway Oriented Programming](https://fsharpforfunandprofit.com/rop/)
- [Functional Error Handling](https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-modeling-77a0d011b20)

## Questions?

See `/frontend/lib/db/resultUtils.ts` for implementation examples of helper utilities.
