/**
 * Core TypeScript interfaces for Travo
 * Enhanced Trip Data Model & Itinerary Management
 */

// =============================================================================
// CORE ENTITIES
// =============================================================================

/**
 * Trip - Top-level container for a journey
 * 
 * All child collections (flights, hotels, activities, restaurants) are optional.
 * A trip can be as minimal as just name + dates or as detailed as full itinerary.
 */
export interface Trip {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Display name for the trip */
  name: string;
  
  /** Optional trip description/overview */
  description?: string;
  
  /** Trip start date (ISO 8601: YYYY-MM-DD) */
  start_date: string;
  
  /** Trip end date (ISO 8601: YYYY-MM-DD) */
  end_date: string;
  
  /** Optional starting location (e.g., "San Francisco") */
  home_location?: string;
  
  /** Last modification timestamp (ISO 8601 with timezone) */
  updated_at: string;
  
  /** Associated flights (empty array if none) */
  flights?: Flight[];
  
  /** Associated hotels (empty array if none) */
  hotels?: Hotel[];
  
  /** Associated activities (empty array if none) */
  activities?: DailyActivity[];
  
  /** Restaurant recommendations (empty array if none) */
  restaurants?: RestaurantRecommendation[];
}

/**
 * TripIndex - Lightweight trip summary for list view
 * 
 * Used in trip-index.json to avoid loading full trip data
 * when displaying the trip list page.
 */
export interface TripIndex {
  /** Unique identifier (matches Trip.id) */
  id: string;
  
  /** Trip display name */
  name: string;
  
  /** Trip start date */
  start_date: string;
  
  /** Trip end date */
  end_date: string;
  
  /** Last modification timestamp */
  updated_at: string;
}

/**
 * TripIndexFile - Structure of trip-index.json
 */
export interface TripIndexFile {
  trips: TripIndex[];
}

// =============================================================================
// FLIGHT ENTITIES
// =============================================================================

/**
 * Flight - Air travel segment with optional connection legs
 * 
 * Can represent direct flight (no legs) or multi-leg journey with connections.
 * All fields except identifiers are optional to support flexible data entry.
 */
export interface Flight {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent trip reference (UUID v4) */
  trip_id: string;
  
  /** Last modification timestamp */
  updated_at: string;
  
  /** Airline name (e.g., "United Airlines") */
  airline?: string;
  
  /** Flight number (e.g., "UA837") */
  flight_number?: string;
  
  /** Departure timestamp with timezone (ISO 8601: YYYY-MM-DDTHH:mm:ss±HH:mm) */
  departure_time?: string;
  
  /** Arrival timestamp with timezone (ISO 8601: YYYY-MM-DDTHH:mm:ss±HH:mm) */
  arrival_time?: string;
  
  /** Departure airport/city (e.g., "San Francisco (SFO)") */
  departure_location?: string;
  
  /** Arrival airport/city (e.g., "Tokyo Narita (NRT)") */
  arrival_location?: string;
  
  /** Booking confirmation number */
  confirmation_number?: string;
  
  /** Additional flight notes */
  notes?: string;
  
  /** Connection legs (empty array for direct flights) */
  legs?: FlightLeg[];
}

/**
 * FlightLeg - Individual segment of a multi-leg flight
 * 
 * Used for flights with connections/layovers where each leg
 * has its own flight number and timing.
 */
export interface FlightLeg {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent flight reference (UUID v4) */
  flight_id: string;
  
  /** Sequence number in flight (1, 2, 3...) */
  leg_number: number;
  
  /** Airline for this leg */
  airline?: string;
  
  /** Flight number for this leg */
  flight_number?: string;
  
  /** Leg departure timestamp with timezone */
  departure_time?: string;
  
  /** Leg arrival timestamp with timezone */
  arrival_time?: string;
  
  /** Leg departure airport/city */
  departure_location?: string;
  
  /** Leg arrival airport/city */
  arrival_location?: string;
  
  /** Flight duration in minutes */
  duration_minutes?: number;
}

// =============================================================================
// ACCOMMODATION ENTITY
// =============================================================================

/**
 * Hotel - Accommodation details
 * 
 * All fields except identifiers are optional. Can be completely omitted
 * from a trip if staying with friends/family or other arrangements.
 */
export interface Hotel {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent trip reference (UUID v4) */
  trip_id: string;
  
  /** Last modification timestamp */
  updated_at: string;
  
  /** Hotel name */
  name?: string;
  
  /** Full hotel address */
  address?: string;
  
  /** City name (used for grouping) */
  city?: string;
  
  /** Check-in timestamp with timezone (ISO 8601 with timezone) */
  check_in_time?: string;
  
  /** Check-out timestamp with timezone (ISO 8601 with timezone) */
  check_out_time?: string;
  
  /** Reservation/confirmation number */
  confirmation_number?: string;
  
  /** Hotel contact phone number */
  phone?: string;
  
  /** Additional hotel notes */
  notes?: string;
}

// =============================================================================
// ACTIVITY ENTITY
// =============================================================================

/**
 * DailyActivity - Planned sightseeing or activity
 * 
 * Supports flexible timing: can have specific start_time or just use
 * order_index for sequencing. Time can be omitted for unscheduled activities.
 */
export interface DailyActivity {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent trip reference (UUID v4) */
  trip_id: string;
  
  /** Last modification timestamp */
  updated_at: string;
  
  /** Activity/place name (required) */
  name: string;
  
  /** Activity date (ISO 8601: YYYY-MM-DD, required) */
  date: string;
  
  /** Optional start timestamp with timezone (ISO 8601 with timezone) */
  start_time?: string;
  
  /** Optional activity duration in minutes */
  duration_minutes?: number;
  
  /** Explicit ordering for same-day activities (required, non-negative) */
  order_index: number;
  
  /** City name (for grouping) */
  city?: string;
  
  /** Google Maps Plus Code (8-character format) */
  plus_code?: string;
  
  /** Full address */
  address?: string;
  
  /** External image URL (e.g., from Google Maps) */
  image_url?: string;
  
  /** Activity details, tips, notes */
  notes?: string;
}

// =============================================================================
// RESTAURANT ENTITY
// =============================================================================

/**
 * RestaurantRecommendation - Dining option for reference
 * 
 * NOT part of daily timeline/itinerary. These are suggestions/options
 * that appear separately, typically grouped by city.
 */
export interface RestaurantRecommendation {
  /** Unique identifier (UUID v4) */
  id: string;
  
  /** Parent trip reference (UUID v4) */
  trip_id: string;
  
  /** Last modification timestamp */
  updated_at: string;
  
  /** Restaurant name (required) */
  name: string;
  
  /** City name (for grouping) */
  city?: string;
  
  /** Type of cuisine (e.g., "Japanese (Ramen)") */
  cuisine_type?: string;
  
  /** Full restaurant address */
  address?: string;
  
  /** Google Maps Plus Code */
  plus_code?: string;
  
  /** Contact phone number */
  phone?: string;
  
  /** Restaurant website URL */
  website?: string;
  
  /** Notes about specialties, booking requirements, etc. */
  notes?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * TimelineItem - Union type for chronologically sortable items
 * 
 * Used for unified timeline view where flights, hotels, and activities
 * are sorted by their respective timestamp fields.
 */
export type TimelineItem = Flight | Hotel | DailyActivity;

/**
 * TimelineItemType - Discriminator for timeline item types
 */
export type TimelineItemType = 'flight' | 'hotel' | 'activity';

/**
 * Type guard for Flight
 */
export function isFlight(item: TimelineItem): item is Flight {
  return 'airline' in item || 'flight_number' in item;
}

/**
 * Type guard for Hotel
 */
export function isHotel(item: TimelineItem): item is Hotel {
  return 'check_in_time' in item || 'check_out_time' in item;
}

/**
 * Type guard for DailyActivity
 */
export function isActivity(item: TimelineItem): item is DailyActivity {
  return 'order_index' in item && 'date' in item;
}

/**
 * Extract timestamp from any timeline item for sorting
 * 
 * @param item Timeline item (Flight, Hotel, or DailyActivity)
 * @returns Date object or null if no timestamp available
 */
export function getItemTimestamp(item: TimelineItem): Date | null {
  if (isFlight(item) && item.departure_time) {
    return new Date(item.departure_time);
  }
  if (isHotel(item) && item.check_in_time) {
    return new Date(item.check_in_time);
  }
  if (isActivity(item) && item.start_time) {
    return new Date(item.start_time);
  }
  return null;
}

/**
 * Get display type for timeline item
 * 
 * @param item Timeline item
 * @returns Display type string
 */
export function getItemType(item: TimelineItem): TimelineItemType {
  if (isFlight(item)) return 'flight';
  if (isHotel(item)) return 'hotel';
  return 'activity';
}