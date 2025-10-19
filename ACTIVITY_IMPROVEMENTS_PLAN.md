# Activity Section Improvements - Implementation Plan

**Created**: October 19, 2025  
**Status**: 🟡 Planning Phase  
**Target Completion**: TBD

---

## 📋 Overview

Improve the "Add Activity" workflow to be more intuitive and auto-populate data from Google Maps, reducing manual data entry and improving user experience.

---

## 🎯 Goals

1. **Auto-populate all possible fields** from Google Maps lookup
2. **Remove redundant City field** from the form (auto-fill in background)
3. **Add Description field** to capture place information from Google
4. **Add Place Photo** to make activities visually recognizable
5. **Fix duplicate success toast** notifications bug

---

## 🔍 Current Issues

### Issue #1: Manual City Entry
- **Problem**: User must manually type city, even though it's in the Google Maps data
- **Impact**: Extra work, potential typos, inconsistent formatting
- **Solution**: Hide city field from UI, auto-populate from Google Maps lookup

### Issue #2: No Description Field
- **Problem**: Activities lack context/description from Google Maps
- **Current**: Only `notes` field exists (user's personal notes)
- **Missing**: Editorial summary/description from Google Places
- **Solution**: Add `description` field, auto-fill from Google Places API

### Issue #3: No Visual Identifier
- **Problem**: Activity cards all look the same (just MapPin icon)
- **Enhancement**: Fetch and display place photo from Google
- **Benefit**: Easier to scan timeline, more engaging UI

### Issue #4: Multiple Success Toasts
- **Problem**: After saving, multiple "Successfully updated" toasts appear
- **Likely Cause**: Notification triggered for each field update or multiple sync operations
- **Solution**: Debounce notifications or consolidate into single success message

---

## 📐 Data Model Changes

### Phase 1A: Add Description Field

**File**: `frontend/types/index.ts`

```typescript
export interface DailyActivity {
  id: string;
  trip_id: string;
  updated_at: string;
  name: string;
  date: string;
  order_index: number;
  description?: string;  // 🆕 NEW: Place description from Google
  city?: string;
  plus_code?: string;
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  image_url?: string;
  notes?: string;
}
```

**Rationale**:
- `description`: Auto-populated from Google Places API editorial summary
- `notes`: User's personal notes (separate from description)
- `image_url`: Already exists! Just needs to be populated

---

### Phase 1B: Update Database Schema

**Files**:
- `frontend/lib/db/schema.ts` - Add description to Dexie schema
- `frontend/lib/db/models.ts` - Update DailyActivity interface
- `frontend/lib/firebase/schema.ts` - Add description to Firestore schema
- `frontend/lib/firebase/converter.ts` - Update activity converters

**Migration**: Auto-handled by Dexie (optional field, defaults to undefined)

---

## 🌐 Google Maps API Enhancement

### Phase 2A: Fetch Place Photos

**Google Places API - Photo Reference**:
```json
{
  "photos": [
    {
      "photo_reference": "AeJxxx...",
      "height": 4032,
      "width": 3024
    }
  ]
}
```

**Photo URL Construction**:
```
https://maps.googleapis.com/maps/api/place/photo
  ?maxwidth=400
  &photo_reference=AeJxxx...
  &key=YOUR_API_KEY
```

**Options**:
1. **Direct URL** (Recommended): Store photo URL in `image_url` field
2. **Photo Reference**: Store reference, construct URL on-demand
3. **Download & Host**: Fetch and store on our server (complex, not recommended)

**Recommendation**: Use Option 1 (Direct URL) for simplicity

---

### Phase 2B: Fetch Place Description

**Google Places API - Editorial Summary**:

Two options:

**Option 1: Place Details API (New Fields)**
```
https://maps.googleapis.com/maps/api/place/details/json
  ?place_id=ChIJxxx
  &fields=editorial_summary
  &key=YOUR_API_KEY
```

Response:
```json
{
  "editorial_summary": {
    "overview": "Ornate temple constructed of white Italian marble & featuring a mix of European & Thai design."
  }
}
```

**Option 2: Text Search API (already used)**
- Already returns `types`, `formatted_address`
- Does NOT include editorial summary
- Need to call Place Details API separately

**Recommendation**: Add Place Details API call after Text Search to get photo + description

---

### Phase 2C: Implementation Details

**File**: `frontend/app/api/places/search/route.ts`

Current flow:
1. Extract place name from URL
2. Call Text Search API → get place_id
3. Return basic data

New flow:
1. Extract place name from URL
2. Call Text Search API → get place_id
3. **🆕 Call Place Details API** → get description + photo reference
4. **🆕 Construct photo URL**
5. Return enhanced data (name, address, coordinates, **description**, **photoUrl**)

**API Call Addition**:
```typescript
// After Text Search, get detailed info
const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=editorial_summary,photos&key=${apiKey}`;

const detailsResponse = await fetch(detailsUrl);
const detailsData = await detailsResponse.json();

// Extract description
const description = detailsData.result?.editorial_summary?.overview;

// Extract first photo
const photoReference = detailsData.result?.photos?.[0]?.photo_reference;
const photoUrl = photoReference 
  ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`
  : undefined;
```

---

**File**: `frontend/lib/services/placeSearchService.ts`

Update `PlaceSearchResult` interface:
```typescript
export interface PlaceSearchResult {
  success: boolean;
  name?: string;
  address?: string;
  plusCode?: string;
  city?: string;
  placeId?: string;
  location?: { lat: number; lng: number; };
  description?: string;  // 🆕 NEW
  photoUrl?: string;     // 🆕 NEW
  error?: string;
  errorType?: 'network' | 'invalid' | 'not_found' | 'quota_exceeded' | 'unknown';
}
```

---

## 🎨 UI/UX Changes

### Phase 3A: Update Activity Form

**File**: `frontend/components/edit/ActivitySection.tsx`

Changes:
1. **Remove City field** from form (auto-populate in background)
2. **Add Description field** (auto-filled, read-only or editable)
3. **Display photo preview** after lookup (if available)
4. **Keep Notes field** for user's personal notes (separate from description)

**Form Layout** (after lookup):
```
┌─────────────────────────────────────┐
│ ✓ Found: Wat Benchamabophit         │
│   [Photo Preview]                    │
│                                      │
│   Name: Wat Benchamabophit           │
│   Date: 01/11/2025                   │
│   Address: Bangkok, Thailand         │
│                                      │
│   Description: (auto-filled)         │
│   Ornate temple constructed of       │
│   white Italian marble...            │
│                                      │
│   Notes: (your personal notes)       │
│   └─────────────────────────────┘   │
│                                      │
│   [Add Activity]  [Cancel]           │
└─────────────────────────────────────┘
```

---

### Phase 3B: Update Activity Card Display

**File**: `frontend/components/ActivityCard.tsx`

**Collapsed View**:
- Show photo (if available) instead of MapPin icon ✅ (already implemented!)
- Show first line of description instead of city
- Falls back to MapPin icon if no photo

**Expanded View**:
- Keep current fields: address, coordinates, plus code
- Add description section (if available)
- Keep notes section separate

**Example**:
```
┌────────────────────────────────┐
│ [Photo] Tokyo Skytree       ▼ │  ← Collapsed
│         Iconic tower...         │
└────────────────────────────────┘

┌────────────────────────────────┐
│ [Photo] Tokyo Skytree       ▲ │  ← Expanded
│         Iconic tower...         │
├────────────────────────────────┤
│ Description:                    │
│ Tokyo's tallest structure...   │
│                                 │
│ Address: 1 Chome-1-2 Oshiage   │
│ Coordinates: 35.7101, 139.8107 │
│ Plus Code: 8Q7XQX4R+33          │
│                                 │
│ Notes:                          │
│ Visit around sunset for best   │
│ views. Buy tickets online.     │
└────────────────────────────────┘
```

---

## 🐛 Bug Fixes

### Phase 4: Fix Multiple Success Toasts

**Investigation needed**:
1. Check `frontend/components/edit/ActivitySection.tsx` - Are multiple saves triggered?
2. Check `frontend/lib/refine/providers/notificationProvider.ts` - Notifications logic
3. Check form submission handlers - Is onFinish called multiple times?

**Likely causes**:
- Form triggers notification for each field update
- Multiple sync operations each showing notification
- Refine's `useForm` triggering notifications for auto-save

**Solution approaches**:
1. **Debounce notifications**: Only show after 500ms if no other save
2. **Batch updates**: Combine multiple field updates into single save
3. **Single notification**: Show only one "Activity saved successfully" message
4. **Consolidate sync**: Show "Syncing to cloud..." once, not per-entity

**Implementation**:
```typescript
// Option 1: Debounce in notification provider
let notificationTimeout: NodeJS.Timeout | null = null;

export const notificationProvider = {
  open: (params) => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
    
    notificationTimeout = setTimeout(() => {
      // Show toast
      toast.success(params.message);
    }, 300); // Only show if no more notifications in 300ms
  }
};

// Option 2: Use a flag in form submission
let isSaving = false;

const handleSave = async () => {
  if (isSaving) return; // Prevent duplicate saves
  isSaving = true;
  
  try {
    // Save logic
  } finally {
    isSaving = false;
  }
};
```

---

## 📅 Implementation Phases

### ✅ Phase 0: Planning (Current)
- [x] Document current issues
- [x] Research Google Places API capabilities
- [x] Design data model changes
- [x] Create implementation plan

### 📦 Phase 1: Data Model & Schema (Estimated: 1-2 hours)
- [ ] Add `description` field to `DailyActivity` type
- [ ] Update database schema (Dexie)
- [ ] Update Firestore schema & converters
- [ ] Test schema migration

### 🌐 Phase 2: Google Maps API Enhancement (Estimated: 2-3 hours)
- [ ] Update API route to call Place Details API
- [ ] Extract `editorial_summary` (description)
- [ ] Extract photo reference and construct photo URL
- [ ] Update `PlaceSearchResult` interface
- [ ] Test with various places
- [ ] Handle cases where description/photo not available

### 🎨 Phase 3: UI Updates (Estimated: 2-3 hours)
- [ ] Remove City field from ActivitySection form
- [ ] Add Description field (auto-filled, read-only)
- [ ] Add photo preview after lookup
- [ ] Update ActivityCard collapsed view (show description)
- [ ] Update ActivityCard expanded view (show description separately from notes)
- [ ] Test responsive design (mobile/desktop)

### 🐛 Phase 4: Bug Fixes (Estimated: 1-2 hours)
- [ ] Investigate notification trigger points
- [ ] Implement debouncing or batch notifications
- [ ] Test save flow (single toast should appear)
- [ ] Handle edge cases (offline, errors)

### ✅ Phase 5: Testing & Refinement (Estimated: 1-2 hours)
- [ ] Test complete flow: paste URL → lookup → auto-fill → save
- [ ] Test with various Google Maps URLs
- [ ] Test with places that have/don't have photos
- [ ] Test with places that have/don't have descriptions
- [ ] Verify data persists correctly (IndexedDB + Firestore)
- [ ] Test on mobile devices
- [ ] Update documentation

**Total Estimated Time**: 7-12 hours

---

## 🔒 API Considerations

### Google Places API Quotas
- **Text Search**: $32 per 1,000 requests
- **Place Details** (with editorial_summary + photos): ~$17 per 1,000 requests
- **Place Photos**: Free (photo URL request doesn't count against quota)

**Cost per activity lookup**: ~$0.05 USD

**Recommendations**:
1. Cache results per place_id (avoid duplicate lookups)
2. Consider adding "Skip lookup" option for quick entries
3. Monitor API usage in Google Cloud Console

### Privacy & Storage
- **Photo URLs**: Store Google's CDN URL (not downloading/hosting)
- **Description**: Store as text (no copyright issues with factual descriptions)
- **Attribution**: Consider adding "Powered by Google" attribution if required

---

## 📝 Notes

### Design Decisions
1. **Description vs Notes**: Keep both separate
   - Description: Auto-filled from Google (factual, editorial)
   - Notes: User's personal notes (tips, preferences)

2. **City Field**: Hidden but stored
   - Not shown in UI (reduces clutter)
   - Still stored for filtering/grouping functionality
   - Auto-populated from Google Maps

3. **Photo Handling**: Use Google's CDN
   - Don't download and store locally (complex, storage costs)
   - Store photo URL (Google's CDN is reliable)
   - Fallback to MapPin icon if no photo

4. **Read-only vs Editable**: Description should be editable
   - Auto-filled from Google (convenience)
   - User can modify if needed (flexibility)
   - Clear visual distinction from Notes field

### Future Enhancements (Out of Scope)
- [ ] Bulk import activities from Google My Maps
- [ ] Activity categories/tags (restaurant, attraction, etc.)
- [ ] Opening hours from Google Places
- [ ] Price level indicators
- [ ] User ratings display

---

## 🚀 Getting Started

### Prerequisites
1. Ensure Google Maps API key has these APIs enabled:
   - ✅ Places API (Text Search) - already enabled
   - 🆕 Places API (Place Details) - need to enable
   - 🆕 Places API (Place Photos) - need to enable

2. Update API key permissions in Google Cloud Console

### Development Workflow
1. Create feature branch: `git checkout -b feature/activity-improvements`
2. Implement phases sequentially
3. Test each phase before moving to next
4. Commit after each completed phase
5. Create PR when all phases complete

---

## ✅ Acceptance Criteria

### Must Have
- [x] Plan documented
- [ ] Description field added and auto-populated
- [ ] Photo fetched and displayed
- [ ] City field removed from form (but still stored)
- [ ] Single success toast on save
- [ ] All data syncs correctly to Firestore
- [ ] Works on mobile and desktop

### Nice to Have
- [ ] Loading state during Google Maps lookup
- [ ] Photo preview with loading skeleton
- [ ] Graceful fallback if Google API fails
- [ ] Offline support (save without lookup)

---

## 📚 References

- [Google Places API - Place Details](https://developers.google.com/maps/documentation/places/web-service/details)
- [Google Places API - Photos](https://developers.google.com/maps/documentation/places/web-service/photos)
- [Google Places API - Text Search](https://developers.google.com/maps/documentation/places/web-service/search-text)
- [Editorial Summary Field](https://developers.google.com/maps/documentation/places/web-service/place-data-fields#editorial_summary)

---

**Last Updated**: October 19, 2025  
**Next Review**: After Phase 1 completion
