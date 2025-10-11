import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        default: {
          'primary': '#3b82f6',
          'secondary': '#64748b',
          'accent': '#8b5cf6',
          'neutral': '#1f2937',
          'base-100': '#ffffff',
          'base-200': '#f3f4f6',
          'base-300': '#e5e7eb',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        blue: {
          'primary': '#2563eb',
          'secondary': '#0ea5e9',
          'accent': '#06b6d4',
          'neutral': '#1e293b',
          'base-100': '#f8fafc',
          'base-200': '#e2e8f0',
          'base-300': '#cbd5e1',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        green: {
          'primary': '#16a34a',
          'secondary': '#059669',
          'accent': '#10b981',
          'neutral': '#14532d',
          'base-100': '#f0fdf4',
          'base-200': '#dcfce7',
          'base-300': '#bbf7d0',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        red: {
          'primary': '#dc2626',
          'secondary': '#ef4444',
          'accent': '#f87171',
          'neutral': '#7f1d1d',
          'base-100': '#fef2f2',
          'base-200': '#fee2e2',
          'base-300': '#fecaca',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
        violet: {
          'primary': '#7c3aed',
          'secondary': '#8b5cf6',
          'accent': '#a78bfa',
          'neutral': '#3730a3',
          'base-100': '#f5f3ff',
          'base-200': '#ede9fe',
          'base-300': '#ddd6fe',
          'info': '#3abff8',
          'success': '#36d399',
          'warning': '#fbbd23',
          'error': '#f87272',
        },
      },
    ],
  },
}

export default config
