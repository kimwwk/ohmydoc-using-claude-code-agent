# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OhMyDoc** — a free, open-source resume and document formatter. Paste plain text, AI structures it into XML, and you get a clean, ATS-friendly PDF. Built with Nuxt 4.

**Live**: [ohmydoc.vercel.app](https://ohmydoc.vercel.app)

## Essential Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
```

## Architecture

### Tech Stack
- **Framework**: Nuxt 4 (Vue 3)
- **Language**: TypeScript
- **UI Components**: @nuxt/ui for app chrome (buttons, inputs, modals)
- **Styling**: Vue Scoped CSS for document templates (must be exportable)
- **AI**: Multi-provider support (Anthropic, OpenAI, Google, Mistral, Groq, etc.)
- **Sanitization**: DOMPurify

### Data Flow
```
Plain Text → AI Formatting → XML → Template Rendering → HTML Preview → PDF Export
```

### Key Patterns

#### Styling Separation
Two distinct styling approaches:
- **Application UI**: @nuxt/ui components — NOT included in exports
- **Document Templates**: Scoped CSS only — exportable as standalone HTML

#### Template System
- Templates live in `/templates/{name}/` as Vue SFCs
- Each template has its own scoped CSS
- All templates accept the same `ParsedData` props interface
- Templates render identical XML data with different visual layouts

#### Composables (no Pinia/Vuex)
- `useTemplate.ts` — template selection and configuration
- `useXmlParser.ts` — XML parsing and validation
- `useExport.ts` — HTML export with embedded CSS

### Project Structure

```
/pages/index.vue          # Main dual-panel app
/pages/debug/*            # Component demo/debug pages
/components/              # App UI components (AppHeader, PreviewPanel)
/templates/{name}/        # Document templates (Vue SFCs + scoped CSS)
/composables/             # Shared logic (parser, template, export)
/server/api/              # AI formatting endpoint
/public/samples/          # Sample documents
/docs/                    # PRD, MVP plan, architecture decisions
```

### Adding New Templates

1. Create `/templates/{name}/` directory with a Vue SFC and `styles.css`
2. Accept `Props` interface with `data: ParsedData`
3. Use scoped CSS only (no @nuxt/ui inside templates)
4. Register in `composables/useTemplate.ts`
5. Handle optional fields with `v-if`

#### ⚠️ CSS Import Gotcha (Critical for Vercel)

Templates **must** import their CSS via `<script>`, not `<style>`:

```vue
<script setup lang="ts">
import './styles.css'  // ✅ CORRECT: Import CSS as module
</script>

<style scoped>
/* Empty — Vue scoping is applied via this block */
</style>
```

**Do NOT use:**
- `<style scoped>@import './styles.css';</style>` — breaks in Vercel production
- `<style scoped src="./styles.css"></style>` — also breaks in production

Script imports ensure CSS is bundled correctly across all platforms.

### Debug Pages

Available at `/debug/*` routes in production:
- `/debug/parser` — XML parser testing
- `/debug/template` — Template rendering showcase
- `/debug/editor` — Editor component
- `/debug/preview` — Preview panel with error handling

## Constraints

- Pure frontend (browser-only, except AI API endpoint)
- No authentication or database
- Templates must be exportable as standalone HTML
- ATS-friendly output (clean semantic HTML, no fancy CSS)

## Testing

Regression tests live in a separate repo: [ohmydoc-qa](https://github.com/chillkimtest-oss/ohmydoc-qa)
