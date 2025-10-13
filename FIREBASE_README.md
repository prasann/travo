# Firebase Integration - Overview

**Project**: Travo Firebase Backend Integration  
**Status**: Ready to Start  
**Date**: October 13, 2025

---

## 📋 Documents

- **[FIREBASE_TASKS.md](./FIREBASE_TASKS.md)** - Task checklist (130 tasks, use this for implementation)
- **[CLARIFICATIONS_NEEDED.md](./CLARIFICATIONS_NEEDED.md)** - Your answered questions (reference only)
- **This file** - Quick reference and context

---

## 🎯 What We're Building

Transform Travo from offline-only to multi-user cloud-synced app:

### Current State
```
User Browser → IndexedDB (Dexie.js) → Seed data from JSON
                                      → No auth, no backend
```

### Target State
```
User Browser
  ├─ Google Auth (login/logout)
  ├─ IndexedDB (local cache, offline-first)
  └─ Firebase Firestore (cloud storage, sharing)
      └─ Bidirectional sync
```

---

## 🔑 Key Decisions (From Your Clarifications)

### Authentication
- ✅ Google Auth only
- ✅ Maximize token validity
- ✅ Email for authorization

### Sync Behavior
- ✅ Pull: Once on app start + manual sync button
- ✅ Push: Immediate on every change
- ✅ Offline: Queue changes, sync when online
- ✅ Conflicts: Last-write-wins (silent)

### Data Migration
- ✅ Fresh start for existing users
- ✅ "Load Test Data" button when no trips
- ✅ Pull and merge from Firebase

### Sharing
- ✅ Trip-level sharing enabled
- ✅ Simple user list per trip
- ✅ All users have equal permissions (no roles)
- ✅ Use email addresses for access control

### Scale
- ✅ 10 trips per user (minimal usage)
- ✅ Auth + Firestore only (no Cloud Functions, Analytics, etc.)

---

## 📊 Implementation Phases

| Phase | Duration | Focus |
|-------|----------|-------|
| 0. Setup | User | Firebase project + env vars |
| 1. Auth | 3 days | Google login/logout |
| 2. Schema | 1 day | Firestore structure + security |
| 3. Pull Sync | 3 days | Load trips on startup |
| 4. Push Sync | 4 days | Save changes to Firestore |
| 5. Sync Button | 1 day | Manual refresh |
| 6. Sharing | 2 days | Share trips with others |
| 7. Test Data | 1 day | Load sample trips |
| 8. Polish | 2-3 days | Testing + cleanup |
| **Total** | **17-18 days** | **~3.5 weeks** |

---

## 🗂️ Data Model

### Firestore Structure

```
/trips/{tripId}
  ├─ id: string
  ├─ name: string
  ├─ user_access: string[]        // NEW: ["user1@gmail.com", "user2@gmail.com"]
  ├─ updated_by: string           // NEW: "user1@gmail.com"
  ├─ updated_at: string
  ├─ ...other trip fields...
  │
  ├─ /flights/{flightId}
  │   ├─ updated_by: string       // NEW
  │   └─ ...flight fields...
  │
  ├─ /hotels/{hotelId}
  ├─ /activities/{activityId}
  └─ /restaurants/{restaurantId}
```

### Key Design Choices

**Why root-level trips?**
- Enables sharing (one trip, multiple users)
- Simple query: `where('user_access', 'array-contains', userEmail)`
- No data duplication

**Why email-based access?**
- Human-readable
- Can share before user signs up
- Firebase supports `token.email` in security rules

**Why pull on start only?**
- Simpler code, less battery
- User has control (explicit sync button)
- Changes not immediate (acceptable per requirements)

---

## 🔒 Security Rules (Summary)

```javascript
// Users can only access trips where their email is in user_access array
match /trips/{tripId} {
  allow read: if request.auth.token.email in resource.data.user_access;
  allow write: if request.auth.token.email in resource.data.user_access;
  
  // Subcollections inherit trip access
  match /{subcollection}/{docId} {
    allow read, write: if hasAccess(tripId);
  }
}
```

---

## 🚀 Getting Started

### Prerequisites (Phase 0)

1. **Create Firebase project** (or provide existing)
2. **Enable services**:
   - Authentication → Google provider
   - Firestore Database
3. **Get config values** from Firebase Console
4. **Create `.env.local`**:

```bash
# frontend/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."
```

### Start Implementation

1. Complete Phase 0 (Firebase setup)
2. Open **[FIREBASE_TASKS.md](./FIREBASE_TASKS.md)**
3. Start with Phase 1, Task 1.1
4. Check off tasks as you complete them `[ ]` → `[x]`
5. Commit at "Commit Point" markers
6. Test at "Testing Complete" markers

---

## 📦 Dependencies

### New
```json
{
  "dependencies": {
    "firebase": "^10.13.0"
  }
}
```

### Existing (No Changes)
- `dexie`: "^4.2.1"
- `next`: "15.5.4"
- `react`: "19.1.0"
- All UI libraries stay the same

---

## 🧪 Testing Strategy

### After Each Phase
- Unit tests for new functionality
- Integration tests for sync flows
- Manual testing of user flows

### End-to-End (Phase 8)
1. New user: Login → Empty → Load test data
2. Create trip: Add → Edit → View
3. Share trip: User A shares → User B sees
4. Offline: Edit offline → Sync online
5. Multi-tab: Edit tab 1 → Sync → See tab 2
6. Conflict: Edit device A → Edit device B → Last write wins

---

## 📁 Files to Create/Modify

### New Files (~11)
```
frontend/
  .env.local (manual)
  lib/firebase/
    config.ts
    auth.ts
    schema.ts
    converter.ts
    firestore.ts
  lib/sync/
    SyncQueue.ts
    SyncService.ts
    ConflictResolver.ts
  contexts/
    AuthContext.tsx
  components/
    LoginButton.tsx
    SyncButton.tsx
    ShareTripDialog.tsx
    LoadTestDataButton.tsx
    ErrorBoundary.tsx
  app/api/dev/load-test-data/
    route.ts

firestore.rules
firebase.json
.firebaserc
```

### Modified Files (~13)
```
frontend/
  package.json
  lib/db/
    schema.ts (add v3 with user_access)
    models.ts (add sharing types)
    init.ts (pull from Firestore)
    operations/*.ts (add sync triggers)
  components/
    DatabaseProvider.tsx
    Navigation.tsx
  app/
    layout.tsx (AuthProvider)
    page.tsx (login gate)
    trip/[tripId]/page.tsx (share button)
```

---

## 💡 Key Concepts

### Sync Flow

**On App Start:**
```
Login → Pull trips from Firestore (where user has access)
      → Save to IndexedDB
      → Show in UI
```

**On Local Change:**
```
Edit → Save to IndexedDB immediately
     → Add to sync queue
     → Upload to Firestore (if online)
     → Set updated_by = user email
```

**On Manual Sync:**
```
Button click → Pull from Firestore
             → Compare timestamps (updated_at)
             → Keep newer version (last-write-wins)
             → Push pending queue
```

### Sharing Flow

**Share Trip:**
```
Trip page → "Share" button
          → Enter email
          → Add to trip.user_access array in Firestore
          → Other user sees trip on next login/sync
```

**Access Control:**
```
- Query: trips where user_access contains email
- Security: Firestore rules check user_access array
- UI: Show "Shared with X users" indicator
```

---

## ⚠️ Important Notes

### Don't Commit
- `.env.local` (contains secrets)
- `node_modules/`
- `.firebase/` (local cache)

### Do Commit
- `firebase.json` (Firebase CLI config)
- `.firebaserc` (project reference)
- `firestore.rules` (security rules)
- `firestore.indexes.json` (if needed)
- `FIREBASE_TASKS.md` (with checked boxes)

### Remember
- Test after each phase
- Commit at checkpoints
- Document any deviations from plan
- Keep FIREBASE_TASKS.md updated

---

## 🆘 If You Get Stuck

### Common Issues

**Auth not working?**
- Check Firebase Console: Auth → Settings → Authorized domains
- Add `localhost` for dev

**Can't read from Firestore?**
- Check security rules are deployed
- Verify user email is in `user_access` array

**Sync not triggering?**
- Check browser console for errors
- Verify network tab shows Firestore requests

**Offline not working?**
- IndexedDB should still work
- Check sync queue has pending items

### Getting Help

1. Check browser console for errors
2. Check Firebase Console for logs
3. Verify environment variables are set
4. Review FIREBASE_TASKS.md for missed steps
5. Ask for help with specific error messages

---

## 📈 Progress Tracking

Update this as you complete phases:

- [ ] Phase 0: Setup (Firebase project ready)
- [ ] Phase 1: Auth (Can login with Google)
- [ ] Phase 2: Schema (Firestore structure defined)
- [ ] Phase 3: Pull Sync (Loads trips on startup)
- [ ] Phase 4: Push Sync (Saves changes to Firestore)
- [ ] Phase 5: Sync Button (Manual refresh works)
- [ ] Phase 6: Sharing (Can share trips with others)
- [ ] Phase 7: Test Data (Can load sample trips)
- [ ] Phase 8: Polish (Production ready)

---

## 🎉 Success Criteria

### Must Have
- [x] Users can log in with Google
- [x] Trips sync to Firestore
- [x] Trips load from Firestore on startup
- [x] Offline edits queue and sync later
- [x] Users can share trips
- [x] Shared users can view and edit trips
- [x] Last-write-wins for conflicts

### Should Have
- [x] Manual sync button
- [x] Load test data button
- [x] Empty state when no trips
- [x] Loading indicators

### Nice to Have (Future)
- [ ] Show who last edited
- [ ] Sync status (pending count)
- [ ] Export trips
- [ ] Analytics

---

## 📚 Reference Documents

- **[FIREBASE_TASKS.md](./FIREBASE_TASKS.md)** - Detailed task checklist (USE THIS!)
- **[CLARIFICATIONS_NEEDED.md](./CLARIFICATIONS_NEEDED.md)** - Your decisions (reference)
- **[requirements.txt](./requirements.txt)** - Original requirements

---

**Ready to start?** Begin with Phase 0 in [FIREBASE_TASKS.md](./FIREBASE_TASKS.md)! 🚀
