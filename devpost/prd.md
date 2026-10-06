---
doc: prd
status: approved
---

# Glossy — Product Requirements

Glossy is a local-first interlinear glossing editor with a separate responsive reader for students, researchers, and linguistic editors.

**Implementation status:** This PRD records the verified and shipped capabilities of Glossy (audited 2026-10-06). All core slices, follow-up requirements, and UX enhancements are complete:
- The editor saves drafts locally via a versioned envelope (`glossy:draft:v1:<slug>`) and registers them in the `glossy_pending_drafts` manifest, with client-side JSON and LaTeX (`gb4e`) export.
- Authenticated TinaCMS session enables committing pending drafts directly into the Git repository.
- The landing page (`/`) features an interactive 3-tier Leipzig glossing preview widget, 3 capability feature pillars, responsive multi-column corpus cards without metric clutter, and persistent scholarly footer.
- The documentation (`/docs`) provides a segmented domain switcher (`Linguistic Guide` vs `System Architecture`), grouped Table of Contents, and full 42 glossing abbreviations reference table.
- Corpus onboarding (`/edit/new`) features an empty state, toggleable presets, custom text ingestion, and file upload.
- Full scholarly attribution & provenance system credits Tyler Lemon (2026), primary manuscript witnesses (*Cotton MS Tiberius B. i*, *Cotton MS Vitellius A. xv*), and 1-click citation generators (BibTeX, Unified Linguistics, APA, Chicago).
- 100% verified lemma compliance across all tokens (`npm run validate:lemmas`) and source alignment across source sentences (`npm run validate:source`).

## The Core Journey

1. The editor opens the authoring workspace for a text, starts a new text using the shared model, or uploads a JSON/text file.
2. The editor selects a sentence/example and sees its surface line, source-gloss line, translation, and word details in an interactive live preview.
3. Selecting a token opens an inspector where the editor can update its exact surface, source gloss, lexical link, morphology, pronunciation, and explanation; changes appear in the preview immediately.
4. Changes are autosaved as a text-scoped browser-local draft envelope (`glossy:draft:v1:<slug>`).
5. The editor reloads or returns later and recovers the draft seamlessly.
6. The editor presses **Save draft** to record a pending draft with updated content hash and timestamp.
7. To commit changes to the Git repository, the user signs in via Tina Admin (`/admin/index.html`) where the sync bar commits pending drafts.
8. The editor can export a normalized LaTeX (`gb4e`) document or complete JSON document.
9. A student or researcher opens the separate reader route, reads the published text, and inspects linked explanations.

## Screens and Layout

### Editing Workspace
The editor is a dedicated route, separate from the reader and TinaCMS administration. It presents sentence structure and an immediately updated interlinear preview alongside a token inspector. The editor can add or edit text examples, source forms and glosses, free translations, footnotes, lexical/grammatical analysis, and document metadata.

### Reading Surface
The separate reader preserves source document structure: paragraph/exercise grouping, Old English surface line, source gloss line, and free translation for every example. Hover, keyboard focus, or tap opens a linked explanation. It has no administrative chrome and works smoothly on desktop and mobile.
