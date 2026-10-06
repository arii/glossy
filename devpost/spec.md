---
doc: spec
status: approved
---

# Glossy — Technical Spec

## How This Works, In Plain Language

Glossy is a local Next.js editing workbench and a separate reader. The supplied LaTeX manuscript is parsed into a JSON document for the reader and editor; the editor changes tokens and analyses while an interlinear preview updates immediately. Changes are autosaved to a text-scoped browser draft. The current Save action writes exported TeX and JSON through a local API, then attempts a Tina GraphQL update. Git commit/push remains separate.

The same structured text model exports to normalized LaTeX using the source's `gb4e`/`\gll`/`\glt` organization. No SQL database or paid runtime content service is required. Tina local writes modify repository files; Git commit/push remains a separate operation.

This spec distinguishes the current implementation from the target requirements. The remaining acceptance criteria and verification evidence are tracked in `checklist.md > Follow-up Requirements`; do not treat a target component description below as proof that it is implemented.

## The Core Journey Through the System

1. The editor opens a text at `/edit/<slug>` and selects an example/token.
2. The inspector edits source form, literal/readable gloss, translation, and available analysis while the interlinear preview and explanation panel update from the same draft state.
3. The target behavior is to restore only a valid, versioned localStorage draft after reload; the editor can continue or discard it. Current storage is unversioned.
4. The editor reviews the current draft and LaTeX export, then explicitly chooses Save.
5. The local API writes the exported TeX and JSON to disk; the editor makes a best-effort Tina GraphQL request afterward. This is not an atomic Tina publish flow, and the current UI does not report the optional Tina result.
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

Glossy runs as a local Node.js development process and opens in a desktop or mobile browser. `npm run dev` starts Next.js; the save API writes to the local working tree. The Tina GraphQL request uses `http://localhost:4001/graphql` by default and is optional in the current editor implementation. Remote TinaCloud publishing is not implemented.

Planned commands after the app is scaffolded:

```bash
npm install
npm run dev
```

Open `http://localhost:3000/read/<slug>` for the clean reader and `/edit/<slug>` for live gloss editing. The root route is a simple landing/route choice, not a combined reader/editor. Tina's administrative interface is at `/admin/index.html`. Current Save writes through the local API and makes a best-effort Tina request; the required Tina-confirmed write behavior is not yet complete. For the learner review, edit a token, observe the live preview, reload and recover the draft, inspect LaTeX export, test save success/failure, and open the separate reader.

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

### Landing Page & Text Directory
Lives on `/` (`app/page.tsx`, `components/text-directory.tsx`). Features an interactive 3-tier Leipzig glossing preview widget (`Ōhthere` · `sǣde` · `his hlāforde`), 3 capability feature pillars (Linguistic Precision, Live Visual Authoring, Dual-Write Persistence), a responsive multi-column corpus catalog with metadata badges (author, shelfmark, sentence/token counts, last edited), and direct actions (`Read`, `Edit`, `Cite`).

### Scholarly Attribution Modal
Lives in `components/attribution-modal.tsx`. Provides transparent provenance and scholarly credit for primary editors (Tyler Lemon 2026), educational inspirations (Peter S. Baker's *Old English Aerobics*), primary manuscript witnesses (*Cotton MS Tiberius B. i*, *Cotton MS Vitellius A. xv*), and 1-click citation generators in 4 academic styles:
1. **BibTeX** (`@misc{lemon2026ohthere, ...}`)
2. **Unified Linguistics Style Sheet** (LSA standard)
3. **APA 7th Edition**
4. **Chicago 17th Edition** (Notes & Bibliography)

### Scholarly Site Footer
Lives in `components/site-footer.tsx`. Persistent across all routes, anchoring the application with manuscript shelfmarks, methodology notes, quick navigation, attribution triggers, and copyright metadata.

### Corpus Ingestion Workspace
Lives on `/edit/new` (`app/edit/new/page.tsx`). Implements a frictionless onboarding flow:
- Loads with an empty default state so custom text is not accidentally overlaid on a preset.
- Provides a dedicated "Start Blank / Clear Form" button.
- Cleanly divides workflows into "✍️ Enter Custom Text" vs "⚡ Load Classic Preset" via top-level tabs.
- Supports clicking active preset buttons to toggle them off and reset the form.

### Documentation & Reference System
Lives on `/docs` (`app/docs/page.tsx`, `content/docs/architecture-faq.json`, `docs/ARCHITECTURE_AND_FAQ.md`). Features a segmented domain switcher (`All`, `Linguistic Guide`, `System Architecture`) with URL parameter synchronization (`?tab=linguistics`, `?tab=architecture`), grouped Table of Contents (`L1–L4` for Linguistics, `A1–A3` for Architecture), and the complete, verified 42 Leipzig abbreviation reference table.

### Draft Controller
Loads the canonical document, hydrates a slug-keyed `localStorage` draft, auto-saves with a debounce, offers explicit discard that clears the local draft, and automatically invalidates stale drafts if the underlying repository content has changed.

### Dual-Write Persistence API
Lives in `app/api/save-document/route.ts`. The Save action synchronously writes canonical structured JSON to `content/texts/<slug>.json` and compilable XeLaTeX `gb4e` markup to `references/<slug>.tex`, providing real-time visual status reporting in the editor UI.

### LaTeX Exporter
Serializes the current editor document into a downloadable normalized `.tex` file. It formats aligned surface/gloss lines, translations, sentence-ID-derived paragraph groupings, and sentence footnotes.

### LaTeX Paste Importer
Accepts pasted `gb4e` examples through `lib/gb4e.ts` and displays a parsed sentence preview; applying it appends sentences with aligned surface tokens and Leipzig glosses.

### Annotated Passage
Renders each passage block as an Old English line followed by a separate source-gloss line. Plain text remains ordinary text; annotated forms become keyboard-focusable buttons with stable gloss-record identifiers.

### Interlinear Gloss Line
Renders the readable source gloss for each annotated form in passage order on its own line. It stays separate from the Old English text, including when either line wraps on smaller screens.

### Gloss Trigger
Represents one annotated word or phrase. It responds to pointer hover on capable desktop devices, keyboard focus, and tap/click. It exposes a clear selected state and updates the page's selected record.

### Gloss Popup
Displays the selected record's available definition, conjugation or grammatical information, phonetic notation, historical context, pronunciation source, and Wiktionary link. It supports closing, replacement by another selection, outside-pointer dismissal, Escape, focus restoration, keyboard focus, and touch use.

### Typography and Linguistic Fields
Applies the font stack, whitespace, line height, italics, small caps or labels, and safe rendering of Unicode phonetic and grammatical notation.

### TinaCMS Content Management
Tina collections configured in `tina/config.ts` manage structured corpus texts and documentation pages. The Tina admin is accessible at `/admin/index.html`.

## Data Model

The model is file-backed and Git-versioned. Text JSON lives under `content/texts/`; dictionary JSON lives under `content/dictionary/` (singular), generated from the lexicon.

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

type ReadingSentence = {
  id: string
  exampleId?: string
  paragraphId?: string
  paragraphLabel?: string
  original: string
  gloss: string
  translation: string
  footnote?: string
  words: Array<{
    id: string
    surface: string
    sourceGlossTex: string
    sourceGloss: string
    punctuation?: string
    lexicalEntryId?: string
    review?: {
      status: "reviewed" | "source-verified" | "needs-review"
      sourceFile?: string
      notes?: string
    }
  }>
}

type TextDocument = {
  id: string
  slug: string
  title: string
  author?: string
  date?: string
  shelfmark?: string
  sentences: ReadingSentence[]
}
```

## File Structure

```text
glossy/
├── app/
│   ├── globals.css                # Responsive scholarly typography and layout tokens
│   ├── layout.tsx                 # Root document metadata and global shell
│   ├── page.tsx                   # Interactive landing page with Leipzig preview & corpus grid
│   ├── docs/page.tsx              # Segmented documentation domain switcher (Linguistics vs Architecture)
│   ├── read/[slug]/page.tsx       # Separate clean reading surface with 3-tier Leipzig alignment
│   ├── edit/[slug]/page.tsx       # Live gloss editing studio with token inspector & live preview
│   ├── edit/new/page.tsx          # Frictionless ingestion workflow (Blank vs Preset tabs)
│   ├── api/master-tex/route.ts    # Serves parsed master LaTeX source
│   └── api/save-document/route.ts # Dual-write persistence API (.tex & .json)
├── components/
│   ├── annotated-passage.tsx      # Passage/example rendering and gloss triggers
│   ├── attribution-modal.tsx      # Scholarly provenance & 4-style citation modal
│   ├── gloss-editor.tsx           # Live preview, token inspector, and editor controls
│   ├── gloss-popup.tsx            # Selected lexical explanation with grammar/morpheme chips
│   ├── reading-page.tsx           # Clean reading surface
│   ├── site-footer.tsx            # Persistent scholarly footer with shelfmarks & citation links
│   ├── site-nav.tsx               # Global navigation bar
│   └── text-directory.tsx         # Multi-column corpus grid with rich metadata badges
├── content/
│   ├── docs/architecture-faq.json # Structured FAQ and architecture content
│   ├── pages/home.json            # Landing page Tina-managed copy
│   ├── pages/ingest.json          # Ingest page Tina-managed copy
│   ├── texts/<slug>.json          # Parsed text metadata, sentences, and words
│   └── dictionary/<id>.json       # Generated lexical entries (singular directory)
├── data/
│   └── latex-export.ts            # Normalized gb4e document exporter
├── docs/
│   └── ARCHITECTURE_AND_FAQ.md    # Master documentation source
├── tina/
│   └── config.ts                  # Tina collection schema and admin configuration
├── lib/
│   ├── types.ts                   # Shared text, sentence, word, and doc types
│   ├── content.ts                 # File-backed text/dictionary loaders
│   ├── gb4e.ts                    # LaTeX gb4e parser
│   ├── lemmatizer.ts              # Curated form maps and rule-based auto-lemmatizer
│   └── old-english-lexicon.ts     # Curated lexical details and resolver
├── scripts/
│   ├── compile-tex-to-content.mjs # Build JSON from the supplied TeX manuscript
│   ├── compile-beowulf.mjs        # Build JSON for Beowulf prologue
│   ├── sync-dictionary.mjs        # Generate dictionary JSON from the lexicon
│   ├── validate-source.mjs        # Checks source alignment and parser output
│   ├── validate-lemmas.mjs        # Audits 100% lemma compliance across corpus
│   └── smoke-test.mjs             # Checks reader/editor/admin routes
├── devpost/                       # Hackathon planning and verification documents
├── references/                    # PDF, LaTeX, and bibliography source material
├── package.json                   # Scripts and dependencies
├── tsconfig.json                  # TypeScript configuration
└── next.config.ts                 # Next.js configuration and admin rewrites
```

## External Services and Dependencies

There are no runtime external services. The only external destination is the user's browser navigation to Wiktionary from a curated record.

- **Wiktionary link** — each record may contain a direct `https://en.wiktionary.org/wiki/...` URL. No API call or credential is used. The link opens as a normal external reference.
- **TinaCMS** — the admin is configured in `tina/config.ts`; the editor makes a best-effort local GraphQL update after its API writes files. The current file save does not depend on a successful Tina response.
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
- **A Tina save fails or partially succeeds** → show per-document results, retain the complete draft, and allow retry without claiming all-or-nothing rollback.
- **A lexical edit breaks a token lookup** → validate stable lexical IDs and references before publish and before reader rendering.
- **A segment's text and linked gloss record diverge** → runtime and source validation reject the mismatch before the text is served.
- **A source surface or TeX gloss was copied from another source entry** → source validation requires the pair to occur at the same aligned token position in one `\gll` entry.
- **An unknown reader/editor route is requested** → return not found for a slug that is not in the loaded text documents.
- **A new text is incomplete** → validate required metadata, duplicate IDs/slugs, and lexical/token references before rendering; add regression tests for a second text in the shared model.
- **An editor changes source text without checking the manuscript** → retain `sourceGlossTex`, `sourceFile`, review status, and locator fields; mark the record `needs-review` rather than silently claiming source correctness.

## What Was Simplified and Why

- **Git-backed JSON** instead of a SQL database — keeps corpus data portable, diffable, and versioned without recurring storage fees.
- **Local draft followed by explicit Tina write** — keeps keystrokes out of permanent repository content and makes publication an intentional action; Save itself is the confirmation, with no extra dialog.
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
- **Current implementation: local-first edit boundary** — React state is autosaved under a slug-keyed localStorage key; the Save action writes local files before attempting Tina. Draft schema validation and base-version checking are not implemented.
- **Target TeX fidelity boundary** — preserve source tokens, gloss literals, paragraph/example structure, translations, footnotes, resources, abbreviations, and bibliography settings; normalize formatting and exclude arbitrary TeX preamble/comments.
- **Learner choice: interactive editing** — gloss data and explanations are edited live rather than being static content revealed only by the reader.
- **Learner choice: source-traceable editing** — the editor exposes source text, gloss data, and review metadata; automated checks verify references and source alignment without claiming to prove linguistic interpretation.
- **Implementation decision: linguistic feature model** — the popup uses lemma, part of speech, explicit inflectional features, and morphemes instead of a universal `conjugation` field, because different parts of speech inflect differently.
- **Implementation decision: source traceability** — each record carries the source gloss and review metadata so future corrections can be checked against the LaTeX rather than silently normalizing away the source form.
- **Implementation decision derived from the PRD: typed local records** — a small explicit data shape makes every visible gloss field inspectable and keeps missing information honest.
- **Useful uncertainty clarified: “dynamic generation”** — it means dynamically revealing the selected static record, not generating linguistic analysis at runtime. This preserves the static-gloss POC and avoids an accuracy-critical language engine.
- **Open issue: full metadata fidelity** — import/export resources, citations, footnote positions, abbreviations, and bibliography data for the supplied document; see the follow-up checklist.
- **Open issue: scholarly font availability** — validate the chosen local fallback stack with representative IPA and Old English strings before finalizing the demo passage.
- **Open issue: Tina save result** — make Tina the confirmed JSON write path and report actual per-document outcomes; do not present local API file-write success as proof that Tina succeeded.
- **Implementation decision: no `useTina` in the reader** — the reader is plain server-loaded data; Tina visual editing is not used, which also removed a render loop inside the Tina admin.
- **Implementation decision: gb4e import** — `lib/gb4e.ts` parses `\ex{\gll … \glt …}` into sentences with footnotes; the editor previews counts/warnings and merges by sentence ID, keeping analysis for unchanged source forms.
