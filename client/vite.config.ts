import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No __dirname or path module used here
export default defineConfig({
  plugins: [react()],
});
