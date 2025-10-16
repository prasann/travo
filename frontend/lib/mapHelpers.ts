/**
 * Map View Utilities
 * 
 * Helper functions for extracting and processing location data for map display
 */

import type { TripWithRelations, DailyActivity, Hotel, RestaurantRecommendation } from '@/lib/db/models';

/**
 * Map marker representing a location on the map
 */
export interface MapMarker {
  /** Unique identifier */
  id: string;
  
  /** Place name */
  name: string;
  
  /** Type of location */
  type: 'activity' | 'hotel' | 'restaurant';
  
  /** Coordinates */
  lat: number;
  lng: number;
  
  /** Date (for activities and hotels) */
  date?: string;
  
  /** Day number (for coloring) */
  dayNumber?: number;
  
  /** Additional info */
  address?: string;
  city?: string;
  notes?: string;
}

/**
 * Day colors matching timeline - reusable across app
 */
export const DAY_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#6b7280', // gray
  '#14b8a6', // teal
  '#f43f5e', // rose
];

/**
 * Get coordinates from an item with fallbacks
 * Priority: latitude/longitude > plus_code conversion > null
 */
export function getCoordinates(item: {
  latitude?: number;
  longitude?: number;
  plus_code?: string;
}): { lat: number; lng: number } | null {
  // Direct coordinates (best)
  if (item.latitude !== undefined && item.longitude !== undefined) {
    return {
      lat: item.latitude,
      lng: item.longitude,
    };
  }
  
  // Plus code conversion (fallback)
  // For now, return null - we'll add plus code decoding if needed
  // Most new entries will have coordinates directly
  
  return null;
}

/**
 * Calculate day number from trip start date
 */
function getDayNumber(startDate: string, itemDate: string): number {
  const start = new Date(startDate);
  const item = new Date(itemDate);
  const diffTime = item.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Extract map markers from activities
 */
function extractActivityMarkers(
  activities: DailyActivity[],
  tripStartDate: string
): MapMarker[] {
  const markers: MapMarker[] = [];
  
  activities.forEach((activity) => {
    const coords = getCoordinates(activity);
    if (!coords) return;
    
    const dayNumber = getDayNumber(tripStartDate, activity.date);
    
    markers.push({
      id: activity.id,
      name: activity.name,
      type: 'activity',
      lat: coords.lat,
      lng: coords.lng,
      date: activity.date,
      dayNumber,
      address: activity.address,
      city: activity.city,
      notes: activity.notes,
    });
  });
  
  return markers;
}

/**
 * Extract map markers from hotels
 */
function extractHotelMarkers(
  hotels: Hotel[],
  tripStartDate: string
): MapMarker[] {
  const markers: MapMarker[] = [];
  
  hotels.forEach((hotel) => {
    const coords = getCoordinates(hotel);
    if (!coords) return;
    
    // Use check-in date for day calculation
    const checkInDate = hotel.check_in_time?.split('T')[0];
    const dayNumber = checkInDate ? getDayNumber(tripStartDate, checkInDate) : undefined;
    
    markers.push({
      id: hotel.id,
      name: hotel.name || 'Hotel',
      type: 'hotel',
      lat: coords.lat,
      lng: coords.lng,
      date: checkInDate,
      dayNumber,
      address: hotel.address,
      city: hotel.city,
      notes: hotel.notes,
    });
  });
  
  return markers;
}

/**
 * Extract map markers from restaurants
 */
function extractRestaurantMarkers(
  restaurants: RestaurantRecommendation[]
): MapMarker[] {
  const markers: MapMarker[] = [];
  
  restaurants.forEach((restaurant) => {
    const coords = getCoordinates(restaurant);
    if (!coords) return;
    
    markers.push({
      id: restaurant.id,
      name: restaurant.name,
      type: 'restaurant',
      lat: coords.lat,
      lng: coords.lng,
      address: restaurant.address,
      city: restaurant.city,
      notes: restaurant.notes,
    });
  });
  
  return markers;
}

/**
 * Extract all map markers from a trip
 */
export function extractMapMarkers(trip: TripWithRelations): MapMarker[] {
  const markers: MapMarker[] = [];
  
  // Add activity markers
  if (trip.activities && trip.activities.length > 0) {
    markers.push(...extractActivityMarkers(trip.activities, trip.start_date));
  }
  
  // Add hotel markers
  if (trip.hotels && trip.hotels.length > 0) {
    markers.push(...extractHotelMarkers(trip.hotels, trip.start_date));
  }
  
  // Add restaurant markers
  if (trip.restaurants && trip.restaurants.length > 0) {
    markers.push(...extractRestaurantMarkers(trip.restaurants));
  }
  
  return markers;
}

/**
 * Get color for a marker based on day number
 */
export function getMarkerColor(marker: MapMarker): string {
  // Restaurants get a special color
  if (marker.type === 'restaurant') {
    return '#a855f7'; // purple
  }
  
  // Other items colored by day
  if (marker.dayNumber !== undefined) {
    return DAY_COLORS[marker.dayNumber % DAY_COLORS.length];
  }
  
  // Fallback color
  return '#6b7280'; // gray
}

/**
 * Calculate map bounds to fit all markers
 */
export function calculateBounds(markers: MapMarker[]): google.maps.LatLngBoundsLiteral | null {
  if (markers.length === 0) return null;
  
  let minLat = markers[0].lat;
  let maxLat = markers[0].lat;
  let minLng = markers[0].lng;
  let maxLng = markers[0].lng;
  
  markers.forEach((marker) => {
    minLat = Math.min(minLat, marker.lat);
    maxLat = Math.max(maxLat, marker.lat);
    minLng = Math.min(minLng, marker.lng);
    maxLng = Math.max(maxLng, marker.lng);
  });
  
  return {
    south: minLat,
    west: minLng,
    north: maxLat,
    east: maxLng,
  };
}
