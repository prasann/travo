/**
 * Activity Detail Page
 * Feature: Enhanced Activity View with Inline Note Editing
 * 
 * Displays full activity details including:
 * - Name, description, AI summary
 * - Location details (address, coordinates, Plus Code)
 * - Inline editable notes (double-click/tap to edit)
 * - Photo if available
 */

'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, ExternalLink, ArrowLeft, Sparkles } from 'lucide-react';
import { getGoogleMapsUrl } from '@/lib/mapsUtils';
import { formatDateLong } from '@/lib/dateTime';
import { getActivityById, updateActivity } from '@/lib/db';
import type { DailyActivity } from '@/types';

interface ActivityDetailPageProps {
  params: Promise<{
    tripId: string;
    activityId: string;
  }>;
}

export default function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { tripId, activityId } = use(params);
  const router = useRouter();
  const [activity, setActivity] = useState<DailyActivity | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load activity data
  useState(() => {
    loadActivity();
  });

  async function loadActivity() {
    setIsLoading(true);
    try {
      const result = await getActivityById(activityId);
      
      if (result.isOk()) {
        const activityData = result.value;
        setActivity(activityData);
        setNotes(activityData.notes || '');
      } else {
        console.error('Failed to load activity:', result.error);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveNotes() {
    if (!activity || isSaving) return;
    
    setIsSaving(true);
    try {
      const result = await updateActivity(activity.id, {
        notes: notes.trim() || undefined
      });

      if (result.isOk()) {
        setActivity({ ...activity, notes: notes.trim() || undefined });
        setIsEditingNotes(false);
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

  function handleNotesDoubleClick() {
    setIsEditingNotes(true);
  }

  function handleNotesBlur() {
    saveNotes();
  }

  function handleNotesKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Save on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      saveNotes();
    }
    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      setNotes(activity?.notes || '');
      setIsEditingNotes(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-base-content mb-4">Activity Not Found</h1>
          <Link href={`/trip/${tripId}`} className="btn btn-primary">
            Back to Trip
          </Link>
        </div>
      </div>
    );
  }

  const mapsUrl = getGoogleMapsUrl(activity);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="bg-base-200 border-b border-base-300">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="btn btn-ghost btn-sm gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title with Maps Link */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-3xl sm:text-4xl font-bold text-base-content">
              {activity.name}
            </h1>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm gap-2"
              >
                <MapPin className="w-4 h-4" />
                Open in Maps
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-base-content/60">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDateLong(activity.date)}</span>
          </div>
        </div>

        {/* AI Summary */}
        {activity.generative_summary && (
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 mb-6">
            <div className="card-body">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="card-title text-lg">AI Summary</h2>
              </div>
              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
                {activity.generative_summary}
              </p>
              <p className="text-xs text-base-content/50 mt-2 italic">
                Summarized with Gemini
              </p>
            </div>
          </div>
        )}

        {/* Description */}
        {activity.description && (
          <div className="card bg-base-200 mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">About</h2>
              <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
                {activity.description}
              </p>
            </div>
          </div>
        )}

        {/* Location Details */}
        {(activity.address || activity.city || activity.latitude || activity.plus_code) && (
          <div className="card bg-base-200 mb-6">
            <div className="card-body">
              <h2 className="card-title text-lg mb-3">Location</h2>
              
              {activity.city && (
                <div className="mb-2">
                  <span className="font-semibold text-sm">City:</span>
                  <span className="text-sm text-base-content/80 ml-2">{activity.city}</span>
                </div>
              )}
              
              {activity.address && (
                <div className="mb-2">
                  <span className="font-semibold text-sm">Address:</span>
                  <span className="text-sm text-base-content/80 ml-2">{activity.address}</span>
                </div>
              )}
              
              {activity.latitude && activity.longitude && (
                <div className="mb-2">
                  <span className="font-semibold text-sm">Coordinates:</span>
                  <span className="text-sm text-base-content/80 ml-2 font-mono">
                    {activity.latitude.toFixed(6)}, {activity.longitude.toFixed(6)}
                  </span>
                </div>
              )}
              
              {activity.plus_code && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-base-content/40" />
                  <span className="text-xs text-base-content/60 font-mono">
                    {activity.plus_code}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes (Inline Editable) */}
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title text-lg mb-2">
              Notes
              {!isEditingNotes && (
                <span className="text-xs text-base-content/50 font-normal ml-2">
                  (double-click to edit)
                </span>
              )}
            </h2>
            
            {isEditingNotes ? (
              <div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={handleNotesBlur}
                  onKeyDown={handleNotesKeyDown}
                  className="textarea textarea-bordered w-full min-h-32 text-sm"
                  placeholder="Add your personal notes here..."
                  autoFocus
                  disabled={isSaving}
                />
                <p className="text-xs text-base-content/50 mt-2">
                  Press <kbd className="kbd kbd-xs">⌘</kbd> + <kbd className="kbd kbd-xs">Enter</kbd> to save, <kbd className="kbd kbd-xs">Esc</kbd> to cancel
                </p>
                {isSaving && (
                  <p className="text-xs text-primary mt-2 flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </p>
                )}
              </div>
            ) : (
              <div
                onDoubleClick={handleNotesDoubleClick}
                className="min-h-24 p-3 rounded-lg border-2 border-dashed border-base-300 cursor-text hover:border-primary/50 transition-colors"
              >
                {notes ? (
                  <p className="text-sm text-base-content/80 whitespace-pre-wrap">
                    {notes}
                  </p>
                ) : (
                  <p className="text-sm text-base-content/40 italic">
                    No notes yet. Double-click to add your personal notes...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
