
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use relative base path so the site works regardless of the repository name
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
