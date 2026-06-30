import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/darts-app/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        // HTML niet vooraf cachen → bij het openen eerst online kijken naar de
        // nieuwste versie, met terugval op de cache als je offline bent.
        globPatterns: ['**/*.{js,css,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'app-html', networkTimeoutSeconds: 3 },
          },
        ],
      },
      manifest: {
        name: 'Darts',
        short_name: 'Darts',
        description: 'Darts scoreboard en trainingsapp',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/darts-app/',
        start_url: '/darts-app/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
