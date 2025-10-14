/**
 * Sync Queue for managing pending changes to Firestore
 * 
 * Phase 4.1: Push Sync - Sync Queue
 * Feature: firebase-integration
 * Date: 2025-10-14
 */

import { db } from '../db/schema';
import type { SyncQueueEntry } from '../db/models';

// Re-export types for convenience
export type { SyncQueueEntry, SyncOperationType, SyncEntityType } from '../db/models';

/**
 * Add an operation to the sync queue
 * 
 * @param entry - Sync queue entry to add
 * @returns Promise that resolves when entry is added
 */
export async function addToQueue(entry: Omit<SyncQueueEntry, 'id' | 'created_at' | 'retries'>): Promise<void> {
  const queueEntry: SyncQueueEntry = {
    ...entry,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    retries: 0,
  };

  await db.syncQueue.add(queueEntry);
  console.log('📝 Added to sync queue:', queueEntry.operation, queueEntry.entity_type, queueEntry.entity_id);
}

/**
 * Get all pending entries in the sync queue
 * Sorted by created_at ascending (oldest first)
 * 
 * @returns Promise with array of pending sync entries
 */
export async function getQueuedEntries(): Promise<SyncQueueEntry[]> {
  const entries = await db.syncQueue.toArray();
  
  // Sort by created_at ascending (process oldest first)
  entries.sort((a: SyncQueueEntry, b: SyncQueueEntry) => a.created_at.localeCompare(b.created_at));
  
  return entries;
}

/**
 * Remove an entry from the sync queue after successful sync
 * 
 * @param id - Queue entry ID to remove
 * @returns Promise that resolves when entry is removed
 */
export async function removeFromQueue(id: string): Promise<void> {
  await db.syncQueue.delete(id);
  console.log('✅ Removed from sync queue:', id);
}

/**
 * Update retry count for a failed sync attempt
 * 
 * @param id - Queue entry ID
 * @param error - Error message
 * @returns Promise that resolves when entry is updated
 */
export async function incrementRetry(id: string, error: string): Promise<void> {
  const entry = await db.syncQueue.get(id);
  if (!entry) return;

  await db.syncQueue.update(id, {
    retries: entry.retries + 1,
    last_error: error,
  });
  
  console.warn('⚠️ Sync retry incremented:', id, 'retries:', entry.retries + 1);
}

/**
 * Get count of pending entries in sync queue
 * 
 * @returns Promise with count of pending entries
 */
export async function getPendingCount(): Promise<number> {
  return await db.syncQueue.count();
}

/**
 * Clear all entries from sync queue (for testing/debugging)
 * ⚠️ Use with caution - this will lose all pending changes
 * 
 * @returns Promise that resolves when queue is cleared
 */
export async function clearQueue(): Promise<void> {
  await db.syncQueue.clear();
  console.warn('🗑️ Sync queue cleared (all pending changes lost)');
}

/**
 * Get entries that have failed multiple times
 * These might need manual intervention
 * 
 * @param maxRetries - Threshold for considering an entry failed (default: 3)
 * @returns Promise with array of failed entries
 */
export async function getFailedEntries(maxRetries: number = 3): Promise<SyncQueueEntry[]> {
  const entries = await db.syncQueue
    .filter((entry: SyncQueueEntry) => entry.retries >= maxRetries)
    .toArray();
  
  return entries;
}
