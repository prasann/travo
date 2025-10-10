/**
 * Design System Tokens
 * Core design token definitions for spacing, typography, colors, and effects
 */

// Spacing tokens (matching Tailwind config)
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '3rem',      // 48px
} as const;

// Typography tokens
export const typography = {
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

// Shadow tokens (matching Tailwind config)
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  hover: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
} as const;

// Border radius tokens
export const borderRadius = {
  sm: '0.25rem',  // 4px
  md: '0.375rem', // 6px  
  lg: '0.5rem',   // 8px
  xl: '0.75rem',  // 12px
} as const;

// Animation durations
export const animations = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Z-index scale
export const zIndex = {
  base: 0,
  dropdown: 10,
  modal: 50,
  tooltip: 100,
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export const designTokens = {
  spacing,
  typography,
  shadows,
  borderRadius,
  animations,
  zIndex,
  breakpoints,
} as const;

export default designTokens;