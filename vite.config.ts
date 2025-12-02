import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Process env polyfill for browser compatibility if needed
    'process.env': process.env
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});