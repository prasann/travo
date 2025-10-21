'use client';

import React from 'react';
import { useSyncStatus } from './SyncProvider';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2, WifiOff } from 'lucide-react';

/**
 * SyncStatus component
 * Displays a compact indicator of sync queue state with manual trigger button.
 * Also shows offline mode indicator when using cached auth.
 */
export const SyncStatus: React.FC = () => {
  const { pending, failed, isSyncing, syncNow, lastRun } = useSyncStatus();
  const { isOffline } = useAuth();

  let icon = <CheckCircle2 className="w-4 h-4 text-success" />;
  let label = 'Synced';
  let badgeClass = 'badge badge-success badge-sm';

  // Offline mode takes precedence
  if (isOffline) {
    icon = <WifiOff className="w-4 h-4 text-info" />;
    label = 'Offline';
    badgeClass = 'badge badge-info badge-sm';
  } else if (isSyncing) {
    icon = <Loader2 className="w-4 h-4 animate-spin" />;
    label = 'Syncing';
    badgeClass = 'badge badge-info badge-sm';
  } else if (failed > 0) {
    icon = <AlertTriangle className="w-4 h-4 text-warning" />;
    label = failed + ' Failed';
    badgeClass = 'badge badge-warning badge-sm';
  } else if (pending > 0) {
    icon = <RefreshCw className="w-4 h-4 text-primary" />;
    label = pending + ' Pending';
    badgeClass = 'badge badge-primary badge-sm';
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className={`btn btn-xs btn-ghost flex items-center gap-1 ${isSyncing || isOffline ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => syncNow()}
        title={
          isOffline 
            ? 'Using cached data - will sync when online'
            : lastRun 
              ? `Last sync: ${new Date(lastRun).toLocaleTimeString()}` 
              : 'Sync now'
        }
      >
        {icon}
        <span className="hidden sm:inline text-xs">{label}</span>
      </button>
      {failed > 0 && (
        <div className="tooltip" data-tip="Some changes failed to sync. Will retry automatically.">
          <span className="badge badge-warning badge-xs" />
        </div>
      )}
      {isOffline && pending > 0 && (
        <div className="tooltip" data-tip={`${pending} changes waiting to sync`}>
          <span className="badge badge-info badge-xs">{pending}</span>
        </div>
      )}
    </div>
  );
};
