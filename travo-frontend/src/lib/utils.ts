import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Trip, Place } from "@/types"

/**
 * Utility to merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date string for display
 * @param dateString ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (e.g., "Apr 1, 2025")
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T00:00:00.000Z') // Treat as UTC to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    console.warn('Invalid date string:', dateString)
    return dateString
  }
}

/**
 * Format a date range for display
 * @param startDate ISO date string
 * @param endDate ISO date string
 * @returns Formatted date range (e.g., "Apr 1-7, 2025" or "Apr 1 - May 2, 2025")
 */
export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate + 'T00:00:00.000Z')
    const end = new Date(endDate + 'T00:00:00.000Z')
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
    const startDay = start.getDate()
    const endDay = end.getDate()
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()
    
    // Same month and year
    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`
    }
    
    // Same year, different months
    if (startYear === endYear) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`
    }
    
    // Different years
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`
  } catch (error) {
    console.warn('Invalid date range:', startDate, endDate)
    return `${startDate} - ${endDate}`
  }
}

/**
 * Calculate the number of days in a trip
 * @param startDate ISO date string
 * @param endDate ISO date string  
 * @returns Number of days (inclusive)
 */
export function getTripDuration(startDate: string, endDate: string): number {
  try {
    const start = new Date(startDate + 'T00:00:00.000Z')
    const end = new Date(endDate + 'T00:00:00.000Z')
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Inclusive of both start and end dates
  } catch (error) {
    console.warn('Invalid date range for duration:', startDate, endDate)
    return 1
  }
}

/**
 * Sort trips by start date (chronological order)
 * @param trips Array of Trip objects
 * @returns Sorted array of trips
 */
export function sortTripsByDate(trips: Trip[]): Trip[] {
  return [...trips].sort((a, b) => {
    const dateA = new Date(a.start_date + 'T00:00:00.000Z')
    const dateB = new Date(b.start_date + 'T00:00:00.000Z')
    return dateA.getTime() - dateB.getTime()
  })
}

/**
 * Sort places by order index
 * @param places Array of Place objects
 * @returns Sorted array of places
 */
export function sortPlacesByOrder(places: Place[]): Place[] {
  return [...places].sort((a, b) => a.order_index - b.order_index)
}

/**
 * Get the count of places in a trip
 * @param trip Trip object
 * @returns Number of places
 */
export function getPlaceCount(trip: Trip): number {
  return trip.places ? trip.places.length : 0
}

/**
 * Truncate text to a specified length with ellipsis
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Format Plus Code for display (adds spacing for readability)
 * @param plusCode 8-character Plus Code
 * @returns Formatted Plus Code (e.g., "8Q7X QXXR+33")
 */
export function formatPlusCode(plusCode: string): string {
  if (plusCode.length === 8) {
    return `${plusCode.slice(0, 4)} ${plusCode.slice(4)}`
  }
  return plusCode
}

/**
 * Create a Google Maps URL from a Plus Code
 * @param plusCode 8-character Plus Code
 * @returns Google Maps URL
 */
export function createMapsUrl(plusCode: string): string {
  return `https://plus.codes/${plusCode}`
}

/**
 * Check if a trip is in the past, present, or future
 * @param trip Trip object
 * @returns 'past' | 'current' | 'future'
 */
export function getTripStatus(trip: Trip): 'past' | 'current' | 'future' {
  const today = new Date()
  const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD format
  
  if (trip.end_date < todayString) return 'past'
  if (trip.start_date <= todayString && trip.end_date >= todayString) return 'current'
  return 'future'
}

/**
 * Debounce function for search/input delays
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}