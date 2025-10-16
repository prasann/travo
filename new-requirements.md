# New Requirements

## 1. Clickable Places with Google Maps Links

All places (activities, hotels, restaurants) in trip view should be clickable and open the location in Google Maps.

**Behavior:**

- User clicks on place name or address
- Opens Google Maps in new tab with exact location
- Works for activities, hotels, and recommended restaurants

## 2. Map View with Day-Colored Markers

Trip view should have a toggle between Timeline view and Map view.

**Map View Features:**

- Embedded interactive map showing all trip locations
- Each location displayed as a marker on the map
- Markers colored by day (matching timeline color scheme)
- Map auto-fits bounds to show all markers
- Clicking marker shows place name and details

**Data Requirements:**

To support both features, store the following for each place:

- Google Maps URL (for feature #1: clickable links)
- Latitude and longitude coordinates (for feature #2: map markers)
- Plus code (existing, as fallback)

**Scope:**

- Activities (attractions)
- Hotels
- Restaurants (shown on map with distinct styling)
 