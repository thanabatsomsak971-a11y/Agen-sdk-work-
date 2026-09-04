import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, the frontend talks to the worker through a Vite proxy (single-origin).
// Local dev defaults to http://127.0.0.1:8787; docker compose overrides via VITE_PROXY_TARGET.
const apiTarget = process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8787';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': apiTarget,
      '/health': apiTarget,
    },
  },
});
