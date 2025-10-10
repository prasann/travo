import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Theme loading plugin
function themePlugin() {
  return {
    name: 'theme-plugin',
    transform(code: string, id: string) {
      // Only process the main index.css file
      if (!id.endsWith('src/index.css')) return null
      
      // Get theme from environment variable
      const theme = process.env.VITE_THEME || 'default'
      const themePath = path.resolve(__dirname, `src/styles/themes/themes/${theme}.css`)
      
      // Check if theme file exists, fallback to default if not
      const finalTheme = fs.existsSync(themePath) ? theme : 'default'
      const finalThemePath = path.resolve(__dirname, `src/styles/themes/themes/${finalTheme}.css`)
      
      if (fs.existsSync(finalThemePath)) {
        let themeContent = fs.readFileSync(finalThemePath, 'utf-8')
        
        // Extract just the CSS variables from the theme file
        const rootMatch = themeContent.match(/:root\s*\{([^}]+)\}/s)
        const darkMatch = themeContent.match(/\.dark\s*\{([^}]+)\}/s)
        
        if (rootMatch && darkMatch) {
          // Replace the placeholder theme variables in index.css
          let newCode = code.replace(
            /:root\s*\{[^}]+\}/s,
            `:root {${rootMatch[1]}}`
          )
          newCode = newCode.replace(
            /\.dark\s*\{[^}]+\}/s,
            `.dark {${darkMatch[1]}}`
          )
          
          console.log(`🎨 Using theme: ${finalTheme}`)
          return newCode
        }
      }
      
      return null
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), themePlugin()],
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
  // Environment variables configuration for theme switching
  envPrefix: ['VITE_'],
})
