# Tasks: CSS Theme Management System

**Input**: Design documents from `/specs/002-css-theming-for/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification - focusing on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and theme system structure

- [ ] T001 Create theme directory structure in `travo-frontend/src/styles/themes/`
- [ ] T002 [P] Create TypeScript theme types file at `travo-frontend/src/styles/themes/types.ts`
- [ ] T003 [P] Create theme selection logic file at `travo-frontend/src/styles/themes/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Update Vite configuration in `travo-frontend/vite.config.ts` to handle VITE_THEME environment variable
- [ ] T005 [P] Update Tailwind configuration in `travo-frontend/tailwind.config.js` for CSS custom property support
- [ ] T006 [P] Create default theme CSS file at `travo-frontend/src/styles/themes/themes/default.css`
- [ ] T007 Update main CSS file `travo-frontend/src/index.css` to import selected theme dynamically
- [ ] T008 Update package.json scripts to support theme parameters in build commands

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Developer Theme Switching (Priority: P1) 🎯 MVP

**Goal**: Enable developers to switch themes via build script parameters (core functionality)

**Independent Test**: Run `npm run build --theme=blue` and verify all UI components display with blue theme consistently

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create shadcn.studio blue theme CSS at `travo-frontend/src/styles/themes/themes/blue.css`
- [ ] T010 [P] [US1] Create shadcn.studio green theme CSS at `travo-frontend/src/styles/themes/themes/green.css`
- [ ] T011 [P] [US1] Create shadcn.studio red theme CSS at `travo-frontend/src/styles/themes/themes/red.css`
- [ ] T012 [US1] Implement theme validation logic in `travo-frontend/src/styles/themes/index.ts` with fallback to default
- [ ] T013 [US1] Update theme selector function to handle VITE_THEME environment variable
- [ ] T014 [US1] Test theme switching with existing TripCard component to verify CSS custom properties work
- [ ] T015 [US1] Test theme switching with existing Navigation component to verify comprehensive coverage

**Checkpoint**: At this point, basic theme switching should work for core components

---

## Phase 4: User Story 2 - Multiple Theme Support (Priority: P2)

**Goal**: Support complete shadcn.studio theme collection for maximum flexibility

**Independent Test**: Build with any shadcn.studio theme name and verify it displays correctly or falls back to default

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create slate theme CSS at `travo-frontend/src/styles/themes/themes/slate.css`
- [ ] T017 [P] [US2] Create gray theme CSS at `travo-frontend/src/styles/themes/themes/gray.css`
- [ ] T018 [P] [US2] Create neutral theme CSS at `travo-frontend/src/styles/themes/themes/neutral.css`
- [ ] T019 [P] [US2] Create stone theme CSS at `travo-frontend/src/styles/themes/themes/stone.css`
- [ ] T020 [P] [US2] Create rose theme CSS at `travo-frontend/src/styles/themes/themes/rose.css`
- [ ] T021 [P] [US2] Create orange theme CSS at `travo-frontend/src/styles/themes/themes/orange.css`
- [ ] T022 [P] [US2] Create amber theme CSS at `travo-frontend/src/styles/themes/themes/amber.css`
- [ ] T023 [P] [US2] Create yellow theme CSS at `travo-frontend/src/styles/themes/themes/yellow.css`
- [ ] T024 [P] [US2] Create lime theme CSS at `travo-frontend/src/styles/themes/themes/lime.css`
- [ ] T025 [P] [US2] Create emerald theme CSS at `travo-frontend/src/styles/themes/themes/emerald.css`
- [ ] T026 [P] [US2] Create teal theme CSS at `travo-frontend/src/styles/themes/themes/teal.css`
- [ ] T027 [P] [US2] Create cyan theme CSS at `travo-frontend/src/styles/themes/themes/cyan.css`
- [ ] T028 [P] [US2] Create sky theme CSS at `travo-frontend/src/styles/themes/themes/sky.css`
- [ ] T029 [P] [US2] Create indigo theme CSS at `travo-frontend/src/styles/themes/themes/indigo.css`
- [ ] T030 [P] [US2] Create violet theme CSS at `travo-frontend/src/styles/themes/themes/violet.css`
- [ ] T031 [P] [US2] Create purple theme CSS at `travo-frontend/src/styles/themes/themes/purple.css`
- [ ] T032 [P] [US2] Create fuchsia theme CSS at `travo-frontend/src/styles/themes/themes/fuchsia.css`
- [ ] T033 [P] [US2] Create pink theme CSS at `travo-frontend/src/styles/themes/themes/pink.css`
- [ ] T034 [US2] Update theme types in `travo-frontend/src/styles/themes/types.ts` to include all theme names
- [ ] T035 [US2] Update theme validation to support all shadcn.studio themes
- [ ] T036 [US2] Test invalid theme name handling (should fall back to default silently)

**Checkpoint**: At this point, all shadcn.studio themes should be available and validated

---

## Phase 5: User Story 3 - Theme Component Coverage (Priority: P3)

**Goal**: Ensure comprehensive theme coverage across all UI components and maintain consistency

**Independent Test**: Switch between multiple themes and verify all component types (cards, buttons, navigation, etc.) reflect the theme consistently

### Implementation for User Story 3

- [ ] T037 [P] [US3] Verify TripCard component theming across all color variants
- [ ] T038 [P] [US3] Verify PlaceCard component theming across all color variants  
- [ ] T039 [P] [US3] Verify Navigation component theming across all color variants
- [ ] T040 [P] [US3] Verify Button components theming across all color variants
- [ ] T041 [P] [US3] Test HomePage component with multiple themes for consistency
- [ ] T042 [P] [US3] Test TripPage component with multiple themes for consistency
- [ ] T043 [US3] Validate that existing responsive design works with all themes
- [ ] T044 [US3] Validate that accessibility features (contrast ratios) are maintained across themes
- [ ] T045 [US3] Test theme switching preserves all existing component functionality
- [ ] T046 [US3] Create documentation for theme switching in project README

**Checkpoint**: All components should display consistently across all themes

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and documentation that affect the complete theming system

- [ ] T047 [P] Update project documentation with theme switching instructions
- [ ] T048 [P] Add theme build performance validation (ensure <5 second build time increase)
- [ ] T049 [P] Validate bundle size impact (ensure single theme adds ~2KB to CSS)
- [ ] T050 Optimize theme CSS files for production (remove comments, minimize)
- [ ] T051 Run quickstart.md validation with multiple theme builds
- [ ] T052 Create CI/CD documentation for theme parameter handling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately  
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 theme collection
- **User Story 3 (P3)**: Can start after US1 completion - Validates comprehensive theme coverage

### Within Each User Story

- Theme CSS files (marked [P]) can be created in parallel
- TypeScript updates should follow theme file creation
- Validation and testing tasks should come after implementation
- Documentation should be last within each story

### Parallel Opportunities

- All Setup tasks (T001-T003) marked [P] can run in parallel
- All Foundational tasks (T005-T006, T008) marked [P] can run in parallel within Phase 2
- Within US1: Theme CSS files (T009-T011) can be created in parallel
- Within US2: All theme CSS files (T016-T033) can be created in parallel
- Within US3: All component validation tasks (T037-T042) can be run in parallel
- All Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Create multiple theme CSS files simultaneously:
Task: "Create shadcn.studio blue theme CSS at travo-frontend/src/styles/themes/themes/blue.css"
Task: "Create shadcn.studio green theme CSS at travo-frontend/src/styles/themes/themes/green.css" 
Task: "Create shadcn.studio red theme CSS at travo-frontend/src/styles/themes/themes/red.css"
```

---

## Parallel Example: User Story 2

```bash
# Create all remaining theme CSS files simultaneously:
Task: "Create slate theme CSS at travo-frontend/src/styles/themes/themes/slate.css"
Task: "Create gray theme CSS at travo-frontend/src/styles/themes/themes/gray.css"
Task: "Create neutral theme CSS at travo-frontend/src/styles/themes/themes/neutral.css"
# ... and all other theme files (T016-T033)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T009-T015) 
4. **STOP and VALIDATE**: Test theme switching with `npm run build --theme=blue`
5. Deploy/demo basic theme switching capability

### Incremental Delivery

1. Complete Setup + Foundational → Basic theme infrastructure ready
2. Add User Story 1 → Test independently → Deploy basic theme switching (MVP!)
3. Add User Story 2 → Test independently → Deploy complete theme collection  
4. Add User Story 3 → Test independently → Deploy with full component coverage
5. Each story adds value without breaking previous functionality

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T008)
2. Once Foundational is done:
   - Developer A: User Story 1 theme implementation (T009-T015)
   - Developer B: User Story 2 theme collection (T016-T036) 
   - Developer C: User Story 3 component validation (T037-T046)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability  
- Each user story should be independently completable and testable
- Focus on build-time theme switching only (no runtime switching)
- All themes must follow shadcn.studio CSS custom property format
- Invalid themes should silently fall back to default (no error messages)
- Preserve existing responsive design and accessibility features
- Commit after each task or logical group of parallel tasks
- Stop at any checkpoint to validate story works independently