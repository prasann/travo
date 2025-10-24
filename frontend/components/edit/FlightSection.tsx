/**
 * Flight Section Component
 * 
 * Feature: 006-edit-mode-for (Phase 6 - US4)
 * Purpose: Display and manage flight notes in edit mode
 * Updated: 2025-10-24 - Migrated to UTC + IANA timezone system
 */

'use client';

import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { TripEditFormData } from '@/types/editMode';
import { 
  utcToLocal,
  localToUTC,
  COMMON_TIMEZONES,
  getDefaultTimezone
} from '@/lib/timezoneUtils';

interface FlightSectionProps {
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
}

const MAX_NOTES_LENGTH = 2000;

export default function FlightSection({ register, watch, setValue }: FlightSectionProps) {
  const flights = watch('flights') || [];
  
  // Filter out deleted flights
  const visibleFlights = flights.filter(f => !f._deleted);
  
  if (visibleFlights.length === 0) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Flights</h2>
          <div className="text-center py-8 text-base-content/60">
            <p>No flights added to this trip yet.</p>
            <p className="text-sm mt-2">Flights are displayed here for adding notes.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Flights</h2>
        
        <div className="space-y-4">
          {visibleFlights.map((flight, index) => {
            const notes = watch(`flights.${index}.notes`);
            const currentLength = notes?.length || 0;
            
            return (
              <div key={flight.id || index} className="card bg-base-200">
                <div className="card-body">
                  {/* Flight Header - Read-only */}
                  <div className="mb-4">
                    {/* Title with airline and flight number */}
                    <div className="flex items-center gap-2 mb-1">
                      {flight.airline && (
                        <span className="font-semibold text-lg">{flight.airline}</span>
                      )}
                      {flight.flight_number && (
                        <span className="badge badge-primary">{flight.flight_number}</span>
                      )}
                      {!flight.airline && !flight.flight_number && (
                        <span className="font-semibold text-lg">Flight {index + 1}</span>
                      )}
                    </div>
                    
                    {/* Route - Prominent display */}
                    {(flight.departure_location || flight.arrival_location) && (
                      <div className="text-base font-medium mb-3">
                        {flight.departure_location && (
                          <span className="text-info">{flight.departure_location}</span>
                        )}
                        {flight.departure_location && flight.arrival_location && (
                          <span className="mx-2 text-base-content/40">→</span>
                        )}
                        {flight.arrival_location && (
                          <span className="text-success">{flight.arrival_location}</span>
                        )}
                      </div>
                    )}
                    
                    {flight.confirmation_number && (
                      <div className="text-sm mb-2">
                        <span className="text-base-content/60">Confirmation: </span>
                        <span className="font-mono font-semibold">{flight.confirmation_number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Editable Flight Times with Timezone */}
                  <div className="space-y-4 mb-4">
                    {/* Departure Time */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="form-control w-full lg:col-span-2">
                        <label className="label">
                          <span className="label-text">Departure Time</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={utcToLocal(
                            watch(`flights.${index}.departure_time`),
                            watch(`flights.${index}.departure_timezone`) || getDefaultTimezone()
                          )}
                          className="input input-bordered w-full"
                          onChange={(e) => {
                            if (e.target.value) {
                              const timezone = watch(`flights.${index}.departure_timezone`) || getDefaultTimezone();
                              const utcValue = localToUTC(e.target.value, timezone);
                              setValue(`flights.${index}.departure_time`, utcValue);
                            } else {
                              setValue(`flights.${index}.departure_time`, undefined);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Timezone</span>
                        </label>
                        <select
                          {...register(`flights.${index}.departure_timezone`)}
                          className="select select-bordered w-full text-sm"
                          defaultValue={getDefaultTimezone()}
                        >
                          {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Arrival Time */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="form-control w-full lg:col-span-2">
                        <label className="label">
                          <span className="label-text">Arrival Time</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={utcToLocal(
                            watch(`flights.${index}.arrival_time`),
                            watch(`flights.${index}.arrival_timezone`) || getDefaultTimezone()
                          )}
                          className="input input-bordered w-full"
                          onChange={(e) => {
                            if (e.target.value) {
                              const timezone = watch(`flights.${index}.arrival_timezone`) || getDefaultTimezone();
                              const utcValue = localToUTC(e.target.value, timezone);
                              setValue(`flights.${index}.arrival_time`, utcValue);
                            } else {
                              setValue(`flights.${index}.arrival_time`, undefined);
                            }
                          }}
                        />
                      </div>
                      
                      <div className="form-control w-full">
                        <label className="label">
                          <span className="label-text">Timezone</span>
                        </label>
                        <select
                          {...register(`flights.${index}.arrival_timezone`)}
                          className="select select-bordered w-full text-sm"
                          defaultValue={getDefaultTimezone()}
                        >
                          {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Notes Field (Editable) */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Flight Notes</span>
                      <span className="label-text-alt">
                        {currentLength} / {MAX_NOTES_LENGTH}
                      </span>
                    </label>
                    <textarea
                      {...register(`flights.${index}.notes`, {
                        maxLength: {
                          value: MAX_NOTES_LENGTH,
                          message: `Notes must be less than ${MAX_NOTES_LENGTH} characters`
                        }
                      })}
                      className="textarea textarea-bordered w-full"
                      rows={3}
                      placeholder="Add notes about this flight (baggage, seat preferences, connections, etc.)"
                    />
                    {currentLength > MAX_NOTES_LENGTH && (
                      <label className="label">
                        <span className="label-text-alt text-error">
                          Notes exceed maximum length
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
