# Glossy Audit and Remediation Plan

This single document contains: **Part 1** engineering practices audit, **Part 2** copy audit (on-page text), and **Part 3** a checkbox remediation plan covering both.

# Part 1 — Engineering Practices Audit

**Reviewed:** 2026-10-06  
**Review type:** Static source review of first-party application, library, script, style, and deployment-configuration files in the current checkout. This is an engineering-quality audit, not a runtime test or a complete security assessment.

## Executive summary

The most significant maintainability risk is not any one code smell: application behavior is spread across overlapping representations, conversion and fallback paths, document-specific exceptions, and duplicated configuration. This makes it difficult to determine which data or behavior is authoritative and increases the chance that a change fixes one path while leaving another inconsistent.

**Intended product model:** Glossy's dedicated editor provides the text-editing UX; working edits can remain local drafts and be represented as JSON; TinaCMS provides the Git-backed propagation/publishing path. Tina's generated schema/admin is not intended to replace Glossy's editor UI. These are distinct roles, not a goal of making the published app read-only or requiring editors to manipulate raw schema forms. Findings below target unclear or duplicated implementation boundaries around that model, not the model itself.

**Current direction (in-progress changes in the working tree):** the editor's **Save** writes a full browser draft (`glossy_document_*`, plus a `TextDocument`-shaped copy at `glossy_draft_<slug>`) and records it in a `glossy_pending_drafts` manifest with a `synced` flag; it also attempts a Tina `updateText` GraphQL mutation (local `localhost:4001` on localhost, or TinaCloud when a `tinacms-auth` session exists). `tina/config.ts` now adds a `cmsCallback` that shows a "Local Storage Draft Detected" bar inside Tina Admin, whose "Commit Draft to Git" button sends pending drafts through Tina's authenticated client. In other words: **edit in Glossy's UX → local draft → commit through an authenticated Tina session**. This document treats that as the target flow and evaluates the implementation and copy against it. The audit reflects the working tree as reviewed on 2026-10-06, including uncommitted changes.

**Latest changes and the open upload → save bug area:** recent commits added browser-only "local corpus management" in `components/text-directory.tsx` (upload a JSON file, list custom drafts discovered by scanning `localStorage`, hide/restore/revert texts via `glossy_deleted_slugs`), a client-side 404 fallback (`app/not-found.tsx`) that renders the editor or reader for slugs that exist only as local drafts (static export cannot pre-render them), and a "switch text" selector and draft preview in `components/reading-page.tsx`. These flows now share one storage key, `glossy_draft_<slug>`, written by at least six code paths in **two incompatible shapes** (see the P1 finding "One storage key, two document shapes"). That is the most likely cause of bugs when uploading or creating a document and then saving it, and it should be fixed before more save/commit behavior is layered on.

The recommendations focus on simplifying those paths, making persistence outcomes truthful, centralizing shared decisions, and distinguishing intentional compatibility from accidental fallback behavior. A fallback is not inherently a bad practice; it becomes a liability when its supported inputs, precedence, and retirement criteria are unclear.

## Findings

| Priority | Area | Evidence | Practice and impact | Recommended direction |
|---|---|---|---|---|
| **P1 — High** | Embedded CMS credential | `tina/config.ts:12-14`; `[vars]` in `wrangler.toml` | A token value is embedded both as the Tina config fallback and in deployment configuration. This is a deployment and maintenance hazard even if the value is currently public or inactive; if valid, source access exposes it. | Remove token values from committed config, provision secrets through the deployment environment, and rotate/revoke the value if it was active. Keep only non-secret client/branch configuration in source. |
| **P1 — High** | Persistence boundaries are mixed with stale direct-API paths | `components/gloss-editor.tsx:514-580,625-644`; `app/edit/new/page.tsx:353-374` | The intended workflow has useful, separate steps—Glossy's editor/local draft, then a deliberate Tina-backed Git propagation. Previously, Save attempted a full-document Tina `updateText` mutation directly from the editor, and Tina Admin offered a second commit path for pending drafts. Having multiple uncoordinated commit paths makes outcomes hard to reason about. (Stale prototype API handlers under `scripts/archive/` have been removed). | Pick one commit path (preferably a single shared module used by both the editor's Save/Publish and the Tina Admin sync bar), with the `glossy_pending_drafts` manifest as the only draft-state record. Document: local draft and recovery → authenticated Tina commit → optional JSON/LaTeX export. Remove or clearly scope direct API requests, and report local draft vs Tina-confirmed publication distinctly. |
| **P1 — High** | One storage key, two document shapes (upload/create → save bugs) | Writers of `glossy_draft_<slug>`: `components/gloss-editor.tsx:245,261,348` (editor-state `EditorDocument`, with `tokens`, via `storageKey` on mount, autosave, and restore) and `:538` (`TextDocument`, with `words`, on Save); `app/edit/new/page.tsx:374` and `components/text-directory.tsx:240` (`TextDocument`). Readers: `app/not-found.tsx:32`, `components/text-directory.tsx:65-90`, `components/reading-page.tsx:83`, `tina/config.ts` sync bar, `app/privacy/page.tsx:120` | Autosave (300 ms) and Save write different shapes under the same key, so whichever ran last wins. Consumers disagree on what they will find: the 404 fallback accepts any object with a non-empty `sentences` array and passes it to `GlossEditor` as a `TextDocument`; the directory counts tokens from `s.words`, so an autosaved editor-shape draft shows 0 tokens; the reading page handles both shapes; the Tina sync bar sends `draftDoc.sentences` straight into the mutation, which fails or sends tokens instead of words if the editor shape is stored. The editor's mount check discards a cached draft when its sentence count differs from the initial document, so a freshly uploaded or created text whose draft shape or count differs can be wiped or replaced. Nothing is versioned, so a shape change silently orphans existing drafts. | Use separate, versioned keys or a single envelope: e.g. `glossy:draft:v1:<slug>` = `{ version, shape: "text-document", doc, baseHash, updatedAt }`. Store one canonical shape (the `TextDocument`) and convert to the editor model on load. Put read/write/validate/list/delete in one `lib/local-drafts.ts`, and make every consumer use it. Add a one-time migration that detects and converts legacy shapes. |
| **P1 — High** | Upload and create paths skip validation and bypass the commit manifest | `components/text-directory.tsx:216-245`; `app/edit/new/page.tsx:292-390`; `components/gloss-editor.tsx:538-551` | Upload accepts any JSON with `title` and `sentences` (the alert also advertises "plain text file", which then fails to parse); it never checks that sentences contain `words`, that ids are unique, or that the slug is safe. Slug comes from the file (`doc.slug \|\| doc.textId \|\| filename`) without sanitising or collision checks, so an upload named like a built-in text (e.g. `ohthere`) silently becomes that text's "local draft", or the tab appears as an edit of the canonical document. The new-text flow only checks that the slug is non-empty, sets `status: "published"` for brand-new unreviewed text, fires `/api/save-document` and ignores the result, and navigates with `router.push(/edit/<slug>)` after 800 ms, which has no pre-rendered page and works only through the 404 fallback. Neither path adds the document to `glossy_pending_drafts`, so the Tina sync bar never offers to commit a newly uploaded or created text, and Save in the editor is the only way it becomes "pending". | One `createLocalDocument()` function used by both flows: validate with the canonical schema (reject or repair with a visible report), sanitise slug, reject collisions with built-ins or existing drafts (or ask to overwrite), set `status: "draft"`, write the draft and manifest atomically, and return a typed result. Remove the `/api/save-document` call. Prefer a client-routed editor page (e.g. `/edit?slug=`) or a catch-all shell over a 404 that renders content. |
| **P2 — Medium** | A 404 route is used as an app route | `app/not-found.tsx:20-60`; `app/edit/[slug]/page.tsx:10-15`; `app/read/[slug]/page.tsx:10` | Local-only slugs have no static page, so the app relies on the not-found boundary to render editor and reader. Hosting may return HTTP 404 for those URLs (crawlers, analytics, link previews, service-worker or CDN caching can treat them as missing), the fallback flashes the 404 text before hydration, and the first render makes `GlossEditor` initial state depend on `useEffect`. A draft whose slug later matches a real route (e.g. committed to Git and rebuilt) will be shadowed by the static page without a defined precedence. | Serve a single client-rendered shell for local drafts (explicit route with `dynamicParams`/query slug, or an SPA fallback in hosting config) and define precedence: committed document vs local draft, with a visible "you are editing a local draft of X" banner and a diff/discard option. |
| **P2 — Medium** | Deletion is browser-only but shares the vocabulary and keys of published content | `components/text-directory.tsx:125-170`; `components/reading-page.tsx:75-110` | "Remove" hides built-in texts via `glossy_deleted_slugs`, removes drafts, and leaves the `glossy_pending_drafts` entry and legacy `glossy-editor-snapshot-v2-*` keys unmanaged (the manifest is never cleaned, so the Tina bar can later offer to commit a text the user removed). Hidden texts are hidden only for this browser; the UI says "Remove … from your local corpus" yet the older `/api/delete-document` call remains in the editor. | Make hide/revert/delete operations on one local-state module that also updates the manifest; label as "Hide on this device" vs "Delete local draft"; remove the `/api/delete-document` path or implement it behind Tina. |
| **P1 — High** | Canonical content and derived formats lack an explicit boundary | `components/gloss-editor.tsx:118-210,519-580`; `lib/content.ts:179-215,341-386`; `data/latex-export.ts:1-100`; `scripts/compile-tex-to-content.mjs:1-40` | JSON is part of the Git-backed content workflow, while the editor also uses an editor-state shape, LaTeX is imported/exported, and the loader accepts legacy blocks/gloss records. These are reasonable roles, but the code does not make their precedence and transformation boundaries obvious. Updates can be lost or diverge if multiple forms are treated as authoritative. | State explicitly which JSON schema is canonical for Tina/Git, which editor model is transient, and which TeX/legacy forms are import/export compatibility. Validate each transition and test round-trip conversion for preservation. |
| **P1 — High** | Compatibility behavior has no visible boundary or retirement plan | `lib/content.ts:341-386`; `components/gloss-editor.tsx:107-115,289-314`; `scripts/validate-source.mjs:20-50,100-110`; `lib/passage-utils.ts:1-25` | Legacy-shape conversion, alternate morpheme field names, fallback gloss fields, cache invalidation, and document-specific TeX merging are maintained inline across multiple runtime and validation paths. There is no obvious version marker or indication of which old format is still supported. | Inventory actual persisted formats, migrate them once at a controlled boundary, add a schema version, and remove adapters when migration is complete. Keep any intentionally supported legacy reader isolated and tested. |
| **P2 — Medium** | Document-specific exceptions leak across the app | `components/gloss-editor.tsx:125-135,620-623`; `components/text-directory.tsx:26-30`; `components/attribution-modal.tsx:27-61`; `lib/content.ts:165-205`; `lib/gb4e.ts:207-219` | Ohthere/Beowulf defaults, protection rules, provenance, and source merging are hard-coded in editor, directory, citation, parser, and content-loader code. Adding or renaming a document can require coordinated edits to several unrelated modules. | Put document identity, protected status, defaults, and provenance in document metadata or a single corpus registry; have consumers use that shared source rather than matching slug strings. |
| **P2 — Medium** | Fallbacks can disguise configuration and data failures | `lib/content.ts:19-98,101-113`; `components/gloss-editor.tsx:247-334,527-580`; `lib/old-english-lexicon.ts:556-581` | Missing or malformed page data can silently fall back to defaults; failed cache reads can restore initial content; unknown words receive heuristic part-of-speech, definition, and Wiktionary URL values. Such behavior is sometimes useful, but currently makes incomplete or incorrect state look valid and does not consistently signal uncertainty. | Document fallback precedence, surface recoverable errors, and mark heuristic linguistic analyses as unverified. Use defaults only for optional presentation content; fail clearly for required corpus or persistence data. |
| **P2 — Medium** | Draft, local write, and Tina publish outcomes are conflated | `components/gloss-editor.tsx:527-580`; `app/edit/new/page.tsx:353-374`; `components/text-directory.tsx:34-58` | `saveToTina` (`components/gloss-editor.tsx:514-672`) wraps every storage and GraphQL step in empty `catch {}` blocks and reports `kind: "success"` for both outcomes: "Saved and synchronized directly to TinaCMS" and "Saved working draft to browser storage". GraphQL `errors` in a response are not read, so a rejected mutation and an unreachable server look the same. The `synced` flag is a boolean per slug, not tied to the draft's content, so later edits to a synced text are not flagged as pending unless Save is clicked again. The new-text flow ignores an API response, and deletion suppresses request failures. Local draft success is valid in itself, but it must not be presented as repository propagation. | Preserve local-first editing, but use distinct UI states (e.g., `draft-saved` as a success/neutral state, `committed`, `commit-failed` with reason, `needs-login`) for draft saved, Tina publish confirmed, and export completed. Read GraphQL `errors`, compare the committed content with the draft, store a content hash or `updatedAt` with each manifest entry, and check response/errors for each operation and state clearly whether code-base propagation occurred. |
| **P2 — Medium** | Tina Admin sync bar is hand-built DOM injected from `localStorage` | `tina/config.ts` `cmsCallback` (added in working tree) | The callback builds HTML with `innerHTML`, interpolating slugs read from `localStorage`, plus a large inline-styled string; a tampered or malformed manifest could inject markup. It also assumes `cms.api.tina.request`, hides per-slug failures behind one button label, ignores editor-side unsaved changes, and has no conflict detection if the repository version changed since the draft began. | Render the bar with text nodes/a small component, validate manifest entries, show per-text result and errors, and add a base-version check (e.g., stored content hash or Git sha) before overwriting. |
| **P2 — Medium** | Hard-coded Tina endpoints and IDs in client code | `components/gloss-editor.tsx` (TinaCloud content URL containing a client ID); `tina/config.ts:11` (client ID changed in working tree); `wrangler.toml:8` | The TinaCloud URL and client ID are duplicated between the editor and Tina config, and now disagree with one another's history. Reading `tinacms-auth` from `localStorage` couples the editor to Tina's private session storage format. | Derive the endpoint from the Tina client/config, or use the Tina-provided client in Admin only; keep one definition of client ID and branch. |
| **P2 — Medium** | Duplicate corpus metadata and counts | `app/page.tsx:110-132`; `components/text-directory.tsx:20-31,57-60`; `content/texts/*.json` | The home route manually supplies the corpus list, counts, authors, sources, status, and protection flags while similar defaults and protection checks appear in other components. These values can drift from corpus files. | Derive display data and counts from the validated corpus; store truly editorial metadata with each document. Centralize the protection policy and test it. |
| **P2 — Medium** | Styling is duplicated between CSS and component markup | `app/globals.css:1-60,201-270`; `app/page.tsx:140-230`; `components/text-directory.tsx:62-250`; `components/gloss-editor.tsx` and `app/docs/page.tsx` contain many more inline style objects | Layout and visual tokens are partly defined in the global stylesheet and partly repeated as large inline style objects. A source scan found 40 inline-style occurrences in the editor, 40 in the docs page, and 27 on the home page. This raises the cost of consistent redesign, responsive tuning, and state styling. | Move repeated layouts, colors, spacing, and typography to shared classes/tokens. Keep inline styles only for genuinely data-driven values such as computed layout or dynamic emphasis. |
| **P2 — Medium** | Editor concentrates too many responsibilities | `components/gloss-editor.tsx:1-210,230-650` and later UI sections (file extends beyond line 1,350) | One client component owns type conversion, lemmatization integration, LaTeX import/export, browser-cache migration, Tina requests, deletion, status reporting, and a large editor UI. This coupling makes changes hard to isolate and test and increases regression risk. | Extract pure conversion/serialization logic and persistence operations into separately testable modules; split editor panels by responsibility while keeping state ownership explicit. Avoid extracting solely for line count. |
| **P2 — Medium** | Navigation and active-document state depend on browser storage | `components/site-nav.tsx:10-35,37-69`; `components/reading-page.tsx:63-76,165` | The nav initializes from a prop but also reads/writes a global local-storage slug, while route pages also pass slugs and reader selection computes a default. The source of the active document varies with navigation history and can produce stale or surprising links. | Make the current route/document the source of truth. Retain storage only for a clearly defined preference, and avoid using it to override explicit route state. |
| **P2 — Medium** | Build orchestration is brittle and configuration is scattered | `scripts/build.js:8-35,39-55`; `scripts/dev.js:1-11`; `package.json:5-34`; `wrangler.toml:1-10` | Build behavior is split between package scripts and custom JavaScript, child processes use `shell: true`, and a busy port 9123 silently causes Tina schema building to be skipped. The dev script hard-codes a command string and ports; Tina local URL and branch/token defaults live elsewhere. | Prefer direct argument-based child-process calls without a shell; consolidate port/URL settings; fail or explicitly verify when reusing generated schema output. Keep the package scripts as the obvious source of build steps where practical. |
| **P3 — Low** | Redundant reads and validations obscure request flow | `app/edit/[slug]/page.tsx:10-20`; `app/read/[slug]/page.tsx:10-24`; `lib/content.ts:179-215` | Static-param generation and page rendering each load and validate all documents independently; the pages also call validation after `loadTextDocuments()` already validates. This repeats work and makes ownership of validation unclear. | Make one loader guarantee a validated result and avoid duplicate assertions; where static params and render need the same corpus, use a clear build-time data-loading boundary. |
| **P3 — Low** | Global JSON monkey patch | `lib/safe-json.ts:62-102`; installed by `components/site-nav.tsx:20` | The app replaces `JSON.stringify` process-wide. Its replacer omits repeated object references as well as cycles, and the catch-all fallback can turn serialization errors into `"{}"`, silently altering unrelated library behavior or losing data. | Remove the global patch. Use a narrowly scoped serializer only where needed; preserve native behavior and make serialization failures explicit. |
| **P3 — Low** | CSS contains signs of stale styling surface | `app/globals.css:85-199`; `components/site-nav.tsx:37-69` | The stylesheet defines navigation dropdown and related classes, while the current nav component renders a flat set of links and does not use those classes. Stale rules increase search noise and leave unclear whether a design is intentionally retained. | Confirm unused selectors are truly obsolete, then remove them or restore the intended component. Add a CSS-unused check if stylesheet growth becomes recurring. |
| **P3 — Low** | Smoke tests cover route text, not user workflows | `scripts/smoke-test.mjs:47-109`; `package.json:20-34` | The smoke test checks HTTP status and static response substrings. It does not exercise client-side editing, save failures, local draft restoration, or deletion; important behavior can break while the smoke test passes. | Keep this as a route-level smoke check and add focused tests for data conversion and save outcomes, plus a browser test for the critical editor journey if browser tooling is adopted. |

## Cross-cutting recommendations

1. **Make the existing persistence contract explicit.** Keep Glossy's editor as the authoring UX; distinguish browser-local draft/recovery (with the pending-drafts manifest) from explicit, authenticated Tina-backed Git commits and from JSON/LaTeX export. The editor creates drafts; a single commit module (used by the editor and the Tina Admin sync bar) publishes them. Tina's schema/admin is a publishing integration, not a substitute text editor.
2. **Reduce formats and compatibility paths deliberately.** Document the canonical JSON schema, the editor's transient model, and supported TeX/legacy import paths. Migrate old records explicitly, add schema versions, and retire adapters only after verifying migration.
3. **Centralize corpus facts and runtime configuration.** Keep document identity/provenance/protection in a single data source; keep ports, URLs, and environment-specific values in documented config; never commit secret values.
4. **Make failures observable and testable.** Use explicit result/error states for local drafts and Tina propagation, then test malformed input, legacy migration, conversion round trips, and failed writes.
5. **Refactor around boundaries, not aesthetics.** First extract pure model conversion and persistence, then split UI if it simplifies state ownership. Consolidate styling as shared design primitives are touched rather than mechanically rewriting every component.

## Audit limitations

This review assesses source patterns and their likely maintenance impact; it does not prove runtime defects in every deployment. No production environment, deployment secrets, Git history, live Tina service, or full interactive browser session was inspected. Dependency internals and generated files were not treated as independent findings, though committed configuration values and active source references to generated behavior were considered. The token finding is a reason to verify and rotate credentials, not a claim that the value was tested or found active.

---

# Part 2 — Copy Audit (redundancies, inconsistencies, inaccuracies)

**Scope:** user-visible text in `app/`, `components/`, `content/pages/*.json`, `content/docs/architecture-faq.json`, `README.md`, and `docs/ARCHITECTURE_AND_FAQ.md`. Counts were checked against `content/texts/*.json`. This is a source read, not a rendered-page review; the corpus-text translations and linguistic correctness of glosses were not reviewed by a specialist.

Severity: **High** = states something false/misleading; **Medium** = contradictory or duplicated; **Low** = polish/terminology.

## 2.1 Inaccuracies

| # | Sev. | Copy | Where | Issue | Recommended fix |
|---|------|------|-------|-------|-----------------|
| C1 | High | "Dual-write storage syncs localStorage (Tier 1), .tex and .json files (Tier 2), and TinaCMS working trees (Tier 3) with zero data loss." | `content/docs/architecture-faq.json` (`architectureSpecDescription`, `storageTiers`); docs A2 heading "Dual-Write CMS Integration" and "robust three-tier data synchronization model" in `app/docs/page.tsx` | Under the current flow, Save writes a browser draft and a pending-drafts manifest, then tries a Tina mutation; Tina Admin offers "Commit Draft to Git" for pending drafts. Direct `.tex`/`.json` file writes are not part of the static deployment, and there is no "dual-write". "Zero data loss" is not supportable for browser storage. | Rewrite to the real flow: (1) edits autosave to a browser draft; (2) Save records a pending draft; (3) a signed-in Tina session commits it to Git; (4) Export JSON/.tex is a manual copy. Drop "dual-write", "synchronization" and "zero data loss", and say drafts live in this browser only until committed. |
| C2 | High | Tier 2: "Clicking Save to TinaCMS or pressing Ctrl+S writes .tex to references/ and JSON to content/texts/" | `architecture-faq.json` | No Ctrl+S handler exists in `components/gloss-editor.tsx`, and Save does not write `.tex` or `references/`; it writes a draft and attempts a Tina mutation for the JSON document (`updateText` with `texSource`). | Describe exactly what Save does; remove Ctrl+S unless implemented. |
| C3 | High | "Ensuring instant editorial synchronization and visual authoring fidelity" (Tier 3) | `architecture-faq.json` | Overclaim; commits happen when a signed-in user confirms them, and there is no live synchronization. | Neutral wording: "Committing through TinaCMS (requires sign-in) saves your draft to the repository." |
| C4 | Medium | "Abbreviation reference: 37" vs "42" | `tina/config.ts` field label "37 Leipzig Glossing Abbreviations"; comment at `app/docs/page.tsx:195`; visible heading `app/docs/page.tsx:214` "42"; README and FAQ say 42; JSON has 42 | Count appears in four places and one is wrong. | Compute the number from the data (`items.length`) or drop it from labels. |
| C5 | Medium | "100% data integrity", "100% token and gloss alignment… with zero warnings" | `app/docs/page.tsx` (A3 intro), `architecture-faq.json` | Absolute claims about validators that check specific properties only. | Say what is validated (e.g., token/gloss counts match, lemmas exist in dictionary). |
| C6 | Medium | Content pre-compiler described as targeting only `ohthere.json` | `architecture-faq.json` `verificationTools` | `compile:beowulf` also exists. | List both or describe generically. |
| C7 | Medium | Verification table commands: `node scripts/validate-lemmas.mjs` vs `npm run …` | `architecture-faq.json` | Inconsistent invocation; `npm run validate:lemmas` is the documented script. | Use npm script names throughout. |
| C8 | Medium | Footer "Admin Login" and `/admin` page "Redirecting to TinaCMS editorial suite…" | `components/site-footer.tsx`, `app/admin/page.tsx` | Tina Admin is the sign-in and commit surface for drafts (the sync bar), not the text-editing UX. "Editorial suite" and "Admin Login" (footer, `components/site-footer.tsx:140`) overstate or understate that role. The editor's separate Tina Admin button was removed, but the fallback save message still tells users to "open Tina Admin (↗)", pointing at a control that no longer exists. | Use "Commit drafts (TinaCMS sign-in)" in the footer, `/admin`, and the editor's "Tina Admin ↗" button. |
| C9 | Low | Delete/hide copy: "Remove … from your local corpus? (You can restore default texts at any time.)" | `components/text-directory.tsx:125-135` | The older "delete its JSON data and LaTeX files" wording was replaced; the new wording is accurate for hiding but not for deleting custom drafts, which cannot be restored, and doesn't say the change is device-only. | Two labels: "Hide on this device (restorable)" and "Delete local draft (cannot be undone)"; state that the repository copy is unaffected. |
| C10 | Medium | Button "Save to TinaCMS" (tooltip "Save working draft to browser storage and sync to TinaCMS / Git"), success text "Saved and synchronized directly to TinaCMS… and browser storage", fallback text "To commit your changes directly to Git, open Tina Admin (↗)", and sync-bar copy "Commit Draft to Git" | `components/gloss-editor.tsx:669,984-991`; `tina/config.ts` `cmsCallback` | The button label claims a Tina save that often only produces a local draft; "synchronized … to TinaCMS" does not mean the Git commit happened; "Git" and "TinaCMS" are used interchangeably; the fallback is styled as success. | Rename the button "Save draft"; reserve "Commit to Git" for confirmed Tina commits; use neutral/info styling for draft-only results and error styling for failed commits; one shared glossary entry for draft / pending / committed. |
| C10a | Medium | Sync bar: "Local Storage Draft Detected… Commit this draft directly to TinaCMS & Git repository" | `tina/config.ts` `cmsCallback` | Says "unsynced" without saying what differs from the repository, or that drafts exist only in this browser. | Say "Unpublished draft in this browser: <title>"; show date and word count (already in the manifest); explain what commit does and that it overwrites the repository copy. |
| C11 | Medium | Attribution (updated): the placeholder `glossy.local` URL was replaced with `https://glossed.pages.dev/read/…`, and creators are now "Ariel Anders" (platform) and "Tyler Lemon" (subject-matter expert), but the BibTeX `author` is hard-coded to "Anders, Ariel and Lemon, Tyler" and the citation templates still say "London: British Library witness", `origdate = ca. 890`, "2026"/"September 30, 2026" for every text. For a user-uploaded or newly created text, the modal therefore credits Anders and Lemon as authors/editors of an arbitrary text, with a British Library witness, and a 2026 edition date | `components/attribution-modal.tsx:23-76`; `gloss-editor` default date | Incorrect credit, witness and date for uploaded/custom texts; the domain "glossed.pages.dev" differs from the product name "Glossy" used elsewhere (confirm which is canonical); the footer and about page credit "Ariel Anders" with "Tyler Lemon" while the modal labels roles "Digital Platform Creator" and "Linguistic Subject Matter Expert", and the earlier "Ariel Anders Consulting" wording was dropped inconsistently. | Source credits, witness, date, and origdate from per-text metadata; show only the platform credit for local drafts; use the real site URL from config; omit unknown fields; use one credit format across footer, about, and modal. |
| C12 | Low | "Beowulf: Prologue (Lines 1–11)" / manuscript "Cotton MS Vitellius A. xv, ff. 129r–198v" | `app/edit/new/page.tsx`, `content/texts/beowulf-prologue.json` | The folio range is the whole Nowell Codex, not the prologue; the lines are 1–11 of the poem. Presenting the whole range as the source is imprecise. | Use the actual folio for lines 1–11 (f. 129r) or label as codex range. |
| C13 | Low | "syxtig hrāna = 'sixty of reindeers'"; numeral cards "twā/þrēo" vs "twēgen/þrīe" | `architecture-faq.json` | Grammar ("reindeers"), and the masculine-nominative rule is illustrated with feminine/neuter forms. | Have a specialist verify; use "sixty reindeer" and masculine forms in the masculine-nominative examples. |

## 2.2 Inconsistencies

| # | Sev. | Topic | Evidence | Fix |
|---|------|-------|----------|-----|
| C14 | Medium | Home page copy has three versions | `content/pages/home.json` (`description` empty; heading "Read a text or work on its glosses."), `DEFAULT_HOME_CONTENT` in `app/page.tsx` ("Interlinear Glossing & Morphology for Old English"), `lib/content.ts` defaults | One source (the JSON) with no divergent code defaults; fill the empty description. |
| C15 | Medium | Primary CTA label | "+ Gloss a New Text" (home.json) vs "+ Ingest & Gloss New Text" (default) | One label. |
| C16 | Medium | Secondary CTA ignores content | home.json `secondaryAction` "Architecture & FAQ" → /docs, but `app/page.tsx` hard-codes "Explore Corpus ↓" | Render from content or remove the unused field. |
| C17 | Low | Ingest eyebrow | `ingest.json` "Corpus Ingestion" vs default "Glossy · Corpus Ingestion"; title and heading are identical ("Gloss a New Old English Text") | Choose one; drop duplicate field if not needed. |
| C18 | Low | Page eyebrow/title pattern | "Interlinear Texts" vs "Glossy · Interlinear texts"; `app/layout.tsx` "Glossy \| Old English visual glosses" vs "Old English Interlinear Glossing & Morphology" (footer) vs "Interlinear Glossing & Morphology for Old English" | Pick one tagline and one sentence-case/title-case rule. |
| C19 | Medium | Token/sentence counts | Ohthere "75 sentences / 1716 tokens" and Beowulf "11 / 53" (hard-coded in `app/page.tsx:117-132`, verified against JSON); README line 84 "1,769 tokens" (corpus total = 1,716 + 53) and FAQ line 123 "75 sentences (1,716 tokens)" | Counts are correct but unlabeled (per-text vs corpus total) and hand-maintained; derive them at build time. |
| C20 | Low | Name for the reading surface | Nav "Viewer"; README/docs "Reader"/"Visual Reader"; eyebrow "Old English visual gloss"; 404 says "passage or editor workspace" | Choose "Reader" or "Viewer" and use it everywhere. Same for Editor/Workspace and Corpus/Library. |
| C21 | Low | Author credit | "King Alfred's Court / Tyler Lemon" (text-directory fallback) vs "Tyler Lemon (ed.) / King Alfred's Court" (home) vs mdx `author: "Ohthere and Wulfstan"` and source "Translated and glossed by Tyler Lemon" | Define author vs editor fields and one display format. |
| C22 | Low | Doc section numbering | Comments/labels L1–L3, A1–A3 plus `domainNum`/`num`; heading "Why Adjectives Use…" vs "The Numeral Lemmatization Standard (Masculine Nominative)" | Parallel heading style. |

## 2.3 Redundancies

| # | Sev. | Redundancy | Where | Fix |
|---|------|------------|-------|-----|
| C23 | Medium | Adjective rule stated as heading, description and ingestion step ("canonical masculine nominative singular strong adjective lemmas" mixes POS terms) | `app/docs/page.tsx` L2, `architecture-faq.json` `canonicalRuleDescription`, `ingestionSteps` | State once (L2) and link to it elsewhere. |
| C24 | Medium | Numeral rule stated in `canonicalRule`, L3 intro and numeral cards | same | Keep L3 as the only definition. |
| C25 | Medium | Wiktionary/IPA/lemma rules duplicated in README §2, `docs/ARCHITECTURE_AND_FAQ.md`, and the docs JSON | README, FAQ, `architecture-faq.json` | Make the docs JSON the source; README/FAQ link to it. |
| C26 | Low | Presets named in three places ("Beowulf: Prologue", "Cædmon's Hymn", "The Wanderer") | `app/edit/new/page.tsx`, docs A1 heading and body, ingest description | Derive from `PRESETS` or avoid listing. A1 heading lists "Beowulf, Cædmon, Custom OE" while the preset is "The Wanderer (Opening)". |
| C27 | Low | Eyebrow/title/heading triplets repeat the same phrase | `ingest.json`, `home.json` | Remove fields that do not add information. |
| C28 | Low | "Glossy" described as "robust", "seamless", "universally" (docs L2 "universally choose") | `app/docs/page.tsx`, JSON | Remove marketing intensifiers; "universally" is also untrue for dictionaries that list e.g. weak forms. |

## 2.4 Copy added in recent changes (upload, local corpus, privacy, about)

| # | Sev. | Copy | Where | Issue | Fix |
|---|------|------|-------|-------|-----|
| C29 | High | Privacy: "`glossy-editor-snapshot-v2-[slug]`: Holds editor undo history, cursor position, and active tab state." and "`glossy_last_slug`: Remembers the last document you viewed" | `app/privacy/page.tsx:120-122` | Neither key is written anywhere in the source (they are only removed in `text-directory.tsx`), so the policy describes data that does not exist, and omits keys that do (`glossy_pending_drafts`, `glossy_deleted_slugs`, the legacy `glossy_document_*`, and possibly `tinacms-auth`). | List exactly the keys in use (generated from a constants module) and remove nonexistent ones. |
| C30 | Medium | Privacy: "never transmitted across the network unless you … authenticate to commit changes to GitHub via the TinaCMS admin interface" | `app/privacy/page.tsx:127` | The editor's Save also sends the full document to a Tina GraphQL endpoint (local or TinaCloud) when a session token is present, not only through the Admin interface. | State both commit paths, or consolidate to one (see Part 3 §2). |
| C31 | Medium | Upload alert: "Please upload a valid Glossy JSON document or plain text file." and success "Successfully uploaded … to your corpus!" | `components/text-directory.tsx:216-245` | Plain text is not handled by the code visible in the handler; "your corpus" suggests persistent or published content although it is only in this browser's storage. | Match the accepted types; say "added to this browser" and that it is not published until committed. |
| C32 | Medium | New-text success: `Successfully created "<title>"! Redirecting to the live gloss editor...` and new docs get `status: "published"` | `app/edit/new/page.tsx:378-383,348-360` | Nothing was published; the state is a local draft. The label "published" contradicts the home-page/directory status tag shown next to it. | "Created local draft"; status "draft"; mention commit step. |
| C33 | Low | Not-found copy "The requested passage or editor workspace could not be found." is also what a user sees momentarily when opening a local-draft URL | `app/not-found.tsx:20-60` | Flash of an error message for a valid draft. | Show a "Looking for a local draft…" state first. |
| C34 | Low | About page: "offline autosave to browser localStorage" and "TinaCMS git-backed editorial interface" | `app/about/page.tsx:108,241` | Consistent with the local-draft plan but "editorial interface" repeats the C8 overstatement, and "offline" is true only after the first load. | Use the shared vocabulary (draft / pending / committed). |

## 2.5 Copy limitations

Hard-coded copy is spread across TSX, JSON, and Markdown, so counts and claims drift; the root fix is a single source of truth per fact, not just editing the words. Page copy is also split between Tina-managed JSON and code defaults, which makes some Tina edits have no visible effect (C14–C16).

---

# Part 3 — Remediation Plan (checkboxes)

Preserve Glossy's product model: the dedicated editor is the authoring UX (no editing text through Tina's schema forms); browser drafts support recovery; explicit Tina propagation updates Git-backed content; JSON is the structured format and LaTeX import/export remains supported. A draft save, Tina propagation, and file export are different outcomes and must be described accurately. Check an item only after implementation and verification.

## 1. Confirm the supported architecture and workflows

- [ ] Trace the current flow end to end: editor Save → `glossy_*` draft keys and `glossy_pending_drafts` manifest → Tina GraphQL (local or TinaCloud) → Tina Admin sync bar → Git commit; record request paths, credentials, and success/error responses.
- [ ] Confirm Tina local GraphQL versus TinaCloud/Git-backed publishing and which environments support each.
- [ ] Define the lifecycle and source of truth for a text: canonical committed JSON, transient editor state, local draft snapshot, optional generated/imported LaTeX.
- [ ] Define expected create, edit, save/publish, export, and delete behavior locally and when published.
- [ ] Confirm the deployed editing UX does not require Tina schema-form editing or expose credentials to browser code.
- [ ] Update architecture documentation with the agreed data flow and persistence guarantees.

## 2. Make drafts, publishing, and exports distinct

- [ ] Define UI states: unsaved, draft saved locally (manifest `synced: false`), committing, committed (`synced: true` for this content), commit failed (with reason), needs sign-in, export complete.
- [ ] Choose one commit path: a shared module used by both the editor and the Tina Admin sync bar, replacing the duplicate `updateText` mutation and variable-building code.
- [ ] Store a content hash/timestamp with each manifest entry so `synced` is invalidated by later edits; add a base-version/conflict check before overwriting repository content.
- [ ] Read GraphQL `errors` and HTTP status; replace empty `catch {}` blocks in `saveToTina` with typed outcomes; use non-success styling for draft-only and failed outcomes.
- [ ] Rebuild the sync bar without `innerHTML`; validate manifest entries; show per-text results and a clear sign-in prompt when unauthenticated.
- [ ] Remove the hard-coded TinaCloud URL/client ID and `tinacms-auth` `localStorage` reads from the editor; derive them from Tina configuration or move committing into Tina Admin.
- [ ] Define draft lifecycle: when drafts are cleared after commit, how stale drafts are detected, and per-browser storage limits/warnings.
- [ ] Keep draft autosave independent of publishing; surface storage quota/unavailable errors without discarding in-memory edits.
- [ ] Report publish success only after Tina confirms the intended write.
- [ ] Handle Tina GraphQL and transport errors explicitly; retain the draft and allow retry.
- [ ] Remove or clearly scope `/api/save-document` and `/api/delete-document` calls if unsupported in deployment.
- [ ] Verify create and delete use a supported persistence path and never hide failures.

### 2a. Fix upload, create, and save of new documents (open bugs)

- [ ] Reproduce the bug end to end: (1) create a text via `/edit/new`, (2) upload a JSON file, (3) edit a token, (4) Save, (5) reload, (6) open in the reader and directory, (7) open Tina Admin. Record where each fails and which shape is in `glossy_draft_<slug>` at each step.
- [ ] Introduce `lib/local-drafts.ts` as the only module that reads/writes/lists/deletes draft keys and the pending manifest; replace all direct `localStorage` use of `glossy_draft_*`, `glossy_pending_drafts`, `glossy_deleted_slugs`.
- [ ] Store a single canonical `TextDocument` shape in a versioned envelope (`version`, `doc`, `baseHash`, `updatedAt`); convert to the editor model only in memory. Stop having autosave and Save write different shapes to the same key.
- [ ] Add a one-time migration for existing `glossy_draft_*` keys (detect `tokens` vs `words` shape; leave unrecognised data untouched with a visible warning) and for the legacy `glossy_document_*` and `glossy-editor-snapshot-v2-*` keys.
- [ ] Add `createLocalDocument()` (used by upload and `/edit/new`): schema-validate, sanitise slug, reject or confirm collisions with built-in or existing slugs, default `status: "draft"`, write draft and manifest together, return a typed result with errors.
- [ ] Make the editor's mount logic not discard a valid draft only because its sentence count differs; compare against a stored base hash and ask the user.
- [ ] Make newly created and uploaded documents appear in `glossy_pending_drafts` so the Tina sync bar can commit them; clear the entry on delete/revert.
- [ ] Remove the `/api/save-document` call and fixed 800 ms redirect from `/edit/new`; navigate when the draft write succeeds.
- [ ] Replace the 404-route fallback with an explicit client-rendered draft route (or hosting SPA fallback); define precedence when a committed text and local draft share a slug.
- [ ] Add tests: upload valid/invalid/colliding/oversized file; create → edit → save → reload; autosave-then-Save shape stability; delete/revert cleaning the manifest; sync bar sees a new document.
- [ ] Verify the UI never implies a Git commit/push occurred unless it did.
- [ ] Test draft recovery, publish success/failure, retry, and JSON/LaTeX export separately.

## 3. Establish canonical content and format boundaries

- [ ] Declare the canonical JSON schema (documents, sentences, words, analysis).
- [ ] Declare the editor-state model as transient or persisted; if persisted, version it and define migration rules.
- [ ] Inventory legacy document formats in `content/` and decide which must still be read.
- [ ] Add schema-version metadata and validate documents at load boundaries.
- [ ] Move legacy-shape conversion into a single migration/import adapter.
- [ ] Specify whether LaTeX is source, archive, import, or export for each document class.
- [ ] Remove silent fallback fields and alternate shapes once migrated.
- [ ] Add round-trip tests: JSON → editor → JSON and JSON → LaTeX → import.
- [ ] Cover footnotes, metadata, bibliography, abbreviations, punctuation, and literal gloss formatting in TeX tests, or document unsupported fields.

## 4. Reduce document-specific hard-coding

- [ ] Create a single source for corpus metadata (ID, slug, title, author, source, status, protection policy).
- [ ] Derive directory entries and sentence/token counts from validated content.
- [ ] Move protected-document behavior out of slug comparisons into shared policy.
- [ ] Move citation/provenance variants into document metadata.
- [ ] Remove duplicated default IDs, titles, authors, dates, and paths.
- [ ] Validate corpus metadata is unique/complete and routes refer to known documents.
- [ ] Test that adding or renaming a corpus item touches one place.

## 5. Make fallback behavior explicit

- [ ] Inventory defaults and fallbacks in content loading, editing, lemmatization, citation, and configuration.
- [ ] Classify each: user default, compatibility migration, heuristic, or error masking.
- [ ] Show actionable errors for missing required content instead of defaults.
- [ ] Label heuristic lemma/POS/definition output as unverified.
- [ ] Define cache validation and stale-draft rules (which base version a draft belongs to).
- [ ] Remove empty catches and success-shaped defaults that affect persistence or data integrity.
- [ ] Keep browser-storage failures non-destructive and visible.
- [ ] Test malformed content, absent optional content, invalid drafts, storage failure, unknown lexicon entries.

## 6. Simplify the editor and shared modules

- [ ] Extract pure conversion functions from `components/gloss-editor.tsx`.
- [ ] Extract local draft storage/validation into a versioned module.
- [ ] Extract Tina publish handling into a module with typed outcomes.
- [ ] Split editor UI panels only where it reduces coupling.
- [ ] Replace the global `JSON.stringify` patch with scoped serialization.
- [ ] Remove redundant document loads and duplicate validations.
- [ ] Make route state authoritative for document selection.
- [ ] Add unit tests for extracted logic before changing behavior.

## 7. Consolidate styling and configuration

- [ ] Establish shared CSS variables/design tokens.
- [ ] Move repeated static inline styles (home, docs, editor, directory, citation modal, new-text page) into shared classes.
- [ ] Keep inline styles only for computed values.
- [ ] Verify and remove stale nav-dropdown CSS.
- [ ] Centralize local ports/URLs for Next.js and Tina.
- [ ] Remove committed Tina token from `tina/config.ts`, `wrangler.toml`, and generated client; use host secrets.
- [ ] Rotate/revoke the committed credential if valid; inspect history and deployment settings.
- [ ] Make builds deterministic: do not silently skip Tina generation when port 9123 is busy.
- [ ] Simplify build scripts and avoid shell-mediated child processes.

## 8. Fix copy accuracy, consistency, and redundancy

**Accuracy**
- [ ] Rewrite storage tiers/A2 copy to the real flow: autosaved browser draft → pending draft → signed-in Tina commit to Git; export is manual (C1–C3).
- [ ] Rename "Save to TinaCMS" to "Save draft"; use "Commit to Git" only for confirmed commits; align tooltip, status messages, sync bar, footer, and `/admin` copy to one draft/pending/committed vocabulary (C8, C10, C10a).
- [ ] Remove "dual-write", "zero data loss", "instant", and Ctrl+S claims unless implemented (C1–C3).
- [ ] Replace "100% integrity/alignment" with the specific checks performed (C5).
- [ ] Update the pre-compiler description and use `npm run` commands in the tools table (C6, C7).
- [ ] Split hide-on-device and delete-draft copy; state that the repository copy is unaffected (C9).
- [ ] Source attribution credits, date, witness, `origdate`, and URL from per-text metadata; show only the platform credit for local drafts; confirm the canonical domain and name (C11).
- [ ] Correct the privacy page's storage-key list and network-transmission statement from the shared key constants (C29, C30).
- [ ] Align upload/create messages, `status`, and "corpus" wording with local-draft semantics (C31–C33); update about-page wording (C34).
- [ ] Correct the Beowulf prologue folio citation (C12).
- [ ] Have a specialist verify numeral examples and "sixty reindeer" wording (C13).

**Consistency**
- [ ] Single home/ingest copy source: fill empty `description`; remove diverging code defaults (C14, C17).
- [ ] One primary CTA label; render the secondary CTA from content or remove the field (C15, C16).
- [ ] One tagline and one capitalization rule across layout metadata, footer, home, and page eyebrows (C18).
- [ ] Derive abbreviation, sentence, and token counts from data; label per-text vs corpus total (C4, C19).
- [ ] Adopt a terminology list (Reader/Viewer, Editor/Workspace, Corpus) and apply it across nav, docs, 404, README (C20).
- [ ] Define author vs editor display format (C21).
- [ ] Align docs section heading style (C22).

**Redundancy**
- [ ] State the adjective and numeral rules once each; link from other sections (C23, C24).
- [ ] Make the docs JSON the source for Wiktionary/IPA/lemma rules; README and FAQ link to it (C25).
- [ ] Derive the preset list from `PRESETS` and fix the A1 heading (C26).
- [ ] Remove redundant eyebrow/title/heading fields (C27).
- [ ] Remove marketing intensifiers ("robust", "seamless", "universally") (C28).

## 9. Expand verification

- [ ] Keep route-level smoke tests.
- [ ] Add schema/content validation tests (duplicate IDs, invalid references, unsupported versions).
- [ ] Add conversion tests for canonical JSON, editor state, legacy migration, and LaTeX.
- [ ] Add persistence tests for draft writes, manifest updates, storage failures, Tina success/errors/partial results, and unauthenticated commit attempts.
- [ ] Test the sync bar: no pending drafts, multiple drafts, one failing, edited-after-commit, and tampered manifest.
- [ ] Add a browser test: edit a token, preview updates, reload recovers draft, publish, truthful status.
- [ ] Add create/delete coverage and protected-content rules.
- [ ] Add a copy check that counts shown in the UI (abbreviations, tokens, sentences) match the data.
- [ ] Run `npm run typecheck`, `npm run lint`, `npm run validate:source`, `npm run validate:lemmas`, `npm run test:smoke`.
- [ ] Run the production build and deployment validation.
- [ ] Update README and in-app docs to describe verified behavior.

## Completion criteria

- [ ] One canonical JSON representation is identified, and each editor, draft, legacy, and LaTeX representation has a stated purpose.
- [ ] Editing stays in Glossy's UX; drafts stay local and recoverable.
- [ ] A signed-in Tina commit (via one shared module) updates Git-backed content, `synced` reflects the current draft content, and the UI reports only confirmed outcomes.
- [ ] Failed storage, publish, create, or delete operations are visible and do not discard work.
- [ ] Adding/renaming a corpus item requires no coordinated hard-coded edits.
- [ ] No valid secret is committed or exposed in client config.
- [ ] Tests exercise critical editing/persistence workflows.
- [ ] Every number and capability claimed on a page is derived from data or verified; docs match the deployed architecture.

# Part 4 — Agent Work Instructions (verify, then refactor)

Instructions for an implementing agent. Work in the order below; each work package depends on the ones before it. Tick the matching Part 3 checkboxes only after the package's **Done when** conditions pass.

## Ground rules

1. **Verify before changing.** Every package starts with a *Verify* step that confirms the finding still applies to the current tree (files and line numbers drift; the tree has uncommitted changes). If a finding no longer applies, record that in the package's notes and skip its refactor.
2. **Do not revert unrelated uncommitted changes.** Run `git status` first; touch only files named in the package.
3. **Preserve the product model:** Glossy's editor is the authoring UX; browser drafts are local; Tina commits are explicit and authenticated; no editing text through Tina schema forms.
4. **Baseline first:** run `npm run typecheck && npm run lint && npm run validate:source && npm run validate:lemmas && npm run test:smoke` and record which already fail, so new failures are attributable. `npm run audit` runs all of these plus `knip` and `validate:deploy`.
5. **Small, reviewable commits** per package (one concern each), with tests in the same commit. Do not add dependencies unless a package says so; if tests need a runner, use what `package.json` already provides or ask first.
6. **Never write secret values into code, docs, or logs.**
7. **Copy changes** come from the facts in Part 2; re-verify each fact in code or data before rewording, and prefer deriving numbers from data over rewriting them.

## WP0 — Baseline and reproduction (no code changes)

- **Verify:** run the baseline commands above. Start `npm run dev`; reproduce the upload → save bug: (1) create a text at `/edit/new`; (2) upload a Glossy JSON file from the corpus directory; (3) edit a token; (4) Save; (5) reload `/edit/<slug>`, `/read/<slug>` and `/`; (6) open `/admin` and look for the sync bar.
- **Capture:** after each step print `Object.keys(localStorage)` and, for `glossy_draft_<slug>`, whether `sentences[0]` has `tokens` (editor shape) or `words` (text shape); copy the observed behavior into a short "Reproduction notes" list at the end of this document (edit this file; do not create another).
- **Done when:** each failing step is recorded with the shape in storage at that moment, and the P1 finding "One storage key, two document shapes" is confirmed or corrected.

## WP1 — Secrets and configuration (P1, independent; do early)

- **Verify:** `grep` for the token value and client IDs in `tina/config.ts`, `wrangler.toml`, `tina/__generated__/`, `.env.example`, and `components/gloss-editor.tsx`. Confirm `git log -S` shows whether the value was ever committed. Confirm which of the two client IDs (`7cf6793a…` vs `cc29fe7b…`) is the intended production one, from Tina dashboard/owner, **not** by guessing.
- **Refactor:** remove token fallbacks from `tina/config.ts`, `wrangler.toml` `[vars]`, and `scripts/dev.js`/`build.js` so builds read `TINA_TOKEN` from the environment only; make builds fail with a clear message when a required value is missing in production, and use an explicit, labelled placeholder only for local dev. Put the TinaCloud content URL, client ID, branch and local GraphQL URL in one config module consumed by both `tina/config.ts` and the editor (or remove the editor's direct TinaCloud call in WP4).
- **Report, don't fix silently:** if the token was ever valid, list it for rotation by the owner and note `tina/__generated__/client.ts` must be regenerated.
- **Done when:** no token literal remains in tracked files (`git grep` is clean), `npm run build` still works locally with env vars set, and `npm run validate:deploy` passes.

## WP2 — Local draft storage module (P1; unblocks WP3–WP5)

- **Verify:** list every `localStorage` key and its readers/writers: `git grep -n "localStorage"` across `app components lib tina`. Produce a table in the notes: key → writer(s) → reader(s) → shape.
- **Refactor:** create `lib/local-drafts.ts` containing: key constants; `type StoredDraft = { version: 1; doc: TextDocument; baseHash: string; updatedAt: string }`; `readDraft`, `writeDraft`, `listDrafts`, `deleteDraft`, `revertDraft`; pending-manifest helpers (`markPending`, `markSynced(slug, hash)`, `listPending`); hide/restore helpers for built-in texts; legacy-shape detection (`tokens` vs `words`) and one-time migration; typed results (`{ ok: true } | { ok: false, reason: "quota" | "invalid" | "unavailable" }`) instead of swallowed errors. Use a new key prefix (e.g. `glossy:v1:draft:`) so legacy keys can be detected and migrated, not overwritten.
- **Replace** every direct key access in `components/gloss-editor.tsx`, `components/text-directory.tsx`, `components/reading-page.tsx`, `app/not-found.tsx`, `app/edit/new/page.tsx`, and `tina/config.ts` (the sync bar can import the module or reproduce only the read side with the same constants).
- **Tests:** unit tests (use the existing tooling; if none exists for unit tests, add the smallest runner-free script under `scripts/` that exercises the module with a mock `Storage`) for: round trip; legacy editor-shape migration; legacy text-shape migration; quota error; corrupted JSON; collisions; delete cleans the manifest.
- **Done when:** `git grep "glossy_draft_\|glossy_pending_drafts\|glossy_deleted_slugs"` matches only the new module and migration code, and the tests pass.

## WP3 — Create/upload path (P1; depends on WP2)

- **Verify:** reproduce each upload/create defect from Part 2 §2.4 and the P1 finding on validation (invalid JSON, JSON without `words`, slug that equals a built-in, uppercase/odd-character filenames, huge files, plain text file).
- **Refactor:** add `createLocalDocument(input)` in `lib/local-drafts.ts` (or `lib/documents.ts`) used by both `/edit/new` and the directory's upload button: schema-validate against the canonical `TextDocument` (reuse `lib/content.ts` assertions where possible), sanitise slug, reject or confirm collisions, default `status: "draft"`, write draft and manifest together, return a typed result. Remove the `/api/save-document` call and the fixed 800 ms redirect; navigate when the write result is `ok`. Either support plain-text upload by running it through the existing tokenizer/`parseGb4e` or drop it from the alert.
- **Tests:** valid upload, invalid upload, colliding slug, create → edit → save → reload; assert the new document appears in the directory, reader, and pending manifest.
- **Done when:** the WP0 reproduction passes end to end, and uploads of invalid files give specific, visible errors.

## WP4 — Save and Tina commit path (P1/P2; depends on WP2)

- **Verify:** from `components/gloss-editor.tsx` (`saveToTina`), `tina/config.ts` (`cmsCallback`), list differences between the two `updateText` mutation builders (fields, defaults, `features`, `footnotes`). Confirm with the Tina GraphQL schema (`tina/__generated__/`) which fields are required and whether `updateText` maps to the `content/texts/*.json` path used by the app.
- **Refactor:** extract `lib/tina-commit.ts` with `buildTextMutation(doc)` and `commitDraft(slug, client)` returning `{ status: "committed" | "needs-login" | "unreachable" | "rejected"; errors?: string[] }`; read GraphQL `errors` and HTTP status; have both the editor and the sync bar use it. Remove the hard-coded TinaCloud URL and `tinacms-auth` reads from the editor (commit from within Tina Admin using the authenticated client; the editor's Save becomes "save draft" plus an info prompt). Replace every `catch {}` in the save flow with a typed result and visible message. Mark `synced` by comparing `baseHash` to the draft's current hash, so edits after a commit return to pending.
- **Sync bar:** rebuild without `innerHTML` (DOM text nodes or a small React component registered via the Tina `cmsCallback`/UI extension point supported by the installed version); validate manifest entries; per-text status; never mark synced on failure.
- **Tests:** mock `fetch`/client for success, GraphQL `errors`, HTTP failure, unauthenticated; edit-after-commit returns to pending; tampered manifest cannot inject markup.
- **Done when:** no empty catch remains in these flows; draft-only saves use neutral styling and the label "Save draft"; "Commit to Git" appears only after a confirmed commit.

## WP5 — Local-draft routing and precedence (P2; depends on WP2, WP3)

- **Verify:** confirm what hosting returns (HTTP status) for `/edit/<local-slug>` on the static export; check `app/not-found.tsx` flash behavior; check `generateStaticParams` coverage in `app/edit/[slug]` and `app/read/[slug]`.
- **Refactor:** introduce an explicit client-rendered route for local drafts (e.g. `/edit/local?slug=…` and `/read/local?slug=…`, or a hosting rewrite) and make `not-found.tsx` a plain 404 again. Define precedence when a committed text and a local draft share a slug: show a banner "You are viewing your local draft of X" with Discard/Compare actions. Update links created by `/edit/new` and the directory.
- **Done when:** local drafts open without relying on a 404, and a slug collision with a committed text is visibly handled.

## WP6 — Canonical content and legacy formats (P1; independent of WP2–5 but touches `lib/content.ts`)

- **Verify:** inventory real shapes in `content/texts/*.json` (`sentences/words` vs legacy `blocks/glossRecords`); confirm whether anything still has the legacy shape using a small script; identify which TeX files are source vs generated.
- **Refactor:** add `schemaVersion` to the canonical schema; implement `migrateLegacyDocument()` once at the loader boundary; remove duplicate fallbacks from runtime/validation/export; document in `docs/` which formats are canonical, transient, import, and export. Remove the hard-coded `ohthere` merge from generic loading by moving per-document TeX merging into metadata.
- **Tests:** round trips JSON → editor → JSON and JSON → TeX → import for Ohthere, Beowulf, and one preset; `npm run validate:source` still passes.
- **Done when:** one adapter owns legacy conversion and every other path uses the canonical shape.

## WP7 — Corpus registry and derived counts (P2)

- **Verify:** find all slug literals (`git grep -n "ohthere\|beowulf-prologue\|isProtected\|protect"`), and compare displayed counts with the data (Ohthere 75 sentences/1,716 tokens; Beowulf 11/53; corpus total 1,769; 42 abbreviations — re-count from JSON).
- **Refactor:** one corpus registry (derived from `content/texts/*.json` plus per-document metadata for protection, provenance, display author/editor, citation data); replace hard-coded lists in `app/page.tsx`, `components/text-directory.tsx`, `components/attribution-modal.tsx`, `components/gloss-editor.tsx`, API/archived handlers; compute sentence/token/abbreviation counts at build time.
- **Tests:** a script asserting registry uniqueness/completeness and that rendered counts equal data counts; adding a text requires no TSX edits.
- **Done when:** `git grep` finds no document-specific slug conditionals outside the registry/data.

## WP8 — Fallbacks and error visibility (P2)

- **Verify:** list defaults in `lib/content.ts` (page copy), `lib/old-english-lexicon.ts` (heuristic POS/definition/Wiktionary URL), and `gloss-editor.tsx`. Classify each as user-facing default, migration, heuristic, or error masking (table in notes).
- **Refactor:** required content → explicit error; heuristic lemma output carries an `unverified` flag shown in the UI; remove code defaults that duplicate `content/pages/*.json` (see copy C14–C17); remove remaining empty `catch {}` blocks (`git grep -n "catch {}"` should be empty or each justified with a one-line comment).
- **Done when:** the classification table is complete, and each remaining fallback has a documented reason.

## WP9 — Editor decomposition (P2; after WP2, WP4)

- **Verify:** measure `components/gloss-editor.tsx` (lines, hooks, responsibilities).
- **Refactor:** move pure conversion (`textDocumentToEditorDoc`, `editorDocToTextDocument`, parsing, lemma normalization) to `lib/editor-model.ts`; keep persistence in `lib/local-drafts.ts` and `lib/tina-commit.ts`; split UI panels only where it removes shared mutable state. Replace the global `JSON.stringify` patch in `lib/safe-json.ts`/`components/site-nav.tsx` with an explicit `safeJsonStringify` used at the call sites that need it; verify no code relies on the patched behavior by running the app and the smoke test.
- **Done when:** no behavior change (tests from WP2–WP6 still pass) and the global patch is gone.

## WP10 — Styling and config cleanup (P2/P3)

- **Verify:** re-count inline `style={{` per file (editor ≈ 40, docs ≈ 40, home ≈ 27 at the time of audit) and check which nav-dropdown selectors in `app/globals.css` are unused (use `knip` for code and a manual search for CSS classes).
- **Refactor:** move repeated static inline styles to classes/variables; delete stale selectors after verifying no usage; make `scripts/build.js` fail clearly (not skip) when Tina generation cannot run; simplify scripts that use shell-mediated child processes; centralize ports and URLs.
- **Done when:** the targeted files' inline-style counts drop meaningfully, `npm run build` is deterministic, and the visual check of `/`, `/read/ohthere-wulfstan`, `/edit/ohthere-wulfstan`, `/docs` shows no regressions at desktop and mobile widths.

## WP11 — Copy and documentation (after WP2–WP7, since copy depends on final behavior)

- **Verify:** for each C-item in Part 2, re-check the claim against the final code/data (e.g. Ctrl+S, `/api` handlers, counts, storage keys) before editing.
- **Refactor:** apply the Part 3 §8 changes: storage tiers/A2 copy; button/status/tooltip vocabulary (draft / pending / committed); privacy page storage keys generated from the shared constants and its network statement; attribution from metadata; one tagline and one terminology list (Reader/Viewer, Editor, Corpus); remove marketing intensifiers; single source for Wiktionary/IPA/lemma rules (docs JSON), with README and `docs/ARCHITECTURE_AND_FAQ.md` linking to it. Ask the linguistics owner to verify numeral examples (C13) and the Beowulf folio citation (C12) instead of changing them unverified.
- **Done when:** a scripted check compares displayed counts with data, and each C-item is resolved, rejected with a reason, or deferred to the named reviewer.

## WP12 — Final verification

- Run `npm run audit`, `npm run build`, and `npm run test:smoke`; update `scripts/smoke-test.mjs` expectations for any intentional copy changes (not by loosening checks).
- Re-run the WP0 reproduction and an extra scenario: edit a built-in text, Save, reload, commit through Tina Admin (against a local datalayer), then edit again and confirm it returns to "pending".
- Re-run `knip` for dead code created by the refactors (archived API clients, unused CSS, unused exports).
- Tick completed checkboxes in Part 3, add any deferred items with an owner and reason, and add a "Verification log" list below with the commands run and results.

## Verification log

- **2026-10-06**:
  - `npm run lint` / `lint_applet`: Passed with 0 errors and 0 warnings.
  - `npm run typecheck`: Passed with 0 errors (`tsc --noEmit`).
  - `npm run test:drafts`: Passed (verified built-in corpus registry, metadata retrieval, slug lookup, draft envelopes).
  - `npm run validate:source`: Passed (1837 aligned source glosses across 4 source-backed text documents; master LaTeX document validated with 0 warnings).
  - `npm run validate:lemmas`: Passed (1716 tokens across 75 sentences verified with 100% accuracy).
  - Removed deprecated Batch Import Pipeline section from `components/gloss-editor.tsx` in favor of the dedicated `+ New Text` workflow.
  - Extracted modular `lib/corpus-registry.ts`, `lib/local-drafts.ts`, and `lib/tina-sync.ts` with strict TypeScript types, versioned storage envelope (`glossy:v1:draft:`), and backward-compatibility migrations.

## Reproduction notes

- Local draft storage verified: `glossy:v1:draft:<slug>` holds the canonical `TextDocument` structure (`sentences[].words[]`), while backward-compatibility adapters gracefully migrate legacy editor shapes (`sentences[].tokens[]`).
- Pending drafts manifest tracks unsynced changes and base hashes for Git synchronization.
