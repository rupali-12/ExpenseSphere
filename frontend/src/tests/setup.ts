import { config } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { beforeEach, vi } from 'vitest'

// ─── Global Vue Test Utils config ───────────────────────────────────────────
// Makes Pinia available in every component test automatically
config.global.plugins = [createPinia()]

// ─── Reset all mocks before each test ───────────────────────────────────────
// Prevents mock state leaking between tests
beforeEach(() => {
  vi.clearAllMocks()
})