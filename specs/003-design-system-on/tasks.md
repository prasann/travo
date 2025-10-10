# Tasks: Reusable Design System Built on ShadCN

**Input**: Design documents from `/specs/003-design-system-on/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in this specification, so no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions
- **Frontend project**: `travo-frontend/src/`, `travo-frontend/tests/`
- Paths based on plan.md structure extending existing React application

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and design system structure

- [x] T001 Create design system directory structure in travo-frontend/src/components/design-system/
- [x] T002 Create design system styles directory in travo-frontend/src/styles/design-system/
- [x] T003 [P] Create design system utilities directory in travo-frontend/src/lib/design-system/
- [x] T004 [P] Configure Tailwind CSS with design system tokens in travo-frontend/tailwind.config.js
- [x] T005 [P] Setup TypeScript interfaces export file in travo-frontend/src/components/design-system/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core design tokens and theme system that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create design token definitions in travo-frontend/src/lib/design-system/tokens.ts
- [x] T007 Create theme configuration utilities in travo-frontend/src/lib/design-system/theme.tsx
- [x] T008 [P] Create spacing tokens CSS file in travo-frontend/src/styles/design-system/tokens.css
- [x] T009 [P] Create typography scale definitions in travo-frontend/src/styles/design-system/tokens.css
- [x] T010 [P] Create shadow and border radius tokens in travo-frontend/src/styles/design-system/tokens.css
- [x] T011 Create base component utilities in travo-frontend/src/lib/design-system/utils.ts
- [x] T012 Create ThemeProvider component in travo-frontend/src/lib/design-system/theme.tsx
- [x] T013 [P] Create animation and transition styles in travo-frontend/src/styles/design-system/animations.css

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Enhanced Card Components with Visual Hierarchy (Priority: P1) 🎯 MVP

**Goal**: Create enhanced card components with gradient backgrounds, hover effects, and typography hierarchy that developers can use consistently

**Independent Test**: Import and use enhanced Card component with trip data, verify gradient backgrounds, 24px padding, hover effects, and proper typography hierarchy display

### Implementation for User Story 1

- [x] T014 [P] [US1] Create enhanced Card component in travo-frontend/src/components/ui/card.tsx extending ShadCN Card
- [x] T015 [P] [US1] Create Typography component with hierarchy variants in travo-frontend/src/components/ui/typography.tsx
- [x] T016 [US1] Create card-specific styles with gradient variants in travo-frontend/src/styles/design-system/components.css
- [x] T017 [US1] Add interactive states (hover, focus, active) to card styles in travo-frontend/src/styles/design-system/components.css
- [x] T018 [US1] Create TripCard component implementation in travo-frontend/src/components/design-system/TripCard.tsx
- [x] T019 [US1] Update existing TripCard usage in travo-frontend/src/components/TripCard.tsx to use enhanced version
- [x] T020 [US1] Add card component exports to travo-frontend/src/components/ui/index.ts
- [x] T021 [US1] Add design system exports to travo-frontend/src/components/design-system/index.ts

**Checkpoint**: Enhanced card components with visual hierarchy are complete and can replace existing trip cards

---

## Phase 4: User Story 2 - Comprehensive Typography and Spacing System (Priority: P2)

**Goal**: Provide consistent typography and spacing system that automatically applies correct font sizes, line heights, and spacing measurements

**Independent Test**: Apply typography system to existing pages, verify consistent font scales (text-2xl for titles, text-xl for headers), proper contrast ratios, and spacing (24px between elements, 48px sections)

### Implementation for User Story 2

- [x] T022 [P] [US2] Extend Typography component with all hierarchy variants (display, h1, h2, h3, body, caption, label) in travo-frontend/src/components/ui/typography.tsx
- [x] T023 [P] [US2] Create typography CSS classes extending Tailwind in travo-frontend/src/styles/design-system/tokens.css
- [x] T024 [US2] Create spacing utility classes in travo-frontend/src/lib/design-system/utils.ts
- [x] T025 [US2] Update HomePage component typography in travo-frontend/src/pages/HomePage.tsx
- [x] T026 [US2] Update TripPage component typography in travo-frontend/src/pages/TripPage.tsx
- [x] T027 [US2] Update Navigation component typography in travo-frontend/src/components/Navigation.tsx
- [x] T028 [US2] Verify responsive typography scaling across screen sizes

**Checkpoint**: Typography and spacing system is applied consistently across the application

---

## Phase 5: User Story 3 - Theme-Integrated Interactive Components (Priority: P3)

**Goal**: Ensure all interactive elements consistently use theme colors and provide clear visual feedback for all interaction states

**Independent Test**: Interact with all buttons, links, and form elements to verify theme color highlighting and accessibility-compliant focus indicators

### Implementation for User Story 3

- [x] T029 [P] [US3] Create enhanced Button component with theme integration in travo-frontend/src/components/ui/button.tsx
- [x] T030 [P] [US3] Create interactive state management utilities in travo-frontend/src/lib/design-system/utils.ts
- [x] T031 [US3] Add theme color integration to all interactive states in travo-frontend/src/styles/design-system/components.css
- [x] T032 [US3] Create accessibility-compliant focus indicators in travo-frontend/src/styles/design-system/components.css
- [x] T033 [US3] Update existing buttons to use enhanced Button component throughout application
- [x] T034 [US3] Add theme color integration to link styles and form inputs
- [x] T035 [US3] Create useInteractiveState hook in travo-frontend/src/lib/design-system/utils.ts
- [x] T036 [US3] Verify WCAG AA compliance with contrast ratio validation

**Checkpoint**: All interactive elements provide consistent theme-integrated feedback and meet accessibility standards

---

## Phase 6: User Story 4 - Reusable Component Library Architecture (Priority: P4)

**Goal**: Package design system components for independent import and use across multiple applications with clear documentation

**Independent Test**: Create separate test project, import design system components, verify they render with default theming and work independently

### Implementation for User Story 4

- [ ] T037 [P] [US4] Create Timeline component for trip details in travo-frontend/src/components/design-system/Timeline.tsx
- [ ] T038 [P] [US4] Create StatCard component for statistics display in travo-frontend/src/components/design-system/StatCard.tsx
- [ ] T039 [US4] Create complete component library exports in travo-frontend/src/components/design-system/index.ts
- [ ] T040 [US4] Create theme configuration factory utilities in travo-frontend/src/lib/design-system/theme.ts
- [ ] T041 [US4] Update TripDetails component to use Timeline component in travo-frontend/src/components/TripDetails.tsx
- [ ] T042 [US4] Create component documentation and usage examples
- [ ] T043 [US4] Setup package.json configuration for npm distribution (if needed)
- [ ] T044 [US4] Create component validation utilities for theme compatibility

**Checkpoint**: Complete design system is packaged and ready for multi-application use

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final integration

- [ ] T045 [P] Create comprehensive component documentation in design system README
- [ ] T046 [P] Add performance optimizations (lazy loading, memoization) across all components
- [ ] T047 Verify all components meet <100ms render time and 60fps animation performance goals
- [ ] T048 [P] Add accessibility validation utilities and testing
- [ ] T049 Create theme switching functionality demonstration
- [ ] T050 [P] Code cleanup and consistent TypeScript interfaces across all components
- [ ] T051 Run quickstart.md validation with actual implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Independent foundation for all other components
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Builds on typography tokens but independent
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses theme system but independent of other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent packaging and architecture work

### Within Each User Story

- Enhanced components before application integration
- Core component implementation before usage updates
- Style definitions before component implementations that use them
- Utility functions before components that depend on them

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel
- Component creation tasks within stories marked [P] can run in parallel
- Documentation and styling tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all component creation for User Story 1 together:
Task: "Create enhanced Card component in travo-frontend/src/components/ui/card.tsx"
Task: "Create Typography component with hierarchy variants in travo-frontend/src/components/ui/typography.tsx"

# Launch all export and integration tasks together:
Task: "Add card component exports to travo-frontend/src/components/ui/index.ts"
Task: "Add design system exports to travo-frontend/src/components/design-system/index.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - establishes design tokens and theme system)
3. Complete Phase 3: User Story 1 (Enhanced Cards)
4. **STOP and VALIDATE**: Test enhanced card components independently
5. Deploy enhanced trip cards to see immediate visual improvement

### Incremental Delivery

1. Complete Setup + Foundational → Design system foundation ready
2. Add User Story 1 → Enhanced cards available → Deploy visual improvements
3. Add User Story 2 → Typography consistency → Deploy improved readability
4. Add User Story 3 → Interactive consistency → Deploy polished interactions
5. Add User Story 4 → Reusable package → Enable multi-application use

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Enhanced Cards)
   - Developer B: User Story 2 (Typography System)
   - Developer C: User Story 3 (Interactive Components)
   - Developer D: User Story 4 (Package Architecture)
3. Stories complete and integrate independently

---

## Task Summary

- **Total Tasks**: 51 tasks across 7 phases
- **Setup Tasks**: 5 tasks (project structure)
- **Foundational Tasks**: 8 tasks (design tokens, theme system)
- **User Story 1**: 8 tasks (enhanced cards with visual hierarchy)
- **User Story 2**: 7 tasks (typography and spacing system)
- **User Story 3**: 8 tasks (theme-integrated interactive components)
- **User Story 4**: 8 tasks (reusable component library architecture)
- **Polish Tasks**: 7 tasks (documentation, performance, validation)

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (User Story 1) provides immediate visual enhancement to trip cards

**Independent Test Criteria**:
- US1: Enhanced trip cards with gradients, hover effects, and typography hierarchy
- US2: Consistent typography scaling and spacing across pages
- US3: Theme-integrated interactive feedback on all buttons and links
- US4: Components importable and usable in separate applications