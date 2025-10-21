/**
 * Timezone utilities for displaying and managing timezones
 * Feature: Timezone Support
 * Date: 2025-10-21
 * Updated: Using date-fns for reliable date/time handling
 * 
 * Handles timezone extraction, display, and conversion for flights and hotels.
 * Focuses on display-only timezone support without requiring user's local timezone.
 */

import { parseISO, format as formatDate } from 'date-fns';

/**
 * Extract timezone offset from ISO 8601 datetime string
 * 
 * @param isoString ISO 8601 datetime with timezone (e.g., "2025-04-01T11:00:00-07:00")
 * @returns Object with offset string and timezone abbreviation
 * 
 * @example
 * extractTimezoneInfo("2025-04-01T11:00:00-07:00")
 * // => { offset: "-07:00", abbreviation: "UTC-7" }
 * 
 * extractTimezoneInfo("2025-04-02T14:30:00+09:00")
 * // => { offset: "+09:00", abbreviation: "UTC+9" }
 */
export function extractTimezoneInfo(isoString: string): {
  offset: string;
  abbreviation: string;
} {
  // Match timezone offset pattern: +HH:MM or -HH:MM
  const timezonePattern = /([+-]\d{2}:\d{2})$/;
  const match = isoString.match(timezonePattern);
  
  if (!match) {
    // No timezone info, assume UTC
    return {
      offset: '+00:00',
      abbreviation: 'UTC'
    };
  }
  
  const offset = match[1];
  
  // Convert offset to readable abbreviation
  const abbreviation = formatTimezoneOffset(offset);
  
  return {
    offset,
    abbreviation
  };
}

/**
 * Format timezone offset to human-readable abbreviation
 * 
 * @param offset Timezone offset string (e.g., "-07:00", "+09:00")
 * @returns Readable timezone abbreviation
 * 
 * @example
 * formatTimezoneOffset("-07:00") // => "UTC-7"
 * formatTimezoneOffset("+09:00") // => "UTC+9"
 * formatTimezoneOffset("+00:00") // => "UTC"
 */
export function formatTimezoneOffset(offset: string): string {
  if (offset === '+00:00' || offset === '-00:00') {
    return 'UTC';
  }
  
  // Extract hours and minutes
  const sign = offset[0];
  const [hours, minutes] = offset.slice(1).split(':');
  const hoursNum = parseInt(hours, 10);
  const minutesNum = parseInt(minutes, 10);
  
  // Format as UTC±H or UTC±H:MM
  if (minutesNum === 0) {
    return `UTC${sign}${hoursNum}`;
  } else {
    return `UTC${sign}${hoursNum}:${minutes}`;
  }
}

/**
 * Format datetime with timezone for display
 * Shows time with timezone abbreviation
 * Uses date-fns for reliable date parsing and formatting
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @param includeDate Whether to include the date in output
 * @returns Formatted string with timezone
 * 
 * @example
 * formatTimeWithTimezone("2025-04-01T11:00:00-07:00")
 * // => "11:00 AM UTC-7"
 * 
 * formatTimeWithTimezone("2025-04-02T14:30:00+09:00", true)
 * // => "Apr 2, 2:30 PM UTC+9"
 */
export function formatTimeWithTimezone(
  isoString: string,
  includeDate: boolean = false
): string {
  try {
    const { abbreviation } = extractTimezoneInfo(isoString);
    
    // parseISO from date-fns handles ISO 8601 strings with timezone offsets correctly
    // It parses the full string and converts to the appropriate Date object
    const date = parseISO(isoString);
    
    if (includeDate) {
      // Format: "Oct 31, 3:00 PM UTC+7"
      const formatted = formatDate(date, 'MMM d, h:mm a');
      return `${formatted} ${abbreviation}`;
    } else {
      // Format: "3:00 PM UTC+7"
      const formatted = formatDate(date, 'h:mm a');
      return `${formatted} ${abbreviation}`;
    }
  } catch (error) {
    console.error('Error formatting time with timezone:', error);
    return 'Invalid date';
  }
}

/**
 * Get timezone abbreviation from ISO string for compact display
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Timezone abbreviation (e.g., "UTC-7", "UTC+9")
 */
export function getTimezoneAbbreviation(isoString: string): string {
  return extractTimezoneInfo(isoString).abbreviation;
}

/**
 * Convert datetime-local input value to ISO string with timezone
 * Preserves the timezone from the original value
 * 
 * @param localValue Value from datetime-local input (YYYY-MM-DDTHH:mm)
 * @param originalIsoString Original ISO string to extract timezone from
 * @returns ISO string with original timezone preserved
 * 
 * @example
 * toIsoWithOriginalTimezone("2025-04-01T11:00", "2025-04-01T10:00:00-07:00")
 * // => "2025-04-01T11:00:00-07:00"
 */
export function toIsoWithOriginalTimezone(
  localValue: string,
  originalIsoString?: string
): string {
  if (!localValue) {
    return '';
  }
  
  // Extract timezone offset from original string, default to UTC
  const { offset } = originalIsoString 
    ? extractTimezoneInfo(originalIsoString)
    : { offset: '+00:00' };
  
  // Append seconds and timezone offset
  return `${localValue}:00${offset}`;
}

/**
 * Convert ISO string to datetime-local input value
 * Extracts the local time portion without timezone conversion
 * Uses simple regex extraction for efficiency
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns datetime-local format (YYYY-MM-DDTHH:mm)
 * 
 * @example
 * toDateTimeLocalValue("2025-04-01T11:00:00-07:00")
 * // => "2025-04-01T11:00"
 */
export function toDateTimeLocalValue(isoString?: string): string {
  if (!isoString) return '';
  
  try {
    // Extract the date and time portion before the timezone
    // ISO format: YYYY-MM-DDTHH:mm:ss±HH:MM -> YYYY-MM-DDTHH:mm
    const match = isoString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
    
    if (match) {
      return match[1];
    }
    
    // Fallback: try parsing with date-fns
    const date = parseISO(isoString);
    return formatDate(date, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error converting to datetime-local:', error);
    return '';
  }
}

/**
 * Get a list of common timezone offsets for selection
 * Useful for timezone picker dropdowns
 * 
 * @returns Array of timezone options with offset and label in UTC format
 */
export function getCommonTimezones(): Array<{
  offset: string;
  label: string;
}> {
  return [
    { offset: '+05:30', label: 'UTC+5:30 (India)' },
    { offset: '+09:00', label: 'UTC+9 (Tokyo)' },
    { offset: '+08:00', label: 'UTC+8 (Singapore/Hong Kong)' },
    { offset: '+07:00', label: 'UTC+7 (Bangkok)' },
    { offset: '+04:00', label: 'UTC+4 (Dubai)' },
    { offset: '+01:00', label: 'UTC+1 (Paris/Berlin)' },
    { offset: '+00:00', label: 'UTC (London)' },
    { offset: '-04:00', label: 'UTC-4 (New York DST)' },
    { offset: '-05:00', label: 'UTC-5 (New York)' },
    { offset: '-06:00', label: 'UTC-6 (Chicago)' },
    { offset: '-07:00', label: 'UTC-7 (Los Angeles DST)' },
    { offset: '-08:00', label: 'UTC-8 (Los Angeles)' },
    { offset: '+11:00', label: 'UTC+11 (Sydney DST)' },
    { offset: '+10:00', label: 'UTC+10 (Sydney)' },
  ];
}
