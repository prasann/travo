<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: None
- Added sections: Principle VI - Code Simplicity Over Defensive Programming
- Removed sections: None
- Templates requiring updates: ✅ All templates validated for consistency
- Follow-up TODOs: None - all placeholders filled
-->

# Travo Constitution

## Core Principles

### I. Offline-First Architecture (NON-NEGOTIABLE)

All features MUST work offline before implementing cloud sync. Local storage (IndexedDB) is the primary data source. Cloud sync (Supabase) acts as backup/sync mechanism only. Network failures cannot break core functionality.

**Rationale**: User data and functionality must be accessible without internet connectivity, ensuring reliability during travel when connectivity is unreliable.

### II. Privacy-Friendly Design

User data MUST remain under user control. Cloud sync is optional, not mandatory. No tracking, analytics, or third-party data sharing without explicit user consent. Plus Codes used instead of exact coordinates for location privacy.

**Rationale**: Travel data is sensitive; users must have full control over their personal trip information and location data.

### III. Minimalist User Experience

UI MUST prioritize simplicity and core functionality. Each feature addition requires justification against complexity cost. ShadCN + Tailwind components provide clean, consistent design language. Mobile-first responsive design mandatory.

**Rationale**: Travel planning should be stress-free; complex interfaces create barriers to quick trip organization and management.

### IV. Component-Driven Development

Frontend MUST use reusable, self-contained components. Each component requires TypeScript interfaces, proper props validation, and independent testability. Components follow single responsibility principle.

**Rationale**: Ensures maintainable, testable codebase that scales with feature additions while maintaining consistency.

### V. Sync Integrity & Conflict Resolution

Data synchronization MUST handle conflicts gracefully using timestamps (updated_at). Each record requires UUID for cross-device consistency. Local changes take precedence over cloud in conflicts. Sync failures cannot corrupt local data.

**Rationale**: Multi-device usage requires reliable data consistency without risking user data loss or corruption.

### VI. Code Simplicity Over Defensive Programming

Code MUST prioritize readability and simplicity over excessive error handling and defensive checks. Implement necessary validation only, not exhaustive edge case protection. Trust TypeScript's type system. Avoid over-engineering solutions. When choosing between simple and robust approaches, choose simple unless specific reliability risks are documented.

**Rationale**: Over-defensive programming creates code bloat, reduces maintainability, and slows development. Simple, readable code with targeted validation is more maintainable and delivers faster iteration cycles.

## Technology Constraints

**Frontend Stack**: React + TypeScript + Vite (mandatory)

- UI Framework: ShadCN + Tailwind CSS (mandatory)
- State Management: React Query for sync, Zustand for UI state
- Local Storage: IndexedDB via established library (Dexie recommended)

**Backend Stack**: FastAPI (Python) for background services only

- Hosting: Azure (leveraging existing credits)
- Database: Supabase for cloud sync and authentication
- Purpose: Batch jobs, backups, optional analytics only

**Location Data**: Google Maps Plus Codes (mandatory)

- Format: 8-character Plus Codes for location references
- Storage: Plus Code + human-readable name + user notes
- Privacy: Plus Codes provide location accuracy without exact coordinates

**Cross-Platform**: Single React web app

- Primary: Web browsers (desktop + mobile)
- Future: Optional Capacitor wrapper for native app distribution

## Development Standards

**Code Quality**:

- TypeScript strict mode mandatory
- ESLint + Prettier for code formatting
- Component props require TypeScript interfaces
- No `any` types without explicit justification

**Testing Strategy**:

- Unit tests for utility functions and components
- Integration tests for sync mechanisms
- End-to-end tests for critical user journeys
- Offline functionality testing mandatory

**Data Model Requirements**:

- Every entity requires UUID primary key
- Every entity requires `updated_at` timestamp for sync
- Relations use UUIDs, not auto-incrementing IDs
- Local schema must match cloud schema exactly

**Performance Standards**:

- Initial page load under 3 seconds on mobile
- Offline functionality available within 1 second
- Sync operations must be non-blocking to UI
- IndexedDB operations must use proper indexing

## Governance

This constitution supersedes all other development practices and architectural decisions. All feature specifications, implementation plans, and pull requests MUST verify compliance with these principles.

**Amendment Process**:

1. Proposed changes require documented justification
2. Impact assessment on existing features required
3. Version bump follows semantic versioning
4. Updated templates and documentation mandatory

**Compliance Verification**:

- All PRs must include constitution compliance checklist
- Architecture decisions require principle alignment justification
- Feature additions must demonstrate offline-first implementation
- Component additions must follow established patterns

**Complexity Justification**:

Any deviation from these principles requires explicit documentation of:

- Why simpler alternatives are insufficient
- How the complexity serves user needs
- Migration path for existing features

Use project README.md and implementation templates for runtime development guidance aligned with these principles.

**Version**: 1.1.0 | **Ratified**: 2025-10-10 | **Last Amended**: 2025-10-10
