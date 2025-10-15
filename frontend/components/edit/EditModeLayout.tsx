/**
 * Edit Mode Layout Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Main container for trip editing interface
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { TripEditFormData, EditCategory } from '@/types/editMode';
import type { TripWithRelations } from '@/lib/db/models';
import { getTripWithRelations } from '@/lib/db/operations/trips';
import { isOk, unwrap, unwrapErr } from '@/lib/db/resultHelpers';
import CategoryNav from './CategoryNav';
import NotesSection from './NotesSection';
import HotelSection from './HotelSection';
import AttractionSection from './AttractionSection';
import FlightSection from './FlightSection';

interface EditModeLayoutProps {
  tripId: string;
}

export default function EditModeLayout({ tripId }: EditModeLayoutProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<TripWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EditCategory>('info');
  
  // Initialize React Hook Form
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TripEditFormData>();
  
  // Watch form fields
  const watchedNotes = watch('notes');
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  
  // Load trip data
  useEffect(() => {
    async function loadTrip() {
      setIsLoading(true);
      const result = await getTripWithRelations(tripId);
      
      if (isOk(result)) {
        const tripData = unwrap(result);
        setTrip(tripData);
        
        // Initialize form with trip data
        reset({
          name: tripData.name,
          description: tripData.description || '',
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          home_location: tripData.home_location || '',
          notes: '', // Trip-level notes not in current schema
          hotels: tripData.hotels.map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            plus_code: h.plus_code,
            city: h.city,
            check_in_time: h.check_in_time,
            check_out_time: h.check_out_time,
            confirmation_number: h.confirmation_number,
            phone: h.phone,
            notes: h.notes,
          })),
          activities: tripData.activities.map(a => ({
            id: a.id,
            name: a.name,
            address: a.address,
            plus_code: a.plus_code,
            city: a.city,
            date: a.date,
            start_time: a.start_time,
            duration_minutes: a.duration_minutes,
            order_index: a.order_index,
            notes: a.notes,
          })),
          flights: tripData.flights.map(f => ({
            id: f.id,
            airline: f.airline,
            flight_number: f.flight_number,
            departure_time: f.departure_time,
            arrival_time: f.arrival_time,
            departure_location: f.departure_location,
            arrival_location: f.arrival_location,
            confirmation_number: f.confirmation_number,
            notes: f.notes,
          })),
        });
      } else {
        setError(unwrapErr(result).message);
      }
      
      setIsLoading(false);
    }
    
    loadTrip();
  }, [tripId, reset]);
  
  // Save handler
  const onSubmit = async (data: TripEditFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Import DB operations dynamically to avoid server-side issues
      const { updateTrip } = await import('@/lib/db/operations/trips');
      const { createHotel, updateHotel, deleteHotel } = await import('@/lib/db/operations/hotels');
      const { createActivity, updateActivity, deleteActivity, bulkUpdateActivities } = await import('@/lib/db/operations/activities');
      const { updateFlight } = await import('@/lib/db/operations/flights');
      
      // Update trip basic info
      const tripResult = await updateTrip({
        id: tripId,
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        home_location: data.home_location,
      });
      
      if (!isOk(tripResult)) {
        throw new Error(unwrapErr(tripResult).message);
      }
      
      // Handle hotel changes
      for (const hotel of data.hotels) {
        if (hotel._deleted && hotel.id) {
          // Delete existing hotel
          await deleteHotel(hotel.id);
        } else if (!hotel.id) {
          // Create new hotel
          await createHotel({
            trip_id: tripId,
            name: hotel.name,
            address: hotel.address,
            plus_code: hotel.plus_code,
            city: hotel.city,
            check_in_time: hotel.check_in_time,
            check_out_time: hotel.check_out_time,
            confirmation_number: hotel.confirmation_number,
            phone: hotel.phone,
            notes: hotel.notes,
          });
        } else if (hotel.id) {
          // Update existing hotel (Phase 6 - notes support)
          await updateHotel(hotel.id, {
            notes: hotel.notes,
          });
        }
      }
      
      // Handle activity changes
      const reorderedActivities: Array<{ id: string; order_index: number }> = [];
      const updatedActivities: Array<{ id: string; notes: string | null }> = [];
      
      for (const activity of data.activities) {
        if (activity._deleted && activity.id) {
          // Delete existing activity
          await deleteActivity(activity.id);
        } else if (!activity.id) {
          // Create new activity
          await createActivity({
            trip_id: tripId,
            name: activity.name,
            address: activity.address,
            plus_code: activity.plus_code,
            city: activity.city,
            date: activity.date,
            start_time: activity.start_time,
            duration_minutes: activity.duration_minutes,
            order_index: activity.order_index,
            notes: activity.notes,
          });
        } else if (activity.id) {
          // Track activities with updated order_index for bulk update
          reorderedActivities.push({
            id: activity.id,
            order_index: activity.order_index
          });
          
          // Track notes updates (Phase 6)
          updatedActivities.push({
            id: activity.id,
            notes: activity.notes ?? null
          });
        }
      }
      
      // Bulk update order_index for reordered activities
      if (reorderedActivities.length > 0) {
        await bulkUpdateActivities(reorderedActivities);
      }
      
      // Update activity notes (Phase 6)
      for (const activity of updatedActivities) {
        await updateActivity(activity.id, {
          notes: activity.notes ?? undefined,
        });
      }
      
      // Update flight notes (Phase 6)
      for (const flight of data.flights) {
        if (flight.id) {
          await updateFlight(flight.id, {
            notes: flight.notes ?? undefined,
          });
        }
      }
      
      setSuccessMessage('Trip saved successfully!');
      
      // Reload trip data to get updated IDs
      const reloadResult = await getTripWithRelations(tripId);
      if (isOk(reloadResult)) {
        const reloadedTrip = unwrap(reloadResult);
        setTrip(reloadedTrip);
        
        // Reset form with fresh data
        reset({
          name: reloadedTrip.name,
          description: reloadedTrip.description || '',
          start_date: reloadedTrip.start_date,
          end_date: reloadedTrip.end_date,
          home_location: reloadedTrip.home_location || '',
          notes: '',
          hotels: reloadedTrip.hotels.map(h => ({
            id: h.id,
            name: h.name,
            address: h.address,
            plus_code: h.plus_code,
            city: h.city,
            check_in_time: h.check_in_time,
            check_out_time: h.check_out_time,
            confirmation_number: h.confirmation_number,
            phone: h.phone,
            notes: h.notes,
          })),
          activities: reloadedTrip.activities.map(a => ({
            id: a.id,
            name: a.name,
            address: a.address,
            plus_code: a.plus_code,
            city: a.city,
            date: a.date,
            start_time: a.start_time,
            duration_minutes: a.duration_minutes,
            order_index: a.order_index,
            notes: a.notes,
          })),
          flights: reloadedTrip.flights.map(f => ({
            id: f.id,
            airline: f.airline,
            flight_number: f.flight_number,
            departure_time: f.departure_time,
            arrival_time: f.arrival_time,
            departure_location: f.departure_location,
            arrival_location: f.arrival_location,
            confirmation_number: f.confirmation_number,
            notes: f.notes,
          })),
        });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while saving.';
      
      if (errorMessage.includes('quota')) {
        setError('Storage quota exceeded. Please free up space and try again.');
      } else {
        setError(errorMessage);
      }
      
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </main>
    );
  }
  
  // Error state
  if (error && !trip) {
    return (
      <main className="min-h-screen bg-base-200 p-4 sm:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary mt-4"
          >
            Return to Home
          </button>
        </div>
      </main>
    );
  }
  
  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl sm:text-4xl font-bold">Edit Trip</h1>
            <button
              onClick={() => router.push(`/trip/${tripId}`)}
              className="btn btn-ghost btn-sm"
            >
              Return to View
            </button>
          </div>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success mb-4">
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        
        {/* Category Navigation */}
        <CategoryNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Trip Info Section */}
          {activeCategory === 'info' && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title mb-4">Trip Information</h2>
                
                <div className="space-y-4">
                  {/* Trip Name */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Trip Name *</span>
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Trip name is required' })}
                      className="input input-bordered input-sm"
                      placeholder="My Amazing Trip"
                    />
                    {errors.name && (
                      <label className="label py-1">
                        <span className="label-text-alt text-error">{errors.name.message}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      {...register('description')}
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Brief description of your trip"
                      rows={2}
                    />
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-medium">Start Date *</span>
                      </label>
                      <input
                        type="date"
                        {...register('start_date', { required: 'Start date is required' })}
                        className="input input-bordered input-sm"
                      />
                      {errors.start_date && (
                        <label className="label py-1">
                          <span className="label-text-alt text-error">{errors.start_date.message}</span>
                        </label>
                      )}
                    </div>
                    
                    <div className="form-control">
                      <label className="label py-1">
                        <span className="label-text font-medium">End Date *</span>
                      </label>
                      <input
                        type="date"
                        {...register('end_date', { required: 'End date is required' })}
                        className="input input-bordered input-sm"
                      />
                      {errors.end_date && (
                        <label className="label py-1">
                          <span className="label-text-alt text-error">{errors.end_date.message}</span>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Home Location */}
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text font-medium">Home Location</span>
                    </label>
                    <input
                      type="text"
                      {...register('home_location')}
                      className="input input-bordered input-sm"
                      placeholder="San Francisco"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Flights Section */}
          {activeCategory === 'flights' && (
            <FlightSection
              register={register}
              watch={watch}
            />
          )}
          
          {/* Hotels Section */}
          {activeCategory === 'hotels' && (
            <HotelSection
              register={register}
              setValue={setValue}
              watch={watch}
            />
          )}
          
          {/* Attractions Section */}
          {activeCategory === 'attractions' && (
            <AttractionSection
              register={register}
              setValue={setValue}
              watch={watch}
              tripStartDate={watchedStartDate}
              tripEndDate={watchedEndDate}
            />
          )}
          
          {/* Notes Section */}
          {activeCategory === 'notes' && (
            <NotesSection register={register} notes={watchedNotes} />
          )}
          
          {/* Save Button */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
