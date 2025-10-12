/**
 * Hotel Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Manage hotels in edit mode with Plus Code lookup
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, HotelEditFormData } from '@/types/editMode';
import PlusCodeInput from './PlusCodeInput';
import { Lock } from 'lucide-react';

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
  
  const handlePlusCodeSuccess = (result: { name: string; address: string }) => {
    setNewHotel(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      plus_code: plusCode
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
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                  
                  {/* Editable fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">City</span>
                      </label>
                      <input
                        type="text"
                        {...register(`hotels.${index}.city`)}
                        className="input input-bordered input-sm"
                        placeholder="Tokyo"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirmation Number</span>
                      </label>
                      <input
                        type="text"
                        {...register(`hotels.${index}.confirmation_number`)}
                        className="input input-bordered input-sm"
                        placeholder="ABC123456"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Check-in</span>
                      </label>
                      <input
                        type="datetime-local"
                        {...register(`hotels.${index}.check_in_time`)}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Check-out</span>
                      </label>
                      <input
                        type="datetime-local"
                        {...register(`hotels.${index}.check_out_time`)}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        {...register(`hotels.${index}.phone`)}
                        className="input input-bordered input-sm"
                        placeholder="+81 3 1234 5678"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Notes</span>
                      <span className="label-text-alt">
                        {(watch(`hotels.${index}.notes`) || '').length}/2000
                      </span>
                    </label>
                    <textarea
                      {...register(`hotels.${index}.notes`, {
                        maxLength: { value: 2000, message: 'Notes cannot exceed 2000 characters' }
                      })}
                      className="textarea textarea-bordered"
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
              
              {/* Plus Code Lookup */}
              <PlusCodeInput
                value={plusCode}
                onChange={setPlusCode}
                onLookupSuccess={handlePlusCodeSuccess}
                onLookupError={handlePlusCodeError}
              />
              
              {/* Show populated fields after lookup */}
              {newHotel.name && newHotel.address && (
                <>
                  <div className="alert alert-success mt-4">
                    <span>✓ Found: {newHotel.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">City</span>
                      </label>
                      <input
                        type="text"
                        value={newHotel.city || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, city: e.target.value }))}
                        className="input input-bordered input-sm"
                        placeholder="Tokyo"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Confirmation Number</span>
                      </label>
                      <input
                        type="text"
                        value={newHotel.confirmation_number || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, confirmation_number: e.target.value }))}
                        className="input input-bordered input-sm"
                        placeholder="ABC123456"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Check-in</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={newHotel.check_in_time || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, check_in_time: e.target.value }))}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Check-out</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={newHotel.check_out_time || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, check_out_time: e.target.value }))}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Phone</span>
                      </label>
                      <input
                        type="tel"
                        value={newHotel.phone || ''}
                        onChange={(e) => setNewHotel(prev => ({ ...prev, phone: e.target.value }))}
                        className="input input-bordered input-sm"
                        placeholder="+81 3 1234 5678"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control mt-4">
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
                      className="textarea textarea-bordered"
                      rows={2}
                      placeholder="Hotel notes..."
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleAddHotel}
                      className="btn btn-primary btn-sm"
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
                      className="btn btn-ghost btn-sm"
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
