# Implementation Plan: Map View & Clickable Places

## Overview

Adding two features to the trip view:
1. Clickable places that open Google Maps
2. Interactive map view with day-colored markers

---

## Phase 1: Data Model Updates 🗄️

**1.1 Update Type Definitions** (`frontend/types/index.ts`)
- Add `google_maps_url?`, `latitude?`, `longitude?` to:
  - `DailyActivity`
  - `Hotel`
  - `RestaurantRecommendation`

**1.2 Update Database Models** (`frontend/lib/db/models.ts`)
- Mirror type changes for IndexedDB

**1.3 Database Schema Migration** (`frontend/lib/db/schema.ts`)
- Increment Dexie schema version (2 → 3)
- Add new fields (no migration logic needed - fields are optional)

**1.4 Update Firebase Schema** (`frontend/lib/firebase/schema.ts`)
- Add new fields to Firestore document structure

---

## Phase 2: Capture Location Data 📍

**2.1 Update Attraction Section** (`frontend/components/edit/AttractionSection.tsx`)
- Capture `latitude`, `longitude` from API response
- Store original `google_maps_url` from user input
- Save all three fields when creating/editing activities

**2.2 Update Hotel Section** (`frontend/components/edit/HotelSection.tsx`)
- Add same location capture logic

**2.3 Update Notes Section** (`frontend/components/edit/NotesSection.tsx`)
- Add location capture for restaurants

---

## Phase 3: Feature #1 - Clickable Places 🔗

**3.1 Update ActivityCard** (`frontend/components/ActivityCard.tsx`)
- Wrap place name in clickable link
- Use `google_maps_url` if available, fallback to constructing URL from `plus_code` or `address`
- Open in new tab (`target="_blank"`)

**3.2 Update HotelCard** (`frontend/components/HotelCard.tsx`)
- Same clickable link logic

**3.3 Update RestaurantList** (`frontend/components/RestaurantList.tsx`)
- Make restaurant names clickable

---

## Phase 4: Feature #2 - Map View 🗺️

**4.1 Install Dependencies**
```bash
npm install @vis.gl/react-google-maps
```

**4.2 Create Map Utilities** (`frontend/lib/mapHelpers.ts`)
- `extractMapMarkers(trip)` - Extract all mappable items with coordinates
- `getCoordinates(item)` - Get lat/lng with fallbacks (direct → plus_code conversion → null)

**4.3 Create TripMapView Component** (`frontend/components/TripMapView.tsx`)
- Google Maps with all location markers
- Color markers by day using existing `DAY_COLORS`
- Info windows on marker click
- Auto-fit bounds to show all markers
- Legend showing day colors

**4.4 Update Trip Page** (`frontend/app/trip/[tripId]/page.tsx`)
- Add tab toggle: "Timeline" | "Map"
- Conditional rendering based on active tab
- Default to Timeline view

---

## Phase 5: Testing & Polish ✨

**5.1 Data Migration**
- Test with existing trips (should gracefully handle missing coordinates)
- Create new trip with all location data

**5.2 Fallback Handling**
- Verify plus_code → lat/lng conversion works
- Test clickable links with missing `google_maps_url`

**5.3 Mobile Responsiveness**
- Map view on mobile devices
- Touch interactions for markers

---

## Estimated Effort

| Phase | Tasks | Complexity | Time Estimate |
|-------|-------|------------|---------------|
| Phase 1 | Data model | Low | 1-2 hours |
| Phase 2 | Capture data | Medium | 2-3 hours |
| Phase 3 | Clickable links | Low | 1-2 hours |
| Phase 4 | Map view | High | 4-6 hours |
| Phase 5 | Testing | Medium | 2-3 hours |
| **Total** | | | **10-16 hours** |

---

## Order of Implementation

1. **Phase 1** → Enables data storage
2. **Phase 2** → Start collecting location data for new entries
3. **Phase 3** → Quick win, delivers first feature
4. **Phase 4** → Main map view feature
5. **Phase 5** → Polish and edge cases
