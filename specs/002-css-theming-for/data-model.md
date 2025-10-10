# Data Model: CSS Theme Management System

**Feature**: CSS Theme Management System  
**Phase**: 1 - Design & Contracts  
**Date**: October 10, 2025

## Overview

The CSS theming system operates at build-time and does not require persistent data storage. All theme definitions are static assets managed through the build process.

## Entities

### Theme Definition

**Purpose**: Represents a complete visual theme with all required CSS custom properties

**Attributes**:
- `name`: Unique theme identifier (e.g., "blue", "green", "default")
- `cssVariables`: Complete set of CSS custom property definitions
- `filePath`: Path to theme CSS file in build system

**Validation Rules**:
- Theme name must match available shadcn.studio theme names
- All required CSS custom properties must be defined
- HSL color values must be valid CSS format
- Theme files must exist in themes directory

**Example Structure**:
```css
/* blue.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  /* ... additional variables */
}
```

### Theme Configuration

**Purpose**: Build-time configuration that determines active theme selection

**Attributes**:
- `selectedTheme`: Theme name specified via build parameter
- `fallbackTheme`: Default theme used when selected theme is invalid
- `availableThemes`: Array of supported theme names

**Validation Rules**:
- Selected theme must exist in available themes list
- Fallback theme must always be "default"
- Theme names must match shadcn.studio conventions

**State Transitions**:
1. Build parameter processed → Theme name extracted
2. Theme validation → Valid theme confirmed or fallback applied
3. Theme loading → Appropriate CSS file imported
4. Build completion → Single theme included in bundle

### Build Context

**Purpose**: Environment and configuration data available during build process

**Attributes**:
- `buildTheme`: Theme name from VITE_THEME environment variable
- `isProduction`: Production vs development build flag
- `buildTimestamp`: When theme selection was processed

**Relationships**:
- Build Context → determines → Theme Configuration
- Theme Configuration → selects → Theme Definition
- Theme Definition → provides → CSS Variables

## Data Flow

```text
npm run build --theme=blue
        ↓
VITE_THEME environment variable set
        ↓
Vite config processes theme parameter
        ↓
Theme validation (fallback if invalid)
        ↓
Correct theme CSS file imported
        ↓
Single themed bundle generated
```

## File System Structure

```text
src/styles/themes/
├── index.ts              # Theme selection logic
├── types.ts             # TypeScript theme interfaces
└── themes/
    ├── default.css      # Default theme (zinc)
    ├── blue.css         # Blue theme
    ├── green.css        # Green theme
    └── [theme-name].css # Other shadcn.studio themes
```

## TypeScript Interfaces

```typescript
// Theme type definitions
export type ThemeName = 
  | 'default'
  | 'slate' 
  | 'gray'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'rose'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink';

export interface ThemeConfig {
  selectedTheme: ThemeName;
  fallbackTheme: ThemeName;
  availableThemes: ThemeName[];
}
```

## Constraints

**Build-Time Only**: No runtime theme switching capabilities
**Static Assets**: All themes are pre-defined CSS files
**Single Theme Per Build**: Only one theme included in each build output
**No Persistence**: No user preferences or theme state storage required
**Validation**: Invalid themes silently fall back to default theme

## Integration Points

**Vite Configuration**: Processes VITE_THEME environment variable
**CSS Imports**: Dynamic theme CSS file selection at build time
**Tailwind Config**: CSS custom property integration for component theming
**Package Scripts**: Theme parameter handling in build commands