# Implementation Plan: CSS Theme Management System

**Branch**: `002-css-theming-for` | **Date**: October 10, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-css-theming-for/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement build-time CSS theme switching system using shadcn.studio standard themes. Developers can switch themes via build script parameters (e.g., `npm run build --theme=blue`) without modifying configuration files. System restricts to shadcn.studio predefined themes for consistency and gracefully falls back to default theme for invalid selections.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18.x and Node.js 18+  
**Primary Dependencies**: Vite (build tool), Tailwind CSS, ShadCN UI, shadcn.studio themes  
**Storage**: File-based theme definitions, no persistent storage required  
**Testing**: Vitest for unit tests, Playwright for theme switching validation  
**Target Platform**: Web browsers (desktop + mobile responsive)  
**Project Type**: Web application - existing React frontend structure  
**Performance Goals**: No build time degradation, instant theme switching at build time  
**Constraints**: Must preserve existing responsive design, maintain ShadCN compatibility  
**Scale/Scope**: 13+ shadcn.studio predefined themes, single frontend application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Offline-First Architecture

**Status**: COMPLIANT - Theme switching is build-time only, no network dependency

### ✅ Privacy-Friendly Design  

**Status**: COMPLIANT - No user data collection, purely visual theming

### ✅ Minimalist User Experience

**Status**: COMPLIANT - No UI changes for end users, developer-only feature

### ✅ Component-Driven Development

**Status**: COMPLIANT - Uses existing ShadCN components, maintains TypeScript interfaces

### ✅ Code Simplicity Over Defensive Programming

**Status**: COMPLIANT - Simple build-time theme switching, minimal error handling needed

### ✅ Technology Constraints

**Status**: COMPLIANT - Uses mandatory React + TypeScript + Vite + ShadCN + Tailwind stack

**Phase 1 Re-validation**: All constitutional principles remain satisfied after design phase. No complexity violations introduced.

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

```text
travo-frontend/
├── src/
│   ├── styles/
│   │   ├── themes/           # NEW: Theme definitions
│   │   │   ├── index.ts     # Theme selector/loader
│   │   │   ├── default.css  # Default shadcn theme
│   │   │   ├── blue.css     # Blue theme from shadcn.studio
│   │   │   ├── green.css    # Green theme from shadcn.studio
│   │   │   └── ...          # Other shadcn.studio themes
│   │   └── index.css        # Updated to import selected theme
│   ├── components/          # Existing ShadCN components (unchanged)
│   ├── pages/              # Existing pages (unchanged)
│   └── lib/                # Existing utilities (unchanged)
├── package.json            # Updated with theme build scripts
├── vite.config.ts          # Updated for theme build integration
└── tailwind.config.js      # Updated for theme variable support
```

**Structure Decision**: Web application structure using existing travo-frontend directory. Theme switching implemented as build-time CSS file selection with Vite configuration updates to handle theme parameter processing.

## Complexity Tracking

**Status**: No constitutional violations detected. Feature aligns with all constitutional principles and uses existing approved technology stack.
