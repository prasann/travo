/**
 * Theme system type definitions for shadcn.studio theme integration
 * Supports a curated set of themes for practical usage
 */

export type ThemeName = 
  | 'default'
  | 'blue'
  | 'green'
  | 'red'
  | 'violet';

export interface ThemeConfig {
  selectedTheme: ThemeName;
  fallbackTheme: ThemeName;
  availableThemes: ThemeName[];
}

/**
 * List of all available themes for validation and selection
 */
export const AVAILABLE_THEMES: ThemeName[] = ['default', 'blue', 'green', 'red', 'violet']

/**
 * Default theme fallback
 */
export const DEFAULT_THEME: ThemeName = 'default';