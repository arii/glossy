---
doc: scope
status: approved
---

# Glossy

Glossy is a local-first linguistic editing workbench and a separate interactive reader. It turns source-backed texts into editable interlinear glosses, explanatory word details, and exportable LaTeX.

## The Unique Kernel
Glossy makes the link between a text, its interlinear gloss, and its linguistic explanation editable and visible as the author works. An editor changes a token and immediately sees the result in a live interlinear preview; the published reader then lets students hover over or click that word to inspect its meaning, grammar, and role.

## Who It's For
An editor, linguist, or educator who creates interlinear texts and the students or researchers who read them. Editors need source-faithful authoring, analysis, and export; readers need clear gloss lines and useful linked explanations instead of separate PDFs and notes.

## The Core Loop
An editor opens a text in the authoring workspace, edits tokens and analyses against a live interlinear preview, and the browser maintains a recoverable draft locally (`glossy:draft:v1:<slug>`). The editor can explicitly save drafts, commit confirmed changes through TinaCMS into Git-backed content, or export LaTeX/JSON documents. A reader uses a separate, clean route to read the published text and inspect linked explanations.

## Implementation Status (2026-10-06)

The application is fully implemented, verified, and ready for hackathon submission:
- **Corpus & Master Source:** The 75-example master edition of *The Voyages of Ohthere & Wulfstan* (Tyler Lemon 2026), *Beowulf* Prologue, *Cædmon's Hymn*, and *The Wanderer* are validated with 0 errors across aligned glosses and verified lemmas.
- **Local-First Drafts & Ingestion:** The editor saves versioned draft envelopes locally with atomic manifest tracking and export capabilities for JSON and LaTeX `gb4e`.
- **Landing & Discovery:** Interactive split hero with 3-tier Leipzig glossing preview widget, capability feature pillars, clean multi-column corpus catalog with metadata badges, and persistent scholarly footer.
- **Scholarly Attribution:** Integrated citation modal providing 4 academic citation formats (BibTeX, Unified Linguistics, APA, Chicago) with dynamic text metadata provenance.
- **Documentation:** Reference guide with 42 Leipzig abbreviation reference table, canonical lemma standards, and system architecture.
- **Corpus Ingestion:** Onboarding workspace (`/edit/new`) with blank default state, toggleable presets, custom text ingestion, and file upload.
- **Quality Assurance:** 100% passing across TypeScript (`tsc --noEmit`), ESLint, source validation, lemma compliance, and draft persistence unit tests.
