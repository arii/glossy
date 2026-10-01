---
doc: scope
status: approved
---

# Glossy

Glossy is a Next.js website that turns a static annotated Old English PDF into an interactive visual gloss for students.

## The Unique Kernel
Glossy makes glosses appear and disappear directly around the Old English text as the student reads. A student can hover over or click a difficult word or phrase and immediately see readable information about its meaning, grammar, and role in the passage instead of switching between a PDF, dictionary, and separate notes.

## Who It's For
A college student studying Old English for linguistic or literary analysis. They are trying to understand what is happening in the language while reading, improve their vocabulary and grammar, and currently rely on static PDFs or other separate reference material.

## The Core Loop
The student opens a complete Old English text, reads each original line with its source gloss on the next line, and hovers over or clicks an annotated form for expanded details. They use the two-level glossing to understand the passage and continue reading.

## Inspiration & Identity
The first content is based on the referenced annotated PDF, `references/Voyages_of_Ohthere_Wulfstan.pdf`, with source material in the accompanying LaTeX file. The project is inspired by the annotated *Alice in Wonderland* example from [Old English Aerobics](https://oldenglishaerobics.net/). It should feel like a clear, readable digital marginal gloss: focused on the text, with supporting information available without overwhelming the reading experience.

## Why This Matters to the Learner
The learner wants to build a web visualizer for Old English annotations using Next.js and explore how the existing glossy PDF experience can become interactive.

## What "Working" Looks Like
A student selects a complete text, reads the Old English with its source gloss on a separate line, and hovers over or clicks a word to open expanded details. The compelling moment is seeing the source manuscript's interlinear glossing and its deeper analysis made readable and interactive.

## The POC Boundary
Build a Next.js website for a small library of complete Old English texts, using static glossed information derived from the referenced PDF/LaTeX example. Keep each source gloss directly beneath its Old English form, and let hover, focus, or tap open the expanded linguistic details. Prioritize legibility and the connection between source text and gloss.
Use TinaCMS as a form-based editing surface for complete text documents and gloss records so editors can add texts and correct translations, source glosses, morphemes, IPA, and review metadata without manually editing JSON or component code. The TeX manuscript remains the source of truth for source verification; TinaCMS is the authoring and review workflow, not an automatic linguistic authority.
Audible pronunciation is deferred until a reliable recorded or IPA-compatible solution is available; do not expose browser-generated speech that mispronounces the language.

## Later
- Dynamic glossing or generated explanations.
- Asking questions about the passage.
- Reliable recorded or IPA-compatible pronunciation audio.

## Explicitly Cut
- Dynamic question answering and generated glosses: these are intentionally deferred until the static interaction is proven.
- User accounts, annotation editing, and a full language-learning system: outside the first proof of concept and not required for the core reading loop.
