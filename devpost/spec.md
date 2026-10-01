---
doc: spec
status: approved
---

# Glossy — Technical Spec

## How This Works, In Plain Language

Glossy is a small Next.js website that runs locally in a browser. The page discovers complete Old English text documents from `content/`; each document contains ordered reading blocks and linked gloss records. The reader sees the source text on one line and its glosses on a separate line below. Hovering, focusing, or tapping an annotated source form opens its expanded detail panel.

TinaCMS provides labeled forms over versioned repository JSON, so editors can revise texts and individual gloss records without hand-editing JSON. TinaCloud credentials are optional for local editing and required for remote publishing. Phonetic and grammatical information is curated in advance rather than generated at runtime.

## The Core Journey Through the System

1. The reader starts the local Next.js development server and opens the browser page.
2. The route renders the reading surface from the curated passage data.
3. The passage renderer outputs Old English Unicode characters, diacritics, and annotated word spans.
4. The reader sees the corresponding source glosses on a distinct line beneath the Old English line.
5. The reader hovers over or focuses an annotated span on desktop, or taps it on mobile.
6. The selected span's stable ID looks up the expanded details, including available definition, inflection, morphemes, IPA, historical context, and Wiktionary link.
7. Selecting another span updates the expanded panel. Closing it or clicking away returns the reader to the interlinear reading state.

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

Glossy runs as a local Node.js development process and opens in a desktop or mobile browser. TinaCMS local editing runs alongside Next.js; TinaCloud credentials are optional for remote branch-backed content. No credentials are required for the reading page itself.

Planned commands after the app is scaffolded:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` for the reader. Use the **Edit text and glosses** link or `http://localhost:3000/admin/index.html` to open TinaCMS. A document preview uses `/texts/<slug>` and displays the same reader for that text. For the required demo recording, show the Old English line, its separate gloss line, open expanded details with hover or tap, and repeat in a narrow viewport.

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

Owns the single reading surface, page heading, source attribution, passage content, and selected gloss state.

PRD ref: `prd.md > Screens and Layout`.

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

Provides labeled form fields for all complete text documents in `content/`. Editors can create a text and revise its ordered passage blocks, exact source forms, readable and literal TeX glosses, one or more morphemes, inflection features, definitions, IPA, and source-review metadata. List entries display human-readable labels; stable IDs and source-verification rules are explained in the editor.

PRD ref: `prd.md > Reading and Visual Glossing`, `prd.md > Understanding the Source`.

## Data Model

The model supports one or many TinaCMS-editable JSON documents with typed structures that distinguish the text being read from the linguistic analysis attached to it. A complete text can contain as many reading blocks and gloss records as needed, while a new text is added by creating another JSON document in `content/`. Every word in the current source entries can have a record, including simple one-morpheme glosses such as `on → in` and `his → 3sg.m.gen`. This avoids treating every word as if it had a verb conjugation: verbs have tense/mood/person/number, while nouns have case/number/gender and adjectives or adverbs may have degree.

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

type GlossRecord = {
  id: string
  surface: string
  sourceGloss: string
  sourceGlossTex: string
  analysis: {
    lemma: string
    partOfSpeech: PartOfSpeech
    features: InflectionFeatures
    morphemes: Morpheme[]
    definition: string
    phonetic?: string
    pronunciationSource?: string
    historicalNote?: string
    wiktionaryUrl?: string
  }
  review: {
    status: "source-checked" | "needs-review"
    source: { file: string; locator: string }
    notes?: string
  }
}
```

`surface` preserves exactly what appears in the source text, including morpheme boundaries and diacritics. `sourceGlossTex` preserves the manuscript's literal `\textsc{...}` markup, while `sourceGloss` is the readable form shown on the separate gloss line. `analysis.morphemes` contains one item for simple lexical/grammatical glosses and multiple items where the source exposes internal morphology. `analysis` stores normalized linguistic metadata for display and review, while `review.source` identifies the manuscript entry and `review.status` says only that the transcription was checked against that source—not that the linguistic analysis is authoritative.

The source is the LaTeX/PDF reference material. The current passage uses the first three `\gll`/`\glt` entries from `references/Voyages_of_Ohthere_Wulfstan.tex`; the source file and entry context are recorded in each review record. `npm run validate:source` checks unique identifiers, segment-to-record form consistency, and that each source surface and literal TeX gloss occur together in one aligned manuscript gloss entry. The Tina schema requires the document structure and provides labeled forms; runtime loading rejects duplicate IDs, missing references, and source-form mismatches. Selecting a segment changes only in-memory UI state; content edits persist through versioned JSON and the Tina workflow.

## File Structure

```text
glossy/
├── app/
│   ├── globals.css              # Responsive scholarly typography and layout tokens
│   ├── layout.tsx               # Root document metadata and global shell
│   ├── page.tsx                 # Glossy reading page
│   └── texts/[slug]/page.tsx    # Tina document preview route
├── components/
│   ├── annotated-passage.tsx    # Passage segments and interactive gloss triggers
│   ├── gloss-popup.tsx          # Selected gloss content and external link
│   ├── reading-page.tsx         # Reading surface and selected-record coordination
├── data/
│   └── ohthere.ts               # Typed adapters for text documents and gloss lookup
├── content/
│   └── ohthere.json             # TinaCMS-editable passage, segments, and gloss records
├── tina/
│   └── config.ts                # Tina collection schema and local admin configuration
├── lib/
│   └── types.ts                 # Shared Passage, PassageSegment, and GlossRecord types
├── scripts/
│   └── validate-source.mjs      # Checks every content document and source-backed record
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
- **TinaCMS** — local editing uses `tinacms dev -c "next dev"` and the schema in `tina/config.ts`; local admin validation uses `npm run build:tina`. Cloud publishing uses `npm run build:tina:cloud` with `NEXT_PUBLIC_TINA_CLIENT_ID`, `TINA_TOKEN`, and `TINA_BRANCH`.
- **Pronunciation references** — IPA is curated from Old English lexical/inflection entries and general Old English phonology references; it is displayed as notation only, not synthesized audio.
- **Morpheme emphasis** — records with multiple morphemes receive a stronger passage affordance and segmented popup chips; simple one-morpheme glosses remain visually lighter.
- **Fonts** — the first implementation should use a local CSS fallback stack so the demo works offline. If a packaged or hosted scholarly font is later chosen, verify licensing, loading behavior, and offline fallback before adding it.

## Important Failure Modes

- **A gloss record is missing** → the passage segment remains readable text and no popup is opened.
- **Optional field is unavailable** → omit that field from the popup rather than displaying invented or misleading content.
- **A glyph or combining mark renders poorly** → preserve the source Unicode, show a safe serif fallback, and validate representative strings early in the build before transcribing the full demo passage.
- **Popup would leave the viewport** → reposition or constrain it within the reading surface; on narrow screens, use a readable anchored panel that does not hide the selected text.
- **A CMS edit breaks a segment lookup** → stable `glossRecords[].id` values are required, and source validation plus type checking must run before publishing.
- **A segment's text and linked gloss record diverge** → runtime and source validation reject the mismatch before the text is served.
- **A source surface or TeX gloss was copied from another source entry** → source validation requires the pair to occur at the same aligned token position in one `\gll` entry.
- **A Tina document preview route is missing** → the generated `/texts/<slug>` route renders the matching text or returns not found for an unknown document.
- **A new text is incomplete** → the loader checks required metadata, duplicate slugs, and every `gloss` segment reference before rendering.
- **An editor changes source text without checking the manuscript** → retain `sourceGlossTex`, `sourceFile`, review status, and locator fields; mark the record `needs-review` rather than silently claiming source correctness.

## What Was Simplified and Why

- **TinaCMS-backed JSON with labeled forms** instead of a database or bespoke editor — keeps content versioned and inspectable without requiring routine raw JSON edits.
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
- **Implementation decision: TinaCMS content boundary** — the editable boundary is one JSON document per complete text; React components consume typed adapters and do not own linguistic content.
- **Learner choice: static setup for linguistic data** — the source-backed phonetic and conjugation records are prepared ahead of time, while their display is interactive.
- **Learner choice: source-traceable editing** — TinaCMS forms expose source text, gloss data, and review metadata; automated checks verify references and source alignment without claiming to prove linguistic interpretation.
- **Implementation decision: linguistic feature model** — the popup uses lemma, part of speech, explicit inflectional features, and morphemes instead of a universal `conjugation` field, because different parts of speech inflect differently.
- **Implementation decision: source traceability** — each record carries the source gloss and review metadata so future corrections can be checked against the LaTeX rather than silently normalizing away the source form.
- **Implementation decision derived from the PRD: typed local records** — a small explicit data shape makes every visible gloss field inspectable and keeps missing information honest.
- **Useful uncertainty clarified: “dynamic generation”** — it means dynamically revealing the selected static record, not generating linguistic analysis at runtime. This preserves the static-gloss POC and avoids an accuracy-critical language engine.
- **Open issue: exact popup dismissal and positioning** — implement and verify with desktop hover, keyboard focus, mobile tap, click-away, and narrow viewport checks during the build.
- **Open issue: scholarly font availability** — validate the chosen local fallback stack with representative IPA and Old English strings before finalizing the demo passage.
- **Open issue: TinaCloud publishing** — local Tina editing works without cloud credentials; remote branch-backed editing requires configuring a Tina client ID, token, and branch before deployment.
