# Glossy — Old English Interlinear Glossing & Editorial Platform

Glossy is a specialized digital humanities web application for reading, editing, and publishing morphologically annotated Old English texts. It bridges the authoritative LaTeX `gb4e` linguistic typesetting ecosystem with modern web-first interlinear reading, bidirectional morpheme inspection, local-first browser draft persistence, and headless CMS Git synchronization.

---

## 1. Application Routes & Workspaces

- **Landing & Corpus Directory (`/`)**: Directory of digitized Old English texts with instant navigation between reader and editing workspaces, local draft management, and text search.
- **Visual Reader (`/read/<slug>`)**: Dedicated, distraction-free reading experience displaying:
  - Normalized Old English text lines
  - Aligned Leipzig morphological gloss line
  - English free translation
  - Interactive popup inspector with multi-morpheme chips, inflectional features, grammatical explanations, and external Wiktionary reference links.
- **Editing Workspace (`/edit/<slug>`)**: Full bidirectional glossing workstation:
  - Live synchronized reader preview card
  - Selected Token Inspector for form, lemma, POS, inflections, and individual morphemes
  - Multi-sentence `gb4e` LaTeX ingestion with preview and append controls
  - Local-first draft persistence (`glossy:draft:v1:<slug>`) with instant JSON and LaTeX (`gb4e`) export
- **Corpus Ingestion (`/edit/new`)**: Rapid onboarding of new texts with automatic Old English tokenization, rule-based lemmatization, and draft creation.
- **Linguistic Architecture & Reference (`/docs`)**: In-app reference documenting all 42 manuscript glossing abbreviations, citation standards by part of speech, and data models.
- **Headless CMS Admin (`/admin/index.html`)**: TinaCMS editorial dashboard for committing pending drafts to the Git repository and managing site copy.

---

## 2. Linguistic Standards & Formatting Specifications

### 2.1 Wiktionary Standardized Format
Glossy strictly enforces official [Wiktionary:About Old English](https://en.wiktionary.org/wiki/Wiktionary:About_Old_English) entry standards:
1. **Diacritics Stripped in Titles**: Modern editorial macrons (`ā, ē, ī, ō, ū, ȳ`) and palatal dots (`ċ, ġ`) are stripped from page titles (e.g. `secgan`, `hlaford`, `buan`).
2. **Alphabet Letters Retained**: Historical Latin characters `æ`, `þ`, and `ð` are considered standard letters and are preserved in titles (e.g. `cweþan#Old_English`).
3. **Capitalization**: Proper nouns and ethnonyms are capitalized (`Ohthere`, `Wulfstan`, `Ælfred`, `Finnas`); common nouns, verbs, and adjectives are lowercase (`secgan`, `eall`, `mann`).
4. **Section Anchor**: Language anchor is formatted as `#Old_English`.
5. **Canonical Headwords by Part of Speech**:
   - **Verbs**: Infinitive (`-an`, `-ian`, `-on`, `-n`)
   - **Nouns**: Nominative singular
   - **Adjectives**: Strong masculine nominative singular
   - **Determiners & Numerals**: Masculine nominative singular (`sē`, `þes`, `ān`, `twēgen`)

### 2.2 International Phonetic Alphabet (IPA) Specifications
Glossy adheres to International Phonetic Association guidelines for Old English historical phonology:
1. **Phonemic Transcription**: Enclosed in slashes `/.../` for dictionary headwords.
2. **Length Marker**: Standard IPA triangular colon `ː` (`U+02D0`), never the ASCII colon `:`.
3. **Stress Marker**: Primary stress mark `ˈ` (`U+02C8`), placed before the stressed syllable.
4. **Syllable Boundaries**: Explicit period separator `.`.
5. **Headword Citation**: Pronunciation reflects the uninflected lemma (e.g., `būan` $\to$ `/ˈbuː.ɑn/`).

### 2.3 Leipzig Glossing Rules & LaTeX `gb4e`
- **Morpheme-by-Morpheme Alignment**: Equal number of hyphen-separated segments on surface and gloss lines (`Gār-Den-a` $\leftrightarrow$ `Spear-Dane-GEN.PL`).
- **Standard Abbreviations**: Capitalized or small-caps tags (`NOM`, `ACC`, `GEN`, `DAT`, `INS`, `PST`, `PRS`, `SJV`, `IND`, `INF`, `IMP`, `STR`, `WK`, `CMP`, `COMP`).

---

## 3. Directory Structure

```
├── app/                  # Next.js App Router (pages & layout)
├── components/           # UI components (Reader, Editor, TextDirectory, SiteNav, Popup)
├── content/
│   ├── dictionary/       # Synchronized canonical lemma JSON records
│   ├── docs/             # Reference documentation JSON data
│   ├── pages/            # TinaCMS editable page content (home.json)
│   └── texts/            # Pre-compiled text documents (ohthere.json, beowulf-prologue.json)
├── data/                 # LaTeX export generators (latex-export.ts)
├── devpost/              # Product requirements, specifications, and scope docs
├── docs/                 # In-app architecture and linguistic data model FAQ
├── lib/
│   ├── corpus-registry.ts# Authoritative metadata for built-in texts
│   ├── gb4e.ts           # Robust gb4e LaTeX parser and tokenizer
│   ├── lemmatizer.ts     # Rule-based Old English lemmatizer & demorphing engine
│   ├── local-drafts.ts   # Local-first draft persistence and manifest management
│   ├── old-english-lexicon.ts # Authoritative lexicon & Wiktionary mappings
│   ├── safe-json.ts      # Scoped safe JSON serialization utilities
│   ├── tina-sync.ts      # TinaCMS GraphQL commit integration
│   └── types.ts          # Core TypeScript data contracts
├── references/           # Authoritative LaTeX manuscripts (.tex)
├── scripts/              # Prebuild, compilation, and verification scripts
└── tina/                 # TinaCMS configuration and collections schema
```

---

## 4. Verification & CLI Scripts

| Command | Description |
| :--- | :--- |
| `npm run typecheck` | Validates TypeScript type safety across the entire codebase (`tsc --noEmit`). |
| `npm run lint` | Runs ESLint 9 across all source files asserting zero errors or warnings. |
| `npm run test:drafts` | Runs unit tests for local draft storage, slug sanitization, and collision prevention. |
| `npm run validate:source` | Audits token and gloss alignment across source-backed texts. |
| `npm run validate:lemmas` | Audits tokens in the corpus for canonical lemma and Wiktionary compliance. |
| `npm run test:smoke` | Automated end-to-end smoke test verifying reader, editor, new texts, and admin routes. |
| `npm run build` | Compiles Tina schemas and builds the production Next.js application. |
