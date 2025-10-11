# API Contracts: Port App to Next.js and Replace ShadCN with DaisyUI

**Feature**: 004-port-app-to  
**Date**: October 11, 2025  
**Status**: No external APIs - internal component contracts only

## Overview

This migration does not introduce any external API endpoints or backend services. This document defines the internal component interfaces and data contracts between Next.js Server Components, Client Components, and utility functions.

## Component Contracts

### Server Components (Data Providers)

#### HomePage (Root Route)

**File**: `app/page.tsx`  
**Type**: Server Component (default)  
**Purpose**: Load trip data and render trip list

**Contract**:
```typescript
/**
 * Home page - displays list of all trips
 * Server Component: Loads data at build time for static export
 */
export default function HomePage(): JSX.Element

// Internal data loading (not exposed)
const trips: Trip[] = tripsData.trips
```

**Responsibilities**:
- Import trips.json at build time
- Pass trip data to TripList component
- Render page layout with navigation

**No external inputs** - statically generated

---

#### TripDetailPage (Dynamic Route)

**File**: `app/trip/[tripId]/page.tsx`  
**Type**: Server Component (default)  
**Purpose**: Load specific trip data and render trip details

**Contract**:
```typescript
/**
 * Trip detail page - displays single trip with places
 * Server Component: Loads data at build time for static export
 */
interface TripDetailPageProps {
  params: {
    tripId: string  // From dynamic route
  }
}

export default function TripDetailPage({ 
  params 
}: TripDetailPageProps): JSX.Element

// Internal data loading (not exposed)
const trip: Trip | undefined = tripsData.trips.find(
  t => t.id === params.tripId
)
```

**Responsibilities**:
- Extract tripId from URL parameters
- Find matching trip from trips.json
- Render TripDetails component or 404 if not found

**Input**: URL parameter `tripId` (string)  
**Output**: Rendered trip detail page or redirect to not-found

---

### Client Components (Interactive UI)

#### TripList Component

**File**: `components/TripList.tsx`  
**Type**: Client Component (`'use client'`)  
**Purpose**: Display grid of trip cards with click handling

**Contract**:
```typescript
'use client'

export interface TripListProps {
  trips: Trip[]            // Array of trips to display
  isLoading?: boolean      // Optional loading state (default: false)
}

export function TripList({ 
  trips, 
  isLoading = false 
}: TripListProps): JSX.Element
```

**Responsibilities**:
- Render grid layout of TripCard components
- Handle empty state when trips array is empty
- Show loading skeleton when isLoading is true
- Handle trip selection and navigation via Next.js Link

**Props**:
- `trips`: Array of Trip objects (required)
- `isLoading`: Boolean flag for loading state (optional, default false)

**Events**: None (navigation handled via Link component)

---

#### TripCard Component

**File**: `components/TripCard.tsx`  
**Type**: Client Component (`'use client'`)  
**Purpose**: Display single trip summary as clickable card

**Contract**:
```typescript
'use client'

export interface TripCardProps {
  trip: Trip              // Trip data to display
}

export function TripCard({ trip }: TripCardProps): JSX.Element
```

**Responsibilities**:
- Display trip name, destination, dates
- Render trip image if available
- Provide visual feedback on hover/click
- Wrap in Next.js Link for navigation

**Props**:
- `trip`: Trip object (required)

**Styling**: DaisyUI card classes (`card`, `card-body`, etc.)

---

#### TripDetails Component

**File**: `components/TripDetails.tsx`  
**Type**: Client Component (`'use client'`)  
**Purpose**: Display full trip information with places

**Contract**:
```typescript
'use client'

export interface TripDetailsProps {
  trip: Trip              // Trip data to display
}

export function TripDetails({ trip }: TripDetailsProps): JSX.Element
```

**Responsibilities**:
- Display complete trip information
- Render list of PlaceCard components
- Show empty state if trip has no places
- Include back navigation button

**Props**:
- `trip`: Trip object (required)

**Child Components**: PlaceCard

---

#### PlaceCard Component

**File**: `components/PlaceCard.tsx`  
**Type**: Client Component (`'use client'`)  
**Purpose**: Display single place information

**Contract**:
```typescript
'use client'

export interface PlaceCardProps {
  place: Place            // Place data to display
}

export function PlaceCard({ place }: PlaceCardProps): JSX.Element
```

**Responsibilities**:
- Display place name, description, address
- Render place image if available
- Show notes if provided

**Props**:
- `place`: Place object (required)

**Styling**: DaisyUI card classes

---

#### Navigation Component

**File**: `components/Navigation.tsx`  
**Type**: Client Component (`'use client'`)  
**Purpose**: Render page header with back button

**Contract**:
```typescript
'use client'

export interface NavigationProps {
  title: string           // Page title to display
  showBackButton?: boolean // Show back button (default: false)
  backHref?: string       // Back button destination (default: '/')
}

export function Navigation({ 
  title, 
  showBackButton = false,
  backHref = '/'
}: NavigationProps): JSX.Element
```

**Responsibilities**:
- Display page title
- Render back button with Link when showBackButton is true
- Apply consistent header styling

**Props**:
- `title`: Page title string (required)
- `showBackButton`: Boolean to show/hide back button (optional)
- `backHref`: URL for back navigation (optional, default '/')

---

### Utility Functions

#### Date Formatting

**File**: `lib/utils.ts`  
**Purpose**: Format ISO date strings for display

**Contract**:
```typescript
/**
 * Format ISO date string to human-readable format
 * @param dateString - ISO 8601 date string (e.g., "2025-07-01")
 * @returns Formatted date string (e.g., "July 1, 2025")
 */
export function formatDate(dateString: string): string
```

**Example**:
```typescript
formatDate("2025-07-01") // "July 1, 2025"
```

---

#### Class Name Utilities

**File**: `lib/utils.ts`  
**Purpose**: Merge Tailwind/DaisyUI class names conditionally

**Contract**:
```typescript
/**
 * Conditionally merge class names
 * Uses clsx for conditional logic and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]): string
```

**Example**:
```typescript
cn('btn', 'btn-primary', someCondition && 'btn-lg')
// Returns: "btn btn-primary btn-lg" (if someCondition is true)
```

---

## Type Definitions

**File**: `types/index.ts`

All TypeScript interfaces remain unchanged from current implementation:

```typescript
// Core data types
export interface Trip {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  destination: string
  imageUrl?: string
  places: Place[]
}

export interface Place {
  id: string
  name: string
  description: string
  address?: string
  imageUrl?: string
  notes?: string
}

// Component prop types
export interface TripListProps {
  trips: Trip[]
  isLoading?: boolean
}

export interface TripCardProps {
  trip: Trip
}

export interface TripDetailsProps {
  trip: Trip
}

export interface PlaceCardProps {
  place: Place
}

export interface NavigationProps {
  title: string
  showBackButton?: boolean
  backHref?: string
}
```

---

## Next.js Specific Contracts

### Layout Contract

**File**: `app/layout.tsx`  
**Type**: Root Layout (Server Component)

**Contract**:
```typescript
export interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ 
  children 
}: RootLayoutProps): JSX.Element
```

**Responsibilities**:
- Set HTML lang attribute
- Apply DaisyUI theme via data-theme attribute
- Include global styles
- Render children (page components)

---

### Error Boundary Contract

**File**: `app/error.tsx`  
**Type**: Error Boundary (Client Component)

**Contract**:
```typescript
'use client'

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ 
  error, 
  reset 
}: ErrorPageProps): JSX.Element
```

**Responsibilities**:
- Display error message
- Provide retry button
- Log error for debugging

---

### Not Found Contract

**File**: `app/not-found.tsx`  
**Type**: 404 Page (Server Component)

**Contract**:
```typescript
export default function NotFound(): JSX.Element
```

**Responsibilities**:
- Display 404 message
- Provide link back to home page

---

## Data Loading Contract

### Static Data Import

All data loading uses standard ES module imports:

```typescript
// In Server Components
import tripsData from '@/data/trips.json'

// Type assertion for safety
const trips: Trip[] = tripsData.trips
```

**No async operations** - data available synchronously at build time

---

## Navigation Contract

### Client-Side Navigation

Use Next.js Link component for all navigation:

```typescript
import Link from 'next/link'

<Link href={`/trip/${trip.id}`}>
  <TripCard trip={trip} />
</Link>
```

**No programmatic navigation** - all navigation via declarative Link components for simplicity

---

## Theme Contract

### Theme Configuration

**File**: `tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        default: { /* color definitions */ },
        blue: { /* color definitions */ },
        green: { /* color definitions */ },
        red: { /* color definitions */ },
        violet: { /* color definitions */ },
      }
    ]
  }
}
```

### Theme Application

**File**: `app/layout.tsx`

```typescript
const theme = process.env.NEXT_PUBLIC_THEME || 'default'

<html lang="en" data-theme={theme}>
```

**Theme switching**: Build-time only via environment variable

---

## Validation Rules

### Type Safety
- All component props must have TypeScript interfaces
- All functions must have return type annotations
- No `any` types allowed (strict mode)
- Optional props must have default values or undefined handling

### Component Rules
- Server Components by default (no 'use client' unless needed)
- Client Components only when using hooks or event handlers
- All components must be pure functions
- No side effects in render

### Data Rules
- All trip IDs must be valid strings
- Dates must be ISO 8601 format
- Optional fields can be undefined or omitted
- Arrays can be empty (handle in UI)

---

## Migration Checklist

Component contracts to implement:

- [ ] `app/page.tsx` - HomePage Server Component
- [ ] `app/trip/[tripId]/page.tsx` - TripDetailPage Server Component
- [ ] `app/layout.tsx` - RootLayout with theme
- [ ] `app/error.tsx` - Error boundary
- [ ] `app/not-found.tsx` - 404 page
- [ ] `components/TripList.tsx` - Client Component
- [ ] `components/TripCard.tsx` - Client Component
- [ ] `components/TripDetails.tsx` - Client Component
- [ ] `components/PlaceCard.tsx` - Client Component
- [ ] `components/Navigation.tsx` - Client Component
- [ ] `lib/utils.ts` - Utility functions
- [ ] `types/index.ts` - Type definitions (copy existing)

---

## Summary

**Contract Type**: Internal component interfaces only  
**External APIs**: None  
**Data Source**: Static JSON file  
**Navigation**: Next.js Link components  
**State Management**: React Server Components + Client Components  

All contracts maintain compatibility with existing data model while adopting Next.js patterns for improved performance and simpler code structure.
