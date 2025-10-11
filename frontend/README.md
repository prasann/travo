# Travo - Next.js Trip Planner

A simple and elegant trip planning application built with Next.js 15, React 19, DaisyUI 5, and Tailwind CSS 4.

## Features

- 📝 View trip list with detailed information
- ✈️ **Complete trip timeline** with flights, hotels, and daily activities in chronological order
- 🏨 **Accommodation tracking** with check-in/out times and confirmation numbers
- 🗓️ **Daily itinerary** with timezone-aware time display
- 🍽️ **Restaurant recommendations** grouped by city
- 📍 **Privacy-friendly location data** using Plus Codes
- 🖼️ **Activity images** with lazy loading and error handling
- 🎨 5 beautiful theme variants (default, blue, green, red, violet)
- 📱 Fully responsive design (optimized for mobile and desktop)
- ⚡ Static site generation for optimal performance
- 🎯 Offline-first architecture

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Switching Themes

### Quick Start

1. **Open** `config/theme.ts`
2. **Change** the `ACTIVE_THEME` value:
   ```typescript
   export const ACTIVE_THEME = 'dark'  // Change to any theme name
   ```
3. **Restart** your dev server or rebuild:
   ```bash
   npm run dev    # or npm run build
   ```

### Available Themes

**Our Custom Themes** (defined in tailwind.config.ts):
- `default` - Default light theme
- `blue` - Ocean blue theme
- `green` - Nature green theme
- `red` - Warm red theme
- `violet` - Royal violet theme

**DaisyUI Built-in Themes** (30+ themes available):
- `light`, `dark`, `cupcake`, `bumblebee`, `emerald`, `corporate`, `synthwave`, `retro`, `cyberpunk`, `valentine`, `halloween`, `garden`, `forest`, `aqua`, `lofi`, `pastel`, `fantasy`, `wireframe`, `black`, `luxury`, `dracula`, `cmyk`, `autumn`, `business`, `acid`, `lemonade`, `night`, `coffee`, `winter`, `dim`, `nord`, `sunset`

### How It Works

**No CSS files needed!** DaisyUI uses the `data-theme` attribute on the `<html>` tag to switch themes instantly. All theme colors are automatically applied through CSS variables.

**Example:**
```typescript
// config/theme.ts
export const ACTIVE_THEME = 'dracula'  // 👈 Just change this!
```

That's it! The entire app updates to use the Dracula theme colors.

## Build for Production

```bash
npm run build
```

The build generates static files in the `out/` directory ready for deployment.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router with static export)
- **React**: 19.1.0
- **UI Library**: DaisyUI 5.2.0
- **Styling**: Tailwind CSS 4.1.14 (latest stable)
- **Language**: TypeScript 5.x (strict mode)
- **Icons**: Lucide React

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with theme support
│   ├── page.tsx             # Home page (trip list)
│   ├── trip/[tripId]/       # Dynamic trip detail pages
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   └── globals.css          # Global styles with Tailwind v4
├── components/              # React components
│   ├── TripCard.tsx         # Trip list item
│   ├── TripList.tsx         # Trip list container
│   ├── TripTimeline.tsx     # NEW: Chronological timeline view
│   ├── FlightCard.tsx       # NEW: Flight information display
│   ├── HotelCard.tsx        # NEW: Hotel/accommodation display
│   ├── ActivityCard.tsx     # NEW: Activity with images and timing
│   ├── RestaurantList.tsx   # NEW: Restaurant recommendations
│   ├── TripDetails.tsx      # Trip detail view (legacy)
│   ├── PlaceCard.tsx        # Place card (legacy)
│   └── Navigation.tsx       # Page header
├── config/                  # Configuration files
│   └── theme.ts            # Theme configuration (change ACTIVE_THEME here)
├── data/                    # Static data
│   ├── trips/              # NEW: Individual trip JSON files
│   └── trip-index.json     # NEW: Trip list index
├── lib/                     # Utility functions
│   ├── utils.ts            # Chronological sorting logic
│   ├── dateTime.ts         # NEW: Timezone-aware formatting
│   └── tripLoader.ts       # NEW: Load trip data from files
├── types/                   # TypeScript definitions
│   └── index.ts            # Trip, Flight, Hotel, Activity interfaces
└── public/                  # Static assets
```

## New Components

### TripTimeline
Displays a chronological timeline of all trip items (flights, hotels, activities) sorted by timestamp and order_index.

### FlightCard
Shows flight information including airline, flight number, departure/arrival times with timezones, locations, and confirmation numbers. Supports multi-leg flights.

### HotelCard
Displays accommodation details with check-in/out times, address, phone, and confirmation number.

### ActivityCard
Shows daily activities with optional images, start time, duration, address, notes, and Plus Codes for location.

### RestaurantList
Groups restaurant recommendations by city, displaying cuisine type, address, phone, website, and notes.

## Data Structure

Trips are now stored as individual JSON files in `/frontend/data/trips/` with a central index file for listing:

```typescript
// Trip structure includes:
{
  "id": "uuid",
  "name": "Trip Name",
  "flights": [...],      // Flight details with timezones
  "hotels": [...],       // Accommodation with check-in/out
  "activities": [...],   // Daily activities with timing
  "restaurants": [...]   // Restaurant recommendations
}
```

See `/specs/005-need-to-better/` for detailed data model documentation.

## Theming

The app supports 5 theme variants configured through DaisyUI:

- **default**: Default theme with light background
- **blue**: Ocean blue theme
- **green**: Nature green theme
- **red**: Warm red theme
- **violet**: Royal violet theme

To switch themes, simply edit `config/theme.ts` and change the `ACTIVE_THEME` value.

## Deployment

The app uses Next.js static export which generates static HTML/CSS/JS files. Deploy the `out/` directory to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --dir=out --prod`
- **GitHub Pages**: Configure `.github/workflows/deploy.yml`
- **Any static host**: Upload contents of `out/` directory

## Documentation

For detailed implementation information, see:

- [Enhanced Trip Model Quick Start](../specs/005-need-to-better/quickstart.md)
- [Data Model Documentation](../specs/005-need-to-better/data-model.md)
- [TypeScript Interfaces](../specs/005-need-to-better/contracts/interfaces.ts)
- [Technical Plan](../specs/005-need-to-better/plan.md)

Legacy documentation:
- [Migration Quick Start](../specs/004-port-app-to/quickstart.md)
- [DaisyUI Migration Plan](../specs/004-port-app-to/plan.md)

## Migration from Vite

This app was migrated from Vite + React + ShadCN to Next.js + DaisyUI, achieving:

- ✅ 30%+ code complexity reduction
- ✅ Improved performance with Server Components
- ✅ Simpler theming with DaisyUI
- ✅ Better SEO with static site generation

## License

MIT
