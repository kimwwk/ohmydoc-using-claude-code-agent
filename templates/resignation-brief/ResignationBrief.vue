<template>
  <div class="resignation-brief">
    <!-- Compact header: name, position, date inline -->
    <div class="rb-header">
      <span class="rb-name">{{ data.sender.name }}</span>
      <span v-if="data.sender.position" class="rb-sep">·</span>
      <span v-if="data.sender.position" class="rb-position">{{ data.sender.position }}</span>
      <span v-if="data.date" class="rb-date">{{ data.date }}</span>
    </div>

    <!-- Recipient line -->
    <div v-if="data.recipient" class="rb-recipient">
      <span v-if="data.recipient.name">{{ data.recipient.name }}</span>
      <template v-if="data.recipient.title">
        <span class="rb-sep">·</span>
        <span>{{ data.recipient.title }}</span>
      </template>
      <template v-if="data.recipient.company">
        <span class="rb-sep">·</span>
        <span>{{ data.recipient.company }}</span>
      </template>
    </div>

    <!-- Body paragraphs -->
    <div v-if="data.body && data.body.length > 0" class="rb-body">
      <p v-for="(paragraph, index) in data.body" :key="index" class="rb-paragraph">
        {{ paragraph }}
      </p>
    </div>

    <!-- Signature -->
    <div v-if="data.signature" class="rb-signature">
      {{ data.signature.name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResignationParsedData } from '~/composables/useResignationParser'
import './styles.css'

/**
 * Brief Resignation Letter Template
 *
 * Compact, no-frills layout. Single-line header with name and date,
 * recipient on one line, then body paragraphs and a minimal signature.
 * Uses only scoped CSS — no @nuxt/ui components — so it is exportable as
 * standalone HTML.
 */

interface Props {
  data: ResignationParsedData
}

defineProps<Props>()
</script>

<style scoped>
/**
 * CSS is imported as a module in the <script> section above.
 * This empty scoped block applies Vue's data-v-* scoping to all elements.
 * See CLAUDE.md "Template System" section for rationale.
 */
</style>
