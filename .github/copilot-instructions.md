# travo Development Guidelines

Last updated: 2025-10-15

## Active Technologies
- **Frontend Framework**: Next.js 15.5.4 (App Router), React 19.1.0
- **Language**: TypeScript 5.x (strict mode enabled)
- **UI/Styling**: DaisyUI 5.2.0, Tailwind CSS 4.1.14
- **Local Database**: IndexedDB via Dexie.js 4.2.1 (offline-first persistence)
- **Cloud Services**: Firebase 12.4.0 (Auth + Firestore)
- **Additional**: @dnd-kit (drag-drop), Lucide React (icons), react-hook-form

## Project Structure
```
frontend/
  ├── app/              # Next.js App Router (pages, layouts, API routes)
  ├── components/       # React components (UI + edit mode)
  ├── lib/              # Core logic (db, firebase, sync, services, utils)
  ├── contexts/         # React contexts (Auth)
  ├── types/            # TypeScript type definitions
  ├── hooks/            # Custom React hooks
  ├── config/           # Configuration (theme)
  └── public/           # Static assets
```

## Commands
- `cd frontend && npm run dev` - Start development server
- `cd frontend && npm run build` - Build for production
- `cd frontend && npm run lint` - Run linter

## Code Style
- TypeScript strict mode enabled
- Use DaisyUI utility classes for styling
- Server Components by default, Client Components when needed (`'use client'`)
- Follow Next.js App Router conventions
- All database operations return `Result<T>` type for explicit error handling
- **Do not add unused methods or "future-use" code** - add functionality only when explicitly needed

## Key Architecture Patterns
- **Offline-first**: IndexedDB as primary storage, Firestore for cloud sync
- **Data flow**: User actions → IndexedDB → Sync Queue → Firestore (background)
- **Provider hierarchy**: AuthProvider → DatabaseProvider → SyncProvider → App
- **Edit mode**: Category-based editing with Google Maps integration for place lookup

## Documentation
When making significant changes to features, data models, or architecture:
- Update `/specs/product-requirements.md` if user-facing features change
- Update `/specs/technical-specifications.md` if implementation details change
- Keep both documents in sync with the actual codebase

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
