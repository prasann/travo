# Travo - Trip Planner

A privacy-friendly, offline-first Progressive Web App for organizing travel itineraries. View your trips, hotels, flights, and activities with a clean, simple interface. Works offline after installation.

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000

## ✨ Features

- **Offline-First**: Works without internet after initial sync
- **Timeline View**: Day-by-day itinerary with flights, hotels, activities
- **Map View**: See all your locations on an interactive map
- **Edit Mode**: Add places via Google Maps links, drag-drop to reorder
- **PWA**: Install on mobile/desktop, works like a native app
- **Cloud Sync**: Optional Firebase sync across devices

## 🛠️ Tech Stack

- **Next.js 15** + **React 19** + **TypeScript**
- **DaisyUI** + **Tailwind CSS** for styling
- **IndexedDB** (via Dexie.js) for local storage
- **Firebase** for authentication and cloud sync
- **Google Maps API** for place lookups

## 📂 Project Structure

```
frontend/         # Next.js app
├── app/          # Pages and routes
├── components/   # React components
├── lib/          # Core logic (db, firebase, sync)
└── public/       # PWA assets (service worker, manifest)

specs/            # Documentation for AI assistants
├── product-requirements.md
└── technical-specifications.md
```

## � Documentation

- **For Humans**: [Frontend README](./frontend/README.md) - Setup and deployment guide
- **For AI Assistants**: [Product Requirements](./specs/product-requirements.md) - Feature specs and user flows
- **For AI Assistants**: [Technical Specifications](./specs/technical-specifications.md) - Architecture and implementation details

## 🌍 Location Data

Uses **Google Plus Codes** for precise, offline-friendly locations:
```json
{
  "name": "Tokyo Skytree",
  "plus_code": "8Q7XQXXR+33",
  "notes": "Great view at sunset"
}
```

## 🔐 Privacy

- Data stored locally on your device
- Cloud sync optional (via Google sign-in)
- No tracking or analytics

---

**License**: MIT  
**Status**: Active development
