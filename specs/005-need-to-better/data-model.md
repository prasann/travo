# Data Model: Enhanced Trip Data Model & Itinerary Management

**Feature**: 005-need-to-better  
**Date**: 2025-10-11  
**Phase**: 1 - Data Model Design

## Overview

This document defines the complete data model for the enhanced trip system, including all entities, their relationships, validation rules, and state transitions. All entities support optional fields per clarifications to enable flexible trip planning.

## Entity Definitions

### Trip

**Description**: Top-level container for a journey with flexible composition of child elements.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| name | string | ✓ | Trip display name |
| description | string | ✗ | Trip overview/notes |
| start_date | string (ISO date) | ✓ | Trip start date (YYYY-MM-DD) |
| end_date | string (ISO date) | ✓ | Trip end date (YYYY-MM-DD) |
| home_location | string | ✗ | Starting point (optional per FR-001) |
| updated_at | string (ISO datetime) | ✓ | Last modification timestamp |
| flights | Flight[] | ✗ | Associated flights (empty array if none) |
| hotels | Hotel[] | ✗ | Associated hotels (empty array if none) |
| activities | DailyActivity[] | ✗ | Associated activities (empty array if none) |
| restaurants | RestaurantRecommendation[] | ✗ | Restaurant recommendations (empty array if none) |

**Validation Rules**:
- `id`: Must be valid UUID v4
- `start_date` ≤ `end_date`
- `name`: Non-empty string, max 200 characters
- All child arrays default to empty `[]` if omitted

**Relationships**:
- Has many: Flight (0..*)
- Has many: Hotel (0..*)
- Has many: DailyActivity (0..*)
- Has many: RestaurantRecommendation (0..*)

---

### Flight

**Description**: Air travel segment with optional connection legs.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| trip_id | string (UUID) | ✓ | Parent trip reference |
| updated_at | string (ISO datetime) | ✓ | Last modification timestamp |
| airline | string | ✗ | Airline name |
| flight_number | string | ✗ | Flight identifier (e.g., "UA123") |
| departure_time | string (ISO datetime with TZ) | ✗ | Departure timestamp with timezone |
| arrival_time | string (ISO datetime with TZ) | ✗ | Arrival timestamp with timezone |
| departure_location | string | ✗ | Airport/city name |
| arrival_location | string | ✗ | Airport/city name |
| confirmation_number | string | ✗ | Booking reference |
| notes | string | ✗ | Additional flight details |
| legs | FlightLeg[] | ✗ | Connection segments (for multi-leg flights) |

**Validation Rules**:
- `id`, `trip_id`: Must be valid UUID v4
- `departure_time` < `arrival_time` (when both present)
- Datetime strings must include timezone offset (e.g., "2025-04-01T10:30:00-07:00")
- `legs` can be empty array for direct flights

**Relationships**:
- Belongs to: Trip (1)
- Has many: FlightLeg (0..*)

**Ordering**: Uses `departure_time` for chronological sorting

---

### FlightLeg

**Description**: Individual segment of a multi-leg flight (connection/layover).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| flight_id | string (UUID) | ✓ | Parent flight reference |
| leg_number | number | ✓ | Sequence in flight (1, 2, 3...) |
| airline | string | ✗ | Airline for this leg |
| flight_number | string | ✗ | Flight number for this leg |
| departure_time | string (ISO datetime with TZ) | ✗ | Leg departure timestamp |
| arrival_time | string (ISO datetime with TZ) | ✗ | Leg arrival timestamp |
| departure_location | string | ✗ | Departure airport/city |
| arrival_location | string | ✗ | Arrival airport/city |
| duration_minutes | number | ✗ | Flight duration |

**Validation Rules**:
- `leg_number`: Positive integer, unique within flight
- `departure_time` < `arrival_time` (when both present)
- Legs must be ordered by `leg_number`

**Relationships**:
- Belongs to: Flight (1)

---

### Hotel

**Description**: Accommodation details for a city/location.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| trip_id | string (UUID) | ✓ | Parent trip reference |
| updated_at | string (ISO datetime) | ✓ | Last modification timestamp |
| name | string | ✗ | Hotel name |
| address | string | ✗ | Full address |
| city | string | ✗ | City name (for grouping) |
| plus_code | string | ✗ | Google Maps Plus Code |
| check_in_time | string (ISO datetime with TZ) | ✗ | Check-in timestamp |
| check_out_time | string (ISO datetime with TZ) | ✗ | Check-out timestamp |
| confirmation_number | string | ✗ | Reservation ID |
| phone | string | ✗ | Hotel contact number |
| notes | string | ✗ | Additional hotel details |

**Validation Rules**:
- `id`, `trip_id`: Must be valid UUID v4
- `check_in_time` < `check_out_time` (when both present)
- `plus_code`: Valid Plus Code format when present (8-char standard)
- All fields except identifiers optional per FR-008

**Relationships**:
- Belongs to: Trip (1)

**Ordering**: Uses `check_in_time` for chronological sorting

---

### DailyActivity

**Description**: Planned sightseeing or activity with flexible timing.

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| trip_id | string (UUID) | ✓ | Parent trip reference |
| updated_at | string (ISO datetime) | ✓ | Last modification timestamp |
| name | string | ✓ | Activity/place name |
| date | string (ISO date) | ✓ | Activity date (YYYY-MM-DD) |
| start_time | string (ISO datetime with TZ) | ✗ | Activity start timestamp (optional per clarifications) |
| duration_minutes | number | ✗ | Activity duration |
| order_index | number | ✓ | Explicit ordering for same-day activities |
| city | string | ✗ | City name (for grouping) |
| plus_code | string | ✗ | Google Maps Plus Code |
| address | string | ✗ | Full address |
| image_url | string (URL) | ✗ | External image URL (Google Maps) |
| notes | string | ✗ | Activity details/tips |

**Validation Rules**:
- `id`, `trip_id`: Must be valid UUID v4
- `name`: Non-empty string
- `date`: Within trip start_date and end_date range
- `order_index`: Non-negative integer, used for same-day sequencing
- `image_url`: Valid URL format when present
- `plus_code`: Valid Plus Code format when present (8-char standard)

**Relationships**:
- Belongs to: Trip (1)

**Ordering**: 
- Primary: `start_time` (chronological)
- Fallback: `order_index` (for activities without time or same time)

---

### RestaurantRecommendation

**Description**: Dining option for reference (not in daily timeline).

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | ✓ | Unique identifier |
| trip_id | string (UUID) | ✓ | Parent trip reference |
| updated_at | string (ISO datetime) | ✓ | Last modification timestamp |
| name | string | ✓ | Restaurant name |
| city | string | ✗ | City name (for grouping) |
| cuisine_type | string | ✗ | Type of cuisine |
| address | string | ✗ | Full address |
| plus_code | string | ✗ | Google Maps Plus Code |
| phone | string | ✗ | Contact number |
| website | string (URL) | ✗ | Restaurant website |
| notes | string | ✗ | Specialties, booking requirements, etc. |

**Validation Rules**:
- `id`, `trip_id`: Must be valid UUID v4
- `name`: Non-empty string
- `website`: Valid URL format when present
- All fields except identifiers and name optional per FR-016

**Relationships**:
- Belongs to: Trip (1)

**Ordering**: Not chronologically ordered (display by city grouping)

---

## Entity Relationships Diagram

```
Trip (1)
  ├── flights (0..*)        → Flight
  ├── hotels (0..*)         → Hotel
  ├── activities (0..*)     → DailyActivity
  └── restaurants (0..*)    → RestaurantRecommendation

Flight (1)
  └── legs (0..*)           → FlightLeg
```

---

## Data Storage Format

### File Structure

```
frontend/data/
├── trip-index.json          # Lightweight index for trip list
└── trips/
    └── {trip-id}.json       # Full trip data with all relationships
```

### Example: trip-index.json

```json
{
  "trips": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tokyo Spring Adventure",
      "start_date": "2025-04-01",
      "end_date": "2025-04-07",
      "updated_at": "2025-10-10T10:00:00.000Z"
    }
  ]
}
```

### Example: trips/{trip-id}.json

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Tokyo Spring Adventure",
  "description": "7-day journey to experience cherry blossom season",
  "start_date": "2025-04-01",
  "end_date": "2025-04-07",
  "home_location": "San Francisco",
  "updated_at": "2025-10-10T10:00:00.000Z",
  
  "flights": [
    {
      "id": "flight-001",
      "trip_id": "123e4567-e89b-12d3-a456-426614174000",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "airline": "United Airlines",
      "flight_number": "UA837",
      "departure_time": "2025-04-01T11:00:00-07:00",
      "arrival_time": "2025-04-02T14:30:00+09:00",
      "departure_location": "San Francisco (SFO)",
      "arrival_location": "Tokyo Narita (NRT)",
      "confirmation_number": "ABC123",
      "legs": []
    }
  ],
  
  "hotels": [
    {
      "id": "hotel-001",
      "trip_id": "123e4567-e89b-12d3-a456-426614174000",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "name": "Tokyo Grand Hotel",
      "address": "1-2-3 Shinjuku, Tokyo",
      "city": "Tokyo",
      "check_in_time": "2025-04-02T15:00:00+09:00",
      "check_out_time": "2025-04-07T11:00:00+09:00",
      "confirmation_number": "HTL789"
    }
  ],
  
  "activities": [
    {
      "id": "activity-001",
      "trip_id": "123e4567-e89b-12d3-a456-426614174000",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "name": "Tokyo Skytree",
      "date": "2025-04-02",
      "start_time": "2025-04-02T16:00:00+09:00",
      "duration_minutes": 120,
      "order_index": 0,
      "city": "Tokyo",
      "plus_code": "8Q7XQXXR+33",
      "image_url": "https://maps.googleapis.com/...",
      "notes": "Visit around 4-5 PM for sunset shots"
    }
  ],
  
  "restaurants": [
    {
      "id": "restaurant-001",
      "trip_id": "123e4567-e89b-12d3-a456-426614174000",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "name": "Ichiran Ramen",
      "city": "Tokyo",
      "cuisine_type": "Japanese (Ramen)",
      "plus_code": "8Q7XPM2F+11",
      "notes": "Open 24 hours, no reservation needed"
    }
  ]
}
```

---

## State Transitions

### Trip Lifecycle

```
[NEW] → [PLANNING] → [CONFIRMED] → [IN_PROGRESS] → [COMPLETED]
```

**Note**: Current implementation doesn't track explicit state. All trips are editable. Future enhancement could add status field.

### Data Modification Flow

1. **Create**: Generate new UUID, set `updated_at` to current timestamp
2. **Update**: Modify fields, update `updated_at` to current timestamp
3. **Delete**: Remove from parent array (soft delete not implemented)

---

## Chronological Ordering Logic

### Timeline Item Sorting

**Algorithm**: (from research.md)

```typescript
function sortChronologically(items: TimelineItem[]): TimelineItem[] {
  return items.sort((a, b) => {
    const timeA = getTimestamp(a);  // Extract departure_time, check_in_time, or start_time
    const timeB = getTimestamp(b);
    
    if (timeA && timeB) {
      const diff = timeA.getTime() - timeB.getTime();
      // Same timestamp: use order_index for activities
      if (diff === 0 && 'order_index' in a && 'order_index' in b) {
        return a.order_index - b.order_index;
      }
      return diff;
    }
    
    // Items without timestamps go last, sorted by order_index
    if (!timeA && !timeB && 'order_index' in a && 'order_index' in b) {
      return a.order_index - b.order_index;
    }
    
    return timeA ? -1 : 1;
  });
}
```

**Priority**:
1. Items with timestamps (sorted chronologically)
2. Items without timestamps (sorted by order_index)

---

## Migration Strategy

### From Current Model to New Model

**Current Structure** (frontend/data/trips.json):
```json
{
  "trips": [
    {
      "id": "...",
      "name": "...",
      "places": [...]
    }
  ]
}
```

**Migration Steps**:

1. **Add new fields to existing trips**:
   - Set `flights: []`, `hotels: []`, `restaurants: []`
   - Rename `places` → `activities`
   - Add `date`, `order_index` to each activity

2. **Split into separate files**:
   - Create `/frontend/data/trips/` directory
   - Write each trip to `/frontend/data/trips/{id}.json`
   - Generate `trip-index.json` with summary data

3. **Update type definitions**:
   - Extend `Trip` interface with new fields
   - Add `Flight`, `Hotel`, `Restaurant` interfaces
   - Rename `Place` → `DailyActivity` with new fields

4. **Backward compatibility** (temporary):
   - Keep old `trips.json` for 1 release cycle
   - Fallback to old structure if new files missing
   - Display migration prompt in UI

---

## Validation Rules Summary

### Required Fields (Non-Optional)

- **All Entities**: `id`, `trip_id` (except Trip), `updated_at`
- **Trip**: `name`, `start_date`, `end_date`
- **DailyActivity**: `name`, `date`, `order_index`
- **RestaurantRecommendation**: `name`

### Optional Fields

- Everything else is optional to support flexible trip planning

### Format Validations

- **UUID**: RFC 4122 v4 format
- **ISO Date**: YYYY-MM-DD
- **ISO Datetime with TZ**: YYYY-MM-DDTHH:mm:ss±HH:mm
- **Plus Code**: 8-character format (e.g., "8Q7XQXXR+33")
- **URL**: Valid HTTP/HTTPS URL

### Business Rules

- Trip end_date ≥ start_date
- Activity date within trip date range
- Flight/Hotel arrival_time > departure_time / check_out_time > check_in_time
- FlightLeg leg_number unique within flight

---

**Phase 1 Data Model Complete**. Next: Generate TypeScript interfaces in contracts/interfaces.ts.
