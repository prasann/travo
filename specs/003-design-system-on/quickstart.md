# Design System Quick Start Guide

**Feature**: Reusable Design System Built on ShadCN  
**Target**: Developers implementing enhanced UI components  
**Estimated Setup Time**: 15 minutes

## Prerequisites

- React 18.x application with TypeScript
- Existing ShadCN UI setup
- Tailwind CSS configured
- Vite build system

## Installation

### Step 1: Install Design System Package

```bash
# Install the design system (when packaged)
npm install @travo/design-system

# Or use local development setup
cd travo-frontend
npm install
```

### Step 2: Configure Tailwind CSS

Add design system tokens to your `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@travo/design-system/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // Design system spacing tokens
      spacing: {
        'ds-xs': '0.25rem',  // 4px
        'ds-sm': '0.5rem',   // 8px
        'ds-md': '1rem',     // 16px
        'ds-lg': '1.5rem',   // 24px
        'ds-xl': '3rem',     // 48px
      },
      // Enhanced shadows for card components
      boxShadow: {
        'ds-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'ds-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'ds-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      },
      // Typography scale
      fontSize: {
        'ds-xs': ['0.75rem', '1rem'],
        'ds-sm': ['0.875rem', '1.25rem'],
        'ds-base': ['1rem', '1.5rem'],
        'ds-lg': ['1.125rem', '1.75rem'],
        'ds-xl': ['1.25rem', '1.75rem'],
        'ds-2xl': ['1.5rem', '2rem'],
      },
    },
  },
}
```

### Step 3: Import Theme Provider

```typescript
// src/App.tsx
import { ThemeProvider, createTheme } from '@travo/design-system';

const defaultTheme = createTheme({
  name: 'Default',
  colors: {
    primary: 'hsl(220, 90%, 56%)',
    secondary: 'hsl(220, 30%, 18%)',
    // ... other colors
  }
});

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

## Basic Usage

### Enhanced Card Component

Replace existing trip cards with enhanced design system cards:

```typescript
import { Card, Typography } from '@travo/design-system';

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Card 
      variant="gradient" 
      interactive 
      onClick={() => viewTripDetails(trip.id)}
      className="p-ds-lg"
    >
      <Typography variant="h3" color="default">
        {trip.title}
      </Typography>
      <Typography variant="body" color="muted">
        {trip.destination}
      </Typography>
      <Typography variant="caption" color="accent">
        {trip.startDate} - {trip.endDate}
      </Typography>
    </Card>
  );
}
```

### Typography System

Apply consistent typography throughout your application:

```typescript
import { Typography } from '@travo/design-system';

function HomePage() {
  return (
    <div>
      <Typography variant="display">Travo</Typography>
      <Typography variant="h1">Your Trips</Typography>
      <Typography variant="body">
        Plan and organize your travel adventures with ease.
      </Typography>
    </div>
  );
}
```

### Theme Integration

Use theme-aware interactive components:

```typescript
import { Button, useTheme } from '@travo/design-system';

function BookingActions() {
  const { theme } = useTheme();
  
  return (
    <div className="flex gap-ds-md">
      <Button variant="primary" size="lg">
        Book Now
      </Button>
      <Button variant="outline" size="lg">
        Save for Later
      </Button>
    </div>
  );
}
```

## Component Examples

### Trip Details Timeline

```typescript
import { Timeline } from '@travo/design-system';

function TripItinerary({ trip }: { trip: Trip }) {
  const timelineItems = trip.days.map(day => ({
    id: day.id,
    day: day.dayNumber,
    date: day.date,
    activities: day.activities
  }));

  return (
    <Timeline 
      items={timelineItems}
      orientation="vertical"
      className="mt-ds-xl"
    />
  );
}
```

### Statistics Display

```typescript
import { StatCard } from '@travo/design-system';

function TripStats({ tripCount }: { tripCount: number }) {
  return (
    <StatCard
      label="Trips Planned"
      value={tripCount}
      description="Ready for adventure"
      variant="elevated"
    />
  );
}
```

## Customization

### Creating Custom Themes

```typescript
import { createTheme } from '@travo/design-system';

const darkTheme = createTheme({
  name: 'Dark Mode',
  colors: {
    primary: 'hsl(220, 90%, 56%)',
    background: 'hsl(220, 13%, 9%)',
    foreground: 'hsl(220, 9%, 98%)',
    // ... other colors
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    // ... typography settings
  }
});
```

### Responsive Design

Components automatically adapt to screen sizes:

```typescript
<Card 
  className="p-ds-md md:p-ds-lg lg:p-ds-xl"
  responsive={{
    mobile: 'compact',
    tablet: 'comfortable', 
    desktop: 'spacious'
  }}
>
  {/* Card content */}
</Card>
```

## Performance Guidelines

- Use `React.lazy()` for non-critical components
- Import only needed components to enable tree-shaking
- Enable theme caching for improved runtime performance

```typescript
// Good: Import specific components
import { Card, Button } from '@travo/design-system';

// Avoid: Import entire library
import * as DS from '@travo/design-system';
```

## Accessibility

All components include built-in accessibility features:

- WCAG AA compliant color contrasts
- Keyboard navigation support
- Screen reader compatibility
- Focus management

```typescript
<Button 
  aria-label="View trip details"
  onClick={handleViewDetails}
>
  View Details
</Button>
```

## Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { ThemeProvider, Card } from '@travo/design-system';

test('card renders with correct styling', () => {
  render(
    <ThemeProvider theme={defaultTheme}>
      <Card variant="gradient">Test content</Card>
    </ThemeProvider>
  );
  
  expect(screen.getByText('Test content')).toBeInTheDocument();
});
```

## Next Steps

1. Replace existing components with design system equivalents
2. Customize theme colors to match brand requirements
3. Add new component variants as needed
4. Set up visual regression testing
5. Configure automated accessibility testing

## Support

- Component documentation: [Storybook URL]
- TypeScript definitions included for full IntelliSense support
- Example implementations in `/examples` directory