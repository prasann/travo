import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Place Lookup from Google Maps Link
 * 
 * Improved approach with multiple fallback strategies:
 * 1. Extract CID (hex format Place ID) from URL data parameter (most reliable)
 * 2. Fallback to coordinates-based lookup (accurate)
 * 3. Last resort: Text search with location bias (for compatibility)
 * 
 * Once Place ID is obtained, fetch complete details via Place Details API.
 * 
 * Supports all Google Maps URL formats:
 * - Short links: https://maps.app.goo.gl/xxx (auto-resolved)
 * - Full URLs with coordinates: /place/Name/@lat,lng,zoom/data=...
 * - Share URLs from mobile or desktop
 * 
 * This approach ensures we get the correct place even for generic names like
 * "The Grand Palace" by using location context from the URL.
 */

// Mark route as dynamic (required for Next.js 15 App Router API routes with query params)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    return NextResponse.json(
      { error: 'Google Maps API key not configured' },
      { status: 500 }
    );
  }
  
  try {
    // Step 1: Validate it's a Google Maps URL
    if (!url.includes('google.com/maps') && !url.includes('maps.app.goo.gl')) {
      return NextResponse.json(
        { error: 'Please provide a valid Google Maps link' },
        { status: 400 }
      );
    }
    
    // Step 2: Resolve short links if needed
    let resolvedUrl = url;
    if (url.includes('maps.app.goo.gl')) {
      const redirectResponse = await fetch(url, { 
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      resolvedUrl = redirectResponse.url;
    }
    
    // Step 3: Try to extract Place ID from URL data parameter (most reliable)
    // Format: data=!3m1!4b1!4m6!3m5!1s0x30e2994e316c363f:0x2a6c77dd93ef4c41
    // The Place ID is encoded in the CID (0x hex format)
    const cidMatch = resolvedUrl.match(/!1s(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)/);
    let placeId: string | null = null;
    
    if (cidMatch) {
      // Try to look up place by CID using Find Place API
      const cid = cidMatch[1];
      const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(cid)}&inputtype=textquery&fields=place_id&key=${apiKey}`;
      
      try {
        const findResponse = await fetch(findPlaceUrl);
        const findData = await findResponse.json();
        
        if (findData.status === 'OK' && findData.candidates && findData.candidates.length > 0) {
          placeId = findData.candidates[0].place_id;
          console.log('Found place by CID:', placeId);
        }
      } catch (cidError) {
        console.log('CID lookup failed, will try coordinates fallback');
      }
    }
    
    // Step 4: Fallback to coordinates if Place ID not found
    if (!placeId) {
      // Extract coordinates from URL: @latitude,longitude,zoom
      const coordsMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      
      if (coordsMatch) {
        const lat = coordsMatch[1];
        const lng = coordsMatch[2];
        console.log('Using coordinates:', lat, lng);
        
        // Use Nearby Search with exact location
        const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=50&key=${apiKey}`;
        
        const nearbyResponse = await fetch(nearbyUrl);
        const nearbyData = await nearbyResponse.json();
        
        if (nearbyData.status === 'OK' && nearbyData.results && nearbyData.results.length > 0) {
          placeId = nearbyData.results[0].place_id;
          console.log('Found place by coordinates:', placeId);
        }
      }
    }
    
    // Step 5: Last resort - text search with location bias
    if (!placeId) {
      console.log('Falling back to text search');
      
      const placeNameMatch = resolvedUrl.match(/\/place\/([^/@?#]+)/);
      
      if (!placeNameMatch) {
        return NextResponse.json(
          { error: 'Could not extract location from URL. Please copy the full Google Maps URL from your browser.' },
          { status: 400 }
        );
      }
      
      const encodedName = placeNameMatch[1];
      const placeName = decodeURIComponent(encodedName.replace(/\+/g, ' '));
      
      // Extract coordinates for location bias
      const coordsMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}`;
      
      // Add location bias if coordinates available
      if (coordsMatch) {
        searchUrl += `&location=${coordsMatch[1]},${coordsMatch[2]}&radius=5000`;
      }
      
      searchUrl += `&key=${apiKey}`;
      
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.status !== 'OK') {
        console.error('Text Search API error:', searchData.status);
        return NextResponse.json(
          { error: `Could not find place: ${searchData.status}` },
          { status: 400 }
        );
      }
      
      if (!searchData.results || searchData.results.length === 0) {
        return NextResponse.json(
          { error: 'No places found. Please try a different Google Maps link.' },
          { status: 404 }
        );
      }
      
      placeId = searchData.results[0].place_id;
    }
    
    // Step 6: Now fetch full place details using the Place ID
    const detailsFieldsBasic = 'name,formatted_address,geometry,address_components,plus_code,place_id';
    const detailsFieldsExtra = 'editorial_summary,photos';
    const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${detailsFieldsBasic},${detailsFieldsExtra}&key=${apiKey}`;
    
    const detailsResponse = await fetch(placeDetailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status !== 'OK' || !detailsData.result) {
      return NextResponse.json(
        { error: `Could not fetch place details: ${detailsData.status}` },
        { status: 400 }
      );
    }
    
    const place = detailsData.result;
    
    // Step 7: Extract city from address_components (type: "locality")
    let city: string | undefined;
    if (place.address_components) {
      const cityComponent = place.address_components.find((component: any) =>
        component.types.includes('locality')
      );
      if (cityComponent) {
        city = cityComponent.long_name;
      }
    }
    
    // Step 8: Extract description and photo URL
    let description: string | undefined;
    let photoUrl: string | undefined;
    
    const editorialSummary = place.editorial_summary?.overview;
    if (editorialSummary) {
      description = editorialSummary;
    }
    
    if (place.photos && place.photos.length > 0) {
      const photoReference = place.photos[0].photo_reference;
      photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${apiKey}`;
    }
    
    // Step 9: Return normalized data
    return NextResponse.json({
      name: place.name,
      address: place.formatted_address,
      plusCode: place.plus_code?.global_code,
      city: city,
      placeId: place.place_id,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      description: description,
      photoUrl: photoUrl
    });
    
  } catch (error) {
    console.error('Place lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to process Google Maps link' },
      { status: 500 }
    );
  }
}
