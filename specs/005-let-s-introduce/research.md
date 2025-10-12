# Research: Local Database Layer with IndexedDB

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12  
**Phase**: 0 - Research & Technical Decisions

## Overview

This document captures technical research and decisions for implementing a local IndexedDB database layer using Dexie.js. All unknowns from the Technical Context have been researched and resolved.

## Research Tasks Completed

### 1. Dexie.js Integration Best Practices

**Decision**: Use Dexie.js 4.x as IndexedDB wrapper

**Rationale**:
- Simplifies IndexedDB API with Promise-based interface
- Automatic schema versioning and migrations
- Strong TypeScript support with generic types
- Active maintenance and broad browser support
- Well-documented patterns for React integration
- Handles common IndexedDB pitfalls (transaction management, error handling)

**Alternatives Considered**:
- **Native IndexedDB**: Rejected - complex API, requires extensive boilerplate, difficult to test
- **idb (Jake Archibald)**: Rejected - minimal wrapper, less features than Dexie, no schema management
- **LocalForage**: Rejected - simple key-value API insufficient for relational data needs

**Implementation Approach**:
- Define schema using Dexie class extension
- Use table definitions with indexes for queries
- Implement async/await patterns throughout
- Leverage Dexie's built-in TypeScript generics for type safety

### 2. Schema Design for Trip and Place Entities

**Decision**: Simple schema with UUID primary keys and soft delete support

**Rationale**:
- UUIDs enable future sync with Supabase without ID conflicts
- Soft delete via `deleted` boolean flag maintains data integrity
- `updated_at` timestamp prepares for future sync conflict resolution
- Minimal required fields align with "simple schema" clarification
- Indexes on frequently queried fields (trip_id for places, deleted for trips)

**Schema Structure**:

```typescript
// Trip Schema
{
  id: string (UUID, primary key)
  name: string (required)
  description?: string (optional)
  start_date: string (ISO 8601 format, required)
  end_date: string (ISO 8601 format, required)
  deleted: boolean (default false)
  updated_at: string (ISO 8601 timestamp)
}

// Place Schema
{
  id: string (UUID, primary key)
  trip_id: string (foreign key to Trip, indexed)
  name: string (required)
  plus_code?: string (optional, Google Plus Code)
  notes?: string (optional)
  order_index: number (for ordering places within trip)
  updated_at: string (ISO 8601 timestamp)
}
```

**Alternatives Considered**:
- **Embedded places in trip document**: Rejected - harder to query individual places, limits scalability
- **Auto-increment IDs**: Rejected - doesn't support future multi-device sync
- **Hard delete**: Rejected - no recovery mechanism, user data loss risk

### 3. Seed Data Loading Strategy

**Decision**: Check-and-load on application initialization

**Rationale**:
- Load seed data only if database is empty (version 0 or no trips exist)
- Fail fast if seed JSON is invalid (validation before loading)
- Idempotent initialization - safe to call multiple times
- UUID preservation from seed data maintains consistency

**Implementation Flow**:
1. Check if database exists and has data
2. If empty, validate seed JSON structure
3. If validation fails, throw error with clear message
4. If validation passes, bulk insert trips and places
5. Mark database as initialized (via Dexie version)

**Alternatives Considered**:
- **Always reload seed**: Rejected - overwrites user data
- **Merge seed with existing**: Rejected - complex conflict resolution not needed yet
- **Silent failure on corrupt seed**: Rejected - clarification requires explicit error

### 4. Validation Strategy

**Decision**: Basic required field and format validation only

**Rationale**:
- Clarification explicitly chose simple validation over strict business rules
- Check field presence (name, dates) at create/update time
- Validate date formats (ISO 8601 strings)
- No complex business rules (date range validation, etc.) initially
- Return clear error messages for validation failures

**Validation Rules**:
- Trip: name (non-empty), start_date (valid ISO date), end_date (valid ISO date)
- Place: name (non-empty), trip_id (exists in trips table)
- UUID generation for new records
- Timestamps auto-generated on create/update

**Alternatives Considered**:
- **Strict business validation**: Rejected - deferred per clarification
- **Schema-based validation (Zod)**: Rejected - over-engineering for simple needs
- **No validation**: Rejected - basic data integrity needed

### 5. Error Handling Patterns

**Decision**: Graceful error handling with user-friendly messages, no internal logging

**Rationale**:
- Clarification specified errors shown to user only, no logging
- Try-catch blocks around all database operations
- Return typed error objects (not thrown exceptions) from API
- Specific error types: ValidationError, QuotaExceededError, DatabaseError
- No stack traces or internal details exposed

**Error Categories**:
1. **Validation Errors**: Invalid data provided (return field-specific messages)
2. **Quota Exceeded**: Browser storage limit reached (block writes, allow reads)
3. **Database Errors**: IndexedDB failures (generic message, no internal details)
4. **Seed Load Errors**: Corrupted JSON or missing file (clear message with instructions)

**Alternatives Considered**:
- **Console logging**: Rejected - clarification specified no internal logs
- **Error tracking service**: Rejected - out of scope, privacy concerns
- **Silent failures**: Rejected - user needs feedback

### 6. Testing Approach

**Decision**: Unit tests with Dexie test utilities, independent of UI

**Rationale**:
- Data layer must be independently testable per NFR-003
- Use fake-indexeddb for Jest environment
- Test each CRUD operation in isolation
- Test error conditions (invalid data, quota exceeded simulation)
- Mock seed data for predictable tests

**Test Coverage Areas**:
- Schema initialization and versioning
- Seed data loading (success and failure cases)
- CRUD operations for trips and places
- Soft delete and restore functionality
- Validation rules
- Error handling
- Query performance with sample datasets

**Alternatives Considered**:
- **E2E browser tests only**: Rejected - slow, not independent of UI
- **Integration tests with UI**: Rejected - phase 1 has no UI integration
- **Manual testing only**: Rejected - regression risk, not repeatable

### 7. TypeScript Interface Design

**Decision**: Separate interface definitions from Dexie schema

**Rationale**:
- Define TypeScript interfaces in `models.ts` for compile-time safety
- Dexie schema in `schema.ts` references these interfaces
- Enables reuse across application without Dexie dependency
- Clear separation of concerns (types vs storage)
- Future UI can import types without importing database code

**Interface Structure**:
```typescript
// Core domain types
interface Trip { ... }
interface Place { ... }

// Input types (for create/update, omit generated fields)
type TripInput = Omit<Trip, 'id' | 'updated_at'>
type PlaceInput = Omit<Place, 'id' | 'updated_at'>

// Query result types
interface TripWithPlaces extends Trip {
  places: Place[]
}

// Error types
type DbError = ValidationError | QuotaExceededError | DatabaseError
```

**Alternatives Considered**:
- **Inline types in schema**: Rejected - tight coupling, less reusable
- **Generate types from schema**: Rejected - Dexie doesn't support this well
- **Shared types directory**: Accepted - types can live in `types/` or `lib/db/models.ts`

## Technology Stack Summary

**Core Dependencies**:
- Dexie.js 4.x - IndexedDB wrapper
- uuid - UUID generation
- date-fns (optional) - Date validation and formatting helper

**Development Dependencies**:
- fake-indexeddb - IndexedDB mock for Jest
- @types/uuid - TypeScript definitions

**Avoided Dependencies**:
- No Zod/Yup - simple validation doesn't warrant schema validator
- No logging library - no logging requirement
- No state management library - data layer is stateless

## Performance Considerations

**Indexes**: 
- Primary keys on `id` fields (automatic)
- Index on `places.trip_id` for efficient joins
- Index on `trips.deleted` for filtered queries

**Query Optimization**:
- Use `where()` clauses with indexed fields
- Bulk operations for seed loading
- Limit query result sizes in production

**Expected Performance**:
- Single trip read: <10ms
- Trip list (100 items): <50ms
- Trip with places: <20ms
- Bulk seed load (1000 trips): <500ms

## Migration Strategy

**Version 1 Schema**: Initial schema as defined above

**Future Migrations** (out of scope but planned for):
- Version 2: Add fields for Supabase sync (sync_status, last_synced_at)
- Version 3: Add indexes for search/filter features
- Dexie handles migrations automatically via version upgrades

## Integration Points

**With Existing Code**:
- Read trips.json from `frontend/data/trips.json`
- Export public API from `frontend/lib/db/index.ts`
- Types can be imported by existing components (future)

**Future Integration** (out of scope):
- UI components will import from `lib/db`
- Supabase sync will use same TypeScript interfaces
- No UI changes needed when swapping data source

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Browser quota exceeded | Users cannot save data | Block writes, show clear error, maintain read access |
| IndexedDB not supported | App doesn't work | Check support on init, show error with browser upgrade instructions |
| Seed data corruption | App won't initialize | Validate JSON before loading, show clear error message |
| Performance degradation at scale | Slow queries | Use indexes, lazy load places, test with large datasets |
| Schema migration bugs | Data corruption | Test migrations thoroughly, keep backup of data structure |

## Open Questions (Resolved in Clarifications)

All questions from Technical Context were resolved during clarification phase:
- ✅ Validation strategy - basic validation only
- ✅ Error handling - no logging, user-facing errors only
- ✅ Multi-tab behavior - ignored, single user app
- ✅ Quota exceeded - block writes, allow reads
- ✅ Corrupt seed - fail initialization completely

## Next Steps

Phase 1 will produce:
- `data-model.md` - Detailed entity specifications
- `contracts/interfaces.ts` - TypeScript interface definitions
- `quickstart.md` - Developer guide for using the database layer
