'use client'

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TimelineCardProps {
  icon: React.ReactNode;
  iconColor: 'primary' | 'secondary' | 'accent' | 'info';
  title: React.ReactNode;
  content: React.ReactNode;
  details?: React.ReactNode;
}

/**
 * TimelineCard - Reusable card component for timeline items
 * with inline icon and expandable details
 */
export function TimelineCard({ icon, iconColor, title, content, details }: TimelineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = !!details;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300/50">
      <div className="card-body p-3 sm:p-4">
        {/* Top section: Inline icon + Content + Chevron */}
        <div className="flex gap-3">
          {/* Small inline icon */}
          <div className="flex-shrink-0 pt-0.5">
            {icon}
          </div>
          
          {/* Main content */}
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
