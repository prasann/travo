/**
 * Place Search Service - Google Maps API Integration
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Extract place details from Google Maps share links
 * 
 * Flow:
 * 1. User pastes Google Maps link (short or full URL from mobile/desktop)
 * 2. Server resolves redirects (for short links)
 * 3. Server tries multiple strategies to identify the place:
 *    a. Extract CID (hex-encoded Place ID) from URL data parameter
 *    b. Use coordinates from URL for location-based lookup
 *    c. Fallback to text search with location bias
 * 4. Fetches complete place details using Place Details API
 * 5. Returns name, address, coordinates, description, photo
 * 
 * Supported URL formats:
 * - https://maps.app.goo.gl/xxx (short link)
 * - https://www.google.com/maps/place/Name/@lat,lng,zoom/data=...
 * - Any Google Maps share link from browser or mobile app
 * 
 * API Documentation: 
 * - Place Details: https://developers.google.com/maps/documentation/places/web-service/details
 * - Find Place: https://developers.google.com/maps/documentation/places/web-service/search-find-place
 * - Nearby Search: https://developers.google.com/maps/documentation/places/web-service/search-nearby
 */

/**
 * Result type for place search operations
 */
export interface PlaceSearchResult {
  /** Whether the lookup was successful */
  success: boolean;
  
  /** Place name (if successful) */
  name?: string;
  
  /** Full formatted address (if successful) */
  address?: string;
  
  /** Google Plus Code (if successful) */
  plusCode?: string;
  
  /** City name (if successful) */
  city?: string;
  
  /** Google Place ID for future reference (if successful) */
  placeId?: string;
  
  /** Coordinates (if successful) */
  location?: {
    lat: number;
    lng: number;
  };
  
  /** Editorial summary/description from Google Places (if available) */
  description?: string;
  
  /** Photo URL from Google Places Photos API (if available) */
  photoUrl?: string;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error type for programmatic handling */
  errorType?: 'network' | 'invalid' | 'not_found' | 'quota_exceeded' | 'unknown';
}

/**
 * Response from our Next.js API route (/api/places/search)
 * This is the normalized place data returned from the server
 */
interface PlaceLookupResponse {
  name: string;
  address: string;
  plusCode?: string;
  city?: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
  description?: string;
  photoUrl?: string;
}

/**
 * Error response from API route
 */
interface PlaceLookupError {
  error: string;
}


/**

/**
 * Extract search query from user input (URL or plain text)
 * 
 * @param input - User input (Google Maps URL or place name)
 * @param resolvedUrl - Optional pre-resolved URL (for short links)
 * @returns Extracted search query or null if can't parse URL
 */
function extractSearchQuery(input: string, resolvedUrl?: string): string | null {
  input = input.trim();
  
  // If it's not a URL, return as-is
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    return input;
  }
  
  try {
    // Use resolved URL if provided (for short links), otherwise use input
    const urlToUse = resolvedUrl || input;
    const url = new URL(urlToUse);
    
    // Only accept Google Maps URLs
    if (!url.hostname.includes('google.com') && !url.hostname.includes('maps.app.goo.gl')) {
      return null;
    }
    
    // Format: /maps/place/Tokyo+Skytree/@coords
    const placeMatch = url.pathname.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    
    // Format: /maps/search/Tokyo+Skytree/
    const searchMatch = url.pathname.match(/\/maps\/search\/([^/]+)/);
    if (searchMatch) {
      return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '));
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Look up place details from a Google Maps share link
 * 
 * Accepts Google Maps URLs:
 * - Short links: https://maps.app.goo.gl/xxx
 * - Direct place_id: https://www.google.com/maps/place/?q=place_id:ChIJxxx
 * - Regular share links: https://www.google.com/maps/place/Tokyo+Skytree/@35.71,...
 * 
 * @param input - Google Maps URL
 * @returns Promise resolving to PlaceSearchResult with place details
 * 
 * Flow:
 * 1. Validates input is a Google Maps URL
 * 2. Calls Next.js API route (/api/places/search)
 * 3. Server resolves short links and extracts place_id
 * 4. Server fetches place details from Google Places API
 * 5. Returns normalized place data (name, address, coordinates)
 * 
 * Example Usage:
 * ```typescript
 * const result = await searchPlace('https://maps.app.goo.gl/xxx');
 * 
 * if (result.success) {
 *   console.log(result.name);       // "Tokyo Skytree"
 *   console.log(result.address);    // "1 Chome-1-2 Oshiage, Sumida City..."
 *   console.log(result.placeId);    // "ChIJN1t_tDeuEmsRUsoyG83frY4"
 *   console.log(result.location);   // { lat: 35.71, lng: 139.81 }
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function searchPlace(input: string): Promise<PlaceSearchResult> {
  // Validate input
  if (!input || input.trim().length === 0) {
    return {
      success: false,
      error: 'Please paste a Google Maps link',
      errorType: 'invalid'
    };
  }
  
  const url = input.trim();
  
  // Validate it's a Google Maps URL
  if (!url.includes('google.com/maps') && !url.includes('maps.app.goo.gl')) {
    return {
      success: false,
      error: 'Please provide a valid Google Maps link',
      errorType: 'invalid'
    };
  }
  
  try {
    // Call our Next.js API route which handles:
    // 1. Resolving short links
    // 2. Extracting place_id
    // 3. Fetching place details from Google
    const apiUrl = `/api/places/search?url=${encodeURIComponent(url)}`;
    
    console.log('Looking up place from URL:', url);
    
    const response = await fetch(apiUrl);
    const data: PlaceLookupResponse | PlaceLookupError = await response.json();
    
    // Check if response contains an error
    if ('error' in data) {
      console.error('API error:', data.error);
      return {
        success: false,
        error: data.error,
        errorType: response.status === 400 ? 'invalid' : 'unknown'
      };
    }
    
    // Success! Return the normalized place data
    return {
      success: true,
      name: data.name,
      address: data.address,
      plusCode: data.plusCode,
      city: data.city,
      placeId: data.placeId,
      location: data.location,
      description: data.description,
      photoUrl: data.photoUrl
    };
    
  } catch (error) {
    console.error('Network error:', error);
    return {
      success: false,
      error: 'Network error. Check connection and retry.',
      errorType: 'network'
    };
  }
}
