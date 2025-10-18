import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { orderBy } from "lodash"
import type { Flight, Hotel, DailyActivity, TimelineItem } from '@/types'

/**
 * Utility to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract timestamp from timeline item for sorting
 * 
 * @param item Timeline item (Flight, Hotel, or DailyActivity)
 * @returns Date object or null if no timestamp available
 */
export function getTimestamp(item: TimelineItem): Date | null {
  if ('departure_time' in item && item.departure_time) {
    return new Date(item.departure_time);
  }
  if ('check_in_time' in item && item.check_in_time) {
    return new Date(item.check_in_time);
  }
  if ('date' in item && item.date) {
    return new Date(item.date);
  }
  return null;
}

/**
 * Extract date string from timeline item
 * 
 * @param item Timeline item (Flight, Hotel, or DailyActivity)
 * @returns ISO date string (YYYY-MM-DD) or null if no date available
 */
export function getItemDate(item: TimelineItem): string | null {
  if ('departure_time' in item && item.departure_time) {
    return item.departure_time.split('T')[0];
  }
  if ('check_in_time' in item && item.check_in_time) {
    return item.check_in_time.split('T')[0];
  }
  if ('date' in item && item.date) {
    return item.date;
  }
  return null;
}

/**
 * Get sort key for timeline item (timestamp milliseconds or Infinity for items without timestamps)
 * 
 * @param item Timeline item
 * @returns Milliseconds since epoch or Infinity
 */
function getSortKey(item: TimelineItem): number {
  const timestamp = getTimestamp(item);
  return timestamp ? timestamp.getTime() : Infinity;
}

/**
 * Get secondary sort key (order_index) for timeline items
 * 
 * @param item Timeline item
 * @returns order_index if available, otherwise 0
 */
function getOrderIndex(item: TimelineItem): number {
  return 'order_index' in item ? item.order_index : 0;
}

/**
 * Sort timeline items chronologically using lodash orderBy
 * 
 * Priority:
 * 1. Items with timestamps (sorted by time)
 * 2. Items without timestamps (sorted by order_index if available)
 * 
 * @param items Array of Flight, Hotel, or DailyActivity items
 * @returns Sorted array in chronological order
 */
export function sortChronologically(items: TimelineItem[]): TimelineItem[] {
  return orderBy(items, [getSortKey, getOrderIndex], ['asc', 'asc']);
}