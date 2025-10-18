import type { AuthProvider } from "@refinedev/core";

/**
 * Stub auth provider for initial Refine setup.
 * Returns rejected promises or default values.
 * Will be replaced with Firebase Auth integration in Phase 7.
 */
export const stubAuthProvider: AuthProvider = {
  login: async () => {
    return Promise.reject(new Error("Auth provider not implemented"));
  },

  logout: async () => {
    return Promise.reject(new Error("Auth provider not implemented"));
  },

  check: async () => {
    return { authenticated: true }; // Allow access for now
  },

  getPermissions: async () => {
    return null;
  },

  getIdentity: async () => {
    return null;
  },

  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
