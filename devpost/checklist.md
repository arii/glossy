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

- [x] **2. You can reveal a word's visual gloss**
  Becomes usable: Selecting an annotated word or phrase displays its matching static gloss in one popup, and selecting another replaces it.
  Why now: This is Glossy's unique kernel and core loop; proving it early prevents building a generic reading page around an unverified interaction.
  PRD ref: `prd.md > Reading and Visual Glossing`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > Gloss Trigger`, `spec.md > Gloss Popup`, `spec.md > Data Model`
  Build: Add curated gloss records for representative vocabulary and conjugation examples, render annotated passage segments, connect each segment to one record, and implement hover, focus, click, and tap selection with one replaceable popup. Render available definition, grammar/conjugation, phonetic notation, historical note, and Wiktionary link fields without inventing missing values.
  Verify (mechanical): Run the type check/build and an automated or scripted browser smoke check if available; confirm selecting two different annotated segments produces two different popup headings/content and that missing optional fields do not render empty placeholders.
  Learner check: Select an annotated word on desktop, then another word, and try the same at a narrow mobile width. Confirm the popup clearly belongs to the selected word and contains useful vocabulary or grammar information.
  Commit: `Add interactive visual glosses`

- [x] **3. You can read source glosses and edit the expanded word details**
  Becomes usable: Each text block presents an Old English line, a separate source-gloss line, and its corresponding translated English sentence; hover, keyboard focus, or tap still opens the detailed word panel. The reading visualizer is cleanly separated from editing tools, while TinaCMS provides an admin interface at `/admin` for dictionary and manuscript editing.
  Why now: The core interaction works; this slice restores the source manuscript's interlinear layout with English translations, separates the reading visualizer from authoring tools, and addresses the verified Tina preview-route failure before the learner's final review.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Reading Surface`, `prd.md > Content Schema and Editing Requirements`, `prd.md > Reading and Visual Glossing`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Annotated Passage`, `spec.md > Interlinear Gloss Line`, `spec.md > TinaCMS Content Editor`, `spec.md > Data Model`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Render source text, glosses, and translated English sentences as distinct ordered lines; preserve hover, focus, click, and tap interactions for expanded details. Separate the visualizer from editing tools by moving CMS links out of the reader header to `/admin` and an unobtrusive footer utility link. Provide centralized dictionary management, a working per-text preview route, and runtime/source validation for stable references and aligned source tokens. Remove browser speech playback because it mispronounces Old English.
  Verify (mechanical): Run `npm run lint`, `npm run typecheck`, `npm run validate:source`, `npm run build:tina`, `npm run build`, and `BASE_URL=http://localhost:3000 npm run test:smoke`. Confirm the smoke check finds separate gloss-line markup, English translation sentences, no Hear word control, the Tina admin route, and text preview aliases; confirm the source validator checks each source/TeX-gloss pair in one aligned entry.
  Learner check: Open `http://localhost:3000`, confirm each passage block reads as Old English line → separate gloss line → translation, then hover/click or tap a word and verify its expanded values. Confirm the visualizer has no intrusive edit chrome. Navigate to `http://localhost:3000/admin/index.html` to verify the separated editing tools.
  Commit: `Add interlinear glosses and improve editing`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, inspect the reading surface and typography before interaction work; learner reported inconsistent glyph sizing and missing interactions, which shaped slice 2.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 3, run the full reading, expanded gloss, and editing flow and report any revisions.

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

- The initial gloss record used a generic `conjugation` field and a shortened paraphrase of the source text. It was replaced with source-faithful surface tokens, source glosses, lemma/part-of-speech/inflection features, morphemes, and review metadata.
- The learner requested the source gloss on its own line below the Old English line, while retaining the expanded hover/click/tap panel; the final slice now implements that two-level reading layout.
- The learner reported Tina's text route returned 404 and the editor was not convenient for changing hover-panel values. The final slice adds the missing preview route, an in-page editor link, human-readable form/list labels, and source/reference validation.
- Browser speech playback was removed at the learner's request because it mispronounces Old English; reliable audible pronunciation remains deferred.
- Architectural revision: Restored the English translation sentence alongside the interlinear reading text; separated the student-facing reading visualizer from the authoring/editing tools so the reader is clean and focused, with TinaCMS editor access cleanly situated at `/admin` and in unobtrusive footer utility navigation.
