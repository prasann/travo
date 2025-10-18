/**
 * Sortable Activity Item Component
 * 
 * Feature: 006-edit-mode-for (Phase 5 - US3)
 * Purpose: Individual sortable activity item for drag-and-drop
 */

'use client';

import { useState } from 'react';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData, ActivityEditFormData } from '@/types/editMode';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ActivityItemProps {
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

export default function ActivityItem({
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
}: ActivityItemProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  const notes = watch(`activities.${index}.notes`) || '';
  
  return (
    <div className="card bg-base-200">
      <div className="card-body p-3">
        {/* Main Row: Chevrons + Name + Delete */}
        <div className="flex items-center gap-2">
          {/* Up/Down Chevrons */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={isFirst}
              className="btn btn-xs btn-ghost p-0 h-5 min-h-0"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={isLast}
              className="btn btn-xs btn-ghost p-0 h-5 min-h-0"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          {/* Name */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{activity.name}</h4>
          </div>
          
          {/* Delete Icon */}
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-xs btn-ghost text-error p-1"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        {/* Second Row: Move to Day dropdown */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-base-content/60 w-16">Move to:</span>
          <select
            {...register(`activities.${index}.date`)}
            className="select select-bordered select-xs flex-1"
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        
        {/* Notes Accordion */}
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setNotesOpen(!notesOpen)}
            className="flex items-center justify-between w-full text-xs text-base-content/60 hover:text-base-content transition-colors"
          >
            <span>
              {notes ? `Notes (${notes.length}/2000)` : 'Add notes...'}
            </span>
            <ChevronDown className={`w-3 h-3 transition-transform ${notesOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {notesOpen && (
            <div className="mt-2">
              <textarea
                {...register(`activities.${index}.notes`, {
                  maxLength: { value: 2000, message: 'Notes cannot exceed 2000 characters' }
                })}
                className="textarea textarea-bordered textarea-xs w-full"
                rows={3}
                placeholder="Activity notes..."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
