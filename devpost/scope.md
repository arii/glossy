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
The student opens a selected Old English passage, begins reading, and hovers over or clicks text that needs explanation. Glossy reveals the relevant static gloss, and the student dismisses it or moves on when it is no longer needed.

## Inspiration & Identity
The first content is based on the referenced annotated PDF, `references/Voyages_of_Ohthere_Wulfstan.pdf`, with source material in the accompanying LaTeX file. The project is inspired by the annotated *Alice in Wonderland* example from [Old English Aerobics](https://oldenglishaerobics.net/). It should feel like a clear, readable digital marginal gloss: focused on the text, with supporting information available without overwhelming the reading experience.

## Why This Matters to the Learner
The learner wants to build a web visualizer for Old English annotations using Next.js and explore how the existing glossy PDF experience can become interactive.

## What "Working" Looks Like
A student opens one Old English passage and reads it in the browser. When they hover over or click a word or phrase, the associated gloss appears in a clear visual relationship to the text, helping them understand the language. The compelling moment is seeing the static glossing concept become an easy-to-read, on-demand interaction.

## The POC Boundary
Build a Next.js website for one selected Old English text, using static glossed information derived from the referenced PDF/LaTeX example. Support reading the passage and revealing or hiding glosses through hover or click. Prioritize legibility and the connection between source text and gloss.
Include optional browser speech for hearing the selected word when the local browser provides speech synthesis. Passage-level read-aloud is deferred because the current browser voices do not preserve Old English pronunciation reliably; revisit it with recorded audio or an IPA-capable backend.

## Later
- Additional Old English texts and a broader content library.
- Dynamic glossing or generated explanations.
- Asking questions about the passage.

## Explicitly Cut
- Dynamic question answering and generated glosses: these are intentionally deferred until the static interaction is proven.
- User accounts, annotation editing, and a full language-learning system: outside the first proof of concept and not required for the core reading loop.
