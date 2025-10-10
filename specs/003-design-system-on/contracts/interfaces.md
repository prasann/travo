# Component Interfaces: Simplified Design System

**Feature**: Enhanced ShadCN Components  
**Date**: October 10, 2025  
**Context**: TypeScript interfaces for simple component enhancement

## Enhanced Card Component Interface

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant for the card */
  variant?: 'default' | 'gradient' | 'elevated';
  
  /** Whether card responds to user interactions */
  interactive?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Card content */
  children: React.ReactNode;
}

/** Enhanced Card component with visual variants */
declare const Card: React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>;
```

## Enhanced Button Component Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Additional CSS classes */
  className?: string;
  
  /** Button content */
  children: React.ReactNode;
}

/** Enhanced Button component with theme integration */
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
```

## Trip Card Data Interface

```typescript
interface TripCardData {
  /** Unique trip identifier */
  id: string;
  
  /** Trip name/title */
  title: string;
  
  /** Destination name */
  destination: string;
  
  /** Trip start date (ISO string) */
  startDate: string;
  
  /** Trip end date (ISO string) */
  endDate: string;
  
  /** Human-readable duration */
  duration: string;
  
  /** Number of places in the trip */
  placeCount: number;
}

interface TripCardProps {
  /** Trip data to display */
  trip: TripCardData;
  
  /** Callback when user wants to view trip details */
  onViewDetails?: (tripId: string) => void;
  
  /** Additional CSS classes */
  className?: string;
}

/** Trip card component using enhanced Card */
declare const TripCard: React.FC<TripCardProps>;
```

## Theme Configuration Interface

```typescript
interface ThemeConfig {
  /** Theme name/identifier */
  name: string;
  
  /** Primary color in HSL format */
  primary: string;
  
  /** Primary foreground color */
  primaryForeground: string;
  
  /** Card gradient start color */
  cardGradientFrom: string;
  
  /** Card gradient end color */
  cardGradientTo: string;
}

/** CSS custom properties for theme */
interface ThemeCSSProperties {
  '--primary': string;
  '--primary-foreground': string;
  '--card-gradient-from': string;
  '--card-gradient-to': string;
}
```

## Component Export Interface

```typescript
// Main component exports from ui directory
export interface UIComponents {
  Card: typeof Card;
  CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  Button: typeof Button;
}

// Application-specific component exports
export interface AppComponents {
  TripCard: typeof TripCard;
}
```

## Usage Contracts

### Enhanced Card Usage

```typescript
// Basic usage
<Card>Content</Card>

// With gradient variant
<Card variant="gradient">Content</Card>

// Interactive card
<Card variant="elevated" interactive onClick={handleClick}>
  Content
</Card>
```

### Theme Integration Usage

```typescript
// CSS file import (blue theme)
@import './styles/themes/blue.css';

// Component usage automatically inherits theme
<Card variant="gradient">
  // Uses --card-gradient-from and --card-gradient-to
</Card>
```

### Cross-Application Integration

```typescript
// Copy these files to new application:
// 1. src/components/ui/card.tsx
// 2. src/components/ui/button.tsx (if needed)
// 3. src/styles/themes/[theme].css
// 4. Update src/index.css to import theme

// Usage remains identical across applications
import { Card } from '@/components/ui/card';
```

## Compatibility Requirements

- **React**: 18.x or higher
- **TypeScript**: 5.x or higher  
- **Tailwind CSS**: 3.x or higher
- **ShadCN UI**: Latest version with Radix UI primitives

## Performance Contracts

- Card rendering: <100ms
- Theme switching: <16ms (CSS custom property updates)
- Bundle size impact: <2KB per enhanced component
- No runtime JavaScript overhead for theming (CSS-only)

This simplified interface contract eliminates complex design token types while maintaining full TypeScript safety and component reusability.