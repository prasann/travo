# Quickstart Guide: Minimalistic Frontend

**Phase**: 1 - Design & Contracts  
**Date**: October 10, 2025  
**Feature**: Minimalistic Frontend with Hardcoded Data

## Prerequisites

- Node.js 18+ installed
- Package manager: npm, yarn, or pnpm
- Code editor with TypeScript support (VS Code recommended)

## Project Setup

### 1. Initialize Vite Project

```bash
# Create new Vite project with React + TypeScript template
npm create vite@latest travo-frontend -- --template react-ts
cd travo-frontend

# Install dependencies
npm install
```

### 2. Install Required Dependencies

```bash
# Core routing
npm install react-router-dom

# ShadCN UI setup
npx shadcn-ui@latest init

# Additional ShadCN components (install as needed)
npx shadcn-ui@latest add button card input label
```

### 3. Configure Tailwind CSS

```bash
# Install Tailwind CSS (if not installed by ShadCN)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Setup Testing Environment

```bash
# Install testing dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

## Project Structure Creation

### 1. Create Directory Structure

```bash
mkdir -p src/{components,pages,types,data,lib,hooks,test}
mkdir -p src/components/ui
```

### 2. Setup TypeScript Types

Create `src/types/index.ts`:
```typescript
// Copy interfaces from contracts/interfaces.md
export interface Trip {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  updated_at: string;
  places: Place[];
}

export interface Place {
  id: string;
  trip_id: string;
  name: string;
  plus_code: string;
  notes?: string;
  order_index: number;
  updated_at: string;
}

// ... additional interfaces from contracts
```

### 3. Create Mock Data

Create `src/data/trips.json`:
```json
{
  "trips": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Tokyo Adventure",
      "description": "Spring cherry blossom trip to Tokyo",
      "start_date": "2025-04-01",
      "end_date": "2025-04-07",
      "updated_at": "2025-10-10T10:00:00.000Z",
      "places": [
        {
          "id": "456e7890-e12b-34c5-d678-901234567890",
          "trip_id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Tokyo Skytree",
          "plus_code": "8Q7XQXXR+33",
          "notes": "Great city view at sunset",
          "order_index": 0,
          "updated_at": "2025-10-10T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

### 4. Setup Routing

Update `src/App.tsx`:
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TripPage from './pages/TripPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trip/:tripId" element={<TripPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

## Component Development

### 1. Create Base Components

Start with these core components in order:

1. **TripCard** (`src/components/TripCard.tsx`)
2. **TripList** (`src/components/TripList.tsx`)
3. **PlaceCard** (`src/components/PlaceCard.tsx`)
4. **TripDetails** (`src/components/TripDetails.tsx`)
5. **Navigation** (`src/components/Navigation.tsx`)

### 2. Create Page Components

1. **HomePage** (`src/pages/HomePage.tsx`) - Trip list view
2. **TripPage** (`src/pages/TripPage.tsx`) - Trip details view

### 3. Component Template

Use this template for consistent component structure:

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComponentProps } from '@/types';

interface ComponentNameProps {
  // Define props based on contracts
}

const ComponentName: React.FC<ComponentNameProps> = ({ 
  // Destructure props
}) => {
  return (
    <Card className="component-name">
      <CardHeader>
        <CardTitle>Component Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Component content */}
      </CardContent>
    </Card>
  );
};

export default ComponentName;
```

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Access application at `http://localhost:5173`

### 2. Build for Production

```bash
npm run build
```

### 3. Run Tests

```bash
npm run test
```

### 4. Type Checking

```bash
npm run type-check
```

## Key Implementation Notes

### Data Loading
- Import mock data directly in components
- No API calls or async loading needed
- Data is statically typed with TypeScript interfaces

### Styling Guidelines
- Use Tailwind utility classes for styling
- Follow mobile-first responsive design
- Utilize ShadCN components for consistency
- Keep custom CSS minimal

### Component Patterns
- Use functional components with hooks
- Props drilling for simple state management
- React Router for navigation state
- TypeScript interfaces for all props

### Testing Strategy
- Unit tests for individual components
- Integration tests for page-level components
- Test user interactions (clicking, navigation)
- Verify responsive behavior

## Performance Optimization

### Bundle Size
- Tree-shake unused ShadCN components
- Import only needed React Router features
- Use dynamic imports for route components if needed

### Runtime Performance
- Memoize expensive calculations with useMemo
- Use React.memo for pure components
- Optimize re-renders with proper key props

## Deployment Preparation

### Static Site Generation
- Build outputs to `dist/` directory
- All assets are static (no server required)
- Can deploy to any static hosting service

### Environment Configuration
- Use Vite's built-in environment variable handling
- No environment-specific configuration needed for hardcoded data

## Next Steps

After completing this phase:

1. **Testing**: Add comprehensive component tests
2. **Responsive Design**: Test across all device sizes
3. **Accessibility**: Ensure keyboard navigation and screen reader support
4. **Performance**: Measure and optimize bundle size and load times

This quickstart provides the foundation for a clean, maintainable frontend that follows the constitution principles and prepares for future offline-first and sync capabilities.