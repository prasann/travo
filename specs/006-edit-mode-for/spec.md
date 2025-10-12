# Feature Specification: Trip Edit Mode

**Feature Branch**: `006-edit-mode-for`  
**Created**: October 12, 2025  
**Status**: Draft  
**Input**: User description: "Edit mode for trips"

## Clarifications

### Session 2025-10-12

- Q: Should the system warn users about unsaved changes when they attempt to navigate away from edit mode? → A: No - Allow silent navigation, changes are lost without warning
- Q: When Plus Code lookup fails due to network issues, how should the system respond? → A: Show error message, allow retry with same Plus Code
- Q: How does the system handle concurrent edits if the same trip is open in multiple browser tabs? → A: Last write wins (no conflict detection or resolution)
- Q: Should deleting a place require confirmation? → A: No confirmation required (immediate delete, reversible by not saving)
- Q: How does the system behave if Google Maps API quota is exhausted? → A: Show error message, block further place additions until quota available

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Trip Information (Priority: P1)

Users need to modify their trip details without disrupting the timeline view, which is the most frequently used page. The edit functionality should be easily accessible from the trip page but separate from the viewing experience.

**Why this priority**: Core functionality that enables users to maintain accurate trip information as plans change. Essential for making the app useful beyond initial trip creation.

**Independent Test**: Can be fully tested by clicking the edit button on a trip page, modifying any trip detail, saving changes, and verifying persistence by navigating away and returning to the trip.

**Acceptance Scenarios**:

1. **Given** a user is viewing a trip page, **When** they click the edit button, **Then** they enter edit mode showing a form with categorized sections (flights, hotels, attractions, notes)
2. **Given** a user is in edit mode, **When** they modify trip information and click save, **Then** changes are persisted to IndexedDB and a success message is displayed
3. **Given** a user successfully saves changes, **When** they choose to switch to view mode, **Then** they are redirected to the trips home page with updated information visible

---

### User Story 2 - Add and Manage Places Using Plus Codes (Priority: P1)

Users can add new places to their trip by entering Google Plus Codes. The system automatically retrieves and populates place details (name, address) from Google Maps API, eliminating manual data entry.

**Why this priority**: Primary mechanism for expanding trip content. Plus code integration provides a unique, location-first approach that reduces friction in adding places.

**Independent Test**: Can be fully tested by entering a valid Plus Code in edit mode, verifying that place details auto-populate, saving the addition, and confirming the new place appears in the trip view.

**Acceptance Scenarios**:

1. **Given** a user is in edit mode for a trip, **When** they enter a valid Plus Code for a new place, **Then** the system calls Google Maps API and auto-fills place name, address, and location details
2. **Given** a user has added a new place, **When** they save the trip, **Then** the new place is persisted to IndexedDB and appears in the appropriate category
3. **Given** an invalid Plus Code is entered, **When** the user attempts to add it, **Then** an error message explains the issue and prevents saving

---

### User Story 3 - Reorder and Delete Places (Priority: P2)

Users can reorganize their trip by reordering places within categories and removing places that are no longer part of the trip.

**Why this priority**: Provides flexibility in trip planning but not critical for initial value. Users can work around this by recreating entries, though it's not ideal.

**Independent Test**: Can be fully tested by dragging a place to a new position within its category, verifying the order persists after save, or deleting a place and confirming it no longer appears after save.

**Acceptance Scenarios**:

1. **Given** a user is in edit mode viewing a category with multiple places, **When** they reorder places, **Then** the new order is reflected immediately and persisted on save
2. **Given** a user selects a place to delete, **When** they confirm deletion, **Then** the place is removed from the trip and the change is persisted to IndexedDB
3. **Given** a user deletes the only place in a category, **When** they save, **Then** the category shows as empty in view mode

---

### User Story 4 - Add Contextual Notes (Priority: P2)

Users can add notes at multiple levels: trip-wide notes, and notes specific to hotels, flights, and attractions. These notes provide context and reminders for trip details.

**Why this priority**: Enhances trip utility but not essential for basic functionality. Users can work around this by keeping notes elsewhere initially.

**Independent Test**: Can be fully tested by adding notes at different levels (trip, hotel, flight, attraction), saving, and verifying notes appear correctly in view mode at each level.

**Acceptance Scenarios**:

1. **Given** a user is in edit mode, **When** they add a note at trip level, **Then** the note is associated with the entire trip and visible in the trip overview
2. **Given** a user is editing a specific hotel entry, **When** they add a hotel-specific note, **Then** the note is associated only with that hotel and visible when viewing that hotel
3. **Given** notes exist at multiple levels, **When** the user views the trip, **Then** each note appears in its appropriate context without confusion

---

### User Story 5 - Restricted Place Editing (Priority: P3)

While users can add, delete, and reorder places, they cannot edit certain place details like name and address that come from Google Maps API. This ensures data accuracy and consistency.

**Why this priority**: This is a constraint rather than a feature. It defines what users cannot do, preventing potential data quality issues.

**Independent Test**: Can be tested by attempting to modify auto-populated place fields in edit mode and confirming they are read-only or not editable.

**Acceptance Scenarios**:

1. **Given** a user is viewing a place in edit mode, **When** they attempt to modify the place name or address, **Then** these fields are read-only or not editable
2. **Given** a user wants to correct place details, **When** they realize fields are not editable, **Then** clear guidance indicates they should delete and re-add the place with the correct Plus Code

---

### Edge Cases

- When a Plus Code lookup fails due to network issues, system displays error message and allows user to retry with the same Plus Code
- When the same trip is open in multiple browser tabs with concurrent edits, last write wins (no conflict detection)
- When a user navigates away from edit mode without saving changes, all unsaved changes are silently discarded without warning
- When Plus Codes return ambiguous or multiple results, system uses the first result returned by Google Maps API
- When IndexedDB storage quota is exceeded, system displays error message and prevents saving until space is available
- When Google Maps API quota is exhausted, system displays error message and blocks further place additions until quota is available

## Requirements *(mandatory)*

### Functional Requirements

**Edit Mode Access & Navigation**

- **FR-001**: System MUST provide an edit button on the trip page that transitions users to edit mode
- **FR-002**: Edit mode MUST display trip information in a form-based interface organized by categories (flights, hotels, attractions, notes)
- **FR-003**: System MUST provide a way to switch from edit mode back to view mode
- **FR-004**: Switching to view mode MUST redirect users to the trips home page
- **FR-005**: Timeline view MUST remain unchanged and not be disturbed by edit mode functionality
- **FR-006**: System MUST allow navigation away from edit mode without warning, discarding unsaved changes silently

**Place Management**

- **FR-007**: System MUST allow users to add new places by entering Google Plus Codes
- **FR-008**: System MUST integrate with Google Maps API to retrieve place details (name, address, location) when a Plus Code is entered
- **FR-009**: System MUST auto-populate place fields with data retrieved from Google Maps API
- **FR-010**: When Plus Code lookup fails, system MUST display error message and allow retry with same Plus Code
- **FR-011**: When Plus Code returns multiple results, system MUST use the first result from Google Maps API
- **FR-012**: When Google Maps API quota is exhausted, system MUST display error and block further place additions
- **FR-013**: Users MUST be able to delete places from their trips without confirmation
- **FR-014**: Users MUST be able to reorder places within their respective categories
- **FR-015**: System MUST prevent users from editing auto-populated place names and addresses
- **FR-016**: System MUST not provide autocomplete functionality for place entry (Plus Code only)

**Notes Management**

- **FR-026**: System MUST allow users to add notes at the trip level
- **FR-027**: System MUST allow users to add notes at the hotel level
- **FR-028**: System MUST allow users to add notes at the flight level
- **FR-029**: System MUST allow users to add notes at the attraction level
- **FR-030**: System MUST associate notes with the correct entity level and display them appropriately in view mode

**Data Persistence**

- **FR-017**: System MUST persist all changes (place additions, deletions, reordering, notes) to IndexedDB when user saves
- **FR-018**: System MUST display a success message after successfully saving changes
- **FR-019**: System MUST remain in edit mode after successful save, allowing additional modifications
- **FR-020**: System MUST retrieve persisted data from IndexedDB when users return to view trip details
- **FR-021**: When IndexedDB storage quota is exceeded, system MUST display error and prevent saving
- **FR-022**: When concurrent edits occur across multiple browser tabs, last write wins without conflict detection

**Categorization & Organization**

- **FR-023**: Edit mode screen MUST categorize trip components into sections: flights, hotels, attractions, notes
- **FR-024**: Users MUST be able to click on each category to edit information within that category
- **FR-025**: Changes within each category MUST be independently saveable

### Key Entities

- **Trip**: Represents a complete trip with associated flights, hotels, attractions, and trip-level notes
- **Place**: Generic entity representing a location (hotel, attraction) with Plus Code, name, address, and location details retrieved from Google Maps API
- **Flight**: Travel segment with flight-specific details and optional notes
- **Hotel**: Accommodation with location details and optional notes
- **Attraction**: Point of interest with location details and optional notes
- **Note**: Contextual information associated with a trip, hotel, flight, or attraction
- **Plus Code**: Google Plus Code identifier used to add new places

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access edit mode for any trip within 2 clicks from the trip page
- **SC-002**: Users can add a new place using a Plus Code in under 30 seconds (assuming valid Plus Code and network availability)
- **SC-003**: Place details from Google Maps API populate within 2 seconds of entering a valid Plus Code
- **SC-004**: Users can save trip modifications within 3 seconds, with confirmation message displayed
- **SC-005**: 100% of saved changes persist correctly in IndexedDB and are visible when users return to the trip
- **SC-006**: Users can successfully complete a full edit cycle (enter edit mode, modify trip, save, return to view mode) in under 2 minutes
- **SC-007**: Edit mode functionality does not impact timeline view performance or layout
- **SC-008**: System handles at least 50 places per trip category without performance degradation
