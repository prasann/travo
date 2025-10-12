# Quickstart: Trip Edit Mode

**Feature**: 006-edit-mode-for  
**Date**: October 12, 2025  
**Status**: Ready for implementation

## Prerequisites

- Node.js 18+ installed
- Frontend dev server running (`cd frontend && npm run dev`)
- Google Maps API key obtained from Google Cloud Console
- Existing travo project with IndexedDB implementation (feature 005)

## Environment Setup

### 1. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable "Geocoding API"
4. Create API key
5. Restrict API key:
   - **Application restrictions**: HTTP referrers
   - **Referrers**: `localhost:3000`, your domain
   - **API restrictions**: Geocoding API only
6. Add to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### 2. Install Dependencies

```bash
cd frontend
npm install react-hook-form @dnd-kit/core @dnd-kit/sortable
```

## Implementation Checklist

### Phase 1: Plus Code Service (Foundation)

**File**: `frontend/lib/services/plusCodeService.ts`

```typescript
export interface PlusCodeLookupResult {
  success: boolean;
  data?: { name: string; address: string; lat: number; lng: number };
  error?: { code: string; message: string };
}

export async function lookupPlusCode(plusCode: string): Promise<PlusCodeLookupResult> {
  // Implementation per contracts/interfaces.md
}
```

**Test**: 
```bash
# Unit test with mocked API
npm test -- plusCodeService.test.ts
```

---

### Phase 2: Edit Mode Route

**File**: `frontend/app/trip/[tripId]/edit/page.tsx`

```typescript
export default async function TripEditPage({ params }: { params: { tripId: string } }) {
  // Server component: load trip data
  const trip = await getTripWithRelations(params.tripId);
  return <EditModeLayout tripId={params.tripId} initialData={trip} />;
}
```

**Test**: Navigate to `/trip/{some-id}/edit` → should load

---

### Phase 3: Core Components

**Create these files** (in order):

1. `frontend/components/edit/PlusCodeInput.tsx`
   - Input field with lookup button
   - Calls `lookupPlusCode` service
   - Displays errors, emits success event

2. `frontend/components/edit/CategoryNav.tsx`
   - DaisyUI tabs component
   - Manages active category state

3. `frontend/components/edit/EditModeLayout.tsx`
   - Main container
   - React Hook Form setup
   - Save button + error display
   - Renders active category section

4. `frontend/components/edit/HotelSection.tsx`
   - List of hotels with edit forms
   - Add new hotel (PlusCodeInput)
   - Delete buttons (no confirmation)

5. `frontend/components/edit/AttractionSection.tsx`
   - List of attractions with reorder (dnd-kit)
   - Add new attraction (PlusCodeInput)
   - Delete buttons

6. `frontend/components/edit/FlightSection.tsx`
   - List of flights with notes field
   - Simple text inputs

7. `frontend/components/edit/NotesSection.tsx`
   - Trip-level notes textarea

**Test each component**: 
```bash
npm test -- ComponentName.test.tsx
```

---

### Phase 4: Integration

**Connect components** in `EditModeLayout.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';

export function EditModeLayout({ tripId, initialData }: Props) {
  const [activeCategory, setActiveCategory] = useState('hotels');
  const form = useForm({ defaultValues: initialData });
  
  const onSubmit = async (data) => {
    // Save to IndexedDB using lib/db/operations
    // Show success message
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <CategoryNav active={activeCategory} onChange={setActiveCategory} />
      {activeCategory === 'hotels' && <HotelSection {...} />}
      {/* other categories */}
      <button type="submit">Save Changes</button>
    </form>
  );
}
```

**Test**: Full edit flow → save → verify IndexedDB

---

### Phase 5: Error Handling

**Add error states** for:
- Network failures (Plus Code lookup)
- Validation errors (form fields)
- IndexedDB errors (quota, permissions)

**Display using**: DaisyUI alert component

**Test**: Simulate each error scenario

---

### Phase 6: Polish

- [ ] Add loading spinners (Plus Code lookup, save operation)
- [ ] Add keyboard shortcuts (Ctrl+S to save)
- [ ] Add "Return to View" button (navigates to `/trip/{id}`)
- [ ] Test mobile responsiveness
- [ ] Test drag-and-drop on touch devices

---

## Testing Strategy

### Unit Tests
```bash
npm test -- lib/services/plusCodeService.test.ts
npm test -- components/edit/*.test.tsx
```

### Integration Tests
```bash
npm test -- app/trip/[tripId]/edit/page.test.tsx
```

### Manual Testing Checklist

- [ ] Add hotel via Plus Code → saves correctly
- [ ] Edit hotel notes → persists
- [ ] Delete hotel → removes from DB
- [ ] Reorder attractions → order persists
- [ ] Add flight notes → saves
- [ ] Save without changes → no errors
- [ ] Invalid Plus Code → error message shown
- [ ] Network failure → retry works
- [ ] Navigate away without save → no warning (per spec)
- [ ] Reload after save → changes visible

---

## Development Workflow

### Start Development
```bash
cd frontend
npm run dev
# Open http://localhost:3000/trip/[some-trip-id]/edit
```

### Useful Commands
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

---

## Debugging Tips

### Plus Code Lookup Failures

1. Check API key in `.env.local`
2. Check browser console for CORS errors
3. Check Network tab for API response
4. Verify API key restrictions in Google Console
5. Check quota usage in Google Console

### IndexedDB Issues

1. Open Chrome DevTools → Application → IndexedDB
2. Inspect `TravoLocalDB` database
3. Check table contents after save
4. Clear database: `await db.delete()` in console

### Form State Issues

1. Install React DevTools
2. Inspect component state
3. Check React Hook Form devtools (optional package)

---

## Common Issues & Solutions

### Issue: API key not working
**Solution**: Make sure env var starts with `NEXT_PUBLIC_` and restart dev server

### Issue: Drag-and-drop not working on mobile
**Solution**: Ensure @dnd-kit touch sensors enabled:
```typescript
import { TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
const sensors = useSensors(useSensor(TouchSensor));
```

### Issue: Save button not working
**Solution**: Check that form is wrapped in `<form>` tag and button has `type="submit"`

### Issue: Changes not persisting
**Solution**: Verify `updated_at` timestamp is being set on save

---

## Next Steps

After implementation:
1. Run full test suite: `npm test`
2. Manual testing on mobile device
3. Create PR with checklist from `tasks.md` (generated by `/speckit.tasks`)
4. Request code review
5. Merge to main branch

---

## Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [dnd-kit Docs](https://docs.dndkit.com/)
- [Google Maps Geocoding API Docs](https://developers.google.com/maps/documentation/geocoding)
- [DaisyUI Components](https://daisyui.com/components/)
- [Next.js App Router](https://nextjs.org/docs/app)
