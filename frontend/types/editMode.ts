/**
 * Edit Mode Type Definitions
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Form data structures for trip editing
 */

/**
 * Form data for editing trip basic information
 */
export interface TripEditFormData {
  /** Trip name/title */
  name: string;
  
  /** Trip description */
  description?: string;
  
  /** Start date (ISO 8601: YYYY-MM-DD) */
  start_date: string;
  
  /** End date (ISO 8601: YYYY-MM-DD) */
  end_date: string;
  
  /** Home/starting location */
  home_location?: string;
  
  /** Trip-level notes */
  notes?: string;
  
  /** Hotels (for tracking additions/deletions) */
  hotels: HotelEditFormData[];
  
  /** Activities (for tracking additions/deletions) */
  activities: ActivityEditFormData[];
  
  /** Flights (for tracking additions/deletions) */
  flights: FlightEditFormData[];
}

/**
 * Form data for editing/creating a hotel
 */
export interface HotelEditFormData {
  /** Hotel ID (undefined for new hotels) */
  id?: string;
  
  /** Hotel name (read-only after Google Maps lookup) */
  name?: string;
  
  /** Hotel address (read-only after Google Maps lookup) */
  address?: string;
  
  /** Plus Code from Google Maps (read-only) */
  plus_code?: string;
  
  /** City name */
  city?: string;
  
  /** Check-in timestamp with timezone */
  check_in_time?: string;
  
  /** Check-out timestamp with timezone */
  check_out_time?: string;
  
  /** Confirmation/reservation number */
  confirmation_number?: string;
  
  /** Hotel phone number */
  phone?: string;
  
  /** Hotel notes */
  notes?: string;
  
  /** Google Maps URL for direct linking */
  google_maps_url?: string;
  
  /** Latitude coordinate */
  latitude?: number;
  
  /** Longitude coordinate */
  longitude?: number;
  
  /** Flag for deletion (internal use) */
  _deleted?: boolean;
}

/**
 * Form data for editing/creating an activity
 */
export interface ActivityEditFormData {
  /** Activity ID (undefined for new activities) */
  id?: string;
  
  /** Activity name (read-only after Google Maps lookup) */
  name: string;
  
  /** Activity location/address (read-only after Google Maps lookup) */
  address?: string;
  
  /** Plus Code from Google Maps (read-only) */
  plus_code?: string;
  
  /** City name */
  city?: string;
  
  /** Activity date (ISO 8601: YYYY-MM-DD) */
  date: string;
  
  /** Display order (for same-day activities) */
  order_index: number;
  
  /** Activity notes */
  notes?: string;
  
  /** Google Maps URL for direct linking */
  google_maps_url?: string;
  
  /** Latitude coordinate */
  latitude?: number;
  
  /** Longitude coordinate */
  longitude?: number;
  
  /** Flag for deletion (internal use) */
  _deleted?: boolean;
}

/**
 * Form data for editing/creating a flight
 */
export interface FlightEditFormData {
  /** Flight ID (undefined for new flights) */
  id?: string;
  
  /** Airline name */
  airline?: string;
  
  /** Flight number */
  flight_number?: string;
  
  /** Departure timestamp with timezone */
  departure_time?: string;
  
  /** Arrival timestamp with timezone */
  arrival_time?: string;
  
  /** Departure airport/city */
  departure_location?: string;
  
  /** Arrival airport/city */
  arrival_location?: string;
  
  /** Confirmation number */
  confirmation_number?: string;
  
  /** Flight notes */
  notes?: string;
  
  /** Flag for deletion (internal use) */
  _deleted?: boolean;
}

/**
 * Category names for tab navigation
 */
export type EditCategory = 'info' | 'flights' | 'hotels' | 'activities' | 'notes';

/**
 * UI state for Maps Link input component
 */
export interface MapsLinkInputState {
  /** Current Maps URL value */
  value: string;
  
  /** Whether lookup is in progress */
  loading: boolean;
  
  /** Error message if lookup failed */
  error?: string;
  
  /** Whether input is disabled (e.g., quota exceeded) */
  disabled: boolean;
}
