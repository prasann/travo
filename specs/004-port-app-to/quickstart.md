# Quick Start Guide: Port App to Next.js and Replace ShadCN with DaisyUI

**Feature**: 004-port-app-to  
**Date**: October 11, 2025  
**Target Audience**: Developers implementing this migration

## Overview

This guide provides step-by-step instructions to migrate the Travo app from Vite + React + ShadCN to Next.js + DaisyUI. Follow these steps in order for a smooth migration.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Familiarity with React, TypeScript, and Next.js basics
- Access to current Travo codebase (`travo-frontend/`)

## Quick Start (TL;DR)

```bash
# 1. Create new Next.js app
npx create-next-app@latest travo-nextjs --typescript --tailwind --app --no-src-dir

# 2. Install DaisyUI
cd travo-nextjs
npm install daisyui

# 3. Copy data and types from old app
cp -r ../travo-frontend/src/data ./data
cp -r ../travo-frontend/src/types ./types

# 4. Configure Tailwind for DaisyUI (edit tailwind.config.ts)
# 5. Create components and pages (see detailed steps below)
# 6. Test all functionality
# 7. Deploy
```

## Detailed Setup Steps

### Step 1: Create Next.js Application

Create a new Next.js 14+ app with TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest travo-nextjs \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

**Prompts to answer**:
- TypeScript? **Yes**
- ESLint? **Yes**
- Tailwind CSS? **Yes**
- `src/` directory? **No** (use app/ directly)
- App Router? **Yes**
- Import alias? **Yes** (@/*)

**Result**: New `travo-nextjs/` directory with Next.js scaffolding

---

### Step 2: Install Dependencies

```bash
cd travo-nextjs

# Install DaisyUI
npm install daisyui

# Install utility libraries (if needed)
npm install clsx tailwind-merge

# Optional: Install Lucide icons if used in current app
npm install lucide-react
```

**Verify installation**:
```bash
npm list daisyui
# Should show: daisyui@4.x.x
```

---

### Step 3: Configure Tailwind CSS with DaisyUI

Edit `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
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
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        blue: {
          'primary': '#2563eb',
          'secondary': '#0ea5e9',
          'accent': '#06b6d4',
          'neutral': '#1e293b',
          'base-100': '#f8fafc',
          'base-200': '#e2e8f0',
          'base-300': '#cbd5e1',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        green: {
          'primary': '#16a34a',
          'secondary': '#059669',
          'accent': '#10b981',
          'neutral': '#14532d',
          'base-100': '#f0fdf4',
          'base-200': '#dcfce7',
          'base-300': '#bbf7d0',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        red: {
          'primary': '#dc2626',
          'secondary': '#ef4444',
          'accent': '#f87171',
          'neutral': '#7f1d1d',
          'base-100': '#fef2f2',
          'base-200': '#fee2e2',
          'base-300': '#fecaca',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        violet: {
          'primary': '#7c3aed',
          'secondary': '#8b5cf6',
          'accent': '#a78bfa',
          'neutral': '#3730a3',
          'base-100': '#f5f3ff',
          'base-200': '#ede9fe',
          'base-300': '#ddd6fe',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
      },
    ],
  },
}

export default config
```

---

### Step 4: Configure Next.js for Static Export

Edit `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export for offline-first
  trailingSlash: true,
  images: {
    unoptimized: true,  // Required for static export
  },
}

export default nextConfig
```

**Why**: Static export enables offline-first capability per constitution

---

### Step 5: Copy Data and Types

```bash
# From travo-nextjs directory

# Create directories
mkdir -p data lib

# Copy trips data
cp ../travo-frontend/src/data/trips.json ./data/

# Copy type definitions
cp -r ../travo-frontend/src/types ./types

# Copy utility functions
cp ../travo-frontend/src/lib/utils.ts ./lib/
```

**Verify**:
```bash
ls data/       # Should have trips.json
ls types/      # Should have index.ts
ls lib/        # Should have utils.ts
```

---

### Step 6: Update Root Layout

Edit `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import './globals.css'

const theme = process.env.NEXT_PUBLIC_THEME || 'default'

export const metadata: Metadata = {
  title: 'Travo - Trip Planner',
  description: 'Simple and elegant trip planning',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme={theme}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

---

### Step 7: Update Global Styles

Edit `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-base-100 text-base-content;
  }
}

@layer utilities {
  .page-container {
    @apply container mx-auto px-4 py-8;
  }
}
```

---

### Step 8: Create Components

#### Create `components/TripCard.tsx`:

```typescript
'use client'

import Link from 'next/link'
import type { Trip } from '@/types'

export interface TripCardProps {
  trip: Trip
}

export function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
        {trip.imageUrl && (
          <figure className="h-48">
            <img 
              src={trip.imageUrl} 
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          </figure>
        )}
        <div className="card-body">
          <h2 className="card-title">{trip.name}</h2>
          <p className="text-sm text-base-content/70">{trip.destination}</p>
          <p className="text-xs text-base-content/50">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
          <p className="line-clamp-2 text-sm">{trip.description}</p>
          <div className="card-actions justify-end">
            <div className="badge badge-primary">{trip.places.length} places</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

#### Create `components/TripList.tsx`:

```typescript
'use client'

import { TripCard } from './TripCard'
import type { Trip } from '@/types'

export interface TripListProps {
  trips: Trip[]
  isLoading?: boolean
}

export function TripList({ trips, isLoading = false }: TripListProps) {
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-32 w-full"></div>
      </div>
    )
  }

  if (trips.length === 0) {
    return (
      <div className="page-container">
        <div className="alert alert-info">
          <span>No trips found. Start planning your next adventure!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1 className="text-4xl font-bold mb-8">My Trips</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}
```

#### Create additional components:
- `components/PlaceCard.tsx` (similar pattern to TripCard)
- `components/TripDetails.tsx` (renders trip info + list of PlaceCards)
- `components/Navigation.tsx` (page header with back button)

---

### Step 9: Create Pages

#### Create `app/page.tsx` (Home Page):

```typescript
import { TripList } from '@/components/TripList'
import tripsData from '@/data/trips.json'

export default function HomePage() {
  const trips = tripsData.trips

  return (
    <main className="min-h-screen">
      <TripList trips={trips} />
    </main>
  )
}
```

#### Create `app/trip/[tripId]/page.tsx` (Trip Detail):

```typescript
import { notFound } from 'next/navigation'
import { TripDetails } from '@/components/TripDetails'
import tripsData from '@/data/trips.json'

interface TripPageProps {
  params: {
    tripId: string
  }
}

export default function TripPage({ params }: TripPageProps) {
  const trip = tripsData.trips.find(t => t.id === params.tripId)

  if (!trip) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <TripDetails trip={trip} />
    </main>
  )
}
```

#### Create `app/not-found.tsx`:

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-error mb-4">404</h1>
        <p className="text-xl mb-6">Page not found</p>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
```

#### Create `app/error.tsx`:

```typescript
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
      <div className="card bg-base-100 shadow-xl max-w-md">
        <div className="card-body">
          <h2 className="card-title text-error">Something went wrong!</h2>
          <p className="text-sm">{error.message}</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={reset}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Step 10: Update Package Scripts

Edit `package.json` scripts:

```json
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
    "build:violet": "NEXT_PUBLIC_THEME=violet next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

---

## Testing the Migration

### Local Development

```bash
# Start default theme
npm run dev

# Start with specific theme
npm run dev:blue
# or
npm run dev:green
# or
npm run dev:red
# or
npm run dev:violet
```

**Visit**: http://localhost:3000

### Test Checklist

- [ ] Home page loads with all trips
- [ ] Trip cards display correctly with DaisyUI styling
- [ ] Clicking trip card navigates to detail page
- [ ] Trip detail page shows all places
- [ ] Back navigation works
- [ ] 404 page appears for invalid URLs
- [ ] All 5 themes work (test each dev:* script)
- [ ] Responsive design works on mobile
- [ ] No TypeScript errors (`npm run build`)
- [ ] Static export succeeds (`npm run build`)

---

## Production Build

```bash
# Build with default theme
npm run build

# Build with specific theme
npm run build:blue

# Preview production build
npm run start
```

**Output**: `out/` directory with static files ready for deployment

---

## Deployment

Since we use static export, deploy the `out/` directory to any static host:

```bash
# Example: Deploy to Vercel
vercel deploy

# Example: Deploy to Netlify
netlify deploy --dir=out --prod

# Example: Deploy to GitHub Pages
# (configure .github/workflows/deploy.yml)
```

---

## Troubleshooting

### Issue: TypeScript errors on import paths

**Solution**: Ensure `tsconfig.json` has correct paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: DaisyUI classes not working

**Solution**: Verify `tailwind.config.ts` includes:
```typescript
plugins: [require('daisyui')]
```

### Issue: Theme not applying

**Solution**: Check `data-theme` attribute in `app/layout.tsx`:
```typescript
<html lang="en" data-theme={theme}>
```

### Issue: Static export fails

**Solution**: Ensure all pages are static (no getServerSideProps), and images are unoptimized in `next.config.mjs`

---

## Migration Verification

Compare functionality with original app:

| Feature | Original (Vite) | New (Next.js) | Status |
|---------|----------------|---------------|--------|
| View trip list | ✅ | ✅ | Migrated |
| View trip details | ✅ | ✅ | Migrated |
| Theme switching | ✅ | ✅ | Migrated |
| Responsive design | ✅ | ✅ | Migrated |
| Error handling | ✅ | ✅ | Improved |
| 404 pages | ✅ | ✅ | Migrated |
| TypeScript strict | ✅ | ✅ | Maintained |

---

## Next Steps

After successful migration:

1. **Archive old app**: Rename `travo-frontend` to `travo-frontend-archived`
2. **Update documentation**: Update README with new stack
3. **Add to CI/CD**: Configure deployment pipeline
4. **Monitor performance**: Compare build times and page load speeds
5. **Gather feedback**: Test with users

---

## Getting Help

- **Next.js Docs**: https://nextjs.org/docs
- **DaisyUI Docs**: https://daisyui.com/docs
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Project Issues**: File in project repository

---

## Summary

**Time Estimate**: 4-6 hours for full migration  
**Complexity**: Medium (straightforward component migration)  
**Risk**: Low (no data changes, static export maintains offline-first)

Follow this guide step-by-step, test thoroughly, and you'll have a cleaner, more maintainable codebase with Next.js and DaisyUI! 🚀
