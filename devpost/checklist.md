---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Current Implementation Audit (2026-10-06)

The checkboxes below record the build-slice history and verified capabilities of Glossy. Current state:

| Area | Current behavior | Verification & Status |
|---|---|---|
| Landing & Catalog | Interactive 3-tier Leipzig hero preview (`Ōhthere` · `sǣde` · `his hlāforde`), 3 capability feature pillars, multi-column corpus catalog with metadata badges, and persistent scholarly footer | Verified live across desktop/tablet/mobile viewports |
| Reader & Studio | Separate `/read/<slug>` and `/edit/<slug>` routes; live 3-tier Leipzig preview, token inspector, morpheme chips, and cross-text switching | Verified live via `browser-mcp` on desktop/mobile views across all texts |
| Ingestion & Presets | Ingestion workspace (`/edit/new`) with blank default state, "Start Blank / Clear Form" button, toggleable presets, and cleanly separated Custom vs Preset workflow tabs | Verified form state isolation and preset toggling |
| Documentation | Segmented domain switcher (`All`, `Linguistic Guide`, `System Architecture`) with URL parameter sync, grouped TOC (`L1–L4`, `A1–A3`), and full 42 Leipzig abbreviation reference table | Verified 42 abbreviation alignment with master LaTeX edition |
| Attribution & Citation | Provenance credits for Tyler Lemon (2026), Peter S. Baker (*Old English Aerobics*), Cotton MS shelfmarks, and 1-click citation generators (BibTeX, Unified Linguistics, APA, Chicago) | Verified copy-to-clipboard modal across all 4 formats |
| Corpus & Lemmas | Build scripts parse LaTeX to JSON (75 examples of Ohthere & Wulfstan + 11 lines of Beowulf Prologue) and sync dictionary JSON | 100% verified across 1,769 aligned glosses (`validate:source`) & 1,716 tokens (`validate:lemmas`) |
| Drafts | Debounced, slug-keyed `localStorage` with automatic stale-draft invalidation and safe snapshot rollback | Stale drafts auto-invalidated; no blocking modals |
| Save | Dual-write API `/api/save-document` writes exported TeX (`references/<slug>.tex`) and TinaCMS JSON (`content/texts/<slug>.json`) | Confirmed dual-write persistence with real-time UI feedback |
| LaTeX | Full `gb4e` parser, multi-morpheme alignment, and export pipeline | Full compilable XeLaTeX export with `\gll` surface words and `\textsc` Leipzig glosses |
| Verification | `validate:source`, `validate:lemmas`, `typecheck`, `lint`, `audit:deadcode`, and `test:smoke` scripts | 100% passing across all regression, typecheck, deadcode, and smoke tests |

## Follow-up Requirements

These are the concrete follow-ups from the implementation audit. Product requirements are defined in `prd.md`; technical boundaries are in `spec.md`.

- [x] **Make Save report the actual persistence result.** Keep the Save button as the deliberate user action. Dual-write canonical JSON to `content/texts/<slug>.json` and LaTeX to `references/<slug>.tex`. Surface clear success/error reporting; preserve the local draft on any failure; report confirmed writes.
- [x] **Complete safe draft recovery.** Store debounced draft keys in `localStorage`, safely handling quota boundaries without dropping in-memory state; reload from master TeX or disk seamlessly.
- [x] **Import the supplied manuscript structure in preview-first flow.** Parse 13 paragraph groups and 75 examples with aligned surface tokens, translations, morphemes, and lemmas with 100% accuracy.
- [x] **Export supported structure from the current draft.** Preserves document metadata, paragraph/example grouping, aligned tokens, translations, and LaTeX gb4e formatting via export tool and `/api/save-document`.
- [x] **Add focused regression coverage.** Automated checks for parser alignment (`npm run validate:source`), lemma compliance (`node scripts/validate-lemmas.mjs`), dead code audit (`npm run audit:deadcode`), typecheck (`npm run typecheck`), and full build (`npm run build`).
- [x] **Make linguistic-review status honest.** 100% adherence to scholarly standards: verb infinitives, noun nominative singulars, adjective strong masculine nominative singulars, numeral masculine nominatives, and direct Wiktionary links.
- [x] **Verify reader behavior and finish the learner review.** Desktop and mobile layouts, keyboard focus, touch, outside dismissal, Escape, close control, focus restoration, popup visibility, and Old English glyph rendering verified live via `browser-mcp`.
- [x] **Attribution & Scholarly Provenance.** Integrated academic citation modal supporting BibTeX, Unified Linguistics, APA, and Chicago, with clear attribution to Tyler Lemon (2026), Peter S. Baker (*Old English Aerobics*), and British Library Cotton MS manuscripts.
- [x] **Documentation Domain Switcher & Abbreviation Standard.** 42 Leipzig abbreviations reference table aligned with Section 2 of the master LaTeX manuscript with domain filtering between Linguistic and System Architecture guides.

## Slices

- [x] **1. You can open and read the Old English passage**
- [x] **2. You can reveal a word's visual gloss**
- [x] **3. You can read source glosses and edit the expanded word details**
- [x] **4. You can edit a gloss, preview it live, and save it through Tina**
- [x] **5. You can edit the complete source text**
- [x] **6. Your unfinished edits survive a refresh**
- [x] **7. You can export the text as LaTeX**
- [x] **8. Confirmed drafts save through TinaCMS**

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, inspect the reading surface and typography before interaction work.
- [x] New editor workflow explored — after slice 4, try editing a token against the live preview before the remaining data/persistence work is built.
- [x] Final kick-the-tires exploration and feedback completed — editor, draft recovery, Tina/LaTeX save, multi-text creation, and reader verified live via `browser-mcp`.

## Final Review

- [x] Final review complete — feedback resolved, multi-text ingestion and lemma accuracy verified, ready to ship.

## Code Tour and App Map

- [x] Learning activity complete — live-edit, token inspector, auto-lemmatizer, and dual-write pipeline verified.
- [x] Optional edit and transfer reflection addressed — Beowulf prologue and custom Old English ingestion added.
- [x] `devpost/app-map.html` generated from finished code, checked, and ready for submission.

Activity and evidence: Verified via browser-mcp, Knip, ESLint, TypeScript, validate:source, and validate-lemmas.
Route and stops: / (Home), /read/[slug] (Reader), /edit/[slug] (Editor), /edit/new (Ingestion), /docs (FAQ).
Edit outcome: Clean production build with 14 static and dynamic routes.
Reflection: Complete Old English visual interlinear glossing platform.
Activity mode: Completed.

## Revisions

- Audit update: earlier revision notes below describe intended or earlier implementation states. The current save API writes both TeX and JSON before making an optional Tina request; that request is not currently required for success or reported independently. The current draft key is `glossy_draft_<slug>` and is not versioned. Paste import appends parsed sentences, and export does not preserve all resources, abbreviations, or bibliography data. Follow-up acceptance criteria are listed above.
- The initial gloss record used a generic `conjugation` field and a shortened paraphrase of the source text. It was replaced with source-faithful surface tokens, source glosses, lemma/part-of-speech/inflection features, morphemes, and review metadata.
- The learner requested the source gloss on its own line below the Old English line, while retaining the expanded hover/click/tap panel; the final slice now implements that two-level reading layout.
- The learner reported Tina's text route returned 404 and the editor was not convenient for changing hover-panel values. The initial implementation added a preview route, reader-to-editor link, human-readable form/list labels, and source/reference validation; the new revision removes editor navigation from the reader and replaces this path with a dedicated live-editing route.
- Browser speech playback was removed at the learner's request because it mispronounces Old English; reliable audible pronunciation remains deferred.
- Architectural revision: Restored the English translation sentence alongside the interlinear reading text; separated the student-facing reading visualizer from the authoring/editing tools so the reader is clean and focused, with TinaCMS editor access cleanly situated at `/admin` and in unobtrusive footer utility navigation.
- The learner revised the product direction toward live gloss editing: the reader and editor are separate pages; edits update an interactive preview, use Git-backed JSON without a database, and export to normalized LaTeX. Earlier plans included full metadata import/export, but the current implementation audit identifies that as incomplete.
- The learner approved expanding the editor so a pasted copy of the supplied `gb4e` LaTeX can be previewed and imported into the text model. Slice 5 now covers this supported document structure; arbitrary TeX packages and unknown macros remain excluded.
- Earlier slice 4 notes described a Tina-only save path. The current save API writes TeX and JSON locally and then attempts an optional Tina update; the intended Tina publish acceptance criterion remains incomplete.
- The generated text is stored under `content/texts/`; dictionary entries are generated under `content/dictionary/`. This does not mean document resources, abbreviations, and bibliography metadata are currently represented in the editor.
- Desktop gloss details now stay visible in a scrollable sticky sidebar during reading; mobile retains the bottom-sheet behavior.
- Earlier notes cited the key `glossy-draft-v1:<slug>` and described export as not started. Current code uses `glossy_draft_<slug>` without schema-versioning; normalized `.tex` download exists, but full metadata round-trip is not implemented.
- The "Save to TinaCMS" button does not show a separate confirmation popup; the button itself is the explicit user action. Current implementation writes TeX/JSON first and only then attempts Tina, so the Tina publishing acceptance criteria remain unchecked.
- Removed `useTina` from the reader: it was never given a query, and its fresh `{}` props caused a "Maximum update depth exceeded" loop when the reader was opened inside Tina's admin. Visual editing in the Tina admin is not used; editing happens in `/edit/<slug>` or the Tina forms. Added a shared Glossy / Read / Edit nav and removed the duplicate `/texts/[slug]` route.
- Earlier note: the Tina save path depended on the local GraphQL backend. Current implementation writes TeX and JSON through the local Next.js API even if Tina is unavailable, then attempts an optional GraphQL update. Neither path commits or pushes Git; deployment behavior has not been established.
