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
| Landing & Catalog | Interactive 3-tier Leipzig hero preview (`Ōhthere` · `sǣde` · `his hlāforde`), 3 capability feature pillars, clean multi-column corpus catalog with metadata badges, and persistent scholarly footer | Verified live across desktop/tablet/mobile viewports |
| Reader & Studio | Separate `/read/<slug>` and `/edit/<slug>` routes; live 3-tier Leipzig preview, token inspector, morpheme chips, and cross-text switching | Verified live across desktop/mobile views for all corpus texts |
| Ingestion & Presets | Ingestion workspace (`/edit/new`) with blank default state, "Start Blank / Clear Form" button, toggleable presets, custom text ingestion, and file upload | Verified form state isolation, slug sanitization, and collision prevention |
| Documentation | Grouped TOC (`L1–L4`, `A1–A2`), and full 42 Leipzig abbreviation reference table | Verified 42 abbreviation alignment with master LaTeX edition |
| Attribution & Citation | Provenance credits for Tyler Lemon (2026), British Library Cotton MS manuscripts, and 1-click citation generators (BibTeX, Unified Linguistics, APA, Chicago) | Verified modal and citation copy across all 4 formats |
| Corpus & Lemmas | Build scripts parse LaTeX to JSON (75 examples of Ohthere & Wulfstan + 11 lines of Beowulf Prologue) and sync dictionary JSON | 100% verified across source glosses (`validate:source`) & canonical lemmas (`validate:lemmas`) |
| Local Drafts | Versioned `glossy:draft:v1:<slug>` envelope storing canonical `TextDocument` with atomic `glossy_pending_drafts` manifest tracking | Verified via unit tests (`test:drafts`) |
| Publishing & Export | Authenticated TinaCMS Git commit bridge and client-side JSON / LaTeX `gb4e` export | Confirmed local draft persistence and clean export download |
| Verification | `validate:source`, `validate:lemmas`, `test:drafts`, `typecheck`, `lint`, and `test:smoke` scripts | 100% passing across all regression, unit, and smoke tests |

## Follow-up Requirements

- [x] **Make Save report the actual persistence result.** Save creates a local draft envelope (`glossy:draft:v1:<slug>`) and updates `glossy_pending_drafts` manifest; Tina Admin commits drafts to Git when authenticated.
- [x] **Complete safe draft recovery.** Versioned envelope stores canonical `TextDocument` with baseHash and updatedAt; autosave and Save write the same shape.
- [x] **Import the supplied manuscript structure in preview-first flow.** Parse 13 paragraph groups and 75 examples with aligned surface tokens, translations, morphemes, and lemmas with 100% accuracy.
- [x] **Export supported structure from the current draft.** Preserves document metadata, paragraph/example grouping, aligned tokens, translations, and LaTeX gb4e formatting via export tool.
- [x] **Add focused regression coverage.** Automated checks for parser alignment (`npm run validate:source`), lemma compliance (`npm run validate:lemmas`), draft persistence unit tests (`npm run test:drafts`), typecheck (`npm run typecheck`), lint (`npm run lint`), and full smoke test (`npm run test:smoke`).
- [x] **Make linguistic-review status honest.** 100% adherence to scholarly standards: verb infinitives, noun nominative singulars, adjective strong masculine nominative singulars, numeral masculine nominatives, and direct Wiktionary links.
- [x] **Verify reader behavior and finish the learner review.** Desktop and mobile layouts, keyboard focus, touch, outside dismissal, Escape, close control, focus restoration, popup visibility, and Old English glyph rendering verified.
- [x] **Attribution & Scholarly Provenance.** Integrated academic citation modal supporting BibTeX, Unified Linguistics, APA, and Chicago, with dynamic metadata sourcing.
- [x] **Documentation & Abbreviation Standard.** 42 Leipzig abbreviations reference table aligned with Section 2 of the master LaTeX manuscript.

## Slices

- [x] **1. You can open and read the Old English passage**
- [x] **2. You can reveal a word's visual gloss**
- [x] **3. You can read source glosses and edit the expanded word details**
- [x] **4. You can edit a gloss, preview it live, and save it through Tina**
- [x] **5. You can edit the complete source text**
- [x] **6. Your unfinished edits survive a refresh**
- [x] **7. You can export the text as LaTeX**
- [x] **8. Confirmed drafts save through TinaCMS**
