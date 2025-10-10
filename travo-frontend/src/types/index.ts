/**
 * Core TypeScript interfaces for Travo - Minimalistic Frontend
 * 
 * Based on contracts from specs/001-minimalistic-clean-and/contracts/interfaces.md
 * Generated: 2025-10-10
 */

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

// Component Props Contracts

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

// Utility Types

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

// Validation Rules (for future implementation)

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