/**
 * Date and time formatting utilities with timezone support
 * Feature: Enhanced Trip Data Model & Itinerary Management
 * Refactored: Using date-fns for better maintainability
 * Updated: 2025-10-21 - Added timezone display support
 */

import { format, parseISO } from 'date-fns';
import { formatTimeWithTimezone, getTimezoneAbbreviation } from './timezoneUtils';

/**
 * Format ISO datetime string with timezone to readable format
 * 
 * @param isoString ISO 8601 datetime with timezone (e.g., "2025-04-01T10:30:00-07:00")
 * @param formatString Optional date-fns format string (defaults to "MMM d, h:mm a")
 * @returns Formatted date/time string
 */
export function formatDateTime(
  isoString: string,
  formatString: string = "MMM d, h:mm a"
): string {
  const date = parseISO(isoString);
  return format(date, formatString);
}

/**
 * Format ISO datetime to time only (without timezone)
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Time string (e.g., "10:30 AM")
 * 
 * @deprecated Use formatTimeWithTimezone() for better timezone clarity
 */
export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, "h:mm a");
}

/**
 * Format ISO datetime to time with timezone abbreviation
 * Recommended for displaying flight/hotel times
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @param includeDate Whether to include date in output
 * @returns Time string with timezone (e.g., "10:30 AM UTC-7")
 * 
 * @example
 * formatTimeWithTz("2025-04-01T11:00:00-07:00")
 * // => "11:00 AM UTC-7"
 * 
 * formatTimeWithTz("2025-04-02T14:30:00+09:00", true)
 * // => "Apr 2, 2:30 PM UTC+9"
 */
export function formatTimeWithTz(
  isoString: string,
  includeDate: boolean = false
): string {
  return formatTimeWithTimezone(isoString, includeDate);
}

/**
 * Get just the timezone abbreviation from ISO string
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Timezone abbreviation (e.g., "UTC-7", "UTC+9")
 */
export function getTimezone(isoString: string): string {
  return getTimezoneAbbreviation(isoString);
}

/**
 * Format ISO date string to human-readable format
 * Example: "2025-10-12" => "Oct 12, 2025"
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Format ISO date string to long format
 * Example: "2025-10-12" => "Saturday, October 12, 2025"
 */
export function formatDateLong(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/**
 * Format ISO date for day navigation buttons
 * 
 * @param isoDate ISO 8601 date (YYYY-MM-DD)
 * @returns Short format (e.g., "Apr 1")
 */
export function formatDayButton(isoDate: string): string {
  const date = parseISO(isoDate + 'T00:00:00');
  return format(date, "MMM d");
}
