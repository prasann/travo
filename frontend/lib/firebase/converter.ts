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

/**
 * Build Firestore document by filtering out undefined values from optional fields
 * 
 * @param required - Required fields (always included)
 * @param optional - Optional fields (undefined values filtered out)
 * @returns DocumentData with required fields and defined optional fields
 */
function buildFirestoreDoc<T extends DocumentData>(
  required: Record<string, any>,
  optional: Record<string, any> = {}
): T {
  const filtered = Object.fromEntries(
    Object.entries(optional).filter(([_, value]) => value !== undefined)
  );
  return { ...required, ...filtered } as T;
}

// ============================================================================
// Trip Converter
// ============================================================================

export const tripConverter: FirestoreDataConverter<FirestoreTrip> = {
  toFirestore(trip: FirestoreTrip): DocumentData {
    return buildFirestoreDoc(
      // Required fields
      {
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        start_date: trip.start_date,
        end_date: trip.end_date,
        user_access: trip.user_access,
        updated_by: trip.updated_by,
        updated_at: trip.updated_at,
        created_at: trip.created_at || getCurrentISOTimestamp(),
      },
      // Optional fields
      {
        notes: trip.notes,
      }
    );
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
      notes: data.notes,
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
    return buildFirestoreDoc(
      // Required fields
      {
        id: flight.id,
        trip_id: flight.trip_id,
        updated_by: flight.updated_by,
        updated_at: flight.updated_at,
      },
      // Optional fields (undefined values filtered automatically)
      {
        airline: flight.airline,
        flight_number: flight.flight_number,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        departure_location: flight.departure_location,
        arrival_location: flight.arrival_location,
        confirmation_number: flight.confirmation_number,
        notes: flight.notes,
      }
    );
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): FirestoreFlight {
    const data = snapshot.data(options);
    
    return {
      id: snapshot.id,
      trip_id: data.trip_id || '',
      airline: data.airline,
      flight_number: data.flight_number,
      departure_time: data.departure_time,
      arrival_time: data.arrival_time,
      departure_location: data.departure_location,
      arrival_location: data.arrival_location,
      confirmation_number: data.confirmation_number,
      notes: data.notes,
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
    return buildFirestoreDoc(
      // Required fields
      {
        id: hotel.id,
        trip_id: hotel.trip_id,
        name: hotel.name,
        address: hotel.address,
        check_in_time: hotel.check_in_time,
        check_out_time: hotel.check_out_time,
        updated_by: hotel.updated_by,
        updated_at: hotel.updated_at,
      },
      // Optional fields (undefined values filtered automatically)
      {
        plus_code: hotel.plus_code,
        city: hotel.city,
        maps_link: hotel.maps_link,
        google_maps_url: hotel.google_maps_url,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        confirmation_number: hotel.confirmation_number,
        phone: hotel.phone,
        notes: hotel.notes,
      }
    );
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
      google_maps_url: data.google_maps_url,
      latitude: data.latitude,
      longitude: data.longitude,
      check_in_time: data.check_in_time || '',
      check_out_time: data.check_out_time || '',
      confirmation_number: data.confirmation_number,
      phone: data.phone,
      notes: data.notes,
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
    return buildFirestoreDoc(
      // Required fields
      {
        id: activity.id,
        trip_id: activity.trip_id,
        date: activity.date,
        name: activity.name,
        order_index: activity.order_index,
        updated_by: activity.updated_by,
        updated_at: activity.updated_at,
      },
      // Optional fields (undefined values filtered automatically)
      {
        time_of_day: activity.time_of_day,
        plus_code: activity.plus_code,
        address: activity.address,
        city: activity.city,
        maps_link: activity.maps_link,
        google_maps_url: activity.google_maps_url,
        latitude: activity.latitude,
        longitude: activity.longitude,
        description: activity.description,
        notes: activity.notes,
      }
    );
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
      google_maps_url: data.google_maps_url,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description,
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
    return buildFirestoreDoc(
      // Required fields
      {
        id: restaurant.id,
        trip_id: restaurant.trip_id,
        name: restaurant.name,
        updated_by: restaurant.updated_by,
        updated_at: restaurant.updated_at,
        recommended_dishes: restaurant.recommended_dishes || [],
      },
      // Optional fields (undefined values filtered automatically)
      {
        address: restaurant.address,
        plus_code: restaurant.plus_code,
        city: restaurant.city,
        maps_link: restaurant.maps_link,
        google_maps_url: restaurant.google_maps_url,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        cuisine_type: restaurant.cuisine_type,
        notes: restaurant.notes,
      }
    );
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
      google_maps_url: data.google_maps_url,
      latitude: data.latitude,
      longitude: data.longitude,
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
// Bidirectional Transformations (IndexedDB ↔ Firestore)
// ============================================================================

import type {
  Trip,
  Flight,
  Hotel,
  DailyActivity,
  RestaurantRecommendation,
} from '../db/models';

/**
 * Transform IndexedDB Trip to Firestore Trip format
 */
export function tripToFirestore(trip: Trip): FirestoreTrip {
  return {
    id: trip.id,
    name: trip.name,
    destination: trip.description || trip.name,
    start_date: trip.start_date,
    end_date: trip.end_date,
    notes: trip.notes,
    user_access: trip.user_access,
    updated_by: trip.updated_by,
    updated_at: trip.updated_at,
    created_at: trip.updated_at,
  };
}

/**
 * Transform Firestore Trip to IndexedDB Trip format
 */
export function tripFromFirestore(firestoreTrip: FirestoreTrip): Trip {
  return {
    id: firestoreTrip.id,
    name: firestoreTrip.name,
    description: `Trip to ${firestoreTrip.destination}`,
    start_date: firestoreTrip.start_date,
    end_date: firestoreTrip.end_date,
    home_location: undefined,
    notes: firestoreTrip.notes,
    updated_at: firestoreTrip.updated_at,
    deleted: false,
    user_access: firestoreTrip.user_access,
    updated_by: firestoreTrip.updated_by,
  };
}

/**
 * Transform IndexedDB Flight to Firestore Flight format
 */
export function flightToFirestore(flight: Flight): FirestoreFlight {
  return {
    id: flight.id,
    trip_id: flight.trip_id,
    airline: flight.airline,
    flight_number: flight.flight_number,
    departure_time: flight.departure_time,
    arrival_time: flight.arrival_time,
    departure_location: flight.departure_location,
    arrival_location: flight.arrival_location,
    confirmation_number: flight.confirmation_number,
    notes: flight.notes,
    updated_by: flight.updated_by,
    updated_at: flight.updated_at,
  };
}

/**
 * Transform Firestore Flight to IndexedDB Flight format
 */
export function flightFromFirestore(firestoreFlight: FirestoreFlight): Flight {
  return {
    id: firestoreFlight.id,
    trip_id: firestoreFlight.trip_id,
    airline: firestoreFlight.airline,
    flight_number: firestoreFlight.flight_number,
    departure_time: firestoreFlight.departure_time,
    arrival_time: firestoreFlight.arrival_time,
    departure_location: firestoreFlight.departure_location,
    arrival_location: firestoreFlight.arrival_location,
    confirmation_number: firestoreFlight.confirmation_number,
    notes: firestoreFlight.notes,
    updated_at: firestoreFlight.updated_at,
    updated_by: firestoreFlight.updated_by,
    legs: [], // Flight legs are managed separately
  };
}

/**
 * Transform IndexedDB Hotel to Firestore Hotel format
 */
export function hotelToFirestore(hotel: Hotel): FirestoreHotel {
  return {
    id: hotel.id,
    trip_id: hotel.trip_id,
    name: hotel.name || 'Hotel',
    address: hotel.address || '',
    plus_code: hotel.plus_code || undefined,
    city: hotel.city || undefined,
    google_maps_url: hotel.google_maps_url || undefined,
    latitude: hotel.latitude || undefined,
    longitude: hotel.longitude || undefined,
    check_in_time: hotel.check_in_time || '',
    check_out_time: hotel.check_out_time || '',
    confirmation_number: hotel.confirmation_number || undefined,
    phone: hotel.phone || undefined,
    notes: hotel.notes || undefined,
    updated_by: hotel.updated_by,
    updated_at: hotel.updated_at,
  };
}

/**
 * Transform Firestore Hotel to IndexedDB Hotel format
 */
export function hotelFromFirestore(firestoreHotel: FirestoreHotel): Hotel {
  return {
    id: firestoreHotel.id,
    trip_id: firestoreHotel.trip_id,
    name: firestoreHotel.name,
    address: firestoreHotel.address,
    city: firestoreHotel.city,
    plus_code: firestoreHotel.plus_code,
    google_maps_url: firestoreHotel.google_maps_url,
    latitude: firestoreHotel.latitude,
    longitude: firestoreHotel.longitude,
    check_in_time: firestoreHotel.check_in_time,
    check_out_time: firestoreHotel.check_out_time,
    confirmation_number: firestoreHotel.confirmation_number,
    phone: firestoreHotel.phone,
    notes: firestoreHotel.notes,
    updated_at: firestoreHotel.updated_at,
    updated_by: firestoreHotel.updated_by,
  };
}

/**
 * Transform IndexedDB Activity to Firestore Activity format
 */
export function activityToFirestore(activity: DailyActivity): FirestoreDailyActivity {
  const time_of_day: 'morning' | 'afternoon' | 'evening' | 'night' = 'morning';
  
  return {
    id: activity.id,
    trip_id: activity.trip_id,
    name: activity.name || '',
    date: activity.date || '',
    time_of_day,
    city: activity.city || undefined,
    plus_code: activity.plus_code || undefined,
    address: activity.address || undefined,
    google_maps_url: activity.google_maps_url || undefined,
    latitude: activity.latitude || undefined,
    longitude: activity.longitude || undefined,
    description: activity.description || undefined,
    notes: activity.notes || undefined,
    order_index: activity.order_index ?? 0,
    updated_by: activity.updated_by,
    updated_at: activity.updated_at,
  };
}

/**
 * Transform Firestore Activity to IndexedDB Activity format
 */
export function activityFromFirestore(firestoreActivity: FirestoreDailyActivity): DailyActivity {
  return {
    id: firestoreActivity.id,
    trip_id: firestoreActivity.trip_id,
    name: firestoreActivity.name,
    date: firestoreActivity.date,
    order_index: firestoreActivity.order_index,
    city: firestoreActivity.city,
    plus_code: firestoreActivity.plus_code,
    address: firestoreActivity.address,
    google_maps_url: firestoreActivity.google_maps_url,
    latitude: firestoreActivity.latitude,
    longitude: firestoreActivity.longitude,
    description: firestoreActivity.description,
    image_url: undefined,
    notes: firestoreActivity.notes,
    updated_at: firestoreActivity.updated_at,
    updated_by: firestoreActivity.updated_by,
  };
}

/**
 * Transform IndexedDB Restaurant to Firestore Restaurant format
 */
export function restaurantToFirestore(restaurant: RestaurantRecommendation): FirestoreRestaurant {
  return {
    id: restaurant.id,
    trip_id: restaurant.trip_id,
    name: restaurant.name || '',
    address: restaurant.address || undefined,
    plus_code: restaurant.plus_code || undefined,
    city: restaurant.city || undefined,
    google_maps_url: restaurant.google_maps_url || undefined,
    latitude: restaurant.latitude || undefined,
    longitude: restaurant.longitude || undefined,
    cuisine_type: restaurant.cuisine_type || undefined,
    notes: restaurant.notes || undefined,
    updated_by: restaurant.updated_by,
    updated_at: restaurant.updated_at,
  };
}

/**
 * Transform Firestore Restaurant to IndexedDB Restaurant format
 */
export function restaurantFromFirestore(firestoreRestaurant: FirestoreRestaurant): RestaurantRecommendation {
  return {
    id: firestoreRestaurant.id,
    trip_id: firestoreRestaurant.trip_id,
    name: firestoreRestaurant.name,
    city: firestoreRestaurant.city,
    cuisine_type: firestoreRestaurant.cuisine_type,
    address: firestoreRestaurant.address,
    plus_code: firestoreRestaurant.plus_code,
    google_maps_url: firestoreRestaurant.google_maps_url,
    latitude: firestoreRestaurant.latitude,
    longitude: firestoreRestaurant.longitude,
    phone: undefined,
    website: undefined,
    notes: firestoreRestaurant.notes,
    updated_at: firestoreRestaurant.updated_at,
    updated_by: firestoreRestaurant.updated_by,
  };
}

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
