/**
 * HTML Export Composable
 *
 * Provides functionality to export the rendered template as a standalone HTML file.
 * The export includes embedded CSS (no external dependencies) and produces
 * valid, properly formatted HTML that opens correctly in any browser.
 *
 * Key features:
 * - Extracts rendered HTML from preview element
 * - Embeds template-specific CSS (excludes @nuxt/ui styles)
 * - Generates complete HTML5 document
 * - Triggers browser download with proper filename
 */

import modernCss from '~/templates/modern/styles.css?raw'
import classicCss from '~/templates/classic/styles.css?raw'
import minimalCss from '~/templates/minimal/styles.css?raw'
import { useTemplate } from './useTemplate'

/**
 * Template CSS registry
 * Maps template names to their raw CSS content (imported at build time)
 */
const templateCssRegistry: Record<string, string> = {
  modern: modernCss,
  classic: classicCss,
  minimal: minimalCss,
}

/**
 * Export result interface
 */
export interface ExportResult {
  success: boolean
  error?: string
  filename?: string
}

/**
 * useExport composable
 *
 * Provides HTML export functionality for the application.
 * Extracts rendered content and template CSS to create standalone HTML files.
 */
export function useExport() {
  const { activeTemplate, getCurrentTemplateMetadata } = useTemplate()

  /**
   * Get the raw CSS for the current template
   */
  function getTemplateCss(): string {
    return templateCssRegistry[activeTemplate] || templateCssRegistry.modern
  }

  /**
   * Remove Vue scoping attributes (data-v-xxxxx) from an element and its children
   * This produces cleaner HTML output that works with the raw CSS
   */
  function removeVueScopingAttributes(element: Element): void {
    // Get all attributes that start with 'data-v-'
    const attrsToRemove: string[] = []
    for (let i = 0; i < element.attributes.length; i++) {
      const attrName = element.attributes[i].name
      if (attrName.startsWith('data-v-')) {
        attrsToRemove.push(attrName)
      }
    }

    // Remove the attributes
    attrsToRemove.forEach(attr => element.removeAttribute(attr))

    // Recursively process child elements
    for (let i = 0; i < element.children.length; i++) {
      removeVueScopingAttributes(element.children[i])
    }
  }

  /**
   * Clean HTML content for export
   * Clones the element and removes Vue-specific attributes
   */
  function cleanHtmlForExport(element: Element): string {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as Element

    // Remove Vue scoping attributes
    removeVueScopingAttributes(clone)

    return clone.outerHTML
  }

  /**
   * Generate a complete HTML5 document with embedded CSS
   */
  function generateHtmlDocument(content: string, css: string, title: string): string {
    // Format the CSS with proper indentation
    const formattedCss = css
      .split('\n')
      .map(line => `    ${line}`)
      .join('\n')
      .trim()

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${formattedCss}
  </style>
</head>
<body>
  ${content}
</body>
</html>
`
  }

  /**
   * Trigger browser download of HTML content
   */
  function downloadHtml(html: string, filename: string): void {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  /**
   * Generate filename for export
   * Format: cover-letter-{template}-{timestamp}.html
   */
  function generateFilename(): string {
    const timestamp = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
    return `cover-letter-${activeTemplate}-${timestamp}.html`
  }

  /**
   * Export HTML from preview element
   *
   * @param previewElement - The preview container element containing the rendered template
   * @returns ExportResult indicating success or failure
   */
  function exportHtml(previewElement: HTMLElement | null): ExportResult {
    try {
      // Validate preview element
      if (!previewElement) {
        return {
          success: false,
          error: 'Preview element not found',
        }
      }

      // Find the document element within the preview
      // Templates use class like 'application-document', 'classic-document', 'minimal-document'
      const documentElement = previewElement.querySelector(
        '.application-document, .classic-document, .minimal-document, [class*="-document"]'
      )

      if (!documentElement) {
        return {
          success: false,
          error: 'No document content found to export. Please ensure XML is parsed correctly.',
        }
      }

      // Clean the HTML for export
      const cleanedHtml = cleanHtmlForExport(documentElement)

      // Get template CSS
      const css = getTemplateCss()

      // Generate document title
      const templateMeta = getCurrentTemplateMetadata()
      const title = `Cover Letter - ${templateMeta.displayName} Template`

      // Generate complete HTML document
      const fullHtml = generateHtmlDocument(cleanedHtml, css, title)

      // Generate filename and trigger download
      const filename = generateFilename()
      downloadHtml(fullHtml, filename)

      return {
        success: true,
        filename,
      }
    }
    catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during export'
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  return {
    exportHtml,
    getTemplateCss,
    generateFilename,
  }
}
