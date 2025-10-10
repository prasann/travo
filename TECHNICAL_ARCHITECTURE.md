# Technical Architecture & File Structure

## Project Overview

Travo is a minimalistic trip planning frontend built with React 18, TypeScript 5, and Vite. The application follows a component-driven architecture with hardcoded JSON data for the initial implementation phase.

## Technology Stack

### Core Framework
- **React**: 19.1.1 (Latest stable)
- **TypeScript**: 5.9.3 (Strict mode enabled)
- **Vite**: 7.1.7 (Build tool and dev server)

### UI & Styling
- **ShadCN UI**: Component library built on Radix UI primitives
- **Tailwind CSS**: 4.1.14 (Utility-first styling)
- **Radix UI**: Headless UI components (@radix-ui/react-slot)

### Routing & State
- **React Router DOM**: 7.9.4 (Client-side routing)
- **Local State**: React hooks (useState, useEffect)

### Development Tools
- **ESLint**: 9.36.0 (Code linting)
- **PostCSS**: 8.5.6 (CSS processing)
- **TypeScript Compiler**: Strict type checking

## Project Structure

```
travo-frontend/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── ui/                     # ShadCN base components
│   │   │   ├── button.tsx          # Button primitive
│   │   │   └── card.tsx            # Card primitive
│   │   ├── ErrorBoundary.tsx       # Error handling wrapper
│   │   ├── Navigation.tsx          # Page header component
│   │   ├── PlaceCard.tsx          # Individual place display
│   │   ├── TripCard.tsx           # Trip list item component
│   │   ├── TripDetails.tsx        # Trip detail view component
│   │   └── TripList.tsx           # Trip list container
│   ├── data/
│   │   └── trips.json             # Hardcoded trip data
│   ├── hooks/                     # Custom React hooks (empty)
│   ├── lib/
│   │   └── utils.ts               # Utility functions
│   ├── pages/
│   │   ├── HomePage.tsx           # Trip list page
│   │   └── TripPage.tsx           # Trip detail page
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Root application component
│   ├── index.css                  # Global styles and Tailwind config
│   └── main.tsx                   # Application entry point
├── eslint.config.js               # ESLint configuration
├── package.json                   # Dependencies and scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration (workspace)
├── tsconfig.app.json              # Application TypeScript config
├── tsconfig.node.json             # Node.js TypeScript config
└── vite.config.ts                 # Vite build configuration
```

## Architecture Patterns

### Component Architecture
- **Functional Components**: All components use React functional components with hooks
- **Props Interface**: Every component has a corresponding TypeScript interface
- **Single Responsibility**: Each component handles one specific concern
- **Composition**: Components are composed together rather than using inheritance

### Data Flow
- **Hardcoded Data**: JSON file imported directly into components
- **Props Drilling**: Simple state management through component props
- **React Router**: URL-based navigation state management
- **Local Component State**: useState for component-specific state

### TypeScript Integration
- **Strict Mode**: Full type safety with strict TypeScript configuration
- **Interface-First**: All data structures defined as TypeScript interfaces
- **Component Props**: Typed props interfaces for all components
- **Utility Types**: Helper types for data manipulation

## File Responsibilities

### Core Application Files
- `main.tsx`: Application bootstrap and React DOM rendering
- `App.tsx`: Root component with routing and error boundary setup
- `index.css`: Global CSS, Tailwind directives, and custom component styles

### Component Layer
- `TripCard.tsx`: Displays individual trip summary in list view
- `TripList.tsx`: Container for trip cards with grid layout and empty states
- `TripDetails.tsx`: Comprehensive trip information with navigation
- `PlaceCard.tsx`: Individual place information within trip details
- `Navigation.tsx`: Consistent page header with title and back button
- `ErrorBoundary.tsx`: Application-wide error handling and recovery

### Page Layer
- `HomePage.tsx`: Trip list page with data loading and navigation
- `TripPage.tsx`: Trip details page with URL parameter handling

### Data & Types
- `types/index.ts`: Complete TypeScript interface definitions
- `data/trips.json`: Sample trip data with places and metadata
- `lib/utils.ts`: Date formatting, sorting, and utility functions

## Build Configuration

### Vite Configuration
- React plugin for JSX support
- Path aliases (`@/*` maps to `./src/*`)
- Development server on port 3000
- Production build optimization

### TypeScript Configuration
- Strict mode enabled for all type checking
- Path mapping for clean imports
- Separate configurations for app and Node.js code
- Vite client types included

### Tailwind Configuration
- ShadCN UI integration with CSS variables
- Custom component styles in layers
- Responsive breakpoints for mobile-first design
- Animation utilities included

## Development Workflow

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: TypeScript compilation + Vite production build
- `npm run lint`: ESLint code quality checks
- `npm run preview`: Preview production build locally

### Code Quality
- ESLint with React and TypeScript rules
- Automatic import sorting and unused variable detection
- TypeScript strict mode for compile-time error detection
- Component prop validation through TypeScript interfaces

## Performance Considerations

### Bundle Optimization
- Tree-shaking enabled for unused code elimination
- Minimal dependency footprint (22 total dependencies)
- ShadCN components imported individually
- CSS purging through Tailwind

### Runtime Performance
- React functional components with hooks
- Efficient re-rendering through proper key props
- Loading states for better perceived performance
- Responsive images and optimized assets

## Extension Points

### Adding New Components
1. Create component file in `src/components/`
2. Define TypeScript interface in `src/types/index.ts`
3. Add component styles to `src/index.css` if needed
4. Export and use in page components

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route definition in `App.tsx`
3. Update navigation in existing components
4. Define TypeScript interfaces for page props

### Data Layer Evolution
- Replace `src/data/trips.json` with API calls
- Add state management (Redux, Zustand) for complex state
- Implement caching layer for offline support
- Add optimistic updates for better UX