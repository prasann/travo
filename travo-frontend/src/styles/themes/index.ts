/**
 * Theme selection and loading logic for build-time theme switching
 * Handles VITE_THEME environment variable processing and fallback logic
 */

import type { ThemeName } from './types';
import { AVAILABLE_THEMES, DEFAULT_THEME } from './types';

/**
 * Get the selected theme from build environment
 * Falls back to default theme if invalid or missing
 */
export function getSelectedTheme(): ThemeName {
  const envTheme = import.meta.env.VITE_THEME as string;
  
  // Validate theme name against available themes
  if (envTheme && AVAILABLE_THEMES.includes(envTheme as ThemeName)) {
    return envTheme as ThemeName;
  }
  
  // Silent fallback to default theme (no error logging per requirements)
  return DEFAULT_THEME;
}

/**
 * Validate if a theme name is available
 */
export function isValidTheme(themeName: string): themeName is ThemeName {
  return AVAILABLE_THEMES.includes(themeName as ThemeName);
}

/**
 * Get theme CSS file path for the selected theme
 */
export function getThemeCSSPath(themeName: ThemeName): string {
  return `./themes/${themeName}.css`;
}

/**
 * Load theme CSS dynamically at build time
 * This function will be used by the main CSS file
 */
export function loadThemeCSS(): string {
  const selectedTheme = getSelectedTheme();
  return getThemeCSSPath(selectedTheme);
}