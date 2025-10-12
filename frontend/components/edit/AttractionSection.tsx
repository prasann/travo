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
  DragEndEvent,
  DragStartEvent,
  DragOverlay
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
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Setup sensors for drag-and-drop with activation constraints
  // This prevents conflicts with scrolling and clicking
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms hold before drag starts
        tolerance: 5, // 5px of movement tolerance
      },
    })
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
  
  const handleDragStart = (event: DragStartEvent) => {
    console.log('🎯 Drag started:', event.active.id);
    setActiveId(event.active.id as string);
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
  
  const handleMoveUp = (globalIndex: number, date: string) => {
    // Get activities for this date
    const dateActivitiesWithIndices = activities
      .map((a, idx) => ({ activity: a, globalIndex: idx }))
      .filter(item => item.activity.date === date && !item.activity._deleted);
    
    const currentLocalIndex = dateActivitiesWithIndices.findIndex(item => item.globalIndex === globalIndex);
    
    // Can't move up if already first
    if (currentLocalIndex <= 0) return;
    
    // Swap with previous item
    const reordered = [...dateActivitiesWithIndices];
    [reordered[currentLocalIndex - 1], reordered[currentLocalIndex]] = 
      [reordered[currentLocalIndex], reordered[currentLocalIndex - 1]];
    
    // Update order_index
    const updatedActivities = [...activities];
    reordered.forEach((item, newIdx) => {
      updatedActivities[item.globalIndex] = {
        ...updatedActivities[item.globalIndex],
        order_index: newIdx
      };
    });
    
    setValue('activities', updatedActivities, { shouldDirty: true });
  };
  
  const handleMoveDown = (globalIndex: number, date: string) => {
    // Get activities for this date
    const dateActivitiesWithIndices = activities
      .map((a, idx) => ({ activity: a, globalIndex: idx }))
      .filter(item => item.activity.date === date && !item.activity._deleted);
    
    const currentLocalIndex = dateActivitiesWithIndices.findIndex(item => item.globalIndex === globalIndex);
    
    // Can't move down if already last
    if (currentLocalIndex >= dateActivitiesWithIndices.length - 1) return;
    
    // Swap with next item
    const reordered = [...dateActivitiesWithIndices];
    [reordered[currentLocalIndex], reordered[currentLocalIndex + 1]] = 
      [reordered[currentLocalIndex + 1], reordered[currentLocalIndex]];
    
    // Update order_index
    const updatedActivities = [...activities];
    reordered.forEach((item, newIdx) => {
      updatedActivities[item.globalIndex] = {
        ...updatedActivities[item.globalIndex],
        order_index: newIdx
      };
    });
    
    setValue('activities', updatedActivities, { shouldDirty: true });
  };
  
  const handleDragEnd = (event: DragEndEvent, date: string) => {
    const { active, over } = event;
    
    console.log('🏁 Drag ended:', { activeId: active.id, overId: over?.id, date });
    
    setActiveId(null);
    
    if (!over || active.id === over.id) {
      console.log('❌ No valid drop target or dropped on self');
      return;
    }
    
    // Get all activities (including deleted) and find indices
    const activeGlobalIndex = activities.findIndex((a, idx) => {
      const itemId = a.id || `temp-${idx}`;
      return itemId === active.id;
    });
    const overGlobalIndex = activities.findIndex((a, idx) => {
      const itemId = a.id || `temp-${idx}`;
      return itemId === over.id;
    });
    
    if (activeGlobalIndex === -1 || overGlobalIndex === -1) {
      console.log('❌ Could not find activity indices:', { activeGlobalIndex, overGlobalIndex });
      return;
    }
    
    console.log('✅ Found activities:', { 
      activeGlobalIndex, 
      overGlobalIndex,
      activeActivity: activities[activeGlobalIndex]?.name,
      overActivity: activities[overGlobalIndex]?.name 
    });
    
    // Only reorder within the same date
    if (activities[activeGlobalIndex].date !== date || activities[overGlobalIndex].date !== date) {
      console.log('❌ Activities not in same date group');
      return;
    }
    
    // Get activities for this date only (with their global indices)
    const dateActivitiesWithIndices = activities
      .map((a, idx) => ({ activity: a, globalIndex: idx }))
      .filter(item => item.activity.date === date && !item.activity._deleted);
    
    const activeLocalIndex = dateActivitiesWithIndices.findIndex(item => item.globalIndex === activeGlobalIndex);
    const overLocalIndex = dateActivitiesWithIndices.findIndex(item => item.globalIndex === overGlobalIndex);
    
    // Reorder within date
    const reordered = arrayMove(dateActivitiesWithIndices, activeLocalIndex, overLocalIndex);
    
    // Create new activities array with updated order_index
    const updatedActivities = [...activities];
    reordered.forEach((item, newIdx) => {
      updatedActivities[item.globalIndex] = {
        ...updatedActivities[item.globalIndex],
        order_index: newIdx
      };
    });
    
    console.log('💾 Saving reordered activities');
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
                    onDragStart={handleDragStart}
                    onDragEnd={(event) => handleDragEnd(event, date)}
                  >
                    <SortableContext
                      items={items.map(({ activity, index }) => {
                        return activity.id || `temp-${index}`;
                      })}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {items.map(({ activity, index }, localIndex) => (
                          <SortableAttractionItem
                            key={activity.id || index}
                            activity={activity}
                            index={index}
                            register={register}
                            watch={watch}
                            onDelete={() => handleDeleteActivity(index)}
                            onMoveUp={() => handleMoveUp(index, date)}
                            onMoveDown={() => handleMoveDown(index, date)}
                            isFirst={localIndex === 0}
                            isLast={localIndex === items.length - 1}
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
