<template>
  <div class="app-container">
    <!-- AppHeader with title, tagline, and action slots -->
    <AppHeader>
      <!-- Left action slot reserved for Format, Clear, Import buttons (MVP 8) -->
      <template #left-actions>
        <!-- Empty slot - will be populated in MVP 8 -->
      </template>

      <!-- Right action slot: Export button (MVP 7) -->
      <template #right-actions>
        <UButton
          icon="i-heroicons-arrow-down-tray"
          color="primary"
          variant="solid"
          size="sm"
          :loading="isExporting"
          @click="handleExport"
        >
          Export HTML
        </UButton>
      </template>
    </AppHeader>

    <!-- Dual-panel layout: Editor (left) and Preview (right) -->
    <div class="dual-panel-layout">
      <!-- Left Panel: XML Editor -->
      <div class="editor-panel">
        <XmlEditor
          v-model="xmlContent"
          height="100%"
          width="100%"
        />
      </div>

      <!-- Right Panel: Preview -->
      <div ref="previewPanelRef" class="preview-panel">
        <PreviewPanel
          :xml-content="debouncedXmlContent"
          :zoom="1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useExport } from '~/composables/useExport'

/**
 * Main Application Page - MVP 6: Dual-Panel Integration
 *
 * This page brings together all MVPs 1-5:
 * - AppHeader (MVP 1) with title and empty action slots
 * - XML Parser (MVP 2) via PreviewPanel
 * - Template System (MVP 3) via PreviewPanel
 * - XmlEditor (MVP 4) for editing
 * - PreviewPanel (MVP 5) for real-time preview
 *
 * Features:
 * - Dual-panel 50/50 layout (CSS Grid)
 * - 300ms debounced real-time updates (per DECISIONS.md)
 * - Auto-loads sample XML from /samples/cover-letter.xml
 * - Minimum 1024px responsive design
 */

// Set page metadata
useHead({
  title: 'OhMyDoc - XML to HTML Transformer',
})

// Reactive state for XML content
const xmlContent = ref('')
const debouncedXmlContent = ref('')

// Preview panel ref for export functionality
const previewPanelRef = ref<HTMLElement | null>(null)

// Export state
const isExporting = ref(false)
const { exportHtml } = useExport()
const toast = useToast()

// Debounce timer ref
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Handle HTML export
 * Uses the useExport composable to generate and download standalone HTML
 */
async function handleExport() {
  if (isExporting.value) return

  isExporting.value = true

  try {
    const result = exportHtml(previewPanelRef.value)

    if (result.success) {
      toast.add({
        title: 'Export Successful',
        description: `Downloaded ${result.filename}`,
        icon: 'i-heroicons-check-circle',
        color: 'green',
        timeout: 3000,
      })
    }
    else {
      toast.add({
        title: 'Export Failed',
        description: result.error || 'Unknown error occurred',
        icon: 'i-heroicons-exclamation-triangle',
        color: 'red',
        timeout: 5000,
      })
    }
  }
  catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    toast.add({
      title: 'Export Failed',
      description: errorMessage,
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red',
      timeout: 5000,
    })
  }
  finally {
    isExporting.value = false
  }
}

/**
 * Debounce watcher: Updates preview 300ms after user stops typing
 * Per DECISIONS.md Decision 5: 300ms < 500ms threshold provides smooth UX
 * without feeling laggy or causing excessive re-parsing
 */
watch(xmlContent, (newValue) => {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Set new timer for 300ms debounce
  debounceTimer = setTimeout(() => {
    debouncedXmlContent.value = newValue
  }, 300)
})

/**
 * Load sample XML on page mount
 * Fetches /samples/cover-letter.xml from public directory
 */
onMounted(async () => {
  try {
    const response = await fetch('/samples/cover-letter.xml')

    if (!response.ok) {
      throw new Error(`Failed to load sample XML: ${response.statusText}`)
    }

    const sampleXml = await response.text()

    // Set both content refs - debounced will update via watcher
    xmlContent.value = sampleXml
    debouncedXmlContent.value = sampleXml
  }
  catch (error) {
    console.error('Error loading sample XML:', error)

    // Provide fallback empty XML structure if sample fails to load
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<applicationDocument>
  <applicant>
    <name>Your Name</name>
  </applicant>
</applicationDocument>`

    xmlContent.value = fallbackXml
    debouncedXmlContent.value = fallbackXml
  }
})

/**
 * Cleanup: Clear debounce timer on component unmount
 * Prevents memory leaks if component unmounts during debounce window
 */
onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<style scoped>
/**
 * Main app container - full viewport height
 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/**
 * Dual-panel layout using CSS Grid
 * 50/50 split between editor (left) and preview (right)
 * Minimum width: 1024px total (512px per panel)
 */
.dual-panel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
  gap: 0;

  /* Minimum width constraint */
  min-width: 1024px;
}

/**
 * Left panel: XML Editor
 * Full height, scrollable if needed
 */
.editor-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #1e1e1e; /* Dark editor background */
  border-right: 1px solid var(--color-gray-300);
}

/**
 * Right panel: Preview
 * Full height, scrollable if needed
 */
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: var(--color-gray-50);
}

/**
 * Responsive design for smaller screens
 * Stack panels vertically below 1024px
 */
@media (max-width: 1024px) {
  .dual-panel-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    min-width: unset;
  }

  .editor-panel {
    border-right: none;
    border-bottom: 1px solid var(--color-gray-300);
  }
}
</style>
