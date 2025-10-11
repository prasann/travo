# Feature Specification: Enhanced Trip Data Model & Itinerary Management

**Feature Branch**: `005-need-to-better`  
**Created**: 2025-10-11  
**Status**: Draft  
**Input**: User description: "need to better the trip data model to hold more information and to design the trip page to accomodate these new information #file:requirements.txt explains the newer attributes. need to update the data model, update mock json data and also update the Trip UI to show all these information. JSON will bcome big, so let's have 1 json per trip."

## Clarifications

### Session 2025-10-11

- Q: When storing activity time of visit and duration (FR-011), what level of time precision is required? → A: Specific times - activities have exact start times (e.g., "10:30 AM") and durations (e.g., "2 hours")
- Q: For sightseeing place images (FR-012), what is the source and format of these images? → A: Image URLs - store external URLs pointing to web-hosted images (specifically Google Maps images)
- Q: For multi-leg flights with connections, how should layovers/connections be represented? → A: Flight with legs - one flight object containing an array of leg segments
- Q: How should the system handle timezone differences for international flights? → A: Timezone-aware times - store times with explicit timezone identifiers (e.g., "10:30 AM PST")
- Q: When a trip has no hotel bookings (staying with friends/family), how should accommodation be represented? → A: Optional hotels - hotel data is simply omitted/null for those dates with no UI accommodation section shown
- Q: Should flights, hotels, and places be strictly required or optional in the data model? → A: All optional - flights, hotels, and places should be optional to allow flexible trip planning
- Q: How should chronological ordering be handled across different types of items (flights, hotels, activities)? → A: Time-based with explicit order - items display chronologically by timestamp; activities have explicit order_index for same-day sequencing; time can be optional for some places

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Daily Itinerary with Transportation and Accommodation (Priority: P1)

As a traveler, I want to see a day-by-day itinerary that shows my flights, hotel check-ins/check-outs, and planned activities so I can understand my daily schedule and logistics at a glance.

**Why this priority**: Core value proposition - enables users to see complete trip logistics organized by timeline. Without this, the app is just a place list.

**Independent Test**: Can be fully tested by viewing a trip detail page and verifying that flight times, hotel stays, and daily activities are displayed in chronological order with all relevant details (times, confirmation numbers, addresses).

**Acceptance Scenarios**:

1. **Given** a trip with multiple cities, **When** I view the trip details, **Then** I see each day's schedule showing departure/arrival flights with times and flight numbers
2. **Given** a multi-city trip, **When** I view accommodation details, **Then** I see hotel name, address, check-in/check-out times, and reservation ID for each city
3. **Given** a trip with daily activities, **When** I view a specific date, **Then** I see all sightseeing activities and places planned for that day in order
4. **Given** a trip starting from home, **When** I view the trip, **Then** I see the initial departure flight from home and the return flight back home

---

### User Story 2 - Manage Restaurant Recommendations per City (Priority: P2)

As a traveler planning meals, I want to maintain a list of recommended restaurants for each city I visit so I have dining options handy without committing them to my daily schedule.

**Why this priority**: Adds practical value for meal planning but doesn't block core itinerary functionality. Users can still plan trips without restaurant lists.

**Independent Test**: Can be tested by adding/viewing restaurant recommendations for a city and verifying they appear separately from scheduled activities.

**Acceptance Scenarios**:

1. **Given** a trip to multiple cities, **When** I view city-specific information, **Then** I see a list of restaurant recommendations for that city
2. **Given** restaurant recommendations, **When** I view details, **Then** I see restaurant name, type of cuisine, and any notes about specialties or booking requirements
3. **Given** recommendations are not part of daily itinerary, **When** I view my daily schedule, **Then** restaurant recommendations appear separately as reference information

---

### User Story 3 - View Place Images and Map Integration Readiness (Priority: P3)

As a visual planner, I want to see images of sightseeing places and have location information structured for future map integration so I can better visualize destinations and navigate during my trip.

**Why this priority**: Enhances user experience but not essential for basic trip planning. Can be added after core functionality is working.

**Independent Test**: Can be tested by viewing place details and verifying images are displayed and location data (plus codes/coordinates) is present for map integration.

**Acceptance Scenarios**:

1. **Given** a sightseeing place in my itinerary, **When** I view place details, **Then** I see an image of the location
2. **Given** places with location data, **When** viewing trip details, **Then** location information is structured to support future Google Maps integration
3. **Given** multiple activities at a place, **When** I view the place, **Then** I see all relevant details including timing and any special notes

---

### Edge Cases

- Overnight flights (departure and arrival on different dates): Use timezone-aware timestamps to maintain chronological accuracy
- Multi-leg flights (connecting flights): Each leg is stored as a segment within a flight object with its own departure/arrival times and locations
- Schedule conflicts (hotel/flight timing): System displays data as entered; user responsible for planning coordination
- Timezone differences for international flights: Times are stored with explicit timezone identifiers (e.g., "10:30 AM PST") to handle international travel accurately
- Missing data scenarios: All trip elements (flights, hotels, activities, restaurants) are optional; UI adapts to display only present data
- Activities without times: Activities can omit timestamps; order_index ensures proper sequencing for same-day items
- Empty days: Days with no activities simply show date with no content; acceptable empty state
- Minimal trips: Trip can contain only basic metadata (name, dates) without any flights, hotels, or activities

## Requirements *(mandatory)*

### Functional Requirements

**Trip Structure & Organization**

- **FR-001**: System MUST store trips with optional start location (home) and support travel to multiple cities with flexible itinerary composition
- **FR-002**: System MUST organize trip information chronologically by timestamp when available, displaying items (flights, hotels, activities) in time-sequential order
- **FR-003**: System MUST store each trip's data in a separate JSON file (one file per trip)

**Flight Information**

- **FR-004**: System MUST support optional flight details including airline name, flight number, departure time with timezone, arrival time with timezone, departure location, and arrival location; for multi-leg flights, each leg is stored as a segment within the flight object
- **FR-005**: System MUST allow zero or more flight segments per trip with each flight potentially containing multiple legs for connections
- **FR-006**: System MUST use flight departure times for chronological ordering when flights are present and handle timezone-aware time storage (e.g., "10:30 AM PST") for international travel

**Accommodation Information**

- **FR-007**: System MUST support optional hotel details including hotel name, full address, check-in time, check-out time, and reservation/confirmation ID
- **FR-008**: System MUST allow zero or more hotel stays per trip and support omitting hotel data entirely when not applicable (e.g., staying with friends/family)
- **FR-009**: System MUST use hotel check-in times for chronological ordering when hotel data is present

**Daily Activities & Sightseeing**

- **FR-010**: System MUST allow zero or more sightseeing activities and places for any day of the trip
- **FR-011**: System MUST capture activity details including place name, optional start time (e.g., "10:30 AM"), optional duration in hours/minutes (e.g., "2 hours"), explicit order_index for same-day sequencing, and special notes
- **FR-012**: System MUST support optional image URLs for sightseeing places (sourced from Google Maps or similar services)
- **FR-013**: System MUST support optional location data (coordinates, plus codes, or addresses) for places to enable future map integration
- **FR-014**: System MUST order activities chronologically using timestamps when available; for same-day activities, use explicit order_index to maintain user-defined sequence

**Restaurant Recommendations**

- **FR-015**: System MUST support optional restaurant recommendations organized by city
- **FR-016**: System MUST capture restaurant details including name, optional cuisine type, optional address, and optional notes about specialties or booking requirements
- **FR-017**: System MUST keep restaurant recommendations separate from daily itinerary (they are reference information, not scheduled activities)

**Data Organization**

- **FR-018**: System MUST maintain the existing trip list view showing all trips
- **FR-019**: Trip detail page MUST display information organized chronologically by timestamp, grouping flights, hotels, and activities in time sequence; city-specific recommendations appear separately
- **FR-020**: System MUST preserve existing functionality for viewing and navigating between trips
- **FR-021**: System MUST handle trips with any combination of present/absent elements (flights only, activities only, hotels only, or any mix)

### Key Entities

- **Trip**: Represents a complete journey with start/end dates and flexible composition of travel information. All child elements (flights, hotels, activities, restaurants) are optional. Includes metadata like trip name, description, and overall dates.

- **Flight**: Optional travel segment by air with departure/arrival details, times, airline, and flight number. Contains an optional array of legs for multi-leg journeys (connections/layovers), where each leg has its own departure/arrival times and locations. Zero or more flights can exist per trip.

- **Hotel**: Optional accommodation details including name, address, check-in/check-out times, and reservation information. All fields except essential identifiers are optional. Can be completely omitted from a trip.

- **DailyActivity**: Optional sightseeing or activity with place name, optional timestamp, optional duration, explicit order_index for sequencing, optional location data, optional images, and notes. Time can be omitted for flexible scheduling. Activities are ordered by timestamp when present, otherwise by order_index.

- **City**: Optional organizational concept for grouping hotels, activities, and restaurant recommendations. Derived from flight destinations, hotel locations, or activity locations.

- **RestaurantRecommendation**: Optional dining option for a city (not scheduled in daily itinerary). All fields (name, cuisine type, location, notes) are optional except essential identifiers.

- **Place**: Physical location with optional geographic data (plus code, coordinates, or address) and optional image URL. All location attributes are optional to support flexible data entry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view chronologically-ordered itinerary including any present elements (flights, hotels, activities) for any trip within 3 seconds of opening trip details
- **SC-002**: Users can identify all available details (times, confirmation numbers, addresses) for each trip element without scrolling or searching through multiple sections
- **SC-003**: System displays trip data correctly regardless of which elements are present (flights-only, activities-only, hotels-only, or any combination)
- **SC-004**: Users can access restaurant recommendations for each city without these appearing in the daily timeline when recommendations exist
- **SC-005**: Trip detail page displays images for at least 80% of sightseeing activities when image URLs are provided in the data
- **SC-006**: Location data, when provided, is stored in a format compatible with Google Maps API integration (coordinates or plus codes)
- **SC-007**: System maintains performance with individual trip files containing 50+ activities, 5+ flights, and 3+ hotel stays
- **SC-008**: Users can distinguish between chronologically-ordered items and reference information (restaurants) at a glance through visual organization
- **SC-009**: Activities within the same day appear in order_index sequence when timestamps are absent or identical
