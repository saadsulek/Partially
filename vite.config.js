import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          math: ['mathjs', 'katex'],
          remotion: ['remotion', '@remotion/player'],
        },
      },
    },
  },
});
