import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Ensures the output is placed in the `dist` folder
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Keeping lucide-react out of optimized deps
  },
});
