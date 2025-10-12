# API Contracts: Trip Edit Mode

**Feature**: 006-edit-mode-for  
**Date**: October 12, 2025  
**Phase**: 1 - Design & Contracts

## Overview

This feature primarily interacts with IndexedDB (local) and Google Maps Geocoding API (external). No backend API changes required.

---

## External API: Google Maps Geocoding

### Endpoint

```
GET https://maps.googleapis.com/maps/api/geocode/json
```

### Authentication

- **Method**: API Key in query parameter
- **Parameter**: `key={GOOGLE_MAPS_API_KEY}`
- **Key Storage**: Environment variable `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### Request: Lookup Plus Code

**Method**: GET  
**URL**: `https://maps.googleapis.com/maps/api/geocode/json?address={plusCode}&key={apiKey}`

**Parameters**:
- `address` (required): Plus Code (8 characters, e.g., "9C3XGR8Q+6R")
- `key` (required): API key

**Example**:
```
GET https://maps.googleapis.com/maps/api/geocode/json?address=9C3XGR8Q%2B6R&key=YOUR_API_KEY
```

### Response: Success (200 OK)

```json
{
  "results": [
    {
      "address_components": [
        {
          "long_name": "Golden Gate Bridge",
          "short_name": "Golden Gate Bridge",
          "types": ["point_of_interest", "establishment"]
        },
        {
          "long_name": "San Francisco",
          "short_name": "SF",
          "types": ["locality", "political"]
        },
        {
          "long_name": "California",
          "short_name": "CA",
          "types": ["administrative_area_level_1", "political"]
        }
      ],
      "formatted_address": "Golden Gate Bridge, San Francisco, CA 94129, USA",
      "geometry": {
        "location": {
          "lat": 37.8199286,
          "lng": -122.4782551
        },
        "location_type": "ROOFTOP"
      },
      "place_id": "ChIJw____96GhYARCVVwg5cT7c0",
      "plus_code": {
        "compound_code": "9C3X+GR San Francisco, CA, USA",
        "global_code": "849V9C3X+GR"
      },
      "types": ["point_of_interest", "establishment"]
    }
  ],
  "status": "OK"
}
```

**Key Fields**:
- `results[0].formatted_address`: Use as hotel/activity address
- `results[0].address_components[0].long_name`: Use as hotel/activity name
- `results[0].geometry.location`: Lat/lng (optional, for future use)
- `status`: "OK" indicates success

### Response: Error Cases

**Invalid Plus Code**:
```json
{
  "results": [],
  "status": "ZERO_RESULTS"
}
```

**Quota Exceeded**:
```json
{
  "error_message": "You have exceeded your daily request quota for this API.",
  "results": [],
  "status": "OVER_QUERY_LIMIT"
}
```

**Invalid API Key**:
```json
{
  "error_message": "The provided API key is invalid.",
  "results": [],
  "status": "REQUEST_DENIED"
}
```

**Network Error**:
- HTTP status: 500, 503, or network timeout
- Handle as network failure (per clarification: show error, allow retry)

### Error Handling Strategy

| Status | User Message | Action |
|--------|-------------|--------|
| `OK` | None | Use `results[0]` data |
| `ZERO_RESULTS` | "Invalid Plus Code. Please check and try again." | Keep Plus Code in input, allow retry |
| `OVER_QUERY_LIMIT` | "API quota exceeded. Please try again later." | Disable Plus Code input (FR-012) |
| `REQUEST_DENIED` | "Configuration error. Please contact support." | Disable Plus Code input |
| `INVALID_REQUEST` | "Invalid Plus Code format." | Clear input, allow re-entry |
| Network timeout/error | "Network error. Please check connection and retry." | Keep Plus Code, allow retry (FR-010) |

---

## Internal Service Interface: Plus Code Service

### Module: `lib/services/plusCodeService.ts`

```typescript
export interface PlusCodeLookupResult {
  success: boolean;
  data?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  error?: {
    code: 'INVALID_CODE' | 'NETWORK_ERROR' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
    message: string;
  };
}

export async function lookupPlusCode(plusCode: string): Promise<PlusCodeLookupResult>
```

**Usage Example**:
```typescript
const result = await lookupPlusCode('9C3XGR8Q+6R');
if (result.success) {
  // Use result.data.name, result.data.address
} else {
  // Display result.error.message
}
```

---

## IndexedDB Operations (Existing)

All operations use existing `lib/db/operations` modules. No new DB operations required.

### Trip Operations (`lib/db/operations/trips.ts`)

**Update Trip**:
```typescript
updateTrip(id: string, updates: TripUpdate): Promise<Result<void, DbError>>
```

**Used For**: Saving trip name, dates, notes changes (FR-001 to FR-005)

### Hotel Operations (`lib/db/operations/hotels.ts`)

**Create Hotel**:
```typescript
createHotel(hotel: Omit<Hotel, 'id' | 'updated_at'>): Promise<Result<string, DbError>>
```

**Update Hotel**:
```typescript
updateHotel(id: string, updates: Partial<Hotel>): Promise<Result<void, DbError>>
```

**Delete Hotel**:
```typescript
deleteHotel(id: string): Promise<Result<void, DbError>>
```

**Used For**: Add/edit/delete hotels (FR-007, FR-009, FR-013, FR-027)

### Activity Operations (`lib/db/operations/activities.ts`)

**Create Activity**:
```typescript
createActivity(activity: Omit<DailyActivity, 'id' | 'updated_at'>): Promise<Result<string, DbError>>
```

**Update Activity**:
```typescript
updateActivity(id: string, updates: Partial<DailyActivity>): Promise<Result<void, DbError>>
```

**Delete Activity**:
```typescript
deleteActivity(id: string): Promise<Result<void, DbError>>
```

**Bulk Update Activities** (for reordering):
```typescript
bulkUpdateActivities(updates: Array<{id: string, order_index: number}>): Promise<Result<void, DbError>>
```

**Used For**: Add/edit/delete/reorder attractions (FR-008, FR-009, FR-013, FR-014, FR-029)

### Flight Operations (`lib/db/operations/flights.ts`)

**Update Flight**:
```typescript
updateFlight(id: string, updates: Partial<Flight>): Promise<Result<void, DbError>>
```

**Used For**: Add/edit flight notes (FR-028)

---

## Component Props Contracts

### EditModeLayout

```typescript
interface EditModeLayoutProps {
  tripId: string;
  initialData: TripWithRelations; // Loaded server-side
}
```

### CategoryNav

```typescript
interface CategoryNavProps {
  categories: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
}
```

### PlusCodeInput

```typescript
interface PlusCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onLookupSuccess: (data: { name: string; address: string }) => void;
  onLookupError: (error: string) => void;
  disabled?: boolean;
}
```

### FlightSection, HotelSection, AttractionSection

```typescript
interface SectionProps<T> {
  tripId: string;
  items: T[];
  onSave: (items: T[]) => Promise<void>;
  onError: (error: string) => void;
}
```

---

## Rate Limits & Quotas

### Google Maps Geocoding API

- **Free Tier**: 50,000 requests/month
- **Pay-as-you-go**: $5 per 1,000 requests after free tier
- **Expected Usage**: 1-2 users, ~10-50 lookups/month → well within free tier
- **Caching**: Consider in-memory cache for repeated lookups (optional optimization)

### IndexedDB

- **Browser Storage Quota**: Varies by browser, typically 50-100MB minimum
- **Expected Usage**: ~100KB per trip, hundreds of trips supported
- **Quota Exceeded Handling**: Display error per FR-021, prevent save

---

## Security Considerations

### API Key Exposure

- **Risk**: `NEXT_PUBLIC_*` env vars are exposed to client
- **Mitigation**: Google Maps API key restricted to specific domains in Google Cloud Console
- **Restrictions**: 
  - HTTP referrer restrictions (e.g., `*.travo.app`)
  - API restrictions (Geocoding API only)

### Input Validation

- **Plus Code**: Validated client-side before API call (8-char alphanumeric + plus)
- **SQL Injection**: N/A (IndexedDB doesn't use SQL)
- **XSS**: React escapes by default, no `dangerouslySetInnerHTML` used

---

## Testing Contracts

### Unit Tests

**Plus Code Service**:
- Mock Google Maps API responses
- Test all status codes (OK, ZERO_RESULTS, OVER_QUERY_LIMIT, etc.)
- Test network timeout handling

**Form Components**:
- Test validation rules
- Test error display
- Test successful save flow

### Integration Tests

**End-to-End Flow**:
1. Load trip in edit mode
2. Add hotel via Plus Code
3. Save changes
4. Verify persistence in IndexedDB
5. Reload page, verify data displayed

**Error Scenarios**:
1. Invalid Plus Code → error message shown
2. Network failure → retry works
3. Quota exceeded → input disabled

---

## Backward Compatibility

- **Schema**: No changes → full compatibility
- **Existing components**: No modifications to read/display logic
- **New routes**: Additive only (`/trip/[id]/edit`)
- **Environment**: New env var required, but feature degrades gracefully without it (error message)
