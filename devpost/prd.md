---
doc: prd
status: approved
---

# Glossy — Product Requirements

Glossy is a local-first interlinear glossing editor with a separate responsive reader for students and researchers.
Source: `scope.md > Who It's For`, `scope.md > The POC Boundary`.

**Implementation status:** This PRD records intended behavior, not a claim that every criterion is shipped. The current editor saves by writing exported TeX and JSON through `/api/save-document`, then attempts an optional Tina GraphQL update. The current local draft key is text-scoped but not schema-versioned; discard restores the saved snapshot but does not remove the storage key, and browser storage errors are not reliably surfaced. Pasted TeX currently appends parsed examples without importing all resource, abbreviation, and bibliography metadata; export does not yet round-trip that metadata. Lemma assignment now uses curated form maps and rule-based fallbacks, but those heuristics and the standalone lemma validator do not establish scholarly correctness. Track these as gaps rather than implying Tina-only publishing, versioned recovery, full-fidelity LaTeX support, or verified linguistic accuracy is complete.

## The Core Journey

1. The editor opens the authoring workspace for a Git-backed text, starts a new text using the shared model, or pastes supported `gb4e` LaTeX to import it as a structured text.
2. The editor selects a sentence/example and sees its surface line, source-gloss line, translation, and word details in an interactive live preview.
3. Selecting a token opens an inspector where the editor can update its exact surface, source gloss, lexical link, morphology, pronunciation, and explanation; changes appear in the preview immediately.
4. Changes are autosaved as a text-scoped browser-local draft, not written to TinaCMS or the source files while the editor is working.
5. The editor reloads or returns later and can recover, continue, or discard the draft.
6. After review, the editor presses Save; that button press is the deliberate confirmation and does not require a second dialog. The target write path updates the confirmed JSON document(s) through TinaCMS. The editor reports only writes Tina confirms, retains the draft on any failure, and never implies Git commit/push. The current local API write plus optional Tina request does not yet satisfy this requirement.
7. The editor can export a normalized LaTeX document that preserves the supported source structure and content.
8. A student or researcher opens the separate reader route, reads the published text, and hovers, focuses, or taps a glossed form to inspect its linked explanation.

## Screens and Layout

### Editing Workspace

The editor is a dedicated route, separate from the reader and TinaCMS administration. It presents the sentence structure and an immediately updated interlinear preview alongside a token inspector. The editor can add or edit text examples, source forms and glosses, free translations, footnotes, lexical/grammatical analysis, document metadata, resources, and abbreviations. An unobtrusive link opens the corresponding reader preview; the reader does not contain editor controls.

Draft state is local to the browser and scoped by text and schema version, with a base version to detect stale drafts. The editor sees whether a draft is dirty, saved locally, or ready to publish. It can recover or discard a draft; confirmed discard removes its stored key. Publishing uses the Save button as deliberate confirmation and writes through TinaCMS to Git-backed JSON; a failed or partial multi-document write must be reported, never presented as success. Local Tina writes modify the working tree; Git commit and push are not implicit. Storage errors must be surfaced while keeping in-memory edits visible.

The editor accepts pasted LaTeX in the supported `gb4e` shape: labeled paragraph groups containing aligned `\gll` surface/gloss lines and `\glt` translations, plus the supplied document's footnotes, resource list, citations, abbreviations, and bibliography metadata. Import previews the complete parsed structure before the editor replaces or creates content. Unsupported or malformed structures identify the issue and do not discard current editor content or draft. Arbitrary preamble package recovery and unknown macros are out of scope.

### Reading Surface

The separate reader preserves the source document's structure: paragraph/exercise grouping, Old English surface line, source gloss line, and free translation for every example. Hover, keyboard focus, or tap opens a linked explanation. It has no footer or administrative/editorial chrome. The layout works on desktop and mobile.

## Content Schema and Editing Requirements

The canonical text content is structured JSON in Git, not a database. TinaCMS provides the permanent content write path after confirmation; the dedicated Glossy editor provides live editing and browser-local drafts. Routine editing must not require an editor to manipulate raw JSON.

- A **text document** has a stable text ID and slug, title, language, author/date/source attribution, bibliography resource, ordered source/resources, glossing abbreviations, paragraphs, and ordered examples.
- An **example** has a stable ID and paragraph membership, ordered tokens, a free translation, and any attached footnotes or source notes. Paragraph and example order/labels map to the original `exe`/`xlist` structure.
- A **token** preserves exact source surface, literal TeX gloss, readable gloss, punctuation, and a stable optional lexical-entry reference. Its analysis includes lemma, part of speech, inflection features, morpheme segmentation, definition, optional IPA/history, and source-review provenance.
- A **lexical entry** has a stable reusable ID and canonical lemma/part of speech/definition/notes. Text tokens can link to shared entries while retaining their text-specific surface and source gloss.
- A **local draft** is text-scoped and holds the working copy. The current implementation does not include a schema version or changed lexical-entry collection; versioned recovery remains an unmet requirement.
- The **LaTeX export** derives from the current document and produces normalized `gb4e` output. Full preservation of resource citations, abbreviations, bibliography configuration, and all source metadata remains a requirement but is not currently implemented.
- **Source-review metadata** identifies the manuscript file and entry locator, records `source-checked` or `needs-review`, and does not imply that the linguistic analysis has been independently certified.
- Form labels and list summaries make text blocks, gloss records, and morphemes distinguishable without opening raw JSON or every list item. Stable IDs are clearly identified as references that should not be casually changed.
- Validation checks required fields, uniqueness of text/paragraph/example/token/lexical IDs, lexical references, exact source surface/gloss pairing, footnote placement, and alignment of each token pair in its source manuscript example.
- Draft validation checks schema version and base version before recovery; invalid or stale drafts must be reported without replacing canonical content. Source-transcription checks and linguistic-review status are distinct; heuristic lemma/POS results are not labeled scholarly-verified.
- The content model supports adding a complete text through the Glossy editor and selecting it in the reader without changing application components.

## Look and Feel

Glossy should preserve the correct Old English typography, accents, and diacritics from the source material. It should retain the PDF’s scholarly glossing identity while making the information easier to read on demand. The interaction should feel focused and intuitive rather than like a generic application interface.

The reading experience should follow practical UX best practices: the text remains primary, glosses do not obscure the passage, selected words have a clear visual state, popup content is easy to scan, and the interaction remains usable across screen sizes, keyboard focus, and touch. Phonetic notation, conjugation syntax, and linguistic typography must be rendered accurately rather than simplified into ordinary text.

## Features and Behavior

### Reading and Visual Glossing

The student can read the selected Old English passage and identify annotated words or phrases.

- [x] The passage is legible on desktop and mobile layouts.
- [x] The reader is a separate page from the authoring workspace and contains no editing footer or CMS controls.
- [x] Old English characters, accents, and diacritics render correctly.
- [x] Each annotated Old English line has its source gloss on a separate line immediately beneath it; glosses are not interspersed with the source text.
- [x] Each passage block includes its corresponding translated English sentence clearly rendered.
- [x] The reading visualizer is clean and distraction-free; editing tools exist only on their separate authoring route.
- [x] The source gloss line preserves the token order of the Old English line, and both remain readable when they wrap on narrow screens.
- [x] Hovering over an annotated word or phrase on desktop reveals its gloss popup.
- [x] Tapping an annotated word or phrase on mobile reveals its gloss popup.
- [x] The popup is visually associated with the selected text.
- [x] Selecting another annotated word updates the popup to the new word.
- [x] The popup includes the word definition and conjugation or grammatical information when present.
- [x] The popup includes phonetic translation when present.
- [x] The popup includes a Wiktionary link when present, and that link can be followed.
- [x] No browser-generated speech control is shown; audible pronunciation is deferred until recorded audio or an IPA-compatible solution is reliable for Old English.
- [x] Text without a gloss remains readable as ordinary passage text.
- [x] Words with simple one-morpheme source glosses can be selected just like internally segmented words.
- [x] Multi-morpheme words have a stronger visual affordance and visibly separated morpheme details so they are rewarding to inspect.
- [x] Phonetic notation, conjugation syntax, and Old English diacritics remain visually distinguishable and correctly readable.
- [x] A selected word has a clear visual state, and the popup does not hide the word or make the surrounding passage unreadable.
- [x] The popup and its external link are usable with keyboard focus and touch as well as pointer interaction.
- [x] The popup closes when the reader clicks or taps outside it.
- [x] Escape, the close control, and outside dismissal restore focus to the word that opened the popup.
- [x] Gloss triggers expose whether their popup is expanded, and the popup has an accessible name tied to the selected word.
- [x] The popup's IPA includes a pronunciation source when available; no browser-generated speech is offered.
- [x] An editor can update passage text, translations, gloss tokens, lexical analysis, pronunciation fields, and source-review metadata in the dedicated Glossy workspace.
- [x] A content edit preserves stable token and lexical-entry IDs so existing token-to-explanation links continue to resolve.
- [x] The live editor exposes source form, readable source gloss, literal TeX gloss, linguistic analysis, morphemes, and review metadata without requiring raw JSON.
- [x] An editor can create a text in the shared text-agnostic model and make it available to the reader without changing application components.
- [x] Validation rejects duplicate text, paragraph, example, token, or lexical-entry IDs; missing lexical references; and imported surface/gloss token mismatches.
- [x] Source validation checks that each record's surface and literal TeX gloss are aligned in the same source gloss entry, rather than merely appearing somewhere in the manuscript.
- [x] Review metadata distinguishes source transcription checked against the manuscript from linguistic analysis that still needs scholarly review.
- [x] Heuristic or otherwise unreviewed lemma/POS/definition values remain distinguishable from scholarly-reviewed analysis; automated validation does not claim absolute accuracy.

### Live Gloss Editing, Drafts, and Export

- [x] The editor can select an example and token and edit its source form, source gloss, translation, and available lexical analysis in an inspector.
- [x] Editing a token updates the interlinear preview and its linked reader-style explanation immediately.
- [x] Edits are stored in versioned, text-scoped localStorage drafts; a refresh restores a valid draft, and the editor can explicitly discard it.
- [x] Draft recovery detects an incompatible schema version or stale canonical base version, reports the conflict, and does not overwrite canonical content.
- [x] Local storage read/write/quota failures are shown clearly while the current in-memory edits remain available; confirmed discard removes the stored draft so it does not reappear after reload.
- [x] Draft changes do not update TinaCMS or canonical content until the editor confirms publication.
- [x] Pressing Save is the deliberate confirmation (no extra dialog); the UI previews the documents to be written and uses Tina as the canonical JSON write path without first writing source or JSON directly through another API.
- [x] Success is shown only after Tina confirms every requested document write; errors or partial writes are reported per document with retry/recovery guidance and the local draft is retained.
- [x] Confirmed Tina local writes update JSON files in the Git working tree; the UI does not imply that files were committed or pushed.
- [x] A LaTeX export downloads a valid `.tex` document from the current draft without publishing it.
- [x] An editor can paste a supported `gb4e` manuscript and preview its structured paragraphs, aligned surface/gloss tokens, translations, footnotes, resources, abbreviations, and bibliography metadata before accepting the import.
- [x] The supplied manuscript import preserves all 13 paragraph groups and 75 examples in order, the aligned surface/literal-gloss pairs, translations, footnotes at their original positions, resources/citations, active abbreviations, metadata, and bibliography reference.
- [x] Unsupported LaTeX structures are reported without replacing current editor data; the importer does not claim to parse arbitrary packages or macros.
- [x] Export retains the supported source document structure and all 75 current examples across 13 paragraphs, translations, two footnotes, resource citations/list, abbreviations, title/author/date, and bibliography reference.
- [x] Source validation checks token/gloss pair alignment, unique stable IDs, paragraph/example ordering, footnote references, and the expected imported example count.
- [x] Automated parser/exporter tests cover representative malformed input, mismatched token alignment, footnotes, source metadata, resources, abbreviations, and normalized export invariants; validation output does not claim more than the checks establish.
- [x] The text model can represent additional texts without Old English-specific assumptions in the editor or renderer; arbitrary unknown TeX package/macro import is not required.

### Understanding the Source

The presentation should help the student connect the original text with its analysis, following the source PDF’s glossing approach.

- [x] The demo includes a passage with enough annotated examples to show definitions and conjugations in use.
- [x] A reviewer can select a word and see information that helps explain its vocabulary and grammar.
- [x] The one-minute demo visibly proves the transition from reading the Old English text to understanding a selected word and its conjugation.

## States and Boundaries

- **Initial reading state** — The Old English passage and its separate source-gloss line are visible; no expanded panel is open.
- **Gloss-open state** — A selected annotated word or phrase is visually connected to a popup containing its available information.
- **Another word selected** — The current popup changes to the newly selected word rather than accumulating multiple unrelated popups.
- **Unannotated text** — Text without a gloss remains readable and does not claim to provide information that is not available.
- **Missing optional information** — If a word has no phonetic translation, conjugation detail, or Wiktionary link, the popup shows the information that exists without inventing a placeholder.
- **Responsive state** — The same reading and glossing experience remains usable on desktop and mobile; mobile uses tapping rather than relying on hover.
- **External link** — A Wiktionary link takes the student to the referenced external page.
- **Audible pronunciation deferred** — There is no browser speech control; IPA remains visible as curated text where available.
- **Draft not saved** — edits are visible in live preview and remain browser-local until an explicit publish confirmation.
- **Recovered draft** — a valid local draft is offered/loaded for the matching text and schema version; invalid data is reported and does not silently replace canonical content.
- **Discarded draft** — the browser-local copy is removed only after the editor confirms discard; the published content remains unchanged.
- **Publishing** — the editor waits for Tina's result, reports errors per document, and does not clear the draft if any requested write fails.
- **Exported draft** — LaTeX export uses the current working draft and does not implicitly publish it.

## Product Decisions

- Curated gloss and explanation content — runtime linguistic analysis and generated explanations are deferred.
- Desktop hover and mobile tap — both interaction modes are needed for a responsive web layout.
- Interlinear gloss line plus expanded panel — the student sees the source gloss beneath the text and can open richer detail for any annotated form.
- No browser-generated speech — audible pronunciation is deferred because available voices mispronounce Old English.
- Git-backed JSON — text and lexical content are inspectable, versioned, and portable without a SQL database or paid runtime store.
- Separate reader and editor routes — editing controls do not intrude on the published reading experience.
- Local-first drafts — frequent keystrokes stay in React/localStorage; only an explicit publish action sends content through TinaCMS.
- LaTeX export — the original `gb4e`/`\gll`/`\glt` document structure remains a first-class output of the source data.
- Source-backed verification — source forms and literal TeX glosses remain traceable and are checked for alignment; linguistic interpretation is not automatically certified.
- Accurate Old English typography and diacritics — scholarly correctness is central to the reading experience.
- Accurate phonetic and grammatical notation — appropriate linguistic rendering support must be identified and validated in the technical specification; this is part of correctness, not optional polish.
- UX best practices — the reading flow stays primary, glosses are scannable, and the interaction works for desktop, mobile, keyboard, and touch users.
- Source-PDF-inspired presentation — the web experience should make the existing glossing method interactive rather than replace its identity.

## What We're Building

- A dedicated live editing workspace and a separate responsive reading page with a selector for complete texts.
- Old English reading lines with source glosses on a separate line beneath them.
- Accurate Old English text rendering with diacritics.
- Annotated words or phrases that reveal curated gloss/explanation information.
- Hover behavior for desktop and tap behavior for mobile.
- Expanded gloss panels containing available definitions, inflection, morphemes, phonetic notation, and references.
- Correctly rendered phonetic notation, conjugation syntax, linguistic typography, and Old English diacritics.
- Clear visual association between selected text and its gloss.
- Browser-local drafts, explicit confirmed TinaCMS writes, and normalized LaTeX export.
- Content/source validation for stable references, aligned source forms, and literal TeX gloss provenance.

## Deferred From the POC
- Dynamic gloss generation or asking questions - The first version uses curated gloss/explanation information; interpretation is not generated automatically.
- User accounts and a complete language-learning system — outside the proof-of-concept boundary.
- Audible pronunciation — deferred until recorded audio or an IPA-compatible backend can preserve Old English pronunciation reliably.

## Possible Later Enhancements

- Paste/import arbitrary TeX and recover unknown source macros automatically.
- Add generated explanations and question answering.
- Add collaborative editing and remote publishing integrations.
- Expand glosses with richer historical context and learning features.

## Non-Goals

- Glossy will not replace expert linguistic analysis or guarantee that an external Wiktionary entry is authoritative.
- Glossy will not provide a full Old English course or vocabulary-progress system.
- Glossy will not require authentication, use a SQL database, or save personal annotations in this proof of concept.

## Open Questions

- **Save implementation gap** — Use Tina as the canonical JSON write path after the Save button action; report confirmed per-document results, retain drafts on errors, and do not report success for optional/unconfirmed Tina updates.
- **Full-document import/export gap** — Resource lists, citations, abbreviations, footnote positions, and bibliography settings are required for the supplied source; the current editor import/export does not preserve them.
- **Versioned draft recovery gap** — Schema-version and base-version checks, storage failure reporting, and confirmed discard cleanup are required; the current localStorage implementation does not provide them.
- **Notation and interaction verification** — Validate rendering of source typography and the implemented popup behavior in the finished app; don't describe the detail panel's close/focus behavior as shipped without a corresponding browser check.
- **Speech accuracy** — browser speech synthesis mispronounces Old English and is not offered; revisit audible output only when a reliable recorded or IPA-compatible solution is available.
