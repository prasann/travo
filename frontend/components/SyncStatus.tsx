'use client';

import React from 'react';
import { useSyncStatus } from './SyncProvider';
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * SyncStatus component
 * Displays a compact indicator of sync queue state with manual trigger button.
 */
export const SyncStatus: React.FC = () => {
  const { pending, failed, isSyncing, syncNow, lastRun } = useSyncStatus();

  let icon = <CheckCircle2 className="w-4 h-4 text-success" />;
  let label = 'Synced';
  let badgeClass = 'badge badge-success badge-sm';

  if (isSyncing) {
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
        className={`btn btn-xs btn-ghost flex items-center gap-1 ${isSyncing ? 'pointer-events-none opacity-60' : ''}`}
        onClick={() => syncNow()}
        title={lastRun ? `Last sync: ${new Date(lastRun).toLocaleTimeString()}` : 'Sync now'}
      >
        {icon}
        <span className="hidden sm:inline text-xs">{label}</span>
      </button>
      {failed > 0 && (
        <div className="tooltip" data-tip="Some changes failed to sync. Will retry automatically.">
          <span className="badge badge-warning badge-xs" />
        </div>
      )}
    </div>
  );
};
