# Glossy — Project Plan

**Project Goal**: To build an interactive linguistic visualization web app and local-first editing workbench that bridges Old English and Modern English through visual interlinear glosses and LaTeX export/import.

## Core Architecture
- **Dual-Route Experience**:
  - `/read/<slug>`: Clean, distraction-free reading surface with Old English lines, aligned source glosses, English translations, and clickable/hoverable lexical popups.
  - `/edit/<slug>`: Dedicated local-first authoring workbench with live interlinear preview, rich token inspector (morphology, inflection, part-of-speech, lemma, IPA, Wiktionary), LaTeX gb4e import & export, browser draft persistence, and TinaCMS GraphQL publishing.
- **Data Model**: Structured, Git-backed JSON in `content/texts/` and `content/dictionary/`.
- **LaTeX Integration**: Full gb4e LaTeX importer (`lib/gb4e.ts`) and normalized LaTeX exporter (`data/latex-export.ts`) supporting 13 paragraph groups, 75 examples, translations, and footnotes from `references/Voyages_of_Ohthere_Wulfstan.tex`.
- **Local-First Draft & Persistence**: Debounced `localStorage` drafts (`glossy-draft-v1:<slug>`), unsaved dirty indicators, draft recovery on reload, explicit discard, and confirmed TinaCMS write paths.

## Implementation Status
- [x] Clean, responsive reader with interlinear glosses, translation sentences, and sticky/popup lexical detail panel.
- [x] Live gloss editing workspace with instant interlinear feedback.
- [x] Rich token inspector for lemma, definition, part of speech, grammatical inflection, morpheme segmentation, IPA, and external Wiktionary references.
- [x] Versioned browser-local draft saving and restoration.
- [x] Paste gb4e LaTeX parser and preview workflow.
- [x] Normalized gb4e LaTeX export and file download.
- [x] TinaCMS GraphQL mutation write path for updating working-tree content.
- [x] Source and smoke-test validation for aligned token/gloss pairs and route structure.
