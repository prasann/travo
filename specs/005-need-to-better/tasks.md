---
description: "Implementation tasks for Enhanced Trip Data Model & Itinerary Management"
---

# Tasks: Enhanced Trip Data Model & Itinerary Management

**Feature Branch**: `005-need-to-better`  
**Input**: Design documents from `/specs/005-need-to-better/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, or SETUP/FOUND/POLISH)
- File paths use `frontend/` prefix per project structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [X] T001 [P] Create `/frontend/data/trips/` directory for individual trip JSON files
- [X] T002 [P] Create placeholder `/frontend/lib/dateTime.ts` file
- [X] T003 [P] Create placeholder `/frontend/lib/tripLoader.ts` file
- [X] T004 [P] Create placeholder `/frontend/components/TripTimeline.tsx` file
- [X] T005 [P] Create placeholder `/frontend/components/FlightCard.tsx` file
- [X] T006 [P] Create placeholder `/frontend/components/HotelCard.tsx` file
- [X] T007 [P] Create placeholder `/frontend/components/ActivityCard.tsx` file
- [X] T008 [P] Create placeholder `/frontend/components/RestaurantList.tsx` file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Update TypeScript interfaces in `/frontend/types/index.ts` with Trip, Flight, FlightLeg, Hotel, DailyActivity, RestaurantRecommendation, TripIndex, TripIndexFile interfaces from `contracts/interfaces.ts`
- [X] T010 [P] Add type guards (isFlight, isHotel, isActivity) and utility functions (getItemTimestamp, getItemType) to `/frontend/types/index.ts`
- [X] T011 [P] Implement timezone-aware datetime formatting utilities in `/frontend/lib/dateTime.ts` (formatDateTime, formatTime, formatDate functions)
- [X] T012 Implement chronological sorting logic in `/frontend/lib/utils.ts` (getTimestamp, sortChronologically functions handling Flight, Hotel, DailyActivity with timestamp + order_index fallback)
- [X] T013 Implement trip loader functions in `/frontend/lib/tripLoader.ts` (loadTripIndex, loadTrip functions for JSON file reading)
- [X] T014 Create new mock trip data files in `/frontend/data/trips/` directory (2-3 sample trips with flights, hotels, activities, restaurants) and generate `/frontend/data/trip-index.json` with trip summaries

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Daily Itinerary with Transportation and Accommodation (Priority: P1) 🎯 MVP

**Goal**: Display chronologically-ordered timeline showing flights, hotels, and activities with all relevant details

**Independent Test**: View a trip detail page and verify flights, hotels, and daily activities display in chronological order with times, confirmation numbers, and addresses

### Implementation for User Story 1

- [ ] T015 [P] [US1] Implement FlightCard component in `/frontend/components/FlightCard.tsx` displaying airline, flight_number, departure/arrival times with timezones, locations, confirmation_number, notes, and connection leg count
- [ ] T016 [P] [US1] Implement HotelCard component in `/frontend/components/HotelCard.tsx` displaying name, address, check-in/check-out times with timezones, confirmation_number, phone, notes
- [ ] T017 [P] [US1] Implement ActivityCard component in `/frontend/components/ActivityCard.tsx` displaying name, optional image, start_time with timezone, duration, address, notes, plus_code
- [ ] T018 [US1] Implement TripTimeline component in `/frontend/components/TripTimeline.tsx` that combines flights, hotels, activities, sorts chronologically using sortChronologically utility, and renders appropriate card component per item type
- [ ] T019 [US1] Update trip detail page `/frontend/app/trip/[tripId]/page.tsx` to load trip using loadTrip utility and render TripTimeline component with trip data
- [ ] T020 [US1] Update trip detail page to display trip name, description, start/end dates using formatDate utility from dateTime.ts
- [ ] T021 [US1] Update TripCard component in `/frontend/components/TripCard.tsx` to display trip summary from TripIndex (name, dates) for list view
- [ ] T022 [US1] Update trip list page `/frontend/app/page.tsx` to load trip-index.json using loadTripIndex utility and render TripCard components
- [ ] T023 [US1] Add empty state handling to TripTimeline component when no flights, hotels, or activities exist
- [ ] T024 [US1] Test chronological ordering with sample trip containing overnight flight (departure/arrival different dates), multi-leg flight, hotel overlapping with activities, and same-day activities with different order_index values
- [ ] T025 [US1] Verify timezone-aware time display shows correct local times with timezone abbreviations (e.g., "10:30 AM PST" vs "2:30 PM JST")
- [ ] T026 [US1] Test optional field handling: trip with flights only, activities only, hotels only, and mixed combinations with missing optional fields (no confirmation numbers, no times, etc.)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can view complete trip timelines with all logistics

---

## Phase 4: User Story 2 - Manage Restaurant Recommendations per City (Priority: P2)

**Goal**: Display restaurant recommendations organized by city, separate from daily itinerary timeline

**Independent Test**: Add restaurant recommendations to a trip and verify they appear separately from scheduled activities with all details (name, cuisine, notes)

### Implementation for User Story 2

- [ ] T027 [US2] Implement RestaurantList component in `/frontend/components/RestaurantList.tsx` that groups restaurants by city and displays name, cuisine_type, address, phone, website, notes for each
- [ ] T028 [US2] Add RestaurantList component to trip detail page `/frontend/app/trip/[tripId]/page.tsx` below timeline section, conditionally rendered when trip.restaurants exists and has items
- [ ] T029 [US2] Style restaurant section with clear visual separation from timeline (e.g., separate heading "Restaurant Recommendations", distinct card styling)
- [ ] T030 [US2] Test restaurant display with multi-city trip: verify restaurants are grouped by city, each city has clear heading, and restaurants within city are listed
- [ ] T031 [US2] Test optional restaurant fields: restaurants with minimal data (name only) and full data (all fields populated) both display correctly
- [ ] T032 [US2] Verify restaurant section does not appear when trip.restaurants is empty or undefined

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can view timeline and separate restaurant recommendations

---

## Phase 5: User Story 3 - View Place Images and Map Integration Readiness (Priority: P3)

**Goal**: Display images for sightseeing places and ensure location data is structured for future map integration

**Independent Test**: View activities with images and verify images display correctly; inspect activity data to confirm plus_code or coordinates are present for map readiness

### Implementation for User Story 3

- [ ] T033 [US3] Update ActivityCard component in `/frontend/components/ActivityCard.tsx` to display image_url with proper loading states (loading placeholder, error fallback to no-image state)
- [ ] T034 [US3] Add image optimization attributes to ActivityCard img tags (lazy loading, responsive sizing, alt text with activity name)
- [ ] T035 [US3] Update ActivityCard to display plus_code prominently when available (small text below activity details)
- [ ] T036 [US3] Test image loading with various scenarios: valid image URLs, broken URLs (404), missing image_url (undefined), slow-loading images
- [ ] T037 [US3] Verify plus_code display: activities with plus_code show code, activities without plus_code don't show empty field
- [ ] T038 [US3] Create sample trip data with activities containing Google Maps image URLs and plus_codes to validate full US3 functionality
- [ ] T039 [US3] Document location data format in quickstart.md for future Google Maps API integration (plus_code format, coordinate format if added)

**Checkpoint**: All user stories should now be independently functional - timeline, restaurants, and images/location data all working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T040 [P] [POLISH] Add responsive layout testing: verify timeline, cards, and restaurant list work on mobile (320px), tablet (768px), and desktop (1024px+) viewports
- [ ] T041 [P] [POLISH] Add loading states to trip detail page while loadTrip fetches data (DaisyUI skeleton or spinner)
- [ ] T042 [P] [POLISH] Add error handling for failed trip loads (404, network errors) with user-friendly error messages
- [ ] T043 [P] [POLISH] Update README.md in `/frontend/README.md` with feature overview, new components list, and data structure changes
- [ ] T044 [P] [POLISH] Add JSDoc comments to all utility functions in `/frontend/lib/dateTime.ts`, `/frontend/lib/utils.ts`, `/frontend/lib/tripLoader.ts`
- [ ] T045 [POLISH] Verify constitution compliance: offline-first (no network dependencies except image URLs), privacy-friendly (plus codes used), minimalist UX (no clutter, optional fields hidden when empty)
- [ ] T046 [POLISH] Accessibility audit: check keyboard navigation through timeline, screen reader compatibility for card components, proper semantic HTML, color contrast
- [ ] T047 [P] [POLISH] Add TypeScript strict mode checks: verify no `any` types, all props typed, no type assertions without justification
- [ ] T048 [POLISH] Code cleanup: remove old Place interface references if no longer used, clean up deprecated trips.json reference
- [ ] T049 [POLISH] Run quickstart.md validation: follow all steps in quickstart.md to ensure developer onboarding works correctly
- [ ] T050 [POLISH] Final testing checklist from quickstart.md: verify all test items pass (trip list loads, timeline displays, timezones correct, optional fields handled, etc.)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Adds to same trip detail page as US1 but independent functionality
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Enhances ActivityCard from US1 but doesn't break US1 if not implemented

### Within Each Phase

**Phase 1 (Setup)**:
- All tasks T001-T008 can run in parallel [P]

**Phase 2 (Foundational)**:
- T009 must complete first (type definitions needed by everything else)
- T010, T011 can run in parallel after T009
- T012 depends on T009, T010 (needs types and timestamp extraction)
- T013 depends on T009 (needs Trip, TripIndex types)
- T014 depends on T009 (create mock trip data with new structure)

**Phase 3 (User Story 1)**:
- T015, T016, T017 can run in parallel [P] (different card components)
- T018 depends on T015, T016, T017 (timeline needs all cards)
- T019 depends on T018 (trip detail page renders timeline)
- T020 can run in parallel with T019 (same page, different sections)
- T021 can run in parallel with T019, T020 (different component)
- T022 depends on T021 (list page renders trip cards)
- T023 depends on T018 (enhances timeline component)
- T024, T025, T026 can run after T022 (testing tasks)

**Phase 4 (User Story 2)**:
- T027 (restaurant list component) can start immediately after Foundational
- T028 depends on T027 (integrate component into page)
- T029 depends on T028 (styling enhancement)
- T030, T031, T032 can run after T029 (testing tasks)

**Phase 5 (User Story 3)**:
- T033 (add images to ActivityCard) can start immediately after Foundational (or after T017 if sequential)
- T034 depends on T033 (enhance image display)
- T035 depends on T033 (add plus_code display)
- T036, T037 can run after T035 (testing tasks)
- T038, T039 can run in parallel [P] after T035 (sample data and docs)

**Phase 6 (Polish)**:
- Most polish tasks can run in parallel [P] (T040, T041, T042, T043, T044, T047)
- T045, T046 require all user stories complete
- T048 can run after T014 (after data files created)
- T049, T050 should run last (final validation)

### Parallel Opportunities

**Setup Phase**: All 8 tasks can run together (create directories and placeholder files)

**Foundational Phase**: After T009 completes, T010 and T011 can run together

**User Story 1 Cards**: Launch T015 (FlightCard), T016 (HotelCard), T017 (ActivityCard) together
```bash
Task: "Implement FlightCard component in /frontend/components/FlightCard.tsx"
Task: "Implement HotelCard component in /frontend/components/HotelCard.tsx"
Task: "Implement ActivityCard component in /frontend/components/ActivityCard.tsx"
```

**Cross-Story Parallel**: After Foundational complete, all three user stories can be worked on simultaneously by different developers:
- Developer A: Phase 3 (US1) - Timeline implementation
- Developer B: Phase 4 (US2) - Restaurant recommendations
- Developer C: Phase 5 (US3) - Images and location data

**Polish Phase Parallel**: Launch documentation, testing, and code quality tasks together
```bash
Task: "Add responsive layout testing"
Task: "Add loading states to trip detail page"
Task: "Add error handling for failed trip loads"
Task: "Update README.md"
Task: "Add JSDoc comments to utility functions"
```

---

## Implementation Strategy

**MVP First (User Story 1 Only)**

**Fastest path to working timeline view:**

1. Complete Phase 1: Setup (T001-T008) → ~15 minutes
2. Complete Phase 2: Foundational (T009-T014) → ~2-3 hours (includes creating mock data)
3. Complete Phase 3: User Story 1 (T015-T026) → ~4-5 hours
4. **STOP and VALIDATE**: Test User Story 1 independently with sample trip data
5. Deploy/demo if ready → Users can now view trip timelines!

**Estimated total**: 1 day of focused work for MVP

### Incremental Delivery

**Add value progressively:**

1. **Foundation** (Phase 1 + 2): Setup + types + migration → Can load trip data
2. **MVP** (Phase 3): Add User Story 1 → Timeline view working → **Deploy/Demo**
3. **Enhance** (Phase 4): Add User Story 2 → Restaurant recommendations → **Deploy/Demo**
4. **Polish** (Phase 5): Add User Story 3 → Images and map readiness → **Deploy/Demo**
5. **Quality** (Phase 6): Polish and testing → **Final Release**

Each deploy/demo adds value without breaking previous functionality.

### Parallel Team Strategy

**With 3 developers:**

1. **Week 1**: All devs work together on Phase 1 + 2 (Setup + Foundational) → Foundation ready
2. **Week 2**: Once Foundational done, split work:
   - **Developer A**: Phase 3 (US1) - Timeline implementation
   - **Developer B**: Phase 4 (US2) - Restaurant recommendations  
   - **Developer C**: Phase 5 (US3) - Images and location data
3. **Week 3**: All devs work on Phase 6 (Polish) together
4. Stories integrate independently, minimal merge conflicts (different components/files)

---

## Verification Checkpoints

### After Phase 2 (Foundational)

- [ ] TypeScript compiles without errors
- [ ] All new type exports available from `/frontend/types/index.ts`
- [ ] Mock trip data files created in `/frontend/data/trips/` directory
- [ ] trip-index.json contains all sample trips
- [ ] loadTripIndex and loadTrip utilities work with new file structure

### After Phase 3 (User Story 1)
- [ ] Trip list page displays all trips from trip-index.json
- [ ] Clicking trip loads individual trip from trips/{id}.json
- [ ] Timeline shows flights, hotels, activities in chronological order
- [ ] Same-day activities respect order_index
- [ ] Timezone-aware times display correctly (AM/PM with timezone abbreviation)
- [ ] Optional fields don't cause errors when missing
- [ ] Empty trip displays "No itinerary items yet" message

### After Phase 4 (User Story 2)
- [ ] Restaurant section appears below timeline when restaurants exist
- [ ] Restaurants grouped by city with clear headings
- [ ] Restaurant cards show all available fields (name, cuisine, notes)
- [ ] Restaurant section hidden when no restaurants in trip

### After Phase 5 (User Story 3)
- [ ] Activity images display when image_url provided
- [ ] Broken image URLs show graceful fallback (no broken image icon)
- [ ] Plus codes display when available
- [ ] Image lazy loading works (images load as user scrolls)

### After Phase 6 (Polish)
- [ ] Responsive layout works on mobile, tablet, desktop
- [ ] Loading states display while fetching trip data
- [ ] Error states display for network failures
- [ ] All quickstart.md test items pass
- [ ] Performance meets success criteria (3 second load, smooth rendering)
- [ ] Accessibility audit passes (keyboard nav, screen readers)

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability (US1, US2, US3, SETUP, FOUND, POLISH)
- **File paths** use `frontend/` prefix per project structure (no backend changes)
- Each user story is **independently completable and testable** without blocking others
- Commit after each task or logical group for easier rollback
- Stop at any checkpoint to validate story independently before proceeding
- Constitution compliance verified in T047: offline-first, privacy-friendly, minimalist UX, code simplicity
- Success criteria from spec.md verified in T048, T049, T054

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks (all parallel)
- **Phase 2 (Foundational)**: 6 tasks (sequential dependencies, no migration)
- **Phase 3 (User Story 1)**: 12 tasks (3 parallel cards + sequential integration + 3 tests)
- **Phase 4 (User Story 2)**: 6 tasks (sequential with 3 tests)
- **Phase 5 (User Story 3)**: 7 tasks (sequential with 4 tests + 2 parallel docs)
- **Phase 6 (Polish)**: 11 tasks (mostly parallel quality tasks, no performance testing)

**Total**: 50 tasks (reduced from 54 by removing migration and performance tasks)

**Critical Path** (minimum for MVP):
- Phase 1: 8 tasks
- Phase 2: 6 tasks  
- Phase 3: 12 tasks
- **MVP Total**: 26 tasks

**Full Feature** (all user stories):
- All 50 tasks
