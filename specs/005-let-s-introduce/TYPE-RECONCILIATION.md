# Type System Reconciliation Guide

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12  
**Purpose**: Guide for merging database layer types with enhanced types from main

## Overview

This document provides guidance on reconciling the database layer type system (`frontend/lib/db/models.ts`) with the enhanced types from the merged main branch (`frontend/types/index.ts`).

## Current State

### Database Layer Types (`frontend/lib/db/models.ts`)
- **Purpose**: Database-specific types with `deleted` flag and DB operations
- **Entities**: Trip, Place
- **Key Features**:
  - `deleted: boolean` for soft delete
  - Input/Update types (TripInput, TripUpdate, PlaceInput, PlaceUpdate)
  - Result<T> pattern for error handling
  - DbError types (ValidationError, QuotaExceededError, etc.)
  - Type guards for error handling

### Enhanced Types (`frontend/types/index.ts`)
- **Purpose**: Complete domain model for UI and business logic
- **Entities**: Trip, Flight, FlightLeg, Hotel, DailyActivity, RestaurantRecommendation, TripIndex
- **Key Features**:
  - No `deleted` flag (doesn't need it - UI doesn't show deleted items)
  - TimelineItem union types
  - Type guards for timeline items (isFlight, isHotel, isActivity)
  - Utility functions (getItemTimestamp, getItemType)

## Reconciliation Strategy

### Option A: Single Source of Truth (RECOMMENDED)

**Approach**: Use `frontend/types/index.ts` as the primary type definition, extend in DB layer only for database-specific concerns.

**Implementation**:

```typescript
// frontend/lib/db/models.ts

// Re-export domain types from primary source
export type {
  Trip as BasTrip,
  Flight,
  FlightLeg,
  Hotel,
  DailyActivity,
  RestaurantRecommendation,
  TripIndex
} from '@/types';

// Extend Trip with database-specific fields
export interface Trip extends BaseTrip {
  /** Soft delete flag (database layer only) */
  deleted: boolean;
}

// Database-specific input types
export type TripInput = Omit<Trip, 'id' | 'updated_at' | 'deleted' | 'flights' | 'hotels' | 'activities' | 'restaurants'>;
export type TripUpdate = Partial<TripInput> & { id: string };

export type FlightInput = Omit<Flight, 'id' | 'updated_at' | 'legs'>;
export type FlightUpdate = Partial<FlightInput> & { id: string };

export type HotelInput = Omit<Hotel, 'id' | 'updated_at'>;
export type HotelUpdate = Partial<HotelInput> & { id: string };

export type ActivityInput = Omit<DailyActivity, 'id' | 'updated_at'>;
export type ActivityUpdate = Partial<ActivityInput> & { id: string };

export type RestaurantInput = Omit<RestaurantRecommendation, 'id' | 'updated_at'>;
export type RestaurantUpdate = Partial<RestaurantInput> & { id: string };

// Database-specific query result types
export interface TripWithRelations extends Trip {
  flights: Flight[];
  hotels: Hotel[];
  activities: DailyActivity[];
  restaurants: RestaurantRecommendation[];
}

// Keep existing error types (unique to DB layer)
export interface DbError { /* ... existing ... */ }
export interface ValidationError extends DbError { /* ... existing ... */ }
export interface QuotaExceededError extends DbError { /* ... existing ... */ }
export interface DatabaseError extends DbError { /* ... existing ... */ }
export interface NotFoundError extends DbError { /* ... existing ... */ }

// Keep Result<T> pattern (unique to DB layer)
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: DbError };

// Keep error type guards (unique to DB layer)
export function isValidationError(error: DbError): error is ValidationError { /* ... */ }
export function isQuotaExceededError(error: DbError): error is QuotaExceededError { /* ... */ }
export function isDatabaseError(error: DbError): error is DatabaseError { /* ... */ }
export function isNotFoundError(error: DbError): error is NotFoundError { /* ... */ }
```

**Benefits**:
- Single source of truth for domain types
- No duplication of Trip, Flight, Hotel, etc. definitions
- Clear separation: domain types in `/types`, DB-specific in `/lib/db`
- Easy to maintain consistency

**Drawbacks**:
- Database layer depends on types package
- Need to extend Trip for `deleted` flag

### Option B: Separate Type Systems

**Approach**: Keep types completely separate, use mapping functions to convert between them.

**Implementation**:

```typescript
// frontend/lib/db/models.ts stays as-is with its own types
// frontend/types/index.ts stays as-is

// Add converter utilities
// frontend/lib/db/converters.ts
import type { Trip as DomainTrip } from '@/types';
import type { Trip as DbTrip } from './models';

export function toDbTrip(domain: DomainTrip): DbTrip {
  return {
    ...domain,
    deleted: false
  };
}

export function toDomainTrip(db: DbTrip): DomainTrip {
  const { deleted, ...rest } = db;
  return rest;
}
```

**Benefits**:
- Complete independence between layers
- Clear boundaries

**Drawbacks**:
- Type duplication
- Maintenance burden (must update both)
- Conversion overhead

---

## Recommended Implementation Plan

### Phase 1: Restructure Types (Immediate)

1. **Backup current `frontend/lib/db/models.ts`**
   ```bash
   cp frontend/lib/db/models.ts frontend/lib/db/models-old.ts
   ```

2. **Rewrite `frontend/lib/db/models.ts` following Option A**
   - Import and re-export types from `@/types`
   - Add Trip extension with `deleted` field
   - Add Input/Update types for all entities
   - Keep DbError types and Result<T> pattern
   - Keep error type guards

3. **Update imports throughout database layer**
   - `schema.ts` - import from updated models
   - `operations/*.ts` - import from updated models
   - `seed.ts` - import from updated models
   - `validation.ts` - import from updated models

### Phase 2: Extend Schema (Next)

Update `frontend/lib/db/schema.ts` to include all tables:

```typescript
import Dexie, { Table } from 'dexie';
import type {
  Trip,
  Flight,
  FlightLeg,
  Hotel,
  DailyActivity,
  RestaurantRecommendation
} from './models';

export class TravoDatabase extends Dexie {
  trips!: Table<Trip, string>;
  flights!: Table<Flight, string>;
  flightLegs!: Table<FlightLeg, string>;
  hotels!: Table<Hotel, string>;
  activities!: Table<DailyActivity, string>;
  restaurants!: Table<RestaurantRecommendation, string>;

  constructor() {
    super('TravoLocalDB');
    
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

### Phase 3: Update Seed Loader (After Schema)

Modify `frontend/lib/db/seed.ts` to:
1. Read from `trip-index.json` to get trip IDs
2. Load each trip from `/data/trips/{id}.json`
3. Parse nested structure (flights with legs, hotels, activities, restaurants)
4. Bulk insert into all tables within transaction

### Phase 4: Extend CRUD Operations (Parallel)

Create operation files for each entity:
- `operations/flights.ts` - Flight + FlightLeg CRUD
- `operations/hotels.ts` - Hotel CRUD
- `operations/activities.ts` - DailyActivity CRUD
- `operations/restaurants.ts` - RestaurantRecommendation CRUD
- Update `operations/trips.ts` - Add getTripWithRelations

---

## Migration Checklist

### Type System
- [ ] Backup current `frontend/lib/db/models.ts`
- [ ] Rewrite models.ts to import from `@/types`
- [ ] Add Trip extension with `deleted` field
- [ ] Create Input/Update types for all entities
- [ ] Keep DbError types and Result<T> pattern
- [ ] Update all imports in database layer files

### Schema
- [ ] Update schema.ts with all 6 tables
- [ ] Add appropriate indexes for each table
- [ ] Implement version 2 migration
- [ ] Test schema creation

### Seed Loader
- [ ] Update to read trip-index.json
- [ ] Implement per-trip JSON loading
- [ ] Add flight leg parsing
- [ ] Update bulk insert for all tables
- [ ] Add transaction wrapping
- [ ] Test with existing seed data

### CRUD Operations
- [ ] Create operations/flights.ts
- [ ] Create operations/hotels.ts
- [ ] Create operations/activities.ts
- [ ] Create operations/restaurants.ts
- [ ] Update operations/trips.ts
- [ ] Update public API exports in index.ts

### Validation
- [ ] Extend validation.ts for new entities
- [ ] Add Flight validation
- [ ] Add Hotel validation
- [ ] Add DailyActivity validation
- [ ] Add RestaurantRecommendation validation

### Testing
- [ ] Update existing tests for new types
- [ ] Add tests for new entity CRUD operations
- [ ] Test seed loading with multi-file structure
- [ ] Test timeline queries
- [ ] Test city grouping queries

---

## Key Decisions

### Decision 1: deleted Flag
**Question**: Should all entities have soft delete, or just Trip?

**Recommendation**: Only Trip needs `deleted` flag for now. Child entities (flights, hotels, activities, restaurants) are deleted with their parent trip through referential integrity.

**Rationale**:
- Simpler model
- User story only mentions trip soft delete
- Can add to child entities later if needed

### Decision 2: Nested vs Flat Storage
**Question**: Should flights store legs nested or separately?

**Recommendation**: Store FlightLeg as separate table.

**Rationale**:
- Better query performance
- Easier to extend with additional leg properties
- Follows normalized database design
- IndexedDB handles relations well with compound indexes

### Decision 3: TripWithRelations vs Separate Queries
**Question**: Should we always load full trip with relations or query separately?

**Recommendation**: Provide both options:
- `getTripById()` - Trip only (fast)
- `getTripWithRelations()` - Trip + all relations (convenient)

**Rationale**:
- Flexibility for different use cases
- List view only needs Trip metadata
- Detail view needs full relations
- Performance optimization opportunity

---

## Common Pitfalls to Avoid

### Pitfall 1: Type Duplication
❌ **Don't**: Copy type definitions from `@/types` into `@/lib/db/models.ts`
✅ **Do**: Import and re-export, extend only when necessary

### Pitfall 2: Mixing Concerns
❌ **Don't**: Add UI-specific logic to database types
✅ **Do**: Keep timeline utilities (isFlight, getItemTimestamp) in `@/types`

### Pitfall 3: Incomplete Migration
❌ **Don't**: Update schema without updating seed loader
✅ **Do**: Update all related components together (schema + seed + operations)

### Pitfall 4: Missing Indexes
❌ **Don't**: Forget compound indexes for complex queries
✅ **Do**: Add `[trip_id+date+order_index]` for activity ordering

### Pitfall 5: Breaking UI
❌ **Don't**: Change types that UI depends on
✅ **Do**: Keep `@/types` stable, extend in DB layer only

---

## Testing Strategy

### Unit Tests
- Test type conversions (Input → Entity)
- Test CRUD operations for each entity
- Test error handling (Result<T> pattern)
- Test validation rules

### Integration Tests
- Test seed loading from multi-file structure
- Test transaction atomicity
- Test referential integrity
- Test soft delete behavior

### Performance Tests
- Measure query performance with realistic data
- Test bulk operations (seed 100+ trips)
- Verify index usage
- Check memory consumption

---

## Next Steps

1. ✅ Complete this reconciliation guide
2. ⏭️ Update `frontend/lib/db/models.ts` following Option A
3. ⏭️ Update `frontend/lib/db/schema.ts` with all tables
4. ⏭️ Update `frontend/lib/db/seed.ts` for multi-file loading
5. ⏭️ Create CRUD operations for new entities
6. ⏭️ Update `tasks.md` with specific implementation tasks
7. ⏭️ Begin implementation phase

---

## Questions & Decisions Log

| Date | Question | Decision | Rationale |
|------|----------|----------|-----------|
| 2025-10-12 | Merge or separate type systems? | Merge using Option A | Single source of truth, easier maintenance |
| 2025-10-12 | Soft delete for all entities? | Only Trip | Simpler, matches requirements |
| 2025-10-12 | Nested or flat legs? | Separate FlightLeg table | Better performance, normalized |
| 2025-10-12 | Always load relations? | Provide both options | Flexibility + performance |

---

## References

- **Enhanced Types**: `frontend/types/index.ts`
- **Database Types**: `frontend/lib/db/models.ts`
- **Data Model**: `specs/005-let-s-introduce/data-model.md`
- **Seed Data**: `frontend/data/trips/*.json`
