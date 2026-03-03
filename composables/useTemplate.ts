/**
 * Template System Composable
 *
 * Single-template system — always returns the Modern template.
 */

import { computed } from 'vue'
import type { Component } from 'vue'
import CoverLetterModern from '~/templates/modern/CoverLetterModern.vue'

export interface TemplateMetadata {
  name: string
  displayName: string
  description: string
}

export function useTemplate() {
  const activeTemplate = useState<string>('activeTemplate', () => 'modern')

  const currentTemplate = computed<Component>(() => CoverLetterModern)

  const currentTemplateMetadata = computed<TemplateMetadata>(() => ({
    name: 'modern',
    displayName: 'Modern',
    description: 'Professional document template with modern styling and clean typography',
  }))

  return {
    activeTemplate,
    currentTemplate,
    currentTemplateMetadata,
  }
}
