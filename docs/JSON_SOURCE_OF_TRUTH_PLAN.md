# Plan: JSON as the Authoritative Source of Truth for Glossed Documents

## 1. Executive Summary & Objective

This simplification plan establishes the structured **JSON format (`content/texts/*.json`)** as the single, authoritative Source of Truth (SoT) for Glossy's Old English data model. 

### Key Architectural Shifts:
1. **Single Source of Truth**: `content/texts/<slug>.json` is the sole persistent data structure for all glossed texts, analyses, translations, and morphemic breakdowns.
2. **Decoupled TeX Persistence**: CMS commits and draft saves mutate only JSON documents. No `.tex` files are written, synchronized, or dual-maintained during authoring or CMS operations.
3. **Lossless Dynamic LaTeX Export**: The ability to download compilable `gb4e` LaTeX (`.tex`) files is fully preserved via deterministic on-demand compilation from the JSON AST (`data/latex-export.ts`).
4. **Flexible Ingestion Preserved**: Adding new texts (`/edit/new`) retains support for both plain Old English text (with parallel modern translations) and `gb4e` LaTeX snippets, converting them instantly into canonical JSON.
5. **Unified Local Draft Envelopes**: Browser storage (`localStorage`) uses the canonical `TextDocument` schema exclusively (`glossy:v1:draft:<slug>`).
6. **Foundation for Change Visualization (Visual Diffing)**: Because the JSON tree is clean and token-indexed, sentence-level and word-level diffing between local drafts and baseline editions is directly enabled.

---

## 2. Target Canonical Data Model (`TextDocument`)

All texts in `content/texts/*.json`, local drafts in `localStorage`, and runtime state in the Reader and Editor share this schema:

```typescript
export interface TextDocument {
  textId: string;
  slug: string;
  title: string;
  author: string;
  editor?: string;
  date?: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  witness?: string;
  origDate?: string;
  language: "Old English";
  status: "draft" | "review" | "published";
  sentences: ReadingSentence[];
}

export interface ReadingSentence {
  id: string;
  translation: string;
  footnotes?: string[];
  words: InterlinearWord[];
}

export interface InterlinearWord {
  id: string;
  originalWord: string;
  morphologicalGloss: string;
  trailingPunctuation?: string;
  sourceGlossTex?: string;
  analysis?: LinguisticAnalysis;
}

export interface LinguisticAnalysis {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  definition?: string;
  phonetic?: string;
  wiktionaryUrl?: string;
  morphemes?: Morpheme[];
  features?: InflectionFeatures;
}
```

---

## 3. Work Breakdown & Implementation Steps

### Phase 1: Pure JSON Persistence in TinaCMS & Local Drafts
- [x] **Step 1.1 — Remove TeX Dual-Write from Save / Commit**:
  - In `lib/tina-sync.ts` and `components/gloss-editor.tsx`, ensure the GraphQL mutation updates only the `content/texts/<slug>.json` file.
  - Remove all endpoints and routines attempting to write back to `references/<slug>.tex`.
- [x] **Step 1.2 — Unified Storage Envelopes**:
  - `lib/local-drafts.ts` stores only `StoredDraft = { version: 1; doc: TextDocument; baseHash: string; updatedAt: string }`.
  - Automatic migration cleanly transforms legacy storage shapes into `TextDocument`.
- [x] **Step 1.3 — Remove Redundant UI Elements**:
  - Removed "Reload Master .tex" button from the editoractions toolbar, streamlining UI focus entirely onto local draft status and active edits.

### Phase 2: On-Demand Dynamic LaTeX Export
- [x] **Step 2.1 — Deterministic `gb4e` Generator**:
  - Maintain and test `data/latex-export.ts` (`exportToGb4eLatex(doc: TextDocument): string`).
  - When the user clicks **"Export LaTeX"**, the system generates the `.tex` payload dynamically in-memory and triggers a client-side blob download.

### Phase 3: Ingestion Pipeline for New Texts
- [x] **Step 3.1 — Multi-Mode Ingestion in `/edit/new`**:
  - **Mode A: Plain Text & Parallel Translation**:
    - User provides Old English text lines and modern English translation lines.
    - System tokenizes, runs rule-based Old English lemmatization, and outputs valid `TextDocument` JSON.
  - **Mode B: LaTeX / `gb4e` Snippets**:
    - User pastes `\ex{\gll ... \\ ... \\ \glt ...}` blocks.
    - Parser (`lib/gb4e.ts`) extracts tokens, morphemes, glosses, and translations, outputting canonical `TextDocument` JSON.
- [x] **Step 3.2 — Direct Route to Editor**:
  - Once validated, the newly created JSON document is stored into `localStorage` (`glossy:v1:draft:<slug>`) and registered in `glossy_pending_drafts`.

### Phase 4: Change Tracking & Visual Diffing Architecture
- [x] **Step 4.1 — Baseline vs. Draft Hashing**:
  - Each local draft stores `baseHash` (hash of the canonical JSON when opened).
  - When editing, the editor computes the current draft's hash. If `currentHash !== baseHash`, the document is marked dirty/pending.
- [ ] **Step 4.2 — Granular Token-Level Diffing**:
  - Build a pure diff utility `diffDocuments(baseDoc: TextDocument, draftDoc: TextDocument): DocumentDiff`:
    - Identifies modified translations at the sentence level.
    - Identifies changed glosses, lemmas, POS tags, or morphemes at the word level (`words[i].morphologicalGloss`, `words[i].analysis.lemma`).
  - Future UI: A "Review Changes" modal displaying a side-by-side or inline diff prior to committing or exporting.

### Phase 5: Verified Document Life-Cycle & Phantom-Edit Prevention
- [x] **Step 5.1 — Canonical Startup Directory**:
  - Only Ohthere (`/read/ohthere` and `/edit/ohthere`) is listed in the main corpus directory at startup.
  - Example presets (Beowulf, Cædmon's Hymn, The Wanderer) only become workspace cards if and when explicitly ingested or uploaded by the user.
- [x] **Step 5.2 — Elimination of Phantom Formatting Edits**:
  - Opening the editor computes a baseline hash from the normalized document.
  - If no actual linguistic or translational changes are made (`currentHash === baselineHash`), draft storage is bypassed, preventing pristine texts from being falsely tagged as "Edited (Draft)".
  - Reverting edits or restoring master edition cleanly purges local drafts from `localStorage`.
- [x] **Step 5.3 — Streamlined Action Model & Working Deletion**:
  - Removed "hide on this device" complexity.
  - Working delete/revert handlers in the card 3-dot menu and editor header cleanly remove the draft from `localStorage` (`glossy:v1:draft:<slug>`, `glossy_draft_<slug>`, and pending manifest).
  - Core canonical Ohthere remains protected from accidental deletion while allowing users to discard working edits back to the pristine master copy.

---

## 4. Verification & Validation Criteria

1. **Build & Lint**: `npm run lint` and `npm run typecheck` pass with 0 errors and 0 warnings.
2. **Source Validation**: `npm run validate:source` validates all canonical JSON documents against reference gloss counts.
3. **Lemma Accuracy**: `npm run validate:lemmas` verifies headwords and dictionary lookups across all canonical JSON files.
4. **Draft Unit Tests**: `npm run test:drafts` verifies draft persistence, envelope versioning, hash generation, and collision handling.
5. **Smoke Tests**: `npm run test:smoke` verifies all reader, editor, new text, and admin routes.
6. **No TeX Write Dependencies**: Confirm no runtime code paths require filesystem write permissions for `.tex` files.
