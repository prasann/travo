# Data Model: Simplified Design System Components

**Feature**: Simplified ShadCN Enhancement  
**Date**: October 10, 2025  
**Context**: Data structures for enhanced component variants and simple theming

## Component Entities

### Enhanced Card Component

**Entity**: `EnhancedCard`  
**Purpose**: ShadCN Card with visual variants for improved UI consistency  

**Properties**:
- `variant: 'default' | 'gradient' | 'elevated'` - Visual style variant
- `size: 'sm' | 'md' | 'lg'` - Size variant for different contexts  
- `interactive: boolean` - Whether card responds to hover/click
- `className: string` - Additional Tailwind classes
- `children: ReactNode` - Card content

**Validation Rules**:
- `variant` defaults to 'default' if not specified
- `size` defaults to 'md' if not specified
- `interactive` defaults to false
- Must maintain accessibility attributes when interactive

**State Transitions**: None (stateless component)

### Enhanced Button Component

**Entity**: `EnhancedButton`  
**Purpose**: ShadCN Button with theme color integration  

**Properties**:
- `variant: 'default' | 'primary' | 'secondary' | 'ghost'` - Visual style
- `size: 'sm' | 'md' | 'lg'` - Size variant
- `theme: string` - Theme identifier for color integration
- `disabled: boolean` - Interaction state
- `className: string` - Additional classes
- `children: ReactNode` - Button content

**Validation Rules**:
- `variant` defaults to 'default'
- `size` defaults to 'md'  
- `theme` defaults to current active theme
- `disabled` prevents all interactions
- Must maintain WCAG AA contrast ratios

**State Transitions**: 
- `enabled` ↔ `disabled` (based on props)
- Internal: `idle` → `hover` → `active` → `idle`

### Theme Configuration

**Entity**: `ThemeConfig`  
**Purpose**: Simple theme definition using CSS custom properties

**Properties**:
- `name: string` - Theme identifier (e.g., 'blue', 'green')
- `primary: string` - Primary color (HSL format)
- `primaryForeground: string` - Primary text color
- `cardGradientFrom: string` - Card gradient start color
- `cardGradientTo: string` - Card gradient end color

**Validation Rules**:
- `name` must be unique and filesystem-safe
- All color values must be valid HSL format
- Contrast ratios must meet WCAG AA standards (4.5:1 minimum)

**State Transitions**: None (static configuration)

## Trip Application Entities

### Enhanced Trip Card Data

**Entity**: `TripCardData`  
**Purpose**: Data structure for trip cards using enhanced components

**Properties**:
- `id: string` - Unique trip identifier
- `title: string` - Trip name
- `destination: string` - Location name
- `startDate: string` - ISO date string
- `endDate: string` - ISO date string  
- `duration: string` - Human-readable duration
- `placeCount: number` - Number of places in trip

**Validation Rules**:
- `id` must be unique across all trips
- `title` maximum 100 characters
- `destination` maximum 50 characters
- Date strings must be valid ISO format
- `placeCount` must be positive integer

**Relationships**:
- Maps to existing Trip entity from application data model
- Used by EnhancedCard component for display
- No database persistence required (uses existing JSON data)

## Component Relationships

```
ThemeConfig
    ↓ (provides colors)
EnhancedCard ← TripCardData (displays)
    ↓ (contains)
EnhancedButton

Theme CSS Files
    ↓ (defines properties)
Components (consume via CSS custom properties)
```

## Data Flow

1. **Theme Loading**: CSS theme files define custom properties
2. **Component Rendering**: Enhanced components consume CSS custom properties  
3. **Trip Display**: TripCardData flows through EnhancedCard component
4. **User Interaction**: EnhancedButton handles events with theme-integrated feedback

## Storage Strategy

**Configuration**: CSS files in `/src/styles/themes/`  
**Components**: TypeScript files in `/src/components/ui/`  
**Trip Data**: Existing JSON files (no changes required)  
**Runtime State**: React component state only (no persistence)

This simplified data model eliminates complex design token systems while maintaining type safety and component reusability.