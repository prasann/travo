# Data Model: Local Database Layer

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12  
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data model for the IndexedDB-backed local database layer. The model consists of two main entities (Trip and Place) with a one-to-many relationship, supporting soft deletion and future synchronization capabilities.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│ Trip                                    │
├─────────────────────────────────────────┤
│ id: string (UUID, PK)                   │
│ name: string                            │
│ description: string?                    │
│ start_date: string (ISO 8601)           │
│ end_date: string (ISO 8601)             │
│ deleted: boolean (default: false)       │
│ updated_at: string (ISO 8601 timestamp) │
└─────────────────────────────────────────┘
              │
              │ 1:N
              ▼
┌─────────────────────────────────────────┐
│ Place                                   │
├─────────────────────────────────────────┤
│ id: string (UUID, PK)                   │
│ trip_id: string (FK -> Trip.id)         │
│ name: string                            │
│ plus_code: string?                      │
│ notes: string?                          │
│ order_index: number                     │
│ updated_at: string (ISO 8601 timestamp) │
└─────────────────────────────────────────┘
```

## Entity Specifications

### Trip

Represents a travel itinerary with metadata and associated places.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier for the trip |
| `name` | string | Yes | - | Trip name/title |
| `description` | string | No | null | Detailed trip description |
| `start_date` | string | Yes | - | Trip start date (ISO 8601 format: YYYY-MM-DD) |
| `end_date` | string | Yes | - | Trip end date (ISO 8601 format: YYYY-MM-DD) |
| `deleted` | boolean | No | false | Soft delete flag (true = deleted) |
| `updated_at` | string | Yes | Current timestamp | Last modification timestamp (ISO 8601) |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `deleted` (for filtering active vs deleted trips)

**Validation Rules**:
- `name`: Non-empty string
- `start_date`: Valid ISO 8601 date format
- `end_date`: Valid ISO 8601 date format
- `id`: Must be valid UUID v4
- `updated_at`: Must be valid ISO 8601 timestamp

**Business Rules** (Deferred):
- End date validation (must not be before start date) - to be added in future iteration
- Date range constraints - to be added in future iteration

**Lifecycle**:
```
[Created] -> [Active] -> [Soft Deleted] -> [Restored] -> [Active]
  │            │            │                              │
  └────────────┴────────────┴──────────────────────────────┘
             updated_at timestamp updated on each transition
```

**Example**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tokyo Spring Adventure",
  "description": "7-day journey to experience cherry blossom season",
  "start_date": "2025-04-01",
  "end_date": "2025-04-07",
  "deleted": false,
  "updated_at": "2025-10-12T10:00:00.000Z"
}
```

---

### Place

Represents a specific location or point of interest within a trip.

**Fields**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | Generated UUID | Unique identifier for the place |
| `trip_id` | string | Yes | - | Foreign key reference to parent Trip |
| `name` | string | Yes | - | Place name/title |
| `plus_code` | string | No | null | Google Plus Code for location (8 characters) |
| `notes` | string | No | null | User notes about the place |
| `order_index` | number | Yes | - | Display order within the trip (0-based) |
| `updated_at` | string | Yes | Current timestamp | Last modification timestamp (ISO 8601) |

**Indexes**:
- Primary: `id` (unique)
- Secondary: `trip_id` (for efficient lookup of places by trip)

**Validation Rules**:
- `name`: Non-empty string
- `trip_id`: Must reference an existing Trip.id
- `order_index`: Non-negative integer
- `id`: Must be valid UUID v4
- `updated_at`: Must be valid ISO 8601 timestamp

**Business Rules**:
- Places persist when parent trip is soft deleted
- Places can be deleted independently (not implemented yet - future scope)
- Order index determines display sequence within trip

**Referential Integrity**:
- `trip_id` must point to valid Trip (enforced by application layer)
- Orphaned places (trip_id points to non-existent trip) should not occur
- Soft-deleted trips still maintain relationship with places

**Example**:
```json
{
  "id": "456e7890-e12b-34c5-d678-901234567890",
  "trip_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tokyo Skytree",
  "plus_code": "8Q7XQXXR+33",
  "notes": "Day 1 afternoon - Amazing views",
  "order_index": 0,
  "updated_at": "2025-10-12T10:00:00.000Z"
}
```

---

## Database Schema (Dexie)

**Database Name**: `TravoLocalDB`

**Version**: 1

**Schema Definition**:
```typescript
class TravoDatabase extends Dexie {
  trips!: Table<Trip, string>;
  places!: Table<Place, string>;

  constructor() {
    super('TravoLocalDB');
    
    this.version(1).stores({
      trips: 'id, deleted, updated_at',
      places: 'id, trip_id, order_index, updated_at'
    });
  }
}
```

**Index Strategy**:
- **trips**: Indexed on `id` (PK), `deleted` (for filtering), `updated_at` (for sync)
- **places**: Indexed on `id` (PK), `trip_id` (for joins), `order_index` (for sorting)

---

## Query Patterns

### Common Queries

**Get all active trips**:
```typescript
db.trips.where('deleted').equals(false).toArray()
```

**Get trip with places**:
```typescript
const trip = await db.trips.get(tripId);
const places = await db.places.where('trip_id').equals(tripId).sortBy('order_index');
return { ...trip, places };
```

**Get soft-deleted trips** (for recovery):
```typescript
db.trips.where('deleted').equals(true).toArray()
```

**Create trip with places** (transaction):
```typescript
await db.transaction('rw', [db.trips, db.places], async () => {
  await db.trips.add(tripData);
  await db.places.bulkAdd(placesData);
});
```

---

## Data Migration Strategy

### Version 1 (Current)
Initial schema with Trip and Place entities, soft delete support.

### Future Versions (Planned)

**Version 2** (Supabase Sync - Future):
```typescript
this.version(2).stores({
  trips: 'id, deleted, updated_at, sync_status',
  places: 'id, trip_id, order_index, updated_at, sync_status'
}).upgrade(tx => {
  // Add sync_status field to existing records
  return tx.table('trips').toCollection().modify(trip => {
    trip.sync_status = 'synced';
  });
});
```

**Version 3** (Search/Filter - Future):
Additional indexes for search functionality when implemented.

---

## Data Integrity Rules

### Application-Level Constraints

1. **UUID Uniqueness**: All IDs must be unique UUIDs generated by application
2. **Timestamp Consistency**: `updated_at` must be set/updated on every modification
3. **Referential Integrity**: `place.trip_id` must reference existing trip
4. **Soft Delete Preservation**: Deleted trips maintain relationship with places
5. **Order Index Uniqueness**: Places within a trip should have unique order_index values

### Error Handling

**Validation Failures**:
- Return `ValidationError` with field-specific messages
- Do not modify database on validation failure

**Referential Integrity Failures**:
- Reject place creation if trip_id doesn't exist
- Return clear error message indicating missing trip

**Constraint Violations**:
- Duplicate UUID: Should never occur (UUID collision virtually impossible)
- Invalid dates: Caught by validation before insert

---

## Performance Considerations

### Index Usage
- All queries use indexed fields for efficient lookups
- Compound indexes not needed for current query patterns

### Bulk Operations
- Seed loading uses `bulkAdd()` for performance
- Transaction wrapping for consistency

### Expected Performance
| Operation | Target | Notes |
|-----------|--------|-------|
| Get single trip | <10ms | Indexed lookup by PK |
| Get trip with places | <20ms | PK + indexed trip_id lookup |
| List all trips | <50ms | Full table scan with deleted filter |
| Bulk seed load (1000 trips) | <500ms | BulkAdd with transaction |
| Create single trip | <20ms | Single insert operation |

---

## Seed Data Structure

**Source**: `frontend/data/trips.json`

**Format**:
```json
{
  "trips": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD",
      "updated_at": "ISO 8601 timestamp",
      "places": [
        {
          "id": "uuid",
          "trip_id": "uuid",
          "name": "string",
          "plus_code": "string",
          "notes": "string",
          "order_index": number,
          "updated_at": "ISO 8601 timestamp"
        }
      ]
    }
  ]
}
```

**Loading Strategy**:
1. Validate JSON structure
2. Transform nested structure to flat tables
3. Bulk insert trips first
4. Bulk insert all places
5. All operations within transaction for atomicity

---

## Future Considerations

### Supabase Sync (Out of Scope)
- Schema designed with `updated_at` for conflict resolution
- UUID IDs enable cross-device consistency
- Will add `sync_status` field in Version 2
- Current schema compatible with future sync implementation

### Search & Filtering (Out of Scope)
- May add indexes on `name` fields for text search
- Current schema supports future filter additions
- No full-text search in IndexedDB - may need separate solution

### Data Export/Import (Out of Scope)
- Current schema easily serializable to JSON
- Maintains seed data structure for potential export feature

### Hard Delete (Out of Scope)
- Currently only soft delete implemented
- May add permanent deletion feature in future
- Would require CASCADE or explicit place handling
