# Tasks: Trip Edit Mode

**Feature**: 006-edit-mode-for  
**Input**: Design documents from `/specs/006-edit-mode-for/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in specification - tasks focus on implementation only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, etc.)
- Include exact file paths in descriptions

## Path Conventions
- Web app structure: `frontend/` at repository root
- Paths: `frontend/app/`, `frontend/components/`, `frontend/lib/`

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and environment setup

- [x] **T001** [P] Add Google Maps API key to `.env.local` (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
- [x] **T002** [P] Install react-hook-form: `npm install react-hook-form`
- [x] **T003** [P] Install dnd-kit packages: `npm install @dnd-kit/core @dnd-kit/sortable`
- [x] **T004** [P] Create `frontend/components/edit/` directory structure
- [x] **T005** [P] Create `frontend/lib/services/` directory for external services

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] **T006** [Foundation] Create Plus Code service interface in `frontend/lib/services/plusCodeService.ts`
  - Define `PlusCodeLookupResult` interface
  - Define `lookupPlusCode(plusCode: string)` function signature
  - Implement Google Maps Geocoding API integration
  - Handle all error cases: network, invalid, quota exceeded, multiple results
  - Return structured result with success/error states

- [x] **T007** [Foundation] Create edit mode route in `frontend/app/trip/[tripId]/edit/page.tsx`
  - Server component to load trip data
  - Call `getTripWithRelations(params.tripId)` from existing DB operations
  - Pass data to client component
  - Handle trip not found case

- [x] **T008** [P] [Foundation] Create form type definitions in `frontend/types/editMode.ts`
  - `TripEditFormData` interface
  - `HotelEditFormData` interface
  - `ActivityEditFormData` interface
  - `FlightEditFormData` interface

**Checkpoint**: Foundation ready - user story components can now be built in parallel

---

## Phase 3: User Story 1 - Edit Trip Information (Priority: P1) ✅ COMPLETE

**Goal**: Users can access edit mode, view categorized form, modify trip basics, and save to IndexedDB

**Independent Test**: Click edit button on trip page → form loads with categories → modify trip name/dates/notes → save → navigate away → return to verify changes persisted

### Implementation for User Story 1

- [x] **T009** [US1] Add edit button to trip detail page in `frontend/app/trip/[tripId]/page.tsx`
  - Add "Edit Trip" button with link to `/trip/[tripId]/edit`
  - Style with DaisyUI button component
  - Position prominently (e.g., top-right of page)

- [x] **T010** [US1] Create EditModeLayout component in `frontend/components/edit/EditModeLayout.tsx`
  - Client component ('use client' directive)
  - Accept props: `tripId: string`, `initialData: TripWithRelations`
  - Setup React Hook Form with `useForm<TripEditFormData>`
  - Load initial data from props into form defaultValues
  - Implement save handler calling IndexedDB operations
  - Display success message after save (DaisyUI alert)
  - Display error messages (DaisyUI alert)
  - "Return to View" button navigating to trips home
  - Render CategoryNav component
  - Render active category section conditionally

- [x] **T011** [P] [US1] Create CategoryNav component in `frontend/components/edit/CategoryNav.tsx`
  - Accept props: categories array, activeCategory, onCategoryChange callback
  - Implement DaisyUI tabs component
  - Define categories: Flights, Hotels, Attractions, Notes
  - Manage active category state in parent
  - Mobile-responsive (tabs stack on small screens)

- [x] **T012** [P] [US1] Create NotesSection component in `frontend/components/edit/NotesSection.tsx`
  - Display trip-level notes textarea
  - Integrate with React Hook Form (`register` for notes field)
  - Validation: max 2000 characters
  - Character count display
  - DaisyUI textarea styling

- [x] **T013** [US1] Implement save functionality in EditModeLayout
  - On form submit, extract all form data
  - Call `updateTrip(tripId, updates)` from `lib/db/operations/trips.ts`
  - Handle Result<void, DbError> response
  - Update `updated_at` timestamp
  - Display success toast/alert
  - Stay in edit mode after save (per FR-019)
  - Handle storage quota error (FR-021)

- [x] **T014** [US1] Add loading states to EditModeLayout
  - Loading spinner while trip data loads
  - Loading spinner during save operation
  - Disable save button while saving
  - DaisyUI loading component

**Checkpoint**: User Story 1 complete - Users can edit trip basics and save. Test independently before continuing.

---

## Phase 4: User Story 2 - Add and Manage Places Using Plus Codes (Priority: P1) ✅ COMPLETE

**Goal**: Users can add hotels and attractions via Plus Code lookup with auto-populated details

**Independent Test**: Enter edit mode → click Hotels category → enter Plus Code → verify name/address auto-populate → save → verify new hotel appears in trip view

### Implementation for User Story 2

- [x] **T015** [P] [US2] Create PlusCodeInput component in `frontend/components/edit/PlusCodeInput.tsx`
  - Accept props: value, onChange, onLookupSuccess, onLookupError, disabled
  - Input field for Plus Code (8 characters, validation pattern)
  - "Lookup" button to trigger API call
  - Call `lookupPlusCode()` service on button click
  - Display loading state during API call
  - On success: call onLookupSuccess with {name, address}
  - On error: call onLookupError with error message
  - Display inline error messages
  - Disable input when API quota exhausted (FR-012)
  - Format: 8-character uppercase alphanumeric + plus

- [x] **T016** [US2] Create HotelSection component in `frontend/components/edit/HotelSection.tsx`
  - Display list of existing hotels from trip data
  - Each hotel: read-only name/address (FR-015), editable check-in/out dates, confirmation, phone, notes
  - "Add Hotel" section with PlusCodeInput
  - On Plus Code lookup success, populate hidden fields (name, address)
  - Additional editable fields: check-in date, check-out date, confirmation number, phone, notes
  - Validation: check-in < check-out
  - Delete button per hotel (no confirmation, FR-013)
  - Handle hotel deletion optimistically in UI
  - Integrate with React Hook Form

- [x] **T017** [P] [US2] Create AttractionSection component in `frontend/components/edit/AttractionSection.tsx`
  - Display list of existing attractions (DailyActivity with type='attraction')
  - Each attraction: read-only name/location, editable date, time slot, notes
  - "Add Attraction" section with PlusCodeInput
  - On Plus Code lookup success, populate hidden fields (name, location)
  - Additional editable fields: date, time slot (dropdown), notes
  - Validation: date within trip start/end range (soft warning)
  - Delete button per attraction (no confirmation, FR-013)
  - Handle attraction deletion optimistically in UI
  - Integrate with React Hook Form

- [x] **T018** [US2] Implement hotel create/delete in EditModeLayout save handler
  - Track new hotels added during edit session
  - On save, call `createHotel()` from `lib/db/operations/hotels.ts` for each new hotel
  - Track deleted hotel IDs
  - On save, call `deleteHotel(id)` for each deleted hotel
  - Handle errors from DB operations
  - Update UI on successful save

- [x] **T019** [US2] Implement attraction create/delete in EditModeLayout save handler
  - Track new attractions added during edit session
  - On save, call `createActivity()` from `lib/db/operations/activities.ts` for each new attraction
  - Set type='attraction' for all new activities
  - Track deleted attraction IDs
  - On save, call `deleteActivity(id)` for each deleted attraction
  - Handle errors from DB operations
  - Update UI on successful save

- [x] **T020** [US2] Add error handling for Plus Code lookup failures
  - Network error: display "Network error. Check connection and retry." (FR-010)
  - Invalid code (ZERO_RESULTS): display "Invalid Plus Code. Please check and try again."
  - Quota exceeded (OVER_QUERY_LIMIT): display "API quota exceeded" and disable input (FR-012)
  - Multiple results: automatically use first result (FR-011)
  - Use DaisyUI alert components for error display

**Checkpoint**: User Story 2 complete - Users can add/delete hotels and attractions via Plus Codes. Test independently. ✅ COMPLETE

---

## Phase 5: User Story 3 - Reorder and Delete Places (Priority: P2) ✅ COMPLETE

**Goal**: Users can reorder attractions within their category using drag-and-drop

**Independent Test**: Enter edit mode → Attractions category → drag attraction to new position → save → verify new order persists after reload

### Implementation for User Story 3

- [x] **T021** [US3] Add drag-and-drop to AttractionSection component in `frontend/components/edit/AttractionSection.tsx`
  - Import DndContext, closestCenter from @dnd-kit/core
  - Import SortableContext, verticalListSortingStrategy from @dnd-kit/sortable
  - Wrap attraction list in DndContext and SortableContext
  - Make each attraction item a SortableItem
  - Handle onDragEnd event to update order_index values
  - Recalculate order_index to be sequential (0, 1, 2, ...) after reorder
  - Update form state with new order
  - Visual feedback during drag (dragging styles)

- [x] **T022** [P] [US3] Enable touch sensor for mobile drag-and-drop in AttractionSection
  - Import TouchSensor, useSensor, useSensors from @dnd-kit/core
  - Configure touch sensor for mobile devices
  - Test drag-and-drop works on touch devices
  - Add drag handle icon (visual affordance)

- [x] **T023** [US3] Implement attraction reorder save in EditModeLayout
  - On save, extract updated order_index values from attractions
  - Call `bulkUpdateActivities(updates)` from `lib/db/operations/activities.ts`
  - Pass array of {id, order_index} for all reordered attractions
  - Handle errors from bulk update
  - Ensure sequential indices before save

- [x] **T024** [US3] Add visual feedback for delete operations
  - Fade-out animation when deleting hotel/attraction
  - Optimistic UI update (remove from list before save)
  - Rollback if save fails
  - Confirm deletion in success message

**Checkpoint**: User Story 3 complete - Users can reorder and delete places with smooth UX. Test independently. ✅ COMPLETE

---

## Phase 6: User Story 4 - Add Contextual Notes (Priority: P2)

**Goal**: Users can add notes at trip, hotel, flight, and attraction levels

**Independent Test**: Enter edit mode → add notes at each level → save → view trip → verify notes appear in correct contexts

### Implementation for User Story 4

- [x] **T025** [US4] Add notes field to HotelSection in `frontend/components/edit/HotelSection.tsx`
  - Add textarea for notes per hotel
  - Integrate with React Hook Form
  - Validation: max 2000 characters
  - Character count display
  - DaisyUI textarea styling

- [x] **T026** [US4] Add notes field to AttractionSection in `frontend/components/edit/AttractionSection.tsx`
  - Add textarea for notes per attraction
  - Integrate with React Hook Form
  - Validation: max 2000 characters
  - Character count display
  - DaisyUI textarea styling

- [x] **T027** [P] [US4] Create FlightSection component in `frontend/components/edit/FlightSection.tsx`
  - Display list of existing flights from trip data
  - Each flight: display flight number, airports, times (read-only for now)
  - Add/edit notes field per flight (primary focus)
  - Integrate with React Hook Form
  - Validation: max 2000 characters
  - Character count display
  - DaisyUI styling

- [x] **T028** [US4] Implement hotel notes save in EditModeLayout
  - Extract notes from hotel form fields
  - Call `updateHotel(id, {notes})` for hotels with changed notes
  - Handle errors from update operations
  - Include in success message

- [x] **T029** [US4] Implement attraction notes save in EditModeLayout
  - Extract notes from attraction form fields
  - Call `updateActivity(id, {notes})` for attractions with changed notes
  - Handle errors from update operations
  - Include in success message

- [x] **T030** [US4] Implement flight notes save in EditModeLayout
  - Extract notes from flight form fields
  - Call `updateFlight(id, {notes})` from `lib/db/operations/flights.ts`
  - Handle errors from update operations
  - Include in success message

**Checkpoint**: User Story 4 complete - Users can add notes at all levels. Test independently.

---

## Phase 7: User Story 5 - Restricted Place Editing (Priority: P3)

**Goal**: Prevent editing of auto-populated fields (name, address) to ensure data accuracy

**Independent Test**: Enter edit mode → attempt to edit hotel name or attraction name → verify fields are read-only or disabled

### Implementation for User Story 5

- [x] **T031** [US5] Make auto-populated fields read-only in HotelSection
  - Name field: disabled or read-only if populated from API
  - Address field: disabled or read-only if populated from API
  - Visual indication (grayed out, lock icon)
  - Tooltip explaining why fields are read-only
  - Guidance text: "To change, delete and re-add with correct Plus Code"

- [x] **T032** [US5] Make auto-populated fields read-only in AttractionSection
  - Name field: disabled or read-only if populated from API
  - Location field: disabled or read-only if populated from API
  - Visual indication (grayed out, lock icon)
  - Tooltip explaining why fields are read-only
  - Guidance text: "To change, delete and re-add with correct Plus Code"

- [x] **T033** [US5] Add visual distinction between editable and read-only fields
  - Use DaisyUI disabled input styles
  - Add lock icon for read-only fields
  - Different background color for read-only fields
  - Clear visual hierarchy

**Checkpoint**: User Story 5 complete - Data integrity enforced through UI constraints. Test independently.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] **T034** [P] [Polish] Add keyboard shortcuts in EditModeLayout
  - Ctrl+S / Cmd+S to save
  - Esc to cancel/return to view
  - Register keyboard event listeners
  - Show keyboard shortcut hints in UI

- [ ] **T035** [P] [Polish] Mobile responsive testing and fixes
  - Test on mobile viewport (375px width)
  - Ensure tabs stack properly
  - Test drag-and-drop on touch devices
  - Fix any layout issues
  - Test form input usability on mobile

- [ ] **T036** [P] [Polish] Add loading spinners for all async operations
  - Plus Code lookup: spinner in PlusCodeInput
  - Form save: spinner on save button
  - Page load: skeleton screens
  - Use DaisyUI loading components

- [ ] **T037** [P] [Polish] Improve error message clarity
  - Consistent error message format
  - User-friendly language (avoid technical jargon)
  - Actionable guidance (e.g., "Try again" button)
  - Auto-dismiss success messages after 3 seconds

- [ ] **T038** [P] [Polish] Add accessibility improvements
  - ARIA labels for all form fields
  - ARIA labels for drag handles
  - Keyboard navigation for tabs
  - Focus management on errors
  - Screen reader announcements for success/error

- [ ] **T039** [Polish] Performance optimization
  - Memoize heavy computations
  - Optimize re-renders in form components
  - Test with 50+ places per category (SC-008)
  - Lazy load category sections
  - Debounce API calls if needed

- [ ] **T040** [Polish] Code cleanup and documentation
  - Add JSDoc comments to components
  - Add TypeScript doc comments to interfaces
  - Clean up console.logs
  - Remove unused imports
  - Format code with Prettier

- [ ] **T041** [Polish] Run quickstart.md validation
  - Follow quickstart.md manual testing checklist
  - Verify all 10 test scenarios pass
  - Test on Chrome, Firefox, Safari
  - Test on mobile device
  - Document any issues found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel if team capacity allows
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - NO dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - NO dependencies on other stories (but extends US1 UI)
- **User Story 3 (P2)**: Can start after Foundational - depends on US2 (AttractionSection component must exist)
- **User Story 4 (P2)**: Can start after Foundational - depends on US2 (HotelSection, AttractionSection must exist)
- **User Story 5 (P3)**: Can start after Foundational - depends on US2 (HotelSection, AttractionSection must exist)

### Within Each User Story

**General Pattern**:
1. UI components (marked [P] if independent)
2. Integration with form state
3. Save handler implementation
4. Error handling
5. Visual polish

**Parallel Opportunities Within Stories**:
- All [P] marked tasks can run in parallel within the same story
- Example US2: PlusCodeInput, HotelSection, and AttractionSection components can be built simultaneously

### Parallel Opportunities Across Stories

Once Foundational phase completes:
- **US1 and US2 can start in parallel** (US2 extends US1 but doesn't block)
- After US2 completes, **US3, US4, and US5 can all run in parallel**

---

## Parallel Example: User Story 2

```bash
# These tasks can all start simultaneously after Foundation is complete:

Task T015: "Create PlusCodeInput component"
Task T016: "Create HotelSection component"
Task T017: "Create AttractionSection component"

# Then these integrate together:
Task T018: "Implement hotel create/delete in save handler"
Task T019: "Implement attraction create/delete in save handler"
Task T020: "Add error handling for Plus Code lookup"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T008) - CRITICAL
3. Complete Phase 3: User Story 1 (T009-T014)
4. Complete Phase 4: User Story 2 (T015-T020)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready - **This is your MVP!**

**MVP Scope**: Basic trip editing + Plus Code place management  
**Estimated Time**: ~2-3 days for 1 developer  
**Value Delivered**: Core editing functionality immediately usable

### Incremental Delivery

1. **Foundation** (Phase 1-2) → Ready for features
2. **MVP Release** (Phase 3-4) → Basic editing + place management
3. **Enhancement 1** (Phase 5) → Add reordering capability
4. **Enhancement 2** (Phase 6) → Add contextual notes
5. **Enhancement 3** (Phase 7) → Enforce data integrity constraints
6. **Polish Release** (Phase 8) → Professional UX improvements

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With 2 developers after Foundation completes:

**Developer A**:
- Phase 3: User Story 1 (T009-T014)
- Phase 5: User Story 3 (T021-T024)
- Phase 7: User Story 5 (T031-T033)

**Developer B**:
- Phase 4: User Story 2 (T015-T020)
- Phase 6: User Story 4 (T025-T030)
- Phase 8: Polish (T034-T041)

**Timeline**: Both developers work in parallel, reducing total time by ~40%

---

## Task Summary

**Total Tasks**: 41

**Task Count by Phase**:
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 3 tasks (CRITICAL - blocks everything)
- Phase 3 (US1): 6 tasks
- Phase 4 (US2): 6 tasks
- Phase 5 (US3): 4 tasks
- Phase 6 (US4): 6 tasks
- Phase 7 (US5): 3 tasks
- Phase 8 (Polish): 8 tasks

**Parallel Opportunities**: 18 tasks marked [P] can run in parallel

**MVP Scope**: Phases 1-4 (20 tasks) = Core value delivery

**Independent Test Criteria**:
- US1: Edit trip basics, save, verify persistence
- US2: Add place via Plus Code, auto-populate, save, verify appears
- US3: Drag to reorder, save, verify order persists
- US4: Add notes at each level, save, verify notes display correctly
- US5: Attempt to edit read-only fields, verify prevented

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label (US1-US5) maps task to specific user story
- Each user story is independently completable and testable
- Foundation phase (T006-T008) is CRITICAL - nothing else can start until complete
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group of tasks
- Follow simplicity-first principle from constitution
- No tests included - not requested in specification
