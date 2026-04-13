<template>
  <div class="min-h-screen flex items-center justify-center p-6" style="background: var(--color-bg);">
    <div class="text-center animate-fade-up">
      <!-- Big 404 -->
      <div class="relative inline-block mb-6">
        <p class="text-9xl font-bold select-none" style="color: #E2E8F0; font-family: var(--font-mono);">404</p>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg" style="background: var(--color-primary);">
            <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-[#1E293B] mb-2">Page not found</h1>
      <p class="text-[#64748B] text-sm mb-8 max-w-xs mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <RouterLink to="/login">
        <BaseButton variant="primary" size="lg">
          Go to Login
        </BaseButton>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
</script>