import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/socket.io': {
        target: 'http://backend:3001',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://backend:3001',
        changeOrigin: true,
      },
    },
  },
});
