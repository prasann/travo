#!/usr/bin/env node

/**
 * Theme-aware build script
 * Handles --theme parameter and sets VITE_THEME environment variable
 * Usage: npm run build --theme=blue
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments for --theme parameter
const args = process.argv.slice(2);
let theme = 'default';

// Look for --theme parameter
const themeIndex = args.findIndex(arg => arg.startsWith('--theme='));
if (themeIndex !== -1) {
  theme = args[themeIndex].split('=')[1];
  args.splice(themeIndex, 1); // Remove theme arg from remaining args
}

// Also check npm_config_theme (from npm run build --theme=blue)
if (process.env.npm_config_theme) {
  theme = process.env.npm_config_theme;
}

console.log(`🎨 Building with theme: ${theme}`);

// Set environment variable for Vite
const env = {
  ...process.env,
  VITE_THEME: theme
};

// Run the actual build process
const buildProcess = spawn('npm', ['run', 'build'], {
  env,
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log(`✅ Build completed with ${theme} theme`);
  } else {
    console.error(`❌ Build failed with exit code ${code}`);
  }
  process.exit(code);
});