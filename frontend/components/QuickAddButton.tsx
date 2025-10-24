/**
 * QuickAddButton - Floating Action Button for quick add activity/restaurant
 * 
 * Feature: Quick Add from Timeline
 * Purpose: Provide easy access to add activities and restaurants without entering edit mode
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import QuickAddModal from './QuickAddModal';
import type { Trip } from '@/types';

interface QuickAddButtonProps {
  trip: Trip;
  onSuccess?: () => void;
}

export default function QuickAddButton({ trip, onSuccess }: QuickAddButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn btn-primary btn-circle btn-lg shadow-lg fixed bottom-6 right-6 z-20"
        aria-label="Quick add activity or restaurant"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Quick Add Modal */}
      {isModalOpen && (
        <QuickAddModal
          trip={trip}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            onSuccess?.();
          }}
        />
      )}
    </>
  );
}
