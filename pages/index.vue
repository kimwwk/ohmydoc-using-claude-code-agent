<template>
  <div class="app-container">
    <!-- AppHeader with title, tagline, and action slots -->
    <AppHeader>
      <!-- Left action slot reserved for Format, Clear, Import buttons (MVP 8) -->
      <template #left-actions>
        <!-- Empty slot - will be populated in MVP 8 -->
      </template>

      <!-- Right action slot reserved for Export and Zoom buttons (MVPs 7 & 9) -->
      <template #right-actions>
        <!-- Empty slot - will be populated in MVPs 7 & 9 -->
      </template>
    </AppHeader>

    <!-- Welcome Screen: shown on first load when no saved data exists -->
    <div v-if="showWelcome" class="welcome-screen">
      <div class="welcome-card">
        <div class="welcome-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 class="welcome-headline">
          Create professional documents in seconds
        </h2>
        <p class="welcome-description">
          Write structured XML, pick a template, and instantly preview a polished document — ready to export.
        </p>
        <UButton
          size="xl"
          color="primary"
          class="welcome-cta"
          :loading="isSampleLoading"
          @click="loadSample"
        >
          Start with a sample
        </UButton>
      </div>
    </div>

    <!-- Dual-panel layout: Editor (left) and Preview (right) -->
    <div v-else class="dual-panel-layout">
      <!-- Left Panel: XML Editor -->
      <div class="editor-panel">
        <XmlEditor
          v-model="xmlContent"
          height="100%"
          width="100%"
        />
      </div>

      <!-- Right Panel: Preview -->
      <div class="preview-panel">
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

/**
 * Main Application Page - MVP 6: Dual-Panel Integration
 *
 * Features:
 * - Welcome screen on first load (no saved data in localStorage)
 * - Dual-panel 50/50 layout (CSS Grid)
 * - 300ms debounced real-time updates (per DECISIONS.md)
 * - Persists XML content to localStorage
 * - Minimum 1024px responsive design
 */

const LS_KEY = 'ohmydoc_xml_content'

// Set page metadata
useHead({
  title: 'OhMyDoc - XML to HTML Transformer',
})

// Welcome screen is shown when no saved data exists
const showWelcome = ref(true)
const isSampleLoading = ref(false)

// Reactive state for XML content
const xmlContent = ref('')
const debouncedXmlContent = ref('')

// Debounce timer ref
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Debounce watcher: Updates preview 300ms after user stops typing
 * Per DECISIONS.md Decision 5: 300ms < 500ms threshold provides smooth UX
 * without feeling laggy or causing excessive re-parsing
 */
watch(xmlContent, (newValue) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    debouncedXmlContent.value = newValue
    // Persist to localStorage so returning users skip the welcome screen
    try {
      localStorage.setItem(LS_KEY, newValue)
    }
    catch {
      // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
  }, 300)
})

/**
 * Fetch and apply the sample cover letter XML.
 * Called by the "Start with a sample" button on the welcome screen.
 */
async function loadSample() {
  isSampleLoading.value = true
  try {
    const response = await fetch('/samples/cover-letter.xml')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    const sampleXml = await response.text()
    xmlContent.value = sampleXml
    debouncedXmlContent.value = sampleXml
    showWelcome.value = false
  }
  catch (error) {
    console.error('Error loading sample XML:', error)
    // Still dismiss welcome and show an empty editor rather than getting stuck
    showWelcome.value = false
  }
  finally {
    isSampleLoading.value = false
  }
}

/**
 * On mount: restore saved content from localStorage.
 * If content exists, skip the welcome screen and load it directly.
 */
onMounted(() => {
  try {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      xmlContent.value = saved
      debouncedXmlContent.value = saved
      showWelcome.value = false
    }
  }
  catch {
    // Ignore localStorage errors; welcome screen will show as default
  }
})

/**
 * Cleanup: Clear debounce timer on component unmount
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

/**
 * Welcome screen - shown on first load
 */
.welcome-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  padding: 2rem;
}

.welcome-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  gap: 1.25rem;
}

.welcome-icon {
  color: var(--color-primary-500, #0f6fec);
  opacity: 0.85;
}

.welcome-headline {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-gray-900);
  margin: 0;
}

.welcome-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-gray-600);
  margin: 0;
}

.welcome-cta {
  margin-top: 0.5rem;
}
</style>
