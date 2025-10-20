/**
 * Edit Mode Layout Component
 * 
 * Manages trip editing with Refine.dev integration for automatic:
 * - Data loading and caching
 * - Form state management
 * - CRUD operations with notifications
 * - Cache invalidation
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@refinedev/react-hook-form';
import { useCreate, useUpdate, useDelete } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import type { TripEditFormData, EditCategory } from '@/types/editMode';
import type { TripWithRelations } from '@/lib/db/models';
import { bulkUpdateActivities } from '@/lib/db/operations/activities';
import CategoryNav from './CategoryNav';
import NotesSection from './NotesSection';
import HotelSection from './HotelSection';
import ActivitySection from './ActivitySection';
import FlightSection from './FlightSection';
import RestaurantSection from './RestaurantSection';

interface EditModeLayoutProps {
  tripId: string;
}

export default function EditModeLayout({ tripId }: EditModeLayoutProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<EditCategory>('info');
  
  // Refine form hook - automatic data loading and trip-level mutations
  const formReturn = useForm<TripEditFormData, any, TripEditFormData>({
    refineCoreProps: {
      resource: "trips",
      action: "edit",
      id: tripId,
      redirect: false,
      successNotification: false, // Disable auto notification - we show custom success message
      errorNotification: (data) => ({
        message: 'Failed to save trip',
        type: 'error',
        description: data?.message || 'An error occurred while saving',
      }),
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
  
  // Access Refine core for query and mutations
  const refineCore = (formReturn as any).refineCore;
  const queryResult = refineCore?.query;
  const onFinish = refineCore?.onFinish;
  
  // Refine mutation hooks for nested entities
  // Disable automatic notifications - we'll show a single success message
  const { mutateAsync: createEntity } = useCreate();
  const { mutateAsync: updateEntity } = useUpdate();
  const { mutateAsync: deleteEntity } = useDelete();
  
  // Extract trip data and loading state
  const trip = queryResult?.data?.data as TripWithRelations | undefined;
  const isLoading = !queryResult || queryResult.isLoading;
  const queryError = queryResult?.error;

  // Watch form fields for conditional rendering
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
          google_maps_url: h.google_maps_url,
          latitude: h.latitude,
          longitude: h.longitude,
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
          description: a.description,
          image_url: a.image_url,
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
        restaurants: trip.restaurants.map(r => ({
          id: r.id,
          name: r.name,
          address: r.address,
          plus_code: r.plus_code,
          city: r.city,
          cuisine_type: r.cuisine_type,
          phone: r.phone,
          website: r.website,
          notes: r.notes,
          google_maps_url: r.google_maps_url,
          latitude: r.latitude,
          longitude: r.longitude,
        })),
      });
    }
  }, [trip, reset]);
  
  // Save handler - processes trip and all nested entities
  const onSubmit = async (data: TripEditFormData) => {
    try {
      // Save trip basic info (automatic notification & cache invalidation)
      await onFinish({
        name: data.name,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        home_location: data.home_location,
      });
      
      // Process hotel changes
      for (const hotel of data.hotels) {
        if (hotel._deleted && hotel.id) {
          await deleteEntity({
            resource: 'hotels',
            id: hotel.id,
          });
        } else if (!hotel.id) {
          await createEntity({
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
              google_maps_url: hotel.google_maps_url,
              latitude: hotel.latitude,
              longitude: hotel.longitude,
            },
          });
        } else if (hotel.id) {
          await updateEntity({
            resource: 'hotels',
            id: hotel.id,
            values: {
              city: hotel.city,
              check_in_time: hotel.check_in_time,
              check_out_time: hotel.check_out_time,
              confirmation_number: hotel.confirmation_number,
              phone: hotel.phone,
              notes: hotel.notes,
            },
          });
        }
      }
      
      // Process activity changes
      const reorderedActivities: Array<{ id: string; order_index: number }> = [];
      
      for (const activity of data.activities) {
        if (activity._deleted && activity.id) {
          await deleteEntity({
            resource: 'activities',
            id: activity.id,
          });
        } else if (!activity.id) {
          await createEntity({
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
              description: activity.description,
              image_url: activity.image_url,
            },
          });
        } else if (activity.id) {
          reorderedActivities.push({
            id: activity.id,
            order_index: activity.order_index
          });
          
          await updateEntity({
            resource: 'activities',
            id: activity.id,
            values: {
              notes: activity.notes ?? null,
            },
          });
        }
      }
      
      // Bulk update activity order for drag-drop reordering
      if (reorderedActivities.length > 0) {
        await bulkUpdateActivities(reorderedActivities);
      }
      
      // Process flight changes
      for (const flight of data.flights) {
        if (flight.id) {
          await updateEntity({
            resource: 'flights',
            id: flight.id,
            values: {
              departure_time: flight.departure_time,
              arrival_time: flight.arrival_time,
              notes: flight.notes ?? undefined,
            },
          });
        }
      }
      
      // Process restaurant changes
      for (const restaurant of data.restaurants) {
        if (restaurant._deleted && restaurant.id) {
          await deleteEntity({
            resource: 'restaurants',
            id: restaurant.id,
          });
        } else if (!restaurant.id) {
          await createEntity({
            resource: 'restaurants',
            values: {
              trip_id: tripId,
              name: restaurant.name,
              address: restaurant.address,
              plus_code: restaurant.plus_code,
              city: restaurant.city,
              cuisine_type: restaurant.cuisine_type,
              phone: restaurant.phone,
              website: restaurant.website,
              notes: restaurant.notes,
              google_maps_url: restaurant.google_maps_url,
              latitude: restaurant.latitude,
              longitude: restaurant.longitude,
            },
          });
        } else if (restaurant.id) {
          await updateEntity({
            resource: 'restaurants',
            id: restaurant.id,
            values: {
              city: restaurant.city,
              cuisine_type: restaurant.cuisine_type,
              phone: restaurant.phone,
              website: restaurant.website,
              notes: restaurant.notes,
            },
          });
        }
      }
      
      setSuccessMessage('Trip saved successfully!');
      await queryResult?.refetch();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Save error:', err);
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
    <main className="min-h-screen bg-base-200">
      <Navigation title="Travo" showBackButton backHref={`/trip/${tripId}`} />
      <div className="p-4 sm:p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-4xl font-bold">Edit: {trip.name}</h1>
          </div>
          
          {/* Success Message */}
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
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Trip Name *</span>
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Trip name is required' })}
                      className="input input-bordered w-full"
                      placeholder="My Amazing Trip"
                    />
                    {errors.name && (
                      <label className="label">
                        <span className="label-text-alt text-error">{errors.name.message}</span>
                      </label>
                    )}
                  </div>
                  
                  {/* Description */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Description</span>
                    </label>
                    <textarea
                      {...register('description')}
                      className="textarea textarea-bordered w-full"
                      placeholder="Brief description of your trip"
                      rows={2}
                    />
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium">Start Date *</span>
                      </label>
                      <input
                        type="date"
                        {...register('start_date', { required: 'Start date is required' })}
                        className="input input-bordered w-full"
                      />
                      {errors.start_date && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.start_date.message}</span>
                        </label>
                      )}
                    </div>
                    
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text font-medium">End Date *</span>
                      </label>
                      <input
                        type="date"
                        {...register('end_date', { required: 'End date is required' })}
                        className="input input-bordered w-full"
                      />
                      {errors.end_date && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.end_date.message}</span>
                        </label>
                      )}
                    </div>
                  </div>
                  
                  {/* Home Location */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Home Location</span>
                    </label>
                    <input
                      type="text"
                      {...register('home_location')}
                      className="input input-bordered w-full"
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
              setValue={setValue}
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
          
          {/* Restaurants Section */}
          {activeCategory === 'restaurants' && (
            <RestaurantSection
              register={register}
              setValue={setValue}
              watch={watch}
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
      </div>
    </main>
  );
}
