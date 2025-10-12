# Quickstart Guide: Travo Local Database Layer

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12  
**For**: Developers integrating with the database layer

## Overview

This guide provides everything you need to start using the Travo local database layer. The database layer provides a complete CRUD API for Trip and Place entities using IndexedDB for persistent browser storage.

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install dexie@^4.0.0 uuid@^9.0.0
npm install --save-dev @types/uuid fake-indexeddb
```

### 2. Verify Existing Structure

The database layer will be implemented in:
```
frontend/lib/db/
├── index.ts            # Public API exports
├── schema.ts          # Dexie database schema
├── models.ts          # TypeScript interfaces
├── seed.ts            # Seed data loader
└── operations/
    ├── trips.ts       # Trip CRUD operations
    └── places.ts      # Place CRUD operations
```

## Quick Start

### Initialize the Database

On application startup (e.g., in `app/layout.tsx` or a custom hook):

```typescript
import { initializeDatabase } from '@/lib/db';

// In your app initialization
useEffect(() => {
  initializeDatabase()
    .then(result => {
      if (!result.success) {
        console.error('Database initialization failed:', result.error.message);
        // Show error to user
      }
    });
}, []);
```

### Basic Usage Examples

#### Get All Trips

```typescript
import { getAllTrips } from '@/lib/db';

const result = await getAllTrips();

if (result.success) {
  const trips = result.data;
  console.log(`Found ${trips.length} trips`);
} else {
  console.error('Failed to load trips:', result.error.message);
}
```

#### Get Trip with Places

```typescript
import { getTripWithPlaces } from '@/lib/db';

const result = await getTripWithPlaces(tripId);

if (result.success) {
  const { id, name, places } = result.data;
  console.log(`Trip: ${name} has ${places.length} places`);
} else {
  console.error('Failed to load trip:', result.error.message);
}
```

#### Create a New Trip

```typescript
import { createTrip } from '@/lib/db';
import type { TripInput } from '@/lib/db/models';

const newTrip: TripInput = {
  name: 'Summer Vacation',
  description: 'Beach getaway',
  start_date: '2025-06-01',
  end_date: '2025-06-10'
};

const result = await createTrip(newTrip);

if (result.success) {
  console.log('Created trip:', result.data.id);
} else {
  if (result.error.type === 'validation') {
    console.error('Validation errors:', result.error.fields);
  } else {
    console.error('Error:', result.error.message);
  }
}
```

#### Update a Trip

```typescript
import { updateTrip } from '@/lib/db';

const result = await updateTrip({
  id: tripId,
  name: 'Updated Trip Name',
  description: 'New description'
});

if (result.success) {
  console.log('Trip updated:', result.data);
} else {
  console.error('Update failed:', result.error.message);
}
```

#### Soft Delete and Restore

```typescript
import { deleteTrip, restoreTrip, getDeletedTrips } from '@/lib/db';

// Soft delete a trip
const deleteResult = await deleteTrip(tripId);

if (deleteResult.success) {
  console.log('Trip deleted (can be restored)');
}

// Get all deleted trips
const deletedResult = await getDeletedTrips();

if (deletedResult.success) {
  console.log('Deleted trips:', deletedResult.data);
}

// Restore a trip
const restoreResult = await restoreTrip(tripId);

if (restoreResult.success) {
  console.log('Trip restored:', restoreResult.data);
}
```

#### Working with Places

```typescript
import { createPlace, getPlacesByTripId } from '@/lib/db';
import type { PlaceInput } from '@/lib/db/models';

// Create a place
const newPlace: PlaceInput = {
  trip_id: tripId,
  name: 'Tokyo Tower',
  plus_code: '8Q7XPM2F+22',
  notes: 'Visit at sunset',
  order_index: 0
};

const createResult = await createPlace(newPlace);

if (createResult.success) {
  console.log('Place created:', createResult.data.id);
}

// Get all places for a trip
const placesResult = await getPlacesByTripId(tripId);

if (placesResult.success) {
  const places = placesResult.data;
  console.log(`Found ${places.length} places`);
  places.forEach(place => {
    console.log(`- ${place.name} (order: ${place.order_index})`);
  });
}
```

## Error Handling

All database operations return a `Result<T>` type for type-safe error handling:

```typescript
import type { Result } from '@/lib/db/models';

const result: Result<Trip> = await getTripById(id);

if (result.success) {
  // TypeScript knows result.data is Trip
  const trip = result.data;
} else {
  // TypeScript knows result.error is DbError
  const error = result.error;
  
  switch (error.type) {
    case 'validation':
      // Handle validation errors
      console.error('Validation failed:', error.fields);
      break;
      
    case 'quota_exceeded':
      // Handle storage quota exceeded
      alert('Storage full. Please free up space.');
      break;
      
    case 'not_found':
      // Handle entity not found
      console.error('Entity not found');
      break;
      
    case 'database':
      // Handle generic database errors
      console.error('Database error:', error.message);
      break;
  }
}
```

## React Integration

### Custom Hook Example

```typescript
// hooks/useTrips.ts
import { useState, useEffect } from 'react';
import { getAllTrips } from '@/lib/db';
import type { Trip } from '@/lib/db/models';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadTrips();
  }, []);
  
  async function loadTrips() {
    setLoading(true);
    const result = await getAllTrips();
    
    if (result.success) {
      setTrips(result.data);
      setError(null);
    } else {
      setError(result.error.message);
    }
    
    setLoading(false);
  }
  
  return { trips, loading, error, reload: loadTrips };
}

// Usage in component
function TripList() {
  const { trips, loading, error } = useTrips();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <ul>
      {trips.map(trip => (
        <li key={trip.id}>{trip.name}</li>
      ))}
    </ul>
  );
}
```

## Testing

### Test Setup

```typescript
// __tests__/db/setup.ts
import 'fake-indexeddb/auto';
import { initializeDatabase } from '@/lib/db';

beforeEach(async () => {
  // Initialize fresh database for each test
  const result = await initializeDatabase();
  expect(result.success).toBe(true);
});
```

### Example Test

```typescript
// __tests__/db/trips.test.ts
import { createTrip, getTripById } from '@/lib/db';
import type { TripInput } from '@/lib/db/models';

describe('Trip Operations', () => {
  it('should create and retrieve a trip', async () => {
    const tripData: TripInput = {
      name: 'Test Trip',
      start_date: '2025-01-01',
      end_date: '2025-01-05'
    };
    
    const createResult = await createTrip(tripData);
    expect(createResult.success).toBe(true);
    
    if (createResult.success) {
      const tripId = createResult.data.id;
      
      const getResult = await getTripById(tripId);
      expect(getResult.success).toBe(true);
      
      if (getResult.success) {
        expect(getResult.data.name).toBe('Test Trip');
      }
    }
  });
  
  it('should validate required fields', async () => {
    const invalidTrip = {
      name: '',
      start_date: '2025-01-01',
      end_date: '2025-01-05'
    } as TripInput;
    
    const result = await createTrip(invalidTrip);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      expect(result.error.type).toBe('validation');
      expect(result.error.fields).toHaveProperty('name');
    }
  });
});
```

## Performance Tips

### 1. Batch Operations
```typescript
// Instead of multiple individual queries
for (const tripId of tripIds) {
  await getTripById(tripId); // ❌ Slow
}

// Get all trips at once
const result = await getAllTrips(); // ✅ Fast
const relevantTrips = result.success 
  ? result.data.filter(t => tripIds.includes(t.id))
  : [];
```

### 2. Lazy Load Places
```typescript
// Don't load places unless needed
const trips = await getAllTrips(); // Just trips, no places

// Load places only when viewing trip details
const tripWithPlaces = await getTripWithPlaces(selectedTripId);
```

### 3. Cache Results
```typescript
// Cache trips in component state or React Query
const [tripsCache, setTripsCache] = useState<Trip[]>([]);

// Only reload when needed (e.g., after create/update/delete)
```

## Common Patterns

### Loading State Pattern

```typescript
function DataComponent() {
  const [data, setData] = useState<Trip[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    setStatus('loading');
    getAllTrips()
      .then(result => {
        if (result.success) {
          setData(result.data);
          setStatus('success');
        } else {
          setError(result.error.message);
          setStatus('error');
        }
      });
  }, []);
  
  return (
    <>
      {status === 'loading' && <LoadingSpinner />}
      {status === 'error' && <ErrorMessage message={error!} />}
      {status === 'success' && <TripList trips={data} />}
    </>
  );
}
```

### Optimistic Updates

```typescript
async function handleDeleteTrip(tripId: string) {
  // Optimistically remove from UI
  const originalTrips = trips;
  setTrips(trips.filter(t => t.id !== tripId));
  
  // Perform actual delete
  const result = await deleteTrip(tripId);
  
  if (!result.success) {
    // Rollback on error
    setTrips(originalTrips);
    alert('Delete failed: ' + result.error.message);
  }
}
```

## Troubleshooting

### Database Won't Initialize
- Check browser console for errors
- Verify IndexedDB is supported: `'indexedDB' in window`
- Check browser storage quota
- Verify seed data JSON is valid

### Quota Exceeded Error
- Browser has limited storage per origin (~50MB typically)
- Clear old data or implement data cleanup
- Consider implementing data export/archive feature

### TypeScript Errors
- Ensure all types imported from `@/lib/db/models`
- Use `Result<T>` type for all database operations
- Check for null/undefined handling

## Next Steps

- **Phase 2**: UI integration (future work)
- **Future**: Supabase sync implementation
- **Future**: Advanced query features (search, filter, sort)

## API Reference

See [`contracts/interfaces.ts`](./contracts/interfaces.ts) for complete API documentation.

## Support

For issues or questions:
1. Check error messages (all are user-friendly)
2. Review this quickstart guide
3. Check TypeScript types for API usage
4. Refer to Dexie.js documentation for IndexedDB details
