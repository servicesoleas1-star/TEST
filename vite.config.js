import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    // Toutes les routes /api du front sont relatives (ex: fetch('/api/auth/login')).
    // En local, Vite les relaie vers le backend Express (moledi-backend, port 4000).
    // En production (VPS), c'est nginx qui fera ce même relais.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
