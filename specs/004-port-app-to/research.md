# Research: Port App to Next.js and Replace ShadCN with DaisyUI

**Feature**: 004-port-app-to  
**Date**: October 11, 2025  
**Purpose**: Resolve technical unknowns and establish implementation patterns

## Research Tasks Completed

### 1. Next.js 14 App Router for Client-Side SPA Migration

**Question**: How to migrate React Router-based SPA to Next.js App Router while maintaining client-side navigation experience?

**Decision**: Use Next.js App Router with client-side navigation and static export for offline-first capability

**Rationale**:
- Next.js App Router provides file-based routing that directly replaces React Router
- Client Components (`'use client'` directive) maintain React 19 compatibility
- Static export via `output: 'export'` in next.config.mjs generates static HTML/CSS/JS
- Supports offline-first architecture through static asset serving
- Built-in loading and error states replace custom implementations

**Alternatives Considered**:
1. **Next.js Pages Router**: Older pattern, less optimal for modern React features
2. **Keep Vite + React Router**: Doesn't achieve framework modernization goal
3. **Remix**: More complex routing model, smaller ecosystem

**Implementation Pattern**:
```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static export for offline-first
  trailingSlash: true,
  images: {
    unoptimized: true  // Required for static export
  }
}
export default nextConfig

// app/layout.tsx - Root layout with DaisyUI
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="default">
      <body>{children}</body>
    </html>
  )
}

// app/page.tsx - Home page (client component)
'use client'
export default function HomePage() {
  // Client-side logic
}
```

---

### 2. DaisyUI Theming System for 5 Color Schemes

**Question**: How to implement 5 distinct theme variants (default, blue, green, red, violet) using DaisyUI's theming system?

**Decision**: Use DaisyUI's multi-theme configuration with custom color definitions

**Rationale**:
- DaisyUI supports unlimited custom themes via Tailwind config
- Each theme defined as color palette object
- Switched via `data-theme` attribute on HTML tag
- Eliminates need for separate CSS files per theme
- Reduces from 5 theme CSS files to 1 config object

**Alternatives Considered**:
1. **CSS Variables Only**: More verbose, less integration with Tailwind utilities
2. **Tailwind's Built-in Dark Mode**: Only supports light/dark, not multiple color schemes
3. **CSS Modules per Theme**: Maintains current complexity, doesn't reduce code

**Implementation Pattern**:
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        default: {
          'primary': '#3b82f6',
          'secondary': '#64748b',
          'accent': '#8b5cf6',
          'neutral': '#1f2937',
          'base-100': '#ffffff',
        },
        blue: {
          'primary': '#2563eb',
          'secondary': '#0ea5e9',
          'accent': '#06b6d4',
          'neutral': '#1e293b',
          'base-100': '#f8fafc',
        },
        green: {
          'primary': '#16a34a',
          'secondary': '#059669',
          'accent': '#10b981',
          'neutral': '#14532d',
          'base-100': '#f0fdf4',
        },
        red: {
          'primary': '#dc2626',
          'secondary': '#ef4444',
          'accent': '#f87171',
          'neutral': '#7f1d1d',
          'base-100': '#fef2f2',
        },
        violet: {
          'primary': '#7c3aed',
          'secondary': '#8b5cf6',
          'accent': '#a78bfa',
          'neutral': '#3730a3',
          'base-100': '#f5f3ff',
        },
      },
    ],
  },
}
export default config
```

**Theme Switching Approach**:
- Build-time: Set `data-theme` in layout.tsx based on environment variable
- Runtime: Use client-side state to switch `data-theme` attribute
- For feature scope: Implement build-time only (matching current build scripts)

---

### 3. Component Migration: ShadCN → DaisyUI Mapping

**Question**: How do ShadCN components map to DaisyUI equivalents?

**Decision**: Direct component replacements with simplified implementations

**Mapping Table**:

| Current ShadCN | DaisyUI Equivalent | Complexity Reduction |
|----------------|-------------------|----------------------|
| `Button` (custom variants) | `btn` class + modifiers | 40 lines → 0 lines (utility classes only) |
| `Card` (custom styles) | `card` class + `card-body` | 60 lines → 0 lines (utility classes only) |
| `Typography` (custom component) | Native HTML + `prose` classes | 50 lines → 0 lines (removed entirely) |
| Custom CSS variables | DaisyUI theme tokens | 200+ lines CSS → 50 lines config |

**Rationale**:
- DaisyUI provides semantic component classes
- No custom component files needed
- Styling via utility classes instead of CSS
- Achieves 30%+ code reduction target

**Implementation Examples**:
```tsx
// Before (ShadCN Button)
import { Button } from '@/components/ui/button'
<Button variant="primary" size="lg">Click Me</Button>

// After (DaisyUI Button)
<button className="btn btn-primary btn-lg">Click Me</button>

// Before (ShadCN Card)
import { Card, CardHeader, CardContent } from '@/components/ui/card'
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>

// After (DaisyUI Card)
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
  </div>
</div>
```

---

### 4. Testing Strategy Decision

**Question**: Should we add testing infrastructure during this migration?

**Decision**: Defer testing infrastructure to future feature; maintain minimal approach for this migration

**Rationale**:
- Current codebase has no tests
- Adding testing adds scope beyond "simplification" goal
- Constitution Principle VI: Code Simplicity Over Defensive Programming
- Testing can be added as separate feature once migration stabilizes

**Alternatives Considered**:
1. **Add Jest + React Testing Library**: Increases migration scope significantly
2. **Add Playwright E2E**: Valuable but scope creep
3. **No testing (current approach)**: Maintains simplicity, faster migration

**Recommendation**: Log as technical debt, address in feature 005 if needed

---

### 5. Build Script Migration for Theme Variants

**Question**: How to replicate current theme-specific build scripts (dev:blue, build:green, etc.) in Next.js?

**Decision**: Use environment variables with Next.js build process

**Implementation Pattern**:
```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "dev:blue": "NEXT_PUBLIC_THEME=blue next dev",
    "dev:green": "NEXT_PUBLIC_THEME=green next dev",
    "dev:red": "NEXT_PUBLIC_THEME=red next dev",
    "dev:violet": "NEXT_PUBLIC_THEME=violet next dev",
    "build": "next build",
    "build:blue": "NEXT_PUBLIC_THEME=blue next build",
    "build:green": "NEXT_PUBLIC_THEME=green next build",
    "build:red": "NEXT_PUBLIC_THEME=red next build",
    "build:violet": "NEXT_PUBLIC_THEME=violet next build"
  }
}
```

```tsx
// app/layout.tsx - Read theme from environment
const theme = process.env.NEXT_PUBLIC_THEME || 'default'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
```

**Rationale**:
- Maintains parity with current build system
- Simple environment variable approach
- No custom build plugins needed
- DaisyUI automatically applies theme based on `data-theme` attribute

---

### 6. Data Loading Pattern Migration

**Question**: How to migrate from client-side JSON imports to Next.js data patterns?

**Decision**: Keep simple JSON import pattern for static data; use Server Components for optimization

**Implementation Pattern**:
```tsx
// app/page.tsx (Server Component - default in App Router)
import tripsData from '@/data/trips.json'

export default function HomePage() {
  const trips = tripsData.trips
  
  return (
    <main>
      <TripList trips={trips} />
    </main>
  )
}

// components/TripList.tsx (Client Component for interactivity)
'use client'

export function TripList({ trips }: { trips: Trip[] }) {
  const [isLoading, setIsLoading] = useState(false)
  // Client-side logic
}
```

**Rationale**:
- Server Components eliminate client-side data loading state
- JSON file imported at build time
- Reduces bundle size (data not in client bundle)
- Maintains same data format (no changes to trips.json)

**Performance Impact**:
- Faster initial page load (data pre-rendered)
- Better SEO (content in HTML)
- Smaller JavaScript bundle

---

### 7. Error Boundary Migration

**Question**: How to migrate ErrorBoundary component to Next.js?

**Decision**: Use Next.js built-in error.tsx convention

**Implementation Pattern**:
```tsx
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-error">Something went wrong!</h2>
          <p>{error.message}</p>
          <button className="btn btn-primary" onClick={reset}>
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
```

**Rationale**:
- Next.js provides automatic error boundary per route
- Eliminates need for custom ErrorBoundary component
- Better error isolation (per-route instead of global)
- Simpler implementation

---

## Technology Stack Summary

### Final Stack
- **Framework**: Next.js 14.2+ (App Router, static export)
- **React**: 19.1.1 (maintained from current)
- **TypeScript**: 5.9.3 (maintained from current)
- **UI Library**: DaisyUI 4.x
- **Styling**: Tailwind CSS 4.1.14 (maintained from current)
- **Build Tool**: Next.js built-in (replaces Vite)
- **Package Manager**: npm (maintained from current)

### Dependencies to Add
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "daisyui": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^24.7.1",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "tailwindcss": "^4.1.14",
    "typescript": "~5.9.3",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6"
  }
}
```

### Dependencies to Remove
- `vite` - Replaced by Next.js
- `@vitejs/plugin-react` - Replaced by Next.js
- `react-router-dom` - Replaced by Next.js App Router
- `@radix-ui/react-slot` - No longer needed (DaisyUI doesn't require)
- `class-variance-authority` - No longer needed (DaisyUI uses utility classes)
- `lucide-react` - Can be kept if icons are used
- `tailwind-merge` - Can be kept for utility class merging
- `clsx` - Can be kept for conditional classes
- All ShadCN-related dependencies

---

## Best Practices Identified

### Next.js App Router
1. Use Server Components by default for data loading
2. Add `'use client'` only when needed (useState, useEffect, event handlers)
3. Use `loading.tsx` for loading states per route
4. Use `error.tsx` for error boundaries per route
5. Use `not-found.tsx` for 404 pages
6. Static export for offline-first capability

### DaisyUI Theming
1. Define all themes in single Tailwind config
2. Use semantic color names (primary, secondary, accent)
3. Switch themes via `data-theme` HTML attribute
4. Avoid custom CSS; use DaisyUI utilities
5. Use component class modifiers (btn-primary, card-compact)

### TypeScript
1. Maintain strict mode
2. Use Next.js TypeScript conventions
3. Keep existing type definitions (types/index.ts)
4. Add Next.js specific types as needed

### Performance
1. Leverage Server Components for data loading
2. Use static export for fastest delivery
3. Minimize client-side JavaScript
4. Use DaisyUI's CSS-only components when possible

---

## Migration Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Breaking offline-first | HIGH | Use static export, test offline functionality |
| Theme variants not working | MEDIUM | Test all 5 themes during development |
| Component behavior differences | MEDIUM | Careful testing of each component migration |
| Build time regression | LOW | Next.js generally faster than Vite for production |
| TypeScript errors | LOW | Maintain strict mode, fix incrementally |
| Lost functionality | MEDIUM | Comprehensive checklist of features to preserve |

---

## Open Questions (Resolved)

All NEEDS CLARIFICATION items from Technical Context have been resolved:

1. ✅ **Testing**: Decided to defer (maintain minimal approach)
2. ✅ **Next.js routing**: App Router with static export
3. ✅ **DaisyUI theming**: Multi-theme configuration
4. ✅ **Component mapping**: Direct replacements documented
5. ✅ **Build scripts**: Environment variable approach
6. ✅ **Data loading**: Server Component pattern
7. ✅ **Error handling**: Built-in error.tsx

---

## Next Steps

With research complete, proceed to:
1. **Phase 1**: Create data-model.md (minimal changes expected)
2. **Phase 1**: Create contracts/ (API patterns if needed)
3. **Phase 1**: Create quickstart.md (developer setup guide)
4. **Phase 2**: Generate tasks.md with implementation steps
