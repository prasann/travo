/**
 * Activity Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Manage activities in edit mode with Plus Code lookup
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import MapsLinkInput from './MapsLinkInput';
import ActivityItem from './SortableActivityItem';

interface ActivitySectionProps {
  register: UseFormRegister<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  tripStartDate: string;
  tripEndDate: string;
}

export default function ActivitySection({ 
  register, 
  setValue, 
  watch,
  tripStartDate,
  tripEndDate 
}: ActivitySectionProps) {
  const activities = watch('activities') || [];
  const [newActivity, setNewActivity] = useState<Partial<ActivityEditFormData>>({});
  const [mapsUrl, setMapsUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Get all unique dates from trip range
  const getAllDates = (): string[] => {
    const dates: string[] = [];
    const start = new Date(tripStartDate);
    const end = new Date(tripEndDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    return dates;
  };
  
  const availableDates = getAllDates();
  
  const handleMapsLinkSuccess = (result: { 
    name: string; 
    address: string;
    plusCode?: string;
    city?: string;
    placeId?: string;
    location?: {
      lat: number;
      lng: number;
    };
    description?: string;
    photoUrl?: string;
  }) => {
    setNewActivity(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      plus_code: result.plusCode,
      city: result.city,
      google_maps_url: mapsUrl, // Store the original URL
      latitude: result.location?.lat,
      longitude: result.location?.lng,
      description: result.description,
      image_url: result.photoUrl,
    }));
  };
  
  const handleMapsLinkError = (error: string) => {
    console.error('Maps link lookup error:', error);
  };
  
  const handleAddActivity = () => {
    if (!newActivity.name || !newActivity.date) {
      return;
    }
    
    // Get the next order_index for the same date
    const sameDateActivities = activities.filter(a => a.date === newActivity.date);
    const nextOrderIndex = sameDateActivities.length > 0
      ? Math.max(...sameDateActivities.map(a => a.order_index)) + 1
      : 0;
    
    const activity: ActivityEditFormData = {
      id: undefined, // New activity - no ID yet
      name: newActivity.name,
      address: newActivity.address,
      plus_code: newActivity.plus_code,
      city: newActivity.city,
      date: newActivity.date,
      order_index: nextOrderIndex,
      notes: newActivity.notes,
      google_maps_url: newActivity.google_maps_url,
      latitude: newActivity.latitude,
      longitude: newActivity.longitude,
      description: newActivity.description,
      image_url: newActivity.image_url,
    };
    
    setValue('activities', [...activities, activity]);
    
    // Reset form
    setNewActivity({});
    setMapsUrl('');
    setShowAddForm(false);
  };
  
  const handleDeleteActivity = (index: number) => {
    const updatedActivities = [...activities];
    
    // If activity has an ID, mark as deleted; otherwise just remove from array
    if (updatedActivities[index].id) {
      updatedActivities[index]._deleted = true;
    } else {
      updatedActivities.splice(index, 1);
    }
    
    setValue('activities', updatedActivities);
  };
  
  const handleMoveUp = (actualIndex: number, positionInDate: number, dateItems: Array<{ activity: ActivityEditFormData; actualIndex: number }>) => {
    if (positionInDate === 0) return; // Already at top
    
    const updatedActivities = [...activities];
    const currentIdx = actualIndex;
    const prevIdx = dateItems[positionInDate - 1].actualIndex;
    
    // Swap order_index values
    const tempOrder = updatedActivities[currentIdx].order_index;
    updatedActivities[currentIdx].order_index = updatedActivities[prevIdx].order_index;
    updatedActivities[prevIdx].order_index = tempOrder;
    
    setValue('activities', updatedActivities);
  };
  
  const handleMoveDown = (actualIndex: number, positionInDate: number, dateItems: Array<{ activity: ActivityEditFormData; actualIndex: number }>) => {
    if (positionInDate === dateItems.length - 1) return; // Already at bottom
    
    const updatedActivities = [...activities];
    const currentIdx = actualIndex;
    const nextIdx = dateItems[positionInDate + 1].actualIndex;
    
    // Swap order_index values
    const tempOrder = updatedActivities[currentIdx].order_index;
    updatedActivities[currentIdx].order_index = updatedActivities[nextIdx].order_index;
    updatedActivities[nextIdx].order_index = tempOrder;
    
    setValue('activities', updatedActivities);
  };
  
  // Filter out deleted activities for display
  const visibleActivities = activities.filter(a => !a._deleted);
  
  // Group activities by date with ACTUAL indices from full activities array
  const activitiesByDate = activities.reduce((acc, activity, actualIndex) => {
    if (activity._deleted) return acc;
    
    const date = activity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ activity, actualIndex });
    return acc;
  }, {} as Record<string, Array<{ activity: ActivityEditFormData; actualIndex: number }>>);
  
  // Sort items within each date by order_index
  Object.values(activitiesByDate).forEach(items => {
    items.sort((a, b) => a.activity.order_index - b.activity.order_index);
  });
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Activities</h2>
        
        {/* Existing Activities */}
        {Object.keys(activitiesByDate).length > 0 && (
          <div className="space-y-6 mb-6">
            {Object.entries(activitiesByDate)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, items]) => {
                return (
                  <div key={date}>
                    <h3 className="font-semibold text-lg mb-3">{date}</h3>
                    <div className="space-y-3">
                      {items.map(({ activity, actualIndex }, positionInDate) => (
                        <ActivityItem
                          key={activity.id || actualIndex}
                          activity={activity}
                          index={actualIndex}
                          register={register}
                          watch={watch}
                          onDelete={() => handleDeleteActivity(actualIndex)}
                          onMoveUp={() => handleMoveUp(actualIndex, positionInDate, items)}
                          onMoveDown={() => handleMoveDown(actualIndex, positionInDate, items)}
                          isFirst={positionInDate === 0}
                          isLast={positionInDate === items.length - 1}
                          availableDates={availableDates}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
        
        {/* Add New Activity */}
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary"
          >
            + Add Activity
          </button>
        )}
        
        {showAddForm && (
          <div className="card bg-base-200 mt-4">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Add New Activity</h3>
              
              {/* Google Maps Link Lookup */}
              <MapsLinkInput
                value={mapsUrl}
                onChange={setMapsUrl}
                onLookupSuccess={handleMapsLinkSuccess}
                onLookupError={handleMapsLinkError}
              />
              
              {/* Show populated fields after lookup */}
              {newActivity.name && (
                <>
                  <div className="alert alert-success mt-4">
                    <span>✓ Found: {newActivity.name}</span>
                    {newActivity.city && <span className="text-xs opacity-70"> in {newActivity.city}</span>}
                  </div>
                  
                  {/* Show description if available */}
                  {newActivity.description && (
                    <div className="alert alert-info mt-2">
                      <div className="text-xs">
                        <p className="font-semibold mb-1">Description:</p>
                        <p className="text-base-content/80">{newActivity.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show photo if available */}
                  {newActivity.image_url && (
                    <div className="mt-4">
                      <img 
                        src={newActivity.image_url} 
                        alt={newActivity.name}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          // Hide image if it fails to load
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Date *</span>
                    </label>
                    <input
                      type="date"
                      value={newActivity.date || ''}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                      className="input input-bordered"
                      min={tripStartDate}
                      max={tripEndDate}
                      required
                    />
                  </div>
                  
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Notes</span>
                    </label>
                    <textarea
                      value={newActivity.notes || ''}
                      onChange={(e) => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                      className="textarea textarea-bordered"
                      rows={2}
                      placeholder="Activity notes..."
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="btn btn-primary"
                      disabled={!newActivity.date}
                    >
                      Add Activity
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewActivity({});
                        setMapsUrl('');
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
