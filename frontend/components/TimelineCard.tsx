/**
 * TimelineCard - Reusable card component for timeline items
 * Provides consistent layout for Flight, Hotel, and Activity cards
 */

import { ReactNode } from 'react';

interface TimelineCardProps {
  /** Icon or image element to display */
  icon: ReactNode;
  /** Tailwind color class for icon background (e.g., 'primary', 'secondary', 'accent', 'warning') */
  iconColor: string;
  /** Card title (can be string or clickable link) */
  title: ReactNode;
  /** Main content area (key information) */
  content: ReactNode;
  /** Optional additional details section (shown below separator) */
  details?: ReactNode;
}

/**
 * TimelineCard wrapper component
 * 
 * Consistent structure:
 * - Top: Icon/Image + Main Content (side by side)
 * - Bottom: Additional Details (full width, below separator)
 */
export function TimelineCard({ icon, iconColor, title, content, details }: TimelineCardProps) {
  return (
    <div className="card bg-base-100 shadow-2xl border border-base-300/50">
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Icon/Image + Key info */}
        <div className="flex gap-3">
          {/* Icon/Image container */}
          <div className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-${iconColor}/10 flex items-center justify-center rounded overflow-hidden`}>
            {icon}
          </div>
          
          {/* Main content beside icon */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg mb-1">{title}</h3>
            {content}
          </div>
        </div>
        
        {/* Bottom section: Full width additional details */}
        {details && (
          <div className="mt-3 pt-3 border-t border-base-300">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
