import legacy from '@vitejs/plugin-legacy';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    watch: { usePolling: true },
    headers: {
      'Cache-Control': 'no-store',
    },
  },
  plugins: [react({ include: '/*.ts' }), legacy()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, './public/assets'),
    },
  },
});
