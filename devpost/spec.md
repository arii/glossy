---
doc: spec
status: approved
---

# Glossy — Technical Spec

## How This Works, In Plain Language

Glossy is a local-first Next.js editing workbench and a separate reader. A source-backed text lives in versioned JSON files, and the editor changes its examples, aligned tokens, and linguistic explanations while an interlinear preview updates immediately. Unpublished changes are stored in a text-scoped browser draft; only an explicit publish confirmation writes them through TinaCMS to the Git working tree. The separate reader renders published content with linked hover/focus/tap explanations.

The same structured text model exports to normalized LaTeX using the source's `gb4e`/`\gll`/`\glt` organization. No SQL database or paid runtime content service is required. Tina local writes modify repository files; Git commit/push remains a separate operation.

## The Core Journey Through the System

1. The editor opens a text at `/edit/<slug>` and selects an example/token.
2. The inspector edits source form, literal/readable gloss, translation, and available analysis while the interlinear preview and explanation panel update from the same draft state.
3. A versioned localStorage draft is restored after reload; the editor can continue or discard it.
4. The editor reviews the current draft and LaTeX export, then explicitly confirms writing it through TinaCMS.
5. Tina local GraphQL updates the relevant JSON document(s) in the Git working tree; publishing errors retain the draft and identify affected documents.
6. The editor downloads a `.tex` export from either a draft or published content without implicitly publishing it.
7. A reader opens `/read/<slug>`; no editor controls appear on that page. Hover/focus/tap opens the linked lexical explanation.

PRD refs: `prd.md > The Core Journey`, `prd.md > Reading and Visual Glossing`.

## Stack

- **TypeScript** — typed passage and gloss data and safer component contracts. Docs: https://www.typescriptlang.org/docs/
- **Next.js** — the requested web framework and local browser runtime. Docs: https://nextjs.org/docs
- **React** — interactive components and the selected-gloss state. Docs: https://react.dev/
- **TinaCMS** — visual and headless editing for versioned passage JSON. Docs: https://tina.io/docs/
- **TinaCMS CLI** — local admin/editor development and static admin build. Docs: https://tina.io/docs/tinacms-cli/
- **CSS Modules or component stylesheet** — responsive layout, popup positioning, focus styles, and scholarly typography without adding a UI framework. Docs: https://nextjs.org/docs/app/building-your-application/styling
- **Unicode text with a scholarly font fallback stack** — static IPA, Old English characters, accents, combining diacritics, and conjugation syntax are stored accurately and rendered directly. Unicode reference: https://www.unicode.org/standard/standard.html

No phonetic-generation library is required for this POC. The source already supplies curated linguistic information, and runtime generation would add accuracy and dependency risk without proving the visual-gloss kernel. TinaCMS edits the curated values but does not replace source checking. The build must validate representative strings from the LaTeX source in the target browser.

## Where It Runs and How Someone Tries It

Glossy runs as a local Node.js development process and opens in a desktop or mobile browser. TinaCMS local editing runs alongside Next.js; local draft editing, reader routes, LaTeX export, and confirmed writes to the local Git working tree require no TinaCloud account or paid service. Remote TinaCloud publishing is optional and outside this local POC.

Planned commands after the app is scaffolded:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/read/<slug>` for the clean reader and `/edit/<slug>` for live gloss editing. The root route is a simple landing/route choice, not a combined reader/editor. Tina's administrative interface is at `/admin/index.html`; the editor's explicit publish action uses the local Tina GraphQL API started by `npm run dev`. A document preview uses `/texts/<slug>` as a reader alias. For the demo, edit a token, observe the live preview, reload and recover the local draft, inspect the LaTeX export, confirm a Tina save, then open the separate reader.

## Look and Feel

Implement `prd.md > Look and Feel` as a focused scholarly reading surface:

- Keep the Old English passage visually primary and avoid generic dashboard styling.
- Use a readable serif font stack with support for Old English characters, IPA, and combining diacritics, preferring locally available scholarly fonts such as `Charis SIL`, `Doulos SIL`, or `Noto Serif` before a broad serif fallback.
- Preserve source text accents such as `Ō`, `þ`, `ð`, `ċ`, `ġ`, and macrons exactly.
- Display each passage block in reading order: Old English line, separate source-gloss line, then translation.
- Keep gloss triggers on the Old English line; the separate gloss line is readable text, not a second set of competing triggers.
- Give annotated words a subtle, consistent affordance and a strong selected state.
- Keep the popup compact, readable, keyboard-focusable, and positioned so it does not cover the selected word or make nearby text impossible to read.
- Treat the popup as a non-modal region: support outside-pointer dismissal, Escape, close-button dismissal, and focus restoration to the opening trigger without trapping focus away from the reading text.
- Use responsive spacing and popup layout for desktop and touch-width screens.
- Label linguistic fields clearly: definition, grammar/conjugation, pronunciation, historical note, and external reference.

Reference: `scope.md > Inspiration & Identity`, especially the annotated PDF and Old English Aerobics inspiration.

## Components

### Reading Page

Owns the separate reading route's page heading, source attribution, passage content, and selected gloss state. It contains no editing footer or CMS controls.

PRD ref: `prd.md > Screens and Layout`.

### Gloss Editing Workspace

Lives on `/edit/<slug>` and owns the selected example/token, text-scoped draft, editor inspector, and live interlinear preview. It can navigate to the separate reader but does not render as part of the reader page.

### Draft Controller

Loads the canonical document, validates and hydrates a versioned localStorage draft, saves changes with a debounce, offers explicit discard, and tracks pending text/lexicon writes. Local storage errors and invalid drafts are surfaced; canonical files are never silently substituted or overwritten.

### Confirmed Tina Publisher

After an explicit review/confirmation, submits only changed documents to Tina's GraphQL `updateDocument`/`createDocument` mutations. It reports per-document results. Multiple documents are not assumed to be atomic; failed writes keep the draft and permit idempotent retry. A successful local Tina write means the repository working tree changed, not that Git committed or pushed it.

### LaTeX Exporter

Serializes the current draft or published text into a downloadable `.tex` file. It formats aligned surface/gloss lines, translations, paragraph/example groupings, footnotes, resources/citations, abbreviation lists, metadata, and bibliography configuration through a defined template. Export is independent from publishing.

### Annotated Passage

Renders each passage block as an Old English line followed by a separate source-gloss line. Plain text remains ordinary text; annotated forms become keyboard-focusable buttons with stable gloss-record identifiers.

### Interlinear Gloss Line

Renders the readable source gloss for each annotated form in passage order on its own line. It stays separate from the Old English text, including when either line wraps on smaller screens.

PRD ref: `prd.md > Reading and Visual Glossing`.

PRD ref: `prd.md > Reading and Visual Glossing`.

### Gloss Trigger

Represents one annotated word or phrase. It responds to pointer hover on capable desktop devices, keyboard focus, and tap/click. It exposes a clear selected state and updates the page's selected record.

PRD ref: `prd.md > Reading and Visual Glossing`.

### Gloss Popup

Displays the selected record's available definition, conjugation or grammatical information, phonetic notation, historical context, pronunciation source, and Wiktionary link. It must not render empty invented values; absent optional fields are omitted. It supports closing, replacement by another selection, outside-pointer dismissal, Escape, focus restoration, keyboard focus, and touch use. It is a non-modal region, so focus is not trapped inside it.

PRD ref: `prd.md > States and Boundaries`.

### Typography and Linguistic Fields

Applies the font stack, whitespace, line height, italics, small caps or labels, and safe rendering of Unicode phonetic and grammatical notation.

PRD ref: `prd.md > Look and Feel`, `prd.md > Reading and Visual Glossing`.

### TinaCMS Content Editor

Provides the permanent write path for complete Git-backed text and lexical JSON documents. The Glossy editor is the live authoring UI; Tina's admin remains available for direct repository-backed document maintenance. Collection schemas match the typed model and keep stable IDs, source literals, and nested arrays editable.

PRD ref: `prd.md > Reading and Visual Glossing`, `prd.md > Understanding the Source`.

## Data Model

The model is text-agnostic and file-backed. Each text is a Tina JSON document under `content/texts/`; reusable lexical entries are separate JSON documents under `content/dictionaries/`. There is no relational database. One publish operation may update a text and one or more changed lexical documents; because Tina mutations may commit separately, the draft controller tracks individual results and preserves retry data. The exact TeX source literal remains separate from its human-readable display gloss.

```ts
type InflectionFeatures = {
  case?: "nominative" | "accusative" | "genitive" | "dative"
  number?: "singular" | "plural"
  gender?: "masculine" | "feminine" | "neuter"
  person?: 1 | 2 | 3
  tense?: "present" | "past"
  mood?: "indicative" | "subjunctive" | "imperative" | "infinitive"
  degree?: "positive" | "comparative" | "superlative"
}

type Morpheme = {
  form: string
  gloss: string
  kind?: "stem" | "prefix" | "suffix" | "ending"
}

type CorpusDocument = {
  schemaVersion: 1
  meta: {
    id: string; slug: string; title: string; author?: string; date?: string
    language: string; sourceFile: string; sourceEdition?: string; bibResource?: string
    resources: Resource[]; abbreviations: Abbreviation[]
  }
  paragraphs: Array<{
    id: string; label?: string
    examples: Array<{
      id: string; tokens: Token[]; freeTranslation: TranslationPart[]
    }>
  }>
}

type Token = {
  id: string; surface: string; sourceGlossTex: string; sourceGloss: string
  punctuation?: string; lexicalEntryId?: string; review?: ReviewMetadata
}

type LexicalEntry = {
  id: string; lemma: string; language: string; partOfSpeech?: string
  features?: InflectionFeatures; morphemes?: Morpheme[]
  definition?: string; phonetic?: string; notes?: string; wiktionaryUrl?: string
}

type TranslationPart =
  | { type: "text"; value: string; sourceTex?: string }
  | { type: "footnote"; id: string; content: TranslationPart[] }

type ResourcePart =
  | { type: "text"; value: string }
  | { type: "citation"; key: string; display?: string }
  | { type: "link"; href: string; label: string }

type Resource = { id: string; parts: ResourcePart[] }
type Abbreviation = { id: string; tag: string; expansion: string; operator: "=" | "-"; active: boolean }

type GlossyDraft = {
  schemaVersion: 1; textId: string; baseVersion: string
  document: CorpusDocument; changedLexicalEntries: LexicalEntry[]
}
```

`surface` and `sourceGlossTex` preserve the aligned source token pair; `sourceGloss` is the reader-friendly display. Paragraph/example arrays preserve source order and `label` maps to the original exercise grouping. Translation parts retain inline footnote positions. Lexical entries are reused by stable IDs, while token surface/gloss remain text-specific. Browser drafts are schema-versioned and keyed by text ID; `baseVersion` detects a draft based on older canonical content. The editor never claims automatic linguistic certification.

The imported source is `references/Voyages_of_Ohthere_Wulfstan.tex`: 13 labeled paragraph groups, 75 aligned `\gll` examples and 75 `\glt` translations. The document also has two inline footnotes, seven resource list items with citations/links, 42 active abbreviation entries, and a bibliography resource. Validation checks every imported surface/gloss token pair in sequence, text/example IDs and ordering, footnote placement, and document-level content. The export is structurally faithful through a normalized template; comments, arbitrary preamble macros, and byte-for-byte whitespace are not promised.

## File Structure

```text
glossy/
├── app/
│   ├── globals.css              # Responsive scholarly typography and layout tokens
│   ├── layout.tsx               # Root document metadata and global shell
│   ├── page.tsx                 # Reader/editor route choice
│   ├── read/[slug]/page.tsx     # Separate clean reader
│   ├── edit/[slug]/page.tsx     # Live gloss editing workspace
│   └── texts/[slug]/page.tsx    # Reader preview alias
├── components/
│   ├── annotated-passage.tsx    # Passage/example rendering and gloss triggers
│   ├── gloss-popup.tsx          # Selected lexical explanation
│   ├── reading-page.tsx         # Clean reading surface
│   ├── gloss-editor.tsx         # Live preview and token inspector
│   └── draft-status.tsx         # Local draft/publish state
├── data/
│   └── latex-export.ts          # Normalized gb4e document exporter
├── content/
│   ├── texts/<slug>.json        # Text metadata, paragraphs, examples and token links
│   └── dictionaries/<id>.json   # Reusable lexical entries
├── tina/
│   └── config.ts                # Tina collection schema and local admin configuration
├── lib/
│   ├── types.ts                 # Shared corpus/token/lexicon types
│   └── draft-storage.ts         # Versioned local draft persistence
├── scripts/
│   ├── import-latex.mjs         # One-time structured import of the supplied TeX text
│   └── validate-source.mjs      # Checks corpus alignment and export invariants
├── public/                      # Only local static assets if the build needs them
├── devpost/                     # Approved learning and planning documents
├── references/                  # Existing PDF, LaTeX, and bibliography source material
├── package.json                 # Scripts and dependencies
├── tsconfig.json                # TypeScript configuration
└── next.config.*                # Next.js configuration if scaffolded
```

## External Services and Dependencies

There are no runtime external services. The only external destination is the user's browser navigation to Wiktionary from a curated record.

- **Wiktionary link** — each record may contain a direct `https://en.wiktionary.org/wiki/...` URL. No API call or credential is used. The link opens as a normal external reference.
- **TinaCMS** — local editing and confirmed writes use `tinacms dev -c "next dev"` and the schema in `tina/config.ts`; local GraphQL saves update repository files. TinaCloud is optional and not required for the local POC.
- **Pronunciation references** — IPA is curated from Old English lexical/inflection entries and general Old English phonology references; it is displayed as notation only, not synthesized audio.
- **Morpheme emphasis** — records with multiple morphemes receive a stronger passage affordance and segmented popup chips; simple one-morpheme glosses remain visually lighter.
- **Fonts** — the first implementation should use a local CSS fallback stack so the demo works offline. If a packaged or hosted scholarly font is later chosen, verify licensing, loading behavior, and offline fallback before adding it.

## Important Failure Modes

- **A gloss record is missing** → the passage segment remains readable text and no popup is opened.
- **Optional field is unavailable** → omit that field from the popup rather than displaying invented or misleading content.
- **A glyph or combining mark renders poorly** → preserve the source Unicode, show a safe serif fallback, and validate representative strings early in the build before transcribing the full demo passage.
- **Popup would leave the viewport** → reposition or constrain it within the reading surface; on narrow screens, use a readable anchored panel that does not hide the selected text.
- **A draft is malformed or based on old content** → validate schema version and base version; report invalid/conflicting drafts and keep canonical repository data unchanged.
- **Local storage is unavailable or full** → report the persistence error; keep the current in-memory edit visible and warn that it is not recoverable after leaving.
- **A confirmed Tina save partially fails** → show per-document results, retain the complete draft, and allow retry without claiming all-or-nothing rollback.
- **A lexical edit breaks a token lookup** → validate stable lexical IDs and references before publish and before reader rendering.
- **A segment's text and linked gloss record diverge** → runtime and source validation reject the mismatch before the text is served.
- **A source surface or TeX gloss was copied from another source entry** → source validation requires the pair to occur at the same aligned token position in one `\gll` entry.
- **A Tina document preview route is missing** → the generated `/texts/<slug>` route renders the matching text or returns not found for an unknown document.
- **A new text is incomplete** → the loader checks required metadata, duplicate slugs, and every `gloss` segment reference before rendering.
- **An editor changes source text without checking the manuscript** → retain `sourceGlossTex`, `sourceFile`, review status, and locator fields; mark the record `needs-review` rather than silently claiming source correctness.

## What Was Simplified and Why

- **Git-backed JSON** instead of a SQL database — keeps corpus data portable, diffable, and versioned without recurring storage fees.
- **Local draft followed by explicit Tina write** — keeps keystrokes out of permanent repository content and makes publication an intentional action.
- **Dedicated editor and reader routes** — keeps authoring tools separate from the student-facing visualizer.
- **Normalized LaTeX export** — preserves the supported `gb4e` structure and content without promising byte-for-byte recreation of comments or arbitrary macros.
- **Interlinear source gloss line plus one expanded panel** — preserves the source's line-by-line reading structure while keeping detailed explanations on demand.
- **Curated phonetic and conjugation records** instead of runtime linguistic generation — protects accuracy and keeps the POC aligned with the approved static-gloss boundary.
- **No browser speech synthesis** — current voices mispronounce Old English; audio remains deferred until a reliable source is available.
- **Accessibility light dismiss** — the gloss is a non-modal region with outside-pointer dismissal and focus restoration, preserving access to the reading surface while it is open.
- **Deferred passage audio** — passage read-aloud is intentionally hidden until the project can use recorded readings or an IPA-compatible backend rather than a poor browser approximation.
- **File-backed text library** instead of a database — each complete text is portable, reviewable in Git, and automatically available to the reader and Tina collection when added under `content/`.
- **One expanded detail panel** instead of multiple simultaneous panels — keeps the reading surface legible while source glosses remain visible on their own line.
- **Local browser demo** instead of deployment — the required submission video and repository do not require a hosted URL.

## Decisions and Open Issues

- **Learner choice: local-first runtime** — enough for the current proof of concept; it avoids services and keeps the demo easy to run.
- **Implementation decision: Git file boundary** — each text is one complete nested JSON document; reusable lexical entries are separate documents linked by stable IDs.
- **Implementation decision: local-first edit boundary** — React draft state and versioned localStorage are the only write destinations before confirmation; Tina mutations happen only after an explicit user action.
- **Implementation decision: TeX fidelity boundary** — preserve source tokens, gloss literals, paragraph/example structure, translations, footnotes, resources, abbreviations, and bibliography settings; normalize formatting and exclude arbitrary TeX preamble/comments.
- **Learner choice: interactive editing** — gloss data and explanations are edited live rather than being static content revealed only by the reader.
- **Learner choice: source-traceable editing** — the editor exposes source text, gloss data, and review metadata; automated checks verify references and source alignment without claiming to prove linguistic interpretation.
- **Implementation decision: linguistic feature model** — the popup uses lemma, part of speech, explicit inflectional features, and morphemes instead of a universal `conjugation` field, because different parts of speech inflect differently.
- **Implementation decision: source traceability** — each record carries the source gloss and review metadata so future corrections can be checked against the LaTeX rather than silently normalizing away the source form.
- **Implementation decision derived from the PRD: typed local records** — a small explicit data shape makes every visible gloss field inspectable and keeps missing information honest.
- **Useful uncertainty clarified: “dynamic generation”** — it means dynamically revealing the selected static record, not generating linguistic analysis at runtime. This preserves the static-gloss POC and avoids an accuracy-critical language engine.
- **Open issue: exact popup dismissal and positioning** — implement and verify with desktop hover, keyboard focus, mobile tap, click-away, and narrow viewport checks during the build.
- **Open issue: scholarly font availability** — validate the chosen local fallback stack with representative IPA and Old English strings before finalizing the demo passage.
- **Open issue: confirmed Tina mutations** — verify the exact local GraphQL `createDocument`/`updateDocument` mutation inputs and multi-document failure behavior before wiring publish; local saves must never claim to commit or push Git.
