/**
 * Refine Notification Provider for DaisyUI
 * 
 * Phase 8: Notification Provider Integration
 * 
 * Provides toast notifications using DaisyUI's alert component system.
 */

import type { NotificationProvider } from "@refinedev/core";

// Track active notifications
const activeNotifications = new Map<string | number, HTMLElement>();

/**
 * Create and display a toast notification
 */
function createToast(
  message: string,
  type: "success" | "error" | "info" | "warning",
  description?: string,
  key?: string | number
): void {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast toast-end toast-top z-50';
    document.body.appendChild(container);
  }

  // Create alert element
  const alert = document.createElement('div');
  const alertClass = type === "error" ? "alert-error" : 
                     type === "success" ? "alert-success" :
                     type === "warning" ? "alert-warning" : "alert-info";
  
  alert.className = `alert ${alertClass} shadow-lg`;
  
  // Add icon based on type
  const icon = type === "success" ? "✓" :
               type === "error" ? "✕" :
               type === "warning" ? "⚠" : "ℹ";
  
  alert.innerHTML = `
    <div>
      <span class="font-bold">${icon} ${message}</span>
      ${description ? `<div class="text-sm mt-1">${description}</div>` : ''}
    </div>
  `;

  container.appendChild(alert);

  // Store reference if key provided
  if (key !== undefined) {
    activeNotifications.set(key, alert);
  }

  // Auto-dismiss after 4 seconds
  setTimeout(() => {
    alert.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => {
      alert.remove();
      if (key !== undefined) {
        activeNotifications.delete(key);
      }
      // Remove container if empty
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}

export const notificationProvider: NotificationProvider = {
  /**
   * Open/show a notification
   */
  open: ({ message, type, description, key, undoableTimeout }) => {
    // Map Refine's "progress" type to "info"
    const mappedType = type === "progress" ? "info" : type || "info";
    
    createToast(
      message,
      mappedType as "success" | "error" | "info" | "warning",
      description,
      key
    );
  },

  /**
   * Close a specific notification by key
   */
  close: (key) => {
    const notification = activeNotifications.get(key);
    if (notification) {
      notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => {
        notification.remove();
        activeNotifications.delete(key);
      }, 300);
    }
  },
};
