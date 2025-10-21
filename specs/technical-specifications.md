# Travo - Technical Specifications

**Version**: 1.0  
**Last Updated**: October 21, 2025

---

## Architecture Overview

**Pattern**: Offline-first Progressive Web App  
**Data Flow**: IndexedDB (local) ↔ Firestore (cloud)  
**PWA Strategy**: Manual service worker, cache-first for app shell, IndexedDB-first for data

---

## Tech Stack

### Core
- **Next.js 15.5.4** - App Router, SSR/SSG
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Strict mode
- **Refine.dev 5.0.4** - Data-intensive app framework

### UI
- **DaisyUI 5.2.0** + **Tailwind CSS 4.1.14** - Component library + utilities
- **Lucide React** - Icons
- **@dnd-kit** - Drag-and-drop

### Database & Storage
- **Dexie.js 4.2.1** - IndexedDB wrapper
- **Firebase 12.4.0** - Auth (Google OAuth) + Firestore

### Utilities
- **@tanstack/react-query 5.90.3** - Data fetching/caching
- **date-fns 4.1.0** - Date/time handling
- **react-hook-form** - Form management

---

## Project Structure

```
frontend/
├── app/                  # Next.js App Router (pages, layouts, API)
├── components/           # React components (UI + edit mode)
├── lib/                  # Core logic
│   ├── db/              # Database layer (Dexie schema, operations)
│   ├── firebase/        # Firebase integration (auth, firestore, sync)
│   ├── sync/            # Push sync logic (queue, service)
│   ├── refine/          # Refine.dev providers (data, auth, notifications)
│   └── services/        # External services (Google Maps API)
├── contexts/            # React contexts (Auth)
├── types/               # TypeScript definitions
├── hooks/               # Custom hooks
├── config/              # Configuration (theme)
└── public/              # Static assets (sw.js, manifest, icons)
```

---

## Data Architecture

### IndexedDB Schema (Dexie v8)

**Database**: `TravoLocalDB`

**Tables**:
- `trips` - id, name, description, start_date, end_date, home_location, deleted, user_access[], updated_at, updated_by
- `flights` - id, trip_id, airline, flight_number, departure/arrival times/locations, confirmation_number, notes
- `hotels` - id, trip_id, name, address, city, plus_code, check_in/out times, confirmation_number, notes
- `activities` - id, trip_id, name, date, start_time, duration_minutes, order_index, city, plus_code, address, notes
- `restaurants` - id, trip_id, name, city, cuisine_type, address, plus_code, notes
- `syncQueue` - id, entity_type, entity_id, operation, data, created_at, retries, last_error
- `authState` - id, user, lastVerified (cached auth, 10-day validity)

**Key Indexes**:
- Activities: `[trip_id+date+order_index]` for timeline queries
- All tables: `trip_id`, `updated_at`

### Firestore Schema

**Collections**: `trips/{tripId}` with subcollections for flights, hotels, activities, restaurants

**Key Differences**:
- Uses `destination` (not `description`)
- Activities use `time_of_day` enum (not `start_time`)
- No `deleted` flag (soft deletes in IndexedDB only)

---

## Core Features

### Offline-First Authentication
1. Auth cached in IndexedDB (10-day validity)
2. App starts with cached user (no network wait)
3. Firebase verifies in background when online
4. Full read/write access with cached auth

### Sync Strategy

**Pull Sync** (Firestore → IndexedDB):
- Real-time Firestore listeners (`onSnapshot()`)
- Automatic updates when trips change in cloud
- Zero polling, instant synchronization
- Offline-safe: queues updates until reconnected
- Manual pull-to-refresh available (swipe gesture + button)
- Cost-efficient: only charged for actual document changes

**Push Sync** (IndexedDB → Firestore):
- Operations queued in `syncQueue`
- Auto-triggers: on mutations, background polling (30s intervals)
- Max 3 retries, last-write-wins

### PWA Implementation

**Service Worker** (`public/sw.js`):
- Cache-first for visited pages + static assets
- Network-first for new pages
- Core assets cached on install
- Silent background updates

**Manifest** (`public/manifest.json`):
- Standalone mode, installable on mobile/desktop
- Custom icons and theme

---

## Provider Hierarchy

```
AuthProvider (Firebase + cached auth)
  └── DatabaseProvider (IndexedDB init)
      └── RefineProvider (data/auth/notifications)
          └── SyncProvider (background sync)
              └── ServiceWorkerRegistration (PWA)
```

---

## State Management

- **Auth**: `AuthContext` (user, loading, error, isOffline)
- **Data**: Refine data provider → IndexedDB via Dexie
- **Forms**: `useForm` from @refinedev/react-hook-form
- **Sync**: React Query with real-time Firestore listeners

## Real-Time Sync Implementation

### Firestore Listener Setup
- `setupTripsListener()` in `lib/firebase/firestore.ts`
- Uses `onSnapshot()` for real-time updates
- Automatically reconnects after offline periods
- Delivers all missed changes when back online

### Sync Flow
1. User authenticates → Listener starts
2. Trip changes in Firestore → `onSnapshot` callback fires
3. Pull full trip data with relations (flights, hotels, activities, restaurants)
4. Save to IndexedDB via `saveRealtimeUpdates()`
5. Invalidate React Query cache
6. UI automatically refreshes

### Offline Behavior
- Listener only active when online AND authenticated
- No errors when offline (graceful degradation)
- Firestore queues updates server-side
- All changes delivered on reconnection
- Zero data loss guaranteed by Firebase SDK

### Cost Optimization
- No periodic polling (eliminated 5-min checks)
- Only charged for actual document changes
- Typical usage: 1 initial read + ~5 changes/day = 6 reads/day/user
- 95%+ cost reduction vs polling approach

---

## Key Algorithms

### Timeline Day Grouping
1. Collect flights, hotels, activities
2. Sort chronologically (lodash orderBy by timestamp/order_index)
3. Group by date
4. Assign day numbers and colors
5. Add hotel continuity indicators

### Sync Queue Processing
1. Fetch queued entries (retries < 3)
2. Transform to Firestore format
3. Execute operations (setDoc/deleteDoc)
4. On success: remove from queue
5. On failure: increment retries, log error

---

## Error Handling

**Pattern**: All DB operations return `Result<T>`
```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: DbError }
```

**User-Facing**:
- DB init failure → full-screen error with retry
- Sync failures → badge with count
- Maps API failures → inline form error
- Auth failures → login prompt with message

---

## Build & Deployment

```bash
npm run dev          # Development server
npm run build        # Production build
```

**Environment Variables**:
- `NEXT_PUBLIC_FIREBASE_*` - Firebase config (client-side)
- `GOOGLE_MAPS_API_KEY` - Server-side only

**Theme**: Configure in `config/theme.ts`, rebuild to apply

---

## Known Limitations

- Last-write-wins (no conflict resolution)
- Google Maps API quota (free tier)
- Browser storage quota (~50MB typical)
- Cached auth expires after 10 days offline
- PWA requires visiting pages online first (cache-on-visit)
- No undo/redo
- Sync failures require manual retry after 3 attempts
