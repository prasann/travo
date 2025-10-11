# Data Model: Port App to Next.js and Replace ShadCN with DaisyUI

**Feature**: 004-port-app-to  
**Date**: October 11, 2025  
**Status**: No changes to data model required

## Overview

This migration does **not** introduce any data model changes. The existing data structures from the current Vite application are preserved exactly as-is. This document serves as confirmation that the data layer remains stable during the UI framework migration.

## Existing Entities (Preserved)

### Trip Entity

**Purpose**: Represents a travel trip with associated metadata and places

**Attributes**:
- `id` (string): Unique identifier for the trip
- `name` (string): Display name of the trip
- `description` (string): Detailed trip description
- `startDate` (string, ISO 8601): Trip start date
- `endDate` (string, ISO 8601): Trip end date
- `destination` (string): Primary destination/location
- `imageUrl` (string, optional): Cover image URL for the trip
- `places` (Place[]): Array of places within this trip

**TypeScript Interface** (unchanged):
```typescript
export interface Trip {
  id: string
  name: string
  description: string
  startDate: string  // ISO 8601 format
  endDate: string    // ISO 8601 format
  destination: string
  imageUrl?: string
  places: Place[]
}
```

**Validation Rules**:
- `id` must be unique across all trips
- `startDate` must be before or equal to `endDate`
- `places` array can be empty (handled in UI with "no places" message)

**State Transitions**: N/A (read-only data in current implementation)

---

### Place Entity

**Purpose**: Represents a location or point of interest within a trip

**Attributes**:
- `id` (string): Unique identifier for the place
- `name` (string): Display name of the place
- `description` (string): Detailed place description
- `address` (string, optional): Physical address or location details
- `imageUrl` (string, optional): Image URL for the place
- `notes` (string, optional): User notes about the place

**TypeScript Interface** (unchanged):
```typescript
export interface Place {
  id: string
  name: string
  description: string
  address?: string
  imageUrl?: string
  notes?: string
}
```

**Validation Rules**:
- `id` must be unique within the context of its parent trip
- All optional fields can be undefined or empty strings

**Relationships**:
- Many-to-One with Trip: Each place belongs to exactly one trip
- Relationship maintained through Trip.places array (denormalized)

---

### Theme Configuration (Not a data entity)

**Purpose**: Represents visual theme selection for the application

**Current Approach**: Environment variable + CSS files  
**New Approach**: Environment variable + DaisyUI config

**No data model changes required** - theme is build-time configuration, not runtime data.

---

## Data Storage

### Current Implementation (Preserved)
- **Storage Mechanism**: Static JSON file (`data/trips.json`)
- **Location**: `src/data/trips.json` → `data/trips.json` (path change only)
- **Format**: JSON with trips array at root

```json
{
  "trips": [
    {
      "id": "trip-1",
      "name": "Summer Vacation",
      "description": "...",
      "startDate": "2025-07-01",
      "endDate": "2025-07-15",
      "destination": "Hawaii",
      "places": [
        {
          "id": "place-1",
          "name": "Waikiki Beach",
          "description": "..."
        }
      ]
    }
  ]
}
```

### Migration Impact
- File moves from `travo-frontend/src/data/` to `travo-nextjs/data/`
- Import path changes: `@/data/trips.json` (same alias, different root)
- Loading mechanism changes: Client-side import → Server Component import
- **Content remains identical**: No changes to JSON structure

---

## Data Access Patterns

### Current Pattern (Vite + React)
```typescript
// HomePage.tsx (client-side)
import tripsData from '@/data/trips.json'

const [trips, setTrips] = useState<Trip[]>([])

useEffect(() => {
  setTrips(tripsData.trips)
}, [])
```

### New Pattern (Next.js Server Component)
```typescript
// app/page.tsx (server-side)
import tripsData from '@/data/trips.json'

export default function HomePage() {
  const trips = tripsData.trips
  return <TripList trips={trips} />
}
```

### Migration Benefits
- **Simpler code**: No useState, no useEffect for static data
- **Better performance**: Data embedded in HTML at build time
- **Same data format**: Zero changes to trips.json structure

---

## Type Definitions (Unchanged)

The `types/index.ts` file remains identical:

```typescript
export interface Trip {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  destination: string
  imageUrl?: string
  places: Place[]
}

export interface Place {
  id: string
  name: string
  description: string
  address?: string
  imageUrl?: string
  notes?: string
}

// Helper type for component props
export interface TripCardProps {
  trip: Trip
  onSelect: (tripId: string) => void
}

export interface TripListProps {
  trips: Trip[]
  onTripSelect: (tripId: string) => void
  isLoading?: boolean
}

export interface TripDetailsProps {
  trip: Trip
}

export interface PlaceCardProps {
  place: Place
}
```

**Migration Changes**: None - copy file as-is

---

## Data Flow Architecture

### Current Flow (Client-Side)
```
trips.json → ES Module Import → useState → Component Props → UI
```

### New Flow (Server Component)
```
trips.json → Server Component Import → Component Props → UI
                                    ↓
                            (Rendered to HTML at build time)
```

### Key Differences
1. **No loading state needed**: Data available synchronously in Server Component
2. **Smaller client bundle**: Data not included in JavaScript bundle
3. **Better SEO**: Trip data in HTML for crawlers
4. **Same runtime behavior**: Client-side navigation still works

---

## Migration Checklist

- [ ] Copy `src/data/trips.json` → `data/trips.json` (no content changes)
- [ ] Copy `src/types/index.ts` → `types/index.ts` (no content changes)
- [ ] Update import paths in components from Vite aliases to Next.js aliases
- [ ] Remove client-side loading state logic (useState, useEffect)
- [ ] Verify TypeScript types still work with Next.js
- [ ] Test that all trips and places render correctly
- [ ] Verify dynamic routes work with trip IDs

---

## Future Considerations (Out of Scope)

This migration maintains the simple JSON file approach. Future enhancements could include:

1. **IndexedDB Storage**: Per constitution's offline-first requirement
2. **Supabase Sync**: For multi-device synchronization
3. **CRUD Operations**: Currently read-only, could add create/update/delete
4. **UUID Migration**: Add proper UUID primary keys for sync compatibility
5. **Timestamps**: Add `updated_at` for conflict resolution

These are **not** part of the current migration scope. The goal is framework migration, not data model changes.

---

## Validation

**Pre-Migration Validation**:
- ✅ Current data structure documented
- ✅ No changes required to trips.json content
- ✅ TypeScript interfaces remain valid
- ✅ No database schema changes

**Post-Migration Validation**:
- [ ] All trips load correctly on home page
- [ ] All places load correctly on trip detail pages
- [ ] Trip IDs work in dynamic routes (/trip/[tripId])
- [ ] No TypeScript errors in data types
- [ ] JSON file accessible from Next.js build

---

## Summary

**Data Model Changes**: **NONE**

This migration is purely a UI framework change. The data layer remains completely stable:
- Same JSON file format
- Same TypeScript interfaces
- Same entity relationships
- Same validation rules

The only change is **how** the data is loaded (Server Component instead of client-side), not **what** data exists or **how** it's structured.
