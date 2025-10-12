# Implementation Plan: Trip Edit Mode

**Branch**: `006-edit-mode-for` | **Date**: October 12, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-edit-mode-for/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an edit mode interface that allows users to modify trip details, add/delete/reorder places using Google Plus Codes, and add contextual notes at multiple levels (trip, hotel, flight, attraction). The feature prioritizes simplicity: no unsaved change warnings, no delete confirmations, no conflict resolution (last write wins). All changes persist to IndexedDB with simple error messages for failures. Edit mode accessed via button on trip page, returns to trips home after completion.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), JavaScript ES2020+  
**Primary Dependencies**: Next.js 15.5.4 (App Router), React 19.1.0, DaisyUI 5.2.0, Tailwind CSS 4.1.14, Dexie.js (IndexedDB wrapper)  
**Storage**: IndexedDB (via Dexie.js) for offline-first local persistence  
**Testing**: Jest + React Testing Library (assumed standard Next.js setup)  
**Target Platform**: Web browsers (desktop + mobile), responsive design
**Project Type**: Web application (frontend-focused with existing IndexedDB layer)  
**Performance Goals**: Edit mode loads in <1s, API lookups complete in <2s, save operations in <3s  
**Constraints**: Offline-first (constitution I), simplicity over defensive code (constitution VI), <200MB IndexedDB storage assumed  
**Scale/Scope**: 1-2 users, single trip edit page, ~5-10 form components, integration with existing DB layer

**External Dependencies**:
- Google Maps Places API (NEEDS CLARIFICATION: specific API endpoint, authentication method, rate limits)
- Plus Code to address resolution service (NEEDS CLARIFICATION: API choice - Maps Geocoding API vs Plus Codes API)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Offline-First Architecture ✅
- **Status**: PASS
- **Assessment**: Edit mode operates entirely on IndexedDB. Google Maps API calls for Plus Code resolution can fail gracefully with error messages (FR-010). Core edit functionality (modify existing data, delete, reorder) works offline. Only "add new place" requires network.
- **Mitigation**: None needed - aligns with constitution

### Principle II: Privacy-Friendly Design ✅
- **Status**: PASS
- **Assessment**: Plus Codes already in use, no new privacy concerns. All data stays in IndexedDB, no new tracking/analytics.
- **Mitigation**: None needed

### Principle III: Minimalist User Experience ✅
- **Status**: PASS
- **Assessment**: Feature justification: edit mode is essential for data maintenance. Clarifications chose simplest options (no warnings, no confirmations). Single edit page with category navigation.
- **Mitigation**: None needed

### Principle IV: Component-Driven Development ✅
- **Status**: PASS
- **Assessment**: Will create reusable form components (PlaceForm, NoteInput, CategorySection). TypeScript interfaces required per constitution.
- **Mitigation**: None needed

### Principle V: Sync Integrity & Conflict Resolution ⚠️
- **Status**: PASS (with note)
- **Assessment**: Last-write-wins chosen for simplicity (clarification Q3). Constitution allows this for 1-2 user scenario. Existing `updated_at` timestamps preserved.
- **Note**: Acceptable deviation per Constitution VI (simplicity over complexity for small scale)

### Principle VI: Code Simplicity Over Defensive Programming ✅
- **Status**: PASS
- **Assessment**: All clarifications prioritized simplicity: no unsaved warnings, no delete confirmations, simple error messages, no retry queues. Perfect alignment.
- **Mitigation**: None needed

**Overall Gate Status**: ✅ PASS - Proceed to Phase 0

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

```
frontend/
├── app/
│   └── trip/
│       └── [tripId]/
│           ├── page.tsx           # View mode (existing)
│           └── edit/
│               └── page.tsx       # NEW: Edit mode page
├── components/
│   ├── TripCard.tsx              # Existing
│   ├── TripTimeline.tsx          # Existing (unchanged)
│   ├── edit/                     # NEW: Edit mode components
│   │   ├── EditModeLayout.tsx    # NEW: Main edit page layout
│   │   ├── CategoryNav.tsx       # NEW: Category navigation
│   │   ├── FlightSection.tsx     # NEW: Flight editing
│   │   ├── HotelSection.tsx      # NEW: Hotel editing
│   │   ├── AttractionSection.tsx # NEW: Attraction editing
│   │   ├── NotesSection.tsx      # NEW: Notes editing
│   │   ├── PlaceForm.tsx         # NEW: Add/edit place form
│   │   └── PlusCodeInput.tsx     # NEW: Plus Code lookup
│   └── ...
├── lib/
│   ├── db/
│   │   ├── index.ts              # Existing DB exports
│   │   ├── operations/           # Existing CRUD operations
│   │   │   ├── trips.ts          # Existing
│   │   │   ├── places.ts         # Existing
│   │   │   ├── flights.ts        # Existing
│   │   │   ├── hotels.ts         # Existing
│   │   │   └── activities.ts     # Existing
│   │   └── models.ts             # Existing types
│   ├── services/                 # NEW: External services
│   │   └── plusCodeService.ts    # NEW: Google Maps API integration
│   └── ...
└── ...
```

**Structure Decision**: Web application (Option 2) - frontend-only changes. Existing Next.js App Router structure with `app/` directory for pages and `components/` for UI. New `/edit` route under existing trip detail page. New `components/edit/` directory for edit-specific components. New `lib/services/` for external API integration. Leverages existing IndexedDB layer in `lib/db/`.

## Complexity Tracking

No constitution violations - this section is not applicable.
