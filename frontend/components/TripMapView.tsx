/**
 * TripMapView Component
 * 
 * Interactive map showing all trip locations with day-colored markers
 */

'use client';

import { useMemo, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import type { TripWithRelations } from '@/lib/db/models';
import { extractMapMarkers, getMarkerColor, calculateBounds, DAY_COLORS } from '@/lib/mapHelpers';

interface TripMapViewProps {
  trip: TripWithRelations;
}

export default function TripMapView({ trip }: TripMapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Extract markers from trip data
  const markers = useMemo(() => extractMapMarkers(trip), [trip]);
  
  // Calculate bounds to fit all markers
  const bounds = useMemo(() => calculateBounds(markers), [markers]);
  
  // Get selected marker details
  const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
  
  // Filter markers based on selected legend
  const filteredMarkers = useMemo(() => {
    if (!selectedFilter) return markers;
    
    if (selectedFilter === 'restaurants') {
      return markers.filter(m => m.type === 'restaurant');
    }
    
    // Day filter (e.g., "day-0", "day-1")
    const dayMatch = selectedFilter.match(/^day-(\d+)$/);
    if (dayMatch) {
      const dayNum = parseInt(dayMatch[1], 10);
      return markers.filter(m => m.dayNumber === dayNum);
    }
    
    return markers;
  }, [markers, selectedFilter]);
  
  // Default center (in case no markers)
  const defaultCenter = { lat: 35.6762, lng: 139.6503 }; // Tokyo
  
  // Calculate center from bounds or use first marker
  const center = useMemo(() => {
    if (markers.length === 0) return defaultCenter;
    if (markers.length === 1) return { lat: markers[0].lat, lng: markers[0].lng };
    
    if (bounds) {
      return {
        lat: (bounds.north + bounds.south) / 2,
        lng: (bounds.east + bounds.west) / 2,
      };
    }
    
    return defaultCenter;
  }, [markers, bounds]);
  
  if (!apiKey || apiKey === 'your_api_key_here') {
    return (
      <div className="alert alert-error">
        <span>Google Maps API key not configured</span>
      </div>
    );
  }
  
  if (markers.length === 0) {
    return (
      <div className="alert alert-info">
        <span>No locations with coordinates to display on map. Add places with location data to see them here.</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-3 items-center text-sm">
            <span className="font-semibold">Legend:</span>
            {DAY_COLORS.map((color, index) => {
              const dayMarkers = markers.filter(m => m.dayNumber === index);
              if (dayMarkers.length === 0) return null;
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedFilter(`day-${index}`)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer hover:bg-base-200 ${
                    selectedFilter === `day-${index}` ? 'bg-base-200 ring-2 ring-primary' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>Day {index + 1}</span>
                  <span className="text-xs opacity-60">({dayMarkers.length})</span>
                </button>
              );
            })}
            {markers.filter(m => m.type === 'restaurant').length > 0 && (
              <button
                onClick={() => setSelectedFilter('restaurants')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-all cursor-pointer hover:bg-base-200 ${
                  selectedFilter === 'restaurants' ? 'bg-base-200 ring-2 ring-primary' : ''
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#a855f7' }}
                />
                <span>Restaurants</span>
                <span className="text-xs opacity-60">
                  ({markers.filter(m => m.type === 'restaurant').length})
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Map */}
      <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
        <div style={{ height: '600px', width: '100%' }}>
          <APIProvider apiKey={apiKey}>
            <MapWithPanning
              center={center}
              markers={markers}
              filteredMarkers={filteredMarkers}
              selectedMarkerId={selectedMarkerId}
              setSelectedMarkerId={setSelectedMarkerId}
              selectedFilter={selectedFilter}
            />
          </APIProvider>
        </div>
      </div>
    </div>
  );
}

interface MapWithPanningProps {
  center: { lat: number; lng: number };
  markers: ReturnType<typeof extractMapMarkers>;
  filteredMarkers: ReturnType<typeof extractMapMarkers>;
  selectedMarkerId: string | null;
  setSelectedMarkerId: (id: string | null) => void;
  selectedFilter: string | null;
}

function MapWithPanning({
  center,
  markers,
  filteredMarkers,
  selectedMarkerId,
  setSelectedMarkerId,
  selectedFilter,
}: MapWithPanningProps) {
  const map = useMap();
  
  // Pan to filtered markers when filter changes
  useMemo(() => {
    if (!map || !selectedFilter) return;
    
    if (filteredMarkers.length === 0) return;
    
    if (filteredMarkers.length === 1) {
      // Single marker: center and zoom in
      map.panTo({ lat: filteredMarkers[0].lat, lng: filteredMarkers[0].lng });
      map.setZoom(14);
    } else {
      // Multiple markers: fit bounds
      const bounds = new google.maps.LatLngBounds();
      filteredMarkers.forEach(marker => {
        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [map, filteredMarkers, selectedFilter]);
  
  const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
  
  return (
    <Map
      mapId="trip-map"
      defaultCenter={center}
      defaultZoom={markers.length === 1 ? 14 : 10}
      gestureHandling="greedy"
      disableDefaultUI={false}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Render markers */}
      {markers.map((marker) => {
                const color = getMarkerColor(marker);
                
                return (
                  <AdvancedMarker
                    key={marker.id}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => setSelectedMarkerId(marker.id)}
                  >
                    {/* Custom marker icon */}
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: color,
                        border: '3px solid white',
                        borderRadius: '50% 50% 50% 0',
                        transform: 'rotate(-45deg)',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: 'rotate(45deg)',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                      >
                        {marker.type === 'activity' && '📍'}
                        {marker.type === 'hotel' && '🏨'}
                        {marker.type === 'restaurant' && '🍽️'}
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}
      
      {/* Info window for selected marker */}
      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarkerId(null)}
        >
          <div className="p-2" style={{ maxWidth: '250px' }}>
            <h3 className="font-bold text-sm mb-1">{selectedMarker.name}</h3>
            
            {selectedMarker.type === 'activity' && selectedMarker.date && (
              <p className="text-xs text-gray-600 mb-1">
                📅 {new Date(selectedMarker.date).toLocaleDateString()}
                {selectedMarker.dayNumber !== undefined && ` (Day ${selectedMarker.dayNumber + 1})`}
              </p>
            )}
            
            {selectedMarker.type === 'hotel' && selectedMarker.date && (
              <p className="text-xs text-gray-600 mb-1">
                🏨 Check-in: {new Date(selectedMarker.date).toLocaleDateString()}
              </p>
            )}
            
            {selectedMarker.address && (
              <p className="text-xs text-gray-500 mb-1">
                📍 {selectedMarker.address}
              </p>
            )}
            
            {selectedMarker.city && (
              <p className="text-xs text-gray-500 mb-1">
                🌆 {selectedMarker.city}
              </p>
            )}
            
            {selectedMarker.notes && (
              <p className="text-xs text-gray-600 mt-2 italic">
                {selectedMarker.notes}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
    </Map>
  );
}
