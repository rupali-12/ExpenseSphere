import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'

const viteConfig = defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ExpenseSphere',
        short_name: 'ES',
        description: 'Personal Finance Tracker',
        theme_color: '#1A365D',
        background_color: '#1A365D',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
  },
})

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html'],
      include: [
        'src/utils/**/*.ts',
        'src/api/**/*.ts',
        'src/stores/**/*.ts',
        'src/composables/**/*.ts',
        'src/components/common/**/*.vue',
        'src/components/transactions/**/*.vue',
        'src/views/**',
        'src/components/layout/**',
      ],
      exclude: [
        'src/tests/**',
        'src/main.ts',
        'src/vite-env.d.ts',
        'src/types/**',
        'src/router/**',
        'src/App.vue',
      ],
      thresholds: {
        statements: 50,
        branches:   40,
        functions:  50,
        lines:      50,
      }
    },
  },
})

export default mergeConfig(viteConfig, vitestConfig)