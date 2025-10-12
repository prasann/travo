/**
 * Sortable Attraction Item Component
 * 
 * Feature: 006-edit-mode-for (Phase 5 - US3)
 * Purpose: Individual sortable attraction item for drag-and-drop
 */

'use client';

import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import { Lock, ChevronUp, ChevronDown } from 'lucide-react';

interface AttractionItemProps {
  activity: ActivityEditFormData;
  index: number;
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  availableDates: string[];
}

export default function AttractionItem({
  activity,
  index,
  register,
  watch,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  availableDates
}: AttractionItemProps) {
  return (
    <div className="card bg-base-200">
      <div className="card-body p-4">
        <div className="flex gap-3 items-start">
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
            
            {/* Move to Day and Reorder Controls */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Move to Day</span>
                </label>
                <select
                  {...register(`activities.${index}.date`)}
                  className="select select-bordered select-sm"
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-sm">Reorder</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isFirst}
                    className="btn btn-sm btn-outline flex-1"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isLast}
                    className="btn btn-sm btn-outline flex-1"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Down
                  </button>
                </div>
              </div>
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
