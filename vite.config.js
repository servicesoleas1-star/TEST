import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    // Respecte le port assigné par l'environnement d'aperçu (ex: PORT défini
    // par l'orchestrateur quand 5173 est déjà occupé par une autre session) ;
    // 5173 reste la valeur par défaut en développement local classique.
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    // Autorise l'accès via un tunnel ngrok (ex: visualiser sur mobile hors réseau local).
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.ngrok.io'],
    // Toutes les routes /api du front sont relatives (ex: fetch('/api/auth/login')).
    // En local, Vite les relaie vers le backend Express (moledi-backend, port 4000).
    // En production (VPS), c'est nginx qui fera ce même relais.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      // Fichiers générés par le backend (PV de clôture PDF, voir
      // moledi-backend/src/services/closingReportService.js) -- servis en
      // statique par Express, relayés ici comme /api pour rester relatifs.
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
