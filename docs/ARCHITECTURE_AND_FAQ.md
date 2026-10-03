# Glossy Architecture and Linguistic FAQ

This document describes the technical architecture, linguistic data model, and lemma citation standards of Glossy (audited 2026-10-03). Product requirements and specifications are tracked in `devpost/prd.md`, `devpost/spec.md`, and `plan.md`.

## Routes and Data Flow

- `/` selects a text and links to the separate `/read/<slug>` reader and `/edit/<slug>` workspace.
- `/docs` is the in-app architecture and linguistic data model FAQ; `/admin/index.html` is the TinaCMS admin.
- `references/Voyages_of_Ohthere_Wulfstan.tex` supplies the authoritative master manuscript (`gb4e` LaTeX). `lib/gb4e.ts` parses the LaTeX source. `scripts/compile-tex-to-content.mjs` pre-compiles the full 75-sentence document into `content/texts/ohthere.json` alongside raw `texSource`.
- `lib/lemmatizer.ts` implements the automatic lemma finding and demorphing engine enforcing strict canonical dictionary headwords. `scripts/sync-dictionary.mjs` generates synchronized JSON entries under `content/dictionary/`.
- `npm run prebuild` automatically executes dictionary synchronization and TeX-to-JSON compilation before `npm run build`.

---

## 1. Authentic Glossing Abbreviations from the Master Manuscript

The 37 abbreviations defined in Section 2 (*Glossing abbreviations*) of `references/Voyages_of_Ohthere_Wulfstan.tex`:

| Tag | Full Name / Description | Role in Old English Glossing |
| :--- | :--- | :--- |
| `1` | 1st person | Speaker (`ic`, `mē`, `mīn`, `wē`, `ūs`) |
| `2` | 2nd person | Addressee (`þū`, `þē`, `þīn`, `gē`, `ēow`) |
| `3` | 3rd person | Third person (`hē`, `hēo`, `hit`, `hīe`, `him`, `his`) |
| `ACC` | accusative case | Direct object of transitive verb or preposition |
| `ADJ` | adjective | Descriptive modifier |
| `ADV` | adverb | Modifying verb, adjective, or clause direction |
| `AGT` | agent | Agentive noun suffix (`-ere`, `-a`, e.g. *hwælhuntan*, *fiscerum*) |
| `CMP` | comparative | Comparative degree (`-ra`, `-re`, `-or`, e.g. *lengra*, *swīftre*) |
| `COMP` | complementizer | Subordinating clause marker (`þæt`, *that*) |
| `DAT` | dative case | Indirect object (*to/for*) or prepositional object |
| `DEF` | definite | Definite article (`sē`, `sēo`, `þæt`, `þā`, `þǣm`) |
| `DEM` | demonstrative | Demonstrative pronoun/determiner (`þes`, `þis`, `þās`) |
| `DET` | determiner | Quantifier or demonstrative modifying a noun |
| `DIST` | distal | Distal demonstrative (*that / those over there*) |
| `F` | feminine gender | Grammatical feminine gender |
| `GEN` | genitive case | Possession, origin, or partitive relation (*of*) |
| `HAB` | habitual | Habitual or timeless aspect (*bēoð*, *bið*) |
| `IMP` | imperative mood | Direct command or exhortation |
| `IND` | indicative mood | Stating factual reality |
| `INDF` | indefinite | Indefinite article/pronoun (`ān`, `sum`, `ǣniġ`) |
| `INF` | infinitive | Uninflected verb citation base (`-an`, `-ian`) |
| `INS` | instrumental case | Means or instrument by which an action is done (`þȳ`, `þon`) |
| `M` | masculine gender | Grammatical masculine gender |
| `N` | neuter gender | Grammatical neuter gender |
| `NEG` | negative | Negative prefix or particle (`ne`, `n-ān`, `næfde`) |
| `NMLZ` | nominalizer | Suffix creating a noun (`-oð`, `-aþ`, e.g. *huntoðe*, *fiscaþe*) |
| `NOM` | nominative case | Grammatical subject of the clause |
| `PART` | participle | Past or present participle (`-ende`, `-en`, `-ed`, `-od`) |
| `PASS` | passive voice | Passive verbal construction |
| `PFX` | prefix | Derivational or verbal prefix (`ġe-`, `ā-`, `of-`, `be-`) |
| `PL` | plural number | More than one entity |
| `POSS` | possessive | Possessive pronoun or determiner |
| `PROX` | proximate | Proximate demonstrative (*this / these here*) |
| `PRS` | present tense | Action taking place in the present |
| `PST` | past tense | Action completed in past time (preterite) |
| `REL` | relativizer | Relative clause marker (`þe`, `sē þe`) |
| `SG` | singular number | Exactly one entity |
| `SJV` | subjunctive mood | Hypothetical, counterfactual, or indirect clause |
| `STR` | strong declension (indef.) | Strong adjectival inflection (alone without article) |
| `SUP` | superlative | Superlative degree (`-ost`, `-est`, `-mest`, e.g. *norþmest*) |
| `THM` | theme vowel | Formative thematic vowel in Class 2 weak verbs (`-i-`, `-o-`) |
| `WK` | weak declension (def.) | Weak adjectival or nominal inflection (after article) |

---

## 2. Canonical Citation Standards by Part of Speech

In standard Old English lexicography (Bosworth-Toller, Sweet, Clark Hall, DOE, Wiktionary), headwords (lemmas) adhere strictly to the following standards:

| Part of Speech | Canonical Citation Standard | Examples in Corpus |
| :--- | :--- | :--- |
| **Numerals** | **Masculine Nominative Form** | `ān` (1), `twēgen` (2, resolving *twā*, *tū*, *twǣm*), `þrīe` (3, resolving *þrēo*, *þrim*), `fēower` (4), `fīf` (5), `siex` (6), `tīen` (10), `twēntig` (20), `hundtēontiġ` (100) |
| **Articles & Primary Demonstratives** | **Masculine Nominative Singular (`sē`)** | `sē` (for all forms: *sē, sēo, þæt, þone, þā, þæs, þǣre, þǣm, þām, þȳ, þon, ðæt, ðone, ðǣm, ðā, ðǣre, ðāra*) |
| **Proximal Demonstratives** | **Masculine Nominative Singular (`þes`)** | `þes` (for all forms: *þes, þēos, þis, þisne, þās, þisses, þisse, þissere, þissum, þyssum, ðes, ðis, ðās, ðissum*) |
| **Determiners & Quantifiers** | **Masculine Nominative Singular Strong** | `sum` (for *sumne, sumes, sumre, sumum, sume*), `ǣlċ` (for *ǣlces, ǣlcum*), `ǣniġ` (for *ǣniġne, ǣniġum*), `nǣniġ`, `swilċ`, `hwilċ`, `ōþer` (for *ōþerne, ōþrum*) |
| **Adjectives** | **Masculine Nominative Singular Strong** | `eall` (from *ealne, eallum, ealra*), `micel` (from *miclan, micles, māra, mǣst*), `gōd` (from *gōde, betera*), `wēste` (*ja/jō*-stem), `fēaw` (from *fēawum*), `lang` (from *lengra*), `swift` (from *swīftre*), `norþweard` (from *norþweardum*) |
| **Verbs** | **Infinitive** (`-an`, `-ian`, `-on`, contracted `-n`) | `secgan` (from *sǣde*), `faran` (from *fōr*), `licgan` (from *lǣġe*), `seġlian` (from *seġlode*), `cweþan` (from *cwæð*), `dōn` (from *dyde*), `bēon`/`wesan` (from *is, wæs, bið*), `sculan` (from *sceolde*), `magan` (from *meahte*) |
| **Nouns** | **Nominative Singular** | `dæġ` (from *dagas, dagum*), `stōw` (from *stōwum*), `mann` (from *men, monna*), `hunta` (from *huntan*), `ealu` (from *ealað*), `wæter` (from *wæteres*), `winter` (from *wintra*), `fætels` (from *fǣtelsas*) |
| **Personal & Interrogative Pronouns** | **Masculine Nominative Singular** (or 1st/2nd pers base) | `hē` (for *hē, hēo, hit, him, his, hī*), `ic` (for *ic, mē, mīn*), `þū` (for *þū, þē, þīn*), `hwā` (for *hwā, hwæt, hwone, hwæs, hwǣm*) |
| **Adverbs / Prepositions / Conjunctions** | **Positive Base / Indeclinable Form** | `swīðe` (from *swīþe, swȳðe*), `norþ`, `ēast`, `þonan`, `on`, `mid`, `tō`, `būton`, `and`, `ac`, `þēah` |

---

## 3. Automated Verification Suite

| Command | Function & Verification Target |
|---|---|
| `node scripts/validate-lemmas.mjs` | Audits every token in the corpus asserting: 100% verb infinitive compliance, 100% noun nominative singular compliance, 100% adjective strong masculine nominative singular compliance, and 100% determiner/numeral masculine nominative compliance. |
| `npm run validate:source` | Validates 100% token and gloss alignment across all 75 sentences (1,716 tokens). |
| `npm run sync:dictionary` | Generates clean, normalized dictionary records in `content/dictionary/`. |
| `npm run compile:content` | Pre-compiles master TeX source into `content/texts/ohthere.json` with embedded `texSource`. |
| `npm run audit:deadcode` | Runs Knip dead code audit asserting zero dead files, unlisted dependencies, or unused exports. |
| `npm run typecheck` | Validates TypeScript type safety across the entire codebase. |
| `npm run build` | Runs `prebuild` (sync:dictionary + compile:content + build:tina) and generates production Next.js application. |

---

## 4. Multi-Text Glossing & Corpus Expansion

Glossy supports expanding the Old English digital corpus beyond the master text:

1. **New Text Ingestion (`/edit/new`)**:
   - Scholars and students can create new documents by entering title, attribution, and pasting raw Old English sentences, sentence pairs with translations, or LaTeX `gb4e` code.
   - Built-in classic presets include **Beowulf: Prologue (Lines 1–11)**, **Cædmon's Hymn**, and **The Wanderer**.
2. **Automatic Tokenization & Lemmatization**:
   - The ingestion pipeline strips punctuation and immediately resolves each word against standard Old English grammar rules, assigning the canonical masculine nominative singular strong adjective lemma, infinitive verb lemma, noun nominative lemma, or masculine numeral lemma.
3. **Dual-Write CMS & LaTeX Persistence**:
   - Saving writes structured JSON to `content/texts/<slug>.json` and LaTeX to `references/<slug>.tex`, making the text immediately available for reading at `/read/<slug>` and editing at `/edit/<slug>`.

