/**
 * QuickAddModal - Modal for quickly adding activities or restaurants
 * 
 * Feature: Quick Add from Timeline
 * Purpose: Simple form to add activity/restaurant with minimal friction
 */

'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MapsLinkInput from './edit/MapsLinkInput';
import { createActivity } from '@/lib/db/operations/activities';
import { createRestaurant } from '@/lib/db/operations/restaurants';
import { isOk, unwrapErr } from '@/lib/db/resultHelpers';
import type { Trip } from '@/types';

interface QuickAddModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ItemType = 'activity' | 'restaurant';

export default function QuickAddModal({ trip, isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const [itemType, setItemType] = useState<ItemType>('activity');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [placeData, setPlaceData] = useState<{
    name: string;
    address: string;
    plusCode?: string;
    city?: string;
    placeId?: string;
    location?: { lat: number; lng: number };
    description?: string;
    generativeSummary?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Generate trip dates for dropdown
  const getTripDates = () => {
    const dates: Array<{ date: string; label: string }> = [];
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    
    let dayNumber = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dateObj = new Date(dateStr);
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      dates.push({
        date: dateStr,
        label: `Day ${dayNumber} - ${formattedDate}`
      });
      dayNumber++;
    }
    
    return dates;
  };

  const tripDates = getTripDates();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItemType('activity');
      setSelectedDate('');
      setMapsUrl('');
      setPlaceData(null);
      setError('');
    }
  }, [isOpen]);

  const handleMapsLinkSuccess = (result: {
    name: string;
    address: string;
    plusCode?: string;
    city?: string;
    placeId?: string;
    location?: { lat: number; lng: number };
    description?: string;
    generativeSummary?: string;
    photoUrl?: string;
  }) => {
    setPlaceData(result);
    setError('');
  };

  const handleMapsLinkError = (errorMsg: string) => {
    setPlaceData(null);
    setError(errorMsg);
  };

  const handleSubmit = async () => {
    if (!placeData) {
      setError('Please provide a valid Google Maps link');
      return;
    }

    if (itemType === 'activity' && !selectedDate) {
      setError('Please select a date for the activity');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (itemType === 'activity') {
        // Get existing activities for the date to determine order_index
        const existingActivities = trip.activities?.filter(a => a.date === selectedDate) || [];
        const nextOrderIndex = existingActivities.length > 0
          ? Math.max(...existingActivities.map(a => a.order_index)) + 1
          : 0;

        const result = await createActivity({
          trip_id: trip.id,
          name: placeData.name,
          date: selectedDate,
          order_index: nextOrderIndex,
          address: placeData.address,
          plus_code: placeData.plusCode,
          city: placeData.city,
          google_maps_url: mapsUrl,
          latitude: placeData.location?.lat,
          longitude: placeData.location?.lng,
          description: placeData.description,
          generative_summary: placeData.generativeSummary,
        });

        if (isOk(result)) {
          onSuccess();
        } else {
          const error = unwrapErr(result);
          setError(error.message || 'Failed to add activity');
        }
      } else {
        // Add restaurant (no date required)
        const result = await createRestaurant({
          trip_id: trip.id,
          name: placeData.name,
          address: placeData.address,
          plus_code: placeData.plusCode,
          city: placeData.city,
          google_maps_url: mapsUrl,
          latitude: placeData.location?.lat,
          longitude: placeData.location?.lng,
        });

        if (isOk(result)) {
          onSuccess();
        } else {
          const error = unwrapErr(result);
          setError(error.message || 'Failed to add restaurant');
        }
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="card bg-base-100 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="card-body">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Quick Add</h2>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Type</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="itemType"
                  className="radio radio-primary"
                  checked={itemType === 'activity'}
                  onChange={() => setItemType('activity')}
                />
                <span className="label-text">Activity</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  name="itemType"
                  className="radio radio-primary"
                  checked={itemType === 'restaurant'}
                  onChange={() => setItemType('restaurant')}
                />
                <span className="label-text">Restaurant</span>
              </label>
            </div>
          </div>

          {/* Date Selection (only for activities) */}
          {itemType === 'activity' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Date *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">Select a date</option>
                {tripDates.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Google Maps Link */}
          <div className="form-control">
            <MapsLinkInput
              value={mapsUrl}
              onChange={setMapsUrl}
              onLookupSuccess={handleMapsLinkSuccess}
              onLookupError={handleMapsLinkError}
            />
          </div>

          {/* Success Message */}
          {placeData && (
            <div className="alert alert-success mt-4">
              <div>
                <div className="font-semibold">✓ Found: {placeData.name}</div>
                {placeData.city && (
                  <div className="text-xs opacity-70">{placeData.city}</div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error mt-4">
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="card-actions justify-end mt-6">
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              disabled={!placeData || (itemType === 'activity' && !selectedDate) || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Adding...
                </>
              ) : (
                'Add'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
