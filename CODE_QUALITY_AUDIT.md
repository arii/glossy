# Glossy Audit and Remediation Plan

This single document contains: **Part 1** engineering practices audit, **Part 2** copy audit (on-page text), and **Part 3** a checkbox remediation plan covering both.

# Part 1 — Engineering Practices Audit

**Reviewed:** 2026-10-06  
**Review type:** Static source review of first-party application, library, script, style, and deployment-configuration files in the current checkout. This is an engineering-quality audit, not a runtime test or a complete security assessment.

## Executive summary

The most significant maintainability risk is not any one code smell: application behavior is spread across overlapping representations, conversion and fallback paths, document-specific exceptions, and duplicated configuration. This makes it difficult to determine which data or behavior is authoritative and increases the chance that a change fixes one path while leaving another inconsistent.

**Intended product model:** Glossy's dedicated editor provides the text-editing UX; working edits can remain local drafts and be represented as JSON; TinaCMS provides the Git-backed propagation/publishing path. Tina's generated schema/admin is not intended to replace Glossy's editor UI. These are distinct roles, not a goal of making the published app read-only or requiring editors to manipulate raw schema forms. Findings below target unclear or duplicated implementation boundaries around that model, not the model itself.

**Current direction (in-progress changes in the working tree):** the editor's **Save** writes a full browser draft (`glossy_document_*`, plus a `TextDocument`-shaped copy at `glossy_draft_<slug>`) and records it in a `glossy_pending_drafts` manifest with a `synced` flag; it also attempts a Tina `updateText` GraphQL mutation (local `localhost:4001` on localhost, or TinaCloud when a `tinacms-auth` session exists). `tina/config.ts` now adds a `cmsCallback` that shows a "Local Storage Draft Detected" bar inside Tina Admin, whose "Commit Draft to Git" button sends pending drafts through Tina's authenticated client. In other words: **edit in Glossy's UX → local draft → commit through an authenticated Tina session**. This document treats that as the target flow and evaluates the implementation and copy against it. The audit reflects the working tree as reviewed on 2026-10-06, including uncommitted changes.

The recommendations focus on simplifying those paths, making persistence outcomes truthful, centralizing shared decisions, and distinguishing intentional compatibility from accidental fallback behavior. A fallback is not inherently a bad practice; it becomes a liability when its supported inputs, precedence, and retirement criteria are unclear.

## Findings

| Priority | Area | Evidence | Practice and impact | Recommended direction |
|---|---|---|---|---|
| **P1 — High** | Embedded CMS credential | `tina/config.ts:12-14`; `[vars]` in `wrangler.toml` | A token value is embedded both as the Tina config fallback and in deployment configuration. This is a deployment and maintenance hazard even if the value is currently public or inactive; if valid, source access exposes it. | Remove token values from committed config, provision secrets through the deployment environment, and rotate/revoke the value if it was active. Keep only non-secret client/branch configuration in source. |
| **P1 — High** | Persistence boundaries are mixed with stale direct-API paths | `components/gloss-editor.tsx:514-580,625-644`; `app/edit/new/page.tsx:353-374`; corresponding handlers are under `scripts/archive/api/` | The intended workflow has useful, separate steps—Glossy's editor/local draft, then a deliberate Tina-backed Git propagation. In current source, Save now also attempts a full-document Tina `updateText` mutation directly from the editor (localhost, or TinaCloud with a hard-coded content URL and the `tinacms-auth` token from `localStorage`), and Tina Admin offers a second commit path for pending drafts. Create/delete still call `/api/...` handlers that are archived. Having two client-side commit paths (editor and Tina Admin), both swallowing errors, makes the actual outcome hard to reason about. This is not a criticism of the Git-backed Tina feature or a recommendation to remove the custom editor. | Pick one commit path (preferably a single shared module used by both the editor's Save/Publish and the Tina Admin sync bar), with the `glossy_pending_drafts` manifest as the only draft-state record. Document: local draft and recovery → authenticated Tina commit → optional JSON/LaTeX export. Remove or clearly scope the archived-API requests, and report local draft vs Tina-confirmed publication distinctly. |
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
| C1 | High | "Dual-write storage syncs localStorage (Tier 1), .tex and .json files (Tier 2), and TinaCMS working trees (Tier 3) with zero data loss." | `content/docs/architecture-faq.json` (`architectureSpecDescription`, `storageTiers`); docs A2 heading "Dual-Write CMS Integration" and "robust three-tier data synchronization model" in `app/docs/page.tsx` | Under the current flow, Save writes a browser draft and a pending-drafts manifest, then tries a Tina mutation; Tina Admin offers "Commit Draft to Git" for pending drafts. The `/api/save-document` handler is archived, so direct `.tex`/`.json` file writes are not part of the static deployment, and there is no "dual-write". "Zero data loss" is not supportable for browser storage. | Rewrite to the real flow: (1) edits autosave to a browser draft; (2) Save records a pending draft; (3) a signed-in Tina session commits it to Git; (4) Export JSON/.tex is a manual copy. Drop "dual-write", "synchronization" and "zero data loss", and say drafts live in this browser only until committed. |
| C2 | High | Tier 2: "Clicking Save to TinaCMS or pressing Ctrl+S writes .tex to references/ and JSON to content/texts/" | `architecture-faq.json` | No Ctrl+S handler exists in `components/gloss-editor.tsx`, and Save does not write `.tex` or `references/`; it writes a draft and attempts a Tina mutation for the JSON document (`updateText` with `texSource`). | Describe exactly what Save does; remove Ctrl+S unless implemented. |
| C3 | High | "Ensuring instant editorial synchronization and visual authoring fidelity" (Tier 3) | `architecture-faq.json` | Overclaim; commits happen when a signed-in user confirms them, and there is no live synchronization. | Neutral wording: "Committing through TinaCMS (requires sign-in) saves your draft to the repository." |
| C4 | Medium | "Abbreviation reference: 37" vs "42" | `tina/config.ts` field label "37 Leipzig Glossing Abbreviations"; comment at `app/docs/page.tsx:195`; visible heading `app/docs/page.tsx:214` "42"; README and FAQ say 42; JSON has 42 | Count appears in four places and one is wrong. | Compute the number from the data (`items.length`) or drop it from labels. |
| C5 | Medium | "100% data integrity", "100% token and gloss alignment… with zero warnings" | `app/docs/page.tsx` (A3 intro), `architecture-faq.json` | Absolute claims about validators that check specific properties only. | Say what is validated (e.g., token/gloss counts match, lemmas exist in dictionary). |
| C6 | Medium | Content pre-compiler described as targeting only `ohthere.json` | `architecture-faq.json` `verificationTools` | `compile:beowulf` also exists. | List both or describe generically. |
| C7 | Medium | Verification table commands: `node scripts/validate-lemmas.mjs` vs `npm run …` | `architecture-faq.json` | Inconsistent invocation; `npm run validate:lemmas` is the documented script. | Use npm script names throughout. |
| C8 | Medium | Footer "Admin Login" and `/admin` page "Redirecting to TinaCMS editorial suite…" | `components/site-footer.tsx`, `app/admin/page.tsx` | Tina Admin is the sign-in and commit surface for drafts (the sync bar), not the text-editing UX. "Editorial suite" (also the editor's "Open Tina CMS Editorial Suite (Git-backed)" tooltip) and "Admin Login" overstate or understate that role. | Use "Commit drafts (TinaCMS sign-in)" in the footer, `/admin`, and the editor's "Tina Admin ↗" button. |
| C9 | Medium | Delete confirm: "This will delete its JSON data and LaTeX files." | `components/text-directory.tsx:35` | The delete call targets an archived `/api` handler; the static app likely cannot delete files. | Make copy match what delete really does, or hide the control. |
| C10 | Medium | Button "Save to TinaCMS" (tooltip "Save working draft to browser storage and sync to TinaCMS / Git"), success text "Saved and synchronized directly to TinaCMS… and browser storage", fallback text "To commit your changes directly to Git, open Tina Admin (↗)", and sync-bar copy "Commit Draft to Git" | `components/gloss-editor.tsx:669,984-991`; `tina/config.ts` `cmsCallback` | The button label claims a Tina save that often only produces a local draft; "synchronized … to TinaCMS" does not mean the Git commit happened; "Git" and "TinaCMS" are used interchangeably; the fallback is styled as success. | Rename the button "Save draft"; reserve "Commit to Git" for confirmed Tina commits; use neutral/info styling for draft-only results and error styling for failed commits; one shared glossary entry for draft / pending / committed. |
| C10a | Medium | Sync bar: "Local Storage Draft Detected… Commit this draft directly to TinaCMS & Git repository" | `tina/config.ts` `cmsCallback` | Says "unsynced" without saying what differs from the repository, or that drafts exist only in this browser. | Say "Unpublished draft in this browser: <title>"; show date and word count (already in the manifest); explain what commit does and that it overwrites the repository copy. |
| C11 | Low | Attribution: "London: British Library witness" applied to every text; `origdate = ca. 890` default; URL `https://glossy.local/read/…`; hard-coded "2026"/"September 30, 2026" | `components/attribution-modal.tsx:23-76`; `gloss-editor` default date | Wrong publisher/date/URL for non-Ohthere texts; placeholder host in a user-facing citation. | Source from per-text metadata; use the real site URL; omit unknown fields. |
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

## 2.4 Copy limitations

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
- [ ] Make delete confirmation match real behavior (C9).
- [ ] Source attribution date, publisher, `origdate`, and URL from per-text metadata; remove `glossy.local` (C11).
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
