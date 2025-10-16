# Tasks: Map View & Clickable Places

## Phase 1: Data Model Updates

### Task 1.1: Update Type Definitions
**File:** `frontend/types/index.ts`

**Changes:**
- [ ] Add to `DailyActivity`: `google_maps_url?`, `latitude?`, `longitude?`
- [ ] Add to `Hotel`: `google_maps_url?`, `latitude?`, `longitude?`
- [ ] Add to `RestaurantRecommendation`: `google_maps_url?`, `latitude?`, `longitude?`

**Test:** Run `npm run build` - should compile without errors

---

### Task 1.2: Update Database Models
**File:** `frontend/lib/db/models.ts`

**Changes:**
- [ ] Mirror the new fields from types to database models

**Test:** Run `npm run build` - should compile without errors

---

### Task 1.3: Update Database Schema
**File:** `frontend/lib/db/schema.ts`

**Changes:**
- [ ] Increment schema version from 2 to 3
- [ ] Add new optional fields (no migration logic needed)

**Test:**
- [ ] Start dev server: `npm run dev`
- [ ] Open app in browser - IndexedDB should auto-upgrade
- [ ] Check browser DevTools → Application → IndexedDB → Verify schema version is 3

---

### Task 1.4: Update Firebase Schema
**File:** `frontend/lib/firebase/schema.ts`

**Changes:**
- [ ] Add new fields to Firestore type definitions

**Test:** Run `npm run build` - should compile without errors

---

## 🧪 **PHASE 1 CHECKPOINT**
Before moving to Phase 2:
- [ ] All TypeScript files compile without errors
- [ ] IndexedDB schema upgraded successfully in browser
- [ ] Existing trips still load correctly in UI

---

## Phase 2: Capture Location Data

### Task 2.1: Update Attraction Section
**File:** `frontend/components/edit/AttractionSection.tsx`

**Changes:**
- [ ] Store the original `mapsUrl` input as `google_maps_url`
- [ ] Capture `location.lat` and `location.lng` from API response
- [ ] Save all three fields when creating/editing activities

**Test:**
- [ ] Go to edit mode for a trip
- [ ] Add new attraction via Google Maps link
- [ ] Check IndexedDB → `daily_activities` table → Verify `google_maps_url`, `latitude`, `longitude` are populated

---

### Task 2.2: Update Hotel Section
**File:** `frontend/components/edit/HotelSection.tsx`

**Changes:**
- [ ] Add same location capture logic as attractions

**Test:**
- [ ] Add new hotel via Google Maps link
- [ ] Check IndexedDB → `hotels` table → Verify location fields are populated

---

### Task 2.3: Update Notes Section (Restaurants)
**File:** `frontend/components/edit/NotesSection.tsx`

**Changes:**
- [ ] Add location capture for recommended restaurants

**Test:**
- [ ] Add new restaurant via Google Maps link
- [ ] Check IndexedDB → `restaurant_recommendations` table → Verify location fields are populated

---

## 🧪 **PHASE 2 CHECKPOINT**
Before moving to Phase 3:
- [ ] New attractions save location data (URL + coordinates)
- [ ] New hotels save location data
- [ ] New restaurants save location data
- [ ] Data syncs to Firestore correctly (check Firebase console)

---

## Phase 3: Feature #1 - Clickable Places

### Task 3.1: Update ActivityCard
**File:** `frontend/components/ActivityCard.tsx`

**Changes:**
- [ ] Wrap place name in `<a>` tag
- [ ] Use `google_maps_url` if available
- [ ] Fallback: construct URL from `plus_code` or `address`
- [ ] Add `target="_blank"` and `rel="noopener noreferrer"`
- [ ] Style link appropriately

**Test:**
- [ ] View trip timeline
- [ ] Click on activity name → Should open Google Maps in new tab
- [ ] Test with both new entries (with URL) and old entries (without URL)

---

### Task 3.2: Update HotelCard
**File:** `frontend/components/HotelCard.tsx`

**Changes:**
- [ ] Make hotel name/address clickable (same logic as ActivityCard)

**Test:**
- [ ] Click on hotel → Should open Google Maps in new tab

---

### Task 3.3: Update RestaurantList
**File:** `frontend/components/RestaurantList.tsx`

**Changes:**
- [ ] Make restaurant names clickable

**Test:**
- [ ] Click on restaurant → Should open Google Maps in new tab

---

## 🧪 **PHASE 3 CHECKPOINT**
Before moving to Phase 4:
- [ ] All places are clickable
- [ ] Clicking opens correct Google Maps location
- [ ] Works on desktop and mobile
- [ ] Fallback logic works for old data without `google_maps_url`

---

## Phase 4: Feature #2 - Map View

### Task 4.1: Install Dependencies
**Command:** `cd frontend && npm install @vis.gl/react-google-maps`

**Test:**
- [ ] Check `package.json` → Verify `@vis.gl/react-google-maps` is listed
- [ ] Run `npm run dev` → Should start without errors

---

### Task 4.2: Create Map Utilities
**File:** `frontend/lib/mapHelpers.ts` (new file)

**Changes:**
- [ ] Create `extractMapMarkers(trip)` function
- [ ] Create `getCoordinates(item)` function with fallbacks
- [ ] Add types for `MapMarker`

**Test:**
- [ ] Create unit test or console.log test
- [ ] Verify it extracts markers from trip data
- [ ] Verify fallback to plus_code works

---

### Task 4.3: Create TripMapView Component
**File:** `frontend/components/TripMapView.tsx` (new file)

**Changes:**
- [ ] Create map component using `@vis.gl/react-google-maps`
- [ ] Render markers with day-based colors
- [ ] Add info windows on marker click
- [ ] Auto-fit bounds to show all markers
- [ ] Add legend showing day colors
- [ ] Handle loading states

**Test:**
- [ ] Temporarily import and render in trip page
- [ ] Verify map displays with markers
- [ ] Check marker colors match timeline days
- [ ] Click markers → Info window appears

---

### Task 4.4: Update Trip Page with View Toggle
**File:** `frontend/app/trip/[tripId]/page.tsx`

**Changes:**
- [ ] Add state for active view (`timeline` | `map`)
- [ ] Create tab toggle UI (DaisyUI tabs)
- [ ] Conditionally render `<TripTimeline>` or `<TripMapView>`
- [ ] Default to timeline view

**Test:**
- [ ] Click "Map" tab → Map view appears
- [ ] Click "Timeline" tab → Timeline appears
- [ ] State persists during interaction
- [ ] Check responsive design on mobile

---

## 🧪 **PHASE 4 CHECKPOINT**
Before moving to Phase 5:
- [ ] Map view displays all locations
- [ ] Markers colored by day
- [ ] Clicking markers shows info
- [ ] Toggle between views works smoothly
- [ ] No console errors

---

## Phase 5: Testing & Polish

### Task 5.1: Test Data Migration
- [ ] Load existing trips without new location data
- [ ] Verify they display correctly (no crashes)
- [ ] Verify map view handles missing coordinates gracefully

---

### Task 5.2: Test Fallback Logic
- [ ] Test clickable links with missing `google_maps_url`
- [ ] Verify plus_code → coordinates conversion works
- [ ] Test with trips that have incomplete location data

---

### Task 5.3: Mobile Responsiveness
- [ ] Test map view on mobile device
- [ ] Verify touch interactions work
- [ ] Check map controls are accessible
- [ ] Verify tab toggle works on mobile

---

### Task 5.4: Final Testing
- [ ] Test complete flow: Create trip → Add places → View in both modes
- [ ] Verify offline functionality works
- [ ] Check Firestore sync for new location fields
- [ ] Run `npm run build` → Verify production build succeeds

---

## 🎉 **COMPLETION CHECKLIST**
- [ ] Both features working in production
- [ ] All tests passing
- [ ] Documentation updated (`technical-specifications.md`, `travo-prd.md`)
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Mobile responsive
- [ ] Works with old and new data
