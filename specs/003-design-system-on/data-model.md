# Design System Data Model

**Feature**: Reusable Design System Built on ShadCN  
**Date**: October 10, 2025  
**Context**: Data structures and type definitions for design system components

## Core Entities

### Theme Configuration

Represents the customizable theme settings that components consume for visual consistency.

```typescript
interface ThemeConfiguration {
  id: string;                    // Unique theme identifier
  name: string;                  // Human-readable theme name
  colors: {
    primary: string;             // Primary brand color (hex/hsl)
    secondary: string;           // Secondary accent color
    background: string;          // Background color
    foreground: string;          // Text color
    muted: string;               // Muted text/elements
    border: string;              // Border color
  };
  typography: {
    fontFamily: string;          // Primary font family
    fontSize: {
      xs: string;                // 0.75rem
      sm: string;                // 0.875rem  
      base: string;              // 1rem
      lg: string;                // 1.125rem
      xl: string;                // 1.25rem
      "2xl": string;             // 1.5rem
    };
    lineHeight: {
      tight: string;             // 1.25
      normal: string;            // 1.5
      relaxed: string;           // 1.75
    };
  };
  spacing: {
    xs: string;                  // 0.25rem (4px)
    sm: string;                  // 0.5rem (8px)
    md: string;                  // 1rem (16px)
    lg: string;                  // 1.5rem (24px)
    xl: string;                  // 3rem (48px)
  };
  shadows: {
    sm: string;                  // Subtle shadow
    md: string;                  // Medium shadow  
    lg: string;                  // Large shadow for cards
  };
  borderRadius: {
    sm: string;                  // Small radius
    md: string;                  // Medium radius
    lg: string;                  // Large radius
  };
}
```

**Validation Rules**:
- `id` must be unique across all themes
- Color values must be valid CSS color strings
- Font sizes must be valid CSS length units
- Spacing values must use rem or px units

**Relationships**: Consumed by all ComponentVariant entities

### Component Variant

Represents different visual states and configurations for design system components.

```typescript
interface ComponentVariant {
  componentType: ComponentType;  // Type of component (card, button, etc.)
  variant: string;               // Variant name (default, outline, ghost)
  size: ComponentSize;           // Size variant (sm, md, lg)
  state: InteractiveState;       // Current interactive state
  props: ComponentProps;         // Component-specific properties
  accessibility: AccessibilityConfig; // A11y configuration
}

enum ComponentType {
  CARD = "card",
  BUTTON = "button", 
  TYPOGRAPHY = "typography",
  TIMELINE = "timeline",
  STAT_CARD = "stat-card"
}

enum ComponentSize {
  SMALL = "sm",
  MEDIUM = "md", 
  LARGE = "lg"
}
```

**Validation Rules**:
- `componentType` must match available component implementations
- `variant` combinations must be supported by component type
- `size` must be appropriate for component type

**Relationships**: Uses ThemeConfiguration for styling, contains InteractiveState

### Interactive State

Represents the current interaction state of components for proper visual feedback.

```typescript
interface InteractiveState {
  current: StateType;            // Current state
  isHovered: boolean;            // Mouse hover state
  isFocused: boolean;            // Keyboard focus state
  isPressed: boolean;            // Active/pressed state
  isDisabled: boolean;           // Disabled state
  transition: TransitionConfig;  // Animation configuration
}

enum StateType {
  DEFAULT = "default",
  HOVER = "hover",
  FOCUS = "focus", 
  ACTIVE = "active",
  DISABLED = "disabled"
}

interface TransitionConfig {
  duration: number;              // Transition duration in ms
  easing: string;                // CSS easing function
  properties: string[];          // CSS properties to animate
}
```

**Validation Rules**:
- Only one of hover/focus/pressed can be true simultaneously
- `duration` must be between 0-1000ms for 60fps performance
- `properties` must be valid CSS property names

**State Transitions**:
- DEFAULT → HOVER (on mouse enter)
- HOVER → DEFAULT (on mouse leave)
- ANY → FOCUS (on keyboard navigation)
- FOCUS → DEFAULT (on blur)
- ANY → ACTIVE (on click/tap)
- ACTIVE → HOVER/FOCUS (on release)
- ANY → DISABLED (programmatic)

### Typography Scale

Defines the standardized font hierarchy system used across components.

```typescript
interface TypographyScale {
  level: TypographyLevel;        // Hierarchy level
  element: HTMLElement;          // Semantic HTML element
  fontSize: string;              // Font size token
  fontWeight: FontWeight;        // Font weight
  lineHeight: string;            // Line height token
  letterSpacing: string;         // Letter spacing value
  color: string;                 // Text color from theme
}

enum TypographyLevel {
  DISPLAY = "display",           // Large display text
  HEADING_1 = "h1",             // Page titles
  HEADING_2 = "h2",             // Section headers
  HEADING_3 = "h3",             // Subsection headers
  BODY = "body",                 // Regular body text
  CAPTION = "caption",           // Secondary/small text
  LABEL = "label"                // Form labels/tags
}

enum FontWeight {
  NORMAL = "400",
  MEDIUM = "500",
  SEMIBOLD = "600", 
  BOLD = "700"
}
```

**Validation Rules**:
- Each TypographyLevel must have unique fontSize mapping
- LineHeight values must ensure readability (minimum 1.2)
- Color must reference valid theme color token

**Relationships**: Uses ThemeConfiguration colors and typography tokens

### Accessibility Configuration

Ensures all components meet WCAG AA compliance standards.

```typescript
interface AccessibilityConfig {
  ariaLabel?: string;            // Accessible name
  ariaDescribedBy?: string;      // Description reference
  role?: string;                 // ARIA role
  tabIndex?: number;             // Tab order
  contrast: ContrastRatio;       // Color contrast validation
  focusManagement: FocusConfig;  // Focus behavior
}

interface ContrastRatio {
  foreground: string;            // Text/icon color
  background: string;            // Background color
  ratio: number;                 // Calculated contrast ratio
  isCompliant: boolean;          // Meets WCAG AA (4.5:1 normal, 3:1 large)
}

interface FocusConfig {
  isFocusable: boolean;          // Can receive focus
  focusRingColor: string;        // Focus indicator color
  focusRingWidth: string;        // Focus indicator width
  skipToContent?: boolean;       // Skip link behavior
}
```

**Validation Rules**:
- `ratio` must be ≥4.5:1 for normal text, ≥3:1 for large text
- `focusRingColor` must have sufficient contrast with background
- `tabIndex` values must follow logical tab order

**Relationships**: Used by all ComponentVariant entities

## Entity Relationships

```
ThemeConfiguration (1) ──→ (n) ComponentVariant
ComponentVariant (1) ──→ (1) InteractiveState  
ComponentVariant (1) ──→ (1) AccessibilityConfig
ComponentVariant (1) ──→ (1) TypographyScale
ThemeConfiguration (1) ──→ (n) TypographyScale
```

## Data Flow

1. **Theme Selection**: User/application selects ThemeConfiguration
2. **Component Rendering**: ComponentVariant applies theme tokens
3. **Interaction Handling**: InteractiveState manages user interactions
4. **Accessibility Validation**: AccessibilityConfig ensures compliance
5. **Typography Application**: TypographyScale provides consistent text styling

## Performance Considerations

- Theme tokens cached as CSS custom properties for runtime efficiency
- Component variants pre-computed during build time where possible
- Interactive state changes use RAF for 60fps animations
- Accessibility calculations memoized to prevent repeated computation