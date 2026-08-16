import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ne met en cache que le squelette de l'app (JS/CSS/HTML/icônes) via
      // le glob par défaut de build.outDir — jamais les appels /api/*, déjà
      // gérés par le cache IndexedDB (src/offline) page par page. Mélanger
      // les deux créerait deux caches concurrents pour la même donnée.
      workbox: {
        navigateFallback: '/index.html',
      },
      manifest: {
        name: 'ProBF',
        short_name: 'ProBF',
        description: 'La plateforme des artisans du Burkina Faso',
        lang: 'fr',
        theme_color: '#D9560A',
        background_color: '#F7F5F0',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
