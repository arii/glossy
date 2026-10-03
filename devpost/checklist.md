---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Current Implementation Audit (2026-10-03)

The checkboxes below record the build-slice history; they do not certify that every behavior written in each slice is implemented or re-verified. Current state:

| Area | Current behavior | Remaining accuracy gap |
|---|---|---|
| Reader and editor | Separate `/read/<slug>` and `/edit/<slug>` routes; live preview and word inspector | Final accessibility/mobile review is still pending |
| Corpus | Build scripts parse the supplied TeX to JSON (75 examples across 13 paragraph groups) and sync dictionary JSON | The editor's paste-import flow only appends parsed sentences; it does not import all document metadata |
| Drafts | Debounced, slug-keyed `localStorage`; discard restores the saved snapshot | No schema version/base-version detection, discarded key cleanup, or reliable storage-error reporting |
| Save | `/api/save-document` writes exported TeX and JSON; client then attempts a best-effort Tina update | Current success state does not verify Tina's response; the planned Tina-only/per-document publish flow is not implemented |
| LaTeX | Parser and normalized download are present | Export does not round-trip all source resources, abbreviations, bibliography settings, or arbitrary TeX |
| Verification | `validate:source`, `typecheck`, `lint`, and `test:smoke` scripts exist | No dedicated parser/export round-trip test is listed here; final hands-on review remains open |

For the verified current code structure and remaining work, see `../plan.md`. Items in the slices below that promise more than this audit describes are unmet acceptance criteria, even where a historical checkbox is checked.

## Follow-up Requirements

These are the concrete follow-ups from the implementation audit. They remain unchecked until their acceptance criteria are implemented and verified. Product requirements are defined in `prd.md`; technical boundaries are in `spec.md`.

- [ ] **Make Save report the actual persistence result.** Keep the Save button as the deliberate user action (no additional confirmation dialog). Route canonical JSON writes through Tina as specified; do not write canonical JSON or overwrite the source manuscript as a hidden Save side effect. Keep LaTeX download separate. Surface transport, GraphQL, and per-document errors; preserve the local draft on any failure; report success only for confirmed writes; never imply Git commit/push. Verify successful save, unavailable Tina, GraphQL errors, and partial multi-document writes.
- [ ] **Complete safe draft recovery.** Store a schema version, text ID, and canonical base version with each draft. Validate the payload before restore; detect stale-base conflicts without overwriting canonical content; surface quota/disabled-storage errors while retaining in-memory edits; after confirmed discard remove the draft key and verify it stays discarded after reload. Verify edit/reload/recover, invalid draft, stale base, storage failure, discard, and unchanged reader content.
- [ ] **Import the supplied manuscript structure in preview-first flow.** Parse 13 paragraph groups and 75 examples with stable order/labels, aligned surface and literal TeX glosses, translations, inline footnotes at their original positions, source/resource citations, the resource list, active abbreviations, title/author/date, and bibliography reference. Preview the complete result before the user accepts it; malformed or unsupported input must identify the issue and leave the current document/draft unchanged. Do not claim arbitrary TeX package or macro support.
- [ ] **Export supported structure from the current draft.** Preserve and escape the supported document metadata, paragraph/example grouping, aligned tokens, translations, footnotes, resources/citations, abbreviations, and bibliography configuration. Keep export independent of Save. Test parsed-source → model → export invariants for all 13 groups/75 examples and document metadata; compile the generated file with XeLaTeX when available. Describe it as normalized export, not byte-for-byte TeX round-tripping.
- [ ] **Add focused regression coverage.** Add automated checks for parser alignment/warnings, footnote/resource/abbreviation parsing, importer non-destructive failure, stable IDs, draft recovery/conflicts/storage errors, export invariants, and Save success/failure behavior. Integrate the checks into npm scripts and CI/build verification where configured; do not treat route smoke tests or typechecking as substitutes.
- [ ] **Make linguistic-review status honest.** Keep transcription/source alignment review distinct from lemma/POS/definition review. Update the standalone lemma validator to avoid absolute accuracy claims, identify heuristic/unreviewed output, add a discoverable `npm run validate:lemmas` command, and review unresolved/high-risk lexicon entries against cited sources before labeling linguistic analysis reviewed. Test representative irregular forms and Wiktionary URLs.
- [ ] **Verify reader behavior and finish the learner review.** Exercise desktop and mobile layouts, keyboard focus, touch, outside dismissal, Escape, close control, focus restoration, popup visibility while scrolling, and Old English/IPA glyph rendering. Record only behaviors actually verified; complete the final review, demo, and app-map learning tasks below.

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
  Becomes usable: Pressing Save is the deliberate confirmation action; the editor previews which text/lexical documents will change and writes them to repository-backed Tina content only after that action. Failures retain the draft and report document-level results.
  Why now: This is the final controlled boundary from private browser state to permanent Git-backed source files, after the editor can already review and export the draft.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Editing Workspace`, `prd.md > Live Gloss Editing, Drafts, and Export`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Save and Tina Integration`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Use Tina GraphQL create/update operations for the confirmed text and changed lexical entries; do not write source/JSON files ahead of Tina success. Verify mutation results, retain retryable drafts on partial failure, and distinguish working-tree writes from Git commit/push. No extra confirmation dialog is required beyond the Save action.
  Verify (mechanical): Run `npm run dev`, then `npm run test:smoke`; exercise an unconfirmed draft (no file changes), confirm publish (expected JSON changes), and induce/verify a reported failed write without draft loss.
  Learner check: Edit and export a gloss, verify the reader/source files are unchanged before confirmation, then confirm and inspect the Tina content/worktree for the saved update; confirm the editor does not claim it committed or pushed Git.
  Commit: `Publish confirmed drafts through Tina`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1, inspect the reading surface and typography before interaction work; learner reported inconsistent glyph sizing and missing interactions, which shaped slice 2.
- [x] New editor workflow explored — after slice 4, try editing a token against the live preview before the remaining data/persistence work is built.
- [ ] Final kick-the-tires exploration and feedback completed — after follow-up requirements are implemented, test editor, draft recovery, Tina save, LaTeX export, and the separate reader.

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

- Audit update: earlier revision notes below describe intended or earlier implementation states. The current save API writes both TeX and JSON before making an optional Tina request; that request is not currently required for success or reported independently. The current draft key is `glossy_draft_<slug>` and is not versioned. Paste import appends parsed sentences, and export does not preserve all resources, abbreviations, or bibliography data. Follow-up acceptance criteria are listed above.
- The initial gloss record used a generic `conjugation` field and a shortened paraphrase of the source text. It was replaced with source-faithful surface tokens, source glosses, lemma/part-of-speech/inflection features, morphemes, and review metadata.
- The learner requested the source gloss on its own line below the Old English line, while retaining the expanded hover/click/tap panel; the final slice now implements that two-level reading layout.
- The learner reported Tina's text route returned 404 and the editor was not convenient for changing hover-panel values. The initial implementation added a preview route, reader-to-editor link, human-readable form/list labels, and source/reference validation; the new revision removes editor navigation from the reader and replaces this path with a dedicated live-editing route.
- Browser speech playback was removed at the learner's request because it mispronounces Old English; reliable audible pronunciation remains deferred.
- Architectural revision: Restored the English translation sentence alongside the interlinear reading text; separated the student-facing reading visualizer from the authoring/editing tools so the reader is clean and focused, with TinaCMS editor access cleanly situated at `/admin` and in unobtrusive footer utility navigation.
- The learner revised the product direction toward live gloss editing: the reader and editor are separate pages; edits update an interactive preview, use Git-backed JSON without a database, and export to normalized LaTeX. Earlier plans included full metadata import/export, but the current implementation audit identifies that as incomplete.
- The learner approved expanding the editor so a pasted copy of the supplied `gb4e` LaTeX can be previewed and imported into the text model. Slice 5 now covers this supported document structure; arbitrary TeX packages and unknown macros remain excluded.
- Earlier slice 4 notes described a Tina-only save path. The current save API writes TeX and JSON locally and then attempts an optional Tina update; the intended Tina publish acceptance criterion remains incomplete.
- The generated text is stored under `content/texts/`; dictionary entries are generated under `content/dictionary/`. This does not mean document resources, abbreviations, and bibliography metadata are currently represented in the editor.
- Desktop gloss details now stay visible in a scrollable sticky sidebar during reading; mobile retains the bottom-sheet behavior.
- Earlier notes cited the key `glossy-draft-v1:<slug>` and described export as not started. Current code uses `glossy_draft_<slug>` without schema-versioning; normalized `.tex` download exists, but full metadata round-trip is not implemented.
- The "Save to TinaCMS" button does not show a separate confirmation popup; the button itself is the explicit user action. Current implementation writes TeX/JSON first and only then attempts Tina, so the Tina publishing acceptance criteria remain unchecked.
- Removed `useTina` from the reader: it was never given a query, and its fresh `{}` props caused a "Maximum update depth exceeded" loop when the reader was opened inside Tina's admin. Visual editing in the Tina admin is not used; editing happens in `/edit/<slug>` or the Tina forms. Added a shared Glossy / Read / Edit nav and removed the duplicate `/texts/[slug]` route.
- Earlier note: the Tina save path depended on the local GraphQL backend. Current implementation writes TeX and JSON through the local Next.js API even if Tina is unavailable, then attempts an optional GraphQL update. Neither path commits or pushes Git; deployment behavior has not been established.
