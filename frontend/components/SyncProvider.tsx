"use client";

/**
 * SyncProvider
 * Wraps application to provide realtime status of push sync queue and trigger automatic processing.
 * Phase 4 Integration: Automatic push sync UI + background processing.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

const POLL_INTERVAL_MS = 30_000; // periodic attempt
const INITIAL_DEBOUNCE_MS = 1_000; // short delay after mount

export const SyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userEmail = user?.email || null;
  const [pending, setPending] = useState(0);
  const [failed, setFailed] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ success: number; failed: number; total: number } | null>(null);
  const intervalRef = useRef<number | null>(null);
  const visibilityListenerSet = useRef(false);
  const onlineListenerSet = useRef(false);
  const lastPendingRef = useRef(0);

  const refreshQueueSnapshot = useCallback(async () => {
    try {
      const [pCount, failedEntries] = await Promise.all([
        getPendingCount(),
        getFailedEntries(),
      ]);
      setPending(pCount);
      setFailed(failedEntries.length);
      lastPendingRef.current = pCount;
    } catch (err) {
      console.warn('[SyncProvider] Failed to refresh queue snapshot', err);
    }
  }, []);

  const runSync = useCallback(async () => {
    if (!userEmail) return; // only sync when authenticated
    if (isSyncing) return; // avoid overlapping runs

    setIsSyncing(true);
    try {
      const result = await triggerSync(userEmail);
      if (result) {
        setLastResult(result);
        setLastRun(new Date().toISOString());
      }
    } catch (err) {
      console.error('[SyncProvider] Sync error', err);
    } finally {
      setIsSyncing(false);
      // Always refresh queue after attempt
      refreshQueueSnapshot();
    }
  }, [userEmail, isSyncing, refreshQueueSnapshot]);

  const syncNow = useCallback(async () => {
    await runSync();
  }, [runSync]);

  // Observe queue growth to trigger immediate sync (polling fallback otherwise)
  const checkAndMaybeSync = useCallback(async () => {
    if (!userEmail) return;
    const entries = await getQueuedEntries();
    const count = entries.length;
    if (count > 0 && lastPendingRef.current === 0) {
      // newly added first pending item(s)
      await runSync();
    } else {
      // Just update state counters
      setPending(count);
      const failedEntries = entries.filter(e => e.retries >= 3);
      setFailed(failedEntries.length);
      lastPendingRef.current = count;
    }
  }, [userEmail, runSync]);

  // Initial load + periodic polling
  useEffect(() => {
    if (!userEmail) {
      // reset state on logout
      setPending(0);
      setFailed(0);
      setLastResult(null);
      setLastRun(null);
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial snapshot (debounced) then schedule interval
    const timeout = window.setTimeout(() => {
      refreshQueueSnapshot();
      checkAndMaybeSync();
    }, INITIAL_DEBOUNCE_MS);

    if (!intervalRef.current) {
      intervalRef.current = window.setInterval(() => {
        checkAndMaybeSync();
      }, POLL_INTERVAL_MS) as unknown as number;
    }

    return () => {
      window.clearTimeout(timeout);
    };
  }, [userEmail, refreshQueueSnapshot, checkAndMaybeSync]);

  // Visibility & online event listeners
  useEffect(() => {
    if (!visibilityListenerSet.current) {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkAndMaybeSync();
        }
      });
      visibilityListenerSet.current = true;
    }
    if (!onlineListenerSet.current) {
      window.addEventListener('online', () => {
        checkAndMaybeSync();
      });
      onlineListenerSet.current = true;
    }
  }, [checkAndMaybeSync]);

  const value: SyncContextValue = {
    pending,
    failed,
    isSyncing,
    lastRun,
    lastResult,
    syncNow,
    refreshQueueSnapshot,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export function useSyncStatus(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncStatus must be used within SyncProvider');
  return ctx;
}
