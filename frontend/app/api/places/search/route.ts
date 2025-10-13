import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Place Lookup from Google Maps Link
 * 
 * Simple approach:
 * 1. Extract place name from Google Maps URL
 * 2. Search using Google Places Text Search API
 * 3. Return first result with full details
 * 
 * User copies URL from Google Maps browser address bar.
 * Example: https://www.google.com/maps/place/Tokyo+Skytree/@35.71,139.77/...
 */
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
    
    console.log('Processing URL:', resolvedUrl);
    
    // Step 3: Extract place name from URL
    // Format: /place/Tokyo+Skytree/@coords or /place/Tokyo+Skytree/data=...
    const placeNameMatch = resolvedUrl.match(/\/place\/([^/@?#]+)/);
    
    if (!placeNameMatch) {
      return NextResponse.json(
        { error: 'Could not extract place name from URL. Please copy the full Google Maps URL from your browser address bar.' },
        { status: 400 }
      );
    }
    
    // Decode the place name (replace + with spaces, decode URI components)
    const encodedName = placeNameMatch[1];
    const placeName = decodeURIComponent(encodedName.replace(/\+/g, ' '));
    
    console.log('Searching for place:', placeName);
    
    // Step 4: Search using Google Places Text Search API
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(placeName)}&key=${apiKey}`;
    
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
    
    // Step 5: Extract data from first result
    const place = searchData.results[0];
    
    // Extract city from address_components (type: "locality")
    let city: string | undefined;
    if (place.address_components) {
      const cityComponent = place.address_components.find((component: any) =>
        component.types.includes('locality')
      );
      if (cityComponent) {
        city = cityComponent.long_name;
      }
    }
    
    console.log('Found place:', {
      name: place.name,
      city: city,
      placeId: place.place_id
    });
    
    // Step 6: Return normalized data
    return NextResponse.json({
      name: place.name,
      address: place.formatted_address,
      plusCode: place.plus_code?.global_code,
      city: city,
      placeId: place.place_id,
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    });
    
  } catch (error) {
    console.error('Place lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to process Google Maps link' },
      { status: 500 }
    );
  }
}
