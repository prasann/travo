/**
 * Edit Mode Layout Component
 * 
 * Feature: 006-edit-mode-for
 * Feature: Refine Integration Phase 5 - Edit Forms
 * Purpose: Main container for trip editing interface
 * 
 * Step 3: Migrate activities to Refine mutations
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { useCreate, useUpdate, useDelete } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import type { TripEditFormData, EditCategory } from '@/types/editMode';
import type { TripWithRelations } from '@/lib/db/models';
import CategoryNav from './CategoryNav';
import NotesSection from './NotesSection';
import HotelSection from './HotelSection';
import ActivitySection from './ActivitySection';
import FlightSection from './FlightSection';

interface EditModeLayoutProps {
  tripId: string;
}

export default function EditModeLayout({ tripId }: EditModeLayoutProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EditCategory>('info');
  
  // Refine's useForm - handles loading, data fetching, and trip-level saving
  const formReturn = useForm<TripEditFormData, any, TripEditFormData>({
    refineCoreProps: {
      resource: "trips",
      action: "edit",
      id: tripId,
      redirect: false,
    },
  });
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = formReturn;
  
  // Access Refine core methods
  const refineCore = (formReturn as any).refineCore;
  const queryResult = refineCore?.query;
  const onFinish = refineCore?.onFinish;
  
  // Refine mutation hooks for hotels (Step 2)
  const { mutateAsync: createHotel } = useCreate();
  const { mutateAsync: updateHotel } = useUpdate();
  const { mutateAsync: deleteHotel } = useDelete();
  
  // Extract trip data and loading state from Refine
  const trip = queryResult?.data?.data as TripWithRelations | undefined;
  const isLoading = !queryResult || queryResult.isLoading;
  const queryError = queryResult?.error;

  // Watch form fields
  const watchedNotes = watch('notes');
  const watchedStartDate = watch('start_date');
  const watchedEndDate = watch('end_date');
  
  // Initialize form with trip data (including nested entities)
  useEffect(() => {
    if (trip) {
      reset({
        name: trip.name,
        description: trip.description || '',
        start_date: trip.start_date,
        end_date: trip.end_date,
        home_location: trip.home_location || '',
        notes: '',
        hotels: trip.hotels.map(h => ({
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
        activities: trip.activities.map(a => ({
          id: a.id,
          name: a.name,
          address: a.address,
          plus_code: a.plus_code,
          city: a.city,
          date: a.date,
          order_index: a.order_index,
          notes: a.notes,
          google_maps_url: a.google_maps_url,
          latitude: a.latitude,
          longitude: a.longitude,
        })),
        flights: trip.flights.map(f => ({
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
  }, [trip, reset]);
  
  // Save handler - Step 1: Uses Refine for trip-level, manual for nested entities
  const onSubmit = async (data: TripEditFormData) => {
    try {
      // Save trip basic info through Refine (automatic notification & cache invalidation)
      await onFinish({
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        home_location: data.home_location,
      });
      
      // Import DB operations for nested entities (TODO: Replace in Step 4)
      const { bulkUpdateActivities } = await import('@/lib/db/operations/activities');
      const { updateFlight } = await import('@/lib/db/operations/flights');
      
      // Handle hotel changes with Refine mutations (Step 2)
      for (const hotel of data.hotels) {
        if (hotel._deleted && hotel.id) {
          // Delete existing hotel
          await deleteHotel({
            resource: 'hotels',
            id: hotel.id,
          });
        } else if (!hotel.id) {
          // Create new hotel
          await createHotel({
            resource: 'hotels',
            values: {
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
            },
          });
        } else if (hotel.id) {
          // Update existing hotel notes
          await updateHotel({
            resource: 'hotels',
            id: hotel.id,
            values: {
              notes: hotel.notes,
            },
          });
        }
      }
      
      // Handle activity changes with Refine mutations (Step 3)
      const reorderedActivities: Array<{ id: string; order_index: number }> = [];
      
      for (const activity of data.activities) {
        if (activity._deleted && activity.id) {
          // Delete existing activity
          await deleteHotel({
            resource: 'activities',
            id: activity.id,
          });
        } else if (!activity.id) {
          // Create new activity
          await createHotel({
            resource: 'activities',
            values: {
              trip_id: tripId,
              name: activity.name,
              address: activity.address,
              plus_code: activity.plus_code,
              city: activity.city,
              date: activity.date,
              order_index: activity.order_index,
              notes: activity.notes,
              google_maps_url: activity.google_maps_url,
              latitude: activity.latitude,
              longitude: activity.longitude,
            },
          });
        } else if (activity.id) {
          // Track activities with updated order_index for bulk update
          reorderedActivities.push({
            id: activity.id,
            order_index: activity.order_index
          });
          
          // Update activity notes
          await updateHotel({
            resource: 'activities',
            id: activity.id,
            values: {
              notes: activity.notes ?? null,
            },
          });
        }
      }
      
      // Bulk update order_index for reordered activities (custom operation)
      if (reorderedActivities.length > 0) {
        await bulkUpdateActivities(reorderedActivities);
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
      
      // Refetch trip data (Refine handles this automatically, but we manually trigger for nested entities)
      await queryResult?.refetch();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Save error:', err);
      // Refine handles error notifications automatically
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
  if (queryError || !trip) {
    return (
      <main className="min-h-screen bg-base-200 p-4 sm:p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="alert alert-error">
            <span>{queryError?.message || 'Failed to load trip'}</span>
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
              className="btn btn-ghost"
            >
              Return to View
            </button>
          </div>
        </div>        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success mb-4">
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Error Message */}
        {queryError && (
          <div className="alert alert-error mb-4">
            <span>{queryError.message}</span>
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
                      className="input input-bordered"
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
                      className="textarea textarea-bordered"
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
                        className="input input-bordered"
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
                        className="input input-bordered"
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
                      className="input input-bordered"
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
          
          {/* Activities Section */}
          {activeCategory === 'activities' && (
            <ActivitySection
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
