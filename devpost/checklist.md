---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can open and read the Old English passage**
  Becomes usable: A running local Next.js app displays one curated Old English passage with its source context and readable translation.
  Why now: Bootstrapping and real source-backed content must work before interaction is added; this creates the smallest visible reading surface and validates the Unicode text early.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Screens and Layout`, `prd.md > Understanding the Source`
  Spec ref: `spec.md > Stack`, `spec.md > Reading Page`, `spec.md > Annotated Passage`, `spec.md > Data Model`, `spec.md > File Structure`
  Build: Scaffold the Next.js TypeScript app, add the planned file structure, define the passage and gloss types, transcribe a representative passage from `references/Voyages_of_Ohthere_Wulfstan.tex`, and render the Old English text, source attribution, and translation with the scholarly typography fallback.
  Verify (mechanical): Run the project's type check/build command and start the dev server; confirm the route returns successfully and representative strings including `Ō`, `þ`, `ð`, `ċ`, `ġ`, and macrons are present in the rendered source/data.
  Learner check: Open the local page and read the passage at desktop width and a narrow mobile width. Confirm the Old English characters and overall reading layout look correct.
  Commit: `Build readable Old English passage`

- [ ] **2. You can reveal a word's visual gloss**
  Becomes usable: Selecting an annotated word or phrase displays its matching static gloss in one popup, and selecting another replaces it.
  Why now: This is Glossy's unique kernel and core loop; proving it early prevents building a generic reading page around an unverified interaction.
  PRD ref: `prd.md > Reading and Visual Glossing`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > Gloss Trigger`, `spec.md > Gloss Popup`, `spec.md > Data Model`
  Build: Add curated gloss records for representative vocabulary and conjugation examples, render annotated passage segments, connect each segment to one record, and implement hover, focus, click, and tap selection with one replaceable popup. Render available definition, grammar/conjugation, phonetic notation, historical note, and Wiktionary link fields without inventing missing values.
  Verify (mechanical): Run the type check/build and an automated or scripted browser smoke check if available; confirm selecting two different annotated segments produces two different popup headings/content and that missing optional fields do not render empty placeholders.
  Learner check: Select an annotated word on desktop, then another word, and try the same at a narrow mobile width. Confirm the popup clearly belongs to the selected word and contains useful vocabulary or grammar information.
  Commit: `Add interactive visual glosses`

- [ ] **3. You can use the gloss comfortably across devices**
  Becomes usable: The complete reading-and-gloss journey is legible, keyboard/touch usable, and resilient when optional data or popup space is limited.
  Why now: Once the kernel works, the remaining risk is whether the scholarly notation and interaction remain usable in the actual responsive demo.
  PRD ref: `prd.md > Look and Feel`, `prd.md > Reading and Visual Glossing`, `prd.md > States and Boundaries`, `prd.md > Understanding the Source`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Typography and Linguistic Fields`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Refine responsive CSS, selected/focus states, popup positioning and dismissal, keyboard semantics, external-link behavior, and narrow viewport fallbacks. Validate representative IPA/phonetic notation, conjugation syntax, Old English diacritics, and source typography. Keep unannotated text readable and omit absent optional fields.
  Verify (mechanical): Run lint/type check/build; exercise the page at desktop and narrow viewport sizes with keyboard focus and touch/click interactions; confirm no horizontal overflow, no console errors from the app, correct representative glyphs, popup replacement/close behavior, and working Wiktionary link markup.
  Learner check: Try the one-minute demo flow: open the passage, select a word, inspect its definition and conjugation, select another word, close the popup, and repeat in a narrow viewport using keyboard or touch. Note anything confusing or visually wrong.
  Commit: `Polish responsive gloss experience`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1, inspect the reading surface and typography before interaction work.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3, run the full one-minute demo and report any revisions.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — connect the approved PRD criterion to the annotated segment, selected state, popup, and verification evidence.
- [ ] Optional edit and transfer reflection addressed — offer one safe label/style edit or record that it was declined/not applicable.
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not started
Route and stops: not started
Edit outcome: not started
Reflection: not started
Activity mode: not started

## Revisions
