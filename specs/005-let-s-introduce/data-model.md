# Data Model: Local Database Layer (Enhanced)

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12 (Revised)  
**Phase**: 1 - Design & Contracts (Post-Merge Update)

## Overview

This document defines the **enhanced data model** for the IndexedDB-backed local database layer, incorporating the comprehensive trip planning model from the merged main branch (005-need-to-better feature). The model now consists of **9 entity types** with complex relationships, supporting flights, hotels, daily activities, and restaurant recommendations, all with soft deletion support and future synchronization capabilities.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────┐
│ Trip                                            │
│─────────────────────────────────────────────────│
│ id: string (UUID, PK)                           │
│ name: string                                    │
│ description: string?                            │
│ start_date: string (ISO 8601)                   │
│ end_date: string (ISO 8601)                     │
│ home_location: string?                          │
│ deleted: boolean (default: false)               │
│ updated_at: string (ISO 8601 timestamp)         │
└─────────────────────────────────────────────────┘
       │ 1:N         │ 1:N        │ 1:N         │ 1:N
       ▼             ▼            ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐
│ Flight   │  │ Hotel    │  │ Activity │  │ Restaurant       │
│──────────│  │──────────│  │──────────│  │──────────────────│
│ id       │  │ id       │  │ id       │  │ id               │
│ trip_id  │  │ trip_id  │  │ trip_id  │  │ trip_id          │
│ airline  │  │ name     │  │ name     │  │ name             │
│ ...      │  │ city     │  │ date     │  │ city             │
└──────────┘  │ ...      │  │ ...      │  │ cuisine_type     │
       │      └──────────┘  └──────────┘  │ ...              │
       │ 1:N                               └──────────────────┘
       ▼
┌──────────────┐
│ FlightLeg    │
│──────────────│
│ id           │
│ flight_id    │
│ leg_number   │
│ ...          │
└──────────────┘

Note: Place entity from original design deprecated in favor of DailyActivity
```

## Entity Specifications

### 1. Trip

**Core entity** representing a complete travel itinerary with flexible composition.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `name` | string | Yes | - | Trip name/title |
| `description` | string | No | null | Detailed description |
| `start_date` | string | Yes | - | Start date (ISO 8601: YYYY-MM-DD) |
| `end_date` | string | Yes | - | End date (ISO 8601: YYYY-MM-DD) |
| `home_location` | string | No | null | Starting location (e.g., "San Francisco") |
| `deleted` | boolean | No | false | Soft delete flag |
| `updated_at` | string | Yes | Current timestamp | Last modification (ISO 8601) |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `deleted` (for filtering active vs deleted)
- Secondary: `updated_at` (for sync operations)

**Relationships**:
- 1:N with Flight (optional)
- 1:N with Hotel (optional)
- 1:N with DailyActivity (optional)
- 1:N with RestaurantRecommendation (optional)

**Lifecycle**:
```
[Created] -> [Active] -> [Soft Deleted] -> [Restored] -> [Active]
```

---

### 2. Flight

**Air travel segment** with optional multi-leg support for connections.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `trip_id` | string | Yes | - | Parent trip reference |
| `updated_at` | string | Yes | Current timestamp | Last modification |
| `airline` | string | No | null | Airline name (e.g., "United Airlines") |
| `flight_number` | string | No | null | Flight number (e.g., "UA837") |
| `departure_time` | string | No | null | Departure with timezone (ISO 8601) |
| `arrival_time` | string | No | null | Arrival with timezone (ISO 8601) |
| `departure_location` | string | No | null | Airport/city (e.g., "SFO") |
| `arrival_location` | string | No | null | Airport/city (e.g., "NRT") |
| `confirmation_number` | string | No | null | Booking confirmation |
| `notes` | string | No | null | Additional notes |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `trip_id` (for queries by trip)
- Secondary: `departure_time` (for chronological sorting)

**Relationships**:
- N:1 with Trip (required)
- 1:N with FlightLeg (optional, for connections)

**Note**: All fields except `id`, `trip_id`, `updated_at` are optional to support flexible data entry.

---

### 3. FlightLeg

**Individual segment** of a multi-leg flight (connections/layovers).

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `flight_id` | string | Yes | - | Parent flight reference |
| `leg_number` | number | Yes | - | Sequence in flight (1, 2, 3...) |
| `airline` | string | No | null | Airline for this leg |
| `flight_number` | string | No | null | Flight number for this leg |
| `departure_time` | string | No | null | Leg departure with timezone |
| `arrival_time` | string | No | null | Leg arrival with timezone |
| `departure_location` | string | No | null | Leg departure airport/city |
| `arrival_location` | string | No | null | Leg arrival airport/city |
| `duration_minutes` | number | No | null | Flight duration |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `flight_id, leg_number` (compound for ordering)

**Relationships**:
- N:1 with Flight (required)

---

### 4. Hotel

**Accommodation details** with check-in/check-out information.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `trip_id` | string | Yes | - | Parent trip reference |
| `updated_at` | string | Yes | Current timestamp | Last modification |
| `name` | string | No | null | Hotel name |
| `address` | string | No | null | Full hotel address |
| `city` | string | No | null | City name (for grouping) |
| `check_in_time` | string | No | null | Check-in with timezone |
| `check_out_time` | string | No | null | Check-out with timezone |
| `confirmation_number` | string | No | null | Reservation ID |
| `phone` | string | No | null | Hotel contact number |
| `notes` | string | No | null | Additional notes |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `trip_id` (for queries by trip)
- Secondary: `check_in_time` (for chronological sorting)
- Secondary: `city` (for grouping by location)

**Relationships**:
- N:1 with Trip (required)

**Note**: Can be completely omitted from trip if staying with friends/family.

---

### 5. DailyActivity

**Planned sightseeing or activity** with flexible timing and location data.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `trip_id` | string | Yes | - | Parent trip reference |
| `updated_at` | string | Yes | Current timestamp | Last modification |
| `name` | string | Yes | - | Activity/place name |
| `date` | string | Yes | - | Activity date (ISO 8601: YYYY-MM-DD) |
| `start_time` | string | No | null | Start time with timezone |
| `duration_minutes` | number | No | null | Activity duration |
| `order_index` | number | Yes | - | Sequencing for same-day activities |
| `city` | string | No | null | City name |
| `plus_code` | string | No | null | Google Plus Code (8 chars) |
| `address` | string | No | null | Full address |
| `image_url` | string | No | null | External image URL |
| `notes` | string | No | null | Activity details, tips |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `trip_id` (for queries by trip)
- Secondary: `date` (for daily grouping)
- Secondary: `trip_id, date, order_index` (compound for ordering)
- Secondary: `city` (for grouping by location)

**Relationships**:
- N:1 with Trip (required)

**Ordering Logic**:
- Primary: By `start_time` (when present) for chronological display
- Fallback: By `order_index` for same-day activities without specific times

**Note**: Replaces the original `Place` entity from the simple model.

---

### 6. RestaurantRecommendation

**Dining option** for reference (NOT part of daily timeline/itinerary).

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier |
| `trip_id` | string | Yes | - | Parent trip reference |
| `updated_at` | string | Yes | Current timestamp | Last modification |
| `name` | string | Yes | - | Restaurant name |
| `city` | string | No | null | City name (for grouping) |
| `cuisine_type` | string | No | null | Type (e.g., "Japanese (Ramen)") |
| `address` | string | No | null | Full address |
| `plus_code` | string | No | null | Google Plus Code |
| `phone` | string | No | null | Contact number |
| `website` | string | No | null | Restaurant website URL |
| `notes` | string | No | null | Specialties, booking info |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `trip_id` (for queries by trip)
- Secondary: `city` (for grouping by location)

**Relationships**:
- N:1 with Trip (required)

**Note**: Displayed separately from timeline, grouped by city.

---

### 7. TripIndex (Metadata)

**Lightweight summary** for trip list view optimization.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Trip ID (matches Trip.id) |
| `name` | string | Yes | Trip display name |
| `start_date` | string | Yes | Trip start date |
| `end_date` | string | Yes | Trip end date |
| `updated_at` | string | Yes | Last modification |

**Purpose**: Avoids loading full trip data for list views. Stored separately in `trip-index.json`.

---

## Database Schema (Dexie)

**Database Name**: `TravoLocalDB`

**Version**: 2 (Updated from v1)

**Schema Definition**:
```typescript
class TravoDatabase extends Dexie {
  // Core tables
  trips!: Table<Trip, string>;
  flights!: Table<Flight, string>;
  flightLegs!: Table<FlightLeg, string>;
  hotels!: Table<Hotel, string>;
  activities!: Table<DailyActivity, string>;
  restaurants!: Table<RestaurantRecommendation, string>;

  constructor() {
    super('TravoLocalDB');
    
    // Version 2: Enhanced schema
    this.version(2).stores({
      trips: 'id, deleted, updated_at, start_date, end_date',
      flights: 'id, trip_id, departure_time, updated_at',
      flightLegs: 'id, flight_id, [flight_id+leg_number]',
      hotels: 'id, trip_id, check_in_time, city, updated_at',
      activities: 'id, trip_id, date, [trip_id+date+order_index], city, updated_at',
      restaurants: 'id, trip_id, city, updated_at'
    });
  }
}
```

**Index Strategy**:
- **trips**: PK, soft delete filtering, sync timestamps, date range queries
- **flights**: PK, trip lookup, chronological ordering
- **flightLegs**: PK, flight lookup, compound for leg ordering
- **hotels**: PK, trip lookup, chronological ordering, city grouping
- **activities**: PK, trip lookup, date grouping, compound for same-day ordering, city grouping
- **restaurants**: PK, trip lookup, city grouping

---

## Query Patterns

### Trip Queries

**Get all active trips**:
```typescript
db.trips.where('deleted').equals(false).toArray()
```

**Get trip with all related data**:
```typescript
const trip = await db.trips.get(tripId);
const flights = await db.flights.where('trip_id').equals(tripId).toArray();
const hotels = await db.hotels.where('trip_id').equals(tripId).toArray();
const activities = await db.activities.where('trip_id').equals(tripId).toArray();
const restaurants = await db.restaurants.where('trip_id').equals(tripId).toArray();

return {
  ...trip,
  flights,
  hotels,
  activities,
  restaurants
};
```

### Timeline Queries

**Get chronological timeline** (flights + hotels + activities):
```typescript
const flights = await db.flights
  .where('trip_id').equals(tripId)
  .sortBy('departure_time');

const hotels = await db.hotels
  .where('trip_id').equals(tripId)
  .sortBy('check_in_time');

const activities = await db.activities
  .where('trip_id').equals(tripId)
  .sortBy('start_time');

// Merge and sort by timestamp
const timeline = [...flights, ...hotels, ...activities]
  .sort((a, b) => getItemTimestamp(a) - getItemTimestamp(b));
```

**Get activities for specific date**:
```typescript
db.activities
  .where('[trip_id+date+order_index]')
  .between([tripId, date, 0], [tripId, date, Infinity])
  .toArray()
```

### City-Grouped Queries

**Get hotels by city**:
```typescript
db.hotels
  .where('[trip_id+city]')
  .equals([tripId, cityName])
  .toArray()
```

**Get restaurants by city**:
```typescript
db.restaurants
  .where('[trip_id+city]')
  .equals([tripId, cityName])
  .toArray()
```

---

## Seed Data Structure

**Source**: `/frontend/data/trips/*.json` (one file per trip)

**Trip Index**: `/frontend/data/trip-index.json`

**Format (per-trip file)**:
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD",
  "home_location": "string",
  "updated_at": "ISO 8601 timestamp",
  "flights": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "airline": "string",
      "flight_number": "string",
      "departure_time": "ISO 8601 with timezone",
      "arrival_time": "ISO 8601 with timezone",
      "departure_location": "string",
      "arrival_location": "string",
      "confirmation_number": "string",
      "notes": "string",
      "updated_at": "ISO 8601 timestamp",
      "legs": [
        {
          "id": "uuid",
          "flight_id": "uuid",
          "leg_number": 1,
          "airline": "string",
          "flight_number": "string",
          "departure_time": "ISO 8601 with timezone",
          "arrival_time": "ISO 8601 with timezone",
          "departure_location": "string",
          "arrival_location": "string",
          "duration_minutes": 120
        }
      ]
    }
  ],
  "hotels": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "name": "string",
      "address": "string",
      "city": "string",
      "check_in_time": "ISO 8601 with timezone",
      "check_out_time": "ISO 8601 with timezone",
      "confirmation_number": "string",
      "phone": "string",
      "notes": "string",
      "updated_at": "ISO 8601 timestamp"
    }
  ],
  "activities": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "name": "string",
      "date": "YYYY-MM-DD",
      "start_time": "ISO 8601 with timezone",
      "duration_minutes": 120,
      "order_index": 0,
      "city": "string",
      "plus_code": "8Q7XQXXR+33",
      "address": "string",
      "image_url": "https://...",
      "notes": "string",
      "updated_at": "ISO 8601 timestamp"
    }
  ],
  "restaurants": [
    {
      "id": "uuid",
      "trip_id": "uuid",
      "name": "string",
      "city": "string",
      "cuisine_type": "string",
      "address": "string",
      "plus_code": "string",
      "phone": "string",
      "website": "https://...",
      "notes": "string",
      "updated_at": "ISO 8601 timestamp"
    }
  ]
}
```

**Loading Strategy**:
1. Read `trip-index.json` to get list of trip IDs
2. For each trip ID, read `/frontend/data/trips/{id}.json`
3. Validate JSON structure
4. Transform nested structure to flat tables
5. Bulk insert trips, then flights (with legs), hotels, activities, restaurants
6. All operations within transaction for atomicity

---

## Data Integrity Rules

### Application-Level Constraints

1. **UUID Uniqueness**: All IDs must be unique UUIDs
2. **Timestamp Consistency**: `updated_at` must be set/updated on every modification
3. **Referential Integrity**: 
   - Flight.trip_id → Trip.id
   - FlightLeg.flight_id → Flight.id
   - Hotel.trip_id → Trip.id
   - DailyActivity.trip_id → Trip.id
   - RestaurantRecommendation.trip_id → Trip.id
4. **Soft Delete Preservation**: Deleted trips maintain relationships with child entities
5. **Order Consistency**: Activities within same trip+date should have unique order_index

### Chronological Ordering

Timeline items sorted by:
1. **Primary**: Timestamp field (departure_time, check_in_time, start_time)
2. **Fallback**: order_index (for activities without time)
3. **Fallback**: Creation order (updated_at)

---

## Performance Considerations

### Index Usage
- All queries use indexed fields for efficient lookups
- Compound indexes for complex queries (trip+date+order, trip+city)
- Date range queries supported via indexed date fields

### Bulk Operations
- Seed loading uses `bulkAdd()` for each table
- Transaction wrapping for consistency
- Parallel loading of independent entity types

### Expected Performance

| Operation | Target | Notes |
|-----------|--------|-------|
| Get single trip | <10ms | Indexed lookup by PK |
| Get trip with all data | <100ms | Multiple indexed queries |
| Get timeline for trip | <50ms | Indexed + sorting |
| Get activities by date | <20ms | Compound index query |
| List all trips | <50ms | Full table scan with filter |
| Bulk seed load (100 trips) | <2s | BulkAdd with transaction |

---

## Migration from V1 to V2

**Deprecations**:
- `Place` entity removed (replaced by `DailyActivity`)

**Additions**:
- `Flight` table
- `FlightLeg` table
- `Hotel` table
- `DailyActivity` table (replaces Place)
- `RestaurantRecommendation` table
- Enhanced indexes for performance

**Migration Strategy**:
```typescript
this.version(2).stores({
  // New schema
}).upgrade(async tx => {
  // If v1 had places, migrate to activities
  const places = await tx.table('places').toArray();
  const activities = places.map(place => ({
    ...place,
    date: extractDateFromPlace(place),
    order_index: place.order_index
  }));
  await tx.table('activities').bulkAdd(activities);
  
  // Delete old places table in version 3
});

this.version(3).stores({
  places: null  // Remove old table
});
```

---

## Future Considerations

### Supabase Sync (Out of Scope)
- Schema designed with `updated_at` for conflict resolution
- UUID IDs enable cross-device consistency
- Will add `sync_status` field in Version 4
- Current schema compatible with future sync

### Search & Filtering (Out of Scope)
- Indexes on `city` fields support location filtering
- Name fields indexed for search capability
- May add full-text search in future

### Offline Images (Out of Scope)
- Currently stores image URLs
- Future: Cache images locally for offline access
- Consider IndexedDB blob storage or separate cache

### Hard Delete (Out of Scope)
- Currently only soft delete on trips
- May add permanent deletion feature
- Would require CASCADE handling for child entities
