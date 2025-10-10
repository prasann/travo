# Build System Contracts

## Theme Build Interface

### Theme Selection Contract

**Input**: Build-time environment variable
```bash
VITE_THEME=blue npm run build
```

**Expected Behavior**:
- If `VITE_THEME` is valid theme name → Use specified theme
- If `VITE_THEME` is invalid/missing → Use default theme silently
- No build errors for invalid theme names
- Single theme CSS included in output bundle

### Available Theme Names

Valid theme parameters that can be passed to build system:

```typescript
type ValidThemeName = 
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
```

### Build Output Contract

**Theme CSS Integration**:
- Selected theme CSS variables injected into main CSS bundle
- No unused theme code included (tree-shaking applied)
- CSS custom properties available to all components
- Existing responsive and accessibility features preserved

**Bundle Size Impact**:
- Single theme adds ~2KB to CSS bundle
- No JavaScript bundle size impact
- Build time increase: <5 seconds

### Package.json Script Extensions

New scripts to support theme building:

```json
{
  "scripts": {
    "build": "vite build",
    "build:theme": "npm run build",
    "dev:theme": "vite --mode development"
  }
}
```

**Usage Examples**:
```bash
# Build with specific theme
npm run build --theme=blue

# Development with theme
npm run dev --theme=green

# Production build (uses default theme if no parameter)
npm run build
```

## File System Contracts

### Theme File Structure

Each theme file must follow this structure:

```css
/* [theme-name].css */
:root {
  /* Required CSS Custom Properties */
  --background: [hsl-value];
  --foreground: [hsl-value];
  --card: [hsl-value];
  --card-foreground: [hsl-value];
  --popover: [hsl-value];
  --popover-foreground: [hsl-value];
  --primary: [hsl-value];
  --primary-foreground: [hsl-value];
  --secondary: [hsl-value];
  --secondary-foreground: [hsl-value];
  --muted: [hsl-value];
  --muted-foreground: [hsl-value];
  --accent: [hsl-value];
  --accent-foreground: [hsl-value];
  --destructive: [hsl-value];
  --destructive-foreground: [hsl-value];
  --border: [hsl-value];
  --input: [hsl-value];
  --ring: [hsl-value];
  --radius: [rem-value];
}

.dark {
  /* Dark mode variants (optional) */
  --background: [hsl-value];
  --foreground: [hsl-value];
  /* ... other dark mode overrides */
}
```

### Theme Directory Contract

```text
src/styles/themes/
├── index.ts              # Theme loader (exports getThemeCSS function)
├── types.ts             # TypeScript definitions
└── themes/
    ├── default.css      # Required: fallback theme
    ├── blue.css         # shadcn.studio blue theme
    ├── green.css        # shadcn.studio green theme
    └── [theme].css      # Additional shadcn.studio themes
```

## Integration Points

### Vite Configuration Contract

Vite config must:
1. Read VITE_THEME environment variable
2. Validate theme name against available themes
3. Import correct theme CSS file at build time
4. Apply fallback logic for invalid themes

### Component Integration Contract

All existing ShadCN components automatically inherit theme:
- No component code changes required
- CSS custom properties applied via existing classes
- Tailwind utilities resolve to themed colors
- Responsive design preserved across all themes

### TypeScript Integration Contract

Theme system provides type safety:
- ThemeName type exported for build scripts
- Theme validation at build time
- No runtime theme switching types needed