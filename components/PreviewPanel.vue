<template>
  <div class="preview-panel">
    <!-- Error Display using @nuxt/ui UAlert -->
    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      title="XML Parsing Error"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      class="error-alert"
    />

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-state">
      <p>Parsing XML...</p>
    </div>

    <!-- Preview Rendering with Zoom Transform -->
    <div
      v-else-if="parsedData && templateComponent"
      class="preview-container"
      :style="containerStyle"
    >
      <Transition name="template-fade" mode="out-in">
        <component :is="templateComponent" :key="activeTemplate" :data="parsedData" />
      </Transition>
    </div>

    <!-- Placeholder State (no data) -->
    <div v-else class="placeholder-state">
      <p>No content to preview. Please provide valid XML.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { useDocumentType } from '~/composables/useDocumentType'
import type { ParsedData } from '~/composables/useXmlParser'

// Ensure this component only runs on the client side (DOMParser is browser-only)
defineOptions({
  name: 'PreviewPanel',
})

/**
 * PreviewPanel Component
 *
 * Integration point combining XML parser (MVP 2) and template system (MVP 3).
 * Provides real-time preview of XML content with error handling and zoom support.
 *
 * Props:
 * - xmlContent: XML string to parse and render
 * - zoom: Zoom level for scaling (default: 1, range: 0.75 - 1.5)
 */

interface Props {
  xmlContent: string
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 1,
})

// Reactive state
const parsedData = ref<ParsedData | undefined>(undefined)
const error = ref<string | undefined>(undefined)
const isLoading = ref(false)

// Get composables
const { currentTemplate: templateComponent, activeTemplate } = useTemplate()
const { currentDocumentType, activeDocumentType } = useDocumentType()

// Computed style for zoom transform
const containerStyle = computed(() => ({
  transform: `scale(${props.zoom})`,
  transformOrigin: 'top left',
}))

/**
 * Parse XML and update component state
 * Handles all parsing errors gracefully with user-friendly messages
 */
function updatePreview() {
  isLoading.value = true
  error.value = undefined
  parsedData.value = undefined

  try {
    const parser = currentDocumentType.value?.parse
    if (!parser) {
      error.value = 'No parser available for the active document type'
      isLoading.value = false
      return
    }

    const result = parser(props.xmlContent)

    if (result.success && result.data) {
      parsedData.value = result.data
      error.value = undefined
    }
    else {
      error.value = result.error || 'Unknown parsing error occurred'
      parsedData.value = undefined
    }
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
    error.value = `Preview error: ${errorMessage}`
    parsedData.value = undefined
  }
  finally {
    isLoading.value = false
  }
}

// Re-parse when xmlContent, active template, or active document type changes
watch(
  [() => props.xmlContent, activeTemplate, activeDocumentType],
  () => {
    updatePreview()
  },
  { immediate: true },
)
</script>

<style scoped>
.preview-panel {
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--color-gray-50);
  padding: 1.5rem 1.25rem;
}

.error-alert {
  margin-bottom: 1rem;
}

.loading-state,
.placeholder-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--color-gray-600);
}

.preview-container {
  width: fit-content;
  min-width: 100%;
  /* Ensure zoom transform doesn't clip content */
  padding-bottom: 2rem;
}

/* Template switch fade transition */
.template-fade-enter-active,
.template-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.template-fade-enter-from,
.template-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
