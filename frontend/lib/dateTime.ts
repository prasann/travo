/** Date and time formatting utilities with timezone support */

import { format, parseISO } from 'date-fns';
import { formatTimeInZone } from './timezoneUtils';

/** Format ISO datetime string to readable format */
export function formatDateTime(
  isoString: string,
  formatString: string = "MMM d, h:mm a"
): string {
  const date = parseISO(isoString);
  return format(date, formatString);
}

/** Format UTC time in specific timezone for display */
export function formatTimeWithTz(
  utcTime: string | undefined,
  timezone: string | undefined,
  includeDate: boolean = false
): string {
  return formatTimeInZone(utcTime, timezone, includeDate);
}

/** Format ISO date to human-readable format */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

/** Format ISO date to long format */
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

/** Format ISO date for day navigation buttons */
export function formatDayButton(isoDate: string): string {
  const date = parseISO(isoDate + 'T00:00:00');
  return format(date, "MMM d");
}
