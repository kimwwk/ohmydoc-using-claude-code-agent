<template>
  <div class="preview-panel">
    <!-- Error Display -->
    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      title="Rendering Error"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      class="error-alert"
    />

    <!-- Document Preview — content is DOMPurify-sanitized before assignment to sanitizedHtml -->
    <!-- eslint-disable vue/no-v-html -->
    <div
      v-else-if="sanitizedHtml"
      class="preview-container document-render"
      :style="containerStyle"
      v-html="sanitizedHtml"
    />
    <!-- eslint-enable vue/no-v-html -->

    <!-- Placeholder State -->
    <div v-else class="placeholder-state">
      <p>Preparing preview…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import './resume-styles.css'

defineOptions({ name: 'PreviewPanel' })

interface Props {
  xmlContent: string
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), { zoom: 1 })

const sanitizedHtml = ref<string>('')
const error = ref<string | undefined>(undefined)

const containerStyle = computed(() => ({
  transform: `scale(${props.zoom})`,
  transformOrigin: 'top left',
}))

const ALLOWED_TAGS = [
  // Resume elements
  'document', 'header', 'name', 'contact', 'email', 'phone', 'location',
  'linkedin', 'website', 'summary', 'experience', 'role', 'title', 'company',
  'period', 'bullets', 'bullet', 'education', 'degree', 'school', 'year',
  'note', 'skills', 'certifications', 'projects', 'volunteer',
  // Cover-letter elements
  'date', 'recipient', 'greeting', 'body', 'paragraph', 'closing', 'signature',
  // Standard HTML tags DOMPurify allows anyway — kept for section labels
  'section', 'h2', 'p', 'ul', 'li', 'a', 'br', 'strong', 'em',
]

const ALLOWED_ATTR = ['type', 'href']

async function updatePreview() {
  error.value = undefined
  sanitizedHtml.value = ''

  if (!props.xmlContent) return

  try {
    // DOMPurify is browser-only — import lazily to avoid SSR issues
    const DOMPurify = (await import('dompurify')).default
    const clean = DOMPurify.sanitize(props.xmlContent, {
      ADD_TAGS: ALLOWED_TAGS,
      ADD_ATTR: ALLOWED_ATTR,
      FORCE_BODY: false,
    })
    sanitizedHtml.value = clean
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not render document'
  }
}

watch(() => props.xmlContent, updatePreview, { immediate: true })
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
  padding-bottom: 2rem;
}

@media print {
  .preview-panel {
    overflow: visible;
    height: auto;
    background: transparent;
    padding: 0;
  }

  .preview-container {
    transform: none !important;
    width: 100%;
    padding-bottom: 0;
  }
}
</style>
