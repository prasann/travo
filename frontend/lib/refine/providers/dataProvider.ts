import type { DataProvider } from "@refinedev/core";
import { resultToPromise } from "../utils/resultConverter";
import { getAllTrips, getTripWithRelations, updateTrip, deleteTrip } from "@/lib/db/operations/trips";
import type { Trip } from "@/lib/db/models";

/**
 * Resource operation registry for routing Refine requests to database operations
 */
interface ResourceOperations {
  getList?: () => Promise<any>;
  getOne?: (id: string) => Promise<any>;
  update?: (data: any) => Promise<any>;
  delete?: (id: string) => Promise<any>;
}

const resourceRegistry: Record<string, ResourceOperations> = {
  trips: {
    getList: getAllTrips,
    getOne: getTripWithRelations,
    update: updateTrip,
    delete: deleteTrip,
  },
  // Other resources will be added in Phase 6
  // activities: { ... },
  // hotels: { ... },
  // flights: { ... },
  // restaurants: { ... },
};

/**
 * Custom data provider that bridges Refine's DataProvider interface
 * with our IndexedDB operations (via Dexie.js).
 * 
 * This adapter converts between:
 * - Refine's Promise<T> → Our Result<T> pattern
 * - Refine's resource/id model → Our database operations
 * - Refine's pagination → Our in-memory slicing (IndexedDB returns all)
 */
export const dataProvider: DataProvider = {
  /**
   * Get a list of resources with pagination, sorting, and filtering
   */
  getList: async ({ resource, pagination, sorters, filters, meta }) => {
    const operations = resourceRegistry[resource];
    
    if (!operations?.getList) {
      throw new Error(`getList not implemented for resource: ${resource}`);
    }
    
    // Fetch all items from IndexedDB
    const result = await operations.getList();
    const items = await resultToPromise(result);
    
    // Apply sorting if specified
    const sorted = [...(items as any[])];
    if (sorters && sorters.length > 0) {
      const sorter = sorters[0]; // Use first sorter
      sorted.sort((a, b) => {
        const aVal = (a as any)[sorter.field];
        const bVal = (b as any)[sorter.field];
        
        if (sorter.order === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }
    
    // Apply pagination (slice in-memory since IndexedDB returns all)
    const current = (pagination as any)?.current ?? 1;
    const pageSize = (pagination as any)?.pageSize ?? 10;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    const paginated = sorted.slice(start, end);
    
    return {
      data: paginated as any,
      total: sorted.length,
    };
  },

  /**
   * Get a single resource by ID
   */
  getOne: async ({ resource, id, meta }) => {
    const operations = resourceRegistry[resource];
    
    if (!operations?.getOne) {
      throw new Error(`getOne not implemented for resource: ${resource}`);
    }
    
    const result = await operations.getOne(id as string);
    const item = await resultToPromise(result);
    
    return {
      data: item as any,
    };
  },

  /**
   * Create a new resource
   */
  create: async ({ resource, variables, meta }) => {
    throw new Error(`create not implemented for resource: ${resource}`);
  },

  /**
   * Update an existing resource
   */
  update: async ({ resource, id, variables, meta }) => {
    const operations = resourceRegistry[resource];
    
    if (!operations?.update) {
      throw new Error(`update not implemented for resource: ${resource}`);
    }
    
    const result = await operations.update({
      id: id as string,
      ...variables,
    } as any);
    const item = await resultToPromise(result);
    
    return {
      data: item as any,
    };
  },

  /**
   * Delete a resource
   */
  deleteOne: async ({ resource, id, meta }) => {
    const operations = resourceRegistry[resource];
    
    if (!operations?.delete) {
      throw new Error(`deleteOne not implemented for resource: ${resource}`);
    }
    
    const result = await operations.delete(id as string);
    await resultToPromise(result);
    
    return {
      data: {} as any,
    };
  },

  /**
   * Get the API URL (not applicable for IndexedDB, returns empty string)
   */
  getApiUrl: () => {
    return "";
  },
};
