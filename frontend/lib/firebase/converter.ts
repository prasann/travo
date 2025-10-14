/**
 * Firestore Data Converters
 * 
 * Feature: Firebase Integration
 * Phase: 2.4 - Firestore Converters
 * 
 * This file provides data converters for Firestore documents.
 * Converters handle:
 * - Timestamp conversion (Firestore Timestamp ↔ ISO string)
 * - Data validation
 * - Type safety between Firestore and application models
 */

import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  FirestoreDataConverter,
} from 'firebase/firestore';
import type {
  FirestoreTrip,
  FirestoreFlight,
  FirestoreFlightLeg,
  FirestoreHotel,
  FirestoreDailyActivity,
  FirestoreRestaurant,
} from './schema';

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Convert Firestore Timestamp to ISO string
 */
export function timestampToISO(timestamp: Timestamp | string): string {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return timestamp.toDate().toISOString();
}

/**
 * Convert ISO string to Firestore Timestamp
 */
export function isoToTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso));
}

/**
 * Get current timestamp as ISO string
 */
export function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

// ============================================================================
// Trip Converter
// ============================================================================

export const tripConverter: FirestoreDataConverter<FirestoreTrip> = {
  toFirestore(trip: FirestoreTrip): DocumentData {
    return {
      id: trip.id,
      name: trip.name,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      user_access: trip.user_access,
      updated_by: trip.updated_by,
      updated_at: trip.updated_at,
      created_at: trip.created_at || getCurrentISOTimestamp(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreTrip {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      name: data.name || '',
      destination: data.destination || '',
      start_date: data.start_date || '',
      end_date: data.end_date || '',
      user_access: data.user_access || [],
      updated_by: data.updated_by || '',
      updated_at: typeof data.updated_at === 'string'
        ? data.updated_at
        : timestampToISO(data.updated_at),
      created_at: data.created_at
        ? (typeof data.created_at === 'string'
            ? data.created_at
            : timestampToISO(data.created_at))
        : undefined,
    };
  },
};

// ============================================================================
// Flight Converter
// ============================================================================

export const flightConverter: FirestoreDataConverter<FirestoreFlight> = {
  toFirestore(flight: FirestoreFlight): DocumentData {
    return {
      id: flight.id,
      trip_id: flight.trip_id,
      direction: flight.direction,
      updated_by: flight.updated_by,
      updated_at: flight.updated_at,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreFlight {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      trip_id: data.trip_id || '',
      direction: data.direction || 'outbound',
      updated_by: data.updated_by || '',
      updated_at: typeof data.updated_at === 'string'
        ? data.updated_at
        : timestampToISO(data.updated_at),
    };
  },
};

// ============================================================================
// Hotel Converter
// ============================================================================

export const hotelConverter: FirestoreDataConverter<FirestoreHotel> = {
  toFirestore(hotel: FirestoreHotel): DocumentData {
    return {
      id: hotel.id,
      trip_id: hotel.trip_id,
      name: hotel.name,
      address: hotel.address,
      plus_code: hotel.plus_code,
      city: hotel.city,
      maps_link: hotel.maps_link,
      check_in_date: hotel.check_in_date,
      check_out_date: hotel.check_out_date,
      updated_by: hotel.updated_by,
      updated_at: hotel.updated_at,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreHotel {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      trip_id: data.trip_id || '',
      name: data.name || '',
      address: data.address || '',
      plus_code: data.plus_code,
      city: data.city,
      maps_link: data.maps_link,
      check_in_date: data.check_in_date || '',
      check_out_date: data.check_out_date || '',
      updated_by: data.updated_by || '',
      updated_at: typeof data.updated_at === 'string'
        ? data.updated_at
        : timestampToISO(data.updated_at),
    };
  },
};

// ============================================================================
// Activity Converter
// ============================================================================

export const activityConverter: FirestoreDataConverter<FirestoreDailyActivity> = {
  toFirestore(activity: FirestoreDailyActivity): DocumentData {
    return {
      id: activity.id,
      trip_id: activity.trip_id,
      date: activity.date,
      time_of_day: activity.time_of_day,
      name: activity.name,
      plus_code: activity.plus_code,
      address: activity.address,
      city: activity.city,
      maps_link: activity.maps_link,
      notes: activity.notes,
      order_index: activity.order_index,
      updated_by: activity.updated_by,
      updated_at: activity.updated_at,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreDailyActivity {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      trip_id: data.trip_id || '',
      date: data.date || '',
      time_of_day: data.time_of_day,
      name: data.name || '',
      plus_code: data.plus_code,
      address: data.address,
      city: data.city,
      maps_link: data.maps_link,
      notes: data.notes,
      order_index: data.order_index ?? 0,
      updated_by: data.updated_by || '',
      updated_at: typeof data.updated_at === 'string'
        ? data.updated_at
        : timestampToISO(data.updated_at),
    };
  },
};

// ============================================================================
// Restaurant Converter
// ============================================================================

export const restaurantConverter: FirestoreDataConverter<FirestoreRestaurant> = {
  toFirestore(restaurant: FirestoreRestaurant): DocumentData {
    return {
      id: restaurant.id,
      trip_id: restaurant.trip_id,
      name: restaurant.name,
      address: restaurant.address,
      plus_code: restaurant.plus_code,
      city: restaurant.city,
      maps_link: restaurant.maps_link,
      cuisine_type: restaurant.cuisine_type,
      notes: restaurant.notes,
      recommended_dishes: restaurant.recommended_dishes || [],
      updated_by: restaurant.updated_by,
      updated_at: restaurant.updated_at,
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreRestaurant {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      trip_id: data.trip_id || '',
      name: data.name || '',
      address: data.address,
      plus_code: data.plus_code,
      city: data.city,
      maps_link: data.maps_link,
      cuisine_type: data.cuisine_type,
      notes: data.notes,
      recommended_dishes: data.recommended_dishes || [],
      updated_by: data.updated_by || '',
      updated_at: typeof data.updated_at === 'string'
        ? data.updated_at
        : timestampToISO(data.updated_at),
    };
  },
};

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate ISO date string (YYYY-MM-DD)
 */
export function isValidISODate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate ISO datetime string
 */
export function isValidISODateTime(dateTimeString: string): boolean {
  const date = new Date(dateTimeString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate user_access array
 */
export function validateUserAccess(userAccess: string[]): { valid: boolean; error?: string } {
  if (!Array.isArray(userAccess)) {
    return { valid: false, error: 'user_access must be an array' };
  }
  
  if (userAccess.length === 0) {
    return { valid: false, error: 'user_access must contain at least one email' };
  }
  
  const invalidEmails = userAccess.filter(email => !isValidEmail(email));
  if (invalidEmails.length > 0) {
    return { valid: false, error: `Invalid emails: ${invalidEmails.join(', ')}` };
  }
  
  return { valid: true };
}
