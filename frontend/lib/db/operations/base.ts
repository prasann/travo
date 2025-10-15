/**
 * Base CRUD Operations for Travo Database
 * 
 * Generic operations that can be reused across all entity types.
 * Reduces code duplication and ensures consistency.
 * 
 * Refactored: 2025-10-15
 */

import { v4 as uuidv4 } from 'uuid';
import { EntityTable } from 'dexie';
import type { Result } from '../models';
import { wrapDatabaseOperation, createNotFoundError } from '../errors';
import { addToQueue, type SyncEntityType } from '@/lib/sync/SyncQueue';

/**
 * Base entity interface - all entities must have these fields
 */
interface BaseEntity {
  id: string;
  trip_id: string;
  updated_at: string;
  updated_by: string;
}

/**
 * Get all entities for a trip with custom sorting
 * 
 * @param table Dexie table to query
 * @param tripId Trip ID to filter by
 * @param sortFn Optional custom sort function
 * @returns Result with array of entities
 */
export async function getByTripId<T extends BaseEntity>(
  table: EntityTable<T, 'id'>,
  tripId: string,
  sortFn?: (a: T, b: T) => number
): Promise<Result<T[]>> {
  return wrapDatabaseOperation(async () => {
    const entities = await table
      .where('trip_id')
      .equals(tripId)
      .toArray();
    
    if (sortFn) {
      entities.sort(sortFn);
    }
    
    return entities;
  });
}

/**
 * Create a new entity
 * 
 * @param table Dexie table to insert into
 * @param entityType Entity type for sync queue
 * @param input Input data (without id, updated_at, updated_by)
 * @param userEmail User's email for updated_by tracking
 * @returns Result with created entity
 */
export async function createEntity<T extends BaseEntity, TInput>(
  table: EntityTable<T, 'id'>,
  entityType: SyncEntityType,
  input: TInput & { trip_id: string },
  userEmail?: string
): Promise<Result<T>> {
  return wrapDatabaseOperation(async () => {
    const now = new Date().toISOString();
    const entity = {
      ...input,
      id: uuidv4(),
      updated_at: now,
      updated_by: userEmail || 'local'
    } as unknown as T;
    
    await table.add(entity);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: entityType,
      entity_id: entity.id,
      operation: 'create',
      data: entity,
      trip_id: entity.trip_id
    });
    
    console.log(`[DB] ${entityType} created and queued for sync: ${entity.id}`);
    
    return entity;
  });
}

/**
 * Update an existing entity
 * 
 * @param table Dexie table to update
 * @param entityType Entity type for sync queue
 * @param entityName Human-readable entity name for error messages
 * @param id Entity ID to update
 * @param updates Partial updates (without id, trip_id, updated_at)
 * @param userEmail User's email for updated_by tracking
 * @returns Result with updated entity
 */
export async function updateEntity<T extends BaseEntity>(
  table: EntityTable<T, 'id'>,
  entityType: SyncEntityType,
  entityName: string,
  id: string,
  updates: Partial<Omit<T, 'id' | 'trip_id' | 'updated_at'>>,
  userEmail?: string
): Promise<Result<T>> {
  return wrapDatabaseOperation(async () => {
    const entity = await table.get(id as any);
    
    if (!entity) {
      throw createNotFoundError(entityName, id);
    }
    
    const now = new Date().toISOString();
    const updatedEntity: T = {
      ...entity,
      ...updates,
      updated_at: now,
      ...(userEmail && { updated_by: userEmail })
    } as T;
    
    await table.put(updatedEntity);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: entityType,
      entity_id: id,
      operation: 'update',
      data: updatedEntity,
      trip_id: updatedEntity.trip_id
    });
    
    console.log(`[DB] ${entityType} updated and queued for sync: ${id}`);
    
    return updatedEntity;
  });
}

/**
 * Delete an entity by ID
 * 
 * @param table Dexie table to delete from
 * @param entityType Entity type for sync queue
 * @param entityName Human-readable entity name for error messages
 * @param id Entity ID to delete
 * @returns Result with void
 */
export async function deleteEntity<T extends BaseEntity>(
  table: EntityTable<T, 'id'>,
  entityType: SyncEntityType,
  entityName: string,
  id: string
): Promise<Result<void>> {
  return wrapDatabaseOperation(async () => {
    const entity = await table.get(id as any);
    
    if (!entity) {
      throw createNotFoundError(entityName, id);
    }
    
    await table.delete(id as any);
    
    // Queue for sync to Firestore
    await addToQueue({
      entity_type: entityType,
      entity_id: id,
      operation: 'delete',
      trip_id: entity.trip_id
    });
    
    console.log(`[DB] ${entityType} deleted and queued for sync: ${id}`);
  });
}
