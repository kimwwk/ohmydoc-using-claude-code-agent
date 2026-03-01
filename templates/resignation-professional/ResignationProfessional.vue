<template>
  <article class="resignation-professional">
    <!-- Letterhead: sender info top-left, date top-right -->
    <header class="rp-header">
      <div class="rp-sender">
        <h1 class="rp-sender-name">{{ data.sender.name }}</h1>
        <p v-if="data.sender.position" class="rp-sender-position">{{ data.sender.position }}</p>
      </div>
      <div v-if="data.date" class="rp-date">{{ data.date }}</div>
    </header>

    <hr class="rp-rule">

    <!-- Recipient block -->
    <div v-if="data.recipient" class="rp-recipient">
      <p v-if="data.recipient.name" class="rp-recipient-name">{{ data.recipient.name }}</p>
      <p v-if="data.recipient.title" class="rp-recipient-title">{{ data.recipient.title }}</p>
      <p v-if="data.recipient.company" class="rp-recipient-company">{{ data.recipient.company }}</p>
    </div>

    <!-- Body paragraphs -->
    <main v-if="data.body && data.body.length > 0" class="rp-body">
      <p v-for="(paragraph, index) in data.body" :key="index" class="rp-paragraph">
        {{ paragraph }}
      </p>
    </main>

    <!-- Signature block -->
    <footer v-if="data.signature" class="rp-signature-block">
      <p class="rp-signature-name">{{ data.signature.name }}</p>
      <p v-if="data.signature.position" class="rp-signature-position">{{ data.signature.position }}</p>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { ResignationParsedData } from '~/composables/useResignationParser'
import './styles.css'

/**
 * Professional Resignation Letter Template
 *
 * Formal letterhead layout: sender top-left, date top-right, ruled divider,
 * then recipient block, body paragraphs, and signature.
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
