/**
 * Google Maps Utilities
 * 
 * Helper functions for generating Google Maps URLs from location data
 */

/**
 * Generate Google Maps URL from location data
 * Priority: google_maps_url > coordinates > plus_code > address
 * 
 * @param location Location data with optional google_maps_url, coordinates, plus_code, address
 * @returns Google Maps URL or null if no location data available
 */
export function getGoogleMapsUrl(location: {
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  plus_code?: string;
  address?: string;
  name?: string;
}): string | null {
  // Priority 1: Use stored Google Maps URL
  if (location.google_maps_url) {
    return location.google_maps_url;
  }
  
  // Priority 2: Generate URL from coordinates
  if (location.latitude && location.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }
  
  // Priority 3: Use Plus Code
  if (location.plus_code) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.plus_code)}`;
  }
  
  // Priority 4: Use address
  if (location.address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`;
  }
  
  // Priority 5: Use name as fallback (least reliable)
  if (location.name) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name)}`;
  }
  
  return null;
}

/**
 * Check if location has any mappable data
 */
export function hasLocationData(location: {
  google_maps_url?: string;
  latitude?: number;
  longitude?: number;
  plus_code?: string;
  address?: string;
}): boolean {
  return !!(
    location.google_maps_url ||
    (location.latitude && location.longitude) ||
    location.plus_code ||
    location.address
  );
}
