'use client';

import { HomePageRefine } from '@/components/HomePageRefine';

/**
 * Homepage - displays list of all trips
 * 
 * Phase 3: Migrated to Refine's useList hook
 * - Removed ~40 lines of manual state management
 * - Automatic loading/error states
 * - Built-in caching and refetch logic
 * - Request deduplication
 */
export default function HomePage() {
  return <HomePageRefine />;
}
