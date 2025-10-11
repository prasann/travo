# Travo - Next.js Trip Planner

A simple and elegant trip planning application built with Next.js 15, React 19, DaisyUI 5, and Tailwind CSS 3.

## Features

- 📝 View trip list with detailed information
- 🗺️ View trip details with associated places
- 🎨 5 beautiful theme variants (default, blue, green, red, violet)
- 📱 Fully responsive design
- ⚡ Static site generation for optimal performance
- 🎯 Offline-first architecture

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run with a specific theme
npm run dev:blue    # Blue theme
npm run dev:green   # Green theme
npm run dev:red     # Red theme
npm run dev:violet  # Violet theme
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Build for Production

```bash
# Build with default theme
npm run build

# Build with a specific theme
npm run build:blue
npm run build:green
npm run build:red
npm run build:violet
```

The build generates static files in the `out/` directory ready for deployment.

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router with static export)
- **React**: 19.1.0
- **UI Library**: DaisyUI 5.2.0
- **Styling**: Tailwind CSS 3.x
- **Language**: TypeScript 5.x (strict mode)
- **Icons**: Lucide React

## Project Structure

```
travo-nextjs/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with theme support
│   ├── page.tsx             # Home page (trip list)
│   ├── trip/[tripId]/       # Dynamic trip detail pages
│   ├── error.tsx            # Error boundary
│   └── not-found.tsx        # 404 page
├── components/              # React components
│   ├── TripCard.tsx         # Trip list item
│   ├── TripList.tsx         # Trip list container
│   ├── TripDetails.tsx      # Trip detail view
│   ├── PlaceCard.tsx        # Place card
│   └── Navigation.tsx       # Page header
├── data/                    # Static data
│   └── trips.json          # Trip data
├── lib/                     # Utility functions
│   └── utils.ts
├── types/                   # TypeScript definitions
│   └── index.ts
└── public/                  # Static assets
```

## Theming

The app supports 5 theme variants configured through DaisyUI:

- **default**: Blue theme with light background
- **blue**: Ocean blue theme
- **green**: Nature green theme
- **red**: Warm red theme
- **violet**: Royal violet theme

Themes are applied at build/dev time via the `NEXT_PUBLIC_THEME` environment variable.

## Deployment

The app uses Next.js static export which generates static HTML/CSS/JS files. Deploy the `out/` directory to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --dir=out --prod`
- **GitHub Pages**: Configure `.github/workflows/deploy.yml`
- **Any static host**: Upload contents of `out/` directory

## Documentation

For detailed implementation information, see:

- [Quick Start Guide](../specs/004-port-app-to/quickstart.md)
- [Technical Plan](../specs/004-port-app-to/plan.md)
- [Component Contracts](../specs/004-port-app-to/contracts/interfaces.md)

## Migration from Vite

This app was migrated from Vite + React + ShadCN to Next.js + DaisyUI, achieving:

- ✅ 30%+ code complexity reduction
- ✅ Improved performance with Server Components
- ✅ Simpler theming with DaisyUI
- ✅ Better SEO with static site generation

## License

MIT
