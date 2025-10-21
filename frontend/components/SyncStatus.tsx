'use client';

import React from 'react';
import { useSyncStatus } from './SyncProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2, WifiOff, Wifi } from 'lucide-react';

/**
 * SyncStatus component
 * Displays a compact indicator of sync queue state with manual trigger button.
 * Also shows network status and offline mode indicator.
 */
export const SyncStatus: React.FC = () => {
  const { pending, failed, isSyncing, syncNow, lastRun } = useSyncStatus();
  const { isOffline } = useAuth();
  const isNetworkOnline = useNetworkStatus();

  // Determine sync status icon and label
  let syncIcon = <CheckCircle2 className="w-4 h-4 text-success" />;
  let label = 'Synced';

  if (isSyncing) {
    syncIcon = <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    label = 'Syncing';
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
  
  // Tooltip message
  const getTooltip = () => {
    if (!isNetworkOnline) {
      return 'Offline - changes will sync when back online';
    }
    if (isOffline) {
      return 'Using cached data - will sync when authenticated';
    }
    if (lastRun) {
      return `Last sync: ${new Date(lastRun).toLocaleTimeString()}`;
    }
    return 'Click to sync now';
  };

  return (
    <div className="flex items-center gap-1">
      {/* Network Status Indicator */}
      <div 
        className="tooltip tooltip-bottom" 
        data-tip={networkLabel}
      >
        <div className="btn btn-xs btn-ghost btn-circle">
          {networkIcon}
        </div>
      </div>

      {/* Sync Status Button */}
      <div className="tooltip tooltip-bottom" data-tip={getTooltip()}>
        <button
          type="button"
          className={`btn btn-xs btn-ghost flex items-center gap-1 ${
            isSyncing || !isNetworkOnline || isOffline ? 'pointer-events-none opacity-60' : ''
          }`}
          onClick={() => syncNow()}
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
    </div>
  );
};
