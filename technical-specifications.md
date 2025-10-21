# Travo - Technical Specifications

**Version**: 1.0  
**Last Updated**: October 15, 2025

---

## Architecture Overview

**Pattern**: Offline-first Progressive Web App  
**Rendering**: Server-side generation with client-side hydration  
**Data Flow**: IndexedDB (local) ↔ Firestore (cloud)  
**PWA Strategy**: Manual service worker with cache-first for app shell, IndexedDB-first for data

```
┌─────────────────────────────────┐
│         Next.js App             │
│         (Frontend)              │
└────────┬───────────────┬────────┘
         │               │
    ┌────┴─────┐    ┌───┴────────┐
    │          │    │   Service  │
┌───▼───┐  ┌──▼──────┐  Worker   │
│Dexie/ │  │Firebase │  (Cache   │
│IndexDB│  │Firestore│   API)    │
└───────┘  └─────────┘  └─────────┘
  Local      Cloud       Offline
  (Data)    (Sync)     (App Shell)
```

---

## Technology Stack

### Frontend Framework
- **Next.js 15.5.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.x** - Type safety with strict mode enabled
- **Refine.dev 5.0.4** - Framework for data-intensive applications
  - @refinedev/react-hook-form 5.0.1 - Form integration
  - @tanstack/react-query 5.90.3 - Query management (peer dependency)

### Progressive Web App
- **Manual Service Worker** - Simple, custom implementation (no plugins)
- **Cache API** - Browser-native caching for offline support
- **Web App Manifest** - PWA installability and branding

### UI & Styling
- **DaisyUI 5.2.0** - Component library
- **Tailwind CSS 4.1.14** - Utility-first CSS
- **Lucide React** - Icon library
- **@dnd-kit** - Drag-and-drop functionality

### Database & Storage
- **Dexie.js 4.2.1** - IndexedDB wrapper
- **IndexedDB** - Browser-native persistent storage

### Backend Services
- **Firebase 12.4.0** - Authentication and cloud storage
  - Firebase Auth (Google OAuth)
  - Firestore (cloud database)

### Utilities
- **@tanstack/react-query 5.90.3** - Data fetching and state management
- **date-fns 4.1.0** - Date/time formatting and manipulation
- **lodash 4.17.21** - Utility functions (sorting, data manipulation)
- **clsx** - Conditional class names
- **tailwind-merge** - Merge Tailwind classes
- **uuid** - Generate unique identifiers
- **react-hook-form** - Form state management

---

## Project Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page (trip list)
│   ├── globals.css               # Global styles
│   ├── api/                      # API routes
│   │   └── places/               # Google Maps integration
│   └── trip/                     # Trip pages
│       └── [tripId]/
│           ├── page.tsx          # Trip detail view
│           ├── activity/         # Activity detail pages
│           └── edit/
│               └── page.tsx      # Trip edit mode
│
├── components/                   # React components
│   ├── DatabaseProvider.tsx     # IndexedDB initialization
│   ├── SyncProvider.tsx          # Background sync controller
│   ├── ServiceWorkerRegistration.tsx # PWA service worker registration
│   ├── TripList.tsx              # Trip card list
│   ├── TripTimeline.tsx          # Day-by-day timeline
│   ├── TripMapView.tsx           # Map view with location markers
│   ├── TripNotes.tsx             # Trip notes with inline editing
│   ├── FlightCard.tsx            # Flight display
│   ├── HotelCard.tsx             # Hotel display
│   ├── ActivityCard.tsx          # Activity display
│   ├── RestaurantList.tsx        # Restaurant recommendations
│   └── edit/                     # Edit mode components
│       ├── EditModeLayout.tsx    # Edit mode wrapper
│       ├── CategoryNav.tsx       # Category navigation (5 tabs)
│       ├── FlightSection.tsx     # Flight editing
│       ├── HotelSection.tsx      # Hotel editing
│       ├── ActivitySection.tsx   # Activity editing
│       └── RestaurantSection.tsx # Restaurant editing
│
├── lib/                          # Core logic
│   ├── refine/                   # Refine.dev integration
│   │   ├── RefineProvider.tsx    # Main Refine wrapper
│   │   ├── providers/            # Refine providers
│   │   │   ├── dataProvider.ts   # IndexedDB data provider
│   │   │   ├── authProvider.ts   # Firebase auth provider
│   │   │   └── notificationProvider.ts # DaisyUI notifications
│   │   └── utils/
│   │       └── resultConverter.ts # Result<T> converters
│   │
│   ├── db/                       # Database layer
│   │   ├── index.ts              # Public API exports
│   │   ├── schema.ts             # Dexie schema definition
│   │   ├── models.ts             # TypeScript types
│   │   ├── init.ts               # DB initialization
│   │   ├── validation.ts         # Data validation
│   │   └── operations/           # CRUD operations
│   │       ├── base.ts           # Generic CRUD operations
│   │       ├── trips.ts          # Trip operations
│   │       ├── flights.ts        # Flight operations
│   │       ├── hotels.ts         # Hotel operations
│   │       ├── activities.ts     # Activity operations
│   │       └── restaurants.ts    # Restaurant operations
│   │
│   ├── firebase/                 # Firebase integration
│   │   ├── config.ts             # Firebase initialization
│   │   ├── auth.ts               # Authentication helpers
│   │   ├── firestore.ts          # Firestore operations
│   │   ├── schema.ts             # Firestore types
│   │   ├── converter.ts          # Type converters
│   │   └── sync.ts               # Pull sync from Firestore
│   │
│   ├── sync/                     # Push sync logic
│   │   ├── SyncQueue.ts          # Queue management
│   │   └── SyncService.ts        # Upload operations
│   │
│   ├── services/                 # External services
│   │   └── placeSearchService.ts # Google Maps API
│   │
│   ├── utils.ts                  # General utilities
│   ├── dateTime.ts               # Date formatting
│   └── tripLoader.ts             # Data loading helpers
│
├── contexts/                     # React contexts
│   └── AuthContext.tsx           # Authentication state
│
├── types/                        # TypeScript definitions
│   ├── index.ts                  # Core types (Trip, Activity, etc.)
│   └── editMode.ts               # Edit mode types
│
├── hooks/                        # Custom React hooks
│   └── usePagination.ts          # Pagination logic
│
├── config/                       # Configuration
│   └── theme.ts                  # Theme settings
│
└── public/                       # Static assets
    ├── sw.js                     # Service worker (PWA)
    ├── manifest.json             # Web app manifest (PWA)
    └── icons/                    # PWA icons
```

---

## Data Architecture

### IndexedDB Schema (Dexie v5)

**Database Name**: `TravoLocalDB`

**Tables**:

```typescript
trips: {
  id: string (PK)
  name: string
  description?: string
  start_date: string
  end_date: string
  home_location?: string
  updated_at: string
  deleted: boolean
  user_access: string[]
  updated_by: string
}

flights: {
  id: string (PK)
  trip_id: string (FK → trips.id)
  airline?: string
  flight_number?: string
  departure_time?: string (ISO 8601)
  arrival_time?: string
  departure_location?: string
  arrival_location?: string
  confirmation_number?: string
  notes?: string
  updated_at: string
  updated_by: string
}

hotels: {
  id: string (PK)
  trip_id: string (FK → trips.id)
  name?: string
  address?: string
  city?: string
  plus_code?: string
  check_in_time?: string (ISO 8601)
  check_out_time?: string
  confirmation_number?: string
  phone?: string
  notes?: string
  updated_at: string
  updated_by: string
}

activities: {
  id: string (PK)
  trip_id: string (FK → trips.id)
  name: string
  date: string (YYYY-MM-DD)
  start_time?: string (ISO 8601)
  duration_minutes?: number
  order_index: number
  city?: string
  plus_code?: string
  address?: string
  image_url?: string
  notes?: string
  updated_at: string
  updated_by: string
}

restaurants: {
  id: string (PK)
  trip_id: string (FK → trips.id)
  name: string
  city?: string
  cuisine_type?: string
  address?: string
  plus_code?: string
  phone?: string
  website?: string
  notes?: string
  updated_at: string
  updated_by: string
}

syncQueue: {
  id: string (PK)
  entity_type: 'trip' | 'flight' | 'hotel' | 'activity' | 'restaurant'
  entity_id: string
  trip_id?: string
  operation: 'create' | 'update' | 'delete'
  data?: any (serialized entity)
  created_at: string
  retries: number
  last_error?: string
}

authState: {
  id: string (PK, always 'current')
  user: AppUser | null (cached user object)
  lastVerified: number (timestamp of last Firebase verification)
}
```

**Indexes**:
- Trips: `id`, `deleted`, `updated_at`, `start_date`, `end_date`, `*user_access` (multi-entry)
- Flights: `id`, `trip_id`, `departure_time`, `updated_at`
- Hotels: `id`, `trip_id`, `check_in_time`, `city`, `updated_at`
- Activities: `id`, `trip_id`, `date`, `[trip_id+date+order_index]`, `city`, `updated_at`
- Restaurants: `id`, `trip_id`, `city`, `updated_at`
- SyncQueue: `id`, `entity_type`, `entity_id`, `created_at`, `retries`
- AuthState: `id` (single-row table for cached auth)

---

### Firestore Schema

**Collection Structure**:

```
trips/{tripId}
  ├── fields: id, name, destination, start_date, end_date, user_access, updated_by, updated_at, created_at
  ├── flights/{flightId}
  │   └── fields: id, trip_id, airline, flight_number, departure_time, arrival_time, departure_location, arrival_location, confirmation_number, notes, updated_by, updated_at
  ├── hotels/{hotelId}
  │   └── fields: id, trip_id, name, address, city, plus_code, check_in_time, check_out_time, confirmation_number, phone, notes, updated_by, updated_at
  ├── activities/{activityId}
  │   └── fields: id, trip_id, name, date, time_of_day, city, plus_code, address, notes, order_index, updated_by, updated_at
  └── restaurants/{restaurantId}
      └── fields: id, trip_id, name, city, cuisine_type, address, plus_code, notes, updated_by, updated_at
```

**Key Differences from IndexedDB**:
- Firestore uses `destination` instead of `description`
- Activities use `time_of_day` enum instead of `start_time` timestamp (optional field for display)
- No `deleted` flag in Firestore (soft deletes handled by IndexedDB only)

---

## Progressive Web App (PWA)

### Service Worker

**Implementation**: Manual service worker (`public/sw.js`)  
**Strategy**: Simple, maintainable caching without build-time plugins  
**Cache Name**: `travo-v1`

**Caching Strategy**:

1. **Install Phase**:
   - Cache core assets: `/`, `/manifest.json`, `/travo.png`, icons
   - `skipWaiting()` for immediate activation

2. **Activate Phase**:
   - Clean up old caches (versions other than `travo-v1`)
   - `clients.claim()` to take control immediately

3. **Fetch Phase** (Cache-first with network fallback):
   - **Cache hit**: Return cached response immediately
   - **Cache miss**: Fetch from network, then cache if successful
   - **Cached resources**:
     - All HTML pages (including dynamic routes like `/trip/[id]/activity/[id]`)
     - Images (logo, activity images)
     - Static assets (`/_next/static/`, `/_next/image/`)
   - **Network-only resources**:
     - API routes
     - Non-GET requests
     - External resources

**Registration**: `ServiceWorkerRegistration.tsx` component
- Registers on production only
- Checks for updates on page load
- Periodic update checks (every hour)
- No intrusive update prompts (silent background updates)

**Offline Behavior**:
- Visited pages work offline (served from cache)
- React app boots from cached HTML/JS
- Data loaded from IndexedDB (Dexie)
- Network requests fail gracefully
- Offline indicator shown in sync status

### Web App Manifest

**File**: `public/manifest.json`  
**Generated via**: Next.js metadata API in `app/layout.tsx`

**Configuration**:
```json
{
  "name": "Travo",
  "short_name": "Travo",
  "description": "Offline-first trip planning",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [...]
}
```

**Features**:
- Add to Home Screen on mobile/desktop
- Standalone app-like experience
- Custom splash screen
- Theme color integration

### Deployment Configuration

**Vercel Headers** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Content-Type", "value": "application/javascript; charset=utf-8" }
      ]
    },
    {
      "source": "/manifest.json",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" },
        { "key": "Cache-Control", "value": "public, max-age=3600, must-revalidate" }
      ]
    }
  ]
}
```

**Benefits of Manual Approach**:
- No outdated plugins fighting Next.js 15 App Router
- Simple, readable ~100 lines of JavaScript
- Easy to debug and customize
- No complex build-time configuration
- Aligns with official Next.js 15 PWA guidance

---

## Core Integrations

### Firebase Authentication

**Provider**: Google OAuth  
**Library**: Firebase Auth SDK  
**Implementation**: `lib/firebase/auth.ts`

```typescript
// Sign in with Google popup
signInWithGoogle() → Firebase User

// Sign out (also clears cached auth)
signOut() → void

// Auth state observer
onAuthStateChanged() → User | null
```

**Offline-First Architecture**:
1. **Cached Auth State** (`lib/db/operations/authState.ts`):
   - User authentication cached in IndexedDB
   - 10-day cache validity period
   - App starts immediately with cached user (no network wait)
   
2. **Three-Phase Loading** (`contexts/AuthContext.tsx`):
   - **Phase 1**: Load cached auth from IndexedDB (instant, non-blocking)
   - **Phase 2**: Check for OAuth redirect result (if returning from sign-in)
   - **Phase 3**: Subscribe to Firebase auth state (background verification)
   
3. **State Synchronization**:
   - Cached state used for immediate app start
   - Firebase verification runs in background
   - Cache updated when Firebase confirms user
   - Cache cleared on sign out or auth failure
   
4. **Offline Indicator**:
   - `isOffline` flag indicates using cached auth
   - Visual indicator in sync status component
   - Full read/write access with cached auth

**Context**: `AuthContext` wraps entire app, provides `user`, `firebaseUser`, `loading`, `error`, `isOffline` state.

---

### Firestore Sync

**Pull Sync** (Firestore → IndexedDB):
- Triggered on app initialization if user authenticated
- Fetches all trips where `user_access` includes user email
- Transforms Firestore documents to IndexedDB format
- Saves to local database using Dexie transactions

**Push Sync** (IndexedDB → Firestore):
- Operations queued in `syncQueue` table
- Background processing via `SyncProvider` using React Query
- Automatic triggers:
  - On create/update/delete operations
  - When app comes into focus (window focus/visibility change)
  - When device comes online (network reconnection)
  - Automatic background polling with exponential backoff
- Max 3 retries for failed operations
- Last-write-wins conflict resolution

**Converters**: `lib/firebase/converter.ts` provides bidirectional transformations between IndexedDB and Firestore formats.

---

### Google Maps API

**Endpoint**: `/api/places/search` (Next.js API route)  
**Purpose**: Extract place details from Google Maps share links  
**Flow**:

1. User pastes Google Maps URL (short or full)
2. Server resolves redirects (for short links)
3. Extract place_id from URL
4. Call Google Places API (Place Details)
5. Return normalized place data (name, address, Plus Code, coordinates)

**Environment Variables**:
- `GOOGLE_MAPS_API_KEY` - Server-side only

**Client Service**: `lib/services/placeSearchService.ts`

---

## State Management

### Provider Hierarchy

```typescript
<AuthProvider>                    // Firebase auth state (with cached auth)
  <DatabaseProvider>              // IndexedDB initialization
    <RefineProvider>              // Refine data/auth/notification
      <SyncProvider>              // Background sync controller
        <ServiceWorkerRegistration> // PWA service worker
          {children}              // App content
        </ServiceWorkerRegistration>
      </SyncProvider>
    </RefineProvider>
  </DatabaseProvider>
</AuthProvider>
```

**Load Sequence**:
1. AuthProvider loads cached auth from IndexedDB (instant)
2. App can render immediately with cached user
3. Firebase verifies in background
4. DatabaseProvider initializes IndexedDB
5. SyncProvider starts background sync (if online)
6. ServiceWorkerRegistration registers PWA (on window load, production only)

### Local State
- Component-level: `useState` for UI state
- Forms: Refine's `useForm` with react-hook-form integration
  - Automatic data loading from IndexedDB
  - Built-in validation and error handling
  - Optimistic updates and cache management
- Timeline: `useMemo` for derived data (day grouping, sorting)

### Global State
- Auth: `AuthContext` (user, loading, error)
- Data operations: Refine's data provider
  - Automatic caching with TanStack Query
  - Built-in mutations (create, update, delete)
  - Automatic notifications on success/error
  - Cache invalidation on mutations
- Sync: React Query manages sync queue state with automatic background refetch
  - `useSyncStatus()` hook provides pending count, failed count, sync trigger
  - Automatic cache invalidation and refetch on focus/reconnect

### Refine Integration

**Data Provider** (`lib/refine/providers/dataProvider.ts`):
- Bridges Refine operations to IndexedDB via Dexie
- Resource registry: trips, hotels, activities, flights, restaurants
- Supports nested resource filtering via `meta.tripId`
- Returns `Result<T>` pattern from DB operations
- Automatic error handling and transformation

**Auth Provider** (`lib/refine/providers/authProvider.ts`):
- Integrates Firebase Auth with Refine
- Google OAuth sign-in flow
- Session persistence and auto-refresh
- User identity management

**Notification Provider** (`lib/refine/providers/notificationProvider.ts`):
- DaisyUI toast-based notifications
- Auto-dismiss after 4 seconds
- Success/error/warning/info types
- Triggered automatically by mutations

**Form Management**:
- Edit Mode uses `useForm` from @refinedev/react-hook-form
- Automatic data loading for trip details
- Trip-level fields saved via Refine's `onFinish`
- Nested entities (hotels, activities, flights) use mutation hooks
- Custom `bulkUpdateActivities` for drag-drop reordering

---

## Key Algorithms

### Timeline Day Grouping

```typescript
// 1. Collect all timeline items (flights, hotels, activities)
// 2. Sort chronologically using lodash orderBy with custom sort key
// 3. Group by date (YYYY-MM-DD)
// 4. Assign day numbers (1, 2, 3...)
// 5. Assign colors (cycle through palette)
// 6. Add hotel continuity (check-in vs. staying indicators)
```

**Sorting Priority** (using `lodash.orderBy`):
1. Items with timestamps → sort by timestamp
2. Items with same timestamp → sort by order_index
3. Items without timestamps → sort by order_index

**Implementation**: `lib/utils.ts` provides `sortChronologically()` helper using lodash for reliable sorting.

### Sync Queue Processing

```typescript
// 1. Fetch all queued entries from IndexedDB
// 2. Filter out entries with >= 3 retries
// 3. For each entry:
//    a. Transform data to Firestore format
//    b. Call appropriate Firestore operation (setDoc/deleteDoc)
//    c. On success: remove from queue
//    d. On failure: increment retry count, store error
// 4. Return summary (success count, failed count)
```

---

## Build & Deployment

### Development

```bash
cd frontend
npm install
npm run dev          # Start dev server on localhost:3000
```

### Production Build

```bash
npm run build        # Next.js build with PWA assets
npm run start        # Serve production build
```

**Build Process**:
1. Next.js compiles TypeScript and React components
2. Static assets optimized and bundled
3. `public/sw.js` copied to build output (no compilation)
4. `public/manifest.json` served via Next.js metadata
5. PWA icons copied from `public/icons/`

### Environment Variables

Required for production:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Google Maps (server-side only)
GOOGLE_MAPS_API_KEY=xxx
```

### Theme Builds

Theme configured in `config/theme.ts`:

```typescript
export const ACTIVE_THEME = 'default' | 'blue' | 'green' | 'red' | 'violet'
```

Rebuild after changing theme to apply to static pages.

---

## Error Handling

### Pattern

```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: DbError }
```

All database operations return `Result<T>` for explicit error handling.

### Error Types

- `ValidationError` - Invalid data format
- `DatabaseError` - IndexedDB operation failed
- `QuotaExceededError` - Storage quota exceeded
- `NotFoundError` - Entity not found
- `NetworkError` - Firebase/API call failed

### User-Facing Errors

- Database init failure → Full-screen error with retry button
- Sync failures → Subtle badge with failed count
- Maps API failures → Inline error message in form
- Auth failures → Login button with error message

---

## Performance Considerations

### Optimizations

- **Static generation** where possible (Next.js)
- **Lazy loading** of edit mode components
- **Indexed queries** for timeline grouping (compound index on activities)
- **Batch operations** for sync queue processing
- **Memoization** of timeline calculations
- **Debounced sync** triggers (1 second after initial load)

### Bottlenecks

- Large trip datasets (>100 trips, >1000 activities) may slow timeline rendering
- Google Maps API lookups block form submission (2-3 second latency)
- Sync queue processing is sequential (parallel may cause conflicts)

---

## Testing Strategy

### Current State
- No automated tests implemented
- Manual testing for user flows

### Recommended Approach
- Unit tests for utilities (dateTime, sorting, transformations)
- Integration tests for database operations
- E2E tests for critical flows (login, view trip, edit trip)
- Mock Firebase and Google Maps in tests

---

## Security

### Firebase Security Rules

```javascript
// trips collection
allow read: if request.auth != null 
            && request.auth.token.email in resource.data.user_access;
            
allow write: if request.auth != null 
             && request.auth.token.email in resource.data.user_access;
```

### API Security

- Google Maps API key restricted to specific domains
- Firebase config exposed client-side (normal for web apps)
- No sensitive data in IndexedDB (stored in browser storage)

---

## Migration & Versioning

### Database Migrations

Dexie handles schema migrations automatically. Current version: **v8**

**Migration v2 → v3**:
- Added `user_access`, `updated_by` fields
- Initialized existing records with defaults

**Migration v3 → v4**:
- Added `syncQueue` table
- No data transformation required

**Migration v4 → v5**:
- Removed deprecated `places` table
- No data transformation required (table was unused)

**Migration v5 → v6**:
- Added location fields (`google_maps_url`, `latitude`, `longitude`)
- No data migration required (optional fields)

**Migration v6 → v7**:
- Added `description` field to activities
- No data migration required (optional field)

**Migration v7 → v8**:
- Added `authState` table for offline-first authentication
- Enables app to start with cached auth (no network wait)
- 10-day cache validity with automatic expiration

### Future Migrations

To add new fields:
1. Increment version in `schema.ts`
2. Define new table structure
3. Add `.upgrade()` function to transform existing data
4. Test thoroughly in dev environment

---

## Known Limitations

- No conflict resolution for concurrent edits (last-write-wins)
- Google Maps API quota limits apply (free tier)
- Browser storage quota (~50MB typical, varies by browser)
- No batch edit operations (edit one item at a time)
- Short link resolution requires network (can't be fully offline)
- No undo/redo functionality
- Sync failures require manual retry after 3 attempts
- Cached auth expires after 10 days offline (requires re-authentication)
- PWA offline support requires visiting pages while online first (cache-on-visit)
- Service worker cache updates on page reload (not real-time)
- No iOS push notification support (requires app added to home screen)
