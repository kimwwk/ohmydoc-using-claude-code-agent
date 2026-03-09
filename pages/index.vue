<template>
  <div class="app-container">
    <AppHeader class="app-header no-print">
      <template #right-actions>
        <div class="export-area no-print">
          <div v-if="showDivergenceWarning" class="divergence-warning">
            ⚠ Some content may have been changed during formatting. Please review carefully before exporting.
          </div>
          <UButton
            size="xs"
            variant="outline"
            icon="i-heroicons-printer"
            :disabled="!formattedXml"
            @click="handlePrint"
          >
            Export PDF
          </UButton>
          <span class="export-hint">Works best in Chrome. In the print dialog, choose 'Save as PDF'.</span>
        </div>
      </template>
    </AppHeader>

    <!-- Dual-panel layout: Text input (left) and Preview (right) -->
    <div class="dual-panel-layout">
      <!-- Left Panel: Plain text input -->
      <div class="editor-panel no-print">
        <textarea
          v-model="textContent"
          class="text-input"
          :placeholder="placeholder"
          :disabled="isFormatting"
        />
        <div class="action-bar">
          <div class="type-selector">
            <button
              class="type-btn"
              :class="{ 'type-btn--active': selectedDocType === 'resume' }"
              :disabled="isFormatting"
              @click="selectedDocType = 'resume'"
            >
              Resume
            </button>
            <button
              class="type-btn"
              :class="{ 'type-btn--active': selectedDocType === 'letter' }"
              :disabled="isFormatting"
              @click="selectedDocType = 'letter'"
            >
              Letter
            </button>
          </div>
          <div class="action-row">
            <UButton
              :disabled="!textContent.trim() || isFormatting"
              :loading="isFormatting"
              @click="formatDocument"
            >
              {{ isFormatting ? 'Formatting...' : formatButtonLabel }}
            </UButton>
            <p v-if="validationMessage" class="validation-message">
              {{ validationMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Preview -->
      <div class="preview-panel">
        <!-- Skeleton loading state -->
        <div v-if="isFormatting" class="skeleton-wrapper no-print">
          <div class="skeleton skeleton-name" />
          <div class="skeleton skeleton-contact" />
          <div class="skeleton-divider" />
          <div class="skeleton skeleton-line" />
          <div class="skeleton skeleton-line skeleton-line--short" />
          <div class="skeleton skeleton-line" />
          <div class="skeleton-gap" />
          <div class="skeleton skeleton-heading" />
          <div class="skeleton skeleton-line" />
          <div class="skeleton skeleton-line skeleton-line--medium" />
          <div class="skeleton skeleton-line" />
          <div class="skeleton skeleton-line skeleton-line--short" />
          <div class="skeleton-gap" />
          <div class="skeleton skeleton-heading" />
          <div class="skeleton skeleton-line skeleton-line--medium" />
          <div class="skeleton skeleton-line skeleton-line--short" />
        </div>

        <!-- Error state -->
        <div v-else-if="formatError" class="error-state no-print">
          <p class="error-message">{{ formatError }}</p>
          <UButton variant="outline" @click="formatDocument">
            Try Again
          </UButton>
        </div>

        <!-- Empty state -->
        <div v-else-if="!formattedXml" class="preview-empty no-print">
          <p>Your formatted document will appear here.</p>
        </div>

        <!-- Preview + review note -->
        <template v-else>
          <PreviewPanel
            :xml-content="formattedXml"
            :zoom="1"
          />
          <div class="review-note no-print">
            Your content has been formatted but not rewritten. Please review before exporting.
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
const formatError = ref('')
const documentType = ref('')
const divergence = ref(0)
const validationMessage = ref('')
const selectedDocType = ref<'resume' | 'letter'>('resume')

const formatButtonLabel = computed(() =>
  selectedDocType.value === 'letter' ? 'Format My Letter' : 'Format My Resume',
)

const showDivergenceWarning = computed(() => formattedXml.value && divergence.value > 0.05)

function handlePrint() {
  window.print()
}

async function formatDocument() {
  validationMessage.value = ''

  if (!textContent.value.trim()) return

  if (textContent.value.trim().length < 50) {
    validationMessage.value = 'Please paste at least 50 characters of content to format.'
    return
  }

  if (isFormatting.value) return

  isFormatting.value = true
  formatError.value = ''
  formattedXml.value = ''
  documentType.value = ''
  divergence.value = 0

  try {
    const result = await $fetch<{ xml: string, divergence: number, documentType: string }>('/api/format', {
      method: 'POST',
      body: { text: textContent.value, docType: selectedDocType.value },
    })
    formattedXml.value = result.xml
    documentType.value = result.documentType
    divergence.value = result.divergence
  }
  catch (err: unknown) {
    const raw = (err as { data?: { rawResponse?: string } })?.data?.rawResponse
    if (raw) {
      console.error('[OhMyDoc] Raw AI response (malformed XML):', raw)
    }
    const message = (err as { data?: { message?: string } })?.data?.message
    formatError.value = message || 'Something went wrong. Please try again.'
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

.text-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-bar {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.type-selector {
  display: flex;
  gap: 0;
  width: fit-content;
  border: 1px solid var(--color-gray-300);
  border-radius: 6px;
  overflow: hidden;
}

.type-btn {
  padding: 0.3rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: none;
  background: #fff;
  color: var(--color-gray-600);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  line-height: 1.5;
}

.type-btn:first-child {
  border-right: 1px solid var(--color-gray-300);
}

.type-btn--active {
  background-color: var(--color-gray-900);
  color: #fff;
}

.type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-btn:not(:disabled):not(.type-btn--active):hover {
  background-color: var(--color-gray-100);
}

.action-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.validation-message {
  font-size: 0.8rem;
  color: var(--color-amber-600, #d97706);
}

.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: var(--color-gray-50);
  position: relative;
}

.preview-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-400);
  font-size: 0.875rem;
}

/* ── Skeleton loading UI ── */
.skeleton-wrapper {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-gray-200) 25%,
    var(--color-gray-100) 50%,
    var(--color-gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-name {
  height: 2rem;
  width: 55%;
  margin-bottom: 0.25rem;
}

.skeleton-contact {
  height: 1rem;
  width: 70%;
  margin-bottom: 0.5rem;
}

.skeleton-divider {
  height: 2px;
  background: var(--color-gray-200);
  margin: 0.75rem 0;
  border-radius: 0;
}

.skeleton-line {
  height: 0.875rem;
  width: 100%;
}

.skeleton-line--short {
  width: 55%;
}

.skeleton-line--medium {
  width: 75%;
}

.skeleton-gap {
  height: 1rem;
}

.skeleton-heading {
  height: 1rem;
  width: 30%;
  margin-bottom: 0.25rem;
}

/* ── Error state ── */
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.error-message {
  color: var(--color-red-600);
  font-size: 0.9rem;
  text-align: center;
  max-width: 320px;
}

/* ── Review / mutation note ── */
.review-note {
  padding: 0.6rem 1.25rem;
  font-size: 0.75rem;
  color: var(--color-gray-500);
  background: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
  text-align: center;
}

/* ── Export area in header ── */
.export-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.export-hint {
  font-size: 0.7rem;
  color: var(--color-gray-400);
  white-space: nowrap;
}

/* ── Divergence / mutation warning ── */
.divergence-warning {
  font-size: 0.75rem;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  max-width: 360px;
}

/* ── Print ── */
@media print {
  .no-print {
    display: none !important;
  }

  .app-container {
    display: block;
    height: auto;
    overflow: visible;
  }

  .dual-panel-layout {
    display: block;
    min-width: unset;
  }

  .preview-panel {
    background: transparent;
    overflow: visible;
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
