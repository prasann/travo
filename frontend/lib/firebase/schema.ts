/**
 * Firestore Schema Types
 * 
 * Feature: Firebase Integration
 * Phase: 2.3 - Firestore TypeScript Types
 * 
 * This file defines TypeScript interfaces for Firestore documents.
 * These extend the local database models with Firebase-specific fields:
 * - user_access: Array of email addresses with access to the trip
 * - updated_by: Email of the user who last updated the document
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Firestore Document Types
// ============================================================================

/**
 * Trip document in Firestore
 * Includes sharing and audit fields
 */
export interface FirestoreTrip {
  id: string;
  name: string;
  destination: string;
  start_date: string; // ISO 8601 date string
  end_date: string;   // ISO 8601 date string
  
  // Sharing fields
  user_access: string[];  // Array of email addresses with access
  updated_by: string;     // Email of last user who updated
  
  // Timestamps
  updated_at: string;     // ISO 8601 timestamp
  created_at?: string;    // ISO 8601 timestamp (optional for backward compatibility)
}

/**
 * Flight document in Firestore (subcollection of trips)
 */
export interface FirestoreFlight {
  id: string;
  trip_id: string;
  
  // Flight details
  airline?: string;
  flight_number?: string;
  departure_time?: string; // ISO 8601 datetime
  arrival_time?: string;   // ISO 8601 datetime
  departure_location?: string;
  arrival_location?: string;
  confirmation_number?: string;
  notes?: string;
  
  // Audit fields
  updated_by: string;
  updated_at: string;
}

/**
 * Flight leg document in Firestore (embedded in flight)
 */
export interface FirestoreFlightLeg {
  id: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string; // ISO 8601 datetime
  arrival_time: string;   // ISO 8601 datetime
  airline?: string;
  flight_number?: string;
}

/**
 * Hotel document in Firestore (subcollection of trips)
 */
export interface FirestoreHotel {
  id: string;
  trip_id: string;
  name: string;
  address: string;
  plus_code?: string;
  city?: string;
  maps_link?: string;
  check_in_time: string;  // ISO 8601 datetime (includes time)
  check_out_time: string; // ISO 8601 datetime (includes time)
  confirmation_number?: string;
  phone?: string;
  notes?: string;
  
  // Location fields for map view
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  
  // Audit fields
  updated_by: string;
  updated_at: string;
}

/**
 * Daily Activity document in Firestore (subcollection of trips)
 */
export interface FirestoreDailyActivity {
  id: string;
  trip_id: string;
  date: string;           // ISO 8601 date
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night';
  name: string;
  plus_code?: string;
  address?: string;
  city?: string;
  maps_link?: string;
  notes?: string;
  order_index: number;
  
  // Location fields for map view
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  
  // Audit fields
  updated_by: string;
  updated_at: string;
}

/**
 * Restaurant document in Firestore (subcollection of trips)
 */
export interface FirestoreRestaurant {
  id: string;
  trip_id: string;
  name: string;
  address?: string;
  plus_code?: string;
  city?: string;
  maps_link?: string;
  cuisine_type?: string;
  notes?: string;
  recommended_dishes?: string[];
  
  // Location fields for map view
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  
  // Audit fields
  updated_by: string;
  updated_at: string;
}

// ============================================================================
// Firestore Timestamp Types (for server timestamps)
// ============================================================================

/**
 * Trip document with Firestore Timestamps (for internal Firebase use)
 */
export interface FirestoreTripWithTimestamp extends Omit<FirestoreTrip, 'updated_at' | 'created_at'> {
  updated_at: Timestamp;
  created_at?: Timestamp;
}

/**
 * Generic type for any Firestore document with timestamp
 */
export type FirestoreDocumentWithTimestamp<T> = Omit<T, 'updated_at'> & {
  updated_at: Timestamp;
};

// ============================================================================
// Input Types (for creating documents - without generated fields)
// ============================================================================

/**
 * Input for creating a new trip in Firestore
 */
export type FirestoreTripInput = Omit<FirestoreTrip, 'id' | 'updated_at' | 'created_at'>;

/**
 * Input for creating a new flight in Firestore
 */
export type FirestoreFlightInput = Omit<FirestoreFlight, 'id' | 'updated_at'>;

/**
 * Input for creating a new hotel in Firestore
 */
export type FirestoreHotelInput = Omit<FirestoreHotel, 'id' | 'updated_at'>;

/**
 * Input for creating a new activity in Firestore
 */
export type FirestoreDailyActivityInput = Omit<FirestoreDailyActivity, 'id' | 'updated_at'>;

/**
 * Input for creating a new restaurant in Firestore
 */
export type FirestoreRestaurantInput = Omit<FirestoreRestaurant, 'id' | 'updated_at'>;

// ============================================================================
// Update Types (for partial updates)
// ============================================================================

/**
 * Partial update for trip document
 */
export type FirestoreTripUpdate = Partial<Omit<FirestoreTrip, 'id' | 'user_access'>> & {
  updated_by: string; // Always required on updates
};

/**
 * Generic partial update type
 */
export type FirestoreUpdate<T> = Partial<Omit<T, 'id'>> & {
  updated_by: string;
};
