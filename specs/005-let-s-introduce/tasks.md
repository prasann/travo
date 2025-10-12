# Tasks: Local Database Layer with IndexedDB (Enhanced Model)

**Feature**: 005-let-s-introduce  
**Date**: 2025-10-12 (Revised)  
**Input**: Updated design documents incorporating enhanced data model from merged main branch

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/interfaces.ts

**Revision Note**: Tasks updated to support enhanced data model with 9 entity types (Trip, Flight, FlightLeg, Hotel, DailyActivity, RestaurantRecommendation, TripIndex) instead of original 2 entities (Trip, Place).

**Tests**: No tests explicitly requested in specification - test tasks excluded from this implementation.

**Organization**: Tasks are grouped by implementation phase, with critical foundational work before user story implementation.

## Format: `[ID] [P?] [Phase] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Phase]**: Which phase this task belongs to (Setup, Foundation, US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with frontend-only implementation:
- **Frontend Code**: `frontend/lib/db/` for database layer
- **Seed Data**: `frontend/data/trips/` (one JSON per trip) + `frontend/data/trip-index.json`
- **Types**: `frontend/types/index.ts` (enhanced types from main) + `frontend/lib/db/models.ts` (DB-specific)
- **No backend**: Client-side database only

---

## Phase 1: Setup & Dependencies

**Purpose**: Install dependencies and verify environment

- [x] T001 Install Dexie.js 4.x dependency in frontend (`cd frontend && npm install dexie@^4.0.0`)
- [x] T002 [P] Install uuid for UUID generation (`cd frontend && npm install uuid@^9.0.0`)
- [x] T003 [P] Install TypeScript type definitions (`cd frontend && npm install --save-dev @types/uuid fake-indexeddb`)
- [x] T004 Create database layer directory structure (`frontend/lib/db/` with subdirectories `operations/`)

**Checkpoint**: Dependencies installed - foundation ready for type system work

---

## Phase 2: Type System Reconciliation (CRITICAL - BLOCKING) 🔥

**Purpose**: Merge database types with enhanced domain types from main branch

**⚠️ CRITICAL**: This phase MUST complete before ANY other implementation work can begin

- [x] T005 Backup current `frontend/lib/db/models.ts` to `frontend/lib/db/models-original.ts`
- [x] T006 Rewrite `frontend/lib/db/models.ts` to import base types from `@/types` (Trip, Flight, FlightLeg, Hotel, DailyActivity, RestaurantRecommendation, TripIndex)
- [x] T007 Add Trip extension with `deleted: boolean` field in `frontend/lib/db/models.ts` (database-specific field)
- [x] T008 [P] Create Input types for all entities in `frontend/lib/db/models.ts` (TripInput, FlightInput, HotelInput, ActivityInput, RestaurantInput, FlightLegInput - omit id/updated_at)
- [x] T009 [P] Create Update types for all entities in `frontend/lib/db/models.ts` (TripUpdate, FlightUpdate, HotelUpdate, ActivityUpdate, RestaurantUpdate, FlightLegUpdate - partial with id required)
- [x] T010 [P] Create query result types in `frontend/lib/db/models.ts` (TripWithRelations extending Trip with flights[], hotels[], activities[], restaurants[])
- [x] T011 Keep existing DbError types and Result<T> pattern in `frontend/lib/db/models.ts` (no changes needed)
- [x] T012 Keep existing error type guards in `frontend/lib/db/models.ts` (isValidationError, isQuotaExceededError, isDatabaseError, isNotFoundError)
- [x] T013 Update imports in `frontend/lib/db/schema.ts` to use new models.ts structure
- [x] T014 [P] Update imports in `frontend/lib/db/errors.ts` to use new models.ts structure
- [x] T015 [P] Update imports in `frontend/lib/db/validation.ts` to use new models.ts structure
- [x] T016 [P] Update imports in `frontend/lib/db/init.ts` to use new models.ts structure
- [x] T017 [P] Update imports in `frontend/lib/db/seed.ts` to use new models.ts structure

**Checkpoint**: ✅ Type system unified - all imports working, ready for schema extension

---

## Phase 3: Schema Extension (CRITICAL - BLOCKING) 🔥

**Purpose**: Extend Dexie schema to support all 9 entity types

**⚠️ CRITICAL**: This phase MUST complete before seed loading or CRUD operations

- [x] T018 Update `frontend/lib/db/schema.ts` - Add flights table definition with indexes (id, trip_id, departure_time, updated_at)
- [x] T019 [P] Update `frontend/lib/db/schema.ts` - Add flightLegs table definition with indexes (id, flight_id, [flight_id+leg_number])
- [x] T020 [P] Update `frontend/lib/db/schema.ts` - Add hotels table definition with indexes (id, trip_id, check_in_time, city, updated_at)
- [x] T021 [P] Update `frontend/lib/db/schema.ts` - Add activities table definition with indexes (id, trip_id, date, [trip_id+date+order_index], city, updated_at)
- [x] T022 [P] Update `frontend/lib/db/schema.ts` - Add restaurants table definition with indexes (id, trip_id, city, updated_at)
- [x] T023 Update `frontend/lib/db/schema.ts` - Update trips table indexes to include start_date, end_date for range queries
- [x] T024 Update `frontend/lib/db/schema.ts` - Implement version 2 schema migration (upgrade function from v1)
- [x] T025 Add TypeScript table declarations in schema.ts (flights!: Table<Flight, string>, flightLegs!: Table<FlightLeg, string>, etc.)

**Checkpoint**: ✅ Schema v2 complete with all 6 tables - ready for seed loading

---

## Phase 4: Seed Loader Update (HIGH PRIORITY) 🟡

**Purpose**: Update seed loader to support multi-file structure with enhanced entities

- [x] T026 Update `frontend/lib/db/seed.ts` - Read trip-index.json to get list of trip IDs
- [x] T027 Update `frontend/lib/db/seed.ts` - Implement loadTripFromFile(tripId) function to read from `/frontend/data/trips/{id}.json`
- [x] T028 Update `frontend/lib/db/seed.ts` - Parse Trip base properties from JSON (id, name, description, start_date, end_date, home_location, updated_at)
- [x] T029 [P] Update `frontend/lib/db/seed.ts` - Parse Flight array from trip JSON, extract flight properties
- [x] T030 [P] Update `frontend/lib/db/seed.ts` - Parse FlightLeg array from each flight, flatten to separate array
- [x] T031 [P] Update `frontend/lib/db/seed.ts` - Parse Hotel array from trip JSON
- [x] T032 [P] Update `frontend/lib/db/seed.ts` - Parse DailyActivity array from trip JSON
- [x] T033 [P] Update `frontend/lib/db/seed.ts` - Parse RestaurantRecommendation array from trip JSON
- [x] T034 Update `frontend/lib/db/seed.ts` - Implement bulk insert transaction (trips first, then all child entities in parallel)
- [x] T035 Update `frontend/lib/db/seed.ts` - Add validation for nested structure (flights, hotels, activities, restaurants present)
- [x] T036 Update `frontend/lib/db/seed.ts` - Update error handling for multi-file loading failures
- [x] T037 Update `frontend/lib/db/init.ts` - Update isInitialized check to verify all tables have data

**Checkpoint**: ✅ Seed loading works with multi-file structure - database initializes with full enhanced data

---

## Phase 5: User Story 1 - Initial Data Loading from Seed (Priority: P1) 🎯

**Goal**: Load all trip data including flights, hotels, activities, restaurants from multi-file JSON structure on first launch

**Independent Test**: Clear browser storage, launch app, verify all 6 tables populated with data from trip JSON files

### Tasks for User Story 1

- [ ] T038 [US1] Verify seed loader handles empty database detection (from Phase 4 work)
- [ ] T039 [US1] Verify seed loader reads all trip files from trip-index.json (from Phase 4 work)
- [ ] T040 [US1] Verify seed loader populates all 6 tables (trips, flights, flightLegs, hotels, activities, restaurants)
- [ ] T041 [US1] Verify seed loader skips loading when database already has data
- [ ] T042 [US1] Verify seed loader fails gracefully on corrupted JSON with clear error message
- [ ] T043 [US1] Test seed loading with realistic dataset (3 trips from existing data files)
- [ ] T044 [US1] Verify database quota exceeded handling during seed load (quota error shown to user)

**Checkpoint US1**: ✅ Seed data loads successfully on first launch with all entity types

---

## Phase 6: User Story 2 - Reading Trip Data from Database (Priority: P1) 🎯

**Goal**: Read all trip information including related entities from database instead of JSON files

**Independent Test**: Add data to database, refresh app, verify all trip data displays from persistent storage

### Tasks for User Story 2

- [ ] T045 [US2] Implement getAllTrips() in `frontend/lib/db/operations/trips.ts` - query trips where deleted=false, return Result<Trip[]>
- [ ] T046 [US2] Implement getTripById(id) in `frontend/lib/db/operations/trips.ts` - query single trip, handle not found, return Result<Trip>
- [ ] T047 [US2] Create `frontend/lib/db/operations/flights.ts` - implement getFlightsByTripId(tripId) returning Result<Flight[]> sorted by departure_time
- [ ] T048 [P] [US2] Create `frontend/lib/db/operations/flights.ts` - implement getFlightLegsByFlightId(flightId) returning Result<FlightLeg[]> sorted by leg_number
- [ ] T049 [P] [US2] Create `frontend/lib/db/operations/hotels.ts` - implement getHotelsByTripId(tripId) returning Result<Hotel[]> sorted by check_in_time
- [ ] T050 [P] [US2] Create `frontend/lib/db/operations/activities.ts` - implement getActivitiesByTripId(tripId) returning Result<DailyActivity[]> sorted by date, order_index
- [ ] T051 [P] [US2] Create `frontend/lib/db/operations/restaurants.ts` - implement getRestaurantsByTripId(tripId) returning Result<RestaurantRecommendation[]> grouped by city
- [ ] T052 [US2] Implement getTripWithRelations(id) in `frontend/lib/db/operations/trips.ts` - combine trip + flights + hotels + activities + restaurants, return Result<TripWithRelations>
- [ ] T053 [US2] Update `frontend/lib/db/index.ts` - export getAllTrips, getTripById, getTripWithRelations
- [ ] T054 [P] [US2] Update `frontend/lib/db/index.ts` - export getFlightsByTripId, getFlightLegsByFlightId
- [ ] T055 [P] [US2] Update `frontend/lib/db/index.ts` - export getHotelsByTripId, getActivitiesByTripId, getRestaurantsByTripId
- [ ] T056 [US2] Verify read operations return empty arrays for trips with no flights/hotels/activities
- [ ] T057 [US2] Verify read operations handle missing trip gracefully (NotFoundError)
- [ ] T058 [US2] Test getTripWithRelations with fully populated trip (all entity types present)
- [ ] T059 [US2] Test performance: getAllTrips completes <50ms for 100 trips

**Checkpoint US2**: ✅ All read operations working for enhanced data model

---

## Phase 7: User Story 3 - Creating New Trip Records (Priority: P2)

**Goal**: Add new trips with all related entities to database through data layer API

**Independent Test**: Programmatically create trip with flights/hotels/activities through API, verify it appears in queries

### Tasks for User Story 3

- [ ] T060 [US3] Implement createTrip(input: TripInput) in `frontend/lib/db/operations/trips.ts` - generate UUID, set timestamps, set deleted=false, validate, insert, return Result<Trip>
- [ ] T061 [P] [US3] Implement createFlight(input: FlightInput) in `frontend/lib/db/operations/flights.ts` - generate UUID, validate trip_id exists, insert, return Result<Flight>
- [ ] T062 [P] [US3] Implement createFlightLeg(input: FlightLegInput) in `frontend/lib/db/operations/flights.ts` - generate UUID, validate flight_id exists, insert, return Result<FlightLeg>
- [ ] T063 [P] [US3] Implement createHotel(input: HotelInput) in `frontend/lib/db/operations/hotels.ts` - generate UUID, validate trip_id exists, insert, return Result<Hotel>
- [ ] T064 [P] [US3] Implement createActivity(input: ActivityInput) in `frontend/lib/db/operations/activities.ts` - generate UUID, validate trip_id exists, insert, return Result<DailyActivity>
- [ ] T065 [P] [US3] Implement createRestaurant(input: RestaurantInput) in `frontend/lib/db/operations/restaurants.ts` - generate UUID, validate trip_id exists, insert, return Result<RestaurantRecommendation>
- [ ] T066 [US3] Add validation for Trip in `frontend/lib/db/validation.ts` - validateTripInput(input: TripInput) checking required fields (name, start_date, end_date)
- [ ] T067 [P] [US3] Add validation for Flight in `frontend/lib/db/validation.ts` - validateFlightInput(input: FlightInput) checking trip_id exists
- [ ] T068 [P] [US3] Add validation for Hotel in `frontend/lib/db/validation.ts` - validateHotelInput(input: HotelInput) checking trip_id exists
- [ ] T069 [P] [US3] Add validation for DailyActivity in `frontend/lib/db/validation.ts` - validateActivityInput(input: ActivityInput) checking required fields (name, date, order_index, trip_id)
- [ ] T070 [P] [US3] Add validation for RestaurantRecommendation in `frontend/lib/db/validation.ts` - validateRestaurantInput(input: RestaurantInput) checking required fields (name, trip_id)
- [ ] T071 [US3] Update `frontend/lib/db/index.ts` - export create functions for all entity types
- [ ] T072 [US3] Test createTrip with valid data returns success
- [ ] T073 [US3] Test createTrip with invalid data returns ValidationError
- [ ] T074 [US3] Test createFlight/Hotel/Activity/Restaurant with non-existent trip_id returns error
- [ ] T075 [US3] Test quota exceeded scenario during create operations (QuotaExceededError)

**Checkpoint US3**: ✅ All create operations working for enhanced data model

---

## Phase 8: User Story 4 - Updating Existing Trip Records (Priority: P2)

**Goal**: Modify existing trips and related entities in database with changes persisted immediately

**Independent Test**: Create entities, update through API, verify changes persist across queries

### Tasks for User Story 4

- [ ] T076 [US4] Implement updateTrip(update: TripUpdate) in `frontend/lib/db/operations/trips.ts` - validate id exists, update fields, set updated_at, return Result<Trip>
- [ ] T077 [P] [US4] Implement updateFlight(update: FlightUpdate) in `frontend/lib/db/operations/flights.ts` - validate id exists, update fields, set updated_at, return Result<Flight>
- [ ] T078 [P] [US4] Implement updateHotel(update: HotelUpdate) in `frontend/lib/db/operations/hotels.ts` - validate id exists, update fields, set updated_at, return Result<Hotel>
- [ ] T079 [P] [US4] Implement updateActivity(update: ActivityUpdate) in `frontend/lib/db/operations/activities.ts` - validate id exists, update fields, set updated_at, return Result<DailyActivity>
- [ ] T080 [P] [US4] Implement updateRestaurant(update: RestaurantUpdate) in `frontend/lib/db/operations/restaurants.ts` - validate id exists, update fields, set updated_at, return Result<RestaurantRecommendation>
- [ ] T081 [US4] Update `frontend/lib/db/index.ts` - export update functions for all entity types
- [ ] T082 [US4] Test updateTrip with valid changes returns updated trip
- [ ] T083 [US4] Test updateTrip with non-existent id returns NotFoundError
- [ ] T084 [US4] Test update operations preserve unchanged fields
- [ ] T085 [US4] Test updated_at timestamp is refreshed on all updates
- [ ] T086 [US4] Test partial updates work correctly (only specified fields changed)

**Checkpoint US4**: ✅ All update operations working for enhanced data model

---

## Phase 9: User Story 5 - Deleting Trip Records (Priority: P3)

**Goal**: Soft delete trips (mark as deleted without removing from database)

**Independent Test**: Create trip, soft delete through API, verify it doesn't appear in normal queries but can be retrieved in deleted queries

### Tasks for User Story 5

- [ ] T087 [US5] Implement deleteTrip(id: string) in `frontend/lib/db/operations/trips.ts` - set deleted=true, set updated_at, preserve child entities, return Result<void>
- [ ] T088 [US5] Implement getDeletedTrips() in `frontend/lib/db/operations/trips.ts` - query trips where deleted=true, return Result<Trip[]>
- [ ] T089 [US5] Update getAllTrips to exclude soft-deleted trips (where deleted=false filter)
- [ ] T090 [US5] Update getTripById to return NotFoundError for soft-deleted trips (unless specifically queried)
- [ ] T091 [US5] Update `frontend/lib/db/index.ts` - export deleteTrip, getDeletedTrips
- [ ] T092 [US5] Test deleteTrip marks trip as deleted without removing from database
- [ ] T093 [US5] Test soft-deleted trip doesn't appear in getAllTrips results
- [ ] T094 [US5] Test soft-deleted trip appears in getDeletedTrips results
- [ ] T095 [US5] Test child entities (flights, hotels, activities, restaurants) preserved after trip soft delete
- [ ] T096 [US5] Test delete with non-existent id returns NotFoundError

**Checkpoint US5**: ✅ Soft delete working, trips can be recovered

---

## Phase 10: User Story 6 - Managing Place Records (Priority: P3)

**Goal**: Support legacy Place entity (now deprecated in favor of DailyActivity)

**Independent Test**: This story may be SKIPPED as Place is deprecated in favor of DailyActivity. If needed, DailyActivity operations from Phase 6 already cover this functionality.

### Tasks for User Story 6

- [ ] T097 [US6] DECISION POINT: Confirm if legacy Place CRUD operations are needed or if DailyActivity fully replaces Place
- [ ] T098 [US6] If needed: Implement createPlace, getPlacesByTripId, updatePlace, deletePlace in `frontend/lib/db/operations/places.ts`
- [ ] T099 [US6] If needed: Add Place table to schema (or migrate existing places to activities)

**Checkpoint US6**: ✅ Legacy Place support confirmed or migration to DailyActivity complete

---

## Phase 11: User Story 7 - Recovering Soft-Deleted Trips (Priority: P3)

**Goal**: Restore soft-deleted trips to active status

**Independent Test**: Soft delete trip, restore through API, verify it reappears in normal queries with all data intact

### Tasks for User Story 7

- [ ] T100 [US7] Implement restoreTrip(id: string) in `frontend/lib/db/operations/trips.ts` - set deleted=false, set updated_at, return Result<Trip>
- [ ] T101 [US7] Update `frontend/lib/db/index.ts` - export restoreTrip
- [ ] T102 [US7] Test restoreTrip marks trip as active (deleted=false)
- [ ] T103 [US7] Test restored trip appears in getAllTrips results
- [ ] T104 [US7] Test restored trip no longer appears in getDeletedTrips results
- [ ] T105 [US7] Test child entities remain intact after restore
- [ ] T106 [US7] Test restore with non-existent id returns NotFoundError
- [ ] T107 [US7] Test restore with already-active trip succeeds (idempotent operation)

**Checkpoint US7**: ✅ Trip recovery working, soft delete is fully reversible

---

## Phase 12: Polish & Integration

**Purpose**: Final touches, performance optimization, documentation

- [ ] T108 [Polish] Add JSDoc comments to all public API functions in `frontend/lib/db/index.ts`
- [ ] T109 [P] [Polish] Add inline comments to complex query logic (timeline queries, city grouping)
- [ ] T110 [P] [Polish] Verify all error messages are user-friendly (no technical jargon)
- [ ] T111 [Polish] Performance test: Seed loading for 100 trips completes <2s
- [ ] T112 [Polish] Performance test: getTripWithRelations completes <100ms for trip with 50+ activities
- [ ] T113 [Polish] Performance test: Timeline query (all flights+hotels+activities) completes <50ms
- [ ] T114 [Polish] Verify database schema version is correctly set to v2
- [ ] T115 [Polish] Verify all indexes are being used (check Dexie query plans)
- [ ] T116 [Polish] Create usage examples in quickstart.md for new entity operations
- [ ] T117 [Polish] Update README with database layer documentation
- [ ] T118 [Polish] Verify Result<T> pattern consistently used across all operations
- [ ] T119 [Polish] Verify all async operations properly handle errors

**Checkpoint Final**: ✅ Database layer complete, documented, and performant

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)
```
Phase 1 (Setup) → Phase 2 (Type System) → Phase 3 (Schema) → Phase 4 (Seed Loader)
```

### User Stories (Can Execute After Phase 4)
```
Phase 4 complete → Phase 5 (US1) + Phase 6 (US2) - Independent
Phase 6 complete → Phase 7 (US3) + Phase 8 (US4) - Independent  
Phase 8 complete → Phase 9 (US5) + Phase 10 (US6) + Phase 11 (US7) - Independent
```

### Parallelization Opportunities

**Phase 2 (Type System)**: T008, T009, T010 can run in parallel (different type categories)

**Phase 3 (Schema)**: T019-T022 can run in parallel (different tables)

**Phase 4 (Seed Loader)**: T029-T033 can run in parallel (parsing different entity types)

**Phase 6 (US2 Read Operations)**: T047-T051 can run in parallel (different entity operation files)

**Phase 7 (US3 Create Operations)**: T061-T065, T067-T070 can run in parallel (different entities)

**Phase 8 (US4 Update Operations)**: T077-T080 can run in parallel (different entities)

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)
- **Phase 1-4**: Setup through Seed Loader (REQUIRED)
- **Phase 5**: User Story 1 (seed loading verification)
- **Phase 6**: User Story 2 (read operations)

**Delivers**: Database initialized, data loaded, read operations working. This is enough to replace JSON file reads in UI.

### Incremental Delivery
- **Iteration 1**: MVP (Phases 1-6) - 15-20 hours
- **Iteration 2**: Create/Update (Phases 7-8) - 8-10 hours
- **Iteration 3**: Delete/Recovery (Phases 9-11) - 4-6 hours
- **Iteration 4**: Polish (Phase 12) - 3-4 hours

**Total Estimated**: 30-40 hours of focused development time

---

## Task Summary

**Total Tasks**: 119
- Setup & Dependencies: 4 tasks (T001-T004) ✅ COMPLETE
- Type System: 13 tasks (T005-T017)
- Schema Extension: 8 tasks (T018-T025)
- Seed Loader: 12 tasks (T026-T037)
- User Story 1: 7 tasks (T038-T044)
- User Story 2: 15 tasks (T045-T059)
- User Story 3: 16 tasks (T060-T075)
- User Story 4: 11 tasks (T076-T086)
- User Story 5: 10 tasks (T087-T096)
- User Story 6: 3 tasks (T097-T099)
- User Story 7: 8 tasks (T100-T107)
- Polish & Integration: 12 tasks (T108-T119)

**Parallel Opportunities**: 35 tasks marked with [P] can run concurrently

**Complexity**: Enhanced from original 2 entities to 9 entities
- Original estimate: ~30 tasks for Trip/Place only
- Enhanced estimate: 119 tasks for full enhanced model
- 4x increase justified by 4.5x entity increase and richer data model

---

## Notes for Implementation

1. **Type System First**: Phase 2 is absolutely critical and blocks everything else
2. **Schema Before Data**: Must have schema v2 complete before seed loading
3. **Test with Real Data**: Use existing trip JSON files from `/frontend/data/trips/` for testing
4. **Performance Matters**: Watch for index usage, bulk operations, transaction wrapping
5. **Error Handling**: Every operation returns Result<T>, no exceptions thrown
6. **UI Separation**: Database layer has zero UI dependencies, can be tested independently
7. **Future-Proof**: Design supports Supabase migration (UUIDs, timestamps, API abstraction)

---

## Success Criteria per User Story

- **US1**: Seed data loads all 6 tables on first launch
- **US2**: Read operations return all entity types with <100ms for full trip
- **US3**: Create operations work for all 6 entity types
- **US4**: Update operations work for all entity types
- **US5**: Soft delete preserves child entities
- **US6**: Legacy Place support confirmed or migrated
- **US7**: Trip recovery fully functional

**Overall Success**: All 7 user stories independently testable and working with enhanced data model.
