# Tasks: Port App to Next.js and Replace ShadCN with DaisyUI

**Feature**: 004-port-app-to  
**Created**: October 11, 2025  
**Input**: Design documents from `/specs/004-port-app-to/`

**Tests**: NOT INCLUDED - Testing deferred per research.md decision to maintain code simplicity

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Convention
- New Next.js app root: `travo-nextjs/`
- Old Vite app for reference: `travo-frontend/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Create new Next.js project structure and install dependencies

- [X] **T001** Create new Next.js 14+ application at `travo-nextjs/` with TypeScript, Tailwind CSS, App Router, and import alias `@/*`
  ```bash
  npx create-next-app@latest travo-nextjs --typescript --tailwind --app --no-src-dir --import-alias "@/*"
  ```

- [X] **T002** [P] Install DaisyUI and utility dependencies in `travo-nextjs/`
  ```bash
  cd travo-nextjs && npm install daisyui clsx tailwind-merge
  ```

- [X] **T003** [P] Configure Next.js for static export in `travo-nextjs/next.config.mjs`
  - Set `output: 'export'`
  - Set `trailingSlash: true`
  - Set `images.unoptimized: true`

- [X] **T004** Configure Tailwind CSS with DaisyUI in `travo-nextjs/tailwind.config.ts`
  - Add `daisyui` plugin
  - Configure 5 custom themes: default, blue, green, red, violet
  - Each theme defines: primary, secondary, accent, neutral, base-100, base-200, base-300
  - Reference: `specs/004-port-app-to/research.md` section "DaisyUI Theming System"

- [X] **T005** Update global styles in `travo-nextjs/app/globals.css`
  - Keep Tailwind directives
  - Add base layer styles for body
  - Add utilities layer for `.page-container` class
  - Remove ShadCN-specific CSS

- [X] **T006** [P] Copy data files from old app
  ```bash
  mkdir -p travo-nextjs/data
  cp travo-frontend/src/data/trips.json travo-nextjs/data/
  ```

- [X] **T007** [P] Copy type definitions from old app
  ```bash
  mkdir -p travo-nextjs/types
  cp travo-frontend/src/types/index.ts travo-nextjs/types/
  ```

- [X] **T008** [P] Copy utility functions from old app
  ```bash
  mkdir -p travo-nextjs/lib
  cp travo-frontend/src/lib/utils.ts travo-nextjs/lib/
  ```

- [X] **T009** Update package.json scripts in `travo-nextjs/package.json`
  - Add `dev`, `dev:blue`, `dev:green`, `dev:red`, `dev:violet`
  - Add `build`, `build:blue`, `build:green`, `build:red`, `build:violet`
  - All theme scripts use `NEXT_PUBLIC_THEME` environment variable

**Checkpoint**: Project structure ready with dependencies installed and configuration complete

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Setup root layout, error boundaries, and shared infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] **T010** Create root layout with theme support in `travo-nextjs/app/layout.tsx`
  - Read theme from `process.env.NEXT_PUBLIC_THEME || 'default'`
  - Set `data-theme` attribute on `<html>` tag
  - Configure metadata (title, description)
  - Apply base body classes

- [X] **T011** [P] Create error boundary in `travo-nextjs/app/error.tsx`
  - Client Component (`'use client'`)
  - Display error message using DaisyUI card
  - Include "Try again" button with reset handler
  - Apply error styling with DaisyUI classes

- [X] **T012** [P] Create 404 not found page in `travo-nextjs/app/not-found.tsx`
  - Display 404 message using DaisyUI alert/card
  - Include Link back to home page
  - Center content on page

- [X] **T013** [P] Create Navigation component in `travo-nextjs/components/Navigation.tsx`
  - Client Component for back button interactivity
  - Props: `title: string`, `showBackButton?: boolean`, `backHref?: string`
  - Use Next.js Link for back navigation
  - Apply DaisyUI navbar or header classes
  - Reference: `specs/004-port-app-to/contracts/interfaces.md`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Trip List (Priority: P1) 🎯 MVP

**Goal**: Users can view a list of all their trips on the home page using Next.js Server Components and DaisyUI cards

**Independent Test**: Load home page (localhost:3000) and verify all trips from trips.json display in a grid with proper DaisyUI styling

### Implementation for User Story 1

- [X] **T014** [P] [US1] Create TripCard component in `travo-nextjs/components/TripCard.tsx`
  - Client Component (needs Link interactivity)
  - Props: `trip: Trip`
  - Wrap entire card in Next.js Link to `/trip/${trip.id}`
  - Use DaisyUI classes: `card`, `card-body`, `card-title`, `card-actions`
  - Display: trip image (if exists), name, destination, dates, description, place count badge
  - Add hover effects with `hover:shadow-2xl transition-shadow`
  - Reference: `specs/004-port-app-to/quickstart.md` TripCard example

- [X] **T015** [P] [US1] Create TripList component in `travo-nextjs/components/TripList.tsx`
  - Client Component (for future interactivity)
  - Props: `trips: Trip[]`, `isLoading?: boolean`
  - Render grid layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
  - Handle empty state with DaisyUI alert component
  - Handle loading state with DaisyUI skeleton (optional for Server Component usage)
  - Map over trips and render TripCard for each
  - Add page title "My Trips" with proper heading styles
  - Reference: `specs/004-port-app-to/contracts/interfaces.md` TripListProps

- [X] **T016** [US1] Create home page in `travo-nextjs/app/page.tsx`
  - Server Component (default - for data loading)
  - Import trips data: `import tripsData from '@/data/trips.json'`
  - Extract trips array: `const trips = tripsData.trips`
  - Render TripList component with trips prop
  - Wrap in `<main className="min-h-screen">`
  - Reference: `specs/004-port-app-to/quickstart.md` HomePage example

- [X] **T017** [US1] Verify acceptance criteria for User Story 1
  - Start dev server: `npm run dev`
  - Visit http://localhost:3000
  - ✓ All trips from trips.json display in grid
  - ✓ Each trip card shows: name, destination, dates, description, place count
  - ✓ DaisyUI card styling applied correctly
  - ✓ Clicking trip card navigates to trip detail (will 404 until US2 complete)
  - ✓ Empty state displays if trips array is empty (test by temporarily editing trips.json)

**Checkpoint**: User Story 1 (MVP) complete - trip list page fully functional

---

## Phase 4: User Story 2 - View Trip Details (Priority: P2)

**Goal**: Users can click a trip to view detailed information including all places using Next.js dynamic routing and DaisyUI components

**Independent Test**: Click any trip card from home page, verify trip detail page loads with all places displayed correctly

### Implementation for User Story 2

- [X] **T018** [P] [US2] Create PlaceCard component in `travo-nextjs/components/PlaceCard.tsx`
  - Client Component (could be Server Component but Client for consistency)
  - Props: `place: Place`
  - Use DaisyUI classes: `card`, `card-body`, `card-title`
  - Display: place image (if exists), name, description, address (if exists), notes (if exists)
  - Apply compact card styling for list view
  - Reference: `specs/004-port-app-to/contracts/interfaces.md` PlaceCardProps

- [X] **T019** [P] [US2] Create TripDetails component in `travo-nextjs/components/TripDetails.tsx`
  - Client Component
  - Props: `trip: Trip`
  - Display trip header with Navigation component (showBackButton=true, backHref="/")
  - Display full trip information: name, destination, dates, description
  - Render list/grid of PlaceCard components for trip.places
  - Handle empty places array with DaisyUI alert: "No places added yet"
  - Apply responsive layout with page-container class
  - Reference: `specs/004-port-app-to/contracts/interfaces.md` TripDetailsProps

- [X] **T020** [US2] Create trip detail page in `travo-nextjs/app/trip/[tripId]/page.tsx`
  - Server Component (default)
  - Params: `{ params: { tripId: string } }`
  - Import trips data: `import tripsData from '@/data/trips.json'`
  - Find trip by ID: `const trip = tripsData.trips.find(t => t.id === params.tripId)`
  - If trip not found, call `notFound()` from 'next/navigation'
  - Render TripDetails component with trip prop
  - Wrap in `<main className="min-h-screen">`
  - Reference: `specs/004-port-app-to/quickstart.md` TripPage example

- [X] **T021** [US2] Verify acceptance criteria for User Story 2
  - Visit home page: http://localhost:3000
  - Click any trip card
  - ✓ Navigates to `/trip/[tripId]` URL
  - ✓ Trip detail page loads with correct trip information
  - ✓ All places for the trip display with DaisyUI card styling
  - ✓ Back button navigates to home page
  - ✓ Invalid trip ID (e.g., /trip/fake-id) shows 404 page
  - ✓ Trip with no places shows "No places added yet" message

**Checkpoint**: User Stories 1 AND 2 both work independently - core functionality complete

---

## Phase 5: User Story 3 - Theme Support (Priority: P3)

**Goal**: App supports all 5 theme variants (default, blue, green, red, violet) through DaisyUI configuration and build scripts

**Independent Test**: Run each theme-specific dev/build script and verify color scheme applies correctly across all pages

### Implementation for User Story 3

- [X] **T022** [US3] Verify theme configuration in `travo-nextjs/tailwind.config.ts`
  - Confirm all 5 themes defined with complete color palettes
  - Verify theme names: default, blue, green, red, violet
  - Ensure each theme has: primary, secondary, accent, neutral, base-100, base-200, base-300, info, success, warning, error
  - Reference: `specs/004-port-app-to/research.md` section "DaisyUI Theming System"

- [X] **T023** [US3] Verify theme application in `travo-nextjs/app/layout.tsx`
  - Confirm theme read from environment: `process.env.NEXT_PUBLIC_THEME || 'default'`
  - Verify `data-theme={theme}` attribute on `<html>` tag
  - No additional logic needed - DaisyUI handles theme via data-theme attribute

- [X] **T024** [US3] Test all theme variants
  - Test default theme: `npm run dev` → visit http://localhost:3000
  - Test blue theme: `npm run dev:blue` → verify blue color scheme
  - Test green theme: `npm run dev:green` → verify green color scheme  
  - Test red theme: `npm run dev:red` → verify red color scheme
  - Test violet theme: `npm run dev:violet` → verify violet color scheme
  - For each theme, verify:
    - ✓ Primary color applies to badges, active elements
    - ✓ Background colors match theme
    - ✓ Card styling reflects theme
    - ✓ Theme consistent across home page and trip detail pages

- [X] **T025** [US3] Test theme build scripts
  - Test default build: `npm run build` → verify out/ directory created
  - Test blue build: `npm run build:blue` → verify theme in static output
  - Test green build: `npm run build:green` → verify theme in static output
  - Test red build: `npm run build:red` → verify theme in static output
  - Test violet build: `npm run build:violet` → verify theme in static output
  - Verify each build:
    - ✓ Completes without errors
    - ✓ Generates static files in out/ directory
    - ✓ Preview with `npm run start` shows correct theme

**Checkpoint**: All 3 user stories complete and independently functional - feature complete!

---

## Phase 6: Polish & Validation

**Purpose**: Final verification, cleanup, and documentation

- [X] **T026** [P] Validate TypeScript compilation
  - Run: `cd travo-nextjs && npm run build`
  - ✓ Zero TypeScript errors (meets FR-006)
  - Fix any type errors before proceeding

- [X] **T027** [P] Run ESLint checks
  - Run: `cd travo-nextjs && npm run lint`
  - Fix any linting errors
  - Ensure code quality standards maintained

- [X] **T028** Verify all functional requirements met
  - ✓ FR-001: All routes migrated (/, /trip/[tripId], 404)
  - ✓ FR-002: ShadCN components replaced with DaisyUI utilities
  - ✓ FR-003: 5 themes working via DaisyUI configuration
  - ✓ FR-004: All functionality preserved (trip list, details, navigation, errors)
  - ✓ FR-005: JSON data format unchanged
  - ✓ FR-006: TypeScript strict mode passing
  - ✓ FR-007: Theme build scripts working
  - ✓ FR-008: Responsive design with DaisyUI/Tailwind utilities
  - ✓ FR-009: Loading states handled (Server Components optimize this)
  - ✓ FR-010: Reduced complexity (no custom UI component files)

- [X] **T029** Verify success criteria met
  - ✓ SC-001: All pages function identically to Vite app
  - ✓ SC-002: Count component files - should have 0 UI component files (was 4 in travo-frontend/src/components/ui/)
  - ✓ SC-003: Compare build times (should be within 10%)
  - ✓ SC-004: Test page load time (should be <2s)
  - ✓ SC-005: All 5 themes build successfully
  - ✓ SC-006: TypeScript passes with zero errors
  - ✓ SC-007: No custom CSS files needed for basic styling

- [X] **T030** [P] Test edge cases from spec
  - ✓ Empty trips.json → shows "No trips" message
  - ✓ Invalid trip ID → shows 404 page
  - ✓ Trip with no places → shows "No places added yet"
  - ✓ Very long trip names → UI handles gracefully (text truncation)
  - ✓ Slow network simulation → static export means instant loading after first load

- [X] **T031** [P] Update project README
  - Document new Next.js structure
  - Update setup instructions to reference `specs/004-port-app-to/quickstart.md`
  - Document theme switching process
  - Update technology stack section

- [X] **T032** Archive old Vite application
  - Rename: `travo-frontend` → `travo-frontend-archived`
  - Add README in archived folder explaining migration
  - Keep for reference during transition period

- [X] **T033** Create deployment documentation
  - Document static export deployment process
  - Add instructions for Vercel/Netlify/GitHub Pages
  - Document theme selection for production builds
  - Reference: `specs/004-port-app-to/quickstart.md` Deployment section

**Checkpoint**: Feature complete, validated, and ready for deployment! 🎉

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - start immediately
2. **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
3. **User Story 1 (Phase 3)**: Depends on Foundational - can start once Phase 2 complete
4. **User Story 2 (Phase 4)**: Depends on Foundational - can run in parallel with US1 or after US1
5. **User Story 3 (Phase 5)**: Depends on Foundational - can run in parallel with US1/US2 or after
6. **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Trip List)**: Independent - no dependencies on other stories
- **US2 (Trip Details)**: Technically independent but uses TripCard from US1 for navigation context
- **US3 (Themes)**: Completely independent - only touches configuration files

### Critical Path

```
T001-T009 (Setup) → T010-T013 (Foundational) → T014-T017 (US1) → T018-T021 (US2) → T022-T025 (US3) → T026-T033 (Polish)
```

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel (different files)
- T006, T007, T008 can run in parallel (different copy operations)

**Phase 2 (Foundational)**:
- T011, T012, T013 can run in parallel (different files)

**Phase 3 (User Story 1)**:
- T014, T015 can run in parallel (different component files)

**Phase 4 (User Story 2)**:
- T018, T019 can run in parallel (different component files)

**Phase 6 (Polish)**:
- T026, T027 can run in parallel (different checks)
- T030, T031 can run in parallel (testing vs documentation)

**User Stories in Parallel** (if team capacity):
- After Foundational (T013), US1, US2, and US3 can all proceed in parallel since they touch different components/pages

---

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task T014: "Create TripCard component in travo-nextjs/components/TripCard.tsx"
Task T015: "Create TripList component in travo-nextjs/components/TripList.tsx"

# Then sequentially:
Task T016: "Create home page in travo-nextjs/app/page.tsx" (uses T014, T015)
Task T017: "Verify acceptance criteria" (tests T016)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Fastest path to working product**:

1. Complete Phase 1: Setup (T001-T009) → ~30 minutes
2. Complete Phase 2: Foundational (T010-T013) → ~30 minutes
3. Complete Phase 3: User Story 1 (T014-T017) → ~1 hour
4. **STOP and VALIDATE**: Test trip list page independently
5. **Result**: Working trip list viewer in ~2 hours

### Incremental Delivery

**Recommended approach**:

1. **Sprint 1**: Setup + Foundational + US1 → Deploy MVP (trip list only)
2. **Sprint 2**: Add US2 → Deploy with trip details
3. **Sprint 3**: Add US3 → Deploy with all themes
4. **Sprint 4**: Polish → Final production release

Each increment is independently valuable and deployable.

### Parallel Team Strategy

**With 2-3 developers**:

1. **Everyone**: Complete Setup + Foundational together (T001-T013) → ~1 hour
2. **Split work**:
   - Developer A: User Story 1 (T014-T017) → ~1 hour
   - Developer B: User Story 2 (T018-T021) → ~1 hour
   - Developer C: User Story 3 (T022-T025) → ~1 hour
3. **Together**: Polish (T026-T033) → ~1 hour

**Total time**: ~3-4 hours with parallel team

---

## Time Estimates

**Single Developer (Sequential)**:
- Phase 1 (Setup): 30-45 minutes
- Phase 2 (Foundational): 30-45 minutes
- Phase 3 (US1): 1-1.5 hours
- Phase 4 (US2): 1-1.5 hours
- Phase 5 (US3): 30-45 minutes
- Phase 6 (Polish): 45-60 minutes

**Total**: 4-6 hours (matches quickstart.md estimate)

**Team of 3 (Parallel)**:
- Phase 1+2: 1 hour (together)
- Phase 3+4+5: 1.5 hours (parallel)
- Phase 6: 1 hour (together)

**Total**: 3-4 hours with parallel execution

---

## Success Metrics

**Before Migration** (travo-frontend):
- UI Component Files: 4 (button.tsx, card.tsx, typography.tsx, index.ts)
- Theme Files: 5 CSS files
- Build Tool: Vite
- Routing: React Router (manual setup)

**After Migration** (travo-nextjs):
- UI Component Files: 0 (use DaisyUI utilities)
- Theme Files: 1 config object in tailwind.config.ts
- Build Tool: Next.js (built-in optimization)
- Routing: Next.js App Router (file-based)

**Reduction**: 30%+ code complexity achieved ✓

---

## Notes

- **[P] markers**: Tasks that can run in parallel (different files, no dependencies)
- **[Story] labels**: Map each task to user story for traceability (US1, US2, US3)
- **Independent stories**: Each user story can be completed and tested independently
- **No tests**: Testing deferred per research.md to maintain code simplicity (Constitution Principle VI)
- **Commit strategy**: Commit after each phase or logical task group
- **Validation points**: Stop at each checkpoint to validate story independently
- **Reference docs**: 
  - `specs/004-port-app-to/quickstart.md` for detailed examples
  - `specs/004-port-app-to/contracts/interfaces.md` for component interfaces
  - `specs/004-port-app-to/research.md` for technical decisions

---

## Quick Reference

**Start Development**:
```bash
cd travo-nextjs
npm run dev              # Default theme
npm run dev:blue         # Blue theme
```

**Build for Production**:
```bash
npm run build            # Default theme
npm run build:blue       # Blue theme
```

**Test Migration**:
```bash
# Visit http://localhost:3000
# Verify trip list → click trip → verify details → test back button
```

**Questions?** See `specs/004-port-app-to/quickstart.md` troubleshooting section
