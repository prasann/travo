# Implementation Plan: Local Database Layer with IndexedDB

**Branch**: `005-let-s-introduce` | **Date**: 2025-10-12 (Revised) | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-let-s-introduce/spec.md`

**Note**: Plan revised on 2025-10-12 to incorporate enhanced data model from merged main branch (005-need-to-better feature).

## Summary

Introduce a local IndexedDB database layer as the primary data source for the Travo application, replacing direct JSON file reads. The database now supports an **enhanced data model** with multiple entity types including Trip, Flight, Hotel, DailyActivity, and RestaurantRecommendation. Implementation uses Dexie.js as an IndexedDB wrapper and maintains complete separation from UI components to enable future migration to Supabase without UI changes. Each trip is stored in a separate JSON file (seed data) and loaded on first launch. Focus is on building functional data layer interfaces without UI integration—UI binding already exists from merged main branch.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Framework**: Next.js 15.5.4 with React 19.1.0  
**Primary Dependencies**: 
  - Dexie.js 4.x (IndexedDB wrapper - to be added)
  - Next.js 15.5.4
  - React 19.1.0
  - DaisyUI 5.2.0 + Tailwind CSS 4.1.14
  - TypeScript 5.x

**Storage**: IndexedDB (browser-native, persistent local storage)  
**Testing**: Jest + React Testing Library (existing setup) + Dexie testing utilities  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+) with IndexedDB support  
**Project Type**: Web application (frontend-only, client-side database)  

**Performance Goals**: 
  - Database operations complete within 500ms for datasets up to 100 trips
  - Initial database load within 2 seconds
  - Non-blocking async operations
  - Support 50+ activities, 5+ flights, 3+ hotels per trip

**Constraints**: 
  - Offline-first architecture (no network dependency)
  - Single user application (no multi-user concurrency)
  - Data layer must be UI-agnostic
  - Browser storage quota typically 50MB+ per origin
  - Simple schema without strict validation initially
  - One JSON file per trip (seed data in `/frontend/data/trips/`)

**Scale/Scope**: 
  - Support up to 1000 trips with complex nested data
  - **9+ entity types**: Trip, Flight, FlightLeg, Hotel, DailyActivity, Place, RestaurantRecommendation, TripIndex
  - Core operations (init, seed, read, create, update, soft-delete, restore)
  - Data layer interfaces only - UI integration already exists from merged main branch

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Offline-First Architecture ✅ PASS
- **Status**: Fully Compliant
- **Evidence**: IndexedDB as primary data source, no network dependency, local storage before any cloud sync
- **Impact**: Core requirement - feature enables offline-first foundation

### Principle II: Privacy-Friendly Design ✅ PASS
- **Status**: Fully Compliant
- **Evidence**: All data stored locally in browser, no external services, no tracking
- **Impact**: User data remains under full user control

### Principle III: Minimalist User Experience ✅ PASS
- **Status**: Fully Compliant
- **Evidence**: Data layer only - UI already exists from merged main, maintains simplicity
- **Impact**: Zero new UI complexity in this phase

### Principle IV: Component-Driven Development ✅ PASS
- **Status**: Fully Compliant
- **Evidence**: Data layer completely decoupled from UI, follows separation of concerns
- **Impact**: Enables independent testing and future Supabase migration without UI changes

### Principle V: Sync Integrity & Conflict Resolution ⚠️ DEFERRED
- **Status**: Not Applicable (This Phase)
- **Evidence**: Sync functionality explicitly out of scope, but schema includes `updated_at` and UUID for future sync readiness
- **Impact**: Foundation laid for future sync implementation

### Principle VI: Code Simplicity Over Defensive Programming ✅ PASS
- **Status**: Fully Compliant
- **Evidence**: Simple schema, basic validation only, iterative approach to complexity
- **Impact**: Clarifications explicitly chose simple validation over defensive edge case handling

### Technology Constraints ✅ PASS
- **Frontend Stack**: React + TypeScript + Next.js ✅
- **UI Framework**: DaisyUI + Tailwind CSS (no changes needed) ✅
- **Storage**: IndexedDB via Dexie.js ✅
- **Location Data**: Plus Codes in enhanced model ✅
- **Cross-Platform**: Web app only ✅

### Development Standards ✅ PASS
- **Code Quality**: TypeScript strict mode, proper interfaces ✅
- **Testing**: Data layer independently testable ✅
- **Data Model**: UUID primary keys, updated_at timestamps included ✅
- **Performance**: 500ms targets specified ✅

**Overall Status**: ✅ ALL GATES PASSED - Proceed to implementation

**Revision Note**: Enhanced data model from merged main branch (005-need-to-better) fully aligns with constitution principles. Complexity justified by user requirements for comprehensive trip planning.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/                         # Next.js application root
├── lib/
│   └── db/                      # NEW: Database layer (this feature)
│       ├── index.ts            # Public API exports
│       ├── schema.ts           # Dexie schema definitions
│       ├── models.ts           # TypeScript interfaces (DB layer)
│       ├── seed.ts             # Seed data initialization
│       ├── init.ts             # Database initialization
│       ├── validation.ts       # Validation utilities
│       ├── errors.ts           # Error handling utilities
│       └── operations/         # CRUD operations by entity
│           ├── trips.ts        # Trip CRUD operations
│           ├── flights.ts      # NEW: Flight CRUD operations
│           ├── hotels.ts       # NEW: Hotel CRUD operations
│           ├── activities.ts   # NEW: Activity CRUD operations
│           ├── restaurants.ts  # NEW: Restaurant CRUD operations
│           └── places.ts       # Place CRUD operations (legacy)
├── types/
│   └── index.ts                # EXISTING: Enhanced types from main
├── data/
│   ├── trip-index.json         # EXISTING: Trip index from main
│   └── trips/                  # EXISTING: One JSON per trip from main
│       ├── 123e4567-*.json
│       ├── 456def78-*.json
│       └── 987f6543-*.json
├── components/                  # EXISTING: UI components from main
│   ├── FlightCard.tsx          # From merged main
│   ├── HotelCard.tsx           # From merged main
│   ├── ActivityCard.tsx        # From merged main
│   ├── RestaurantList.tsx      # From merged main
│   ├── TripTimeline.tsx        # From merged main
│   └── ...                     # Other existing components
├── app/                        # EXISTING: Next.js App Router
│   ├── page.tsx                # Trip list page
│   └── trip/[tripId]/
│       └── page.tsx            # Trip detail page (uses merged UI)
└── __tests__/                  # NEW: Tests for database layer
    └── db/
        ├── schema.test.ts
        ├── trips.test.ts
        ├── flights.test.ts
        ├── hotels.test.ts
        ├── activities.test.ts
        └── restaurants.test.ts
```

**Structure Decision**: Web application structure with frontend-only implementation. Database layer isolated in `frontend/lib/db/` directory following Next.js conventions. **Enhanced from merged main**: Now supports 9+ entity types instead of just Trip/Place. All database logic contained in this module with clear public API through `index.ts`. Operations separated by entity type for maintainability. **UI components already exist from merged main** - they will be connected to database layer in future phase.

## Complexity Tracking

No constitution violations detected. All principles compliant.

**Enhanced Model Justification**: The expanded entity model (9+ types vs original 2) came from merged main branch (005-need-to-better feature) which was user-requested and already has working UI. This complexity serves real user needs for comprehensive trip planning with flights, hotels, activities, and restaurants.

---

## Implementation Status & Revision Notes

### Completed (Pre-Merge)
✅ **Phase 0**: Research complete (`research.md`)
✅ **Phase 1**: Design complete (`data-model.md`, `contracts/interfaces.ts`, `quickstart.md`)
✅ **Database Infrastructure**: Dexie.js setup with simple Trip/Place model
✅ **Seed Operations**: Basic seed loading for single JSON file
✅ **Read Operations**: getAllTrips, getTripById, getTripWithPlaces

### Incoming from Main (005-need-to-better)
🆕 **Enhanced Data Model**: 9+ entity types in `/frontend/types/index.ts`
🆕 **UI Components**: FlightCard, HotelCard, ActivityCard, RestaurantList, TripTimeline
🆕 **Multi-File Storage**: One JSON per trip in `/frontend/data/trips/`
🆕 **Trip Index**: Separate index file for list view optimization

### Remaining Work (Post-Merge)

**Must Reconcile**:
1. **Update schema** (`frontend/lib/db/schema.ts`) to support all 9+ entities
2. **Merge type definitions** (`frontend/lib/db/models.ts` + `frontend/types/index.ts`)
3. **Update seed loader** to read from per-trip JSON files instead of single file
4. **Extend CRUD operations** to cover Flight, Hotel, Activity, Restaurant entities
5. **Update data-model.md** to document enhanced entity relationships
6. **Revise tasks.md** with new implementation tasks

**Keep Unchanged**:
- Core database initialization logic
- Error handling patterns
- Validation utilities
- Result<T> pattern for type-safe operations
- Soft delete implementation on Trip entity

---

## Next Steps

**Immediate Actions**:
1. ✅ Update `plan.md` with enhanced model context (this file)
2. ⏭️ Update `data-model.md` with all entity types and relationships
3. ⏭️ Reconcile `contracts/interfaces.ts` with `frontend/types/index.ts`
4. ⏭️ Update `tasks.md` with revised implementation sequence

**Phase 2 Tasks** (To be generated):
Run `/speckit.tasks` to generate updated implementation tasks incorporating the enhanced model.

**Implementation Priority**:
1. Schema expansion (support all entity types)
2. Seed loader update (per-trip JSON files)
3. CRUD operations for new entities (Flight, Hotel, Activity, Restaurant)
4. UI integration (connect existing components to database layer)
