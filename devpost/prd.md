---
doc: prd
status: approved
---

# Glossy — Product Requirements

Glossy is a responsive Old English reading page for college students doing linguistic or literary analysis.
Source: `scope.md > Who It's For`, `scope.md > The POC Boundary`.

## The Core Journey

1. The student opens Glossy on a desktop or mobile browser.
2. The page presents a selected complete Old English text from the text library as the primary reading surface.
3. The student reads the passage and identifies a word or phrase they want to understand.
4. A source-faithful gloss appears directly beneath the Old English line, preserving the original interlinear reading order.
5. The student hovers over or focuses an annotated form on desktop, or taps it on mobile.
6. Glossy displays an expanded details panel connected to that form, with available lexical, morphological, grammatical, phonetic, historical, and dictionary-reference information.
7. The student uses the inline gloss and expanded details to understand the word and continue reading.

## Screens and Layout

### Reading Surface

The proof of concept has one responsive reading surface rather than multiple screens. The Old English text remains primary; its source glosses appear on a separate line beneath each word/line, accompanied by the full translated English sentence for each passage block, and hover, focus, or tap opens the associated expanded details. The layout must work on desktop and mobile.

The student-facing visualizer is intentionally decoupled from CMS authoring tools. The reading interface provides a pure, scholarly reading environment without editor buttons or administrative distractions. Content management and dictionary editing workflows are accessible via dedicated administrative routes (`/admin`) or unobtrusive footer links.

The web presentation preserves the essential structure of the source PDF: an Old English line, its gloss line, and an understandable translation for every sentence block. Readers can select among complete texts in the library.
Content is editable through TinaCMS (using centralized dictionary entries and manuscript documents) so adding a text, correcting a translation, or revising a gloss does not require changing React components.

## Content Schema and Editing Requirements

TinaCMS manages complete text documents through labeled form fields. Routine editing must not require an editor to manipulate raw JSON.

- A **text document** has a stable text ID and slug, title, language, source attribution and manuscript path, publication/review status, ordered reading blocks, and gloss records.
- A **reading block** has a stable block ID, ordered text/gloss segments, and its translation. A gloss segment stores the exact Old English form and a stable reference to one gloss record.
- A **gloss record** has a stable ID, exact source surface, readable source gloss, literal TeX source gloss, lemma, part of speech, part-of-speech-appropriate inflection features, one or more morphemes, definition, optional IPA and historical/reference fields, and source-review metadata.
- **Source-review metadata** identifies the manuscript file and entry locator, records `source-checked` or `needs-review`, and does not imply that the linguistic analysis has been independently certified.
- Form labels and list summaries make text blocks, gloss records, and morphemes distinguishable without opening raw JSON or every list item. Stable IDs are clearly identified as references that should not be casually changed.
- Validation checks required fields, uniqueness of text/slugs/block/gloss IDs, segment-to-record references, exact agreement between a segment's source form and its linked record, and alignment of each surface/TeX-gloss pair in the same source manuscript entry.
- The content model supports adding a complete text through TinaCMS and then selecting it in the reader without changing application components.

## Look and Feel

Glossy should preserve the correct Old English typography, accents, and diacritics from the source material. It should retain the PDF’s scholarly glossing identity while making the information easier to read on demand. The interaction should feel focused and intuitive rather than like a generic application interface.

The reading experience should follow practical UX best practices: the text remains primary, glosses do not obscure the passage, selected words have a clear visual state, popup content is easy to scan, and the interaction remains usable across screen sizes, keyboard focus, and touch. Phonetic notation, conjugation syntax, and linguistic typography must be rendered accurately rather than simplified into ordinary text.

## Features and Behavior

### Reading and Visual Glossing

The student can read the selected Old English passage and identify annotated words or phrases.

- [ ] The passage is legible on desktop and mobile layouts.
- [ ] Old English characters, accents, and diacritics render correctly.
- [ ] Each annotated Old English line has its source gloss on a separate line immediately beneath it; glosses are not interspersed with the source text.
- [ ] Each passage block includes its corresponding translated English sentence clearly rendered.
- [ ] The reading visualizer is clean and distraction-free, with editing tools cleanly separated to `/admin` or unobtrusive footer navigation.
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
- [ ] The popup's IPA includes a pronunciation source, while audible playback is clearly labeled as a browser pronunciation aid rather than an authoritative reconstruction.
- [ ] An editor can update passage text, translations, simple glosses, multi-morpheme glosses, pronunciation fields, and source-review metadata in TinaCMS.
- [ ] A content edit preserves stable gloss IDs so existing passage segments continue to resolve to the intended popup.
- [ ] TinaCMS provides labeled form fields for editing text and gloss data; routine editing does not require raw JSON editing.
- [ ] An editor can create a complete text in TinaCMS and make it available in the text selector without changing application components.
- [ ] Gloss record forms expose source form, readable source gloss, literal TeX gloss, linguistic analysis, morphemes, and source-review metadata as separate fields.
- [ ] Gloss record and morpheme list items have human-readable labels so editors can locate an entry without opening every item.
- [ ] Validation rejects duplicate text IDs, slugs, block IDs, and gloss IDs; missing gloss references; and segment text that differs from its linked gloss record's source form.
- [ ] Source validation checks that each record's surface and literal TeX gloss are aligned in the same source gloss entry, rather than merely appearing somewhere in the manuscript.
- [ ] Review metadata distinguishes source transcription checked against the manuscript from linguistic analysis that still needs scholarly review.

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

## Product Decisions

- Static glossed information — dynamic question answering and generated explanations are deferred.
- Desktop hover and mobile tap — both interaction modes are needed for a responsive web layout.
- Interlinear gloss line plus expanded panel — the student sees the source gloss beneath the text and can open richer detail for any annotated form.
- No browser-generated speech — audible pronunciation is deferred because available voices mispronounce Old English.
- TinaCMS editing — complete text documents live in versioned JSON behind labeled forms, while the reading UI consumes the same typed document shape.
- Source-backed verification — source forms and literal TeX glosses remain traceable and are checked for alignment; linguistic interpretation is not automatically certified.
- Accurate Old English typography and diacritics — scholarly correctness is central to the reading experience.
- Accurate phonetic and grammatical notation — appropriate linguistic rendering support must be identified and validated in the technical specification; this is part of correctness, not optional polish.
- UX best practices — the reading flow stays primary, glosses are scannable, and the interaction works for desktop, mobile, keyboard, and touch users.
- Source-PDF-inspired presentation — the web experience should make the existing glossing method interactive rather than replace its identity.

## What We're Building

- One responsive Glossy reading page with a selector for complete source-backed texts.
- Old English reading lines with source glosses on a separate line beneath them.
- Accurate Old English text rendering with diacritics.
- Annotated words or phrases that reveal static gloss information.
- Hover behavior for desktop and tap behavior for mobile.
- Expanded gloss panels containing available definitions, inflection, morphemes, phonetic notation, and references.
- Correctly rendered phonetic notation, conjugation syntax, linguistic typography, and Old English diacritics.
- Clear visual association between selected text and its gloss.
- TinaCMS form-based editing for complete texts and gloss records.
- Content/source validation for stable references, aligned source forms, and literal TeX gloss provenance.

## Deferred From the POC
- Dynamic gloss generation or asking questions — the first version uses curated static information.
- User accounts and a complete language-learning system — outside the proof-of-concept boundary.
- Audible pronunciation — deferred until recorded audio or an IPA-compatible backend can preserve Old English pronunciation reliably.

## Possible Later Enhancements

- Add generated explanations and question answering.
- Expand glosses with richer historical context and learning features.

## Non-Goals

- Glossy will not replace expert linguistic analysis or guarantee that an external Wiktionary entry is authoritative.
- Glossy will not provide a full Old English course or vocabulary-progress system.
- Glossy will not require authentication or save personal annotations in this proof of concept.

## Open Questions

- **Popup closing behavior** — The intended direction is for the popup to behave as an intuitive hover/tap box and update when another word is selected. Exact pointer-leave and mobile dismissal behavior can be finalized during `4-spec` because it does not change the product’s core promise.
- **Notation support** — `4-spec` must identify and validate the appropriate phonetic or linguistic rendering support and confirm that the source’s conjugation syntax and typography can be represented accurately. This is required before implementation, not an optional polish item.
- **Speech accuracy** — browser speech synthesis mispronounces Old English and is not offered; revisit audible output only when a reliable recorded or IPA-compatible solution is available.
