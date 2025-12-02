import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/favicon.svg', 'icons/favicon.ico', 'icons/apple-touch-icon.png', 'icons/favicon-16x16.png', 'icons/favicon-32x32.png', 'robots.txt', 'sitemap.xml'],
        manifest: {
          name: 'ExpensesLog - Expense & Reimbursement Tracker',
          short_name: 'ExpensesLog',
          description: 'Track expenses, manage reimbursements, and upload ICICI bank statements. Dark mode support, Google login, and offline access.',
          theme_color: '#111827',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: 'icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
          ]
        },
        workbox: {
          runtimeCaching: [
            {
              urlPattern: /.*\/api\/.*$/, // API calls
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
                cacheableResponse: { statuses: [200] }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
