/**
 * Hotel Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Manage hotels in edit mode with Plus Code lookup
 * Updated: 2025-10-24 - Migrated to UTC + IANA timezone system
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, HotelEditFormData } from '@/types/editMode';
import MapsLinkInput from './MapsLinkInput';
import { Lock } from 'lucide-react';
import { 
  utcToLocal,
  localToUTC,
  COMMON_TIMEZONES,
  getDefaultTimezone
} from '@/lib/timezoneUtils';

interface HotelSectionProps {
  register: UseFormRegister<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
}

export default function HotelSection({ register, setValue, watch }: HotelSectionProps) {
  const hotels = watch('hotels') || [];
  const [newHotel, setNewHotel] = useState<Partial<HotelEditFormData>>({});
  const [plusCode, setPlusCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHotelCheckInTz, setNewHotelCheckInTz] = useState(getDefaultTimezone());
  const [newHotelCheckOutTz, setNewHotelCheckOutTz] = useState(getDefaultTimezone());
  
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
    setNewHotel(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      plus_code: result.plusCode || plusCode,
      google_maps_url: plusCode, // Store the original URL
      latitude: result.location?.lat,
      longitude: result.location?.lng,
    }));
  };
  
  const handlePlusCodeError = (error: string) => {
    console.error('Plus Code lookup error:', error);
  };
  
  const handleAddHotel = () => {
    if (!newHotel.name || !newHotel.address) {
      return;
    }
    
    const hotel: HotelEditFormData = {
      id: undefined, // New hotel - no ID yet
      name: newHotel.name,
      address: newHotel.address,
      plus_code: newHotel.plus_code,
      city: newHotel.city,
      check_in_time: newHotel.check_in_time,
      check_out_time: newHotel.check_out_time,
      confirmation_number: newHotel.confirmation_number,
      phone: newHotel.phone,
      notes: newHotel.notes,
      google_maps_url: newHotel.google_maps_url,
      latitude: newHotel.latitude,
      longitude: newHotel.longitude,
    };
    
    setValue('hotels', [...hotels, hotel]);
    
    // Reset form
    setNewHotel({});
    setPlusCode('');
    setShowAddForm(false);
  };
  
  const handleDeleteHotel = (index: number) => {
    const updatedHotels = [...hotels];
    
    // If hotel has an ID, mark as deleted; otherwise just remove from array
    if (updatedHotels[index].id) {
      updatedHotels[index]._deleted = true;
    } else {
      updatedHotels.splice(index, 1);
    }
    
    setValue('hotels', updatedHotels);
  };
  
  // Filter out deleted hotels for display
  const visibleHotels = hotels.filter(h => !h._deleted);
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Hotels</h2>
        
        {/* Existing Hotels */}
        {visibleHotels.length > 0 && (
          <div className="space-y-4 mb-6">
            {visibleHotels.map((hotel, index) => (
              <div key={hotel.id || index} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Read-only name and address with lock icon */}
                      <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-base-content/40 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content/70">{hotel.name}</h3>
                          <p className="text-sm text-base-content/50">{hotel.address}</p>
                          {hotel.plus_code && (
                            <p className="text-xs text-base-content/40 mt-1">Plus Code: {hotel.plus_code}</p>
                          )}
                          <p className="text-xs text-base-content/40 mt-1 italic">
                            To change name or address, delete and re-add with correct Plus Code
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteHotel(index)}
                      className="btn btn-outline btn-error"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Editable fields */}
                  <div className="space-y-3 mt-4">
                    {/* Row 1: City and Confirmation Number */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">City</span>
                        </label>
                        <input
                          type="text"
                          {...register(`hotels.${index}.city`)}
                          className="input input-bordered w-full"
                          placeholder="Tokyo"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text text-sm">Confirmation Number</span>
                        </label>
                        <input
                          type="text"
                          {...register(`hotels.${index}.confirmation_number`)}
                          className="input input-bordered w-full"
                          placeholder="ABC123456"
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Check-in and Check-out with Timezone */}
                    <div className="space-y-3">
                      {/* Check-in */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="form-control w-full lg:col-span-2">
                          <label className="label">
                            <span className="label-text text-sm">Check-in</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={utcToLocal(
                              watch(`hotels.${index}.check_in_time`),
                              watch(`hotels.${index}.check_in_timezone`) || getDefaultTimezone()
                            )}
                            className="input input-bordered w-full"
                            onChange={(e) => {
                              if (e.target.value) {
                                const timezone = watch(`hotels.${index}.check_in_timezone`) || getDefaultTimezone();
                                const utcValue = localToUTC(e.target.value, timezone);
                                setValue(`hotels.${index}.check_in_time`, utcValue);
                              } else {
                                setValue(`hotels.${index}.check_in_time`, undefined);
                              }
                            }}
                          />
                        </div>
                        
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm">Timezone</span>
                          </label>
                          <select
                            className="select select-bordered w-full text-sm"
                            value={watch(`hotels.${index}.check_in_timezone`) || getDefaultTimezone()}
                            onChange={(e) => {
                              const newTimezone = e.target.value;
                              setValue(`hotels.${index}.check_in_timezone`, newTimezone);
                            }}
                          >
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Check-out */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="form-control w-full lg:col-span-2">
                          <label className="label">
                            <span className="label-text text-sm">Check-out</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={utcToLocal(
                              watch(`hotels.${index}.check_out_time`),
                              watch(`hotels.${index}.check_out_timezone`) || getDefaultTimezone()
                            )}
                            className="input input-bordered w-full"
                            onChange={(e) => {
                              if (e.target.value) {
                                const timezone = watch(`hotels.${index}.check_out_timezone`) || getDefaultTimezone();
                                const utcValue = localToUTC(e.target.value, timezone);
                                setValue(`hotels.${index}.check_out_time`, utcValue);
                              } else {
                                setValue(`hotels.${index}.check_out_time`, undefined);
                              }
                            }}
                          />
                        </div>
                        
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text text-sm">Timezone</span>
                          </label>
                          <select
                            className="select select-bordered w-full text-sm"
                            value={watch(`hotels.${index}.check_out_timezone`) || getDefaultTimezone()}
                            onChange={(e) => {
                              const newTimezone = e.target.value;
                              setValue(`hotels.${index}.check_out_timezone`, newTimezone);
                            }}
                          >
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 3: Phone (full width) */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text text-sm">Phone</span>
                      </label>
                      <input
                        type="tel"
                        {...register(`hotels.${index}.phone`)}
                        className="input input-bordered w-full"
                        placeholder="+81 3 1234 5678"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control w-full mt-3">
                    <label className="label">
                      <span className="label-text text-sm">Notes</span>
                      <span className="label-text-alt text-xs">
                        {(watch(`hotels.${index}.notes`) || '').length}/2000
                      </span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.notes`, {
                        maxLength: { value: 2000, message: 'Notes cannot exceed 2000 characters' }
                      })}
                      className="textarea textarea-bordered w-full"
                      rows={2}
                      placeholder="Hotel notes..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add New Hotel */}
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary"
          >
            + Add Hotel
          </button>
        )}
        
        {showAddForm && (
          <div className="card bg-base-200 mt-4">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Add New Hotel</h3>
              
              {/* Maps Link Lookup */}
              <MapsLinkInput
                value={plusCode}
                onChange={setPlusCode}
                onLookupSuccess={handlePlusCodeSuccess}
                onLookupError={handlePlusCodeError}
                label="Google Maps Link or Plus Code"
              />
              
              {/* Show populated fields after lookup */}
              {newHotel.name && newHotel.address && (
                <>
                  <div className="alert alert-success mt-4">
                    <span>✓ Found: {newHotel.name}</span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    {/* Row 1: City and Confirmation Number */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">City</span>
                        </label>
                        <input
                          type="text"
                          value={newHotel.city || ''}
                          onChange={(e) => setNewHotel(prev => ({ ...prev, city: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="Tokyo"
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Confirmation Number</span>
                        </label>
                        <input
                          type="text"
                          value={newHotel.confirmation_number || ''}
                          onChange={(e) => setNewHotel(prev => ({ ...prev, confirmation_number: e.target.value }))}
                          className="input input-bordered w-full"
                          placeholder="ABC123456"
                        />
                      </div>
                    </div>
                    
                    {/* Row 2: Check-in and Check-out with Timezone */}
                    <div className="space-y-3">
                      {/* Check-in */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="form-control w-full lg:col-span-2">
                          <label className="label">
                            <span className="label-text">Check-in</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={utcToLocal(newHotel.check_in_time, newHotelCheckInTz)}
                            onChange={(e) => {
                              if (e.target.value) {
                                const utcValue = localToUTC(e.target.value, newHotelCheckInTz);
                                setNewHotel(prev => ({ ...prev, check_in_time: utcValue }));
                              } else {
                                setNewHotel(prev => ({ ...prev, check_in_time: undefined }));
                              }
                            }}
                            className="input input-bordered w-full"
                          />
                        </div>
                        
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text">Timezone</span>
                          </label>
                          <select
                            className="select select-bordered w-full text-sm"
                            value={newHotelCheckInTz}
                            onChange={(e) => {
                              setNewHotelCheckInTz(e.target.value);
                              setNewHotel(prev => ({ ...prev, check_in_timezone: e.target.value }));
                            }}
                          >
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      {/* Check-out */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                        <div className="form-control w-full lg:col-span-2">
                          <label className="label">
                            <span className="label-text">Check-out</span>
                          </label>
                          <input
                            type="datetime-local"
                            value={utcToLocal(newHotel.check_out_time, newHotelCheckOutTz)}
                            onChange={(e) => {
                              if (e.target.value) {
                                const utcValue = localToUTC(e.target.value, newHotelCheckOutTz);
                                setNewHotel(prev => ({ ...prev, check_out_time: utcValue }));
                              } else {
                                setNewHotel(prev => ({ ...prev, check_out_time: undefined }));
                              }
                            }}
                            className="input input-bordered w-full"
                          />
                        </div>
                        
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text">Timezone</span>
                          </label>
                          <select
                            className="select select-bordered w-full text-sm"
                            value={newHotelCheckOutTz}
                            onChange={(e) => {
                              setNewHotelCheckOutTz(e.target.value);
                              setNewHotel(prev => ({ ...prev, check_out_timezone: e.target.value }));
                            }}
                          >
                            {COMMON_TIMEZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Row 3: Phone (full width) */}
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        value={newHotel.phone || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, phone: e.target.value }))}
                        className="input input-bordered w-full"
                        placeholder="+81 3 1234 5678"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control w-full mt-4">
                    <label className="label">
                      <span className="label-text">Notes</span>
                      <span className="label-text-alt">
                        {(newHotel.notes || '').length}/2000
                      </span>
                    </label>
                    <textarea
                      value={newHotel.notes || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 2000) {
                          setNewHotel(prev => ({ ...prev, notes: value }));
                        }
                      }}
                      className="textarea textarea-bordered w-full"
                      rows={2}
                      placeholder="Hotel notes..."
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleAddHotel}
                      className="btn btn-primary"
                    >
                      Add Hotel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewHotel({});
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
