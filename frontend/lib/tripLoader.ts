/**
 * Trip data loading utilities
 * Feature: Enhanced Trip Data Model & Itinerary Management
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { Trip, TripIndexFile } from '@/types';

/**
 * Load trip index for list view
 * 
 * @returns Promise resolving to trip index file structure
 * @throws Error if file read fails or JSON is invalid
 */
export async function loadTripIndex(): Promise<TripIndexFile> {
  const filePath = path.join(process.cwd(), 'data', 'trip-index.json');
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}

/**
 * Load individual trip by ID
 * 
 * @param tripId Trip UUID to load
 * @returns Promise resolving to full trip data
 * @throws Error if file read fails or JSON is invalid
 */
export async function loadTrip(tripId: string): Promise<Trip> {
  const filePath = path.join(process.cwd(), 'data', 'trips', `${tripId}.json`);
  const fileContents = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
}
