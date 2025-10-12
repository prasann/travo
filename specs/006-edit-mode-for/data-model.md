# Data Model: Trip Edit Mode

**Feature**: 006-edit-mode-for  
**Date**: October 12, 2025  
**Phase**: 1 - Design & Contracts

## Overview

This feature leverages the existing IndexedDB schema with no schema changes required. All entities (Trip, Place, Flight, Hotel, DailyActivity, RestaurantRecommendation) already support the operations needed for edit mode.

## Existing Entities (Leveraged)

### Trip
Already defined in `frontend/lib/db/models.ts`

**Key Fields for Edit Mode**:
- `id`: string (UUID) - Primary key
- `name`: string - Trip name (editable)
- `start_date`: string (ISO date) - Trip start (editable)
- `end_date`: string (ISO date) - Trip end (editable)
- `notes`: string (optional) - Trip-level notes (editable via FR-026)
- `updated_at`: string (ISO timestamp) - Auto-updated on save
- `deleted`: boolean - Soft delete flag

**Edit Mode Operations**:
- Read: Load trip for editing
- Update: Save modified name, dates, notes
- No creation/deletion at trip level in this feature

---

### Flight
Already defined in `frontend/lib/db/models.ts`

**Key Fields for Edit Mode**:
- `id`: string (UUID) - Primary key
- `trip_id`: string (UUID) - Foreign key to Trip
- `flight_number`: string - Flight identifier (editable)
- `departure_airport`: string - IATA code (editable)
- `arrival_airport`: string - IATA code (editable)
- `departure_time`: string (ISO datetime) - Departure (editable)
- `arrival_time`: string (ISO datetime) - Arrival (editable)
- `notes`: string (optional) - Flight-level notes (editable via FR-028)
- `updated_at`: string (ISO timestamp) - Auto-updated on save

**Edit Mode Operations**:
- Read: List flights for trip
- Update: Modify flight details, add/edit notes
- Create: Add new flight (via Plus Code for airports - stretch goal)
- Delete: Remove flight (no confirmation per clarification)

**Note**: Flight editing in this feature focuses on notes (FR-028). Full flight data editing (airports, times) is secondary priority.

---

### Hotel
Already defined in `frontend/lib/db/models.ts`

**Key Fields for Edit Mode**:
- `id`: string (UUID) - Primary key
- `trip_id`: string (UUID) - Foreign key to Trip
- `name`: string - Hotel name (READ-ONLY if from API)
- `address`: string - Street address (READ-ONLY if from API)
- `plus_code`: string (optional) - Plus Code (editable - used for new hotels)
- `check_in_date`: string (ISO date) - Check-in (editable)
- `check_out_date`: string (ISO date) - Check-out (editable)
- `confirmation_number`: string (optional) - Booking reference (editable)
- `phone`: string (optional) - Hotel phone (editable)
- `notes`: string (optional) - Hotel-level notes (editable via FR-027)
- `updated_at`: string (ISO timestamp) - Auto-updated on save

**Edit Mode Operations**:
- Read: List hotels for trip
- Update: Modify check-in/out dates, confirmation, phone, notes
- Create: Add new hotel via Plus Code lookup (FR-006, FR-007, FR-008)
- Delete: Remove hotel (no confirmation per clarification, FR-013)

**Validation Rules** (from existing schema):
- `plus_code`: 8-character format if provided
- `check_in_date` < `check_out_date`

---

### DailyActivity (Attractions)
Already defined in `frontend/lib/db/models.ts`

**Key Fields for Edit Mode**:
- `id`: string (UUID) - Primary key
- `trip_id`: string (UUID) - Foreign key to Trip
- `date`: string (ISO date) - Activity date (editable)
- `type`: 'attraction' | 'activity' | 'restaurant' - Activity type
- `name`: string - Activity name (READ-ONLY if from API)
- `location`: string - Location description (READ-ONLY if from API)
- `plus_code`: string (optional) - Plus Code (editable - used for new activities)
- `time_slot`: 'morning' | 'afternoon' | 'evening' | 'full_day' (optional) - Time (editable)
- `order_index`: number - Sort order within day (editable via reorder, FR-014)
- `notes`: string (optional) - Activity-level notes (editable via FR-029)
- `updated_at`: string (ISO timestamp) - Auto-updated on save

**Edit Mode Operations**:
- Read: List activities for trip (filtered by type='attraction')
- Update: Modify date, time slot, order, notes
- Create: Add new attraction via Plus Code lookup (FR-006, FR-007, FR-008)
- Delete: Remove attraction (no confirmation, FR-013)
- Reorder: Update `order_index` field (FR-014)

**Validation Rules**:
- `order_index`: Non-negative integer
- `date`: Within trip start/end date range (soft validation)

---

### Place (Generic)
Already defined in `frontend/lib/db/models.ts`

**Purpose**: Generic place entity (used for legacy data). New places added via Hotel or DailyActivity entities.

**Note**: Edit mode will NOT directly edit Place entities. Places are effectively replaced by Hotel/DailyActivity entities in the enhanced model.

---

## Form Data Structures (New)

These TypeScript interfaces define the shape of form data used in edit mode components.

### TripEditFormData

```typescript
interface TripEditFormData {
  name: string;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  notes?: string;
}
```

### HotelEditFormData

```typescript
interface HotelEditFormData {
  id?: string; // Undefined for new hotels
  name?: string; // Populated after Plus Code lookup
  address?: string; // Populated after Plus Code lookup
  plus_code: string; // User input
  check_in_date: string;
  check_out_date: string;
  confirmation_number?: string;
  phone?: string;
  notes?: string;
}
```

### ActivityEditFormData

```typescript
interface ActivityEditFormData {
  id?: string; // Undefined for new activities
  name?: string; // Populated after Plus Code lookup
  location?: string; // Populated after Plus Code lookup
  plus_code: string; // User input
  date: string;
  time_slot?: 'morning' | 'afternoon' | 'evening' | 'full_day';
  notes?: string;
  order_index: number;
}
```

### FlightEditFormData

```typescript
interface FlightEditFormData {
  id?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: string;
  arrival_time?: string;
  notes?: string;
}
```

---

## Plus Code Lookup Response

### GoogleMapsGeocodingResponse

```typescript
interface GoogleMapsGeocodingResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
  }>;
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
}
```

**Usage**: 
- On success (status='OK'), extract `results[0].formatted_address` for address
- Extract name from first address_component with appropriate type
- Handle error statuses per clarifications

---

## State Transitions

### Hotel/Activity Lifecycle in Edit Mode

```
[Not Exists] 
    ↓ (User enters Plus Code)
[Plus Code Entered] 
    ↓ (API lookup triggered)
[Loading...] 
    ↓ (Success)
[API Data Populated] → {name, address from API, plus_code stored}
    ↓ (User fills additional fields)
[Form Complete]
    ↓ (User clicks Save)
[Persisted to IndexedDB] → {id assigned, updated_at set}

[Persisted] 
    ↓ (User clicks Delete)
[Deleted] → {soft delete or hard delete based on DB operation}
```

### Reorder Operation

```
[Initial Order]
  items: [{order_index: 0}, {order_index: 1}, {order_index: 2}]
    ↓ (User drags item 1 to position 0)
[Reordered in UI]
  items: [{order_index: 1}, {order_index: 0}, {order_index: 2}]
    ↓ (User clicks Save)
[Recalculated Indices]
  items: [{order_index: 0}, {order_index: 1}, {order_index: 2}]
    ↓ (Batch update to IndexedDB)
[Persisted]
```

**Note**: Order indices recalculated to be sequential (0, 1, 2, ...) before saving to avoid gaps.

---

## Data Validation

### Client-Side Validation (React Hook Form)

**Trip Fields**:
- `name`: Required, 1-200 characters
- `start_date`: Required, valid ISO date
- `end_date`: Required, valid ISO date, >= start_date

**Hotel Fields**:
- `plus_code`: Required for new hotels, 8 characters, alphanumeric + '+'
- `check_in_date`: Required, valid ISO date
- `check_out_date`: Required, valid ISO date, > check_in_date

**Activity Fields**:
- `plus_code`: Required for new activities, 8 characters
- `date`: Required, valid ISO date

**Flight Fields**:
- `notes`: Optional, max 2000 characters (all notes fields)

### API Validation

**Plus Code Format**:
- Pattern: `^[A-Z0-9+]{8}$` (8 characters, uppercase alphanumeric + plus)
- Google Maps API will reject invalid formats with ZERO_RESULTS or INVALID_REQUEST

### Database Validation

Handled by existing Dexie schema and validation layer in `frontend/lib/db/validation.ts`.

---

## Relationships

```
Trip (1) ─┬─> (N) Flight
          ├─> (N) Hotel
          └─> (N) DailyActivity (attractions)
```

**Cascade Behavior**:
- Deleting a trip → soft delete (set deleted=true), related entities remain
- Deleting hotel/activity → hard delete (remove from IndexedDB)
- No foreign key constraints in IndexedDB (application-enforced)

---

## Migration Notes

**Schema Version**: No change (v2 already supports all required fields)

**Data Migration**: None required - feature uses existing schema

**Backward Compatibility**: Full compatibility - edit mode is additive, doesn't break existing read/display logic
