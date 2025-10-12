/**
 * Flight Section Component
 * 
 * Feature: 006-edit-mode-for (Phase 6 - US4)
 * Purpose: Display and manage flight notes in edit mode
 */

'use client';

import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { TripEditFormData } from '@/types/editMode';

interface FlightSectionProps {
  register: UseFormRegister<TripEditFormData>;
  watch: UseFormWatch<TripEditFormData>;
}

const MAX_NOTES_LENGTH = 2000;

export default function FlightSection({ register, watch }: FlightSectionProps) {
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
                  {/* Flight Info (Read-only) */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {flight.airline && (
                        <span className="font-semibold">{flight.airline}</span>
                      )}
                      {flight.flight_number && (
                        <span className="badge badge-primary">{flight.flight_number}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      {flight.departure_location && (
                        <div>
                          <span className="text-base-content/60">From: </span>
                          <span className="font-medium">{flight.departure_location}</span>
                        </div>
                      )}
                      {flight.arrival_location && (
                        <div>
                          <span className="text-base-content/60">To: </span>
                          <span className="font-medium">{flight.arrival_location}</span>
                        </div>
                      )}
                      {flight.departure_time && (
                        <div>
                          <span className="text-base-content/60">Departs: </span>
                          <span>{new Date(flight.departure_time).toLocaleString()}</span>
                        </div>
                      )}
                      {flight.arrival_time && (
                        <div>
                          <span className="text-base-content/60">Arrives: </span>
                          <span>{new Date(flight.arrival_time).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {flight.confirmation_number && (
                      <div className="mt-2 text-sm">
                        <span className="text-base-content/60">Confirmation: </span>
                        <span className="font-mono">{flight.confirmation_number}</span>
                      </div>
                    )}
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
