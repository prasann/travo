# Travo - Product Requirements Document

**Version**: 1.0  
**Last Updated**: October 21, 2025

---

## Overview

Offline-first Progressive Web App for trip planning. Stores data locally (IndexedDB) with optional cloud sync (Firebase). Works seamlessly offline after initial visit.

---

## Features

### 1. Trip Management
- View trips in card-based list
- Trip details: name, dates, destination, home location
- Timeline, Map, and Notes views

### 2. View Modes

**Timeline View**:
- Day-by-day chronological view
- Color-coded days with carousel navigation
- Flights, hotels, activities organized by date
- Hotel continuity indicators (multi-day stays)

**Map View**:
- All trip locations plotted on interactive map
- Markers for hotels, activities, restaurants

**Notes View**:
- Trip-level notes with inline editing
- Double-click to edit, immediate save

### 3. Timeline Items

**Flights**: Airline, flight number, departure/arrival times/locations, confirmation, notes  
**Hotels**: Name, address, city, check-in/out dates, confirmation, notes  
**Activities**: Name, date, start time, duration, address, city, notes, display order  
**Restaurants**: Name, cuisine, address, city, notes (separate from timeline)

### 4. Edit Mode

**Access**: Edit button on trip page (requires internet for Maps API)

**Features**:
- Category tabs: Flights, Hotels, Attractions, Restaurants, Notes
- Add places via Google Maps links (auto-lookup name, address, Plus Code)
- Drag-and-drop reordering
- Add/edit notes per item
- Delete items (no confirmation)
- Auto-populated fields are read-only (delete + re-add to correct)

### 5. Authentication & Sync

**Google Sign-In**:
- Firebase Authentication
- Cached auth (10-day validity) for offline access

**Cloud Sync**:
- Pull: Real-time Firestore listeners (instant updates from cloud)
- Push: Auto-upload changes in background
- Sync queue with retry logic (max 3)
- Manual pull-to-refresh gesture and button
- Expandable sync status indicator with details

**Offline-First**:
- App starts immediately with cached auth
- Firebase verifies in background when online
- Full access to cached data offline

### 6. Progressive Web App

**Installability**:
- Add to Home Screen (mobile/desktop)
- Standalone mode (no browser chrome)
- Custom icon and splash screen

**Offline Support**:
- Service worker caches visited pages
- Works offline after visiting pages online
- IndexedDB-first for data
- Cache-first for app shell

### 7. Location Data

**Google Plus Codes**:
- Compact, offline-friendly location format
- Precise coordinates
- Compatible with Google Maps URLs

---

## User Flows

### First-Time User
1. Sign in with Google
2. DB initializes and syncs from Firestore
3. Auth cached for offline access
4. View trips

### Returning User (Offline)
1. App starts with cached auth
2. Firebase verifies in background (when online)
3. Full read/write access to cached trips
4. Service worker serves cached pages

### Install PWA
1. Visit site, see install prompt
2. Install → app icon on home screen/desktop
3. Opens in standalone mode

### View Trip
1. Click trip card
2. View Timeline/Map/Notes tabs
3. Navigate day-by-day in timeline
4. Double-click notes to edit

### Edit Trip
1. Click Edit (requires internet)
2. Select category (Flights/Hotels/Attractions/Restaurants)
3. Add items via Maps links
4. Drag-drop to reorder
5. Changes save to IndexedDB, sync in background

---

## Technical Constraints

**Browser**: Modern browsers with IndexedDB, Service Worker support  
**Network**: Internet required for first use and edit mode (Maps API)  
**Storage**: ~50-100MB typical browser cache  
**Offline**: Must visit pages online first (cache-on-visit)

---

## Out of Scope

- Real-time collaboration
- Conflict resolution (uses last-write-wins)
- Undo/redo
- Trip sharing with other users
- Export (PDF, iCal)
- Budget tracking
- Weather/photos/media
- Multi-language support
- Background sync API (uses simpler triggers)

---

## Success Metrics

- 2s page load (even offline)
- Instant app start with cached auth
- 30s edit operations (including Maps lookup)
- 100% data persistence across sessions
- Sync queue processes within 1 minute online
- 10-day auth cache validity
- Smooth PWA updates

---

## Security & Privacy

- Local-first storage
- Cloud sync optional (via login)
- Firebase security rules enforce access control
- Google OAuth
- No tracking/analytics
