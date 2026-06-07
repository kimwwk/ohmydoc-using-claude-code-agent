# OhMyDoc

> The actually free resume & cover-letter formatter. Paste your text, get an ATS-friendly PDF instantly — no sign-up, no paywalls.

**▶ Live app: https://ohmydoc.vercel.app**

OhMyDoc turns messy plain text — the kind you copy out of ChatGPT, Google Docs, or a Word file — into a clean, recruiter-ready PDF. Paste a resume or cover letter, and an LLM restructures it into semantic XML that renders through a print-optimized template. No manual formatting, no template fiddling, no login.

This repo is also an experiment in autonomous software development: it was built end-to-end by [Claude Code](https://claude.com/claude-code) agents. See [How this was built](#how-this-was-built).

## Features

- **Paste-to-PDF** — drop in plain text, export a polished PDF
- **ATS-friendly** — clean semantic structure that applicant-tracking systems can parse
- **Resume & cover-letter modes**
- **Live dual-panel preview** — text on the left, rendered document on the right
- **Editable XML** — switch to XML mode to fine-tune the structure before exporting
- **No login, no paywall** — runs in your browser plus a single serverless endpoint

## How it works

```
Plain text ──► /api/format (LLM → structured XML) ──► Vue template ──► Print / Save as PDF
```

1. You paste plain text and pick a document type (**resume** or **cover letter**).
2. A serverless endpoint (`server/api/format.post.ts`) calls an LLM (OpenAI `gpt-4o-mini`) with a strict system prompt that converts the text into a fixed XML schema — preserving all content and omitting empty fields.
3. The XML is rendered by a Vue template (`templates/`) using print-optimized scoped CSS.
4. You export with the browser's print dialog → **Save as PDF** (works best in Chrome).

> Note: the runtime formatter uses OpenAI `gpt-4o-mini`. "Claude Code agents" refers to how this codebase was *built*, not what powers the app at runtime.

## Tech stack

- **Nuxt 4** / **Vue 3** / **TypeScript**
- `@nuxt/ui` for app chrome; scoped CSS for the exportable document templates
- OpenAI `gpt-4o-mini` for the text → XML formatting step
- Vercel for hosting + analytics

## Run locally

Requires **Node 18+** and an **OpenAI API key**.

```bash
git clone https://github.com/kimwwk/ohmydoc-using-claude-code-agent.git
cd ohmydoc-using-claude-code-agent
npm install
cp .env.example .env        # set OPENAI_API_KEY
npm run dev                 # http://localhost:3002
```

Production build:

```bash
npm run build
npm run preview
```

### Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `OPENAI_API_KEY` | Yes | Text → XML formatting via `gpt-4o-mini` |

`.env.example` lists additional provider keys used by project tooling, but only `OPENAI_API_KEY` is needed to run the app.

## Project layout

| Path | What's there |
|------|--------------|
| `pages/index.vue` | Main app (dual-panel editor + preview) |
| `pages/debug/` | Component demo routes, kept as live documentation |
| `server/api/format.post.ts` | Text → XML LLM endpoint |
| `templates/` | Document templates (e.g. `modern`) with scoped CSS |
| `components/`, `composables/` | UI components and XML parsing/render logic |
| `docs/` | PRD, MVP plan, and decision log |

## How this was built

This project was developed end-to-end by autonomous Claude Code agents following a staged MVP plan. The product requirements, MVP breakdown, and architectural decisions live in [`docs/`](docs/) (`PRD.md`, `MVP-PLAN.md`, `DECISIONS.md`). Regression tests live in the [ohmydoc-qa](https://github.com/chillkimtest-oss/ohmydoc-qa) repo.
