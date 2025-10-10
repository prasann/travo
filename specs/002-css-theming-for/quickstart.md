# Quick Start: CSS Theme Management System

**Feature**: CSS Theme Management System  
**Updated**: October 10, 2025

## Overview

This guide explains how to use the CSS theme management system to build the Travo application with different shadcn.studio themes.

## Basic Usage

### Building with Different Themes

```bash
# Build with default theme (zinc-based)
npm run build

# Build with blue theme
npm run build --theme=blue

# Build with green theme  
npm run build --theme=green

# Build with any shadcn.studio theme
npm run build --theme=violet
```

### Development with Themes

```bash
# Start development server with specific theme
npm run dev --theme=blue

# Development defaults to default theme if no parameter provided
npm run dev
```

## Available Themes

All shadcn.studio themes are supported:

| Theme Name | Description |
|------------|-------------|
| `default` | Default zinc-based theme |
| `slate` | Cool gray palette |
| `gray` | Neutral gray palette |
| `neutral` | Warm gray palette |
| `stone` | Brown-tinted gray palette |
| `red` | Red accent theme |
| `rose` | Pink-red accent theme |
| `orange` | Orange accent theme |
| `amber` | Yellow-orange accent theme |
| `yellow` | Yellow accent theme |
| `lime` | Yellow-green accent theme |
| `green` | Green accent theme |
| `emerald` | Blue-green accent theme |
| `teal` | Teal accent theme |
| `cyan` | Light blue accent theme |
| `sky` | Sky blue accent theme |
| `blue` | Blue accent theme |
| `indigo` | Deep blue accent theme |
| `violet` | Purple-blue accent theme |
| `purple` | Purple accent theme |
| `fuchsia` | Magenta accent theme |
| `pink` | Pink accent theme |

## Theme Switching Workflow

### For Developers

1. **Choose Theme**: Select from available shadcn.studio themes
2. **Build Command**: Run build with `--theme=<name>` parameter
3. **Deploy**: Deploy the themed build to your environment

### Example Deployment Workflow

```bash
# Development workflow
npm run dev --theme=blue          # Test theme locally
npm run build --theme=blue        # Build for production
npm run preview                   # Preview production build

# CI/CD Integration
VITE_THEME=blue npm run build     # Environment variable approach
```

## Error Handling

### Invalid Theme Names

When an invalid theme name is provided:

```bash
# Invalid theme name
npm run build --theme=invalid-theme
# → Silently falls back to default theme
# → Build continues without error
# → No notification about fallback
```

### Missing Theme Parameter

```bash
# No theme specified
npm run build
# → Uses default theme
# → Normal build process
```

## File Structure After Setup

```text
travo-frontend/
├── src/
│   ├── styles/
│   │   ├── themes/
│   │   │   ├── index.ts         # Theme selector
│   │   │   ├── types.ts         # TypeScript definitions  
│   │   │   └── themes/
│   │   │       ├── default.css  # Default theme
│   │   │       ├── blue.css     # Blue theme
│   │   │       ├── green.css    # Green theme
│   │   │       └── ...          # Other themes
│   │   └── index.css           # Updated main stylesheet
│   └── ...                     # Existing components unchanged
├── package.json                # Updated with theme scripts
├── vite.config.ts              # Updated for theme processing
└── tailwind.config.js          # Updated for theme variables
```

## Component Usage

### No Changes Required

Existing components automatically use the selected theme:

```tsx
// Existing component - no changes needed
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export function TripCard() {
  return (
    <Card className="trip-card">  {/* Automatically themed */}
      <CardHeader>
        <CardTitle>Trip to Paris</CardTitle>
      </CardHeader>
    </Card>
  );
}
```

### CSS Custom Properties Available

All shadcn.studio CSS variables are available:

```css
.custom-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
```

## Verification

### Check Active Theme

After building, verify the theme is applied:

1. **Build Output**: Check for theme-specific CSS in build output
2. **Visual Inspection**: Components show theme colors
3. **Browser DevTools**: CSS custom properties reflect theme values

### Theme Coverage Testing

Test theme switching across different components:

```bash
# Test multiple themes for consistency
npm run build --theme=blue && npm run preview
npm run build --theme=green && npm run preview  
npm run build --theme=violet && npm run preview
```

## Troubleshooting

### Build Issues

- **Theme not applying**: Check theme name spelling against available list
- **Missing CSS variables**: Ensure theme file includes all required properties
- **Build errors**: Verify Vite configuration is properly updated

### Development Issues

- **Theme not visible in dev**: Restart dev server after theme parameter change
- **Mixed themes**: Clear browser cache if seeing cached theme styles

## Integration Notes

### CI/CD Pipelines

```bash
# Environment variable approach for CI/CD
export VITE_THEME=blue
npm run build

# Or direct parameter
npm run build --theme=blue
```

### Docker Builds

```dockerfile
# In Dockerfile
ARG THEME_NAME=default
ENV VITE_THEME=$THEME_NAME
RUN npm run build
```

## Next Steps

1. **Implementation**: Follow Phase 2 tasks to implement the system
2. **Testing**: Set up theme validation tests
3. **Documentation**: Update project README with theme instructions
4. **Deployment**: Configure deployment pipeline for theme selection