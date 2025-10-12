# Implementation Plan: Local Database Layer with IndexedDB

**Branch**: `005-let-s-introduce` | **Date**: 2025-10-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-let-s-introduce/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Introduce a local IndexedDB database layer as the primary data source for the Travo application, replacing direct JSON file reads. The data layer provides a complete CRUD API for Trip and Place entities, supporting soft delete/restore operations. Implementation uses Dexie.js as an IndexedDB wrapper and maintains complete separation from UI components to enable future migration to Supabase without UI changes. The initial JSON data serves as seed data loaded on first launch. Focus is on building functional data layer interfaces without UI integration—UI binding will be implemented in a future phase.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Framework**: Next.js 15.5.4 with React 19.1.0  
**Primary Dependencies**: 
  - Dexie.js 4.x (IndexedDB wrapper - to be added)
  - Next.js 15.5.4
  - React 19.1.0
  - TypeScript 5.x

**Storage**: IndexedDB (browser-native, persistent local storage)  
**Testing**: Jest + React Testing Library (existing setup) + Dexie testing utilities  
**Target Platform**: Modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+) with IndexedDB support  
**Project Type**: Web application (frontend-only, client-side database)  
**Performance Goals**: 
  - Database operations complete within 500ms for datasets up to 100 trips with 500 places
  - Initial database load within 2 seconds
  - Non-blocking async operations

**Constraints**: 
  - Offline-first architecture (no network dependency)
  - Single user application (no multi-user concurrency)
  - Data layer must be UI-agnostic
  - Browser storage quota typically 50MB+ per origin
  - Simple schema without strict validation initially

**Scale/Scope**: 
  - Support up to 1000 trips with 5000 total places
  - 2 entity types (Trip, Place)
  - 7 core operations (init, seed, read, create, update, soft-delete, restore)
  - Data layer interfaces only - no UI integration in this phase

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
- **Evidence**: Data layer only - no UI changes, maintains simplicity
- **Impact**: Zero UI complexity added in this phase

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
- **UI Framework**: ShadCN + Tailwind (no changes needed) ✅
- **Storage**: IndexedDB via Dexie.js ✅
- **Location Data**: Not applicable to this feature ✅
- **Cross-Platform**: Web app only ✅

### Development Standards ✅ PASS
- **Code Quality**: TypeScript strict mode, proper interfaces ✅
- **Testing**: Data layer independently testable ✅
- **Data Model**: UUID primary keys, updated_at timestamps included ✅
- **Performance**: 500ms targets specified ✅

**Overall Status**: ✅ ALL GATES PASSED - Proceed to Phase 0

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
│       ├── models.ts           # TypeScript interfaces for Trip/Place
│       ├── seed.ts             # Seed data initialization
│       └── operations/         # CRUD operations organized by entity
│           ├── trips.ts        # Trip CRUD operations
│           └── places.ts       # Place CRUD operations
├── data/
│   └── trips.json              # EXISTING: Seed data source
├── types/
│   └── index.ts                # EXISTING: Shared types (may import from db/models.ts)
├── components/                  # EXISTING: No changes
├── app/                        # EXISTING: No changes  
└── __tests__/                  # NEW: Tests for database layer
    └── db/
        ├── schema.test.ts
        ├── trips.test.ts
        └── places.test.ts
```

**Structure Decision**: Web application structure with frontend-only implementation. Database layer isolated in `frontend/lib/db/` directory following Next.js conventions. All database logic contained in this module with clear public API through `index.ts`. Operations separated by entity (trips, places) for maintainability. Existing UI components remain unchanged - they will import from `lib/db` in future when UI integration is implemented.

## Complexity Tracking

No constitution violations detected. All principles compliant.

---

## Phase 0: Research Complete ✅

**Output**: `research.md`

**Key Decisions**:
1. Dexie.js 4.x selected as IndexedDB wrapper
2. Simple schema with UUID primary keys and soft delete support
3. Check-and-load seed data strategy with validation
4. Basic required field and format validation only
5. User-facing errors with no internal logging
6. Unit tests with fake-indexeddb for Jest
7. Separate TypeScript interfaces from Dexie schema

**Dependencies Identified**:
- Dexie.js 4.x (IndexedDB wrapper)
- uuid (UUID generation)
- fake-indexeddb (testing)
- @types/uuid (TypeScript definitions)

---

## Phase 1: Design & Contracts Complete ✅

**Outputs**:
- `data-model.md` - Complete entity specifications with ERD, schemas, and query patterns
- `contracts/interfaces.ts` - TypeScript interfaces for all types and operations
- `quickstart.md` - Developer guide with examples and patterns
- `.github/copilot-instructions.md` - Updated with new technology stack

**Design Highlights**:
- **Two entities**: Trip (with soft delete) and Place (with trip relationship)
- **Database**: TravoLocalDB version 1 using Dexie
- **Schema**: Simple required fields, UUIDs, timestamps for sync readiness
- **API**: Complete CRUD operations with Result<T> pattern for type-safe errors
- **Performance**: Indexed queries targeting <500ms for typical datasets

**Constitution Re-check**: ✅ ALL GATES STILL PASSING

---

## Next Steps

**Phase 2 (Not included in /speckit.plan)**:
Run `/speckit.tasks` to generate implementation tasks from this plan.

**Implementation Sequence**:
1. Install dependencies (Dexie.js, uuid, fake-indexeddb)
2. Create data models and TypeScript interfaces
3. Implement Dexie schema and database initialization
4. Implement seed data loader with validation
5. Implement Trip CRUD operations
6. Implement Place CRUD operations
7. Write comprehensive tests
8. Update existing components to use database layer (future phase)
