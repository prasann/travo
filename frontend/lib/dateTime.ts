/**
 * Date and time formatting utilities with timezone support
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

/**
 * Format ISO datetime string with timezone to readable format
 * 
 * @param isoString ISO 8601 datetime with timezone (e.g., "2025-04-01T10:30:00-07:00")
 * @param options Intl.DateTimeFormat options
 * @returns Formatted date/time string
 */
export function formatDateTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }
): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Format ISO datetime to time only with timezone
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Time string (e.g., "10:30 AM PST")
 */
export function formatTime(isoString: string): string {
  return formatDateTime(isoString, {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Format ISO date string to readable format
 * 
 * @param isoDate ISO 8601 date (YYYY-MM-DD)
 * @returns Formatted date (e.g., "Apr 1, 2025")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
