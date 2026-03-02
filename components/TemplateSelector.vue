<template>
  <div ref="wrapperRef" class="ts-wrapper">
    <!-- Trigger button — styled to match UButton outline xs -->
    <button class="ts-trigger" :class="{ 'ts-trigger--open': isOpen }" @click="isOpen = !isOpen">
      <UIcon name="i-lucide-layout-template" class="ts-icon" />
      <span>{{ currentTemplateMetadata?.displayName ?? 'Template' }}</span>
      <UIcon name="i-lucide-chevron-down" class="ts-chevron" :class="{ 'ts-chevron--open': isOpen }" />
    </button>

    <!-- Dropdown panel -->
    <div v-if="isOpen" class="ts-panel">
      <p class="ts-heading">Choose template</p>
      <div class="ts-grid">
        <button
          v-for="tmpl in templates"
          :key="tmpl.name"
          class="ts-card"
          :class="{ 'ts-card--active': tmpl.name === activeTemplate }"
          :title="tmpl.description"
          @click="select(tmpl.name)"
        >
          <!-- CSS layout sketch -->
          <div class="ts-sketch" :class="`sketch-${tmpl.name}`">
            <template v-if="tmpl.name === 'modern'">
              <div class="sk-bar" />
              <div class="sk-name" />
              <div class="sk-sub" />
              <div class="sk-lines" />
            </template>

            <template v-else-if="tmpl.name === 'classic'">
              <div class="sk-header-box">
                <div class="sk-name-c" />
                <div class="sk-sub-c" />
              </div>
              <div class="sk-rule" />
              <div class="sk-lines" />
            </template>

            <template v-else-if="tmpl.name === 'minimal'">
              <div class="sk-name" />
              <div class="sk-thin-rule" />
              <div class="sk-lines" />
            </template>

            <template v-else-if="tmpl.name === 'executive'">
              <div class="sk-navy-block">
                <div class="sk-name-white" />
              </div>
              <div class="sk-rule" />
              <div class="sk-lines" />
            </template>

            <template v-else-if="tmpl.name === 'creative'">
              <div class="sk-sidebar">
                <div class="sk-side-name" />
                <div class="sk-side-lines" />
              </div>
              <div class="sk-main">
                <div class="sk-name" />
                <div class="sk-lines" />
              </div>
            </template>

            <template v-else-if="tmpl.name === 'resignation-professional'">
              <div class="sk-sender" />
              <div class="sk-date" />
              <div class="sk-recipient" />
              <div class="sk-lines" />
            </template>

            <template v-else-if="tmpl.name === 'resignation-brief'">
              <div class="sk-name-c" />
              <div class="sk-thin-rule" />
              <div class="sk-lines" />
            </template>
          </div>

          <span class="ts-card-name">{{ tmpl.displayName }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTemplate } from '~/composables/useTemplate'
import { useDocumentType } from '~/composables/useDocumentType'

const { activeTemplate, setActiveTemplate, getTemplatesForDocumentType, currentTemplateMetadata } = useTemplate()
const { activeDocumentType } = useDocumentType()

const isOpen = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const templates = computed(() => getTemplatesForDocumentType(activeDocumentType.value))

function select(name: string) {
  setActiveTemplate(name)
  isOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocumentClick))
</script>

<style scoped>
/* ── Wrapper ──────────────────────────────────────────────────────────────── */

.ts-wrapper {
  position: relative;
  display: inline-block;
}

/* ── Trigger ──────────────────────────────────────────────────────────────── */

.ts-trigger {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.1s, border-color 0.1s;
  white-space: nowrap;
}

.ts-trigger:hover,
.ts-trigger--open {
  background: #f9fafb;
  border-color: #d1d5db;
}

.ts-icon {
  width: 13px;
  height: 13px;
  opacity: 0.7;
  flex-shrink: 0;
}

.ts-chevron {
  width: 11px;
  height: 11px;
  opacity: 0.5;
  flex-shrink: 0;
  transition: transform 0.15s;
}

.ts-chevron--open {
  transform: rotate(180deg);
}

/* ── Panel ────────────────────────────────────────────────────────────────── */

.ts-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 50;
  padding: 12px;
  min-width: 292px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
}

.ts-heading {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 0 0 10px 0;
}

/* ── Card grid ────────────────────────────────────────────────────────────── */

.ts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* ── Individual card ──────────────────────────────────────────────────────── */

.ts-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 7px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  text-align: center;
}

.ts-card:hover {
  border-color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.ts-card--active {
  border-color: #0f6fec;
  box-shadow: 0 0 0 1px #0f6fec;
}

.ts-card-name {
  font-size: 10px;
  font-weight: 500;
  color: #4b5563;
  line-height: 1;
}

.ts-card--active .ts-card-name {
  color: #0f6fec;
  font-weight: 600;
}

/* ── Sketch container ─────────────────────────────────────────────────────── */

.ts-sketch {
  width: 72px;
  height: 88px;
  border-radius: 3px;
  overflow: hidden;
  position: relative;
  background: #fff;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}

/* ════════════════════════════════════════════════════════════════════════════
   SHARED SKETCH PRIMITIVES
   ════════════════════════════════════════════════════════════════════════════ */

.sk-name {
  position: absolute;
  border-radius: 1px;
  background: #374151;
}

.sk-sub {
  position: absolute;
  border-radius: 1px;
  background: #9ca3af;
}

.sk-rule {
  position: absolute;
  height: 1px;
  background: #9ca3af;
}

.sk-thin-rule {
  position: absolute;
  height: 1px;
  background: #e5e7eb;
}

/* Multi-gradient trick: simulate multiple text lines from a single element */
.sk-lines {
  position: absolute;
  background-repeat: no-repeat;
  background-image:
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%);
  background-size:
    100% 2px,
    78% 2px,
    94% 2px,
    65% 2px,
    88% 2px;
  background-position:
    0 0,
    0 8px,
    0 16px,
    0 24px,
    0 32px;
}

/* ════════════════════════════════════════════════════════════════════════════
   MODERN  – blue left accent bar, clean single-column
   ════════════════════════════════════════════════════════════════════════════ */

.sketch-modern .sk-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #0f6fec;
}

.sketch-modern .sk-name {
  left: 10px;
  right: 6px;
  top: 8px;
  height: 5px;
}

.sketch-modern .sk-sub {
  left: 10px;
  top: 18px;
  width: 40%;
  height: 2px;
}

.sketch-modern .sk-lines {
  left: 10px;
  right: 6px;
  top: 28px;
}

/* ════════════════════════════════════════════════════════════════════════════
   CLASSIC  – outer border, centered header, horizontal divider
   ════════════════════════════════════════════════════════════════════════════ */

.sketch-classic {
  border: 2px solid #9ca3af !important;
}

.sk-header-box {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 26px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: #f9fafb;
}

.sk-name-c {
  width: 55%;
  height: 4px;
  background: #374151;
  border-radius: 1px;
}

.sk-sub-c {
  width: 35%;
  height: 2px;
  background: #9ca3af;
  border-radius: 1px;
}

.sketch-classic .sk-rule {
  left: 8px;
  right: 8px;
  top: 28px;
}

.sketch-classic .sk-lines {
  left: 8px;
  right: 8px;
  top: 35px;
}

/* ════════════════════════════════════════════════════════════════════════════
   MINIMAL  – lots of whitespace, sparse lines
   ════════════════════════════════════════════════════════════════════════════ */

.sketch-minimal .sk-name {
  left: 12px;
  right: 12px;
  top: 12px;
  height: 4px;
  background: #4b5563;
}

.sketch-minimal .sk-thin-rule {
  left: 12px;
  right: 12px;
  top: 22px;
}

.sketch-minimal .sk-lines {
  left: 12px;
  right: 12px;
  top: 34px;
  background-image:
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%);
  background-size:
    100% 2px,
    75% 2px,
    90% 2px;
  background-position:
    0 0,
    0 12px,
    0 24px;
}

/* ════════════════════════════════════════════════════════════════════════════
   EXECUTIVE  – solid navy header block, bold white name, horizontal rule
   ════════════════════════════════════════════════════════════════════════════ */

.sk-navy-block {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 24px;
  background: #1a2744;
  display: flex;
  align-items: center;
  padding: 0 6px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.sk-name-white {
  height: 4px;
  width: 58%;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 1px;
}

.sketch-executive .sk-rule {
  left: 6px;
  right: 6px;
  top: 30px;
  background: #1a2744;
  height: 2px;
}

.sketch-executive .sk-lines {
  left: 6px;
  right: 6px;
  top: 38px;
}

/* ════════════════════════════════════════════════════════════════════════════
   CREATIVE  – purple sidebar + white content column
   ════════════════════════════════════════════════════════════════════════════ */

.sketch-creative {
  display: flex;
}

.sk-sidebar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 22px;
  background: #5e60ce;
  display: flex;
  flex-direction: column;
  padding: 6px 3px;
  gap: 4px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.sk-side-name {
  height: 3px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1px;
}

.sk-side-lines {
  flex: 1;
  background-image:
    linear-gradient(rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 100%),
    linear-gradient(rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 100%),
    linear-gradient(rgba(255,255,255,0.45) 0, rgba(255,255,255,0.45) 100%);
  background-size: 100% 2px, 80% 2px, 100% 2px;
  background-position: 0 0, 0 8px, 0 16px;
  background-repeat: no-repeat;
}

.sk-main {
  position: absolute;
  left: 26px;
  right: 4px;
  top: 0;
  bottom: 0;
}

.sketch-creative .sk-name {
  left: 0;
  right: 0;
  top: 8px;
  height: 4px;
}

.sketch-creative .sk-lines {
  left: 0;
  right: 0;
  top: 20px;
}

/* ════════════════════════════════════════════════════════════════════════════
   RESIGNATION-PROFESSIONAL  – letterhead with sender + date row
   ════════════════════════════════════════════════════════════════════════════ */

.sk-sender {
  position: absolute;
  left: 6px;
  top: 7px;
  width: 38%;
  height: 3px;
  background: #374151;
  border-radius: 1px;
}

.sk-date {
  position: absolute;
  right: 6px;
  top: 7px;
  width: 22%;
  height: 3px;
  background: #9ca3af;
  border-radius: 1px;
}

.sk-recipient {
  position: absolute;
  left: 6px;
  right: 6px;
  top: 18px;
  height: 14px;
  background-image:
    linear-gradient(#6b7280 0, #6b7280 100%),
    linear-gradient(#6b7280 0, #6b7280 100%),
    linear-gradient(#6b7280 0, #6b7280 100%);
  background-size: 50% 2px, 42% 2px, 36% 2px;
  background-position: 0 0, 0 6px, 0 12px;
  background-repeat: no-repeat;
}

.sketch-resignation-professional .sk-lines {
  left: 6px;
  right: 6px;
  top: 40px;
  background-image:
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%);
  background-size: 100% 2px, 82% 2px, 96% 2px, 70% 2px;
  background-position: 0 0, 0 8px, 0 16px, 0 24px;
}

/* ════════════════════════════════════════════════════════════════════════════
   RESIGNATION-BRIEF  – compact, centered, minimal
   ════════════════════════════════════════════════════════════════════════════ */

.sketch-resignation-brief .sk-name-c {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  width: 50%;
  height: 4px;
  background: #374151;
  border-radius: 1px;
}

.sketch-resignation-brief .sk-thin-rule {
  left: 15%;
  right: 15%;
  top: 20px;
}

.sketch-resignation-brief .sk-lines {
  left: 8px;
  right: 8px;
  top: 30px;
  background-image:
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%),
    linear-gradient(#d1d5db 0, #d1d5db 100%);
  background-size: 100% 2px, 75% 2px, 90% 2px, 60% 2px;
  background-position: 0 0, 0 8px, 0 16px, 0 24px;
}
</style>
