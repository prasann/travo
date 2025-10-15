# Travo Seed Data

This folder contains test data and scripts for seeding Firestore with sample trips.

## 📁 Structure

```
seed/
├── package.json              # Dependencies (firebase-admin)
├── upload-test-data.js       # Script to upload test data to Firestore
├── test-data/                # Test trip JSON files
│   ├── 123e4567-*.json      # Tokyo Spring Adventure
│   ├── 456def78-*.json      # Paris Summer Trip
│   └── 987f6543-*.json      # NYC Fall Getaway
└── README.md                 # This file
```

## 🚀 Quick Start

### Step 1: Install dependencies

```bash
cd seed
npm install
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console - Service Accounts](https://console.firebase.google.com/project/travo-32ec12/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"**
3. Save the downloaded JSON file as `seed/service-account.json`
4. ⚠️ This file is gitignored - never commit it!

### Step 3: Upload Test Data

Run the script with your email (will be added to `user_access` array):

```bash
npm run upload YOUR_EMAIL@example.com [TRIP_FILE]
```

Examples:
```bash
# Upload default trip (Tokyo)
npm run upload your-email@example.com

# Upload specific trip file
npm run upload your-email@example.com 456def78-9abc-def0-1234-567890abcdef.json

# Upload your own trip
npm run upload your-email@example.com my-paris-trip.json
```

This will:
- Upload the Tokyo Spring Adventure trip to Firestore
- Add your email to the `user_access` array
- Create all subcollections (flights, hotels, activities, restaurants)

### Testing the Sync

After uploading:

1. **Open your app** and log in with the same email
2. **Clear IndexedDB** in browser DevTools:
   - Open DevTools (F12)
   - Go to Application tab
   - IndexedDB → TravoLocalDB → Delete database
3. **Refresh the page** to trigger sync
4. Check console logs - you should see sync messages
5. The Tokyo trip should appear in your trip list!

## 📝 Test Data

### Tokyo Spring Adventure
- **Duration:** 7 days (April 1-7, 2025)
- **Flights:** 2 (outbound and return)
- **Hotels:** 1 (Tokyo Grand Hotel)
- **Activities:** 7 (Skytree, Senso-ji, Ueno Park, etc.)
- **Restaurants:** 3 (Ichiran Ramen, Sushi Dai, Gonpachi)

## 🔧 Script Details

The `upload-test-data.js` script:
- Transforms local JSON format to Firestore schema
- Handles field mapping (e.g., `description` → `destination`)
- Simplifies flight schema (direction instead of full details)
- Converts timestamps to dates where needed
- Adds sharing fields (`user_access`, `updated_by`)
- Uploads trip + all subcollections in parallel

## 🐛 Troubleshooting

**Error: "Failed to initialize Firebase Admin"**
- Make sure you're authenticated (see Prerequisites above)
- Check that the project ID is correct (travo-32ec12)

**Error: "PERMISSION_DENIED"**
- Make sure your Firebase user has the correct permissions
- Check Firestore security rules allow writes

**Script completes but no data appears in app**
- Verify you're logging in with the same email used in the script
- Check browser console for sync errors
- Clear IndexedDB and refresh again

## 📚 Related Files

- **Firestore Schema:** `frontend/lib/firebase/schema.ts`
- **Firestore Converters:** `frontend/lib/firebase/converter.ts`
- **Sync Service:** `frontend/lib/firebase/sync.ts`
- **Original Test Data:** `frontend/public/data/trips/*.json`
