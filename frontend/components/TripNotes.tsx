/**
 * Trip Notes Component
 * 
 * Feature: Trip notes with inline editing
 * Pattern: Double-click/tap to edit (same as Activity notes)
 */

'use client';

import { useState } from 'react';
import { updateTrip } from '@/lib/db/operations/trips';
import type { Trip } from '@/lib/db/models';

interface TripNotesProps {
  trip: Trip;
  onUpdate: () => void;
}

export default function TripNotes({ trip, onUpdate }: TripNotesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(trip.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  async function saveNotes() {
    setIsSaving(true);
    try {
      const result = await updateTrip({
        id: trip.id,
        notes: notes.trim() || undefined
      });
      
      if (result.isOk()) {
        setIsEditing(false);
        onUpdate();
      } else {
        console.error('Failed to save notes:', result.error);
        alert('Failed to save notes. Please try again.');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDoubleClick() {
    setIsEditing(true);
  }

  function handleCancel() {
    setNotes(trip.notes || '');
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Edit Trip Notes</h2>
          <div className="form-control w-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered w-full h-96 font-mono text-sm"
              placeholder="Add notes about your trip here... (supports multiple lines)"
              autoFocus
            />
            <label className="label">
              <span className="label-text-alt">
                {notes.length} characters
              </span>
            </label>
          </div>
          <div className="card-actions justify-end mt-4">
            <button
              onClick={handleCancel}
              className="btn btn-ghost"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={saveNotes}
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                'Save Notes'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
          <h2 className="card-title">Trip Notes</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="btn btn-sm btn-ghost"
          >
            ✏️ Edit
          </button>
        </div>
        
        {trip.notes ? (
          <div
            onDoubleClick={handleDoubleClick}
            className="prose max-w-none cursor-pointer hover:bg-base-200 p-4 rounded-lg transition-colors"
            title="Double-click to edit"
          >
            <p className="whitespace-pre-wrap text-sm sm:text-base">{trip.notes}</p>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="text-center p-8 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary hover:bg-base-200 transition-colors"
          >
            <p className="text-base-content/60">
              No notes yet. Click here or double-click to add notes.
            </p>
          </div>
        )}
        
        <div className="mt-4 text-xs text-base-content/60">
          💡 Tip: Double-click the notes area to edit
        </div>
      </div>
    </div>
  );
}
