---
doc: prd
status: approved
---

# Glossy — Product Requirements

Glossy is a local-first interlinear glossing editor with a separate responsive reader for students and researchers.
Source: `scope.md > Who It's For`, `scope.md > The POC Boundary`.

## The Core Journey

1. The editor opens the authoring workspace for a Git-backed text, starts a new text using the shared model, or pastes supported `gb4e` LaTeX to import it as a structured text.
2. The editor selects a sentence/example and sees its surface line, source-gloss line, translation, and word details in an interactive live preview.
3. Selecting a token opens an inspector where the editor can update its exact surface, source gloss, lexical link, morphology, pronunciation, and explanation; changes appear in the preview immediately.
4. Changes are autosaved as a text-scoped browser-local draft, not written to TinaCMS or the source files while the editor is working.
5. The editor reloads or returns later and can recover, continue, or discard the draft.
6. After reviewing the rendered text and export, the editor explicitly confirms publication. TinaCMS writes the confirmed JSON document(s) to the Git-backed content repository; Git commit/push remains a separate version-control action.
7. The editor can export a normalized LaTeX document that preserves the supported source structure and content.
8. A student or researcher opens the separate reader route, reads the published text, and hovers, focuses, or taps a glossed form to inspect its linked explanation.

## Screens and Layout

### Editing Workspace

The editor is a dedicated route, separate from the reader and TinaCMS administration. It presents the sentence structure and an immediately updated interlinear preview alongside a token inspector. The editor can add or edit text examples, source forms and glosses, free translations, footnotes, lexical/grammatical analysis, document metadata, resources, and abbreviations. An unobtrusive link opens the corresponding reader preview; the reader does not contain editor controls.

Draft state is local to the browser and scoped by text and schema version. The editor sees whether a draft is dirty, saved locally, or ready to publish. It can recover or discard a draft. Publishing requires a deliberate confirmation and writes through TinaCMS to Git-backed JSON; a failed or partial multi-document write must be reported, never presented as success. Local Tina writes modify the working tree; Git commit and push are not implicit.

The editor accepts pasted LaTeX in the supported `gb4e` shape: labeled paragraph groups containing aligned `\gll` surface/gloss lines and `\glt` translations, plus the supplied document's footnotes, resource list, abbreviations, and bibliography metadata. A successful import opens as a live interlinear preview before it replaces or creates editor content. Unsupported or malformed structures produce a specific error and do not discard the editor's current work. Arbitrary preamble package recovery and unknown macros are out of scope.

### Reading Surface

The separate reader preserves the source document's structure: paragraph/exercise grouping, Old English surface line, source gloss line, and free translation for every example. Hover, keyboard focus, or tap opens a linked explanation. It has no footer or administrative/editorial chrome. The layout works on desktop and mobile.

## Content Schema and Editing Requirements

The canonical text content is structured JSON in Git, not a database. TinaCMS provides the permanent content write path after confirmation; the dedicated Glossy editor provides live editing and browser-local drafts. Routine editing must not require an editor to manipulate raw JSON.

- A **text document** has a stable text ID and slug, title, language, author/date/source attribution, bibliography resource, ordered source/resources, glossing abbreviations, paragraphs, and ordered examples.
- An **example** has a stable ID and paragraph membership, ordered tokens, a free translation, and any attached footnotes or source notes. Paragraph and example order/labels map to the original `exe`/`xlist` structure.
- A **token** preserves exact source surface, literal TeX gloss, readable gloss, punctuation, and a stable optional lexical-entry reference. Its analysis includes lemma, part of speech, inflection features, morpheme segmentation, definition, optional IPA/history, and source-review provenance.
- A **lexical entry** has a stable reusable ID and canonical lemma/part of speech/definition/notes. Text tokens can link to shared entries while retaining their text-specific surface and source gloss.
- A **local draft** contains a schema version, text-scoped working copy, and any changed lexical entries. It is never sent to Tina until explicit confirmation.
- The **LaTeX export** derives from the same data and preserves paragraph/example grouping, `\gll` surface/gloss alignment, `\glt` translations, footnotes, resource citations, abbreviations, metadata, and bibliography configuration using a normalized template.
- **Source-review metadata** identifies the manuscript file and entry locator, records `source-checked` or `needs-review`, and does not imply that the linguistic analysis has been independently certified.
- Form labels and list summaries make text blocks, gloss records, and morphemes distinguishable without opening raw JSON or every list item. Stable IDs are clearly identified as references that should not be casually changed.
- Validation checks required fields, uniqueness of text/paragraph/example/token/lexical IDs, lexical references, exact source surface/gloss pairing, footnote placement, and alignment of each token pair in its source manuscript example.
- The content model supports adding a complete text through the Glossy editor and selecting it in the reader without changing application components.

## Look and Feel

Glossy should preserve the correct Old English typography, accents, and diacritics from the source material. It should retain the PDF’s scholarly glossing identity while making the information easier to read on demand. The interaction should feel focused and intuitive rather than like a generic application interface.

The reading experience should follow practical UX best practices: the text remains primary, glosses do not obscure the passage, selected words have a clear visual state, popup content is easy to scan, and the interaction remains usable across screen sizes, keyboard focus, and touch. Phonetic notation, conjugation syntax, and linguistic typography must be rendered accurately rather than simplified into ordinary text.

## Features and Behavior

### Reading and Visual Glossing

The student can read the selected Old English passage and identify annotated words or phrases.

- [ ] The passage is legible on desktop and mobile layouts.
- [ ] The reader is a separate page from the authoring workspace and contains no editing footer or CMS controls.
- [ ] Old English characters, accents, and diacritics render correctly.
- [ ] Each annotated Old English line has its source gloss on a separate line immediately beneath it; glosses are not interspersed with the source text.
- [ ] Each passage block includes its corresponding translated English sentence clearly rendered.
- [ ] The reading visualizer is clean and distraction-free; editing tools exist only on their separate authoring route.
- [ ] The source gloss line preserves the token order of the Old English line, and both remain readable when they wrap on narrow screens.
- [ ] Hovering over an annotated word or phrase on desktop reveals its gloss popup.
- [ ] Tapping an annotated word or phrase on mobile reveals its gloss popup.
- [ ] The popup is visually associated with the selected text.
- [ ] Selecting another annotated word updates the popup to the new word.
- [ ] The popup includes the word definition and conjugation or grammatical information when present.
- [ ] The popup includes phonetic translation when present.
- [ ] The popup includes a Wiktionary link when present, and that link can be followed.
- [ ] No browser-generated speech control is shown; audible pronunciation is deferred until recorded audio or an IPA-compatible solution is reliable for Old English.
- [ ] Text without a gloss remains readable as ordinary passage text.
- [ ] Words with simple one-morpheme source glosses can be selected just like internally segmented words.
- [ ] Multi-morpheme words have a stronger visual affordance and visibly separated morpheme details so they are rewarding to inspect.
- [ ] Phonetic notation, conjugation syntax, and Old English diacritics remain visually distinguishable and correctly readable.
- [ ] A selected word has a clear visual state, and the popup does not hide the word or make the surrounding passage unreadable.
- [ ] The popup and its external link are usable with keyboard focus and touch as well as pointer interaction.
- [ ] The popup closes when the reader clicks or taps outside it.
- [ ] Escape, the close control, and outside dismissal restore focus to the word that opened the popup.
- [ ] Gloss triggers expose whether their popup is expanded, and the popup has an accessible name tied to the selected word.
- [ ] The popup's IPA includes a pronunciation source when available; no browser-generated speech is offered.
- [ ] An editor can update passage text, translations, gloss tokens, lexical analysis, pronunciation fields, and source-review metadata in the dedicated Glossy workspace.
- [ ] A content edit preserves stable token and lexical-entry IDs so existing token-to-explanation links continue to resolve.
- [ ] The live editor exposes source form, readable source gloss, literal TeX gloss, linguistic analysis, morphemes, and review metadata without requiring raw JSON.
- [ ] An editor can create a text in the shared text-agnostic model and make it available to the reader without changing application components.
- [ ] Validation rejects duplicate text, paragraph, example, token, or lexical-entry IDs; missing lexical references; and imported surface/gloss token mismatches.
- [ ] Source validation checks that each record's surface and literal TeX gloss are aligned in the same source gloss entry, rather than merely appearing somewhere in the manuscript.
- [ ] Review metadata distinguishes source transcription checked against the manuscript from linguistic analysis that still needs scholarly review.

### Live Gloss Editing, Drafts, and Export

- [ ] The editor can select an example and token and edit its source form, source gloss, translation, and available lexical analysis in an inspector.
- [ ] Editing a token updates the interlinear preview and its linked reader-style explanation immediately.
- [ ] Edits are stored in versioned, text-scoped localStorage drafts; a refresh restores a valid draft, and the editor can explicitly discard it.
- [ ] Draft changes do not update TinaCMS or canonical content until the editor confirms publication.
- [ ] Saving is an explicit button press that names the file written (no extra dialog); success is shown only after Tina confirms every requested document write, and errors or partial writes are reported clearly with retry/recovery guidance.
- [ ] Confirmed Tina local writes update JSON files in the Git working tree; the UI does not imply that files were committed or pushed.
- [ ] A LaTeX export downloads a valid `.tex` document from the current draft without publishing it.
- [ ] An editor can paste a supported `gb4e` manuscript and preview its structured paragraphs, aligned surface/gloss tokens, translations, footnotes, resources, abbreviations, and bibliography metadata before accepting the import.
- [ ] Unsupported LaTeX structures are reported without replacing current editor data; the importer does not claim to parse arbitrary packages or macros.
- [ ] Export retains the supported source document structure and all 75 current examples across 13 paragraphs, translations, two footnotes, resource citations/list, abbreviations, title/author/date, and bibliography reference.
- [ ] Source validation checks token/gloss pair alignment, unique stable IDs, paragraph/example ordering, footnote references, and the expected imported example count.
- [ ] The text model can represent additional texts without Old English-specific assumptions in the editor or renderer; arbitrary unknown TeX package/macro import is not required.

### Understanding the Source

The presentation should help the student connect the original text with its analysis, following the source PDF’s glossing approach.

- [ ] The demo includes a passage with enough annotated examples to show definitions and conjugations in use.
- [ ] A reviewer can select a word and see information that helps explain its vocabulary and grammar.
- [ ] The one-minute demo visibly proves the transition from reading the Old English text to understanding a selected word and its conjugation.

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

- **Popup closing behavior** — The intended direction is for the popup to behave as an intuitive hover/tap box and update when another word is selected. Exact pointer-leave and mobile dismissal behavior can be finalized during `4-spec` because it does not change the product’s core promise.
- **Notation support** — `4-spec` must identify and validate the appropriate phonetic or linguistic rendering support and confirm that the source’s conjugation syntax and typography can be represented accurately. This is required before implementation, not an optional polish item.
- **Speech accuracy** — browser speech synthesis mispronounces Old English and is not offered; revisit audible output only when a reliable recorded or IPA-compatible solution is available.
