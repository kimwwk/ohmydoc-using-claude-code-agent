<template>
  <UContainer class="app-header border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center justify-between">
      <!-- Left action slot for future buttons (Format, Clear, Import - MVP 8) -->
      <div class="flex items-center gap-2">
        <slot name="left-actions" />
      </div>

      <!-- App Title -->
      <div class="text-center">
        <h1 class="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
          OhMyDoc
        </h1>
      </div>

      <!-- Right: Document type + template switchers + action slot -->
      <div class="flex items-center gap-3">
        <!-- Document Type Dropdown -->
        <div class="flex items-center gap-2">
          <label class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">Type</label>
          <USelectMenu
            v-model="selectedDocumentType"
            :options="documentTypeOptions"
            value-attribute="value"
            option-attribute="label"
            size="xs"
            class="w-36"
          />
        </div>

        <!-- Template Switcher Dropdown (filtered by active document type) -->
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
import { useDocumentType } from '~/composables/useDocumentType'

const { activeTemplate, setActiveTemplate, getTemplatesForDocumentType } = useTemplate()
const { activeDocumentType, setActiveDocumentType, getAvailableDocumentTypes } = useDocumentType()

// Document type options (static — registry doesn't change at runtime)
const documentTypeOptions = getAvailableDocumentTypes().map(d => ({ label: d.displayName, value: d.name }))

// Template options re-computed whenever the active document type changes
const templateOptions = computed(() =>
  getTemplatesForDocumentType(activeDocumentType.value).map(m => ({ label: m.displayName, value: m.name })),
)

const selectedDocumentType = computed({
  get: () => activeDocumentType.value,
  set: (val: string) => setActiveDocumentType(val),
})

const selectedTemplate = computed({
  get: () => activeTemplate.value,
  set: (val: string) => setActiveTemplate(val),
})
</script>
