---
doc: scope
status: approved
---

# Glossy

Glossy is a local-first linguistic editing workbench and a separate interactive reader. It turns source-backed texts into editable interlinear glosses, explanatory word details, and exportable LaTeX.

## The Unique Kernel
Glossy makes the link between a text, its interlinear gloss, and its linguistic explanation editable and visible as the author works. An editor changes a token and immediately sees the result in a live interlinear preview; the published reader then lets students hover over or click that word to inspect its meaning, grammar, and role.

## Who It's For
An editor, linguist, or educator who creates interlinear texts and the students or researchers who read them. Editors need source-faithful authoring, analysis, and export; readers need clear gloss lines and useful linked explanations instead of separate PDFs and notes.

## ## The Core Loop
An editor opens a source-backed text in the separate authoring workspace, edits tokens and their analyses against a live interlinear preview, and the browser keeps an unpublished draft locally. The editor reviews it, explicitly saves confirmed changes through TinaCMS into Git-backed content, or exports a LaTeX document. A reader uses a separate, clean route to read the published text and open linked explanations.

## Inspiration & Identity
The first content is based on the referenced annotated PDF, `references/Voyages_of_Ohthere_Wulfstan.pdf`, with source material in the accompanying LaTeX file. The project is inspired by the annotated *Alice in Wonderland* example from [Old English Aerobics](https://oldenglishaerobics.net/). It should feel like a clear, readable digital marginal gloss: focused on the text, with supporting information available without overwhelming the reading experience.

## Why This Matters to the Learner
The learner wants to turn the existing LaTeX/PDF glossing workflow into a live, editable web tool while keeping the student-facing visualizer as a separate output.

## What "Working" Looks Like
An editor changes a word or its analysis and immediately sees the live gloss and linked explanation update without changing the saved source. The compelling moment is seeing one carefully structured source model power both an interactive editing preview and a clean reader, while remaining exportable to the original LaTeX format.

## ## The POC Boundary
Build separate reading and editing routes around versioned JSON files in Git; do not add a SQL database or a paid runtime service. The editor supports source text, aligned gloss tokens, word-level linguistic details, translations, source metadata, and the document resources/abbreviations needed for a useful LaTeX export. Editors can paste supported `gb4e` LaTeX (`\gll`/`\glt`) into the editor to import it into the shared text model; the first supported import targets the supplied manuscript format, not arbitrary TeX packages or macros. An edit updates the live preview and stays in a recoverable browser-local draft until the editor explicitly confirms saving it through TinaCMS. Tina writes the confirmed changes to the repository-backed content; Git commit/push remains a distinct version-control step.

The reader is a clean, independent view with hover, focus, or tap explanations. The first complete text must preserve the source TeX's 13 paragraph groups and 75 examples, including translations, notes, resource citations, and glossing abbreviations. Use stable lexical IDs to support term reuse across texts; additions of other texts must use the same text-agnostic model. The TeX manuscript remains the source of truth for transcription, while editors own linguistic analysis and review.
Audible pronunciation is deferred until a reliable recorded or IPA-compatible solution is available; do not expose browser-generated speech that mispronounces the language.

## Implementation Status (2026-10-03)

The current app parses the supplied manuscript into a JSON reader/editor document and generates dictionary JSON from the curated lexicon. The editor's pasted-TeX flow currently appends parsed sentences; it does not import the complete resources, abbreviations, bibliography, or paragraph metadata. Its Save action writes generated TeX and JSON through a local API, then attempts an optional Tina update; that is not yet the Tina-only, confirmed publication flow described above. Treat the full metadata and publishing behavior in the POC boundary as requirements, not verified shipped features. LaTeX export is normalized but does not yet preserve every source resource or document setting.

The remaining acceptance criteria and verification steps are enumerated in `checklist.md > Follow-up Requirements`; completion of the build-slice checklist alone does not satisfy them.

## Later
- Arbitrary TeX import, including automatic recovery of every package, comment, and custom macro from unknown documents.
- Collaborative editing, accounts, remote deployment, and runtime linguistic generation.
- Reliable recorded or IPA-compatible pronunciation audio.

## Explicitly Cut
- Runtime linguistic analysis and generated explanations: curated editing and display are in scope; generated interpretation is deferred.
- User accounts, collaborative editing, and a full language-learning system: outside the first proof of concept.
- Byte-for-byte TeX round-tripping: export preserves the document's supported content and structure in a normalized template, not whitespace, comments, or arbitrary package macros.
