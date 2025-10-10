# Data Contracts: Frontend Interfaces

**Phase**: 1 - Design & Contracts  
**Date**: October 10, 2025  
**Feature**: Minimalistic Frontend with Hardcoded Data

## TypeScript Interface Contracts

### Core Data Types

```typescript
// src/types/index.ts

/**
 * Represents a travel itinerary with associated places
 */
export interface Trip {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** User-defined trip name (1-100 characters) */
  name: string;
  
  /** Optional trip description (max 500 characters) */
  description?: string;
  
  /** Trip start date (ISO 8601 date: YYYY-MM-DD) */
  start_date: string;
  
  /** Trip end date (ISO 8601 date: YYYY-MM-DD) */
  end_date: string;
  
  /** Last modification timestamp (ISO 8601 datetime) */
  updated_at: string;
  
  /** Array of places in this trip, ordered by order_index */
  places: Place[];
}

/**
 * Represents a specific location within a trip
 */
export interface Place {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent trip identifier (foreign key) */
  trip_id: string;
  
  /** Human-readable place name (1-100 characters) */
  name: string;
  
  /** Google Plus Code (8-character format) */
  plus_code: string;
  
  /** Optional user notes (max 500 characters) */
  notes?: string;
  
  /** Sort order within trip (0-based, unique per trip) */
  order_index: number;
  
  /** Last modification timestamp (ISO 8601 datetime) */
  updated_at: string;
}

/**
 * Application-level data structure for hardcoded data
 */
export interface AppData {
  /** Array of all trips */
  trips: Trip[];
}

/**
 * Navigation state for routing and view management
 */
export interface NavigationState {
  /** Current view identifier */
  currentView: 'trip-list' | 'trip-details';
  
  /** Currently selected trip ID (when viewing details) */
  selectedTripId?: string;
}
```

### Component Props Contracts

```typescript
// Component interface contracts

/**
 * Props for TripCard component
 */
export interface TripCardProps {
  /** Trip data to display */
  trip: Trip;
  
  /** Click handler for navigation to trip details */
  onClick: (tripId: string) => void;
  
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for TripList component
 */
export interface TripListProps {
  /** Array of trips to display */
  trips: Trip[];
  
  /** Handler for trip selection */
  onTripSelect: (tripId: string) => void;
  
  /** Loading state indicator */
  isLoading?: boolean;
}

/**
 * Props for TripDetails component
 */
export interface TripDetailsProps {
  /** Trip data to display */
  trip: Trip;
  
  /** Handler for navigation back to trip list */
  onBack: () => void;
}

/**
 * Props for PlaceCard component
 */
export interface PlaceCardProps {
  /** Place data to display */
  place: Place;
  
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for Navigation component
 */
export interface NavigationProps {
  /** Current page title */
  title: string;
  
  /** Whether to show back button */
  showBackButton?: boolean;
  
  /** Back button click handler */
  onBack?: () => void;
}
```

### Utility Type Contracts

```typescript
// Utility types for data manipulation

/**
 * Trip data without places (for list views)
 */
export type TripSummary = Omit<Trip, 'places'> & {
  /** Number of places in this trip */
  placeCount: number;
};

/**
 * Form data for trip creation/editing (future use)
 */
export type TripFormData = Pick<Trip, 'name' | 'description' | 'start_date' | 'end_date'>;

/**
 * Form data for place creation/editing (future use)
 */
export type PlaceFormData = Pick<Place, 'name' | 'plus_code' | 'notes'>;

/**
 * Date range utility type
 */
export interface DateRange {
  start: string;
  end: string;
}

/**
 * Component loading states
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
```

## Data Validation Contracts

```typescript
// Validation schemas (future implementation with zod or similar)

/**
 * Trip validation rules
 */
export const TripValidation = {
  id: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  name: { minLength: 1, maxLength: 100 },
  description: { maxLength: 500 },
  dateFormat: /^\d{4}-\d{2}-\d{2}$/,
} as const;

/**
 * Place validation rules
 */
export const PlaceValidation = {
  id: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  name: { minLength: 1, maxLength: 100 },
  plusCode: /^[23456789CFGHJMPQRVWX]{8}$/,
  notes: { maxLength: 500 },
  orderIndex: { min: 0 },
} as const;
```

## Mock Data Contract

```typescript
// src/data/trips.json structure

/**
 * Sample hardcoded data for development and testing
 */
export const mockTripsData: AppData = {
  trips: [
    {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Tokyo Adventure",
      description: "Spring cherry blossom trip to Tokyo",
      start_date: "2025-04-01",
      end_date: "2025-04-07",
      updated_at: "2025-10-10T10:00:00.000Z",
      places: [
        {
          id: "456e7890-e12b-34c5-d678-901234567890",
          trip_id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Tokyo Skytree",
          plus_code: "8Q7XQXXR+33",
          notes: "Great city view at sunset. Best visited around 5-6 PM.",
          order_index: 0,
          updated_at: "2025-10-10T10:00:00.000Z"
        },
        {
          id: "789e0123-e45f-67g8-h901-234567890123",
          trip_id: "123e4567-e89b-12d3-a456-426614174000",
          name: "Senso-ji Temple",
          plus_code: "8Q7XPP2G+QF",
          notes: "Historic Buddhist temple in Asakusa district",
          order_index: 1,
          updated_at: "2025-10-10T10:00:00.000Z"
        }
      ]
    },
    {
      id: "987f6543-e21a-98b7-c654-321098765abc",
      name: "Kyoto Cultural Tour",
      description: "Traditional temples and gardens",
      start_date: "2025-05-15",
      end_date: "2025-05-18",
      updated_at: "2025-10-10T10:00:00.000Z",
      places: [
        {
          id: "def12345-g678-90h1-i234-567890123def",
          trip_id: "987f6543-e21a-98b7-c654-321098765abc",
          name: "Fushimi Inari Shrine",
          plus_code: "8Q6RQXQF+CR",
          notes: "Famous for thousands of vermillion torii gates",
          order_index: 0,
          updated_at: "2025-10-10T10:00:00.000Z"
        }
      ]
    }
  ]
};
```

## Contract Guarantees

### Type Safety
- All interfaces enforce strict typing with TypeScript
- Optional fields clearly marked with `?` operator
- String literals used for enumerated values

### Data Consistency
- UUIDs ensure unique identification across all entities
- Foreign key relationships maintained through trip_id
- Timestamp format consistent across all entities

### Forward Compatibility
- Interfaces designed for easy extension
- Structure supports future API integration
- Validation contracts ready for runtime checking

### Component Contracts
- Props interfaces ensure consistent component APIs
- Event handlers typed for proper callback signatures
- Optional props clearly distinguished from required props

These contracts serve as the foundation for implementation and will remain stable as the application evolves from hardcoded data to full API integration.