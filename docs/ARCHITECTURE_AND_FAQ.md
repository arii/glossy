# Glossy Documentation & Reference Guide

This document describes the linguistic data model, canonical lemma citation standards, and technical architecture of Glossy (audited 2026-10-05). Product requirements and specifications are tracked in `devpost/prd.md`, `devpost/spec.md`, and `plan.md`.

---

# Part 1: Linguistic & Editorial Guide

*For readers, scholars, and translators working with Old English interlinear texts.*

## L1. Authentic Glossing Abbreviations from the Master Manuscript

The 42 abbreviations defined in Section 2 (*Glossing abbreviations*) of `references/Voyages_of_Ohthere_Wulfstan.tex`:

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

## L2. Canonical Adjective & Part-of-Speech Citation Standards

In standard Old English lexicography (Bosworth-Toller, Sweet, Clark Hall, DOE, Wiktionary), headwords (lemmas) adhere strictly to the following standards:

| Part of Speech | Canonical Citation Standard | Examples in Corpus |
| :--- | :--- | :--- |
| **Adjectives** | **Masculine Nominative Singular Strong** | `eall` (from *ealne, eallum, ealra*), `micel` (from *miclan, micles, māra, mǣst*), `gōd` (from *gōde, betera*), `wēste` (*ja/jō*-stem), `fēaw` (from *fēawum*), `lang` (from *lengra*), `swift` (from *swīftre*), `norþweard` (from *norþweardum*) |
| **Verbs** | **Infinitive** (`-an`, `-ian`, `-on`, contracted `-n`) | `secgan` (from *sǣde*), `faran` (from *fōr*), `licgan` (from *lǣġe*), `seġlian` (from *seġlode*), `cweþan` (from *cwæð*), `dōn` (from *dyde*), `bēon`/`wesan` (from *is, wæs, bið*), `sculan` (from *sceolde*), `magan` (from *meahte*) |
| **Nouns** | **Nominative Singular** | `dæġ` (from *dagas, dagum*), `stōw` (from *stōwum*), `mann` (from *men, monna*), `hunta` (from *huntan*), `ealu` (from *ealað*), `wæter` (from *wæteres*), `winter` (from *wintra*), `fætels` (from *fǣtelsas*) |
| **Articles & Primary Demonstratives** | **Masculine Nominative Singular (`sē`)** | `sē` (for all forms: *sē, sēo, þæt, þone, þā, þæs, þǣre, þǣm, þām, þȳ, þon, ðæt, ðone, ðǣm, ðā, ðǣre, ðāra*) |
| **Proximal Demonstratives** | **Masculine Nominative Singular (`þes`)** | `þes` (for all forms: *þes, þēos, þis, þisne, þās, þisses, þisse, þissere, þissum, þyssum, ðes, ðis, ðās, ðissum*) |
| **Determiners & Quantifiers** | **Masculine Nominative Singular Strong** | `sum` (for *sumne, sumes, sumre, sumum, sume*), `ǣlċ` (for *ǣlces, ǣlcum*), `ǣniġ` (for *ǣniġne, ǣniġum*), `nǣniġ`, `swilċ`, `hwilċ`, `ōþer` (for *ōþerne, ōþrum*) |
| **Personal & Interrogative Pronouns** | **Masculine Nominative Singular** (or 1st/2nd pers base) | `hē` (for *hē, hēo, hit, him, his, hī*), `ic` (for *ic, mē, mīn*), `þū` (for *þū, þē, þīn*), `hwā` (for *hwā, hwæt, hwone, hwæs, hwǣm*) |
| **Adverbs / Prepositions / Conjunctions** | **Positive Base / Indeclinable Form** | `swīðe` (from *swīþe, swȳðe*), `norþ`, `ēast`, `þonan`, `on`, `mid`, `tō`, `būton`, `and`, `ac`, `þēah` |

## L3. The Numeral Lemmatization Standard

| Number Category | Citation Rule | Examples |
| :--- | :--- | :--- |
| **Plural Nominals (2 & 3)** | **Masculine Nominative Form** | `twēgen` (resolving *twā*, *tū*, *twǣm*), `þrīe` (resolving *þrēo*, *þrim*) |
| **Cardinals (1, 4–19)** | Base cardinal stem / Masc. Nom. Sg. | `ān` (1), `fēower` (4), `fīf` (5), `siex` (6), `tīen` (10) |
| **Decades & Hundreds** | Neuter noun quantifiers | `twēntig` (20), `syxtig` (60), `hundtēontiġ` (100) |

## L4. Official Wiktionary & IPA Formatting Standards

- **Wiktionary Entry Naming Conventions**:
  - Vowel macrons (`ā, ē, ī, ō, ū, ȳ`) and palatal dots (`ċ, ġ`) are omitted from page titles (`secgan`, `hlaford`).
  - Historical Latin letters Ash (`æ`), thorn (`þ`), and eth (`ð`) are retained (`cweþan#Old_English`).
  - Proper nouns and tribal names are capitalized (`Ohthere`, `Ælfred`).
  - Links target the `#Old_English` section anchor.
- **International Phonetic Alphabet (IPA) Specifications**:
  - Transcriptions use phonemic slashes `/.../`.
  - Vowel length uses the standard IPA triangular length mark `ː` (`U+02D0`).
  - Primary stress uses the vertical stroke `ˈ` (`U+02C8`) preceding the stressed syllable (`/ˈbuː.ɑn/`).

---

# Part 2: Architecture & Data Model

*For software engineers, developers, and pipeline contributors.*

## A1. Corpus Ingestion & Expansion Pipeline (`/edit/new`)

1. **Automatic Tokenization & Compound Splitting**:
   - Punctuation is cleanly isolated and bound morphemes (e.g. `ġeār-dag-um`) are segmented into glossable lexical units.
2. **Contextual Lemmatization Engine**:
   - Every token is evaluated through `lib/lemmatizer.ts`, assigning canonical masculine nominative singular strong adjective lemmas, infinitive verb lemmas, nominative noun lemmas, and direct Wiktionary etymological links.
3. **Dual-Write Persistence & LaTeX Export**:
   - Saving writes structured JSON to `content/texts/<slug>.json` and compilable LaTeX to `references/<slug>.tex`.

## A2. Local Drafts & Dual-Write Architecture

Glossy maintains a three-tier data synchronization model:

- **Tier 1: Browser Local Storage** (300ms debounce autosave to localStorage under slug keys).
- **Tier 2: Filesystem Dual-Write** (`references/<slug>.tex` + `content/texts/<slug>.json` written synchronously via `/api/save-document`).
- **Tier 3: TinaCMS GraphQL Bridge** (dispatched to working trees for visual CMS authoring).

## A3. Automated Quality Verification Suite

| Command | Function & Verification Target |
|---|---|
| `node scripts/validate-lemmas.mjs` | Audits every token in the corpus asserting 100% compliance across verbs, nouns, adjectives, determiners, and numerals. |
| `npm run validate:source` | Validates 100% token and gloss alignment across all 75 sentences (1,716 tokens). |
| `npm run sync:dictionary` | Generates clean, normalized dictionary records in `content/dictionary/`. |
| `npm run compile:content` | Pre-compiles master TeX source into `content/texts/ohthere.json` with embedded `texSource`. |
| `npm run audit:deadcode` | Runs Knip dead code audit asserting zero dead files, unlisted dependencies, or unused exports. |
| `npm run typecheck` | Validates TypeScript type safety across the entire codebase. |
| `npm run build` | Runs `prebuild` (sync:dictionary + compile:content + build:tina) and generates production Next.js application. |
