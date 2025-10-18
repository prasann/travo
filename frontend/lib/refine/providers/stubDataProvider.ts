import type { DataProvider } from "@refinedev/core";

/**
 * Stub data provider for initial Refine setup.
 * Returns rejected promises for all operations.
 * Will be replaced with real implementation in Phase 2.
 */
export const stubDataProvider: DataProvider = {
  getList: async () => {
    return Promise.reject(new Error("Data provider not implemented"));
  },

  getOne: async () => {
    return Promise.reject(new Error("Data provider not implemented"));
  },

  create: async () => {
    return Promise.reject(new Error("Data provider not implemented"));
  },

  update: async () => {
    return Promise.reject(new Error("Data provider not implemented"));
  },

  deleteOne: async () => {
    return Promise.reject(new Error("Data provider not implemented"));
  },

  getApiUrl: () => {
    return "";
  },
};
