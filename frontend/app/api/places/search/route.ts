import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Place Lookup from Google Maps Link
 * 
 * Simple and reliable approach:
 * 1. Resolve short links (if needed)
 * 2. Extract place name and coordinates from URL
 * 3. Search using Text Search API with location bias (500m radius)
 * 4. Fetch complete details via Place Details API
 * 
 * The combination of place name + coordinate bias ensures we get the right place
 * even for generic names like "The Grand Palace" - the coordinates provide
 * geographic context to disambiguate.
 * 
 * Supports all Google Maps URL formats:
 * - Short links: https://maps.app.goo.gl/xxx (auto-resolved)
 * - Full URLs: /place/Name/@lat,lng,zoom/data=...
 * - Works from mobile or desktop share buttons
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
    
    // Step 3: Extract place name from URL
    const placeNameMatch = resolvedUrl.match(/\/place\/([^/@?#]+)/);
    
    if (!placeNameMatch) {
      return NextResponse.json(
        { error: 'Could not extract place name from URL. Please copy the full Google Maps URL from your browser.' },
        { status: 400 }
      );
    }
    
    const encodedName = placeNameMatch[1];
    const placeName = decodeURIComponent(encodedName.replace(/\+/g, ' '));
    
    // Step 4: Extract coordinates for location bias
    const coordsMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    // Step 5: Search using Text Search API with location bias
    // This is the most reliable approach - combines place name + coordinates
    let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}`;
    
    if (coordsMatch) {
      // Use 500m radius for good balance between precision and coverage
      searchUrl += `&location=${coordsMatch[1]},${coordsMatch[2]}&radius=500`;
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
    
    const placeId = searchData.results[0].place_id;
    
    // Step 6: Fetch full place details using the Place ID
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
