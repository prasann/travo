/**
 * Timezone utilities using UTC storage + IANA timezones
 * Times stored as UTC, displayed in specific timezones using date-fns-tz
 */

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/** Common travel destination timezones for dropdown selection */
export const COMMON_TIMEZONES = [
  // Asia/Pacific
  { value: 'Asia/Bangkok', label: 'Bangkok (UTC+7)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (UTC+9)' },
  { value: 'Asia/Seoul', label: 'Seoul (UTC+9)' },
  { value: 'Asia/Singapore', label: 'Singapore/Malaysia (UTC+8)' },
  { value: 'Asia/Dubai', label: 'Dubai (UTC+4)' },
  { value: 'Asia/Kolkata', label: 'India (UTC+5:30)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (UTC+8)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (UTC+7)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10/+11)' },
  { value: 'Pacific/Auckland', label: 'Auckland (UTC+12/+13)' },
  
  // Europe
  { value: 'Europe/London', label: 'London (UTC+0/+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1/+2)' },
  { value: 'Europe/Berlin', label: 'Berlin (UTC+1/+2)' },
  { value: 'Europe/Rome', label: 'Rome (UTC+1/+2)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (UTC+1/+2)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1/+2)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (UTC+3)' },
  { value: 'Europe/Moscow', label: 'Moscow (UTC+3)' },
  
  // Americas
  { value: 'America/New_York', label: 'New York (UTC-5/-4)' },
  { value: 'America/Chicago', label: 'Chicago (UTC-6/-5)' },
  { value: 'America/Denver', label: 'Denver (UTC-7/-6)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-8/-7)' },
  { value: 'America/Toronto', label: 'Toronto (UTC-5/-4)' },
  { value: 'America/Vancouver', label: 'Vancouver (UTC-8/-7)' },
  { value: 'America/Mexico_City', label: 'Mexico City (UTC-6)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (UTC-3)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
  
  // Middle East & Africa
  { value: 'Africa/Cairo', label: 'Cairo (UTC+2)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (UTC+2)' },
] as const;

/** Format UTC time in specific timezone for display */
export function formatTimeInZone(
  utcTime: string | undefined,
  timezone: string | undefined,
  includeDate: boolean = false
): string {
  if (!utcTime || !timezone) {
    return 'N/A';
  }
  
  try {
    const format = includeDate ? 'MMM d, h:mm a' : 'h:mm a';
    return formatInTimeZone(utcTime, timezone, format);
  } catch (error) {
    console.error('Error formatting time in timezone:', error);
    return 'Invalid time';
  }
}

/** Convert local datetime-local input to UTC for storage */
export function localToUTC(
  localValue: string,
  timezone: string
): string {
  if (!localValue || !timezone) {
    return '';
  }
  
  try {
    const date = fromZonedTime(localValue, timezone);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting local time to UTC:', error);
    return '';
  }
}

/** Convert UTC time to local datetime-local format for form inputs */
export function utcToLocal(
  utcTime: string | undefined,
  timezone: string | undefined
): string {
  if (!utcTime || !timezone) {
    return '';
  }
  
  try {
    return formatInTimeZone(utcTime, timezone, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    console.error('Error converting UTC to local:', error);
    return '';
  }
}

/** Get friendly label for timezone (e.g., 'Bangkok (UTC+7)' for 'Asia/Bangkok') */
export function getTimezoneLabel(timezone: string | undefined): string {
  if (!timezone) return '';
  const found = COMMON_TIMEZONES.find(tz => tz.value === timezone);
  return found ? found.label : timezone;
}

/** Get default timezone */
export function getDefaultTimezone(): string {
  return 'Asia/Bangkok';
}
