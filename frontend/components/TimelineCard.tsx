/**
 * TimelineCard - Reusable card component for timeline items
 * Provides consistent layout for Flight, Hotel, and Activity cards
 * 
 * Features:
 * - Collapsible design with chevron toggle
 * - Default collapsed state showing only essential info
 * - Expanded state reveals all details
 */

'use client'

import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimelineCardProps {
  /** Icon or image element to display */
  icon: ReactNode;
  /** Tailwind color class for icon background (e.g., 'primary', 'secondary', 'accent', 'warning') */
  iconColor: string;
  /** Card title (can be string or clickable link) */
  title: ReactNode;
  /** Main content area (key information shown when collapsed) */
  content: ReactNode;
  /** Optional additional details section (shown only when expanded) */
  details?: ReactNode;
}

/**
 * TimelineCard wrapper component
 * 
 * Consistent structure:
 * - Top: Icon/Image + Main Content + Chevron button (side by side)
 * - Bottom: Additional Details (full width, below separator, expandable)
 */
export function TimelineCard({ icon, iconColor, title, content, details }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = !!details;
  
  return (
    <div className="card bg-base-100 shadow-2xl border border-base-300/50">
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Icon/Image + Key info + Chevron */}
        <div className="flex gap-3">
          {/* Icon/Image container */}
          <div className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-${iconColor}/10 flex items-center justify-center rounded overflow-hidden`}>
            {icon}
          </div>
          
          {/* Main content beside icon */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base mb-1">{title}</h3>
            {content}
          </div>
          
          {/* Chevron button (only shown if details exist) */}
          {hasDetails && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0 btn btn-ghost btn-sm btn-circle self-start"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              <ChevronDown 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>
        
        {/* Bottom section: Expandable additional details */}
        {hasDetails && isExpanded && (
          <div className="mt-3 pt-3 border-t border-base-300 animate-fadeIn">
            {details}
          </div>
        )}
      </div>
    </div>
  );
}
