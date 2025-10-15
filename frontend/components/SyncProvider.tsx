"use client";

/**
 * SyncProvider
 * Wraps application to provide realtime status of push sync queue and trigger automatic processing.
 * Phase 4 Integration: Automatic push sync UI + background processing.
 * Refactored: Using React Query for automatic background syncing.
 */

import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { isEmailAllowed, isAllowlistConfigured } from '@/lib/auth/allowlist';
import { 
  getPendingCount, 
  getFailedEntries, 
  getQueuedEntries 
} from '@/lib/db';
import { triggerSync } from '@/lib/db';

interface SyncContextValue {
  pending: number;
  failed: number;
  isSyncing: boolean;
  lastRun: string | null;
  lastResult: { success: number; failed: number; total: number } | null;
  syncNow: () => Promise<void>;
  refreshQueueSnapshot: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000; // 30 seconds

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      staleTime: 10_000, // Consider data stale after 10 seconds
    },
  },
});

/**
 * Internal sync provider that uses React Query
 */
const SyncProviderInternal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userEmail = user?.email || null;
  const queryClient = useQueryClient();

  // SECURITY: Check if user is authorized before enabling sync
  const isUserAuthorized = userEmail && (!isAllowlistConfigured() || isEmailAllowed(userEmail));

  // Query for queue snapshot (pending and failed counts)
  const { data: queueSnapshot } = useQuery({
    queryKey: ['syncQueue', userEmail],
    queryFn: async () => {
      const [pending, failedEntries] = await Promise.all([
        getPendingCount(),
        getFailedEntries(),
      ]);
      return { pending, failed: failedEntries.length };
    },
    enabled: !!userEmail && !!isUserAuthorized,
    refetchInterval: POLL_INTERVAL_MS,
  });

  // Query for last sync result
  const { data: syncResult } = useQuery({
    queryKey: ['syncResult', userEmail],
    queryFn: () => null as { success: number; failed: number; total: number; timestamp: string } | null,
    enabled: false, // Only updated via mutation
  });

  // Mutation for triggering sync
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error('User not authenticated');
      if (!isUserAuthorized) throw new Error('User not authorized');
      const result = await triggerSync(userEmail);
      return result;
    },
    onSuccess: (result) => {
      if (result) {
        // Update sync result in cache
        queryClient.setQueryData(['syncResult', userEmail], {
          ...result,
          timestamp: new Date().toISOString(),
        });
        // Refresh queue snapshot
        queryClient.invalidateQueries({ queryKey: ['syncQueue', userEmail] });
      }
    },
    onError: (error) => {
      console.error('[SyncProvider] Sync error', error);
    },
  });

  // Auto-trigger sync when new items are added to queue
  useEffect(() => {
    if (!userEmail || !isUserAuthorized || !queueSnapshot) return;
    
    // If there are pending items and we're not currently syncing, trigger sync
    if (queueSnapshot.pending > 0 && !syncMutation.isPending) {
      syncMutation.mutate();
    }
  }, [queueSnapshot?.pending, userEmail, isUserAuthorized]);

  const refreshQueueSnapshot = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['syncQueue', userEmail] });
  }, [queryClient, userEmail]);

  const syncNow = useCallback(async () => {
    syncMutation.mutate();
  }, [syncMutation]);

  const value: SyncContextValue = {
    pending: queueSnapshot?.pending || 0,
    failed: queueSnapshot?.failed || 0,
    isSyncing: syncMutation.isPending,
    lastRun: syncResult?.timestamp || null,
    lastResult: syncResult ? {
      success: syncResult.success,
      failed: syncResult.failed,
      total: syncResult.total,
    } : null,
    syncNow,
    refreshQueueSnapshot,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

/**
 * SyncProvider - Wraps children with QueryClientProvider and sync logic
 */
export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SyncProviderInternal>{children}</SyncProviderInternal>
    </QueryClientProvider>
  );
};

export function useSyncStatus(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncStatus must be used within SyncProvider');
  return ctx;
}
