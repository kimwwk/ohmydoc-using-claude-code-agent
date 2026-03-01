<template>
  <UContainer class="app-header border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center justify-between">
      <!-- Left action slot for future buttons (Format, Clear, Import - MVP 8) -->
      <div class="flex items-center gap-2">
        <slot name="left-actions" />
      </div>

      <!-- App Title and Tagline -->
      <div class="text-center">
        <h1 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
          OhMyDoc
        </h1>
      </div>

      <!-- Right: Template switcher + action slot (Export, Zoom - MVPs 7 & 9) -->
      <div class="flex items-center gap-3">
        <!-- Template Switcher Dropdown -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Template</label>
          <USelectMenu
            v-model="selectedTemplate"
            :options="templateOptions"
            value-attribute="value"
            option-attribute="label"
            size="xs"
            class="w-28"
          />
        </div>

        <slot name="right-actions" />
      </div>
    </div>
  </UContainer>
</template>

<style scoped>
.app-header {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useTemplate } from '~/composables/useTemplate'

const { activeTemplate, setActiveTemplate, getAllTemplateMetadata } = useTemplate()

const templateOptions = getAllTemplateMetadata().map(m => ({ label: m.displayName, value: m.name }))

const selectedTemplate = computed({
  get: () => activeTemplate.value,
  set: (val: string) => setActiveTemplate(val),
})
</script>
