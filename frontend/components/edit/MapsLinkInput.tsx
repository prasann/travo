/**
 * Google Maps Link Input Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Input field for Google Maps URLs with place lookup functionality
 */

'use client';

import { useState } from 'react';
import { searchPlace } from '@/lib/services/placeSearchService';
import type { MapsLinkInputState } from '@/types/editMode';

interface MapsLinkInputProps {
  value: string;
  onChange: (value: string) => void;
  onLookupSuccess: (result: { 
    name: string; 
    address: string;
    plusCode?: string;
    city?: string;
    placeId?: string;
    location?: {
      lat: number;
      lng: number;
    };
    description?: string;
    photoUrl?: string;
  }) => void;
  onLookupError: (error: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function MapsLinkInput({
  value,
  onChange,
  onLookupSuccess,
  onLookupError,
  disabled = false,
  label = 'Google Maps Link'
}: MapsLinkInputProps) {
  const [state, setState] = useState<MapsLinkInputState>({
    value: '',
    loading: false,
    error: undefined,
    disabled: false
  });
  
  const handleLookup = async () => {
    if (!value || value.trim().length < 10) {
      setState(prev => ({ ...prev, error: 'Please paste a Google Maps link' }));
      onLookupError('Please paste a Google Maps link');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    const result = await searchPlace(value);
    
    if (result.success && result.name && result.address) {
      setState(prev => ({ ...prev, loading: false, error: undefined }));
      onLookupSuccess({ 
        name: result.name, 
        address: result.address,
        plusCode: result.plusCode,
        city: result.city,
        placeId: result.placeId,
        location: result.location,
        description: result.description,
        photoUrl: result.photoUrl
      });
    } else {
      const errorMessage = result.error || 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        disabled: result.errorType === 'quota_exceeded'
      }));
      onLookupError(errorMessage);
      
      // If quota exceeded, disable the input
      if (result.errorType === 'quota_exceeded') {
        setState(prev => ({ ...prev, disabled: true }));
      }
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLookup();
    }
  };
  
  const isDisabled = disabled || state.disabled || state.loading;
  
  return (
    <div className="form-control">
      <label className="label">
        <span className="label-text">{label}</span>
        <span className="label-text-alt text-xs text-base-content/60">
          Paste Google Maps share link
        </span>
      </label>
      
      <div className="join">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="input input-bordered join-item flex-1"
          placeholder="https://maps.app.goo.gl/xxx"
          disabled={isDisabled}
          maxLength={500}
        />
        <button
          type="button"
          onClick={handleLookup}
          className="btn btn-primary join-item"
          disabled={isDisabled}
        >
          {state.loading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Looking up...
            </>
          ) : (
            'Lookup'
          )}
        </button>
      </div>
      
      {state.error && (
        <label className="label">
          <span className="label-text-alt text-error">{state.error}</span>
        </label>
      )}
      
      {state.disabled && (
        <label className="label">
          <span className="label-text-alt text-warning">
            Place search disabled due to API quota exceeded
          </span>
        </label>
      )}
    </div>
  );
}
