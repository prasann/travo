# Travo - Product Requirements Document

**Product Name**: Travo  
**Version**: 1.0  
**Last Updated**: October 15, 2025

---

## Product Overview

Travo is an offline-first Progressive Web App (PWA) for trip planning that allows users to organize and view their travel itineraries. Built with privacy in mind, it stores trip data locally on the device with optional cloud sync for backup and multi-device access. The app can be installed on mobile and desktop devices and works seamlessly offline after visiting pages while online.

---

## Core Features

### 1. Trip Management

**View Trips**
- Browse all trips in a card-based list view
- See trip name, dates, and destination at a glance
- Navigate to detailed trip view

**Trip Details**
- View comprehensive trip information (name, dates, description)
- See destination and home location
- View all trip components organized chronologically

---

### 2. View Modes

**Timeline View**
- Day-by-day chronological view of trip activities
- Color-coded day indicators for easy navigation
- Carousel navigation between days with prev/next controls
- Smooth scrolling to specific days

**Map View**
- Visual map showing all trip locations
- Hotels, activities, and restaurants plotted on map
- Interactive markers with place details

**Notes View**
- Trip-level notes for planning and reference
- Inline editing (double-click to edit)
- Supports long-form text with multiple paragraphs
- Changes saved immediately to local database

### 3. Day-by-Day Timeline

**Chronological View**

**Timeline Items**
- **Flights**: Airline, flight number, departure/arrival times and locations, confirmation number, notes
- **Hotels**: Hotel name, address, check-in/check-out dates, city, confirmation number, notes
- **Activities**: Place name, date, start time, duration, address, city, notes, display order

**Hotel Continuity**
- Check-in shown on first day of stay
- Subsequent days show "Staying at [Hotel Name]" indicator
- Visual continuity across multi-day hotel stays

**Timestamp Handling**
- Items with specific times shown chronologically by time
- Items without times sorted by order index
- Flexible scheduling for planned and unplanned activities

---

### 3. Restaurant Recommendations

**Dining Reference**
- View restaurant suggestions grouped by city
- See name, cuisine type, address, city, notes
- Separate from daily timeline (non-scheduled recommendations)

---

### 4. Edit Mode

**Access**
- Edit button on trip detail page
- Category-based editing interface (Flights, Hotels, Attractions, Notes)

**Add Places via Google Maps**
- Paste Google Maps share links (short links or full URLs)
- Automatic place details lookup (name, address, location)
- Plus Code integration for precise location storage

**Manage Activities**
- Add new attractions with Maps link lookup
- Drag-and-drop reordering within days
- Delete activities (no confirmation required)
- Add notes to individual activities

**Manage Hotels**
- Add hotels with Plus Code lookup
- Edit check-in/check-out dates
- Add hotel-specific notes
- Delete hotels

**Manage Flights**
- View existing flights (read-only details from seed data)
- Add flight-specific notes

**Entity-Level Notes**
- Flight, hotel, activity, and restaurant notes (edited in edit mode)
- Notes display contextually in timeline view

**Data Restrictions**
- Auto-populated fields (name, address from Maps API) are read-only
- To correct details: delete and re-add with correct Plus Code
- Changes saved to local database immediately

---

### 5. Firebase Authentication & Sync

**Google Sign-In**
- Sign in with Google account
- Firebase Authentication integration
- Login button on home page when not authenticated

**Offline-First Authentication**
- Authentication state cached in IndexedDB (10-day validity)
- App starts immediately with cached user data, even offline
- Firebase verifies auth in background when online
- Seamless transition from cached to verified state
- Automatic cache refresh on successful verification

**Cloud Sync**
- **Pull Sync**: Download trips from Firestore on login
- **Push Sync**: Upload local changes to Firestore automatically
- Background sync with retry logic for failed uploads
- Sync status indicator showing pending/failed/offline operations

**Sync Queue**
- Automatic queuing of create, update, delete operations
- Retry logic for failed syncs (max 3 retries)
- Visibility and online event triggers for opportunistic sync
- Manual sync trigger available

**Multi-Device Support**
- Share trips across devices via cloud sync
- User access control (trip.user_access array)
- Last-write-wins for concurrent edits (no conflict resolution)

---

### 6. Offline-First Storage

**Local Database**
- IndexedDB storage using Dexie.js wrapper
- All data available offline after initial sync
- Persistent across browser sessions
- No network required for viewing or editing
- Cached authentication state for offline access

**Data Model**
- Trips with associated flights, hotels, activities, restaurants
- Soft delete support (trips can be recovered)
- Updated timestamps for sync tracking
- Referential integrity between trips and nested entities
- Auth state cache with last verification timestamp

---

### 7. Progressive Web App (PWA)

**Installability**
- Add to Home Screen on mobile devices (iOS/Android)
- Standalone app experience (no browser chrome)
- Custom app icon and splash screen
- Desktop installation support (Chrome, Edge)

**Offline Support**
- Service worker caches visited pages
- App shell (HTML/JS/CSS) available offline
- Logo and icons cached on install
- Static assets cached automatically
- Works offline after visiting pages while online

**Caching Strategy**
- Cache-first for visited pages and static assets
- Network-first for new pages
- IndexedDB-first for trip data
- Automatic cache updates on page reload

**Installation Flow**
1. Visit site on mobile browser
2. Browser shows "Add to Home Screen" prompt
3. User installs, gets app icon on home screen
4. Opens like a native app

**Offline Flow**
1. User visits pages while online (cached automatically)
2. Goes offline (airplane mode, no connection)
3. Opens app - loads from cache
4. Views cached trips and activities
5. Data read from IndexedDB
6. Can edit trip notes (Notes tab)
7. Edit Trip button disabled (requires internet for Maps API)

---

### 8. Theme System

**Visual Themes**
- DaisyUI-based theme system
- Multiple color schemes supported (default, blue, green, red, violet)
- Consistent styling across all pages
- Dark theme optimized

---

### 9. Location Data

**Google Plus Codes**
- Compact, offline-friendly location format
- Each place stores Plus Code for precise location
- Convertible to coordinates and addresses
- Compatible with Google Maps URLs

**Address Information**
- Full formatted addresses from Google Maps API
- City grouping for hotels and restaurants
- Human-readable location display

---

## User Flows

### First-Time User
1. Open app → See login prompt
2. Sign in with Google
3. Database initializes and syncs from Firestore
4. Auth state cached for offline access
5. View trip list (if trips exist in cloud)

### Returning User (Offline)
1. Open app → Loads cached auth from IndexedDB
2. App starts immediately with existing data
3. Firebase verifies auth in background (when online)
4. "Offline" indicator shown in sync status
5. Full read/write access to cached trips
6. Service worker serves cached pages
7. All visited pages work offline

### Install PWA
1. Visit site on mobile/desktop browser
2. See "Add to Home Screen" prompt (or manual install via browser menu)
3. Tap install
4. App icon appears on home screen/desktop
5. Opens in standalone mode (no browser UI)

### View Trip Details
1. Click trip card from list
2. View trip header with dates and description
3. Switch between Timeline, Map, and Notes views using tabs
4. Timeline: Navigate day-by-day, click day buttons to jump to specific date
5. Map: View all locations plotted on interactive map
6. Notes: View and edit trip notes with double-click
7. View restaurants section below (in Timeline/Map views)

### Edit Trip
1. Click "Edit" button on trip page (requires internet connection)
2. Select category (Flights, Hotels, Attractions, Restaurants)
3. Add items via Google Maps links
4. Reorder items with drag-and-drop
5. Add notes to individual items
6. Changes save automatically to IndexedDB
7. Changes sync to Firestore in background

**Note**: Edit mode is disabled when offline since adding places requires Google Maps API lookups.

### Add Activity
1. Enter edit mode → Attractions section
2. Click "Add Place" button
3. Paste Google Maps share link
4. System fetches place details automatically
5. Confirm and save
6. Activity appears in timeline immediately

### Edit Trip Notes
1. Navigate to trip detail page
2. Click "Notes" tab (next to Timeline and Map)
3. Double-click notes area or click "Edit" button
4. Type or edit notes (supports multiple paragraphs)
5. Click "Save Notes" or "Cancel"
6. Changes saved immediately to local database
7. Syncs to cloud in background

---

## Technical Constraints

### Browser Requirements
- Modern browsers with IndexedDB and Service Worker support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage quota sufficient (~50MB+ available)
- PWA installation support (optional, but recommended)

### Network Requirements
- **First Use**: Internet required for initial setup and data sync
- **Offline**: Full read/write access with cached auth (up to 10 days), edit operations queued
- **Online**: Cloud sync, Firebase auth verification, Google Maps API lookups
- **Offline Pages**: Must visit pages while online first (cache-on-visit strategy)

### Data Limits
- No hard limit on trips per user
- Typical usage: <100 trips, <500 activities per trip
- Google Maps API quota: Standard free tier limits apply
- Browser cache storage: ~50-100MB typical, varies by browser

---

## Out of Scope (Current Version)

- Real-time collaboration
- Conflict resolution for concurrent edits
- Undo/redo functionality
- Trip sharing with other users
- Trip export (PDF, iCal, etc.)
- Budget tracking
- Weather integration
- Route optimization
- Photos/media attachments
- Recurring trips or templates
- Multi-language support
- iOS push notifications (requires home screen installation)
- Background sync API (uses simpler visibility/focus triggers)

---

## Success Metrics

- Users can view trip details within 2 seconds of page load (even offline)
- App starts immediately with cached auth (no network wait)
- Edit operations complete in under 30 seconds (including Maps lookup)
- 100% data persistence across browser sessions
- Offline functionality available for all viewing and editing operations
- Sync queue processes pending operations within 1 minute when online
- Auth cache valid for 10 days without network connection
- Visited pages work offline immediately after first visit
- PWA installs successfully on mobile and desktop browsers
- Service worker updates smoothly without disrupting user experience

---

## Privacy & Security

- Data stored locally on user's device
- Cloud sync optional (user controls via login)
- Firebase security rules enforce user access control
- No tracking or analytics implemented
- Google OAuth for secure authentication
