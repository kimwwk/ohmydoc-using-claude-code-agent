/**
 * Resignation Letter Parser Composable
 *
 * Provides XML parsing and validation for resignation letter documents.
 * Uses the same browser DOMParser approach as useXmlParser.ts.
 *
 * XML Schema:
 * <resignationLetter>
 *   <sender>
 *     <name>...</name>
 *     <position>...</position>
 *   </sender>
 *   <date>...</date>
 *   <recipient>
 *     <name>...</name>
 *     <title>...</title>
 *     <company>...</company>
 *   </recipient>
 *   <body>
 *     <paragraph>...</paragraph>
 *   </body>
 *   <signature>
 *     <name>...</name>
 *     <position>...</position>
 *   </signature>
 * </resignationLetter>
 */

import type { ValidationResult, ParseResult } from '~/composables/useXmlParser'

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface ResignationSender {
  name: string
  position: string
}

export interface ResignationRecipient {
  name: string
  title: string
  company: string
}

export interface ResignationSignature {
  name: string
  position: string
}

export interface ResignationParsedData {
  sender: ResignationSender
  date: string
  recipient: ResignationRecipient
  body: string[]
  signature: ResignationSignature
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getText(parent: Element | null, selector: string): string {
  if (!parent) return ''
  return parent.querySelector(selector)?.textContent?.trim() ?? ''
}

// ─── Validate ─────────────────────────────────────────────────────────────────

export function validateResignationXml(xmlString: string): ValidationResult {
  if (!xmlString || xmlString.trim() === '') {
    return {
      isValid: false,
      error: 'XML input is empty. Please provide valid XML content.',
    }
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')

  const parserError = doc.querySelector('parsererror')
  if (parserError) {
    const errorText = parserError.textContent || 'Unknown XML parsing error'

    if (errorText.includes('unclosed tag') || errorText.includes('Opening and ending tag mismatch')) {
      return {
        isValid: false,
        error: 'XML has unclosed or mismatched tags. Please check that all opening tags have corresponding closing tags.',
      }
    }
    if (errorText.includes('Unexpected end of file') || errorText.includes('premature end of data')) {
      return {
        isValid: false,
        error: 'XML is incomplete. The document appears to end unexpectedly.',
      }
    }

    return {
      isValid: false,
      error: `XML parsing error: ${errorText}`,
    }
  }

  const root = doc.documentElement
  if (!root || root.tagName !== 'resignationLetter') {
    return {
      isValid: false,
      error: 'Invalid XML structure. Root element must be <resignationLetter>.',
    }
  }

  const required = ['sender', 'date', 'recipient', 'body', 'signature']
  for (const el of required) {
    if (!root.querySelector(el)) {
      return {
        isValid: false,
        error: `Missing required element: <${el}>. Resignation letters must include sender, date, recipient, body, and signature.`,
      }
    }
  }

  return { isValid: true }
}

// ─── Parse ────────────────────────────────────────────────────────────────────

export function parseResignationXml(xmlString: string): ParseResult {
  try {
    const validation = validateResignationXml(xmlString)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlString, 'text/xml')
    const root = doc.documentElement

    const senderEl = root.querySelector('sender')
    const recipientEl = root.querySelector('recipient')
    const bodyEl = root.querySelector('body')
    const signatureEl = root.querySelector('signature')

    const sender: ResignationSender = {
      name: getText(senderEl, 'name'),
      position: getText(senderEl, 'position'),
    }

    const recipient: ResignationRecipient = {
      name: getText(recipientEl, 'name'),
      title: getText(recipientEl, 'title'),
      company: getText(recipientEl, 'company'),
    }

    const body: string[] = bodyEl
      ? Array.from(bodyEl.querySelectorAll('paragraph')).map(p => p.textContent?.trim() ?? '').filter(t => t)
      : []

    const signature: ResignationSignature = {
      name: getText(signatureEl, 'name'),
      position: getText(signatureEl, 'position'),
    }

    const data: ResignationParsedData = {
      sender,
      date: root.querySelector('date')?.textContent?.trim() ?? '',
      recipient,
      body,
      signature,
    }

    return { success: true, data }
  }
  catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error occurred during parsing'
    return { success: false, error: `Failed to parse XML: ${msg}` }
  }
}
