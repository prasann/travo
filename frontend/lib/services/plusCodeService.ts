/**
 * Plus Code Service - Google Maps Geocoding API Integration
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Convert Google Plus Codes to human-readable addresses
 * 
 * API Documentation: https://developers.google.com/maps/documentation/geocoding/overview
 * Plus Code Format: 8-character alphanumeric code (e.g., "8Q7X9R9W")
 */

/**
 * Result type for Plus Code lookup operations
 */
export interface PlusCodeLookupResult {
  /** Whether the lookup was successful */
  success: boolean;
  
  /** Place name extracted from address (if successful) */
  name?: string;
  
  /** Full formatted address (if successful) */
  address?: string;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error type for programmatic handling */
  errorType?: 'network' | 'invalid' | 'quota_exceeded' | 'unknown';
}

/**
 * Google Maps Geocoding API response structure
 */
interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST';
  error_message?: string;
}

/**
 * Lookup a Google Plus Code and return place name and address
 * 
 * @param plusCode - 8-character Plus Code (e.g., "8Q7X9R9W")
 * @returns Promise resolving to PlusCodeLookupResult
 * 
 * Error Handling:
 * - Network errors: Returns network error with retry suggestion
 * - Invalid Plus Code (ZERO_RESULTS): Returns invalid error
 * - Quota exceeded (OVER_QUERY_LIMIT): Returns quota error
 * - Multiple results: Automatically uses first result (FR-011)
 * 
 * Example Usage:
 * ```typescript
 * const result = await lookupPlusCode('8Q7X9R9W+GF');
 * if (result.success) {
 *   console.log(result.name, result.address);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export async function lookupPlusCode(plusCode: string): Promise<PlusCodeLookupResult> {
  // Validate Plus Code format (basic check - minimum length)
  if (!plusCode || plusCode.trim().length < 4) {
    return {
      success: false,
      error: 'Plus Code is too short',
      errorType: 'invalid'
    };
  }
  
  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    return {
      success: false,
      error: 'Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local',
      errorType: 'unknown'
    };
  }
  
  // Build Geocoding API URL
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(plusCode)}&key=${apiKey}`;
  
  try {
    // Make API request
    const response = await fetch(url);
    
    if (!response.ok) {
      return {
        success: false,
        error: 'Network error. Check connection and retry.',
        errorType: 'network'
      };
    }
    
    const data: GeocodeResponse = await response.json();
    
    // Handle API status codes
    switch (data.status) {
      case 'OK':
        if (data.results.length === 0) {
          return {
            success: false,
            error: 'No results found for this Plus Code',
            errorType: 'invalid'
          };
        }
        
        // Use first result (FR-011: automatic selection)
        const result = data.results[0];
        const address = result.formatted_address;
        
        // Extract place name from address components
        // Priority: point_of_interest > establishment > street_address > formatted_address
        let name = '';
        
        for (const component of result.address_components) {
          if (component.types.includes('point_of_interest') || 
              component.types.includes('establishment')) {
            name = component.long_name;
            break;
          }
        }
        
        // Fallback: use first line of formatted address as name
        if (!name) {
          name = address.split(',')[0].trim();
        }
        
        return {
          success: true,
          name,
          address
        };
      
      case 'ZERO_RESULTS':
        return {
          success: false,
          error: 'Invalid Plus Code. Please check and try again.',
          errorType: 'invalid'
        };
      
      case 'OVER_QUERY_LIMIT':
        return {
          success: false,
          error: 'API quota exceeded. Please try again later.',
          errorType: 'quota_exceeded'
        };
      
      case 'REQUEST_DENIED':
      case 'INVALID_REQUEST':
        return {
          success: false,
          error: data.error_message || 'API request failed',
          errorType: 'unknown'
        };
      
      default:
        return {
          success: false,
          error: 'Unknown API error',
          errorType: 'unknown'
        };
    }
  } catch (error) {
    // Network or parsing errors
    return {
      success: false,
      error: 'Network error. Check connection and retry.',
      errorType: 'network'
    };
  }
}
