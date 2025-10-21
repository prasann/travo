"use client";

/**
 * SyncProvider
 * Manages bidirectional sync between IndexedDB and Firestore.
 * 
 * Push Sync (Local → Cloud):
 * - Monitors sync queue for changes
 * - Automatically pushes changes to Firestore
 * - Polls queue every 30 seconds
 * 
 * Pull Sync (Cloud → Local):
 * - Real-time Firestore listener (onSnapshot)
 * - Automatically receives changes from cloud
 * - Zero polling, instant updates
 * - Works offline (queues updates until reconnected)
 * - Manual pull-to-refresh available
 */

import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { isEmailAllowed, isAllowlistConfigured } from '@/lib/auth/allowlist';
import { 
  getPendingCount, 
  getFailedEntries, 
  getQueuedEntries 
} from '@/lib/db';
import { triggerSync } from '@/lib/db';
import { syncTripsFromFirestore, saveRealtimeUpdates } from '@/lib/firebase/sync';
import { setupTripsListener } from '@/lib/firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';

interface SyncContextValue {
  pending: number;
  failed: number;
  isSyncing: boolean;
  lastPushSync: string | null;
  lastPushResult: { success: number; failed: number; total: number } | null;
  lastPullSync: string | null;
  isPulling: boolean;
  syncNow: () => Promise<void>;
  pullNow: () => Promise<void>;
  refreshQueueSnapshot: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

const POLL_INTERVAL_MS = 30_000; // 30 seconds (for push sync queue monitoring)

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
  const { user, isOffline } = useAuth();
  const isNetworkOnline = useNetworkStatus();
  const userEmail = user?.email || null;
  const queryClient = useQueryClient();

  // SECURITY: Check if user is authorized before enabling sync
  const isUserAuthorized = userEmail && (!isAllowlistConfigured() || isEmailAllowed(userEmail));
  
  // Check if we can perform online operations (pull sync from Firestore)
  const canSyncOnline = isUserAuthorized && isNetworkOnline && !isOffline;

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

  // Query for last push sync result
  const { data: pushSyncResult } = useQuery({
    queryKey: ['pushSyncResult', userEmail],
    queryFn: () => null as { success: number; failed: number; total: number; timestamp: string } | null,
    enabled: false, // Only updated via mutation
  });

  // Query for last pull sync timestamp
  const { data: pullSyncTimestamp } = useQuery({
    queryKey: ['pullSyncTimestamp', userEmail],
    queryFn: () => null as string | null,
    enabled: false, // Only updated via mutation
  });

  // Mutation for triggering push sync
  const pushSyncMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error('User not authenticated');
      if (!isUserAuthorized) throw new Error('User not authorized');
      const result = await triggerSync(userEmail);
      return result;
    },
    onSuccess: (result) => {
      if (result) {
        // Update push sync result in cache
        queryClient.setQueryData(['pushSyncResult', userEmail], {
          ...result,
          timestamp: new Date().toISOString(),
        });
        // Refresh queue snapshot
        queryClient.invalidateQueries({ queryKey: ['syncQueue', userEmail] });
      }
    },
    onError: (error) => {
      console.error('[SyncProvider] Push sync error', error);
    },
  });

  // Mutation for triggering pull sync
  const pullSyncMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) throw new Error('User not authenticated');
      if (!isUserAuthorized) throw new Error('User not authorized');
      console.log('[SyncProvider] Starting pull sync from Firestore...');
      const result = await syncTripsFromFirestore(userEmail);
      return result;
    },
    onSuccess: (result) => {
      // Update pull sync timestamp
      queryClient.setQueryData(['pullSyncTimestamp', userEmail], new Date().toISOString());
      
      // Invalidate all trip-related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
      
      console.log('[SyncProvider] Pull sync completed successfully');
    },
    onError: (error) => {
      console.error('[SyncProvider] Pull sync error', error);
    },
  });

  // Auto-trigger push sync when new items are added to queue
  useEffect(() => {
    if (!userEmail || !isUserAuthorized || !queueSnapshot) return;
    
    // If there are pending items and we're not currently syncing, trigger push sync
    if (queueSnapshot.pending > 0 && !pushSyncMutation.isPending) {
      pushSyncMutation.mutate();
    }
  }, [queueSnapshot?.pending, userEmail, isUserAuthorized]);

  // Real-time listener for Firestore changes (replaces polling)
  useEffect(() => {
    if (!canSyncOnline || !userEmail) return;

    console.log('[SyncProvider] Setting up real-time Firestore listener...');
    
    // Set up listener with callback to save updates
    const unsubscribe = setupTripsListener(userEmail, async (trips) => {
      console.log(`[SyncProvider] Real-time update received: ${trips.length} trips changed`);
      
      // Save to IndexedDB
      await saveRealtimeUpdates(trips);
      
      // Update pull sync timestamp
      queryClient.setQueryData(['pullSyncTimestamp', userEmail], new Date().toISOString());
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['trip'] });
    });

    // Cleanup: unsubscribe when component unmounts or user changes
    return () => {
      console.log('[SyncProvider] Cleaning up real-time listener...');
      unsubscribe();
    };
  }, [canSyncOnline, userEmail, queryClient]);

  const refreshQueueSnapshot = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['syncQueue', userEmail] });
  }, [queryClient, userEmail]);

  const syncNow = useCallback(async () => {
    pushSyncMutation.mutate();
  }, [pushSyncMutation]);

  const pullNow = useCallback(async () => {
    pullSyncMutation.mutate();
  }, [pullSyncMutation]);

  const value: SyncContextValue = {
    pending: queueSnapshot?.pending || 0,
    failed: queueSnapshot?.failed || 0,
    isSyncing: pushSyncMutation.isPending,
    lastPushSync: pushSyncResult?.timestamp || null,
    lastPushResult: pushSyncResult ? {
      success: pushSyncResult.success,
      failed: pushSyncResult.failed,
      total: pushSyncResult.total,
    } : null,
    lastPullSync: pullSyncTimestamp || null,
    isPulling: pullSyncMutation.isPending,
    syncNow,
    pullNow,
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
