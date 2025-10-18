/**
 * Flight Section Component
 * 
 * Feature: 006-edit-mode-for (Phase 6 - US4)
 * Purpose: Display and manage flight notes in edit mode
 */

'use client';

import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import type { TripEditFormData } from '@/types/editMode';

interface FlightSectionProps {
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
  setValue: UseFormSetValue<TripEditFormData>;
}

const MAX_NOTES_LENGTH = 2000;

/**
 * Convert ISO datetime string to datetime-local input format (YYYY-MM-DDTHH:mm)
 */
function toDateTimeLocalValue(isoString?: string): string {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    // Format: YYYY-MM-DDTHH:mm
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

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
                    <div className="flex items-center gap-2 mb-2">
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
                    
                    {/* Route - Read-only */}
                    <div className="flex items-center gap-2 text-base-content/60 text-sm mb-3">
                      {flight.departure_location && (
                        <>
                          <span className="font-medium">{flight.departure_location}</span>
                          <span>→</span>
                        </>
                      )}
                      {flight.arrival_location && (
                        <span className="font-medium">{flight.arrival_location}</span>
                      )}
                    </div>
                    
                    {flight.confirmation_number && (
                      <div className="text-sm">
                        <span className="text-base-content/60">Confirmation: </span>
                        <span className="font-mono">{flight.confirmation_number}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Editable Flight Times */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Departure Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        {...register(`flights.${index}.departure_time`)}
                        defaultValue={toDateTimeLocalValue(flight.departure_time)}
                        className="input input-bordered"
                        onChange={(e) => {
                          if (e.target.value) {
                            setValue(`flights.${index}.departure_time`, new Date(e.target.value).toISOString());
                          }
                        }}
                      />
                    </div>
                    
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Arrival Time</span>
                      </label>
                      <input
                        type="datetime-local"
                        {...register(`flights.${index}.arrival_time`)}
                        defaultValue={toDateTimeLocalValue(flight.arrival_time)}
                        className="input input-bordered"
                        onChange={(e) => {
                          if (e.target.value) {
                            setValue(`flights.${index}.arrival_time`, new Date(e.target.value).toISOString());
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Notes Field (Editable) */}
                  <div className="form-control">
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
                      className="textarea textarea-bordered"
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
