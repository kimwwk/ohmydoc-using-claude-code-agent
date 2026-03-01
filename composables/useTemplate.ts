/**
 * Template System Composable
 *
 * Provides reactive template selection and management for document rendering.
 * Active template is shared across all components via useState and persisted
 * to localStorage so the selection survives page reloads.
 */

import { onMounted, computed } from 'vue'
import type { Component } from 'vue'
import CoverLetterModern from '~/templates/modern/CoverLetterModern.vue'
import CoverLetterClassic from '~/templates/classic/CoverLetterClassic.vue'
import CoverLetterMinimal from '~/templates/minimal/CoverLetterMinimal.vue'

const LS_KEY = 'ohmydoc_template'

// Template metadata interface for future extensibility
export interface TemplateMetadata {
  name: string
  displayName: string
  description: string
}

// Template registry type
export interface TemplateRegistry {
  [key: string]: {
    component: Component
    metadata: TemplateMetadata
  }
}

/**
 * Template Registry
 *
 * Maps template names to their Vue components and metadata.
 * All templates use the same ParsedData props interface for consistency.
 */
const templates: TemplateRegistry = {
  modern: {
    component: CoverLetterModern,
    metadata: {
      name: 'modern',
      displayName: 'Modern',
      description: 'Professional cover letter template with modern styling and clean typography',
    },
  },
  classic: {
    component: CoverLetterClassic,
    metadata: {
      name: 'classic',
      displayName: 'Classic',
      description: 'Traditional cover letter with table-based layout and formal styling',
    },
  },
  minimal: {
    component: CoverLetterMinimal,
    metadata: {
      name: 'minimal',
      displayName: 'Minimal',
      description: 'Clean, minimalist cover letter design with simple structure and generous whitespace',
    },
  },
}

/**
 * Composable function to use the reactive template system in Vue components.
 *
 * Active template state is shared across all component instances via useState.
 * On mount, the saved localStorage value is restored (client-side only).
 *
 * @returns Reactive template state and control functions
 */
export function useTemplate() {
  // Shared reactive state — useState ensures all components see the same value
  const activeTemplate = useState<string>('activeTemplate', () => 'modern')

  // Restore from localStorage after hydration (client-only, runs once per component mount)
  onMounted(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved && templates[saved]) {
        activeTemplate.value = saved
      }
    }
    catch {
      // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
  })

  /**
   * Switch to a different template and persist the choice to localStorage.
   */
  function setActiveTemplate(name: string) {
    if (!templates[name]) {
      console.warn(`Template "${name}" not found. Available: ${Object.keys(templates).join(', ')}`)
      return
    }
    activeTemplate.value = name
    try {
      localStorage.setItem(LS_KEY, name)
    }
    catch {
      // Ignore storage errors
    }
  }

  /** Reactive component for the currently active template */
  const currentTemplate = computed<Component | undefined>(
    () => templates[activeTemplate.value]?.component,
  )

  /** Metadata for the currently active template */
  const currentTemplateMetadata = computed<TemplateMetadata | undefined>(
    () => templates[activeTemplate.value]?.metadata,
  )

  /** Names of all registered templates */
  function getAvailableTemplates(): string[] {
    return Object.keys(templates)
  }

  /** Metadata objects for all registered templates */
  function getAllTemplateMetadata(): TemplateMetadata[] {
    return Object.values(templates).map(t => t.metadata)
  }

  return {
    activeTemplate,
    setActiveTemplate,
    currentTemplate,
    currentTemplateMetadata,
    getAvailableTemplates,
    getAllTemplateMetadata,
  }
}
