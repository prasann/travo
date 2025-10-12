/**
 * Sortable Attraction Item Component
 * 
 * Feature: 006-edit-mode-for (Phase 5 - US3)
 * Purpose: Individual sortable attraction item for drag-and-drop
 */

'use client';

import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import { Lock } from 'lucide-react';

interface AttractionItemProps {
  activity: ActivityEditFormData;
  index: number;
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  onDelete: () => void;
  availableDates: string[];
  maxPositionForDate: number;
}

export default function AttractionItem({
  activity,
  index,
  register,
  watch,
  onDelete,
  availableDates,
  maxPositionForDate
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
            
            {/* Move to Day and Position Controls */}
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
                  <span className="label-text text-sm">Position</span>
                </label>
                <input
                  type="number"
                  {...register(`activities.${index}.order_index`, {
                    valueAsNumber: true,
                    min: 0,
                    max: maxPositionForDate
                  })}
                  className="input input-bordered input-sm"
                  placeholder="0"
                  min="0"
                  max={maxPositionForDate}
                />
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
