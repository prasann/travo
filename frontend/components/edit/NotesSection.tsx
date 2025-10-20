/**
 * Notes Section Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Trip-level notes editing
 */

'use client';

import { UseFormRegister } from 'react-hook-form';
import type { TripEditFormData } from '@/types/editMode';

interface NotesSectionProps {
  register: UseFormRegister<TripEditFormData>;
  notes: string | undefined;
}

const MAX_NOTES_LENGTH = 2000;

export default function NotesSection({ register, notes }: NotesSectionProps) {
  const currentLength = notes?.length || 0;
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Trip Notes</h2>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Add notes about your trip</span>
            <span className="label-text-alt">
              {currentLength} / {MAX_NOTES_LENGTH}
            </span>
          </label>
          <textarea
            {...register('notes', {
              maxLength: {
                value: MAX_NOTES_LENGTH,
                message: `Notes must be less than ${MAX_NOTES_LENGTH} characters`
              }
            })}
            className="textarea textarea-bordered w-full h-48"
            placeholder="Add any notes about your trip here..."
          />
        </div>
      </div>
    </div>
  );
}
