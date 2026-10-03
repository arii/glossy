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
  Becomes usable: Each text block presents an Old English line, a separate source-gloss line, and its corresponding translated English sentence; hover, keyboard focus, or tap still opens the detailed word panel. This initial slice added the first TinaCMS authoring surface; the revised workflow replaces it with a separate live editor and reader.
  Why now: The core interaction works; this slice restores the source manuscript's interlinear layout with English translations, separates the reading visualizer from authoring tools, and addresses the verified Tina preview-route failure before the learner's final review.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Reading Surface`, `prd.md > Content Schema and Editing Requirements`, `prd.md > Reading and Visual Glossing`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Annotated Passage`, `spec.md > Interlinear Gloss Line`, `spec.md > TinaCMS Content Editor`, `spec.md > Data Model`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Render source text, glosses, and translated English sentences as distinct ordered lines; preserve hover, focus, click, and tap interactions for expanded details. Separate the visualizer from editing tools by moving CMS links out of the reader header to `/admin` and an unobtrusive footer utility link. Provide centralized dictionary management, a working per-text preview route, and runtime/source validation for stable references and aligned source tokens. Remove browser speech playback because it mispronounces Old English.
  Verify (mechanical): Run `npm run lint`, `npm run typecheck`, `npm run validate:source`, `npm run build:tina`, `npm run build`, and `BASE_URL=http://localhost:3000 npm run test:smoke`. Confirm the smoke check finds separate gloss-line markup, English translation sentences, no Hear word control, the Tina admin route, and text preview aliases; confirm the source validator checks each source/TeX-gloss pair in one aligned entry.
  Learner check: Open `http://localhost:3000`, confirm each passage block reads as Old English line → separate gloss line → translation, then hover/click or tap a word and verify its expanded values. Confirm the visualizer has no intrusive edit chrome. Navigate to `http://localhost:3000/admin/index.html` to verify the separated editing tools.
  Commit: `Add interlinear glosses and improve editing`

- [ ] **4. You can edit a gloss, preview it live, and save it through Tina**
  Becomes usable: A dedicated editing route lets the editor select a token, change its source form/gloss or explanation, immediately see the interlinear preview and linked explanation update, then explicitly confirm saving to the Tina-managed Git JSON; the clean reader is a separate route.
  Why now: This proves the revised unique kernel and the real CMS write path on a small source-backed example before investing in bulk migration, robust local draft recovery, or export.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Editing Workspace`, `prd.md > Live Gloss Editing, Drafts, and Export`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > Gloss Editing Workspace`, `spec.md > Data Model`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Add the text-agnostic paragraph/example/token model for one existing example; create separate `/edit/<slug>` and `/read/<slug>` pages; implement token selection, an inspector, the live interlinear preview, and reader-style explanation using shared typed data; add an explicit confirmation and Tina JSON save with clear success/error reporting.
  Verify (mechanical): Run `npm run lint`, `npm run typecheck`, `npm run build`, and `BASE_URL=http://localhost:3000 npm run test:smoke`; in a browser edit token details, confirm the preview changes and reader stays unchanged, then confirm a Tina write and verify the saved JSON in `content/texts/`; verify duplicate reader entries are suppressed and the selected gloss remains visible while scrolling.
  Learner check: Open the editor, change one source gloss or explanation and observe the preview update immediately; explicitly save a test edit through Tina and inspect the Git-backed JSON; open the separate reader and confirm it remains a reader, not an editor.
  Commit: `Add live gloss editing workspace`

- [ ] **5. You can edit the complete source text**
  Becomes usable: The editor and reader handle the complete supplied TeX text in Git-backed JSON, preserving its 13 paragraph groups, 75 examples, translations, inline footnotes, resources/citations, abbreviations, and bibliography metadata.
  Why now: The revised editor must prove the schema against the real document's full structure and exceptions, not only the first few example sentences.
  PRD ref: `prd.md > Content Schema and Editing Requirements`, `prd.md > Live Gloss Editing, Drafts, and Export`, `prd.md > Understanding the Source`
  Spec ref: `spec.md > Data Model`, `spec.md > File Structure`, `spec.md > Important Failure Modes`, `spec.md > Decisions and Open Issues`
  Build: Add a paste/import workflow for the supported `gb4e` subset, parse all source `\gll`/`\glt` pairs into ordered paragraph/example/token JSON, and preview before accepting; preserve literal TeX glosses, inline notes, resource citations, active abbreviations, and bibliography metadata; connect reusable lexical IDs where available; render/select examples and support adding another text using the same model.
  Verify (mechanical): Run `npm run validate:source`, `npm run typecheck`, and `npm run build`; paste the supplied TeX fixture and require all 75 source/gloss/translation entries, 13 paragraph labels, footnote anchors, resource entries, active abbreviations, and document metadata to validate with no alignment loss; malformed/unsupported input must leave current editor data unchanged.
  Learner check: Paste the supplied TeX manuscript into the editor, review the structured preview, navigate between early and later paragraph groups, edit a token near a source exception, and confirm the translation and footnote stay with the correct example.
  Commit: `Import full TeX corpus into text model`

- [ ] **6. Your unfinished edits survive a refresh**
  Becomes usable: Token and document edits are autosaved as versioned browser-local drafts, restored for the matching text after refresh, and explicitly discardable without changing published content.
  Why now: Once the full document is editable, the learner needs safe browser-local recovery before the later confirmed publish flow writes changes to the Git-backed source.
  PRD ref: `prd.md > Editing Workspace`, `prd.md > Live Gloss Editing, Drafts, and Export`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Draft Controller`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Implement draft serialization/hydration, debounce, text/schema scoping, dirty status, recovery/discard confirmation, and base-version conflict detection; surface storage/parse failures without dropping current edits.
  Verify (mechanical): Run typecheck/build and browser smoke checks: edit two fields, refresh and recover both, discard, refresh again, and confirm canonical data never changed.
  Learner check: Change a token and translation, reload the editor, recover the draft, then discard it and open the reader to confirm it still shows the published values.
  Commit: `Persist editor drafts locally`

- [ ] **7. You can export the text as LaTeX**
  Becomes usable: The editor downloads a normalized `.tex` document from its current draft, preserving the source's supported gb4e structure and all text, gloss, translation, note, resource, abbreviation, and bibliography content.
  Why now: Export lets the editor review a shareable source-format artifact from the draft before any explicit Tina write, and proves the JSON model captures more than the web rendering.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Live Gloss Editing, Drafts, and Export`, `prd.md > Content Schema and Editing Requirements`
  Spec ref: `spec.md > LaTeX Exporter`, `spec.md > Data Model`, `spec.md > Important Failure Modes`, `spec.md > What Was Simplified and Why`
  Build: Implement a deterministic gb4e exporter and download action for draft and published data; preserve paragraph labels, aligned `\gll` tokens, `\glt` translations, footnotes, resource citations/list, abbreviations, title/author/date, and bibliography resource.
  Verify (mechanical): Run `npm run lint`, `npm run typecheck`, `npm run validate:source`, `npm run build`, and exporter round-trip assertions for 13 paragraphs, 75 examples, all aligned tokens/translations, two footnotes, resources, and abbreviations; compile generated TeX with XeLaTeX when installed.
  Learner check: Download TeX from a changed local draft, compare its paragraph/example order and a footnoted translation with the source document, and confirm export did not publish the draft.
  Commit: `Export glossed text to LaTeX`

- [ ] **8. Confirmed drafts save through TinaCMS**
  Becomes usable: The editor previews exactly which text/lexical documents will change and writes them to the repository-backed Tina content only after explicit confirmation; failed writes retain the draft and show document-level results.
  Why now: This is the final controlled boundary from private browser state to permanent Git-backed source files, after the editor can already review and export the draft.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Editing Workspace`, `prd.md > Live Gloss Editing, Drafts, and Export`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Confirmed Tina Publisher`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Use the local Tina GraphQL create/update document operations for confirmed text and changed lexical entries; require a confirmation step, verify mutation results, retain retryable drafts on partial failure, and distinguish working-tree writes from Git commit/push.
  Verify (mechanical): Run `npm run dev`, then `npm run test:smoke`; exercise an unconfirmed draft (no file changes), confirm publish (expected JSON changes), and induce/verify a reported failed write without draft loss.
  Learner check: Edit and export a gloss, verify the reader/source files are unchanged before confirmation, then confirm and inspect the Tina content/worktree for the saved update; confirm the editor does not claim it committed or pushed Git.
  Commit: `Publish confirmed drafts through Tina`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, inspect the reading surface and typography before interaction work; learner reported inconsistent glyph sizing and missing interactions, which shaped slice 2.
- [ ] New editor workflow explored — after slice 4, try editing a token against the live preview before the remaining data/persistence work is built.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 8, test editor, draft recovery, confirmed Tina save, LaTeX export, and the separate reader.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — connect the live-edit PRD criterion to token selection, draft state, preview update, and verification evidence.
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
- The learner reported Tina's text route returned 404 and the editor was not convenient for changing hover-panel values. The initial implementation added a preview route, reader-to-editor link, human-readable form/list labels, and source/reference validation; the new revision removes editor navigation from the reader and replaces this path with a dedicated live-editing route.
- Browser speech playback was removed at the learner's request because it mispronounces Old English; reliable audible pronunciation remains deferred.
- Architectural revision: Restored the English translation sentence alongside the interlinear reading text; separated the student-facing reading visualizer from the authoring/editing tools so the reader is clean and focused, with TinaCMS editor access cleanly situated at `/admin` and in unobtrusive footer utility navigation.
- The learner revised the product direction toward live gloss editing: the reader and editor will be separate pages; edits update an interactive preview, remain local until explicit Tina confirmation, use Git-backed JSON without a database, and export to source-structured LaTeX. Review of the supplied TeX found 13 paragraph groups, 75 aligned examples/translations, two inline footnotes, resource citations/list, and 42 active abbreviation entries; the full structured import/export is now in the build plan.
- The learner approved expanding the editor so a pasted copy of the supplied `gb4e` LaTeX can be previewed and imported into the text model. Slice 5 now covers this supported document structure; arbitrary TeX packages and unknown macros remain excluded.
- Slice 4 now includes the user-requested confirmed Tina save. Slice 8 remains responsible for the complete local-draft recovery flow and more robust publishing behavior after export.
- Slice 4 implementation adds an explicit confirmed Tina save for the text JSON and stores the canonical text under `content/texts/` so Tina's text collection does not overlap the dictionary collection. The landing and reader hide the legacy manuscript when it duplicates a canonical text title/slug; the duplicate source remains intact.
- Desktop gloss details now stay visible in a scrollable sticky sidebar during reading; mobile retains the bottom-sheet behavior.
- Implemented ahead of their checkboxes: the `gb4e` parser (`lib/gb4e.ts`, 75 examples/13 paragraphs/2 footnotes from the reference TeX, per-sentence `footnotes`), a paste-and-preview import panel in the editor, and browser-local drafts (`glossy-draft-v1:<slug>`, debounced, restore on load, "Discard changes"). Slices 5 and 6 stay unchecked until the full text is imported and the learner checks them in a browser; slice 7 (export) is not started.
- The "Save to TinaCMS" button no longer shows a `window.confirm` popup, at the learner's request: the save is already an explicit button press, the dirty label shows what is pending, and the result message states nothing is committed or pushed. Slice 8's richer pre-publish review remains optional.
- Removed `useTina` from the reader: it was never given a query, and its fresh `{}` props caused a "Maximum update depth exceeded" loop when the reader was opened inside Tina's admin. Visual editing in the Tina admin is not used; editing happens in `/edit/<slug>` or the Tina forms. Added a shared Glossy / Read / Edit nav and removed the duplicate `/texts/[slug]` route.
- Saving works only against a running Tina backend. Locally that is `npm run dev` (GraphQL on :4001, files written to the working tree, then commit and push by hand). A deployed static site would need Tina Cloud (hosted, Git-backed, free tier) or a self-hosted Tina backend before the button can write to GitHub; this is an open decision, not built.
