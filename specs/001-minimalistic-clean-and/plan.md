# Implementation Plan: Minimalistic Frontend with Hardcoded Data

**Branch**: `001-minimalistic-clean-and` | **Date**: October 10, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-minimalistic-clean-and/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Create a minimalistic, clean frontend for the Travo trip planner app using hardcoded JSON data. The application will display trip lists and detailed trip views with responsive design, built using React + TypeScript + Vite with ShadCN + Tailwind CSS. Recent clarifications confirm that trip names will be reasonable length and Plus Codes are pre-validated in hardcoded data, simplifying edge case handling.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18.x and Node.js 18+  
**Primary Dependencies**: React, TypeScript, Vite, ShadCN UI, Tailwind CSS, React Router  
**Storage**: Hardcoded JSON data (no persistence for this phase)  
**Testing**: Vitest (Vite's native testing framework) + React Testing Library  
**Target Platform**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+)  
**Project Type**: Single-page web application  
**Performance Goals**: Page load <2s, navigation <1s, responsive 320px-1920px  
**Constraints**: Offline-capable ready (hardcoded data), mobile-first responsive design  
**Scale/Scope**: 2 main views (trip list + trip details), ~5-8 React components, minimal library count

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

**✅ I. Offline-First Architecture**: Using hardcoded JSON data ensures offline functionality from day one. No network dependencies for core features.

**✅ II. Privacy-Friendly Design**: No data collection, tracking, or third-party services. Plus Codes used for location privacy. Hardcoded data keeps everything local.

**✅ III. Minimalist User Experience**: ShadCN + Tailwind provides clean design. Mobile-first responsive design. Simple navigation between 2 core views.

**✅ IV. Component-Driven Development**: React components with TypeScript interfaces. Each component self-contained and testable. Single responsibility principle.

**✅ V. Sync Integrity & Conflict Resolution**: Not applicable for hardcoded data phase, but data structure follows UUID + updated_at pattern from README.

**✅ VI. Code Simplicity**: Minimal dependencies (React, Vite, ShadCN, Tailwind). Simple component structure. No over-engineering for hardcoded data phase.

**✅ Technology Constraints**: React + TypeScript + Vite (mandatory). ShadCN + Tailwind CSS (mandatory). Web browsers target platform.

### Post-Phase 1 Design Review (Updated with Clarifications)

**✅ I. Offline-First Architecture**: Data model and contracts maintain offline-first approach. All interfaces designed for local-first data access with sync-ready structure.

**✅ II. Privacy-Friendly Design**: No external API contracts. Data remains local with Plus Code privacy preserved. Clarification confirms Plus Codes are pre-validated, eliminating privacy risk from invalid data.

**✅ III. Minimalist User Experience**: Component contracts focus on core functionality. Simple prop interfaces avoid complexity. Clear navigation patterns established. Clarification that trip names are reasonable length eliminates need for complex text handling.

**✅ IV. Component-Driven Development**: TypeScript interfaces enforce component boundaries. Each component has clear contracts and single responsibilities defined.

**✅ V. Sync Integrity & Conflict Resolution**: Data model includes UUID and updated_at fields as required. Structure supports future sync implementation.

**✅ VI. Code Simplicity**: Minimal dependency list in quickstart. Simple component patterns chosen. No unnecessary abstractions in contracts. Clarifications eliminate need for defensive text truncation and Plus Code validation.

**✅ Technology Constraints**: All design artifacts use mandated technology stack. No deviations from constitution requirements.

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

```typescript
src/
├── components/           # Reusable UI components
│   ├── ui/              # ShadCN base components
│   ├── TripCard.tsx     # Trip list item component
│   ├── TripList.tsx     # Trip list container
│   ├── TripDetails.tsx  # Trip detail view
│   ├── PlaceCard.tsx    # Individual place component
│   └── Navigation.tsx   # Navigation/header component
├── data/                # Hardcoded JSON data
│   └── trips.json       # Sample trip and place data
├── types/               # TypeScript type definitions
│   └── index.ts         # Trip, Place, and other interfaces
├── hooks/               # Custom React hooks (if needed)
├── pages/               # Route components
│   ├── HomePage.tsx     # Trip list page
│   └── TripPage.tsx     # Trip detail page
├── lib/                 # Utilities and helpers
│   └── utils.ts         # Date formatting, etc.
├── App.tsx              # Main app component with routing
├── main.tsx             # Vite entry point
└── index.css            # Global Tailwind styles

tests/
├── components/          # Component unit tests
├── pages/               # Page integration tests
└── setup.ts             # Test configuration

public/
└── [Vite static assets]

package.json             # Dependencies and scripts
vite.config.ts           # Vite configuration
tailwind.config.js       # Tailwind CSS configuration
tsconfig.json            # TypeScript configuration
```

**Structure Decision**: Single frontend web application structure using Vite's recommended React + TypeScript template. Components organized by functionality with clear separation of concerns: UI components, data types, routing pages, and utilities. Simplified based on clarifications that text handling and Plus Code validation are not needed.

## Complexity Tracking

*No constitution violations identified. All principles satisfied by the minimalistic frontend approach with clarifications.*

### Simplifications Achieved Through Clarifications

1. **Text Handling**: No special truncation or overflow handling needed since trip names are reasonable length
2. **Data Validation**: No Plus Code validation logic needed since data is pre-validated in hardcoded JSON
3. **Edge Case Handling**: Reduced complexity by eliminating defensive programming for non-applicable scenarios
