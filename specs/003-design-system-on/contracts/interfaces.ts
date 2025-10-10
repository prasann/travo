/**
 * Design System Component Interfaces
 * Generated from functional requirements in spec.md
 */

// Enhanced Card Component (FR-001)
export interface CardProps {
  /** Card content */
  children: React.ReactNode;
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
  children: React.ReactNode;
  /** Typography hierarchy level */
  variant: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  /** Text color variant */
  color?: 'default' | 'muted' | 'accent';
  /** Custom className */
  className?: string;
  /** HTML element to render */
  as?: keyof JSX.IntrinsicElements;
}

// Theme Integration (FR-003, FR-010)
export interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfiguration;
  /** Switch to different theme */
  setTheme: (themeId: string) => void;
  /** Available themes */
  availableThemes: ThemeConfiguration[];
}

// Interactive Component States (FR-005, FR-011)
export interface InteractiveProps {
  /** Hover state styling */
  onHover?: (isHovered: boolean) => void;
  /** Focus state for accessibility */
  onFocus?: (isFocused: boolean) => void;
  /** Active/pressed state feedback */
  onActive?: (isActive: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
}

// Button with Theme Integration
export interface ButtonProps extends InteractiveProps {
  children: React.ReactNode;
  /** Button visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: () => void;
  /** Custom className */
  className?: string;
}

// Trip Card Component (Application-specific)
export interface TripCardProps extends CardProps {
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

// Responsive Design Support (FR-008)
export interface ResponsiveProps {
  /** Responsive size variants */
  responsive?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
}

// Accessibility Configuration (FR-006)
export interface AccessibilityProps {
  /** ARIA label for screen readers */
  'aria-label'?: string;
  /** ARIA described by reference */
  'aria-describedby'?: string;
  /** ARIA role */
  role?: string;
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

// Component Library Exports (FR-007)
export interface DesignSystemComponents {
  // Enhanced base components
  Card: React.ComponentType<CardProps>;
  Button: React.ComponentType<ButtonProps>;
  Typography: React.ComponentType<TypographyProps>;
  
  // Application-specific components
  TripCard: React.ComponentType<TripCardProps>;
  Timeline: React.ComponentType<TimelineProps>;
  StatCard: React.ComponentType<StatCardProps>;
  
  // Theme provider
  ThemeProvider: React.ComponentType<{ children: React.ReactNode; theme: ThemeConfiguration }>;
  
  // Hooks
  useTheme: () => ThemeContextValue;
  useInteractiveState: () => InteractiveState;
}

// Package Export Interface
export interface DesignSystemPackage {
  components: DesignSystemComponents;
  themes: ThemeConfiguration[];
  utils: {
    createTheme: (config: Partial<ThemeConfiguration>) => ThemeConfiguration;
    validateAccessibility: (props: AccessibilityProps) => boolean;
    calculateContrast: (foreground: string, background: string) => number;
  };
}