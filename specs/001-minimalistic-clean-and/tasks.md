# Tasks: Minimalistic Frontend with Hardcoded Data

**Input**: Design documents from `/specs/001-minimalistic-clean-and/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in the feature specification, so no test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions
- Single frontend project: `src/`, `tests/` at repository root
- All paths assume Vite React + TypeScript structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Vite + React + TypeScript structure

- [x] T001 Create Vite React TypeScript project using `npm create vite@latest travo-frontend -- --template react-ts`
- [x] T002 [P] Install React Router dependency: `npm install react-router-dom`
- [x] T003 [P] Install and configure ShadCN UI: `npx shadcn@latest init`
- [x] T004 [P] Install additional ShadCN components: manually created `button` and `card` components
- [x] T005 [P] Configure Tailwind CSS (if not done by ShadCN setup)
- [x] T006 [P] Setup testing environment with Vitest: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
- [x] T007 Create project directory structure: `src/{components,pages,types,data,lib,hooks}`, `src/components/ui`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core TypeScript interfaces and mock data that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create TypeScript interfaces in `src/types/index.ts` - Trip, Place, AppData, NavigationState interfaces
- [x] T009 Create hardcoded JSON data in `src/data/trips.json` with sample trips and places following data model
- [x] T010 [P] Configure Vite config in `vite.config.ts` for React and testing support
- [x] T011 [P] Configure TypeScript in `tsconfig.json` with strict mode
- [x] T012 [P] Setup global Tailwind styles in `src/index.css`
- [x] T013 [P] Create utility functions in `src/lib/utils.ts` for date formatting and common helpers

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Trip List (Priority: P1) 🎯 MVP

**Goal**: Display a clean list of trips with name, dates, and place count from hardcoded data

**Independent Test**: Load application at `/` and verify trip list displays with correct data, dates in chronological order, and place counts

### Implementation for User Story 1

- [x] T014 [P] [US1] Create TripCard component in `src/components/TripCard.tsx` for individual trip display
- [x] T015 [P] [US1] Create TripList component in `src/components/TripList.tsx` for trip list container
- [x] T016 [US1] Create HomePage component in `src/pages/HomePage.tsx` that loads data and renders TripList
- [x] T017 [US1] Setup basic routing in `src/App.tsx` with React Router for home page route
- [x] T018 [US1] Update `src/main.tsx` to render App component with proper styling imports
- [x] T019 [US1] Style TripCard with ShadCN Card components and Tailwind CSS for clean, minimalist design
- [x] T020 [US1] Implement trip sorting by start_date in chronological order
- [x] T021 [US1] Handle empty state display when no trips exist

**Checkpoint**: At this point, User Story 1 should be fully functional - trip list displays correctly and loads within 2 seconds

---

## Phase 4: User Story 2 - View Trip Details (Priority: P1)

**Goal**: Show detailed trip information with all places when user clicks on a trip

**Independent Test**: Click on any trip from the list and verify all trip details display including places with Plus Codes and notes

### Implementation for User Story 2

- [ ] T022 [P] [US2] Create PlaceCard component in `src/components/PlaceCard.tsx` for individual place display
- [ ] T023 [P] [US2] Create TripDetails component in `src/components/TripDetails.tsx` for trip detail view
- [ ] T024 [US2] Create TripPage component in `src/pages/TripPage.tsx` that loads specific trip data
- [ ] T025 [US2] Add trip detail route `/trip/:tripId` to App.tsx routing configuration
- [ ] T026 [US2] Implement click handler in TripCard to navigate to trip details using React Router
- [ ] T027 [US2] Style TripDetails with ShadCN components showing trip info and places list
- [ ] T028 [US2] Style PlaceCard to display place name, Plus Code, and notes cleanly
- [ ] T029 [US2] Ensure places display in correct order using order_index field
- [ ] T030 [US2] Handle edge case when trip has no places (display appropriate message)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - can navigate from list to details and back

---

## Phase 5: User Story 3 - Navigate Between Views (Priority: P2)

**Goal**: Provide clear navigation elements for moving between trip list and trip details

**Independent Test**: Navigate back and forth between views multiple times, verify smooth transitions and responsive interface

### Implementation for User Story 3

- [ ] T031 [P] [US3] Create Navigation component in `src/components/Navigation.tsx` with back button and title
- [ ] T032 [US3] Add Navigation component to TripPage with back button functionality
- [ ] T033 [US3] Add Navigation component to HomePage with appropriate title
- [ ] T034 [US3] Implement back navigation using React Router's useNavigate hook
- [ ] T035 [US3] Add navigation state management to show/hide back button appropriately
- [ ] T036 [US3] Style Navigation component with clean, minimalist design using ShadCN Button
- [ ] T037 [US3] Ensure navigation works smoothly with browser back/forward buttons
- [ ] T038 [US3] Test navigation performance to meet <1 second transition requirement

**Checkpoint**: All core navigation should now work seamlessly between views

---

## Phase 6: User Story 4 - Responsive Design Display (Priority: P2)

**Goal**: Ensure clean, readable interface across all device sizes from 320px to 1920px

**Independent Test**: Test application on different screen sizes and orientations, verify readability and functionality

### Implementation for User Story 4

- [ ] T039 [P] [US4] Implement responsive grid layout for TripList using Tailwind CSS responsive classes
- [ ] T040 [P] [US4] Make TripCard responsive with proper spacing and sizing across screen sizes
- [ ] T041 [P] [US4] Implement responsive layout for TripDetails component
- [ ] T042 [P] [US4] Make PlaceCard responsive with proper mobile-first design
- [ ] T043 [US4] Adjust Navigation component for mobile devices with appropriate touch targets
- [ ] T044 [US4] Test and adjust typography scaling across different screen sizes
- [ ] T045 [US4] Implement proper spacing and margins for mobile, tablet, and desktop viewports
- [ ] T046 [US4] Handle device orientation changes gracefully
- [ ] T047 [US4] Ensure accessibility requirements are met across all screen sizes

**Checkpoint**: Application should be fully functional and visually appealing on all target screen sizes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T048 [P] Add loading states and smooth transitions between components
- [ ] T049 [P] Implement error boundaries for robust error handling
- [ ] T050 [P] Code cleanup and remove any unused imports or components
- [ ] T051 [P] Optimize bundle size by checking for unused ShadCN components
- [ ] T052 [P] Add proper TypeScript prop validation for all components
- [ ] T053 [P] Ensure all components follow single responsibility principle
- [ ] T054 Run performance validation to meet 2-second load time requirement
- [ ] T055 Validate against quickstart.md setup instructions
- [ ] T056 Final responsive design testing across all target devices

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P1 → P2 → P2)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 routing but independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Enhances US1/US2 but independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Improves all components but independently testable

### Within Each User Story

- Components marked [P] can be developed in parallel (different files)
- Page components depend on their required child components
- Routing setup depends on page components being ready
- Styling can be done in parallel with component structure

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Component creation within each story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch component creation for User Story 1 together:
Task: "Create TripCard component in src/components/TripCard.tsx"
Task: "Create TripList component in src/components/TripList.tsx"

# Then sequential integration:
Task: "Create HomePage component using TripList"
Task: "Setup routing in App.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (View Trip List)
4. Complete Phase 4: User Story 2 (View Trip Details)
5. **STOP and VALIDATE**: Test core functionality independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Basic MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Full MVP!)
4. Add User Story 3 → Test independently → Deploy/Demo (Enhanced UX)
5. Add User Story 4 → Test independently → Deploy/Demo (Production Ready)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Trip List)
   - Developer B: User Story 2 (Trip Details)
   - Developer C: User Story 3 (Navigation)
   - Developer D: User Story 4 (Responsive Design)
3. Stories complete and integrate independently

---

## Summary

- **Total Tasks**: 56 tasks across 7 phases
- **Task Count per User Story**:
  - User Story 1 (View Trip List): 8 tasks
  - User Story 2 (View Trip Details): 9 tasks  
  - User Story 3 (Navigate Between Views): 8 tasks
  - User Story 4 (Responsive Design): 9 tasks
- **Parallel Opportunities**: 26 tasks marked [P] can run in parallel within their phases
- **Independent Test Criteria**: Each user story has clear validation steps
- **Suggested MVP Scope**: User Stories 1 & 2 (Trip List + Trip Details) provide core value

## Notes

- No tests included as not explicitly requested in feature specification
- All tasks include specific file paths for immediate execution
- Each user story can be independently completed and tested
- Hardcoded JSON approach simplifies data layer significantly
- ShadCN + Tailwind provide consistent, clean UI components
- Mobile-first responsive design ensures broad device compatibility