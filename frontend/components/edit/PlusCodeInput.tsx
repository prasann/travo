/**
 * Plus Code Input Component
 * 
 * Feature: 006-edit-mode-for
 * Purpose: Input field for Google Plus Codes with lookup functionality
 */

'use client';

import { useState } from 'react';
import { lookupPlusCode } from '@/lib/services/plusCodeService';
import type { PlusCodeInputState } from '@/types/editMode';

interface PlusCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onLookupSuccess: (result: { name: string; address: string }) => void;
  onLookupError: (error: string) => void;
  disabled?: boolean;
  label?: string;
}

export default function PlusCodeInput({
  value,
  onChange,
  onLookupSuccess,
  onLookupError,
  disabled = false,
  label = 'Plus Code'
}: PlusCodeInputProps) {
  const [state, setState] = useState<PlusCodeInputState>({
    value: '',
    loading: false,
    error: undefined,
    disabled: false
  });
  
  const handleLookup = async () => {
    if (!value || value.trim().length < 4) {
      setState(prev => ({ ...prev, error: 'Plus Code is too short' }));
      onLookupError('Plus Code is too short');
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, error: undefined }));
    
    const result = await lookupPlusCode(value);
    
    if (result.success && result.name && result.address) {
      setState(prev => ({ ...prev, loading: false, error: undefined }));
      onLookupSuccess({ name: result.name, address: result.address });
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
          e.g., "MP52+Q6 Shibuya, Tokyo" or "8Q7XMP52+Q6"
        </span>
      </label>
      
      <div className="join">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onKeyPress={handleKeyPress}
          className="input input-bordered join-item flex-1"
          placeholder="MP52+Q6 Shibuya, Tokyo"
          disabled={isDisabled}
          maxLength={50}
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
            Plus Code lookup disabled due to API quota exceeded
          </span>
        </label>
      )}
    </div>
  );
}
