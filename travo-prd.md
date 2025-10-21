# Travo - Product Requirements Document

**Product Name**: Travo  
**Version**: 1.0  
**Last Updated**: October 15, 2025

---

## Product Overview

Travo is an offline-first trip planning application that allows users to organize and view their travel itineraries. Built with privacy in mind, it stores trip data locally on the device with optional cloud sync for backup and multi-device access.

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

### 2. Day-by-Day Timeline

**Chronological View**
- Visual timeline organized by days of the trip
- Color-coded day indicators for easy navigation
- Carousel navigation between days with prev/next controls
- Smooth scrolling to specific days

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

**Notes System**
- Trip-level notes (general trip information)
- Entity-level notes (specific to flights, hotels, activities)
- Notes display contextually in view mode

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

### 7. Theme System

**Visual Themes**
- DaisyUI-based theme system
- Multiple color schemes supported (default, blue, green, red, violet)
- Consistent styling across all pages
- Dark theme optimized

---

### 8. Location Data

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

### View Trip Details
1. Click trip card from list
2. View trip header with dates and description
3. Navigate day-by-day timeline
4. Click day buttons to jump to specific date
5. View restaurants section below timeline

### Edit Trip
1. Click "Edit" button on trip page
2. Select category (Flights, Hotels, Attractions, Notes)
3. Add items via Google Maps links
4. Reorder items with drag-and-drop
5. Add notes to trip or individual items
6. Changes save automatically to IndexedDB
7. Changes sync to Firestore in background

### Add Activity
1. Enter edit mode → Attractions section
2. Click "Add Place" button
3. Paste Google Maps share link
4. System fetches place details automatically
5. Confirm and save
6. Activity appears in timeline immediately

---

## Technical Constraints

### Browser Requirements
- Modern browsers with IndexedDB support (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Local storage quota sufficient (~50MB+ available)

### Network Requirements
- **Offline**: Full read/write access with cached auth (up to 10 days), edit operations queued
- **Online**: Cloud sync, Firebase auth verification, Google Maps API lookups

### Data Limits
- No hard limit on trips per user
- Typical usage: <100 trips, <500 activities per trip
- Google Maps API quota: Standard free tier limits apply

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

---

## Success Metrics

- Users can view trip details within 2 seconds of page load (even offline)
- App starts immediately with cached auth (no network wait)
- Edit operations complete in under 30 seconds (including Maps lookup)
- 100% data persistence across browser sessions
- Offline functionality available for all viewing and editing operations
- Sync queue processes pending operations within 1 minute when online
- Auth cache valid for 10 days without network connection

---

## Privacy & Security

- Data stored locally on user's device
- Cloud sync optional (user controls via login)
- Firebase security rules enforce user access control
- No tracking or analytics implemented
- Google OAuth for secure authentication
