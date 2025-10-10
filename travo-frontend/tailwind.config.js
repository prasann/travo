/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'text-primary',
    'text-primary-foreground',
    'text-secondary',
    'text-secondary-foreground',
    'text-muted-foreground',
    'bg-primary',
    'bg-primary-foreground',
    'bg-secondary',
    'bg-muted',
    'hover:bg-primary/90',
    'hover:text-primary/80'
  ],
  theme: {
    extend: {
      // Design system spacing tokens
      spacing: {
        'ds-xs': '0.25rem',  // 4px
        'ds-sm': '0.5rem',   // 8px
        'ds-md': '1rem',     // 16px
        'ds-lg': '1.5rem',   // 24px
        'ds-xl': '3rem',     // 48px
      },
      // Enhanced shadows for card components
      boxShadow: {
        'ds-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'ds-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'ds-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'ds-hover': '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
      },
      // Typography scale
      fontSize: {
        'ds-xs': ['0.75rem', '1rem'],
        'ds-sm': ['0.875rem', '1.25rem'],
        'ds-base': ['1rem', '1.5rem'],
        'ds-lg': ['1.125rem', '1.75rem'],
        'ds-xl': ['1.25rem', '1.75rem'],
        'ds-2xl': ['1.5rem', '2rem'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}