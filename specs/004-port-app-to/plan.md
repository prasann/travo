# Implementation Plan: Port App to Next.js and Replace ShadCN with DaisyUI

**Branch**: `004-port-app-to` | **Date**: October 11, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-port-app-to/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate existing Vite + React + ShadCN trip planning application to Next.js 14 with App Router and replace ShadCN UI components with DaisyUI for simplified codebase. The migration preserves all existing functionality (trip list, trip details, theming) while reducing UI component complexity by at least 30%. All five theme variants (default, blue, green, red, violet) must work through DaisyUI's theming system.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)  
**Primary Dependencies**: Next.js 14+ (App Router), React 19.1.1, DaisyUI 4+, Tailwind CSS 4.1.14  
**Storage**: JSON file (trips.json) - no changes to data format  
**Testing**: NEEDS CLARIFICATION (current project has no test setup, need to determine if adding tests or keeping minimal)  
**Target Platform**: Web application (desktop + mobile browsers)
**Project Type**: Web application (single frontend, no backend)  
**Performance Goals**: <2s initial page load, <10% build time variance from current Vite setup  
**Constraints**: Must maintain offline-first capability per constitution, responsive design, TypeScript strict mode  
**Scale/Scope**: Small application (2 main pages, ~10 components, 5 theme variants)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Offline-First Architecture ✅ PASS
- **Status**: Compliant
- **Evidence**: Migration maintains JSON file-based data source. Next.js static generation supports offline-first after initial load. No new network dependencies introduced.

### Principle II: Privacy-Friendly Design ✅ PASS
- **Status**: Compliant
- **Evidence**: No changes to data handling. No new tracking or analytics. DaisyUI is UI-only, no data collection.

### Principle III: Minimalist User Experience ✅ PASS
- **Status**: Compliant - ENHANCED
- **Evidence**: Migration explicitly reduces UI complexity by 30%+ through DaisyUI's simpler component model. Mobile-first responsive design maintained via Tailwind CSS.

### Principle IV: Component-Driven Development ✅ PASS
- **Status**: Compliant
- **Evidence**: Next.js React Server Components maintain component-driven architecture. TypeScript interfaces preserved. Single responsibility principle maintained.

### Principle V: Sync Integrity & Conflict Resolution ✅ PASS
- **Status**: Compliant (N/A)
- **Evidence**: No sync mechanism in current implementation. Migration doesn't introduce sync features.

### Principle VI: Code Simplicity Over Defensive Programming ✅ PASS
- **Status**: Compliant - ENHANCED
- **Evidence**: This migration actively serves this principle by replacing complex ShadCN component customization with simpler DaisyUI configuration. Reduces custom CSS and component variants.

### Technology Constraints Review

**Current Violations Being Fixed**:
- Frontend Stack: ✅ React + TypeScript + Vite → **React + TypeScript + Next.js** (acceptable modern framework migration)
- UI Framework: ⚠️ ShadCN + Tailwind → **DaisyUI + Tailwind** (NEEDS JUSTIFICATION - see Complexity Tracking)

**Preserved Constraints**:
- TypeScript strict mode: ✅ Maintained
- Local storage: ✅ No changes (IndexedDB not yet implemented, JSON file remains)
- Component architecture: ✅ Maintained with React components

**Post-Design Re-Check Required**:
- ✅ **Offline-First**: Next.js static export (`output: 'export'`) generates static HTML/CSS/JS, fully supports offline-first
- ✅ **DaisyUI Themes**: All 5 themes implemented in tailwind.config.ts, confirmed in research.md
- ✅ **Static Deployment**: Build output is static files in `out/` directory, deployable to any static host

**Post-Design Constitution Check: ALL GATES PASS ✅**

All principles remain compliant after design phase. Framework changes enhance simplicity (Principle III & VI) while maintaining all other constitutional requirements.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```plaintext
travo-nextjs/                        # NEW Next.js application root
├── app/                             # Next.js App Router
│   ├── layout.tsx                   # Root layout with DaisyUI theme
│   ├── page.tsx                     # Home page (trip list)
│   ├── trip/
│   │   └── [tripId]/
│   │       └── page.tsx             # Trip detail page (dynamic route)
│   ├── not-found.tsx                # 404 page
│   └── error.tsx                    # Error boundary
├── components/                      # React components
│   ├── TripCard.tsx                 # Trip list item with DaisyUI card
│   ├── TripList.tsx                 # Trip list container
│   ├── TripDetails.tsx              # Trip detail view
│   ├── PlaceCard.tsx                # Place card with DaisyUI card
│   └── Navigation.tsx               # Page header
├── data/
│   └── trips.json                   # Same data file (unchanged)
├── lib/
│   └── utils.ts                     # Utility functions
├── styles/
│   └── globals.css                  # Global styles + Tailwind + DaisyUI themes
├── types/
│   └── index.ts                     # TypeScript type definitions (unchanged)
├── public/                          # Static assets
├── next.config.mjs                  # Next.js configuration
├── tailwind.config.ts               # Tailwind + DaisyUI configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies with Next.js + DaisyUI

travo-frontend/                      # EXISTING Vite app (kept for reference during migration)
└── [current structure remains for comparison]
```

**Structure Decision**: Selected Next.js App Router structure (web application pattern). This is a single-project frontend application with no backend. The App Router pattern provides:
- File-based routing replacing React Router
- Server Components for improved performance
- Built-in error boundaries and loading states
- Simplified data fetching patterns

Key differences from current structure:
- `src/` → `app/` for page components (Next.js convention)
- `pages/` merged into `app/` with route folders
- `components/ui/` eliminated (DaisyUI provides components)
- Theme files consolidated into single `globals.css` with DaisyUI theme config

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| UI Framework: ShadCN → DaisyUI | Achieves 30%+ code reduction goal. DaisyUI provides pre-styled components reducing custom CSS. Constitution Principle VI prioritizes simplicity. | Keeping ShadCN: Violates simplicity principle - requires maintaining 4 custom UI component files + extensive custom CSS. DaisyUI's configuration-based theming reduces maintenance burden. |
| Framework: Vite → Next.js | Modern React patterns, built-in routing, better performance with Server Components, industry standard for production React apps. | Keeping Vite: Requires maintaining React Router separately, no server-side rendering capability, less optimized production builds. Next.js aligns with constitution's performance standards. |

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETE

**Artifacts Generated**:
- ✅ `research.md` - Comprehensive technical research with 7 key decisions resolved
- ✅ All NEEDS CLARIFICATION items from Technical Context resolved
- ✅ Technology stack finalized: Next.js 14+, React 19.1.1, DaisyUI 4+, Tailwind CSS 4.1.14

**Key Decisions**:
1. Next.js App Router with static export for offline-first
2. DaisyUI multi-theme configuration (5 themes)
3. Component migration mapping (ShadCN → DaisyUI)
4. Testing deferred to future feature (maintain simplicity)
5. Build scripts using environment variables
6. Server Components for data loading
7. Built-in error boundaries and routing

**Risk Assessment**: Low-Medium risk, all mitigations documented

---

### Phase 1: Design ✅ COMPLETE

**Artifacts Generated**:
- ✅ `data-model.md` - Confirmed no changes to existing data model
- ✅ `contracts/interfaces.md` - Component interfaces and contracts documented
- ✅ `quickstart.md` - Complete developer setup guide with step-by-step instructions
- ✅ `.github/copilot-instructions.md` - Updated with new technology stack

**Design Highlights**:
- Data model: Zero changes, maintaining trips.json format
- Component contracts: 10 components with TypeScript interfaces
- Project structure: Next.js App Router pattern
- Migration path: Clear copy and adaptation strategy

**Constitution Re-Check**: ✅ All gates pass post-design

---

### Phase 2: Implementation Tasks

**Status**: NOT STARTED (requires `/speckit.tasks` command)

**Next Command**: `/speckit.tasks` to generate detailed implementation checklist

The planning phase is now complete. All research has been conducted, all technical unknowns have been resolved, and the implementation approach has been fully designed. The project is ready for task breakdown and implementation.

---

## Implementation Readiness Checklist

- ✅ Technical context defined
- ✅ Constitution compliance verified (pre and post-design)
- ✅ All NEEDS CLARIFICATION resolved
- ✅ Research completed with 7 key decisions
- ✅ Data model analyzed (no changes needed)
- ✅ Component contracts defined
- ✅ Developer quickstart guide created
- ✅ Agent context updated
- ✅ Project structure designed
- ✅ Complexity justified

**Ready for**: Task breakdown (`/speckit.tasks`) and implementation

**Estimated Implementation Time**: 4-6 hours (per quickstart.md)

**Implementation Risk**: LOW
- No data changes
- Static export maintains offline-first
- DaisyUI simplifies component code
- Next.js provides mature patterns

---

## Quick Reference

**Key Files Generated**:
- `specs/004-port-app-to/plan.md` (this file)
- `specs/004-port-app-to/research.md`
- `specs/004-port-app-to/data-model.md`
- `specs/004-port-app-to/contracts/interfaces.md`
- `specs/004-port-app-to/quickstart.md`

**Next Steps**:
1. Run `/speckit.tasks` to generate implementation tasks
2. Follow quickstart.md for setup
3. Implement components per contracts/interfaces.md
4. Test all functionality per spec.md success criteria
5. Deploy static build

**Questions or Issues**: Refer to quickstart.md troubleshooting section
