# Research: Enhanced Trip Data Model & Itinerary Management

**Feature**: 005-need-to-better  
**Date**: 2025-10-11  
**Phase**: 0 - Research & Technology Decisions

## Overview

This document captures research findings and technology decisions for implementing an enhanced trip data model with chronological timeline display, timezone-aware datetime handling, and flexible optional data fields.

## Research Areas

### 1. Timezone-Aware Date/Time Handling in JavaScript/TypeScript

**Decision**: Use native JavaScript Date objects with ISO 8601 datetime strings including timezone offsets

**Rationale**:
- Next.js/React apps run in browser with native Date API support
- ISO 8601 format (e.g., "2025-04-01T10:30:00-07:00") includes timezone offset
- No additional library dependencies needed (aligns with Constitution Principle VI: Code Simplicity)
- Intl.DateTimeFormat API provides timezone-aware formatting for display
- JSON serialization/deserialization works natively with ISO strings

**Implementation Approach**:
```typescript
// Store in JSON as ISO 8601 string with timezone
"departure_time": "2025-04-01T10:30:00-07:00"  // PST

// Parse and display
const date = new Date("2025-04-01T10:30:00-07:00");
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Los_Angeles',
  hour: 'numeric',
  minute: 'numeric',
  timeZoneName: 'short'
});
formatter.format(date); // "10:30 AM PST"
```

**Alternatives Considered**:
- ~~date-fns-tz~~: Adds 20KB+ dependency, overkill for basic timezone display
- ~~Moment.js~~: Deprecated, large bundle size
- ~~Luxon~~: Modern but adds complexity for simple use case
- ~~Day.js with timezone plugin~~: Lighter but still unnecessary given native API sufficiency

**Trade-offs**:
- Native Date API has quirks but TypeScript types provide safety
- Users must enter times with timezone identifiers (acceptable per clarifications)
- Future enhancement could add timezone picker UI if needed

---

### 2. Chronological Sorting with Mixed Entity Types

**Decision**: Implement unified sorting function using timestamp extraction + order_index fallback

**Rationale**:
- Need to sort flights, hotels, and activities into single timeline
- Each entity type has different timestamp fields (departure_time, check_in_time, start_time)
- Same-day activities need explicit ordering via order_index (per clarifications)
- Simple comparator function aligns with Constitution Principle VI

**Implementation Pattern**:
```typescript
type TimelineItem = Flight | Hotel | DailyActivity;

function getTimestamp(item: TimelineItem): Date | null {
  if ('departure_time' in item) return item.departure_time ? new Date(item.departure_time) : null;
  if ('check_in_time' in item) return item.check_in_time ? new Date(item.check_in_time) : null;
  if ('start_time' in item) return item.start_time ? new Date(item.start_time) : null;
  return null;
}

function sortChronologically(items: TimelineItem[]): TimelineItem[] {
  return items.sort((a, b) => {
    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);
    
    // Both have timestamps: sort by time
    if (timeA && timeB) {
      const diff = timeA.getTime() - timeB.getTime();
      // If same time, use order_index for activities
      if (diff === 0 && 'order_index' in a && 'order_index' in b) {
        return a.order_index - b.order_index;
      }
      return diff;
    }
    
    // Items without timestamps go last, sorted by order_index if available
    if (!timeA && !timeB && 'order_index' in a && 'order_index' in b) {
      return a.order_index - b.order_index;
    }
    
    return timeA ? -1 : 1; // Items with time come first
  });
}
```

**Alternatives Considered**:
- ~~Separate lists per entity type~~: Rejected - defeats purpose of unified timeline view
- ~~Pre-compute sort keys in data~~: Rejected - adds data complexity, sort is fast enough
- ~~Group by day then sort~~: Rejected - can't handle overnight flights or timezone transitions

---

### 3. JSON File Storage Strategy (One File Per Trip)

**Decision**: Store each trip in `/frontend/data/trips/{tripId}.json` with migration utility

**Rationale**:
- Explicit requirement from FR-003: "one file per trip"
- Scales better than single trips.json as trip count grows
- Enables lazy loading (only fetch trip data when viewing detail page)
- Aligns with offline-first principle (Constitution I) - easier to manage individual files
- Simpler to implement backup/sync per trip in future

**File Structure**:
```
frontend/data/
├── trips.json           # DEPRECATED: Remove after migration
├── trip-index.json      # NEW: Lightweight index for list view
└── trips/
    ├── 123e4567-e89b-12d3-a456-426614174000.json
    ├── 987f6543-e21a-98b7-c654-321098765abc.json
    └── ...
```

**trip-index.json Format** (for efficient list view):
```json
{
  "trips": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tokyo Spring Adventure",
      "start_date": "2025-04-01",
      "end_date": "2025-04-07",
      "updated_at": "2025-10-10T10:00:00.000Z"
    }
  ]
}
```

**Migration Approach**:
1. Create `/frontend/data/trips/` directory
2. Write script to split existing `trips.json` into individual files
3. Generate `trip-index.json` from trip metadata
4. Update loader functions to read from new structure
5. Keep old `trips.json` temporarily for rollback safety

**Alternatives Considered**:
- ~~Keep single trips.json~~: Rejected - explicitly against requirements, doesn't scale
- ~~IndexedDB migration~~: Deferred - constitution allows JSON files for now, IndexedDB is future enhancement
- ~~Nested directories by year/month~~: Rejected - premature optimization, flat structure sufficient

---

### 4. Optional Field Handling in TypeScript Interfaces

**Decision**: Use optional properties (`field?: type`) for all non-essential fields

**Rationale**:
- Clarifications explicitly state "all optional" for flights, hotels, activities, restaurants
- TypeScript optional properties provide compile-time safety
- React components can use conditional rendering (`{field && <Component />}`)
- Aligns with Constitution Principle VI: simple, no excessive validation needed

**Pattern**:
```typescript
export interface Flight {
  id: string;                          // Required: identifier
  trip_id: string;                     // Required: relationship
  updated_at: string;                  // Required: sync support
  
  airline?: string;                    // Optional
  flight_number?: string;              // Optional
  departure_time?: string;             // Optional (ISO 8601)
  arrival_time?: string;               // Optional (ISO 8601)
  departure_location?: string;         // Optional
  arrival_location?: string;           // Optional
  legs?: FlightLeg[];                  // Optional: for connections
}
```

**Alternatives Considered**:
- ~~Use `| null` instead of optional~~: Rejected - optional is more idiomatic TypeScript
- ~~Separate required/optional interfaces~~: Rejected - adds complexity without benefit
- ~~Default values for all fields~~: Rejected - empty strings/arrays can be misleading

---

### 5. DaisyUI Component Selection for Timeline UI

**Decision**: Use DaisyUI's Card and Timeline components with custom timeline layout

**Rationale**:
- DaisyUI already in tech stack (package.json confirms v5.2.0)
- Card component perfect for flight/hotel/activity items
- Timeline component provides visual chronology markers
- Tailwind utilities for responsive layout
- Stays within constitution constraint (existing UI framework)

**Component Mapping**:
- **Timeline container**: DaisyUI `timeline` class
- **Timeline items**: `timeline-item` with custom card content
- **Flight cards**: `card` with airplane icon (lucide-react)
- **Hotel cards**: `card` with hotel icon
- **Activity cards**: `card` with map-pin icon
- **Restaurant section**: Separate `card` outside timeline (not chronological)

**Example Structure**:
```tsx
<div className="timeline timeline-vertical">
  {sortedItems.map(item => (
    <div key={item.id} className="timeline-item">
      <div className="timeline-marker" />
      <div className="timeline-content">
        {item.type === 'flight' && <FlightCard flight={item} />}
        {item.type === 'hotel' && <HotelCard hotel={item} />}
        {item.type === 'activity' && <ActivityCard activity={item} />}
      </div>
    </div>
  ))}
</div>
```

**Alternatives Considered**:
- ~~Custom timeline CSS~~: Rejected - DaisyUI provides tested, accessible solution
- ~~Material UI~~: Rejected - not in tech stack, violates constitution
- ~~Vertical list without timeline markers~~: Rejected - less visual clarity for chronology

---

## Technology Stack Summary

| Component | Technology | Justification |
|-----------|-----------|---------------|
| Date/Time Handling | Native Date API + ISO 8601 | No dependencies, timezone-aware, sufficient for requirements |
| Sorting Algorithm | Custom comparator function | Simple, handles mixed types + order_index fallback |
| Data Storage | JSON files (one per trip) | Per requirements, offline-first, scalable |
| Type Safety | TypeScript optional properties | Compile-time checks, idiomatic, aligns with simplicity |
| UI Components | DaisyUI Card + Timeline | Existing stack, accessible, visually clear |
| Icons | lucide-react | Already in dependencies (v0.545.0) |
| Responsive Layout | Tailwind CSS utilities | Existing stack, mobile-first per constitution |

---

## Open Questions / Future Enhancements

1. **IndexedDB Migration**: Currently using JSON files per constitution allowance. Future enhancement could migrate to IndexedDB for better performance with 50+ trips.

2. **Timezone Picker UI**: Current implementation requires manual timezone entry in time strings. Could add timezone selector component in future.

3. **Image Optimization**: Storing external Google Maps image URLs (per clarifications). Could add image proxy/cache layer if needed for offline viewing.

4. **Conflict Detection**: Currently no validation for schedule conflicts (hotel/flight overlaps). Per edge cases, this is user responsibility. Could add optional warnings in future.

5. **Data Validation**: Minimal validation per Constitution Principle VI. If data quality issues arise, could add JSON schema validation layer.

---

## Best Practices Applied

### From Constitution
- ✅ **Offline-First**: JSON file storage, no network dependencies
- ✅ **Privacy**: Plus Codes maintained, no external services
- ✅ **Simplicity**: Native APIs over libraries, minimal abstraction
- ✅ **Component-Driven**: Reusable Card components for each entity type
- ✅ **Code Simplicity**: Trust TypeScript types, avoid over-engineering

### From Next.js/React Ecosystem
- Server Components for static trip list page
- Client Components for interactive timeline (if filtering/sorting UI added)
- File-based routing maintained in App Router
- TypeScript strict mode for type safety

### From DaisyUI/Tailwind
- Semantic component classes (card, timeline)
- Utility-first styling
- Mobile-first responsive breakpoints
- Consistent spacing/typography from theme

---

## References

- [MDN: Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
- [MDN: Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [ISO 8601 DateTime Format](https://en.wikipedia.org/wiki/ISO_8601)
- [DaisyUI Timeline Component](https://daisyui.com/components/timeline/)
- [DaisyUI Card Component](https://daisyui.com/components/card/)
- [TypeScript Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties)

---

**Phase 0 Complete**: All technical unknowns resolved. Ready for Phase 1 (Data Model & Contracts).
