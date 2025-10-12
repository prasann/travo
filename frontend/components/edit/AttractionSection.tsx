/**
 * Attraction Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Manage attractions in edit mode with Plus Code lookup
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import PlusCodeInput from './PlusCodeInput';
import SortableAttractionItem from './SortableAttractionItem';

interface AttractionSectionProps {
  register: UseFormRegister<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  tripStartDate: string;
  tripEndDate: string;
}

export default function AttractionSection({ 
  register, 
  setValue, 
  watch,
  tripStartDate,
  tripEndDate 
}: AttractionSectionProps) {
  const activities = watch('activities') || [];
  const [newActivity, setNewActivity] = useState<Partial<ActivityEditFormData>>({});
  const [plusCode, setPlusCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Setup sensors for drag-and-drop (both mouse and touch)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  );
  
  const handlePlusCodeSuccess = (result: { name: string; address: string }) => {
    setNewActivity(prev => ({
      ...prev,
      name: result.name,
      address: result.address,
      plus_code: plusCode
    }));
  };
  
  const handlePlusCodeError = (error: string) => {
    console.error('Plus Code lookup error:', error);
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
      start_time: newActivity.start_time,
      duration_minutes: newActivity.duration_minutes,
      order_index: nextOrderIndex,
      notes: newActivity.notes,
    };
    
    setValue('activities', [...activities, activity]);
    
    // Reset form
    setNewActivity({});
    setPlusCode('');
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
  
  const handleDragEnd = (event: DragEndEvent, date: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    // Get activities for this specific date
    const dateActivities = visibleActivities.filter(a => a.date === date);
    const activeIndex = dateActivities.findIndex(a => (a.id || `temp-${activities.indexOf(a)}`) === active.id);
    const overIndex = dateActivities.findIndex(a => (a.id || `temp-${activities.indexOf(a)}`) === over.id);
    
    if (activeIndex === -1 || overIndex === -1) {
      return;
    }
    
    // Reorder the activities for this date
    const reorderedDateActivities = arrayMove(dateActivities, activeIndex, overIndex);
    
    // Recalculate order_index to be sequential
    reorderedDateActivities.forEach((activity, idx) => {
      activity.order_index = idx;
    });
    
    // Update the full activities array
    const updatedActivities = activities.map(activity => {
      if (activity.date === date && !activity._deleted) {
        const reordered = reorderedDateActivities.find(a => 
          (a.id && a.id === activity.id) || (a.name === activity.name && a.plus_code === activity.plus_code)
        );
        return reordered || activity;
      }
      return activity;
    });
    
    setValue('activities', updatedActivities, { shouldDirty: true });
  };
  
  // Filter out deleted activities for display
  const visibleActivities = activities.filter(a => !a._deleted);
  
  // Group activities by date
  const activitiesByDate = visibleActivities.reduce((acc, activity, index) => {
    const date = activity.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({ activity, index });
    return acc;
  }, {} as Record<string, Array<{ activity: ActivityEditFormData; index: number }>>);
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Attractions</h2>
        
        {/* Existing Activities */}
        {Object.keys(activitiesByDate).length > 0 && (
          <div className="space-y-6 mb-6">
            {Object.entries(activitiesByDate)
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, items]) => (
                <div key={date}>
                  <h3 className="font-semibold text-lg mb-3">{date}</h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, date)}
                  >
                    <SortableContext
                      items={items.map(({ activity, index }) => activity.id || `temp-${index}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {items.map(({ activity, index }) => (
                          <SortableAttractionItem
                            key={activity.id || index}
                            activity={activity}
                            index={index}
                            register={register}
                            watch={watch}
                            onDelete={() => handleDeleteActivity(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              ))}
          </div>
        )}
        
        {/* Add New Activity */}
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline btn-primary"
          >
            + Add Attraction
          </button>
        )}
        
        {showAddForm && (
          <div className="card bg-base-200 mt-4">
            <div className="card-body">
              <h3 className="font-semibold mb-4">Add New Attraction</h3>
              
              {/* Plus Code Lookup */}
              <PlusCodeInput
                value={plusCode}
                onChange={setPlusCode}
                onLookupSuccess={handlePlusCodeSuccess}
                onLookupError={handlePlusCodeError}
              />
              
              {/* Show populated fields after lookup */}
              {newActivity.name && (
                <>
                  <div className="alert alert-success mt-4">
                    <span>✓ Found: {newActivity.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Date *</span>
                      </label>
                      <input
                        type="date"
                        value={newActivity.date || ''}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, date: e.target.value }))}
                        className="input input-bordered input-sm"
                        min={tripStartDate}
                        max={tripEndDate}
                        required
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">City</span>
                      </label>
                      <input
                        type="text"
                        value={newActivity.city || ''}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, city: e.target.value }))}
                        className="input input-bordered input-sm"
                        placeholder="Tokyo"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Start Time</span>
                      </label>
                      <input
                        type="time"
                        value={newActivity.start_time || ''}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, start_time: e.target.value }))}
                        className="input input-bordered input-sm"
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Duration (minutes)</span>
                      </label>
                      <input
                        type="number"
                        value={newActivity.duration_minutes || ''}
                        onChange={(e) => setNewActivity(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || undefined }))}
                        className="input input-bordered input-sm"
                        placeholder="120"
                        min="0"
                      />
                    </div>
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
                      className="btn btn-primary btn-sm"
                      disabled={!newActivity.date}
                    >
                      Add Attraction
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setNewActivity({});
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
