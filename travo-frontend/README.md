# Travo Frontend

Minimalistic trip planner frontend built with React + TypeScript + Vite.

## Features

- Clean trip list and detail views
- Hardcoded JSON data (no backend required)
- Responsive design (320px - 1920px)
- ShadCN UI components with Tailwind CSS

## Development

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

# Travo Frontend

Minimalistic trip planner frontend built with React + TypeScript + Vite.

## Features

- Clean trip list and detail views
- Hardcoded JSON data (no backend required)
- Responsive design (320px - 1920px)
- ShadCN UI components with Tailwind CSS

## Theme Switching

Build with different themes using environment variables:

```bash
# Available themes: default, blue, green, red, violet

# Build with specific theme
npm run build:blue
npm run build:green  
npm run build:red
npm run build:violet

# Or use environment variable directly
VITE_THEME=violet npm run build

# Development with theme
npm run dev:blue
# or
VITE_THEME=green npm run dev
```

**How it works:**
- Themes are applied at **build time** (no runtime theme switching)
- Uses shadcn.studio color palettes for consistency
- Invalid theme names automatically fall back to default theme
- All components and pages support theming

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** + **TypeScript 5**
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **ShadCN/UI** - Accessible component library
- **React Router** - Client-side routing

## Project Structure

```
src/
├── components/ui/     # ShadCN components
├── pages/            # Route components
├── types/            # TypeScript interfaces
├── data/             # Hardcoded JSON data
└── lib/              # Utilities
```
