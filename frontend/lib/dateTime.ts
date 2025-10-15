/**
 * Date and time formatting utilities with timezone support
 * Feature: Enhanced Trip Data Model & Itinerary Management
 * Refactored: Using date-fns for better maintainability
 */

import { format, parseISO } from 'date-fns';

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
 * Format ISO datetime to time only
 * 
 * @param isoString ISO 8601 datetime with timezone
 * @returns Time string (e.g., "10:30 AM")
 */
export function formatTime(isoString: string): string {
  const date = parseISO(isoString);
  return format(date, "h:mm a");
}

/**
 * Format ISO date string to readable format
 * 
 * @param isoDate ISO 8601 date (YYYY-MM-DD)
 * @returns Formatted date (e.g., "Apr 1, 2025")
 */
export function formatDate(isoDate: string): string {
  const date = parseISO(isoDate + 'T00:00:00');
  return format(date, "MMM d, yyyy");
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
