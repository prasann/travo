# Research: Trip Edit Mode

**Feature**: 006-edit-mode-for  
**Date**: October 12, 2025  
**Phase**: 0 - Outline & Research

## Research Questions

### 1. Google Maps Plus Codes API Integration

**Question**: Which Google Maps API should be used for Plus Code to address resolution, and what are the authentication and rate limit considerations?

**Decision**: Use Google Maps Geocoding API with Plus Code input

**Rationale**:
- Geocoding API natively supports Plus Codes as input addresses
- Returns structured address components (street, city, country) + lat/lng
- Standard REST API, simple authentication via API key
- Well-documented and widely used

**Implementation Details**:
- Endpoint: `https://maps.googleapis.com/maps/api/geocode/json?address={plusCode}&key={API_KEY}`
- Authentication: API key stored in environment variable (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`)
- Response includes: formatted_address, address_components, geometry.location
- Rate limits: 50,000 requests/month free tier (sufficient for 1-2 users)

**Alternatives Considered**:
- **Plus Codes API (separate service)**: Not needed - Geocoding API handles Plus Codes natively
- **Places API**: Overkill for simple address lookup, more expensive
- **Direct Plus Codes library (offline)**: Converts Plus Code to lat/lng only, doesn't provide human-readable address

**Error Handling**:
- Network failure: Show error, allow retry (per clarification)
- Invalid Plus Code: API returns ZERO_RESULTS status
- Quota exceeded: API returns OVER_QUERY_LIMIT status
- Multiple results: Use first result from results array (per clarification)

---

### 2. Form State Management for Edit Mode

**Question**: What's the best practice for managing complex form state with multiple categories in React/Next.js?

**Decision**: Use React Hook Form for form state management

**Rationale**:
- Minimal re-renders (uncontrolled components)
- Built-in validation support
- TypeScript-first design
- Works well with Next.js client components
- Simple API for nested forms (categories)

**Implementation Pattern**:
```typescript
const { register, handleSubmit, formState: { errors } } = useForm<TripFormData>({
  defaultValues: loadFromIndexedDB(tripId)
});
```

**Alternatives Considered**:
- **Plain React state**: Too much boilerplate for complex form with validation
- **Formik**: Heavier library, more re-renders than React Hook Form
- **Server actions only**: Feature needs client-side interactivity (reorder, delete)

---

### 3. Drag-and-Drop for Place Reordering

**Question**: What's the simplest approach to implement place reordering within categories?

**Decision**: Use dnd-kit library for drag-and-drop

**Rationale**:
- Modern, accessible drag-and-drop for React
- Touch-friendly (important for mobile-first)
- TypeScript support
- Smaller bundle size than react-beautiful-dnd
- Works with Next.js client components

**Implementation Pattern**:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```

**Alternatives Considered**:
- **react-beautiful-dnd**: Deprecated, not maintained
- **Manual drag events**: Too complex, poor accessibility
- **Up/Down buttons only**: Works but less intuitive UX

---

### 4. Category Navigation Pattern

**Question**: How should users navigate between edit categories (flights, hotels, attractions, notes)?

**Decision**: Tabbed interface using DaisyUI tabs component

**Rationale**:
- Matches existing project design system (DaisyUI)
- Clear visual indication of current section
- Mobile-friendly (tabs stack on small screens)
- No routing complexity (all one page)

**Implementation**:
- DaisyUI tabs component with radio input pattern
- Each category renders conditionally based on active tab
- State managed in parent EditModeLayout component

**Alternatives Considered**:
- **Accordion/Collapsible**: More scrolling, harder to see what categories exist
- **Separate routes per category**: Unnecessary complexity, slower navigation
- **Single long form**: Too much scrolling, harder to find specific sections

---

### 5. IndexedDB Update Strategy

**Question**: Should changes be saved per-category or all-at-once?

**Decision**: All-at-once save (single save button for entire trip)

**Rationale**:
- Simpler implementation (one transaction)
- Clearer user mental model (explicit save action)
- Aligns with clarification (no autosave, no unsaved warnings)
- Reduces IndexedDB write operations

**Implementation**:
- Single "Save Changes" button in layout header
- Collects all form data on submit
- Single DB transaction updating all entities
- Success message after commit

**Alternatives Considered**:
- **Per-category save**: More complex state management, confusing UX
- **Autosave**: Contradicts clarifications (no warnings on navigation)
- **Debounced autosave**: Over-engineering for 1-2 user app

---

### 6. Error Display Pattern

**Question**: How should errors (API failures, validation, storage) be displayed?

**Decision**: Toast notifications using existing pattern (if present) or simple alert banner

**Rationale**:
- Non-blocking (user can continue editing)
- Auto-dismissible for transient errors
- Consistent with web UX patterns
- Simple to implement

**Implementation**:
- Error state in component (React state)
- DaisyUI alert component or simple toast
- Different colors for error types (network vs validation)
- Errors don't prevent further editing

**Alternatives Considered**:
- **Inline validation errors**: Used for form fields, but not for system errors
- **Modal dialogs**: Too disruptive for simple errors
- **Console logging only**: Poor UX, users won't see errors

---

## Technology Stack Summary

**New Dependencies**:
- `react-hook-form`: ^7.51.0 - Form state management
- `@dnd-kit/core`, `@dnd-kit/sortable`: ^6.1.0 - Drag and drop
- No new dependencies for Google Maps (native fetch)

**Existing Dependencies** (leveraged):
- Next.js 15.5.4, React 19.1.0
- DaisyUI 5.2.0, Tailwind CSS 4.1.14
- Dexie.js (IndexedDB wrapper)
- TypeScript 5.x

**Environment Variables** (new):
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key for Geocoding API

---

## Best Practices

### React/Next.js Patterns
1. Use client components for interactive forms (`'use client'` directive)
2. Server components for data fetching (trip loading)
3. Colocate component state, avoid global state unless needed
4. TypeScript interfaces for all props and form data

### IndexedDB Operations
1. Use existing `lib/db/operations` functions
2. Wrap all operations in try-catch (Result<T, E> pattern if present)
3. Update `updated_at` timestamp on all changes
4. Single transaction for related updates

### Form Handling
1. Uncontrolled inputs with React Hook Form
2. Zod or built-in validation for form fields
3. Optimistic UI updates before IndexedDB commit
4. Clear form on successful save (or stay in edit mode per spec)

### API Integration
1. Create service layer (`lib/services/plusCodeService.ts`)
2. Handle all error cases from spec (network, invalid, quota)
3. Client-side only (no server-side API route needed for simple proxy)
4. Consider caching recent lookups in memory (Map/WeakMap)

### Accessibility
1. Use semantic HTML (button, form, input elements)
2. ARIA labels for drag handles
3. Keyboard navigation for tabs
4. Focus management on errors

---

## Open Questions (None)

All technical clarifications resolved. Ready for Phase 1: Design & Contracts.
