import type { DataProvider } from "@refinedev/core";
import { resultToPromise } from "../utils/resultConverter";
import { getAllTrips, getTripWithRelations, updateTrip, deleteTrip } from "@/lib/db/operations/trips";
import { createActivity, updateActivity, deleteActivity } from "@/lib/db/operations/activities";
import { createHotel, updateHotel, deleteHotel } from "@/lib/db/operations/hotels";
import { updateFlight, deleteFlight } from "@/lib/db/operations/flights";
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/lib/db/operations/restaurants";
import { db } from "@/lib/db/schema";
import type { Trip } from "@/lib/db/models";

/**
 * Resource operation registry for routing Refine requests to database operations
 * 
 * For nested resources (activities, hotels, flights, restaurants), we handle them
 * differently based on meta.tripId to support filtering by parent trip.
 */
interface ResourceOperations {
  getList?: (meta?: any) => Promise<any>;
  getOne?: (id: string) => Promise<any>;
  create?: (data: any) => Promise<any>;
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
  // Nested resources (Phase 6)
  activities: {
    getList: async (meta?: any) => {
      if (meta?.tripId) {
        // Filter by trip ID
        const activities = await db.activities.where('trip_id').equals(meta.tripId).toArray();
        return { ok: true, value: activities };
      }
      // Get all activities (fallback)
      const activities = await db.activities.toArray();
      return { ok: true, value: activities };
    },
    getOne: async (id: string) => {
      const activity = await db.activities.get(id);
      if (!activity) {
        return { ok: false, error: { message: `Activity ${id} not found`, code: 'NOT_FOUND' } };
      }
      return { ok: true, value: activity };
    },
    create: createActivity,
    update: async (data: any) => await updateActivity(data.id, data),
    delete: deleteActivity,
  },
  hotels: {
    getList: async (meta?: any) => {
      if (meta?.tripId) {
        const hotels = await db.hotels.where('trip_id').equals(meta.tripId).toArray();
        return { ok: true, value: hotels };
      }
      const hotels = await db.hotels.toArray();
      return { ok: true, value: hotels };
    },
    getOne: async (id: string) => {
      const hotel = await db.hotels.get(id);
      if (!hotel) {
        return { ok: false, error: { message: `Hotel ${id} not found`, code: 'NOT_FOUND' } };
      }
      return { ok: true, value: hotel };
    },
    create: createHotel,
    update: async (data: any) => await updateHotel(data.id, data),
    delete: deleteHotel,
  },
  flights: {
    getList: async (meta?: any) => {
      if (meta?.tripId) {
        const flights = await db.flights.where('trip_id').equals(meta.tripId).toArray();
        return { ok: true, value: flights };
      }
      const flights = await db.flights.toArray();
      return { ok: true, value: flights };
    },
    getOne: async (id: string) => {
      const flight = await db.flights.get(id);
      if (!flight) {
        return { ok: false, error: { message: `Flight ${id} not found`, code: 'NOT_FOUND' } };
      }
      return { ok: true, value: flight };
    },
    update: async (data: any) => await updateFlight(data.id, data),
    delete: deleteFlight,
  },
  restaurants: {
    getList: async (meta?: any) => {
      if (meta?.tripId) {
        const restaurants = await db.restaurants.where('trip_id').equals(meta.tripId).toArray();
        return { ok: true, value: restaurants };
      }
      const restaurants = await db.restaurants.toArray();
      return { ok: true, value: restaurants };
    },
    getOne: async (id: string) => {
      const restaurant = await db.restaurants.get(id);
      if (!restaurant) {
        return { ok: false, error: { message: `Restaurant ${id} not found`, code: 'NOT_FOUND' } };
      }
      return { ok: true, value: restaurant };
    },
    create: createRestaurant,
    update: async (data: any) => await updateRestaurant(data.id, data),
    delete: deleteRestaurant,
  },
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
    
    // Fetch items from IndexedDB (pass meta for filtering)
    const result = await operations.getList(meta);
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
    const operations = resourceRegistry[resource];
    
    if (!operations?.create) {
      throw new Error(`create not implemented for resource: ${resource}`);
    }
    
    const result = await operations.create(variables as any);
    const item = await resultToPromise(result);
    
    return {
      data: item as any,
    };
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
