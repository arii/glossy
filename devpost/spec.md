---
doc: spec
status: approved
---

# Glossy — Technical Spec

## How This Works, In Plain Language

Glossy is a local Next.js editing workbench and a separate reader. Old English manuscripts are parsed into structured JSON documents for the reader and editor; the editor modifies tokens, lemmas, and grammatical features while an interlinear preview updates immediately. Changes are autosaved to a text-scoped browser draft envelope (`glossy:draft:v1:<slug>`).

The dedicated editor provides instant client-side downloads for compilable **LaTeX (`gb4e`)** and structured **JSON**. TinaCMS is configured for managing high-level site copy and provides an authenticated GraphQL commit bridge for pushing drafts into Git.

## The Core Journey Through the System

1. The editor opens a text at `/edit/<slug>` and selects an example/token.
2. The inspector edits source form, literal/readable gloss, translation, and linguistic analysis while the interlinear preview and explanation panel update in real time.
3. Edits are debounced and saved to `localStorage` under a versioned envelope (`glossy:v1:draft:<slug>`) containing the canonical `TextDocument`.
4. The editor reviews the current draft and chooses **Save draft**, which updates `glossy:v1:pending_drafts` with an updated content hash and timestamp.
5. In Tina Admin (`/admin/index.html`), authenticated users can commit pending drafts directly to the Git repository.
6. The editor can download a `.tex` or `.json` export at any time.
7. A reader opens `/read/<slug>`; no editor controls appear on that page. Hover/focus/tap opens the linked lexical explanation.

## Stack

- **TypeScript** — typed passage and gloss data contracts (`lib/types.ts`).
- **Next.js 15+ App Router** — web framework, routing, and SSG/SSR rendering.
- **React 19** — interactive components with deterministic hydration.
- **TinaCMS** — visual and headless editing for page copy (`home.json`, FAQs) and Git commit propagation.
- **Tailwind CSS & Charis SIL font stack** — responsive layout, scholarly typography, Old English diacritics, and IPA support.

## Local Drafts & Persistence Architecture

1. **Storage Key Format**: `glossy:v1:draft:<slug>`
2. **Envelope Schema**:
   ```typescript
   interface DraftEnvelope {
     version: 1;
     shape: "text-document";
     doc: TextDocument;
     baseHash: string;
     updatedAt: string;
   }
   ```
3. **Commit Manifest**: `glossy:v1:pending_drafts` stores `{ [slug]: { slug, title, updatedAt, contentHash, wordCount, synced } }`.
4. **Publishing Flow**: `commitDocumentToTina()` in `lib/tina-sync.ts` validates, sanitizes, and submits GraphQL mutations through TinaCMS when authenticated.
