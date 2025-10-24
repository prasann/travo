import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Place Lookup from Google Maps Link
 * 
 * Hybrid approach combining legacy and new APIs:
 * 1. Resolve short links (if needed)
 * 2. Extract place name and coordinates from URL
 * 3. Search using Text Search API (legacy) with location bias (500m radius)
 * 4. Fetch complete details via Places API (New) v1 with AI summaries
 * 
 * The combination of place name + coordinate bias ensures we get the right place
 * even for generic names like "The Grand Palace" - the coordinates provide
 * geographic context to disambiguate.
 * 
 * Supports all Google Maps URL formats:
 * - Short links: https://maps.app.goo.gl/xxx (auto-resolved)
 * - Full URLs: /place/Name/@lat,lng,zoom/data=...
 * - Works from mobile or desktop share buttons
 * 
 * API Details:
 * - Text Search: Legacy API (cheaper, good for finding places)
 * - Place Details: New v1 API (supports AI summaries via generativeSummary)
 * - Cost: Enterprise + Atmosphere SKU for generativeSummary field
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
    
    // Step 6: Fetch full place details using Places API (New) v1
    // This API supports generativeSummary (AI-generated descriptions)
    const placeDetailsUrl = `https://places.googleapis.com/v1/places/${placeId}?languageCode=en`;
    
    // Field mask for fields we want to retrieve
    const fieldMask = [
      'id',
      'displayName',
      'formattedAddress',
      'addressComponents',
      'location',
      'plusCode',
      'editorialSummary',
      'generativeSummary',  // AI-generated summary from Gemini
      'photos'
    ].join(',');
    
    const detailsResponse = await fetch(placeDetailsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask
      }
    });
    
    if (!detailsResponse.ok) {
      const errorData = await detailsResponse.json().catch(() => ({}));
      console.error('Places API v1 error:', errorData);
      return NextResponse.json(
        { error: `Could not fetch place details: ${detailsResponse.status}` },
        { status: 400 }
      );
    }
    
    const place = await detailsResponse.json();
    
    // Step 7: Extract city from address_components (type: "locality")
    // Note: v1 API uses 'addressComponents' (camelCase) and 'longText' instead of 'long_name'
    let city: string | undefined;
    if (place.addressComponents && Array.isArray(place.addressComponents)) {
      const cityComponent = place.addressComponents.find((component: any) =>
        component.types && Array.isArray(component.types) && component.types.includes('locality')
      );
      if (cityComponent) {
        city = cityComponent.longText;
      }
    }
    
    // Step 8: Extract descriptions, AI summary, and photo URL
    let description: string | undefined;
    let generativeSummary: string | undefined;
    let photoUrl: string | undefined;
    
    // Editorial summary (human-written)
    if (place.editorialSummary?.text) {
      description = place.editorialSummary.text;
    }
    
    // Generative summary (AI-generated by Gemini)
    if (place.generativeSummary?.overview?.text) {
      generativeSummary = place.generativeSummary.overview.text;
    }
    
    // Photo URL (v1 API format)
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      // Store just the photo name (not the full URL with API key)
      // The client will generate the full URL with the API key on-demand
      photoUrl = photoName;
    }
    
    // Step 9: Return normalized data
    // Note: v1 API uses 'displayName' instead of 'name', 'formattedAddress' instead of 'formatted_address'
    return NextResponse.json({
      name: place.displayName?.text || '',
      address: place.formattedAddress || '',
      plusCode: place.plusCode?.globalCode,
      city: city,
      placeId: place.id,
      location: place.location ? {
        lat: place.location.latitude,
        lng: place.location.longitude
      } : undefined,
      description: description,
      generativeSummary: generativeSummary,
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
