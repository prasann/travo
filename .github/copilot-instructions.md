# travo Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-10

## Active Technologies
- TypeScript 5.x (strict mode) + Next.js 15.5.4 (App Router), React 19.1.0, DaisyUI 5.2.0, Tailwind CSS 4.1.14
- JSON file (trips.json) - static data with no persistence
- TypeScript 5.x (strict mode), JavaScript ES2020+ + Next.js 15.5.4, React 19.1.0, DaisyUI 5.2.0, Tailwind CSS 4.1.14 (005-need-to-better)
- JSON files (one per trip) in `/frontend/data/trips/` directory, migrating from single `trips.json` (005-need-to-better)

## Project Structure
```
backend/
frontend/
tests/
```

## Commands
- `cd frontend && npm run dev` - Start development server
- `cd frontend && npm run build` - Build for production
- `cd frontend && npm run lint` - Run linter

## Code Style
- TypeScript strict mode enabled
- Use DaisyUI utility classes for styling
- Server Components by default, Client Components when needed
- Follow Next.js App Router conventions

## Recent Changes
- 005-need-to-better: Added TypeScript 5.x (strict mode), JavaScript ES2020+ + Next.js 15.5.4, React 19.1.0, DaisyUI 5.2.0, Tailwind CSS 4.1.14
- 004-port-app-to: Migrated to Next.js 15.5.4 + DaisyUI 5.2.0 + Tailwind CSS 4.1.14
- Renamed travo-nextjs to frontend directory

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
