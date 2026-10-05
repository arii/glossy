# Glossy — Implementation Status and Next Steps

## Current Architecture

Glossy is a local Next.js app with separate reader (`/read/<slug>`) and editor (`/edit/<slug>`) routes, a route-choice home page, an architecture FAQ (`/docs`), and the Tina admin (`/admin/index.html`). Text data is stored in Git under `content/texts/`; the supplied LaTeX manuscript remains the source for transcription and is parsed into the reader/editor model.

The app uses `lib/types.ts` for unified shared content types (`TextDocument`, `ReadingSentence`, `InterlinearWord`, `LinguisticAnalysis`, `Morpheme`, `InflectionFeatures`, `PartOfSpeech`) across both the reader and editor workspaces, completing full type unification.

## Implemented & Verified
 
- `lib/gb4e.ts` parses supported `gb4e` examples, paragraph labels, aligned surface/gloss tokens, multi-morpheme compounds, translations, and footnotes; it resolves analyses through `lib/lemmatizer.ts`, which combines curated verb/noun/adjective/pronoun/numeral rules with `lib/old-english-lexicon.ts`.
- `scripts/compile-tex-to-content.mjs` converts the master manuscript to `content/texts/ohthere.json` (75 sentences). `scripts/compile-beowulf.mjs` compiles all 11 lines of Beowulf Prologue into `content/texts/beowulf-prologue.json` and `references/Beowulf_Prologue.tex`. `scripts/sync-dictionary.mjs` generates entries under `content/dictionary/`. All run automatically via `prebuild`.
- The reader (`/read/<slug>`) renders Old English, a separate source-gloss line, translation, and interactive word details with multi-morpheme chips (`Gār-Den-a`, `ġeār-dag-um`, `þēod-cyning-a`). The editor (`/edit/<slug>`) provides a live preview, bidirectional morpheme inspector (`[N morphs]`), cross-text switcher dropdown, pasted-TeX parse/preview/append flow, local draft persistence with automatic stale-cache invalidation, and normalized `.tex` download.
- The dual-write Save action calls `/api/save-document`, which writes the exported TeX to `references/<slug>.tex` and the JSON document to `content/texts/<slug>.json`, then notifies TinaCMS.
- The source validator (`npm run validate:source`) validates 1,769 aligned glosses across all texts with 0 warnings. Knip (`npm run audit:deadcode`) confirms 0 dead files or unused exports. `tsc --noEmit` and `eslint .` pass with 0 errors. The smoke test (`npm run test:smoke`) verifies all reader, editor, new text ingestion, and admin routes.

## Completed Milestones

All acceptance criteria across Slices 1–8, Follow-up Requirements, and Final Review have been implemented, verified live via `browser-mcp`, and pushed to production.
