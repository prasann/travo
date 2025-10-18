import type { NotificationProvider } from "@refinedev/core";

/**
 * Stub notification provider for initial Refine setup.
 * Logs to console instead of showing UI notifications.
 * Will be replaced with DaisyUI toast integration in Phase 8.
 */
export const stubNotificationProvider: NotificationProvider = {
  open: ({ message, type, description }) => {
    console.log(`[${type?.toUpperCase()}] ${message}`, description || "");
  },

  close: () => {
    // No-op for stub
  },
};
