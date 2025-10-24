/**
 * Image Utilities
 * 
 * Helper functions for handling Google Places API photo URLs
 */

/**
 * Extract photo name from a Google Places photo URL
 * @param imageUrl - Full photo URL from Google Places API
 * @returns Photo name (e.g., "places/ChIJ...")
 */
export function extractPhotoName(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined;
  
  // Match pattern: https://places.googleapis.com/v1/{photoName}/media?...
  const match = imageUrl.match(/places\.googleapis\.com\/v1\/([^/]+\/[^/]+)\/media/);
  return match ? match[1] : undefined;
}

/**
 * Generate a Google Places photo URL with API key
 * Works with both full URLs and photo names
 * @param imageUrlOrName - Full photo URL or just the photo name
 * @param maxWidth - Maximum width in pixels (default: 800)
 * @returns Full photo URL with API key, or undefined if invalid
 */
export function getPhotoUrl(imageUrlOrName: string | undefined, maxWidth: number = 800): string | undefined {
  if (!imageUrlOrName) return undefined;
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('Google Maps API key not configured');
    return undefined;
  }
  
  // If it's already a full URL, check if it needs the API key updated
  if (imageUrlOrName.includes('places.googleapis.com')) {
    const photoName = extractPhotoName(imageUrlOrName);
    if (!photoName) return undefined;
    return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
  }
  
  // If it's just a photo name (e.g., "places/ChIJ...")
  if (imageUrlOrName.startsWith('places/')) {
    return `https://places.googleapis.com/v1/${imageUrlOrName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
  }
  
  // Invalid format
  return undefined;
}

/**
 * Check if an image URL is a Google Places photo
 * @param imageUrl - Image URL to check
 * @returns True if it's a Google Places photo URL
 */
export function isGooglePlacesPhoto(imageUrl: string | undefined): boolean {
  if (!imageUrl) return false;
  return imageUrl.includes('places.googleapis.com') || imageUrl.startsWith('places/');
}
