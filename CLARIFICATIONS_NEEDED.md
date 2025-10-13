# Firebase Integration - Clarifications Needed

**Date**: October 13, 2025  
**Related Document**: [FIREBASE_SYNC_PLAN.md](./FIREBASE_SYNC_PLAN.md)

---

## 🔴 Critical - Must Resolve Before Starting

### 1. Firebase Project Setup

**Question**: Do you have an existing Firebase project, or should we create a new one?

**Options**:
- [ ] Create new Firebase project (recommended) - I will take it up manually. assume a key is present in env and do the implementation
- [ ] Use existing project (please provide project ID) - I will take it up manually. assume a key is present in env and do the implementation

**Additional Info Needed**:
- Google Cloud billing account to use (Firestore requires Blaze plan for production) - I will take it up manually. assume a key is present in env and do the implementation
- Preferred region for Firestore (e.g., `us-central1`, `europe-west1`, `asia-northeast1`) - I will take it up manually. assume a key is present in env and do the implementation
- Should we use separate projects for dev/staging/prod? - I will take it up manually. assume a projectId is present in env and do the implementation

---

### 2. Google Authentication Scope

**Question**: What authentication methods should we support?

**Options**:
- [ ] Google Auth only (fastest, matches Firebase ecosystem) - Only Google auth
- [ ] Google Auth + Email/Password (more flexibility) - No
- [ ] Support anonymous users (view-only mode without login) -  No

**My Recommendation**: Start with Google-only, add email/password later if needed

**Additional Info Needed**:
- Do we need user profile info (name, photo)? Or just email for identification? - I need email to authorize the user. Firebase doesn't do authorization.
- Should users be able to stay logged in (remember me)? - Yes (Maximize the token validity as much as possible)

---

### 3. Data Migration Strategy

**Question**: What should happen to existing IndexedDB data when users first log in?

- Ignore, we have only test data right now.

**Options**:
- [ ] **Auto-migrate**: Copy existing trips from IndexedDB to Firebase on first login 
- [ ] **Fresh start**: Firebase starts empty, users manually re-create trips
- [ ] **Import tool**: Provide UI to import existing trips if they exist

**Context**: Currently, users have trips loaded from JSON seed data in IndexedDB. When they log in for the first time, should we:
1. Upload their local trips to Firebase?
2. Delete local data and start fresh?
3. Keep local data separate from Firebase?

**My Recommendation**: Fresh start - seed data becomes "test data" you can load via button - Yes!!

**Additional Info Needed**:
- Should we show a warning if local data exists that hasn't been synced? - Keep this simple. No, we dont need for now.
- After login, should we clear IndexedDB and re-populate from Firebase? - No, try to pull and merge. as i said, we don't have conflicts. likely one device per user will use this.

---

## 🟡 Important - Resolve Before Sync Implementation

### 4. Sync Behavior - Upload Timing

**Question**: When should local changes be uploaded to Firebase?

**Options**:
- [ ] **Immediate**: Every write to IndexedDB triggers Firebase upload (simplest) - Keep the simplest option.
- [ ] **Debounced**: Wait 1-2 seconds after last edit, then upload batch (efficient)
- [ ] **Manual**: User clicks "Sync" button (most control)

**My Recommendation**: Immediate upload, but with debounce for rapid edits (e.g., typing notes)

---

### 5. Sync Behavior - Download Updates

**Question**: How should we detect and download changes from Firebase?

- You can do this once during the start of the app/page? or i'm okay with having explicit sync button somewhere. 

**Options**:
- [ ] **Real-time listeners only**: Use Firestore `onSnapshot()` (best UX, more bandwidth)
- [ ] **Real-time + periodic polling**: Listeners + backup poll every 5 min (robust)
- [ ] **Polling only**: Check for updates every 30 seconds (simpler)

**My Recommendation**: Real-time listeners (Firestore's strength)

---

### 6. Offline Queue Management

**Question**: How should we handle changes made while offline? 

**Options**:
- [ ] **Persist indefinitely**: Keep offline changes until they sync (safest) - Yes
- [ ] **Expire after X days**: Clear old queue entries after 7/30 days (cleaner)
- [ ] **Warn user**: Show notification if queue grows beyond X entries

**My Recommendation**: Persist indefinitely with queue size warning (>50 items) - Yes

**Additional Info Needed**:
- How many retries for failed uploads? (suggest: 3 attempts with exponential backoff)
- Should we show list of pending changes to user?

---

### 7. Conflict Resolution Visibility

**Question**: When last-write-wins overwrites data, should we notify the user? - Last writes win.

**Context**: You said "don't complicate conflict resolution" and "assume one user operates on their case". But if user edits same trip on phone and laptop:

**Options**:
- [ ] **Silent**: Last write wins, no notification (simplest)
- [ ] **Passive**: Show "Synced X seconds ago" timestamp only
- [ ] **Active**: Show toast notification "Changes from another device merged"

**My Recommendation**: Passive (timestamp indicator)

---

## 🟢 Nice to Know - Can Decide Later

### 8. Seed Data for New Users

**Question**: What should new users see when they first log in?

**Options**:
- [ ] Empty state with "Create your first trip" button
- [ ] Sample trip pre-loaded (onboarding)
- [ ] "Load Test Data" button (dev mode only) 
- [ ] "Load Test Data" button (always visible when trip list empty) - Use this for now. will think about later. currently, cant' add trips.

**My Recommendation**: Empty state + "Load Test Data" button for everyone (useful for testing)

---

### 9. Data Ownership & Sharing

**Question**: Is this strictly single-user, or should we plan for sharing? - We need sharing. good point. at a trip level, users needs to be mapped.

**Context**: Your requirement says "one user operates on their case", but clarifying for future:

**Options**:
- [ ] **Single-user only**: One user = one set of trips, no sharing
- [ ] **Plan for sharing**: Add `owner_id` field now, implement sharing later
- [ ] **Multi-user now**: Allow multiple users to access same trip

**My Recommendation**: Single-user only now, refactor later if needed

---

### 10. Performance Limits

**Question**: What scale should we design for? - Minimal. Will worry about it later. 10 trips per user

**Context**: Helps with indexing strategy and pagination decisions

**Estimates Needed**:
- Expected trips per user? (10? 100? 1000?)
- Expected places/activities per trip? (10? 50? 100?)
- Maximum trip data size? (for bandwidth/storage planning)

**My Assumption**: 50 trips per user, 30 activities per trip (light usage)

---

### 11. Firebase Features

**Question**: What additional Firebase features should we use? - Nothing for now.

**Options**:
- [ ] **Cloud Functions**: Backend logic (e.g., cleanup old trips, send notifications)
- [ ] **Analytics**: Track usage patterns (what features are used?)
- [ ] **Performance Monitoring**: Track app speed/crashes
- [ ] **Storage**: For future image uploads (photos of places)

**My Recommendation**: Start minimal (Auth + Firestore only), add others later

---

## How to Respond

Please reply with your answers, either:

### Option A: Quick Answers
```
1. New Firebase project, us-central1
2. Google Auth only
3. Fresh start migration
4. Immediate upload
5. Real-time listeners
6. Persist indefinitely with warning
7. Passive timestamp
8. Empty state + test data button
9. Single-user only
10. 50 trips/user assumption OK
11. Auth + Firestore only
```

### Option B: Detailed Answers
For each question, explain your reasoning or ask follow-up questions.

### Option C: Let's Discuss
Schedule a call/meeting to walk through the plan together.

---

## After Clarifications

Once you provide answers, I will:

1. ✅ Update the plan with your decisions
2. 📋 Create detailed implementation tasks
3. 🔧 Set up Firebase project (if new)
4. 🚀 Begin Phase 1 implementation

**Estimated Time to First Working Version**: 2-3 weeks after clarifications

---

## Questions About This Plan?

If anything in [FIREBASE_SYNC_PLAN.md](./FIREBASE_SYNC_PLAN.md) is unclear, please ask! Topics you might want to clarify:

- Architecture decisions (why IndexedDB + Firebase?)
- Technology choices (why Firestore vs Realtime Database?)
- Implementation phases (can we skip/reorder any?)
- Timeline estimates (too optimistic/pessimistic?)
- Testing strategy (enough coverage?)
- Cost estimates (worried about Firebase bills?)

I'm happy to explain or revise anything!
