# Tasks: Local Database Layer with IndexedDB

**Input**: Design documents from `/specs/005-let-s-introduce/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/interfaces.ts

**Tests**: No tests requested in specification - test tasks excluded from this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with frontend-only implementation:
- **Frontend Code**: `frontend/lib/db/` for database layer
- **Seed Data**: `frontend/data/trips.json` (existing)
- **Types**: `frontend/types/` or `frontend/lib/db/models.ts`
- **No backend**: Client-side database only

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and create project structure

- [ ] T001 Install Dexie.js 4.x dependency in frontend (`cd frontend && npm install dexie@^4.0.0`)
- [ ] T002 [P] Install uuid for UUID generation (`cd frontend && npm install uuid@^9.0.0`)
- [ ] T003 [P] Install TypeScript type definitions (`cd frontend && npm install --save-dev @types/uuid fake-indexeddb`)
- [ ] T004 Create database layer directory structure (`frontend/lib/db/` with subdirectories `operations/`)

**Checkpoint**: Dependencies installed - foundation ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create TypeScript interfaces in `frontend/lib/db/models.ts` (Trip, Place, TripInput, PlaceInput, TripUpdate, PlaceUpdate, TripWithPlaces, DbError types, Result<T> type, type guards)
- [ ] T006 Create Dexie database schema in `frontend/lib/db/schema.ts` (TravoDatabase class extending Dexie, version 1 with trips and places tables, indexes: trips by id/deleted/updated_at, places by id/trip_id/order_index/updated_at)
- [ ] T007 Create validation utilities in `frontend/lib/db/validation.ts` (validateTripInput, validatePlaceInput, validateDateFormat, validateUUID, return ValidationError with field-specific messages)
- [ ] T008 Create error handling utilities in `frontend/lib/db/errors.ts` (createValidationError, createQuotaExceededError, createDatabaseError, createNotFoundError, wrapDatabaseOperation for try-catch)
- [ ] T009 Create database initialization logic in `frontend/lib/db/init.ts` (initializeDatabase, checkIfInitialized, functions to open database and verify schema version)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Initial Data Loading from Seed (Priority: P1) 🎯 MVP

**Goal**: Load trip data from JSON seed file into database on first launch

**Independent Test**: Clear browser storage, launch app, verify data is accessible without reloading JSON

### Implementation for User Story 1

- [ ] T010 [US1] Create seed data loader in `frontend/lib/db/seed.ts` (loadSeedData function, validate JSON structure, parse trips.json, transform nested structure to flat tables)
- [ ] T011 [US1] Implement seed validation in `frontend/lib/db/seed.ts` (validateSeedData function, check trips array exists, validate each trip has required fields, validate places structure, return clear errors for corrupted data)
- [ ] T012 [US1] Implement seed loading transaction in `frontend/lib/db/seed.ts` (bulkAddTrips and bulkAddPlaces within Dexie transaction, handle errors with rollback, detect and handle quota exceeded errors)
- [ ] T013 [US1] Add initialization check logic in `frontend/lib/db/init.ts` (isInitialized function checking if trips table has data, conditional seed loading only if empty)
- [ ] T014 [US1] Create public initialization API in `frontend/lib/db/index.ts` (export initialize() and isInitialized() functions, call seed loader if needed, return Result<void>)

**Checkpoint**: At this point, User Story 1 should be fully functional - seed data loads on first launch

---

## Phase 4: User Story 2 - Reading Trip Data from Database (Priority: P1) 🎯 MVP

**Goal**: Read all trip information from database instead of JSON files

**Independent Test**: Add data to database, refresh app, verify trip information displays from persistent storage

### Implementation for User Story 2

- [ ] T015 [P] [US2] Create Trip read operations in `frontend/lib/db/operations/trips.ts` (getAllTrips function - query trips where deleted=false, return Result<Trip[]>)
- [ ] T016 [P] [US2] Add getTripById operation in `frontend/lib/db/operations/trips.ts` (query single trip by id, handle not found case, return Result<Trip>)
- [ ] T017 [P] [US2] Create Place read operations in `frontend/lib/db/operations/places.ts` (getPlacesByTripId function - query places where trip_id matches, sort by order_index, return Result<Place[]>)
- [ ] T018 [US2] Add getTripWithPlaces operation in `frontend/lib/db/operations/trips.ts` (combines getTripById and getPlacesByTripId, return Result<TripWithPlaces>)
- [ ] T019 [US2] Export read operations in `frontend/lib/db/index.ts` (export getAllTrips, getTripById, getTripWithPlaces, getPlacesByTripId)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - data loads and can be queried

---

## Phase 5: User Story 3 - Creating New Trip Records (Priority: P2)

**Goal**: Add new trip records to local database through data layer API

**Independent Test**: Programmatically create trip through API, verify it appears in subsequent queries

### Implementation for User Story 3

- [ ] T020 [US3] Implement createTrip operation in `frontend/lib/db/operations/trips.ts` (accept TripInput, generate UUID, set updated_at timestamp, set deleted=false, validate input using validation.ts, insert into trips table, handle quota exceeded, return Result<Trip>)
- [ ] T021 [US3] Export createTrip in `frontend/lib/db/index.ts` (add to public API exports)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should work - can load, read, and create trips

---

## Phase 6: User Story 4 - Updating Existing Trip Records (Priority: P2)

**Goal**: Modify existing trip records with changes persisted immediately

**Independent Test**: Create trip, modify properties via API, verify changes persist across queries

### Implementation for User Story 4

- [ ] T022 [US4] Implement updateTrip operation in `frontend/lib/db/operations/trips.ts` (accept TripUpdate with id, fetch existing trip, validate update data, merge changes, update updated_at timestamp, save to database, handle not found case, return Result<Trip>)
- [ ] T023 [US4] Export updateTrip in `frontend/lib/db/index.ts` (add to public API exports)

**Checkpoint**: At this point, User Stories 1-4 should work - full trip read and write operations available

---

## Phase 7: User Story 5 - Deleting Trip Records (Priority: P3)

**Goal**: Soft delete trips from database (mark as deleted, don't permanently remove)

**Independent Test**: Create trip, delete via API, verify it doesn't appear in normal queries

### Implementation for User Story 5

- [ ] T024 [US5] Implement deleteTrip operation in `frontend/lib/db/operations/trips.ts` (accept trip id, fetch trip, set deleted=true, update updated_at timestamp, save changes, handle not found case, return Result<void>)
- [ ] T025 [US5] Implement getDeletedTrips operation in `frontend/lib/db/operations/trips.ts` (query trips where deleted=true, return Result<Trip[]>)
- [ ] T026 [US5] Export delete operations in `frontend/lib/db/index.ts` (export deleteTrip and getDeletedTrips)

**Checkpoint**: At this point, User Stories 1-5 should work - trips can be soft deleted and queried

---

## Phase 8: User Story 6 - Managing Place Records within Trips (Priority: P3)

**Goal**: Support full CRUD operations for place records with referential integrity

**Independent Test**: Create trip, add places, modify places, verify data integrity maintained

### Implementation for User Story 6

- [ ] T027 [P] [US6] Implement createPlace operation in `frontend/lib/db/operations/places.ts` (accept PlaceInput, validate trip_id exists, generate UUID, set updated_at timestamp, insert into places table, return Result<Place>)
- [ ] T028 [P] [US6] Implement getPlaceById operation in `frontend/lib/db/operations/places.ts` (query single place by id, handle not found, return Result<Place>)
- [ ] T029 [P] [US6] Implement updatePlace operation in `frontend/lib/db/operations/places.ts` (accept PlaceUpdate with id, fetch existing place, validate update, merge changes, update updated_at, save to database, return Result<Place>)
- [ ] T030 [US6] Implement deletePlace operation in `frontend/lib/db/operations/places.ts` (hard delete place by id, handle not found, return Result<void>)
- [ ] T031 [US6] Export place CRUD operations in `frontend/lib/db/index.ts` (export createPlace, getPlaceById, updatePlace, deletePlace)

**Checkpoint**: At this point, User Stories 1-6 should work - full CRUD for both trips and places

---

## Phase 9: User Story 7 - Recovering Soft-Deleted Trips (Priority: P3)

**Goal**: Restore soft-deleted trips to active status

**Independent Test**: Soft delete trip, query deleted trips, restore it, verify reappears in normal queries

### Implementation for User Story 7

- [ ] T032 [US7] Implement restoreTrip operation in `frontend/lib/db/operations/trips.ts` (accept trip id, fetch deleted trip, verify it's actually deleted, set deleted=false, update updated_at timestamp, save changes, return Result<Trip>)
- [ ] T033 [US7] Export restoreTrip in `frontend/lib/db/index.ts` (add to public API exports)

**Checkpoint**: All user stories should now be independently functional - complete CRUD with soft delete/restore

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T034 [P] Add JSDoc comments to all public API functions in `frontend/lib/db/index.ts` (document parameters, return types, error conditions, usage examples)
- [ ] T035 [P] Create README for database layer at `frontend/lib/db/README.md` (overview, installation, usage examples, API reference, error handling guide)
- [ ] T036 Code review and refactoring (ensure consistent error handling patterns, verify all operations use Result<T> type, check validation coverage)
- [ ] T037 Performance verification (test with 100 trips and 500 places dataset, verify operations complete within 500ms target, check bulk operations efficiency)
- [ ] T038 Run quickstart.md validation (follow developer guide step-by-step, verify all code examples work, test error scenarios described)
- [ ] T039 [P] Update main README.md with database layer information (add section about data persistence, document offline-first architecture, note UI integration is future scope)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if multiple developers)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel with US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel with US3)
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Uses read operations from US2 but independently testable
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Uses trip validation but independently testable
- **User Story 7 (P3)**: Can start after Foundational (Phase 2) - Uses soft delete from US5 conceptually but independently implementable

### Within Each User Story

- **US1**: T010-T014 must be sequential (seed validation → loading → initialization → public API)
- **US2**: T015-T017 can run in parallel [P], T018 depends on them, T019 is final
- **US3**: Sequential (T020 → T021)
- **US4**: Sequential (T022 → T023)
- **US5**: Sequential (T024 → T025 → T026)
- **US6**: T027-T029 can run in parallel [P], T030 sequential, T031 is final
- **US7**: Sequential (T032 → T033)

### Parallel Opportunities

- **Setup (Phase 1)**: T002 and T003 can run in parallel [P] after T001
- **Foundational (Phase 2)**: T005-T009 can run in parallel [P] - different files
- **User Story 2**: T015, T016, T017 can run in parallel [P] - independent operations
- **User Story 6**: T027, T028, T029 can run in parallel [P] - independent CRUD operations
- **Polish (Phase 10)**: T034, T035, T039 can run in parallel [P] - documentation tasks

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together (different files, no dependencies):
Task T005: "Create TypeScript interfaces in frontend/lib/db/models.ts"
Task T006: "Create Dexie schema in frontend/lib/db/schema.ts"
Task T007: "Create validation utilities in frontend/lib/db/validation.ts"
Task T008: "Create error handling utilities in frontend/lib/db/errors.ts"
Task T009: "Create initialization logic in frontend/lib/db/init.ts"
```

---

## Parallel Example: User Story 2

```bash
# Launch all read operations together:
Task T015: "Create getAllTrips in frontend/lib/db/operations/trips.ts"
Task T016: "Add getTripById in frontend/lib/db/operations/trips.ts"
Task T017: "Create getPlacesByTripId in frontend/lib/db/operations/places.ts"

# Then combine them:
Task T018: "Add getTripWithPlaces combining previous operations"
Task T019: "Export all read operations in index.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (seed loading)
4. Complete Phase 4: User Story 2 (read operations)
5. **STOP and VALIDATE**: Test that data loads and can be read
6. At this point, you have a working offline-first data layer (MVP!)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Seed loading works (checkpoint)
3. Add User Story 2 → Test independently → Read operations work (MVP complete!)
4. Add User Story 3 → Test independently → Create works
5. Add User Story 4 → Test independently → Update works
6. Add User Story 5 → Test independently → Delete works
7. Add User Story 6 → Test independently → Place operations work
8. Add User Story 7 → Test independently → Restore works
9. Polish → Documentation and optimization complete

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 + 2 (P1 - read operations)
   - **Developer B**: User Story 3 + 4 (P2 - write operations)
   - **Developer C**: User Story 5 + 7 (P3 - delete/restore)
   - **Developer D**: User Story 6 (P3 - place operations)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase

---

## Notes

- [P] tasks = different files, no dependencies - safe to parallelize
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **No tests included** - specification did not request test implementation
- Commit after each task or logical group for clean history
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All file paths are relative to `frontend/` directory
- Database operations use async/await patterns throughout
- Error handling uses Result<T> pattern for type safety
- **UI integration not in scope** - focus on data layer interfaces only
