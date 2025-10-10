/**
 * Theme Configuration and Provider
 * Utilities for managing themes and providing theme context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Theme configuration interface
export interface ThemeConfiguration {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: Record<string, string>;
    lineHeight: Record<string, string>;
  };
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Theme context interface
export interface ThemeContextValue {
  theme: ThemeConfiguration;
  setTheme: (themeId: string) => void;
  availableThemes: ThemeConfiguration[];
}

// Default theme configuration
export const defaultTheme: ThemeConfiguration = {
  id: 'default',
  name: 'Default Theme',
  colors: {
    primary: 'hsl(220, 90%, 56%)',
    secondary: 'hsl(220, 30%, 18%)',
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(220, 13%, 9%)',
    muted: 'hsl(220, 9%, 46%)',
    border: 'hsl(220, 13%, 91%)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
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
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '3rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    hover: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
  },
};

// Available themes
export const availableThemes: ThemeConfiguration[] = [defaultTheme];

// Theme context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode;
  theme?: ThemeConfiguration;
}

export function ThemeProvider({ children, theme: initialTheme }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfiguration>(
    initialTheme || defaultTheme
  );

  // Apply theme CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply spacing variables
    Object.entries(currentTheme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Apply shadow variables
    Object.entries(currentTheme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
    }
  };

  const value: ThemeContextValue = {
    theme: currentTheme,
    setTheme,
    availableThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Theme factory utility
export function createTheme(
  config: Partial<ThemeConfiguration> & { id: string; name: string }
): ThemeConfiguration {
  return {
    ...defaultTheme,
    ...config,
    colors: { ...defaultTheme.colors, ...config.colors },
    typography: { ...defaultTheme.typography, ...config.typography },
    spacing: { ...defaultTheme.spacing, ...config.spacing },
    shadows: { ...defaultTheme.shadows, ...config.shadows },
    borderRadius: { ...defaultTheme.borderRadius, ...config.borderRadius },
  };
}