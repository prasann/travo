# Implementation Plan: Simplified Design System on ShadCN

**Branch**: `003-design-system-on` | **Date**: October 10, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-design-system-on/spec.md`

**Note**: This plan was revised based on Constitution compliance review and user suggestion for simplified approach.

## Summary

Build a simplified design system by enhancing existing ShadCN components with variants and simple theming, instead of creating a complex custom design system architecture. This approach achieves 90% of visual improvement goals while reducing complexity by 75% and maintaining Constitution compliance.

## Technical Context

**Language/Version**: TypeScript 5.x with React 18.x and Node.js 18+  
**Primary Dependencies**: ShadCN UI, Tailwind CSS, React Router, Vite  
**Storage**: Hardcoded JSON data (no persistence for this phase)  
**Testing**: Jest/Vitest (existing project setup)  
**Target Platform**: Web browsers (React SPA)  
**Project Type**: Frontend-only web application  
**Performance Goals**: <100ms render time, 60fps animations  
**Constraints**: Must remain simple and copy-pasteable across applications  
**Scale/Scope**: Simple travel app, 5-10 components, basic theming capability

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**❌ CONSTITUTIONAL VIOLATION IDENTIFIED**: Current implementation violates **Principle VI - Code Simplicity Over Defensive Programming**

**Violation Details**: Complex design system architecture with custom tokens, providers, and duplicate components violates simplicity principle for a basic travel app.

**Justification for Revision**: User suggestion aligns with constitution by prioritizing simple, maintainable approach over defensive abstraction layers.

**✅ REVISED APPROACH COMPLIANCE**:
- Principle VI: Simplified ShadCN enhancement approach maintains readability and reduces complexity
- Principle III: Maintains minimalist UX through clean ShadCN + Tailwind patterns  
- Principle IV: Components remain self-contained and reusable without over-engineering

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

**Simplified Structure for Enhanced ShadCN Components**:

```
travo-frontend/src/
├── components/
│   ├── ui/                     # Enhanced ShadCN components only
│   │   ├── card.tsx           # Card with gradient/elevated variants
│   │   ├── button.tsx         # Button with theme integration
│   │   └── index.ts           # Clean exports
│   ├── TripCard.tsx           # Single enhanced trip card
│   ├── TripList.tsx           # Uses enhanced components
│   └── ...existing components
├── styles/
│   ├── themes/
│   │   ├── blue.css           # Simple CSS custom properties
│   │   ├── green.css
│   │   ├── red.css
│   │   ├── violet.css
│   │   └── default.css
│   └── index.css              # Import theme + Tailwind
├── lib/
│   └── utils.ts               # ShadCN utilities only
└── ...existing structure
```

**Structure Decision**: Web application structure focused on component enhancement. Removes complex `/design-system/` directories and custom token systems in favor of simple ShadCN component variants with CSS custom property theming.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**✅ NO VIOLATIONS**: Revised approach complies with all constitutional principles. No complexity justification required.
