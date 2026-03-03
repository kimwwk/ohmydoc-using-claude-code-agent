<template>
  <div class="preview-panel">
    <!-- Error Display -->
    <UAlert
      v-if="error"
      color="red"
      variant="solid"
      title="Parsing Error"
      :description="error"
      icon="i-heroicons-exclamation-triangle"
      class="error-alert"
    />

    <!-- Preview Rendering -->
    <div
      v-else-if="parsedData && templateComponent"
      class="preview-container"
      :style="containerStyle"
    >
      <component :is="templateComponent" :data="parsedData" />
    </div>

    <!-- Placeholder State -->
    <div v-else class="placeholder-state">
      <p>Preparing preview…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { parseXml } from '~/composables/useXmlParser'

defineOptions({ name: 'PreviewPanel' })

interface Props {
  xmlContent: string
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), { zoom: 1 })

const parsedData = ref<unknown>(undefined)
const error = ref<string | undefined>(undefined)

const { currentTemplate: templateComponent } = useTemplate()

const containerStyle = computed(() => ({
  transform: `scale(${props.zoom})`,
  transformOrigin: 'top left',
}))

function updatePreview() {
  error.value = undefined
  parsedData.value = undefined
  const result = parseXml(props.xmlContent)
  if (result.success && result.data) {
    parsedData.value = result.data
  }
  else {
    error.value = result.error || 'Could not parse document'
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
