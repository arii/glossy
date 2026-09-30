---
doc: prd
status: approved
---

# Glossy — Product Requirements

Glossy is a responsive Old English reading page for college students doing linguistic or literary analysis.
Source: `scope.md > Who It's For`, `scope.md > The POC Boundary`.

## The Core Journey

1. The student opens Glossy on a desktop or mobile browser.
2. The page presents the selected Old English passage as the primary reading surface. The proof of concept uses the current text; selecting among multiple texts is deferred.
3. The student reads the passage and identifies a word or phrase they want to understand.
4. The student hovers over the annotated text on desktop or taps it on mobile.
5. Glossy displays a popup gloss box connected to that word or phrase. The box provides the available gloss information, including the word definition, conjugation or grammatical information, phonetic translation where available, and a link to Wiktionary where available.
6. The student uses the gloss to understand the word, its conjugation, and relevant historical or linguistic context, then continues reading.

## Screens and Layout

### Reading Surface

The proof of concept has one responsive reading surface rather than multiple screens. The Old English text is the focus, with annotated words or phrases discoverable through hover or tap. The layout must work on desktop and mobile. The visual relationship between a selected word and its popup should make it clear which text the information explains.

The web presentation should preserve the important structure of the source PDF: Old English text, glossed linguistic information, and an understandable translation. The page currently presents one text; text selection is a later enhancement.

## Look and Feel

Glossy should preserve the correct Old English typography, accents, and diacritics from the source material. It should retain the PDF’s scholarly glossing identity while making the information easier to read on demand. The interaction should feel focused and intuitive rather than like a generic application interface.

The reading experience should follow practical UX best practices: the text remains primary, glosses do not obscure the passage, selected words have a clear visual state, popup content is easy to scan, and the interaction remains usable across screen sizes, keyboard focus, and touch. Phonetic notation, conjugation syntax, and linguistic typography must be rendered accurately rather than simplified into ordinary text.

## Features and Behavior

### Reading and Visual Glossing

The student can read the selected Old English passage and identify annotated words or phrases.

- [ ] The passage is legible on desktop and mobile layouts.
- [ ] Old English characters, accents, and diacritics render correctly.
- [ ] Hovering over an annotated word or phrase on desktop reveals its gloss popup.
- [ ] Tapping an annotated word or phrase on mobile reveals its gloss popup.
- [ ] The popup is visually associated with the selected text.
- [ ] Selecting another annotated word updates the popup to the new word.
- [ ] The popup includes the word definition and conjugation or grammatical information when present.
- [ ] The popup includes phonetic translation when present.
- [ ] The popup includes a Wiktionary link when present, and that link can be followed.
- [ ] The popup offers a control to hear the selected word or lemma using the browser's available speech support.
- [ ] The reading surface offers a control to read the selected passage aloud and stop playback.
- [ ] Text without a gloss remains readable as ordinary passage text.
- [ ] Phonetic notation, conjugation syntax, and Old English diacritics remain visually distinguishable and correctly readable.
- [ ] A selected word has a clear visual state, and the popup does not hide the word or make the surrounding passage unreadable.
- [ ] The popup and its external link are usable with keyboard focus and touch as well as pointer interaction.
- [ ] The popup closes when the reader clicks or taps outside it.
- [ ] Escape, the close control, and outside dismissal restore focus to the word that opened the popup.
- [ ] Gloss triggers expose whether their popup is expanded, and the popup has an accessible name tied to the selected word.
- [ ] The popup's IPA includes a pronunciation source, while audible playback is clearly labeled as a browser pronunciation aid rather than an authoritative reconstruction.

### Understanding the Source

The presentation should help the student connect the original text with its analysis, following the source PDF’s glossing approach.

- [ ] The demo includes a passage with enough annotated examples to show definitions and conjugations in use.
- [ ] A reviewer can select a word and see information that helps explain its vocabulary and grammar.
- [ ] The one-minute demo visibly proves the transition from reading the Old English text to understanding a selected word and its conjugation.

## States and Boundaries

- **Initial reading state** — The passage is visible with no gloss popup open.
- **Gloss-open state** — A selected annotated word or phrase is visually connected to a popup containing its available information.
- **Another word selected** — The current popup changes to the newly selected word rather than accumulating multiple unrelated popups.
- **Unannotated text** — Text without a gloss remains readable and does not claim to provide information that is not available.
- **Missing optional information** — If a word has no phonetic translation, conjugation detail, or Wiktionary link, the popup shows the information that exists without inventing a placeholder.
- **Responsive state** — The same reading and glossing experience remains usable on desktop and mobile; mobile uses tapping rather than relying on hover.
- **External link** — A Wiktionary link takes the student to the referenced external page.
- **Speech unavailable** — The controls are disabled or show a concise availability message when the browser does not expose speech synthesis.
- **Speech active** — Starting another utterance stops the previous one; the student can stop playback without changing the selected gloss.

## Product Decisions

- One selected Old English text for the proof of concept — the goal is to prove the visual gloss interaction before adding a text library.
- Static glossed information — dynamic question answering and generated explanations are deferred.
- Desktop hover and mobile tap — both interaction modes are needed for a responsive web layout.
- Popup gloss box — the student should see the definition, conjugation, phonetic translation, and Wiktionary link in one focused explanation.
- Optional browser speech — word pronunciation and passage read-aloud extend the reading experience without requiring an external service.
- Accurate Old English typography and diacritics — scholarly correctness is central to the reading experience.
- Accurate phonetic and grammatical notation — appropriate linguistic rendering support must be identified and validated in the technical specification; this is part of correctness, not optional polish.
- UX best practices — the reading flow stays primary, glosses are scannable, and the interaction works for desktop, mobile, keyboard, and touch users.
- Source-PDF-inspired presentation — the web experience should make the existing glossing method interactive rather than replace its identity.

## What We're Building

- One responsive Glossy reading page.
- One selected Old English passage based on the referenced source material.
- Accurate Old English text rendering with diacritics.
- Annotated words or phrases that reveal static gloss information.
- Hover behavior for desktop and tap behavior for mobile.
- Popup glosses containing available definitions, conjugations or grammatical information, phonetic translations, and Wiktionary links.
- Word-level pronunciation and passage-level read-aloud controls using browser speech synthesis when available.
- Correctly rendered phonetic notation, conjugation syntax, linguistic typography, and Old English diacritics.
- Clear visual association between selected text and its gloss.

## Deferred From the POC

- Selecting among multiple Old English texts — not needed to prove the core loop.
- Dynamic gloss generation or asking questions — the first version uses curated static information.
- User accounts, annotation editing, and a complete language-learning system — outside the proof-of-concept boundary.

## Possible Later Enhancements

- Add a library or selector for additional texts.
- Add generated explanations and question answering.
- Expand glosses with richer historical context and learning features.

## Non-Goals

- Glossy will not replace expert linguistic analysis or guarantee that an external Wiktionary entry is authoritative.
- Glossy will not provide a full Old English course or vocabulary-progress system.
- Glossy will not require authentication or save personal annotations in this proof of concept.

## Open Questions

- **Popup closing behavior** — The intended direction is for the popup to behave as an intuitive hover/tap box and update when another word is selected. Exact pointer-leave and mobile dismissal behavior can be finalized during `4-spec` because it does not change the product’s core promise.
- **Notation support** — `4-spec` must identify and validate the appropriate phonetic or linguistic rendering support and confirm that the source’s conjugation syntax and typography can be represented accurately. This is required before implementation, not an optional polish item.
- **Speech accuracy** — browser speech synthesis can provide an audible aid, but available voices may not represent reconstructed Old English pronunciation accurately. The POC must label the control as browser speech and avoid presenting it as an authoritative phonetic recording.
