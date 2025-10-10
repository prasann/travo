# Data Model: Minimalistic Frontend

**Phase**: 1 - Design & Contracts  
**Date**: October 10, 2025  
**Feature**: Minimalistic Frontend with Hardcoded Data

## Entity Definitions

### Trip Entity

Represents a travel itinerary with basic information and associated places.

```typescript
interface Trip {
  id: string;                    // UUID v4 identifier
  name: string;                  // User-defined trip name
  description?: string;          // Optional trip description/notes
  start_date: string;           // ISO 8601 date string (YYYY-MM-DD)
  end_date: string;             // ISO 8601 date string (YYYY-MM-DD)
  updated_at: string;           // ISO 8601 datetime string (for future sync)
  places: Place[];              // Array of associated places
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `name`: Required, 1-100 characters
- `description`: Optional, max 500 characters
- `start_date`: Required, valid ISO date, cannot be after end_date
- `end_date`: Required, valid ISO date, cannot be before start_date
- `updated_at`: Required, valid ISO datetime string
- `places`: Array of Place objects, ordered by order_index

**Example**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tokyo Adventure",
  "description": "Spring cherry blossom trip to Tokyo",
  "start_date": "2025-04-01",
  "end_date": "2025-04-07",
  "updated_at": "2025-10-10T10:00:00.000Z",
  "places": [...]
}
```

### Place Entity

Represents a specific location within a trip itinerary.

```typescript
interface Place {
  id: string;                    // UUID v4 identifier
  trip_id: string;              // Foreign key to parent trip
  name: string;                 // Human-readable place name
  plus_code: string;            // Google Plus Code (8-character)
  notes?: string;               // Optional user notes about the place
  order_index: number;          // Sort order within the trip (0-based)
  updated_at: string;           // ISO 8601 datetime string (for future sync)
}
```

**Validation Rules**:
- `id`: Must be valid UUID v4 format
- `trip_id`: Must reference existing Trip.id
- `name`: Required, 1-100 characters
- `plus_code`: Required, valid 8-character Plus Code format
- `notes`: Optional, max 500 characters
- `order_index`: Non-negative integer, unique within trip
- `updated_at`: Required, valid ISO datetime string

**Example**:
```json
{
  "id": "456e7890-e12b-34c5-d678-901234567890",
  "trip_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tokyo Skytree",
  "plus_code": "8Q7XQXXR+33",
  "notes": "Great city view at sunset. Visit around 5-6 PM.",
  "order_index": 0,
  "updated_at": "2025-10-10T10:00:00.000Z"
}
```

### Navigation State

Manages the current view and selected trip for routing.

```typescript
interface NavigationState {
  currentView: 'trip-list' | 'trip-details';
  selectedTripId?: string;      // UUID of currently viewed trip
}
```

## Relationships

```
Trip (1) ──→ Places (many)
- One trip can have multiple places
- Places belong to exactly one trip
- Places are ordered by order_index within each trip
- Cascade delete: removing trip removes all its places
```

## Data Constraints

### Business Rules
1. Trip dates must be logical (start_date ≤ end_date)
2. Place order_index must be unique within each trip
3. All entities must have valid UUIDs for future sync compatibility
4. Plus Codes must follow Google's 8-character format

### Performance Considerations
- Trips array should be sorted by start_date for display
- Places within each trip should be sorted by order_index
- Consider trip.places as embedded array for efficient lookups

## Hardcoded Data Structure

For the initial implementation, data will be structured as:

```typescript
// src/data/trips.json
interface AppData {
  trips: Trip[];
}

// Data will be loaded synchronously in components
const mockData: AppData = {
  trips: [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Tokyo Adventure",
      description: "Spring cherry blossom trip",
      start_date: "2025-04-01",
      end_date: "2025-04-07",
      updated_at: "2025-10-10T10:00:00.000Z",
      places: [
        {
          id: "456e7890-e12b-34c5-d678-901234567890",
          trip_id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Tokyo Skytree",
          plus_code: "8Q7XQXXR+33",
          notes: "Great city view at sunset",
          order_index: 0,
          updated_at: "2025-10-10T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

## Migration Considerations

This data model is designed for future migration to:

1. **IndexedDB**: Same structure with local persistence
2. **Supabase**: Direct mapping to PostgreSQL tables
3. **Sync**: updated_at timestamps enable conflict resolution
4. **Relationships**: Foreign keys ready for relational database

The TypeScript interfaces will remain stable across all storage implementations.