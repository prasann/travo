'use client';

import React, { useState } from 'react';
import { useSyncStatus } from './SyncProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2, WifiOff, Wifi, Cloud, Upload, Download, X } from 'lucide-react';

/**
 * SyncStatus component
 * Displays a compact indicator of sync queue state with expandable details.
 * Shows both push (local → cloud) and pull (cloud → local) sync status.
 * Also shows network status and offline mode indicator.
 */
export const SyncStatus: React.FC = () => {
  const { pending, failed, isSyncing, syncNow, lastPushSync, lastPullSync, isPulling, pullNow } = useSyncStatus();
  const { isOffline } = useAuth();
  const isNetworkOnline = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine overall sync status
  let syncIcon = <CheckCircle2 className="w-4 h-4 text-success" />;
  let label = 'Synced';

  if (isSyncing || isPulling) {
    syncIcon = <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    label = isPulling ? 'Pulling' : 'Pushing';
  } else if (failed > 0) {
    syncIcon = <AlertTriangle className="w-4 h-4 text-warning" />;
    label = `${failed} Failed`;
  } else if (pending > 0) {
    syncIcon = <RefreshCw className="w-4 h-4 text-primary" />;
    label = `${pending} Pending`;
  }

  // Network status icon (shown separately)
  const networkIcon = isNetworkOnline ? (
    <Wifi className="w-4 h-4 text-success" />
  ) : (
    <WifiOff className="w-4 h-4 text-base-content/60" />
  );

  const networkLabel = isNetworkOnline ? 'Online' : 'Offline';
  
  // Format relative time
  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };
  
  // Tooltip message
  const getTooltip = () => {
    if (!isNetworkOnline) {
      return 'Offline - changes will sync when back online';
    }
    if (isOffline) {
      return 'Using cached data - will sync when authenticated';
    }
    return 'Click for sync details';
  };

  return (
    <div className="relative flex items-center gap-1">
      {/* Network Status Indicator */}
      <div 
        className="tooltip tooltip-bottom" 
        data-tip={networkLabel}
      >
        <div className="btn btn-xs btn-ghost btn-circle">
          {networkIcon}
        </div>
      </div>

      {/* Sync Status Button - Clickable to expand */}
      <div className="tooltip tooltip-bottom" data-tip={getTooltip()}>
        <button
          type="button"
          className="btn btn-xs btn-ghost flex items-center gap-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {syncIcon}
          <span className="hidden md:inline text-xs">{label}</span>
          {/* Show pending count as badge on mobile when there are changes */}
          {pending > 0 && !isNetworkOnline && (
            <span className="badge badge-xs badge-info md:hidden">{pending}</span>
          )}
        </button>
      </div>

      {/* Failed sync warning */}
      {failed > 0 && (
        <div className="tooltip tooltip-bottom" data-tip="Some changes failed to sync. Will retry automatically.">
          <span className="badge badge-warning badge-xs">{failed}</span>
        </div>
      )}

      {/* Expanded Sync Details Modal */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Modal */}
          <div className="fixed top-16 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Cloud className="w-5 h-5" />
                    Sync Status
                  </h3>
                  <button
                    className="btn btn-xs btn-ghost btn-circle"
                    onClick={() => setIsExpanded(false)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Network Status */}
                <div className="flex items-center gap-2 text-sm mb-3">
                  {networkIcon}
                  <span className="font-medium">{networkLabel}</span>
                </div>

                {/* Push Sync Status */}
                <div className="mb-3 p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Upload className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">Push Sync (Local → Cloud)</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {pending > 0 ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3 h-3 text-primary" />
                        <span>{pending} pending change{pending !== 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span>All changes synced</span>
                      </div>
                    )}
                    {failed > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-warning" />
                        <span>{failed} failed (will retry)</span>
                      </div>
                    )}
                    {lastPushSync && (
                      <div className="text-base-content/60">
                        Last: {getRelativeTime(lastPushSync)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pull Sync Status */}
                <div className="mb-3 p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="w-4 h-4 text-secondary" />
                    <span className="font-semibold text-sm">Pull Sync (Cloud → Local)</span>
                  </div>
                  <div className="text-xs space-y-1">
                    {isPulling ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-secondary" />
                        <span>Refreshing from cloud...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span>Up to date</span>
                      </div>
                    )}
                    {lastPullSync && (
                      <div className="text-base-content/60">
                        Last: {getRelativeTime(lastPullSync)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Manual Refresh Button */}
                <button
                  className="btn btn-primary btn-sm w-full"
                  onClick={() => {
                    pullNow();
                    setIsExpanded(false);
                  }}
                  disabled={!isNetworkOnline || isOffline || isPulling}
                >
                  {isPulling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Refresh from Cloud
                    </>
                  )}
                </button>

                {(!isNetworkOnline || isOffline) && (
                  <p className="text-xs text-center text-base-content/60 mt-2">
                    {!isNetworkOnline ? 'Offline - connect to refresh' : 'Sign in to sync'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
