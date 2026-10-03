# Linguistic Data Architecture, LaTeX Parsing & FAQ Guide

This document provides a comprehensive technical and linguistic reference for how the Old English glossing system parses documents, structures its data model, derives lemmas and Wiktionary references, and verifies data integrity.

---

## 1. How the `.tex` Document is Parsed and the Data Model

### Parsing Mechanism
The master document located at `references/Voyages_of_Ohthere_Wulfstan.tex` is authored using standard LaTeX linguistics conventions with the `gb4e` package (`\begin{exe}`, `\begin{xlist}`, `\ex`, `\gll`, `\glt`).

The parser (`lib/content.ts` and `app/api/master-tex/route.ts`) processes this file through the following stages:

1. **Preamble Metadata Extraction**:
   - Matches document title (`\title{...}`), author (`\author{...}`), and date (`\date{...}`).
2. **gb4e Interlinear Block Extraction**:
   - Identifies every `\ex` or `\ex{\gll ... \\ ... \\ \glt ...}` block.
   - Line 1: Surface forms separated by whitespace.
   - Line 2: Morphological glosses (using `\textsc{...}` Leipzig abbreviations or plain text).
   - Line 3 (`\glt`): Free translation string.
3. **Balanced Footnote & LaTeX Command Stripping (`stripLatexFootnotes`)**:
   - Handles LaTeX footnotes (e.g. `\footnote{Some versions have \textit{fætels}...}`) by tracking opening and closing brace depths (`{` and `}`) rather than greedy/lazy regexes. This prevents nested braces from prematurely truncating translation lines.
   - Cleans formatting macros such as `\textit`, `\textbf`, `\textsc`, `\href`, and `\url` while preserving plain readable text.
4. **1-to-1 Token Alignment & Morpheme Segmentation**:
   - Line 1 surface words and Line 2 gloss words are indexed and paired 1-to-1.
   - If words are hyphenated (e.g., surface: `sǣ-d-e`, gloss: `say-PST-IND3SG`), they are segmented into component `Morpheme` objects (`sǣ` $\rightarrow$ `say`, `d` $\rightarrow$ `PST`, `e` $\rightarrow$ `IND3SG`).
   - Trailing punctuation (`.`, `,`, `;`, `:`, `!`, `?`) is separated so root tokens can be analyzed cleanly while preserving typographic flow.

---

### Data Model

The application uses a typed, hierarchical data model in TypeScript:

```typescript
// Core Morpheme Unit
interface Morpheme {
  id: string;
  morpheme: string;    // e.g. "sǣ"
  gloss: string;       // e.g. "say"
}

// Token (Word) Unit
interface Token {
  id: string;
  sourceForm: string;        // Surface form with punctuation (e.g. "sǣ-d-e.")
  sourceGloss: string;       // Human-readable Leipzig gloss (e.g. "say-PST-IND3SG")
  literalTexGloss: string;   // Raw LaTeX markup (e.g. "say-\\textsc{pst}-\\textsc{ind.3sg}")
  lemma: string;             // Dictionary headword (e.g. "secgan")
  pos: string;               // Part of Speech ("verb", "noun", "adjective", etc.)
  explanation: string;       // English gloss definition
  inflections: {
    case?: "nominative" | "accusative" | "genitive" | "dative";
    number?: "singular" | "plural";
    gender?: "masculine" | "feminine" | "neuter";
    tense?: "present" | "past";
    mood?: "indicative" | "subjunctive" | "imperative" | "infinitive";
    person?: "1" | "2" | "3";
  };
  morphemes: Morpheme[];     // Morphological breakdown
  ipa: string;               // Phonetic pronunciation (e.g. "/ˈsæː.de/")
  wiktionaryUrl: string;     // Reference link to Wiktionary entry
}

// Sentence Block
interface Sentence {
  id: string;
  tokens: Token[];
  freeTranslation: string;   // Full English translation for the sentence
}

// Complete Text Document
interface GlossDocument {
  title: string;
  author: string;
  date: string;
  sentences: Sentence[];
}
```

---

## 2. Reusability for Future Documents

The system is designed for end-to-end reusability with new texts or manuscripts:

### Option A: Master `.tex` Ingestion
- Any new `.tex` manuscript formatted with standard `gb4e` syntax can be placed in `references/` or loaded via `/api/master-tex`.
- The parser will automatically generate the `GlossDocument` JSON representation, token alignments, and morpheme structures.

### Option B: Batch Import in Editor
- In `/edit/[slug]`, the **Batch Import Pipeline** at the bottom of the page accepts raw `\ex{\gll ... \\ ... \\ \glt ...}` blocks directly via copy-paste.
- Linguists can preview the parsed token count and apply the batch import directly into the live document.

### Option C: Exporting back to LaTeX (`exportToGb4eLatex`)
- The system is bidirectional: the `exportToGb4eLatex` utility in `data/latex-export.ts` takes the in-memory document state and exports a clean, compilable LaTeX `gb4e` document with proper `\gll`, `\textsc{...}` tags, and `\glt`.

---

## 3. How Lemmas Were Derived

The original `.tex` document contains only **surface forms** (Line 1) and **grammatical glosses** (Line 2); it does not explicitly declare dictionary headwords (lemmas).

### Derivation Strategy:
1. **Curated Lexicon Mapping**:
   - For annotated texts like the *Voyages of Ohthere and Wulfstan*, high-frequency words were matched against curated dictionary datasets (`data/ohthere.ts` and `data/dictionary.json`).
2. **Heuristic Morphological Fallback**:
   - For new or unindexed words, the parser strips morpheme boundaries (`-`), prefixes, and known inflectional endings to hypothesize the base stem.
3. **Interactive Editorial Override**:
   - In the `/edit` workspace inspector, editors can inspect any individual token and manually edit the lemma, definition, and grammatical features.

---

## 4. Wiktionary URLs & Why `sǣ-d-e` Had `sægan`

### Wiktionary URL Construction
Wiktionary URLs follow the Wikimedia headword convention:
$$\text{URL} = \text{https://en.wiktionary.org/wiki/} + \text{encodeURIComponent}(\text{lemma}) + \text{\#Old\_English}$$

### Why `sǣ-d-e` Pointed to `sægan`
- **Linguistic Reality**: In Old English, `sǣde` is the past indicative 3rd person singular of the irregular weak Class 3 verb **secgan** (*to say*).
- **The Heuristic Error**: Early automated stem extraction stripped the past suffix `-d-e` from `sǣ-d-e` and naively hypothesized an infinitive `*sǣgan` by appending `-an` to `sǣg-`.
- **The Correction**: Because `sǣgan` is not the canonical dictionary headword, the correct entry is **secgan**:
  - Correct URL: [https://en.wiktionary.org/wiki/secgan#Old_English](https://en.wiktionary.org/wiki/secgan#Old_English)
  - `sǣde` is documented under the conjugation table of `secgan`.

The Token Inspector in `/edit` allows updating the `Lemma` field to `secgan` and the `Wiktionary URL` to `https://en.wiktionary.org/wiki/secgan#Old_English`.

---

## 5. Tools for Verifying Correctness and Accuracy

| Tool / Check | Command / Location | Purpose |
| :--- | :--- | :--- |
| **Source Validation Script** | `npm run validate:source` (`scripts/validate-source.mjs`) | Validates 1:1 token alignment between Line 1 surface words and Line 2 gloss words, verifies Leipzig codes, and checks non-empty translations. |
| **End-to-End Smoke Test** | `npm run test:smoke` (`scripts/smoke-test.mjs`) | Verifies that all reader routes, editor routes, and exports render without missing text, cut-offs, or 404s. |
| **TypeScript Typechecker** | `npm run typecheck` (`tsc --noEmit`) | Enforces schema validation across all components and data structures. |
| **ESLint Quality Check** | `npm run lint` (`eslint .`) | Audits code for syntax issues, dead code, or broken imports. |
| **Interactive Token Inspector** | Web Route `/edit/ohthere-wulfstan` | Visual inspector that previews reader popups in real time and highlights invalid tags or mismatched morphemes. |
| **External Dictionaries** | [Bosworth-Toller](https://bosworthtoller.com/) & [Wiktionary Old English](https://en.wiktionary.org/wiki/Category:Old_English_lemmas) | Authoritative reference lexicons for verifying headwords, etymology, and macrons. |
