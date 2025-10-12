/**
 * Sortable Attraction Item Component
 * 
 * Feature: 006-edit-mode-for (Phase 5 - US3)
 * Purpose: Individual sortable attraction item for drag-and-drop
 */

'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import { GripVertical, Lock } from 'lucide-react';

interface SortableAttractionItemProps {
  activity: ActivityEditFormData;
  index: number;
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  onDelete: () => void;
}

export default function SortableAttractionItem({
  activity,
  index,
  register,
  watch,
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
                {/* Read-only name and address with lock icon */}
                <div className="flex items-start gap-2">
                  <Lock className="w-3 h-3 text-base-content/40 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-base-content/70">{activity.name}</h4>
                    {activity.address && (
                      <p className="text-xs text-base-content/50">{activity.address}</p>
                    )}
                    {activity.plus_code && (
                      <p className="text-xs text-base-content/40 mt-0.5">Plus Code: {activity.plus_code}</p>
                    )}
                    <p className="text-xs text-base-content/40 mt-0.5 italic">
                      To change name or address, delete and re-add with correct Plus Code
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onDelete}
                className="btn btn-error btn-xs"
              >
                Delete
              </button>
            </div>
            
            {/* Notes field */}
            <div className="form-control mt-3">
              <label className="label py-1">
                <span className="label-text text-sm">Notes</span>
                <span className="label-text-alt text-xs">
                  {(watch(`activities.${index}.notes`) || '').length}/2000
                </span>
              </label>
              <textarea
                {...register(`activities.${index}.notes`, {
                  maxLength: { value: 2000, message: 'Notes cannot exceed 2000 characters' }
                })}
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
