import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel-friendly config – no Node imports
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
});
