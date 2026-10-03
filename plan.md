# Glossy — Implementation Status and Next Steps

## Current Architecture

Glossy is a local Next.js app with separate reader (`/read/<slug>`) and editor (`/edit/<slug>`) routes, a route-choice home page, an architecture FAQ (`/docs`), and the Tina admin (`/admin/index.html`). Text data is stored in Git under `content/texts/`; the supplied LaTeX manuscript remains the source for transcription and is parsed into the reader/editor model.

The app uses `lib/types.ts` for shared content types, although `components/gloss-editor.tsx` still keeps legacy editor-only `Token`, `Sentence`, and `GlossDocument` types and maps between the shapes. Do not treat type unification as complete.

## Implemented

- `lib/gb4e.ts` parses supported `gb4e` examples, paragraph labels, aligned surface/gloss tokens, translations, and footnotes; it resolves analyses through `lib/lemmatizer.ts`, which combines curated verb/noun/adjective/pronoun rules with `lib/old-english-lexicon.ts`.
- `scripts/compile-tex-to-content.mjs` converts the supplied manuscript to `content/texts/ohthere.json`. `scripts/sync-dictionary.mjs` generates entries under the singular `content/dictionary/` directory. Both run from the `prebuild` script.
- The reader renders Old English, a separate source-gloss line, translation, and linked word details. The editor provides a live preview, token inspector, pasted-TeX parse/preview/append flow, local draft persistence, and normalized `.tex` download.
- Local draft persistence currently uses `glossy_draft_<slug>` in `localStorage` with a 300 ms debounce. It is not schema-versioned and has no base-version conflict detection. Discard restores the saved snapshot but does not remove the storage key; storage failures are not surfaced reliably.
- The editor's Save action calls `/api/save-document`, which writes the exported TeX to the source file and the JSON document to `content/texts/`. It then attempts a best-effort Tina GraphQL update. This is not an atomic or per-document Tina publishing workflow; Git commit/push is still separate.
- The source validator checks text IDs/slugs, source gloss alignment, and parsed manuscript sentence/token presence. `scripts/validate-lemmas.mjs` also applies form/URL heuristics to parsed lemmas, but is not wired to an npm script and does not prove linguistic accuracy. The smoke test checks the landing, reader, editor, and Tina admin routes.

## Known Gaps

- The paste importer currently previews and appends parsed sentences. It does not import the manuscript's resource list, abbreviations, bibliography metadata, or a full paragraph/document structure into the editor.
- LaTeX export is normalized and currently covers the editor's sentence/token/translation/footnote data. It does not round-trip all source resources, abbreviations, bibliography settings, comments, or preamble macros; do not claim lossless or fully compilable round-trip fidelity without verification.
- Drafts need explicit schema/version validation, storage-error reporting, and removal of discarded draft data if the versioned-recovery requirement remains in scope.
- Save behavior needs a clear, verified contract for the file writes and optional Tina update; the current UI success message should not be interpreted as proof that Tina or Git was updated.
- The editor still uses duplicate legacy types rather than operating entirely on the shared content model.
- Add focused tests for parser edge cases and export/import invariants before claiming full-corpus round-trip support.
- Run and review the standalone lemma audit, and avoid describing heuristic validation as 100% scholarly accuracy.

## Next Steps

Implement the seven unchecked items in `devpost/checklist.md > Follow-up Requirements` in dependency order: accurate save/Tina behavior, safe versioned drafts, full supported manuscript import, normalized export of that structure, focused regression coverage, honest linguistic-review status, and final reader/demo verification. Their measurable acceptance and verification criteria are in that checklist; keep them unchecked until implemented and verified. Then complete `devpost/checklist.md > Final Review` and `Code Tour and App Map`.

## Later Roadmap

- Support arbitrary TeX packages/macros, collaborative editing, accounts, remote publishing, and runtime-generated linguistic analysis only if the project scope expands.
- No runtime LLM-generated linguistic analysis is in scope. The current parser does assign lemmas/POS through curated maps and rule-based fallbacks; treat unmatched or heuristic results as unverified until reviewed against linguistic sources.
