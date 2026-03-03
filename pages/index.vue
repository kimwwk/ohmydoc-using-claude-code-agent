<template>
  <div class="app-container">
    <AppHeader>
      <template #right-actions>
        <UButton
          size="xs"
          variant="outline"
          icon="i-heroicons-printer"
          @click="handlePrint"
        >
          Export PDF
        </UButton>
      </template>
    </AppHeader>

    <!-- Dual-panel layout: Text input (left) and Preview (right) -->
    <div class="dual-panel-layout">
      <!-- Left Panel: Plain text input -->
      <div class="editor-panel">
        <textarea
          v-model="textContent"
          class="text-input"
          :placeholder="placeholder"
        />
        <div class="action-bar">
          <UButton
            :disabled="!textContent.trim() || isFormatting"
            :loading="isFormatting"
            @click="formatDocument"
          >
            {{ isFormatting ? 'Formatting...' : 'Format My Resume' }}
          </UButton>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="preview-panel">
        <div v-if="!formattedXml" class="preview-empty">
          <p>Your formatted document will appear here.</p>
        </div>
        <PreviewPanel
          v-else
          :xml-content="formattedXml"
          :zoom="1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

useHead({
  title: 'OhMyDoc',
})

const placeholder = `Paste your resume or cover letter here.

Example:
Jane Smith
jane@email.com · Toronto, ON

Software Engineer with 8 years...`

const textContent = ref('')
const formattedXml = ref('')
const isFormatting = ref(false)

function handlePrint() {
  window.print()
}

async function formatDocument() {
  if (!textContent.value.trim() || isFormatting.value) return
  isFormatting.value = true
  try {
    const result = await $fetch<{ xml: string, divergence: number, documentType: string }>('/api/format', {
      method: 'POST',
      body: { text: textContent.value },
    })
    formattedXml.value = result.xml
  }
  catch (err) {
    console.error('Format error:', err)
  }
  finally {
    isFormatting.value = false
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.dual-panel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
  gap: 0;
  min-width: 1024px;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid var(--color-gray-200);
}

.text-input {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  padding: 1.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-gray-900);
  background-color: #fff;
  min-height: 0;
}

.action-bar {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: var(--color-gray-50);
}

.preview-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  font-size: 0.875rem;
}

@media print {
  .app-container {
    display: block;
    height: auto;
    overflow: visible;
  }

  .app-header {
    display: none;
  }

  .editor-panel {
    display: none;
  }

  .dual-panel-layout {
    display: block;
    min-width: unset;
  }

  .preview-panel {
    background: transparent;
  }
}

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
