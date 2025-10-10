import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Development server configuration
  server: {
    port: 3000,
    open: true,
  },
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Define for environment variables
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
