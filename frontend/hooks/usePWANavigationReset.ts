'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Hook to reset navigation to home when PWA is opened from launcher
 * 
 * This prevents the page stack from growing when users:
 * 1. Navigate deep into the app (e.g., /trip/123/activities)
 * 2. Close the app (it stays in background)
 * 3. Reopen from launcher - without this, it resumes at /trip/123/activities
 * 
 * The hook detects PWA launches via:
 * - display-mode: standalone (PWA installed)
 * - source=pwa query param (from manifest.json start_url)
 */
export function usePWANavigationReset() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isPWA = isStandalone || isIOSStandalone;

    if (!isPWA) return;

    // Check if this is a fresh launch from the launcher
    const urlParams = new URLSearchParams(window.location.search);
    const isLauncherOpen = urlParams.has('source') && urlParams.get('source') === 'pwa';

    // Reset to home if:
    // 1. Launched from PWA launcher (has source=pwa param)
    // 2. Not already on home page
    if (isLauncherOpen && pathname !== '/') {
      console.log('[PWA] Detected launcher open, resetting to home');
      // Replace current history entry to avoid back button issues
      router.replace('/');
    }

    // Clean up the source param after first check
    if (isLauncherOpen) {
      // Remove the query param from URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete('source');
      window.history.replaceState({}, '', url.toString());
    }
  }, [pathname, router]);
}
