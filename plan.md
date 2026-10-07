# Glossy — Architecture Plan & Status

## Current Architecture: JSON as the Single Source of Truth

Glossy is a modern Next.js application with dedicated Reader (`/read/<slug>`) and Editor (`/edit/<slug>`) routes, an Old English corpus directory (`/`), a new text ingestion pipeline (`/edit/new`), documentation (`/docs`), and Tina Admin (`/admin/index.html`).

### Key Principles:
1. **JSON as Source of Truth**: All text documents, glosses, morphemes, translations, and grammatical metadata are stored canonically as structured JSON files (`content/texts/<slug>.json`) conforming to `TextDocument` (`lib/types.ts`).
2. **Decoupled TeX Persistence**: Saving drafts and committing via TinaCMS updates only the JSON data model. No `.tex` files are written during authoring or CMS updates.
3. **On-Demand Dynamic LaTeX Export**: Users can export full, compilable `gb4e` LaTeX (`.tex`) documents on demand. TeX is generated dynamically in memory from the canonical JSON model (`data/latex-export.ts`).
4. **Flexible Ingestion**: Ingestion (`/edit/new`) accepts plain Old English text with parallel modern translations or `gb4e` LaTeX snippets, converting them directly into canonical `TextDocument` JSON.
5. **Local Drafts & Change Tracking**: Local drafts use versioned storage envelopes (`glossy:v1:draft:<slug>`). Comparing `baseHash` against the current document hash enables change tracking and future visual diffing.

See `docs/JSON_SOURCE_OF_TRUTH_PLAN.md` for the detailed simplification roadmap and diffing specification.

## Verification Suite

| Check | Tool / Command | Target |
|---|---|---|
| Linting | `npm run lint` | ESLint (zero errors/warnings) |
| Type Safety | `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| Source Validation | `npm run validate:source` | 1,837 aligned glosses verified |
| Lemma Accuracy | `npm run validate:lemmas` | 1,716 tokens verified against dictionary |
| Draft Tests | `npm run test:drafts` | Registry, envelopes, and hash tests |
| Smoke Tests | `npm run test:smoke` | Full route verification |
