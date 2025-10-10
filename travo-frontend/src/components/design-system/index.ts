/**
 * Design System Component Exports
 * Central export point for all design system components and utilities
 */

// Export enhanced components
export { TripCard } from './TripCard';
// export { Timeline } from './Timeline';     // To be implemented in US4
// export { StatCard } from './StatCard';     // To be implemented in US4

// Re-export enhanced UI components
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../ui/card';
export { Typography } from '../ui/typography';

// Export types
export type {
  CardProps,
  TripCardProps,
  TimelineProps,
  TimelineItem,
  Activity,
  StatCardProps,
  TypographyProps,
} from './types';

// Re-export theme utilities
export { ThemeProvider, useTheme, createTheme, defaultTheme, availableThemes } from '../../lib/design-system/theme';

// Re-export component utilities
export * from '../../lib/design-system/utils';