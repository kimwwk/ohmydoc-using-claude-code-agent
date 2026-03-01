/**
 * Document Type Registry Composable
 *
 * Manages the registry of supported document types and the currently active
 * document type. Each document type bundles its own parser, validator,
 * available templates, and sample XML path.
 *
 * Architecture note: this composable is the single source of truth for
 * "what document type am I editing right now?" All other composables and
 * components that need type-specific behaviour should consult it.
 */

import { computed, onMounted } from 'vue'
import { parseXml as parseCoverLetterXml, validateXml as validateCoverLetterXml } from '~/composables/useXmlParser'
import type { ValidationResult, ParseResult } from '~/composables/useXmlParser'
import { parseResignationXml, validateResignationXml } from '~/composables/useResignationParser'

const LS_KEY = 'ohmydoc_document_type'

// ─── Public interfaces ────────────────────────────────────────────────────────

export interface DocumentTypeConfig {
  /** Internal key used in URLs, localStorage, and template associations */
  name: string
  /** Human-readable label shown in the UI */
  displayName: string
  /** Short description of the document type */
  description: string
  /** Path to the bundled sample XML (relative to /public) */
  sampleXmlPath: string
  /** Template to activate when this document type is first selected */
  defaultTemplate: string
  /** Names of templates registered in useTemplate that support this type */
  templates: string[]
  /** Parse an XML string into a typed data object for template rendering */
  parse: (xmlString: string) => ParseResult
  /** Validate well-formedness and schema requirements without full parsing */
  validate: (xmlString: string) => ValidationResult
}

// ─── Registry ─────────────────────────────────────────────────────────────────

/**
 * All registered document types.
 *
 * To add a new type, append an entry here following the same shape as
 * 'cover-letter'. The parser and validator functions live in their own
 * composable (e.g. useResumParser.ts) and are imported at the top of this file.
 */
const documentTypes: Record<string, DocumentTypeConfig> = {
  'cover-letter': {
    name: 'cover-letter',
    displayName: 'Cover Letter',
    description: 'Professional cover letter for job applications',
    sampleXmlPath: '/samples/cover-letter.xml',
    defaultTemplate: 'modern',
    templates: ['modern', 'classic', 'minimal'],
    parse: parseCoverLetterXml,
    validate: validateCoverLetterXml,
  },
  'resignation-letter': {
    name: 'resignation-letter',
    displayName: 'Resignation Letter',
    description: 'Formal resignation letter to notify an employer',
    sampleXmlPath: '/samples/resignation-letter.xml',
    defaultTemplate: 'resignation-professional',
    templates: ['resignation-professional', 'resignation-brief'],
    parse: parseResignationXml,
    validate: validateResignationXml,
  },
}

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * Reactive document type selection.
 *
 * State is shared across all component instances via useState and persisted
 * to localStorage so the selection survives page reloads.
 */
export function useDocumentType() {
  const activeDocumentType = useState<string>('activeDocumentType', () => 'cover-letter')

  // Restore from localStorage after hydration (client-only)
  onMounted(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved && documentTypes[saved]) {
        activeDocumentType.value = saved
      }
    }
    catch {
      // Ignore storage errors (private browsing, quota exceeded, etc.)
    }
  })

  /**
   * Switch to a different document type and persist the choice to localStorage.
   * Also resets the active template to that type's default.
   */
  function setActiveDocumentType(name: string) {
    if (!documentTypes[name]) {
      console.warn(`Document type "${name}" not found. Available: ${Object.keys(documentTypes).join(', ')}`)
      return
    }
    activeDocumentType.value = name
    try {
      localStorage.setItem(LS_KEY, name)
    }
    catch {
      // Ignore storage errors
    }
  }

  /** Config object for the currently active document type */
  const currentDocumentType = computed<DocumentTypeConfig | undefined>(
    () => documentTypes[activeDocumentType.value],
  )

  /** All registered document type config objects */
  function getAvailableDocumentTypes(): DocumentTypeConfig[] {
    return Object.values(documentTypes)
  }

  return {
    activeDocumentType,
    currentDocumentType,
    setActiveDocumentType,
    getAvailableDocumentTypes,
  }
}
