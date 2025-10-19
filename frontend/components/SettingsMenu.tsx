'use client';

/**
 * Settings Menu Component
 * 
 * Feature: Database Management
 * Date: 2025-10-19
 * 
 * Provides a dropdown menu with app settings and administrative actions,
 * including database reset functionality.
 */

import { useState } from 'react';
import { Settings, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { resetDatabase } from '@/lib/db';
import { isOk, unwrapErr } from '@/lib/db';

export function SettingsMenu() {
  const { user } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetDatabase = async () => {
    if (!user?.email) {
      setError('You must be logged in to reset the database');
      return;
    }

    setIsResetting(true);
    setError(null);
    setShowConfirmModal(false);

    try {
      console.log('[SettingsMenu] Resetting database...');
      const result = await resetDatabase(user.email);
      
      if (!isOk(result)) {
        const error = unwrapErr(result);
        throw new Error(error.message);
      }

      console.log('[SettingsMenu] Database reset successful, reloading page...');
      // Reload the page to reinitialize everything
      window.location.reload();
    } catch (err) {
      console.error('[SettingsMenu] Database reset failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset database');
      setIsResetting(false);
    }
  };

  return (
    <>
      {/* Settings Dropdown */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <Settings className="h-5 w-5" />
        </div>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-200 rounded-box z-[1] w-64 p-2 shadow-lg"
        >
          <li>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={!user || isResetting}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Local Database</span>
            </button>
          </li>
          {!user && (
            <li className="text-xs text-base-content/60 px-4 py-2">
              Log in to enable reset
            </li>
          )}
        </ul>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Reset Local Database?
            </h3>
            <div className="py-4">
              <p className="mb-2">
                This will <strong>delete all local data</strong> from your browser and
                sync fresh data from the cloud.
              </p>
              <p className="text-sm text-base-content/70">
                Use this if you&apos;re experiencing sync issues or want to start fresh.
                Your data in the cloud will not be affected.
              </p>
            </div>
            {error && (
              <div className="alert alert-error mb-4">
                <span className="text-sm">{error}</span>
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setShowConfirmModal(false);
                  setError(null);
                }}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                className="btn btn-warning"
                onClick={handleResetDatabase}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Resetting...
                  </>
                ) : (
                  'Reset Database'
                )}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button disabled={isResetting}>close</button>
          </form>
        </div>
      )}
    </>
  );
}
