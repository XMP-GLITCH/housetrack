import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Temporarily self-destroying: forces stale clients to unregister the old
      // service worker and wipe caches on next load, recovering phones stuck on
      // an earlier cached bundle. Re-enable the full PWA once clients have updated.
      selfDestroying: true,
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'HouseTrack',
        short_name: 'HouseTrack',
        description: 'House Rental Management System',
        theme_color: '#D4841A',
        background_color: '#F8F7F4',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
