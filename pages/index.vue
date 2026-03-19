<template>
  <div class="app-container">
    <AppHeader class="app-header no-print">
      <template #right-actions>
        <div class="export-area no-print">
          <div v-if="showDivergenceWarning" class="divergence-info">
            ℹ Formatting was applied — please review before exporting.
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
      <!-- Left Panel: Plain text input or XML editor -->
      <div class="editor-panel no-print">
        <!-- Panel header (XML mode only) -->
        <div v-if="viewMode === 'xml'" class="xml-panel-header">
          <span class="xml-panel-label">XML Source</span>
          <button class="xml-back-btn" @click="viewMode = 'text'">← Back to text</button>
        </div>

        <!-- Text input (default mode) -->
        <textarea
          v-if="viewMode === 'text'"
          v-model="textContent"
          class="text-input"
          :placeholder="placeholder"
          :disabled="isFormatting"
        />

        <!-- XML editor (xml mode) -->
        <textarea
          v-else
          v-model="formattedXml"
          class="text-input xml-input"
          spellcheck="false"
        />

        <div class="action-bar">
          <template v-if="viewMode === 'text'">
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
              <button
                v-if="formattedXml"
                class="xml-toggle-btn"
                :disabled="isFormatting"
                @click="viewMode = 'xml'"
              >
                Edit XML
              </button>
              <p v-if="validationMessage" class="validation-message">
                {{ validationMessage }}
              </p>
            </div>
            <div class="sample-row">
              <span class="sample-label">Try a sample:</span>
              <button class="sample-link" :disabled="isFormatting" @click="loadSample('resume')">Resume</button>
              <span class="sample-sep">·</span>
              <button class="sample-link" :disabled="isFormatting" @click="loadSample('letter')">Letter</button>
            </div>
          </template>

          <template v-else>
            <div class="action-row">
              <UButton
                variant="outline"
                :disabled="isFormatting"
                @click="reformat"
              >
                Re-format with AI
              </UButton>
            </div>
          </template>
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
          <p class="empty-hint">
            New here? Try a sample:
          </p>
          <div class="sample-buttons">
            <UButton variant="outline" size="sm" :disabled="isFormatting" @click="loadSample('resume')">
              Try Resume Sample
            </UButton>
            <UButton variant="outline" size="sm" :disabled="isFormatting" @click="loadSample('letter')">
              Try Letter Sample
            </UButton>
          </div>
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
  title: 'OhMyDoc — Free Resume Formatter | Paste → Format → PDF',
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
const viewMode = ref<'text' | 'xml'>('text')

const formatButtonLabel = computed(() =>
  selectedDocType.value === 'letter' ? 'Format My Letter' : 'Format My Resume',
)

const showDivergenceWarning = computed(() => formattedXml.value && divergence.value > 0.05)

function handlePrint() {
  window.print()
}

async function loadSample(type: 'resume' | 'letter') {
  const filename = type === 'resume' ? 'resume-sample.txt' : 'letter-sample.txt'
  const response = await fetch(`/samples/${filename}`)
  const text = await response.text()
  textContent.value = text
  selectedDocType.value = type
  formatDocument()
}

function reformat() {
  viewMode.value = 'text'
  formatDocument()
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
  background: #f1f5f9;
}

.dual-panel-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1;
  min-height: 0;
  gap: 0;
  min-width: 1024px;
}

/* ── Left panel (editor) ── */
.editor-panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-right: 1px solid #e2e8f0;
  box-shadow: 1px 0 0 0 #e2e8f0;
}

.text-input {
  flex: 1;
  resize: none;
  border: none;
  outline: none;
  padding: 1.5rem;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 0.875rem;
  line-height: 1.7;
  color: #1e293b;
  background-color: #fff;
  min-height: 0;
}

.text-input::placeholder {
  color: #94a3b8;
}

.text-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── XML panel header ── */
.xml-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-shrink: 0;
}

.xml-panel-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.xml-back-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: none;
}

.xml-back-btn:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* ── XML input ── */
.xml-input {
  font-family: ui-monospace, SFMono-Regular, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
  font-size: 0.8125rem;
  color: #334155;
  background: #fafafa;
}

/* ── Action bar ── */
.action-bar {
  padding: 0.875rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.type-selector {
  display: flex;
  gap: 0;
  width: fit-content;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  overflow: hidden;
}

.type-btn {
  padding: 0.3rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border: none;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
  line-height: 1.5;
}

.type-btn:first-child {
  border-right: 1px solid #cbd5e1;
}

.type-btn--active {
  background-color: #0f172a;
  color: #fff;
}

.type-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.type-btn:not(:disabled):not(.type-btn--active):hover {
  background-color: #f1f5f9;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.validation-message {
  font-size: 0.8rem;
  color: #b45309;
}

.xml-toggle-btn {
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  color: #475569;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, border-color 0.15s;
}

.xml-toggle-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #94a3b8;
  color: #1e293b;
}

.xml-toggle-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Right panel (preview canvas) ── */
.preview-panel {
  display: flex;
  flex-direction: column;
  overflow: auto;
  background-color: #e2e8f0;
  position: relative;
}

.preview-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
}

.empty-hint {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.sample-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* ── Sample row (inline links under format button) ── */
.sample-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #94a3b8;
}

.sample-label {
  color: #94a3b8;
}

.sample-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.78rem;
  color: #64748b;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.sample-link:hover:not(:disabled) {
  color: #0f172a;
}

.sample-link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sample-sep {
  color: #cbd5e1;
}

/* ── Skeleton loading UI ── */
.skeleton-wrapper {
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  /* Skeleton sits inside the preview canvas, give it document-like background */
  background: #fff;
  margin: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 4px 0 rgba(15, 23, 42, 0.08);
}

.skeleton {
  background: linear-gradient(
    90deg,
    #e2e8f0 25%,
    #f1f5f9 50%,
    #e2e8f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 3px;
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
  background: #e2e8f0;
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
  color: #dc2626;
  font-size: 0.9rem;
  text-align: center;
  max-width: 320px;
}

/* ── Review note (shown below preview when document is rendered) ── */
.review-note {
  padding: 0.6rem 1.25rem;
  font-size: 0.75rem;
  color: #64748b;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  flex-shrink: 0;
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
  color: #94a3b8;
  white-space: nowrap;
}

/* ── Divergence info (subtle, not alarming) ── */
.divergence-info {
  font-size: 0.75rem;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
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
    background: transparent;
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
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
