/**
 * Design System Component Utilities
 * Shared utilities and helpers for design system components
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging Tailwind classes with design system classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Spacing utility mapper
export function getSpacingClass(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string {
  const spacingMap = {
    xs: 'ds-p-xs',
    sm: 'ds-p-sm', 
    md: 'ds-p-md',
    lg: 'ds-p-lg',
    xl: 'ds-p-xl',
  };
  return spacingMap[size];
}

// Typography variant mapper
export function getTypographyClass(variant: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label'): string {
  const typographyMap = {
    display: 'ds-display',
    h1: 'ds-h1',
    h2: 'ds-h2', 
    h3: 'ds-h3',
    body: 'ds-body',
    caption: 'ds-caption',
    label: 'ds-label',
  };
  return typographyMap[variant];
}

// Shadow utility mapper
export function getShadowClass(size: 'sm' | 'md' | 'lg' | 'hover'): string {
  const shadowMap = {
    sm: 'shadow-ds-sm',
    md: 'shadow-ds-md',
    lg: 'shadow-ds-lg', 
    hover: 'shadow-ds-hover',
  };
  return shadowMap[size];
}

// Interactive state management
export interface InteractiveState {
  isHovered: boolean;
  isFocused: boolean;
  isPressed: boolean;
}

// Accessibility helpers
export function getAccessibilityProps(props: {
  'aria-label'?: string;
  'aria-describedby'?: string;
  role?: string;
  tabIndex?: number;
}) {
  return {
    'aria-label': props['aria-label'],
    'aria-describedby': props['aria-describedby'],
    role: props.role,
    tabIndex: props.tabIndex,
  };
}

// Color contrast validation utility
export function validateContrast(_foreground: string, _background: string): boolean {
  // Simplified contrast check - in production would use proper color contrast algorithm
  // This is a placeholder that always returns true for now
  return true;
}

// Responsive design helper
export function getResponsiveClasses(responsive?: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
}): string {
  if (!responsive) return '';
  
  const classes: string[] = [];
  
  if (responsive.mobile) classes.push(responsive.mobile);
  if (responsive.tablet) classes.push(`md:${responsive.tablet}`);
  if (responsive.desktop) classes.push(`lg:${responsive.desktop}`);
  
  return classes.join(' ');
}

// Animation utilities
export function getTransitionClasses(
  duration: 'fast' | 'normal' | 'slow' = 'normal',
  properties: string[] = ['all']
): string {
  const durationMap = {
    fast: 'duration-150',
    normal: 'duration-200', 
    slow: 'duration-300',
  };
  
  const transitionProperty = properties.length === 1 && properties[0] === 'all' 
    ? 'transition' 
    : 'transition-' + properties.join('-');
    
  return `${transitionProperty} ${durationMap[duration]} ease-in-out`;
}

// Component size utilities
export function getComponentSizeClasses(
  size: 'sm' | 'md' | 'lg',
  component: 'card' | 'button' | 'input'
) {
  const sizeMap = {
    card: {
      sm: 'p-ds-sm text-ds-sm',
      md: 'p-ds-md text-ds-base',
      lg: 'p-ds-lg text-ds-lg',
    },
    button: {
      sm: 'px-ds-sm py-ds-xs text-ds-sm',
      md: 'px-ds-md py-ds-sm text-ds-base',
      lg: 'px-ds-lg py-ds-md text-ds-lg',
    },
    input: {
      sm: 'px-ds-sm py-ds-xs text-ds-sm',
      md: 'px-ds-md py-ds-sm text-ds-base', 
      lg: 'px-ds-lg py-ds-md text-ds-lg',
    },
  };
  
  return sizeMap[component][size] || sizeMap[component]['md'];
}