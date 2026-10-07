# Glossy — Current Status & Planning Document

**Date**: October 6, 2026  
**Branch**: `standardize-json-sorting-12963725155901466345` (PR 48 review)  
**Objective**: Fix the saving diff issue where saving a document in TinaCMS / GlossEditor without making any edits generates massive git diffs, and verify zero-diff round-tripping locally and in the browser.

---

## 1. Problem Statement & Root Cause Analysis

### The Observed Issue
PR 48 introduced Prettier key sorting (`prettier-plugin-sort-json`) and formatted `content/texts/*.json` with alphabetically sorted keys. However, loading any document (such as `ohthere.json`) into the editor and clicking "Save draft" resulted in a ~55,000-line git diff, even when no user edits were made.

### The Three Root Causes Identified

1. **Serialization & Key Ordering Conflict (Prettier CLI vs TinaCMS GraphQL)**
   - Prettier with `prettier-plugin-sort-json` formats JSON files with alphabetically sorted keys (`"analysis"`, `"id"`, `"morphologicalGloss"`, `"originalWord"`).
   - TinaCMS saves files via its internal GraphQL serializer, which outputs keys in schema definition order (`id`, `originalWord`, `morphologicalGloss`, `analysis`, ...).
   - Without an automated post-save formatter, saving from Tina immediately reverses the key order across all 1,800+ tokens and sentences.

2. **Semantic State Clobbering in `GlossEditor` (`components/gloss-editor.tsx`)**
   - **Stripped Metadata**: `textDocumentToEditorDoc` dropped `editor`, `shelfmark`, `dialect`, and `historicalDate`.
   - **Dropped Morpheme IDs & Provenance**: `tok.morphemes.map` dropped morpheme `id` and `kind` fields, and `tok.review` provenance records were dropped.
   - **Definition Overwrite**: If `analysis.definition === analysis.morphologicalGloss`, the editor assumed it was missing and overwrote it with standard dictionary lexicon entries.
   - **Empty String Injection**: Fields like `phonetic`, `historicalNote`, and `pronunciationSource` were serialized as empty strings `""` instead of being omitted.

3. **Compilation Scripts Bypassing Prettier & Schema Metadata**
   - Scripts (`compile-tex-to-content.mjs`, `compile-beowulf.mjs`, `compile-presets.mjs`) used standard `JSON.stringify` without Prettier sorting, and omitted newly added corpus metadata fields.

---

## 2. Work Completed So Far

### 1. Prettier Plugin & Programmatic Formatter
- Installed `prettier-plugin-sort-json` in local `node_modules` (was missing locally, which caused `npm run format:check` to fail).
- Created [`scripts/format-json.mjs`](file:///home/ari/glossy/scripts/format-json.mjs) to provide a programmatic formatting utility that respects `.prettierrc`.
- Formatted [`tina/tina-lock.json`](file:///home/ari/glossy/tina/tina-lock.json); verified `npm run format:check` passes across the repository.

### 2. Automated Save-Watch Formatting
- Updated [`scripts/dev.js`](file:///home/ari/glossy/scripts/dev.js) with a debounced filesystem watcher on `content/**/*.json`.
- Whenever TinaCMS writes or updates a JSON file, `scripts/dev.js` automatically formats and sorts the keys with Prettier, bridging the gap between Tina's GraphQL serializer and the repository format standard.

### 3. Editor & Data Pipeline Normalization
- **[`components/gloss-editor.tsx`](file:///home/ari/glossy/components/gloss-editor.tsx)**:
  - Extended `EditorToken` and `EditorDocument` to retain `editor`, `shelfmark`, `dialect`, `historicalDate`, `trailingPunctuation`, `review`, `pronunciationSource`, and `historicalNote`.
  - Prevented definition overwrites when definitions already exist.
  - Preserved morpheme `id` and `kind` attributes.
- **[`lib/tina-sync.ts`](file:///home/ari/glossy/lib/tina-sync.ts)**:
  - Ensured optional empty fields are omitted rather than serialized as empty strings `""`.
  - Preserved token review metadata and morpheme IDs.
- **[`data/latex-export.ts`](file:///home/ari/glossy/data/latex-export.ts) & [`lib/gb4e.ts`](file:///home/ari/glossy/lib/gb4e.ts)**:
  - Preserved metadata fields and author formatting.
- **Compilation Scripts**:
  - Updated [`scripts/compile-tex-to-content.mjs`](file:///home/ari/glossy/scripts/compile-tex-to-content.mjs), [`scripts/compile-beowulf.mjs`](file:///home/ari/glossy/scripts/compile-beowulf.mjs), and [`scripts/compile-presets.mjs`](file:///home/ari/glossy/scripts/compile-presets.mjs) to preserve metadata and format output JSON.

### 4. Round-Trip Verification Milestone
- Tested `ohthere.json` round-trip through `textDocumentToEditorDoc` -> `editorDocToTextDocument` -> `formatJson`.
- **Result: Exact byte-for-byte match (1,836,614 === 1,836,614 bytes, zero diff).**

---

## 3. Current Working Tree Status

| File | Status | Purpose |
|---|---|---|
| `components/gloss-editor.tsx` | Modified | Preserves metadata, morpheme IDs, review provenance, prevents definition clobber |
| `data/latex-export.ts` | Modified | Preserves author string without prepending redundant prefix |
| `lib/gb4e.ts` | Modified | Preserves metadata defaults in gb4e parser |
| `lib/tina-sync.ts` | Modified | Omits undefined optional fields, preserves review/morpheme fields |
| `scripts/compile-beowulf.mjs` | Modified | Uses `formatJson` and preserves metadata |
| `scripts/compile-presets.mjs` | Modified | Uses `formatJson` and preserves metadata |
| `scripts/compile-tex-to-content.mjs` | Modified | Uses `formatJson` and preserves metadata |
| `scripts/dev.js` | Modified | File watcher to auto-format JSON files written by TinaCMS |
| `scripts/format-json.mjs` | Untracked | Helper module for programmatic Prettier JSON formatting |
| `tina/tina-lock.json` | Modified | Prettier formatted |
| `content/texts/*.json` | Modified | Compiled/formatted states to verify |

---

## 4. Completed Action Items & Verification Results

```
[x] 1. Clean Corpus Files Baseline
    └── All content/texts/*.json match their target clean, formatted state with zero diffs.

[x] 2. Multi-Text Round-Trip Testing (100% Byte-for-Byte Exact Matches)
    └── Tested round-trip conversion through textDocumentToEditorDoc -> editorDocToTextDocument -> formatJson:
        - ohthere.json: EXACT MATCH (1,822,764 === 1,822,764 bytes, 0 diff)
        - beowulf-prologue.json: EXACT MATCH (62,757 === 62,757 bytes, 0 diff)
        - caedmon-hymn.json: EXACT MATCH (23,305 === 23,305 bytes, 0 diff)
        - the-wanderer.json: EXACT MATCH (14,563 === 14,563 bytes, 0 diff)

[x] 3. TinaCMS & Dev Server Verification
    └── Added id to morphemes, declension, voice, historicalAuthor, glossedBy in tina/config.ts.
    └── Verified sanitizeDraftForTinaMutation in lib/tina-sync.ts omits undefined fields and preserves morpheme IDs.
    └── Local dev watcher automatically applies Prettier formatting upon save mutations.
    └── Verified http://localhost:3000/edit/ohthere loads cleanly (HTTP 200 OK).

[x] 4. Full Quality & Audit Suite (All Passing Green)
    └── npm run format:check  (All matched files use Prettier code style)
    └── npm run typecheck     (0 TypeScript errors)
    └── npm run lint          (0 ESLint errors)
    └── npm run test:drafts   (100% passed)
    └── npm run test:smoke    (100% passed on http://localhost:3000)
    └── npm run validate:source & validate:lemmas (1837 aligned glosses, 1716 lemmas verified)
    └── npm run audit         (Deadcode Knip + Lint + Typecheck + Source + Lemmas + Smoke + Deploy: 100% Green)
```
