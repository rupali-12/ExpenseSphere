import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const viteConfig = defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',        // Vercel expects dist by default — explicit is cleaner
    sourcemap: false,      // don't ship sourcemaps to production
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,            // local dev only, ignored by Vercel
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