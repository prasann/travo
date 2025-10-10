import type { ReactNode } from 'react';

/**
 * Design System Component Interfaces
 * Local copy from contracts for type safety
 */

// Enhanced Card Component (FR-001)
export interface CardProps {
  /** Card content */
  children: ReactNode;
  /** Visual variant with gradient backgrounds */
  variant?: 'default' | 'gradient' | 'elevated';
  /** Size with consistent padding (24px minimum) */
  size?: 'sm' | 'md' | 'lg';
  /** Enable hover effects with shadow depth and scale */
  interactive?: boolean;
  /** Custom className for additional styling */
  className?: string;
  /** Click handler for interactive cards */
  onClick?: () => void;
}

// Typography Hierarchy Components (FR-002)
export interface TypographyProps {
  /** Text content */
  children: ReactNode;
  /** Typography hierarchy level */
  variant: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  /** Text color variant */
  color?: 'default' | 'muted' | 'accent';
  /** Custom className */
  className?: string;
  /** HTML element to render */
  as?: keyof React.JSX.IntrinsicElements;
}

// Trip Card Component (Application-specific)
export interface TripCardProps {
  /** Trip data */
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: string;
    placeCount: number;
  };
  /** Show trip details action */
  onViewDetails?: (tripId: string) => void;
  /** Visual variant with gradient backgrounds */
  variant?: 'default' | 'gradient' | 'elevated';
  /** Size with consistent padding (24px minimum) */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for additional styling */
  className?: string;
}

// Timeline Component for Trip Details (Application-specific)
export interface TimelineProps {
  /** Timeline items */
  items: TimelineItem[];
  /** Timeline orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Custom styling */
  className?: string;
}

export interface TimelineItem {
  id: string;
  day: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  time: string;
  place: string;
  description: string;
  type: 'travel' | 'accommodation' | 'activity' | 'meal';
}

// Statistics Card Component
export interface StatCardProps extends CardProps {
  /** Statistic label */
  label: string;
  /** Statistic value */
  value: string | number;
  /** Optional description */
  description?: string;
  /** Icon component */
  icon?: React.ComponentType;
}