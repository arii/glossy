# Glossy Architecture and Linguistic FAQ

This document describes the technical architecture and current data flow of Glossy (audited 2026-10-03). Product requirements and specifications are tracked in `devpost/prd.md`, `devpost/spec.md`, and `plan.md`; remaining implementation and verification tasks are in `devpost/checklist.md > Follow-up Requirements`.

## Routes and Data Flow

- `/` selects a text and links to the separate `/read/<slug>` reader and `/edit/<slug>` workspace.
- `/docs` is the in-app architecture and linguistic data model FAQ; `/admin/index.html` is the TinaCMS admin.
- `references/Voyages_of_Ohthere_Wulfstan.tex` is the transcription source manuscript (`gb4e` LaTeX). `lib/gb4e.ts` parses its supported syntax. `scripts/compile-tex-to-content.mjs` generates `content/texts/ohthere.json` from the parsed examples with exported `texSource`.
- `lib/lemmatizer.ts` applies curated form maps and heuristic rules; it does not guarantee canonical or scholarly-correct lemmas. `scripts/sync-dictionary.mjs` generates JSON entries under `content/dictionary/`.
- `npm run prebuild` automatically executes dictionary synchronization and TeX-to-JSON compilation before `npm run build`.

---

## 1. Beginner's Primer on Interlinear Glossing

An **interlinear gloss** presents historical text aligned word-by-word with grammatical breakdowns and a fluent translation:

```
Surface Text (Line 1):       Ōhthere       sǣ-d-e              his        hlāford-e
Leipzig Gloss (Line 2):     Ohthere       say-PST-IND3SG      his.GEN    lord-DAT.SG
Modern Translation (Line 3): "Ohthere said to his lord..."
Canonical Lemma:            Ōhthere       secgan              hē         hlāford
```

### Leipzig Grammatical Abbreviations Reference

| Abbreviation | Full Term | Grammatical Role in Sentence | Example |
| :--- | :--- | :--- | :--- |
| `NOM` | **Nominative** | The subject performing the action. | *Ōhthere* sǣde |
| `ACC` | **Accusative** | The direct object receiving the action. | he hæfde *dēor* |
| `GEN` | **Genitive** | Possession or partitive origin (&ldquo;of&rdquo;). | *ealra* Norþmonna |
| `DAT` | **Dative** | Indirect object (&ldquo;to/for&rdquo;) or prepositional object. | on *dagum*, to his *hlāforde* |
| `INS` | **Instrumental** | Means or instrument by which an action is performed. | *þȳ* dæġe |
| `STR` | **Strong Declension** | Indefinite adjective form (used alone without demonstratives). | *micel* scip |
| `WK` | **Weak Declension** | Definite adjective form (used after &ldquo;the/this/his&rdquo;). | se *micla* mann |
| `PST` | **Past Tense (Preterite)** | Action completed in the past. | *fōr* (went), *sǣde* (said) |
| `PRS` | **Present Tense** | Action taking place in the present. | *is* (is), *cymð* (comes) |
| `IND` | **Indicative Mood** | Factual statements. | he *sǣde* |
| `SJV` | **Subjunctive Mood** | Hypothetical, conditional, or reported clauses. | þæt he *wǣre* |
| `INF` | **Infinitive** | Uninflected dictionary verb form (&ldquo;to do&rdquo;). | *secgan*, *faran*, *dōn* |

---

## 2. Canonical Citation Standards by Part of Speech

In standard Old English lexicography (Bosworth-Toller, Sweet, Clark Hall, DOE, Wiktionary), headwords (lemmas) adhere strictly to the following standards:

| Part of Speech | Canonical Citation Standard | Examples in Corpus |
| :--- | :--- | :--- |
| **Articles & Primary Demonstratives** | **Masculine Nominative Singular (`sē`)** | `sē` (for all forms: *sē, sēo, þæt, þone, þā, þæs, þǣre, þǣm, þām, þȳ, þon, ðæt, ðone, ðǣm, ðā, ðǣre, ðāra*) |
| **Proximal Demonstratives** | **Masculine Nominative Singular (`þes`)** | `þes` (for all forms: *þes, þēos, þis, þisne, þās, þisses, þisse, þissere, þissum, þyssum, ðes, ðis, ðās, ðissum*) |
| **Determiners & Quantifiers** | **Masculine Nominative Singular Strong** | `sum` (for *sumne, sumes, sumre, sumum, sume*), `ǣlċ` (for *ǣlces, ǣlcum*), `ǣniġ` (for *ǣniġne, ǣniġum*), `nǣniġ`, `swilċ`, `hwilċ`, `ōþer` (for *ōþerne, ōþrum*) |
| **Adjectives** | **Masculine Nominative Singular Strong** | `eall` (from *ealne, eallum, ealra*), `micel` (from *miclan, micles, māra, mǣst*), `gōd` (from *gōde, betera*), `wēste` (*ja/jō*-stem), `fēaw` (from *fēawum*), `lang` (from *lengra*), `swift` (from *swīftre*), `norþweard` (from *norþweardum*) |
| **Verbs** | **Infinitive** (`-an`, `-ian`, `-on`, contracted `-n`) | `secgan` (from *sǣde*), `faran` (from *fōr*), `licgan` (from *lǣġe*), `seġlian` (from *seġlode*), `cweþan` (from *cwæð*), `dōn` (from *dyde*), `bēon`/`wesan` (from *is, wæs, bið*), `sculan` (from *sceolde*), `magan` (from *meahte*) |
| **Nouns** | **Nominative Singular** | `dæġ` (from *dagas, dagum*), `stōw` (from *stōwum*), `mann` (from *men, monna*), `hunta` (from *huntan*), `ealu` (from *ealað*), `wæter` (from *wæteres*), `winter` (from *wintra*), `fætels` (from *fǣtelsas*) |
| **Personal & Interrogative Pronouns** | **Masculine Nominative Singular** (or 1st/2nd pers base) | `hē` (for *hē, hēo, hit, him, his, hī*), `ic` (for *ic, mē, mīn*), `þū` (for *þū, þē, þīn*), `hwā` (for *hwā, hwæt, hwone, hwæs, hwǣm*) |
| **Adverbs / Prepositions / Conjunctions** | **Positive Base / Indeclinable Form** | `swīðe` (from *swīþe, swȳðe*), `norþ`, `ēast`, `þonan`, `on`, `mid`, `tō`, `būton`, `and`, `ac`, `þēah` |

---

## 3. Why Adjectives are Cited as Masculine Nominative Singular Strong

In Old English grammar, every adjective can take up to 20+ different inflected endings depending on:
- **Gender**: Masculine, Feminine, Neuter
- **Number**: Singular, Plural
- **Case**: Nominative, Accusative, Genitive, Dative, Instrumental
- **Declension**: Strong (indefinite) vs. Weak (definite)

For example, *good* appears across texts as *gōd, gōdne, gōdes, gōdre, gōdum, gōdra, gōde, gōda, gōdan, gōdena*. To avoid fragmented dictionary records, lexicographers universally use the **Masculine Nominative Singular Strong** form (*gōd*, *eall*, *micel*, *lang*) as the single canonical headword.

### Ja/Jō-stem Adjectives
Adjectives historically belonging to the *ja/jō*-stem class legitimately end in `-e` in their masculine nominative singular strong citation form (`wēste`, `blīðe`, `clǣne`, `dȳre`, `grēne`, `swēte`, `gedēfe`, `unmǣte`). The engine preserves these base forms without incorrectly stripping their root vowel.

---

## 4. The Numeral Lemmatization Challenge

Old English numerals present unique challenges for automated lemmatization:
1. **Numbers 1–3**: `1 (ān)` inflects like a strong adjective with a masculine nominative singular. However, `2 (twēgen/twā)` and `3 (þrīe/þrēo)` are **inherently plural in meaning** and possess no singular forms. They are cited by their plural citation forms: `twēgen` (or `twā`) and `þrīe`.
2. **Numbers 4–19**: Cardinals from `4 (fēower)` to `19` are largely **indeclinable** when modifying nouns, with no distinct gender forms. Their citation headword is the base cardinal stem (`fēower`, `fīf`, `siex`, `seofon`, `eahta`, `nigon`, `tīen`).
3. **Decades & Hundreds**: Numbers such as `twēntig (20)`, `syxtig (60)`, and `hundtēontiġ (100)` behave as neuter nouns that govern a dependent genitive plural (e.g. *syxtig hrāna* = &ldquo;sixty of reindeers&rdquo;). Their lemmas are the base cardinal noun forms.

---

## 5. Automated Verification Suite

| Command | Function & Verification Target |
|---|---|
| `node scripts/validate-lemmas.mjs` | Runs heuristic checks on parsed lemma shapes and Wiktionary URL formatting. This is not a scholarly accuracy audit and is not currently wired to an npm script. |
| `npm run validate:source` | Checks parsed examples for words and translations, and checks text-record surface/gloss pairs against the source. Parser warnings may be reported; this does not prove every token is linguistically correct. |
| `npm run sync:dictionary` | Regenerates dictionary JSON under `content/dictionary/` from the curated lexicon list. |
| `npm run compile:content` | Regenerates `content/texts/ohthere.json` from the supplied TeX manuscript, including exported `texSource`. |
| `npm run typecheck` | Validates TypeScript type safety across the entire codebase. |
| `npm run build` | Runs `prebuild` (sync:dictionary + compile:content) and generates production Next.js application. |
