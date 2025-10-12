/**
 * Sortable Attraction Item Component
 * 
 * Feature: 006-edit-mode-for (Phase 5 - US3)
 * Purpose: Individual sortable attraction item for drag-and-drop
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UseFormRegister } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import { GripVertical } from 'lucide-react';

interface SortableAttractionItemProps {
  activity: ActivityEditFormData;
  index: number;
  register: UseFormRegister<TripEditFormData>;
  onDelete: () => void;
}

export default function SortableAttractionItem({
  activity,
  index,
  register,
  onDelete
}: SortableAttractionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: activity.id || `temp-${index}` });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card bg-base-200 ${isDragging ? 'shadow-2xl' : ''}`}
    >
      <div className="card-body p-4">
        <div className="flex gap-2 items-start">
          {/* Drag Handle */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square cursor-grab active:cursor-grabbing mt-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-base-content/60" />
          </button>
          
          {/* Content */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {/* Read-only name and address */}
                <h4 className="font-semibold">{activity.name}</h4>
                {activity.address && (
                  <p className="text-sm text-base-content/60">{activity.address}</p>
                )}
                {activity.plus_code && (
                  <p className="text-xs text-base-content/50 mt-1">Plus Code: {activity.plus_code}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onDelete}
                className="btn btn-error btn-xs"
              >
                Delete
              </button>
            </div>
            
            {/* Editable fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">City</span>
                </label>
                <input
                  type="text"
                  {...register(`activities.${index}.city`)}
                  className="input input-bordered input-sm"
                  placeholder="Tokyo"
                />
              </div>
              
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Start Time</span>
                </label>
                <input
                  type="time"
                  {...register(`activities.${index}.start_time`)}
                  className="input input-bordered input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Duration (minutes)</span>
                </label>
                <input
                  type="number"
                  {...register(`activities.${index}.duration_minutes`, {
                    valueAsNumber: true
                  })}
                  className="input input-bordered input-sm"
                  placeholder="120"
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-control mt-3">
              <label className="label py-1">
                <span className="label-text text-sm">Notes</span>
              </label>
              <textarea
                {...register(`activities.${index}.notes`)}
                className="textarea textarea-bordered textarea-sm"
                rows={2}
                placeholder="Activity notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
