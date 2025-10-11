import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
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
  if ('start_time' in item && item.start_time) {
    return new Date(item.start_time);
  }
  return null;
}

/**
 * Sort timeline items chronologically
 * 
 * Priority:
 * 1. Items with timestamps (sorted by time)
 * 2. Items without timestamps (sorted by order_index if available)
 * 
 * @param items Array of Flight, Hotel, or DailyActivity items
 * @returns Sorted array in chronological order
 */
export function sortChronologically(items: TimelineItem[]): TimelineItem[] {
  return [...items].sort((a, b) => {
    const timeA = getTimestamp(a);
    const timeB = getTimestamp(b);
    
    // Both have timestamps: sort by time
    if (timeA && timeB) {
      const diff = timeA.getTime() - timeB.getTime();
      
      // Same timestamp: use order_index for activities
      if (diff === 0 && 'order_index' in a && 'order_index' in b) {
        return a.order_index - b.order_index;
      }
      
      return diff;
    }
    
    // Items without timestamps go last, sorted by order_index if available
    if (!timeA && !timeB && 'order_index' in a && 'order_index' in b) {
      return a.order_index - b.order_index;
    }
    
    return timeA ? -1 : 1;
  });
}