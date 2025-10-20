/**
 * Restaurant Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Manage restaurant recommendations in edit mode with Plus Code lookup
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, RestaurantEditFormData } from '@/types/editMode';
import MapsLinkInput from './MapsLinkInput';
import { Lock } from 'lucide-react';

interface RestaurantSectionProps {
  register: UseFormRegister<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
}

export default function RestaurantSection({ register, setValue, watch }: RestaurantSectionProps) {
  const restaurants = watch('restaurants') || [];
  const [newRestaurant, setNewRestaurant] = useState<Partial<RestaurantEditFormData>>({});
  const [plusCode, setPlusCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handlePlusCodeSuccess = (result: { 
    name: string; 
    address: string;
    plusCode?: string;
    city?: string;
    placeId?: string;
    location?: {
      lat: number;
      lng: number;
    };
  }) => {
    setNewRestaurant(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      plus_code: result.plusCode || plusCode,
      city: result.city,
      google_maps_url: plusCode, // Store the original URL
      latitude: result.location?.lat,
      longitude: result.location?.lng,
    }));
  };
  
  const handlePlusCodeError = (error: string) => {
    console.error('Plus Code lookup error:', error);
  };
  
  const handleAddRestaurant = () => {
    if (!newRestaurant.name || !newRestaurant.address) {
      return;
    }
    
    const restaurant: RestaurantEditFormData = {
      id: undefined, // New restaurant - no ID yet
      name: newRestaurant.name,
      address: newRestaurant.address,
      plus_code: newRestaurant.plus_code,
      city: newRestaurant.city,
      cuisine_type: newRestaurant.cuisine_type,
      phone: newRestaurant.phone,
      website: newRestaurant.website,
      notes: newRestaurant.notes,
      google_maps_url: newRestaurant.google_maps_url,
      latitude: newRestaurant.latitude,
      longitude: newRestaurant.longitude,
    };
    
    setValue('restaurants', [...restaurants, restaurant]);
    
    // Reset form
    setNewRestaurant({});
    setPlusCode('');
    setShowAddForm(false);
  };
  
  const handleDeleteRestaurant = (index: number) => {
    const updatedRestaurants = [...restaurants];
    
    // If restaurant has an ID, mark as deleted; otherwise just remove from array
    if (updatedRestaurants[index].id) {
      updatedRestaurants[index]._deleted = true;
    } else {
      updatedRestaurants.splice(index, 1);
    }
    
    setValue('restaurants', updatedRestaurants);
  };
  
  // Filter out deleted restaurants for display
  const visibleRestaurants = restaurants.filter(r => !r._deleted);
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Restaurant Recommendations</h2>
        
        {/* Existing Restaurants */}
        {visibleRestaurants.length > 0 && (
          <div className="space-y-4 mb-6">
            {visibleRestaurants.map((restaurant, index) => (
              <div key={restaurant.id || index} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Read-only name and address with lock icon */}
                      <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-base-content/40 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content/70">{restaurant.name}</h3>
                          <p className="text-sm text-base-content/50">{restaurant.address}</p>
                          {restaurant.plus_code && (
                            <p className="text-xs text-base-content/40 mt-1">Plus Code: {restaurant.plus_code}</p>
                          )}
                          <p className="text-xs text-base-content/40 mt-1 italic">
                            To change name or address, delete and re-add with correct Plus Code
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRestaurant(index)}
                      className="btn btn-outline btn-error"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Editable fields */}
                  <div className="space-y-3 mt-4">
                    {/* Row 1: City and Cuisine Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">City</span>
                        </label>
                        <input
                          type="text"
                          {...register(`restaurants.${index}.city`)}
                          className="input input-bordered w-full"
                          placeholder="Bangkok"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">Cuisine Type</span>
                        </label>
                        <input
                          type="text"
                          {...register(`restaurants.${index}.cuisine_type`)}
                          className="input input-bordered w-full"
                          placeholder="Thai, Italian, etc."
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Phone and Website */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">Phone</span>
                        </label>
                        <input
                          type="tel"
                          {...register(`restaurants.${index}.phone`)}
                          className="input input-bordered w-full"
                          placeholder="+66 2 123 4567"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">Website</span>
                        </label>
                        <input
                          type="url"
                          {...register(`restaurants.${index}.website`)}
                          className="input input-bordered w-full"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-control w-full mt-3">
                    <label className="label">
                      <span className="label-text text-sm">Notes</span>
                      <span className="label-text-alt text-xs">
                        {(watch(`restaurants.${index}.notes`) || '').length}/2000
                      </span>
                    </label>
                    <textarea
                      {...register(`restaurants.${index}.notes`, {
                        maxLength: { value: 2000, message: 'Notes cannot exceed 2000 characters' }
                      })}
                      className="textarea textarea-bordered w-full"
                      rows={2}
                      placeholder="Restaurant notes, recommendations, must-try dishes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Restaurant */}
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary"
          >
            + Add Restaurant
          </button>
        )}
        
        {showAddForm && (
          <div className="card bg-base-200 mt-4">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Add New Restaurant</h3>
              
              {/* Maps Link Lookup */}
              <MapsLinkInput
                value={plusCode}
                onChange={setPlusCode}
                onLookupSuccess={handlePlusCodeSuccess}
                onLookupError={handlePlusCodeError}
                label="Google Maps Link or Plus Code"
              />
              
              {/* Show populated fields after lookup */}
              {newRestaurant.name && newRestaurant.address && (
                <>
                  <div className="alert alert-success mt-4">
                    <span>✓ Found: {newRestaurant.name}</span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {/* Row 1: City and Cuisine Type */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">City</span>
                        </label>
                        <input
                          type="text"
                          value={newRestaurant.city || ''}
                          onChange={(e) => setNewRestaurant(prev => ({ ...prev, city: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="Bangkok"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Cuisine Type</span>
                        </label>
                        <input
                          type="text"
                          value={newRestaurant.cuisine_type || ''}
                          onChange={(e) => setNewRestaurant(prev => ({ ...prev, cuisine_type: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="Thai, Italian, etc."
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Phone and Website */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Phone</span>
                        </label>
                        <input
                          type="tel"
                          value={newRestaurant.phone || ''}
                          onChange={(e) => setNewRestaurant(prev => ({ ...prev, phone: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="+66 2 123 4567"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Website</span>
                        </label>
                        <input
                          type="url"
                          value={newRestaurant.website || ''}
                          onChange={(e) => setNewRestaurant(prev => ({ ...prev, website: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-control w-full mt-4">
                    <label className="label">
                      <span className="label-text">Notes</span>
                      <span className="label-text-alt">
                        {(newRestaurant.notes || '').length}/2000
                      </span>
                    </label>
                    <textarea
                      value={newRestaurant.notes || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 2000) {
                          setNewRestaurant(prev => ({ ...prev, notes: value }));
                        }
                      }}
                      className="textarea textarea-bordered w-full"
                      rows={2}
                      placeholder="Restaurant notes, recommendations, must-try dishes..."
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleAddRestaurant}
                      className="btn btn-primary"
                    >
                      Add Restaurant
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewRestaurant({});
                        setPlusCode('');
                      }}
                      className="btn btn-ghost"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
