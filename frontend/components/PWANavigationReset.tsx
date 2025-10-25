'use client';

import { usePWANavigationReset } from '@/hooks/usePWANavigationReset';

/**
 * Component wrapper for PWA navigation reset hook
 * Must be a Client Component to use hooks and Next.js router
 */
export function PWANavigationReset() {
  usePWANavigationReset();
  return null;
}
