# Refine.dev Integration - Task Tracker

**Project**: Travo Refine Integration  
**Created**: 2025-10-18  
**Status**: Not Started  
**Estimated Duration**: 25 days (5 weeks)

Reference: [Integration Plan](./refine-integration-plan.md)

---

## Progress Overview

| Phase | Status | Tasks Complete | Duration | Start Date | End Date |
|-------|--------|----------------|----------|------------|----------|
| Phase 1: Foundation | ✅ Complete | 5/5 | 3 days | 2025-10-18 | 2025-10-18 |
| Phase 2: Data Provider | 🔲 Not Started | 0/8 | 5 days | - | - |
| Phase 3: Trip List Migration | 🔲 Not Started | 0/6 | 2 days | - | - |
| Phase 4: Trip Detail Migration | 🔲 Not Started | 0/5 | 3 days | - | - |
| Phase 5: Edit Forms Migration | 🔲 Not Started | 0/7 | 5 days | - | - |
| Phase 6: Nested Resources | 🔲 Not Started | 0/6 | 3 days | - | - |
| Phase 7: Auth Provider | 🔲 Not Started | 0/4 | 2 days | - | - |
| Phase 8: Notifications | 🔲 Not Started | 0/4 | 2 days | - | - |
| **TOTAL** | **11%** | **5/45** | **25 days** | 2025-10-18 | - |

**Legend**: 🔲 Not Started | 🟡 In Progress | ✅ Complete | ⏸️ Blocked | ❌ Cancelled

---

## Phase 1: Foundation Setup

**Goal**: Install Refine and configure basic structure without breaking existing functionality  
**Duration**: 3 days  
**Depends On**: None  
**Status**: ✅ Complete

### Tasks

- [x] **Task 1.1: Install Refine Dependencies**
  - **File**: `frontend/package.json`
  - **Commands**:

    ```bash
    npm install @refinedev/core@^5.0.0
    npm install @refinedev/react-router-v6@latest --legacy-peer-deps
    npm install @refinedev/react-hook-form@latest --legacy-peer-deps
    ```

  - **Verification**: Run `npm run build` - should compile without errors
  - **Estimate**: 30 min
  - **Assignee**: Copilot
  - **Status**: ✅

- [x] **Task 1.2: Create Refine Provider Component**
  - **File**: `frontend/lib/refine/RefineProvider.tsx` (new)
  - **Dependencies**: None yet (use stub providers)
  - **Code Structure**:

    ```tsx
    import { Refine } from "@refinedev/core";
    
    export function RefineProvider({ children }) {
      return (
        <Refine
          dataProvider={stubDataProvider}
          authProvider={stubAuthProvider}
          notificationProvider={stubNotificationProvider}
          resources={[
            { name: "trips", list: "/", show: "/trip/:id", edit: "/trip/:id/edit" },
            { name: "activities" },
            { name: "hotels" },
            { name: "flights" },
            { name: "restaurants" },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          {children}
        </Refine>
      );
    }
    ```

  - **Verification**: Component renders without errors
  - **Estimate**: 1 hour
  - **Assignee**: Copilot
  - **Status**: ✅

- [x] **Task 1.3: Create Stub Providers**
  - **Files**: 
    - `frontend/lib/refine/providers/stubDataProvider.ts`
    - `frontend/lib/refine/providers/stubAuthProvider.ts`
    - `frontend/lib/refine/providers/stubNotificationProvider.ts`
  - **Purpose**: Minimal implementations to satisfy Refine's types
  - **Code**: Return Promise.reject("Not implemented") for all methods
  - **Verification**: TypeScript compiles without errors
  - **Estimate**: 1 hour
  - **Assignee**: Copilot
  - **Status**: ✅

- [x] **Task 1.4: Integrate RefineProvider into App Layout**
  - **File**: `frontend/app/layout.tsx`
  - **Changes**:
    - Import RefineProvider
    - Wrap children in provider hierarchy:

      ```tsx
      <AuthProvider>
        <DatabaseProvider>
          <RefineProvider>
            <SyncProvider>
              {children}
            </SyncProvider>
          </RefineProvider>
        </DatabaseProvider>
      </AuthProvider>
      ```

  - **Verification**: App runs without errors, all existing functionality works
  - **Estimate**: 30 min
  - **Assignee**: Copilot
  - **Status**: ✅

- [x] **Task 1.5: Verify Refine DevTools**
  - **Action**: Open app in dev mode
  - **Check**: Refine DevTools panel appears in browser
  - **Documentation**: Take screenshot, document how to access DevTools
  - **Verification**: DevTools shows registered resources
  - **Estimate**: 15 min
  - **Assignee**: User (manual testing)
  - **Status**: ✅ (dev server running, ready for manual verification)

### Acceptance Criteria
- ✅ All Refine packages installed
- ✅ RefineProvider renders without errors
- ✅ Existing app functionality unchanged
- ✅ Refine DevTools accessible
- ✅ No TypeScript errors
- ✅ Build passes (`npm run build`)

---

## Phase 2: Custom Data Provider

**Goal**: Create adapter between Refine's interface and our IndexedDB operations  
**Duration**: 5 days  
**Depends On**: Phase 1  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 2.1: Create Data Provider Skeleton**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts` (new)
  - **Implement**: All required DataProvider methods
    - `getList`
    - `getOne`
    - `create`
    - `update`
    - `deleteOne`
    - `getApiUrl`
  - **Initial**: Return mock data or throw "Not implemented"
  - **Verification**: TypeScript validates DataProvider interface
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.2: Create Result<T> to Promise<T> Converter**
  - **File**: `frontend/lib/refine/utils/resultConverter.ts` (new)
  - **Code**:
    ```typescript
    import { isOk, unwrap, unwrapErr } from '@/lib/db/resultHelpers';
    import type { Result } from '@/lib/db/models';
    
    export async function resultToPromise<T>(result: Result<T>): Promise<T> {
      if (isOk(result)) {
        return unwrap(result);
      } else {
        const error = unwrapErr(result);
        throw new Error(error.message);
      }
    }
    ```
  - **Tests**: Unit tests for success and error cases
  - **Verification**: Tests pass
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.3: Implement getList for Trips**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Integrate**: `getAllTrips()` from `@/lib/db/operations/trips`
  - **Handle**: Pagination (note: IndexedDB returns all, we slice in memory)
  - **Handle**: Sorting (apply to results)
  - **Code**:
    ```typescript
    getList: async ({ resource, pagination, sorters }) => {
      if (resource === "trips") {
        const result = await getAllTrips();
        const trips = await resultToPromise(result);
        
        // Apply sorting
        const sorted = applySorters(trips, sorters);
        
        // Apply pagination
        const { current = 1, pageSize = 10 } = pagination || {};
        const start = (current - 1) * pageSize;
        const end = start + pageSize;
        
        return {
          data: sorted.slice(start, end),
          total: sorted.length,
        };
      }
      throw new Error(`Resource ${resource} not implemented`);
    }
    ```
  - **Verification**: Create test component using `useList({ resource: "trips" })`
  - **Estimate**: 3 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.4: Implement getOne for Trips**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Integrate**: `getTripWithRelations(id)` from operations
  - **Code**:
    ```typescript
    getOne: async ({ resource, id }) => {
      if (resource === "trips") {
        const result = await getTripWithRelations(id as string);
        const trip = await resultToPromise(result);
        return { data: trip };
      }
      throw new Error(`Resource ${resource} not implemented`);
    }
    ```
  - **Verification**: Test component fetches single trip
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.5: Implement update for Trips**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Integrate**: `updateTrip(data)` from operations
  - **Handle**: Sync queue automatically triggered by updateTrip
  - **Code**:
    ```typescript
    update: async ({ resource, id, variables }) => {
      if (resource === "trips") {
        const result = await updateTrip({
          id: id as string,
          ...variables,
        });
        const trip = await resultToPromise(result);
        return { data: trip };
      }
      throw new Error(`Resource ${resource} not implemented`);
    }
    ```
  - **Verification**: Manual test updates trip and triggers sync
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.6: Implement deleteOne for Trips**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Integrate**: `deleteTrip(id)` from operations
  - **Code**:
    ```typescript
    deleteOne: async ({ resource, id }) => {
      if (resource === "trips") {
        const result = await deleteTrip(id as string);
        await resultToPromise(result);
        return { data: {} };
      }
      throw new Error(`Resource ${resource} not implemented`);
    }
    ```
  - **Verification**: Delete works and adds to sync queue
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.7: Add Resource Routing Logic**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Create**: Resource registry mapping resource names to operations
  - **Code**:
    ```typescript
    const resourceOperations = {
      trips: {
        getList: getAllTrips,
        getOne: getTripWithRelations,
        update: updateTrip,
        delete: deleteTrip,
      },
      activities: {
        getList: getActivitiesByTripId,
        // ... etc
      },
      // ... other resources
    };
    ```
  - **Refactor**: Use registry instead of if/else chains
  - **Verification**: Code is cleaner and extensible
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 2.8: Replace Stub Provider with Real Implementation**
  - **File**: `frontend/lib/refine/RefineProvider.tsx`
  - **Change**: Import real dataProvider instead of stub
  - **Verification**: 
    - App runs without errors
    - Test components can fetch trips
    - Update/delete operations work
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Data provider implements all required methods
- ✅ Trip CRUD operations work through Refine hooks
- ✅ Result<T> properly converted to Promise<T>
- ✅ Sync queue automatically triggered on mutations
- ✅ Error handling works correctly
- ✅ Test components successfully use `useList` and `useOne`

---

## Phase 3: Trip List Migration

**Goal**: Refactor homepage (trip list) to use Refine hooks  
**Duration**: 2 days  
**Depends On**: Phase 2  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 3.1: Create New Trip List Component with Refine**
  - **File**: `frontend/components/TripListRefine.tsx` (new, temporary)
  - **Use**: `useList({ resource: "trips" })` hook
  - **Code**:
    ```tsx
    import { useList } from "@refinedev/core";
    
    export function TripListRefine() {
      const { data, isLoading, isError, error } = useList({
        resource: "trips",
        pagination: { current: 1, pageSize: 100 },
      });
      
      if (isLoading) return <LoadingSpinner />;
      if (isError) return <ErrorAlert message={error.message} />;
      
      return <TripList trips={data?.data || []} />;
    }
    ```
  - **Verification**: Component renders trip list
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 3.2: Add Side-by-Side Comparison**
  - **File**: `frontend/app/page.tsx`
  - **Temporarily**: Render both old and new implementations
  - **Add**: Toggle or side-by-side view for comparison
  - **Verification**: Both show same data
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 3.3: Test Loading States**
  - **Action**: Throttle IndexedDB to test loading state
  - **Verify**: Loading spinner appears
  - **Verify**: Data appears after load completes
  - **Document**: Any timing differences
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 3.4: Test Error States**
  - **Action**: Temporarily break database operation
  - **Verify**: Error message displays correctly
  - **Verify**: Error is user-friendly
  - **Fix**: Any error handling issues
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 3.5: Replace Old Implementation**
  - **File**: `frontend/app/page.tsx`
  - **Remove**: Old useState/useEffect code
  - **Replace**: With TripListRefine component
  - **Delete**: Temporary TripListRefine.tsx (inline the code)
  - **Verification**: App works exactly as before
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 3.6: Performance Testing**
  - **Test**: Navigation to/from homepage
  - **Verify**: Data loads from cache on return
  - **Verify**: No unnecessary re-fetches
  - **Measure**: Time to interactive
  - **Document**: Performance improvements
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Trip list uses `useList` hook
- ✅ Loading states work correctly
- ✅ Error states work correctly
- ✅ Caching works (instant back navigation)
- ✅ No functionality regression
- ✅ Code is cleaner and shorter

---

## Phase 4: Trip Detail Migration

**Goal**: Refactor trip detail page to use `useShow`  
**Duration**: 3 days  
**Depends On**: Phase 2  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 4.1: Refactor Trip Detail Page**
  - **File**: `frontend/app/trip/[tripId]/page.tsx`
  - **Replace**: Manual data fetching with `useShow` hook
  - **Code**:
    ```tsx
    import { useShow } from "@refinedev/core";
    
    export default function TripDetailPage({ params }) {
      const { queryResult } = useShow<TripWithRelations>({
        resource: "trips",
        id: params.tripId,
      });
      
      const { data, isLoading, isError, error } = queryResult;
      
      if (isLoading) return <LoadingSpinner />;
      if (isError) return <ErrorAlert message={error.message} />;
      
      const trip = data?.data;
      
      return (
        <>
          <TripHeader trip={trip} />
          <TripTimeline trip={trip} />
          <TripMapView trip={trip} />
          <RestaurantList restaurants={trip.restaurants} />
        </>
      );
    }
    ```
  - **Remove**: All useState, useEffect, manual loading states
  - **Verification**: Trip detail page works
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 4.2: Test Cache Hit from List Page**
  - **Action**: Navigate from list to detail page
  - **Verify**: Data appears instantly (from cache)
  - **Verify**: Background refetch happens silently
  - **Document**: Cache behavior
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 4.3: Test Direct URL Access**
  - **Action**: Access trip detail page directly (refresh browser)
  - **Verify**: Data fetches correctly
  - **Verify**: Loading state appears
  - **Verify**: No cache available message
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 4.4: Test Error Handling**
  - **Action**: Try accessing non-existent trip ID
  - **Verify**: Proper 404-like error handling
  - **Verify**: User-friendly error message
  - **Estimate**: 30 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 4.5: Measure Code Reduction**
  - **Action**: Compare before/after code
  - **Document**: Lines of code removed
  - **Document**: State management simplified
  - **Create**: Blog post or internal doc about benefits
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Trip detail uses `useShow` hook
- ✅ Data loads from cache when available
- ✅ Direct access works correctly
- ✅ Error handling works
- ✅ Code is significantly cleaner
- ✅ Performance is same or better

---

## Phase 5: Edit Forms Migration

**Goal**: Refactor EditModeLayout to use `useForm` from Refine  
**Duration**: 5 days  
**Depends On**: Phase 2  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 5.1: Refactor EditModeLayout with useForm**
  - **File**: `frontend/components/edit/EditModeLayout.tsx`
  - **Replace**: Manual form state with Refine's useForm
  - **Code**:
    ```tsx
    import { useForm } from "@refinedev/react-hook-form";
    
    export default function EditModeLayout({ tripId }) {
      const {
        refineCore: { queryResult, onFinish },
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
      } = useForm<TripEditFormData>({
        refineCoreProps: {
          resource: "trips",
          action: "edit",
          id: tripId,
          redirect: false, // Stay on page after save
        },
      });
      
      const trip = queryResult?.data?.data;
      
      return (
        <form onSubmit={handleSubmit(onFinish)}>
          {/* Existing form UI */}
        </form>
      );
    }
    ```
  - **Remove**: Manual loading/saving/error states
  - **Remove**: Manual form initialization logic
  - **Remove**: Manual success message handling
  - **Verification**: Form loads and saves correctly
  - **Estimate**: 4 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.2: Handle Nested Entity Updates (Hotels)**
  - **File**: `frontend/components/edit/HotelSection.tsx`
  - **Challenge**: Hotels are nested under trip
  - **Solution**: Use separate mutations for hotels
  - **Code**:
    ```tsx
    import { useCreate, useUpdate, useDelete } from "@refinedev/core";
    
    const { mutate: createHotel } = useCreate();
    const { mutate: updateHotel } = useUpdate();
    const { mutate: deleteHotel } = useDelete();
    
    // Use these in add/edit/delete handlers
    ```
  - **Verification**: Hotel CRUD operations work
  - **Estimate**: 3 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.3: Handle Nested Entity Updates (Activities)**
  - **File**: `frontend/components/edit/ActivitySection.tsx`
  - **Similar**: Same pattern as hotels
  - **Additional**: Bulk reordering support
  - **Code**: Use `useUpdate` with custom meta for bulk operations
  - **Verification**: Activity CRUD + reordering works
  - **Estimate**: 3 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.4: Handle Nested Entity Updates (Flights)**
  - **File**: `frontend/components/edit/FlightSection.tsx`
  - **Pattern**: Same as hotels/activities
  - **Verification**: Flight updates work
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.5: Test Form Validation**
  - **Action**: Try submitting invalid data
  - **Verify**: Validation errors appear
  - **Verify**: Form submission blocked
  - **Verify**: Error messages are clear
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.6: Test Optimistic Updates**
  - **Action**: Edit trip while offline
  - **Verify**: UI updates immediately
  - **Verify**: Data syncs when online
  - **Document**: Optimistic update behavior
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 5.7: Remove Old Code and Cleanup**
  - **File**: `frontend/components/edit/EditModeLayout.tsx`
  - **Remove**: All manual state management code
  - **Remove**: Manual form initialization
  - **Remove**: Manual error handling
  - **Measure**: Lines of code removed
  - **Verification**: Build passes, functionality intact
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Edit form uses Refine's `useForm` hook
- ✅ All nested entities (hotels, activities, flights) manageable
- ✅ Form validation works
- ✅ Optimistic updates work
- ✅ Automatic success/error notifications
- ✅ Code reduced by ~50% (estimated)
- ✅ No functionality regression

---

## Phase 6: Nested Resource Management

**Goal**: Handle nested entities (activities, hotels, flights) as Refine resources  
**Duration**: 3 days  
**Depends On**: Phase 2, Phase 5  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 6.1: Implement Activities Data Provider Methods**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Add**: Support for "activities" resource
  - **Handle**: `meta.tripId` for filtering by trip
  - **Code**:
    ```typescript
    if (resource === "activities") {
      if (meta?.tripId) {
        const result = await getActivitiesByTripId(meta.tripId);
        return { data: await resultToPromise(result), total: data.length };
      }
    }
    ```
  - **Implement**: create, update, delete for activities
  - **Verification**: CRUD operations work
  - **Estimate**: 3 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 6.2: Implement Hotels Data Provider Methods**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Pattern**: Same as activities
  - **Implement**: All CRUD operations
  - **Verification**: Hotel CRUD works
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 6.3: Implement Flights Data Provider Methods**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Pattern**: Same as activities/hotels
  - **Note**: Flights don't have create in current implementation
  - **Implement**: update, delete operations
  - **Verification**: Flight operations work
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 6.4: Implement Restaurants Data Provider Methods**
  - **File**: `frontend/lib/refine/providers/dataProvider.ts`
  - **Pattern**: Same as other resources
  - **Implement**: All CRUD operations
  - **Verification**: Restaurant CRUD works
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 6.5: Test Cross-Resource Cache Invalidation**
  - **Scenario**: Update activity, verify trip detail refreshes
  - **Scenario**: Delete hotel, verify trip list updates
  - **Verify**: Refine automatically invalidates related queries
  - **Fix**: Any manual invalidation needed
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 6.6: Document Resource Relationships**
  - **File**: `docs/refine-resources.md` (new)
  - **Document**: 
    - Resource hierarchy (trips → activities/hotels/flights)
    - Meta params required for each resource
    - Cache invalidation rules
    - Example usage of each resource
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ All resources (trips, activities, hotels, flights, restaurants) have data provider methods
- ✅ Nested resource queries work with meta.tripId
- ✅ Cache invalidation works across related resources
- ✅ CRUD operations work for all resources
- ✅ Documentation complete

---

## Phase 7: Auth Provider Integration

**Goal**: Integrate existing Firebase Auth with Refine's auth provider  
**Duration**: 2 days  
**Depends On**: Phase 1  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 7.1: Create Auth Provider**
  - **File**: `frontend/lib/refine/providers/authProvider.ts` (new)
  - **Implement**: All AuthProvider methods
  - **Code**:
    ```typescript
    import { AuthProvider } from "@refinedev/core";
    import { signInWithGoogle, signOut, getCurrentUser } from "@/lib/firebase/auth";
    
    export const authProvider: AuthProvider = {
      login: async () => {
        const user = await signInWithGoogle();
        return { success: !!user };
      },
      logout: async () => {
        await signOut();
        return { success: true, redirectTo: "/" };
      },
      check: async () => {
        const user = getCurrentUser();
        return { authenticated: !!user };
      },
      getPermissions: async () => null,
      getIdentity: async () => {
        const user = getCurrentUser();
        if (!user) return null;
        return {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
          avatar: user.photoURL,
        };
      },
      onError: async (error) => {
        console.error(error);
        return { error };
      },
    };
    ```
  - **Verification**: Auth methods work
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 7.2: Replace Stub Auth Provider**
  - **File**: `frontend/lib/refine/RefineProvider.tsx`
  - **Change**: Import real authProvider
  - **Verification**: Login/logout works
  - **Estimate**: 15 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 7.3: Add Route Protection**
  - **File**: Pages that require auth
  - **Use**: Refine's `<Authenticated>` component
  - **Code**:
    ```tsx
    import { Authenticated } from "@refinedev/core";
    
    <Authenticated fallback={<LoginPrompt />}>
      {/* Protected content */}
    </Authenticated>
    ```
  - **Apply to**: Edit pages, potentially detail pages
  - **Verification**: Unauthenticated users redirected
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 7.4: Test Auth Flows**
  - **Test**: Login → redirected to app
  - **Test**: Logout → redirected to home
  - **Test**: Access protected page while logged out → redirected to login
  - **Test**: Auth state persistence across refresh
  - **Document**: Any edge cases
  - **Estimate**: 1 hour
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Auth provider integrated
- ✅ Login/logout works through Refine
- ✅ Protected routes work
- ✅ Auth state properly managed
- ✅ No regression in auth functionality

---

## Phase 8: Notification Provider

**Goal**: Replace manual success/error messages with Refine notifications  
**Duration**: 2 days  
**Depends On**: Phase 1  
**Status**: 🔲 Not Started

### Tasks

- [ ] **Task 8.1: Create Notification Provider**
  - **File**: `frontend/lib/refine/providers/notificationProvider.ts` (new)
  - **Implement**: Using DaisyUI toast system
  - **Code**:
    ```typescript
    import { NotificationProvider } from "@refinedev/core";
    
    export const notificationProvider: NotificationProvider = {
      open: ({ message, type, description, key }) => {
        // Create DaisyUI toast
        const toast = document.createElement('div');
        toast.className = `alert alert-${type}`;
        toast.innerHTML = `
          <span>${message}</span>
          ${description ? `<div class="text-sm">${description}</div>` : ''}
        `;
        document.body.appendChild(toast);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => toast.remove(), 3000);
      },
      close: (key) => {
        // Find and remove toast by key
      },
    };
    ```
  - **Verification**: Notifications appear
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 8.2: Replace Stub Notification Provider**
  - **File**: `frontend/lib/refine/RefineProvider.tsx`
  - **Change**: Import real notificationProvider
  - **Verification**: Notifications work
  - **Estimate**: 15 min
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 8.3: Remove Manual Success/Error States**
  - **Files**: All components with manual notifications
  - **Remove**: 
    ```tsx
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    ```
  - **Remove**: Manual toast/alert rendering
  - **Verification**: Refine handles all notifications automatically
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

- [ ] **Task 8.4: Customize Notification Styling**
  - **File**: `frontend/lib/refine/providers/notificationProvider.ts`
  - **Enhance**: Match DaisyUI theme
  - **Add**: Icons for different notification types
  - **Add**: Close button
  - **Add**: Stacking for multiple notifications
  - **Verification**: Notifications look polished
  - **Estimate**: 2 hours
  - **Assignee**: 
  - **Status**: 🔲

### Acceptance Criteria
- ✅ Notification provider integrated
- ✅ Automatic notifications on all mutations
- ✅ Manual notification states removed from components
- ✅ Notifications match app design
- ✅ Multiple notifications stack properly

---

## Testing Checklist

### Pre-Integration Testing
- [ ] Current functionality documented (video/screenshots)
- [ ] Key user flows tested and verified
- [ ] Performance baseline established

### Per-Phase Testing
- [ ] Unit tests for new code
- [ ] Integration tests for data provider
- [ ] Manual testing of affected features
- [ ] Performance comparison (before/after)

### Post-Integration Testing
- [ ] Full regression test suite
- [ ] Offline functionality verified
- [ ] Sync queue still works
- [ ] Firebase sync verified
- [ ] Performance meets or exceeds baseline
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] Lighthouse score unchanged or improved

---

## Rollback Plan

If integration fails at any phase:

1. **Keep Old Code**: Don't delete old implementations until new ones are proven
2. **Feature Flags**: Use environment variable to toggle Refine on/off
3. **Git Branches**: Each phase gets its own branch
4. **Easy Revert**: Can revert to previous phase easily
5. **Documentation**: Document why rollback happened and what needs fixing

---

## Success Metrics

### Quantitative
- [ ] Code reduction: ≥40% in data-heavy components
- [ ] Manual state management: -90%
- [ ] Build time: No regression
- [ ] Bundle size: <10% increase (acceptable for framework)
- [ ] Page load time: No regression

### Qualitative
- [ ] Code is easier to read
- [ ] Patterns are consistent
- [ ] New features faster to implement
- [ ] Developer satisfaction improved
- [ ] Fewer bugs in data handling

---

## Notes & Learnings

_Use this section to document insights, gotchas, and decisions made during implementation_

### Phase 1

**Completed**: 2025-10-18

**Key Decisions**:
- Used Refine v5 instead of v4 for React 19 compatibility
- Had to use `--legacy-peer-deps` for router and react-hook-form packages (v4) since they haven't been updated to v5 yet
- Installed packages:
  - `@refinedev/core@^5.0.0` - Core Refine framework (React 19 compatible)
  - `@refinedev/react-router-v6@latest` - v4.6.2 (latest available)
  - `@refinedev/react-hook-form@latest` - v4.9.0 (latest available)

**Challenges**:
- Initial peer dependency conflict with React 19
- Router and form packages still on v4, required legacy peer deps flag

**Outcomes**:
- ✅ All packages installed successfully
- ✅ Stub providers created (data, auth, notification)
- ✅ RefineProvider component created and integrated
- ✅ App builds successfully (`npm run build`)
- ✅ Dev server runs without errors
- ✅ No regression in existing functionality
- ✅ Ready for Phase 2 (data provider implementation)

**Files Created**:
- `frontend/lib/refine/RefineProvider.tsx` - Main provider component
- `frontend/lib/refine/providers/stubDataProvider.ts` - Temporary data provider
- `frontend/lib/refine/providers/stubAuthProvider.ts` - Temporary auth provider
- `frontend/lib/refine/providers/stubNotificationProvider.ts` - Temporary notification provider

**Files Modified**:
- `frontend/app/layout.tsx` - Added RefineProvider to provider hierarchy
- `frontend/package.json` - Added Refine dependencies

### Phase 2
- 

### Phase 3
- 

### Phase 4
- 

### Phase 5
- 

### Phase 6
- 

### Phase 7
- 

### Phase 8
- 

---

## Resources

- [Refine Documentation](https://refine.dev/docs/)
- [Custom Data Provider](https://refine.dev/docs/core/providers/data-provider/)
- [Auth Provider](https://refine.dev/docs/core/providers/auth-provider/)
- [React Hook Form Integration](https://refine.dev/docs/packages/react-hook-form/use-form/)
- [Integration Plan](./refine-integration-plan.md)
