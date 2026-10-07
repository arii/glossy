# Glossy Documentation & Reference Guide

This document describes the linguistic data model, canonical lemma citation standards, and technical architecture of Glossy (audited 2026-10-06). Product requirements and specifications are tracked in `devpost/prd.md`, `devpost/spec.md`, and `CODE_QUALITY_AUDIT.md`.

---

# Part 1: Linguistic & Editorial Guide

*For readers, scholars, and translators working with Old English interlinear texts.*

## L1. Authentic Glossing Abbreviations from the Master Manuscript

The 42 Leipzig-compliant abbreviations defined in Section 2 (*Glossing abbreviations*) of `references/Voyages_of_Ohthere_Wulfstan.tex`:

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

## A1. Dedicated Authoring Architecture & Persistence Flow

Glossy separates client-side authoring from Git-backed publishing:

1. **Client-Side Authoring (Glossy Editor UX)**:
   - Editors work within Glossy's specialized interlinear editor (`/edit/[slug]` and `/edit/new`).
   - Edits autosave in real-time to browser `localStorage` as versioned envelopes (`glossy:v1:draft:<slug>`).
2. **Pending Manifest (`glossy:v1:pending_drafts`)**:
   - Every saved or modified draft is atomically registered in the pending manifest with content hash, timestamp, and word count.
3. **TinaCMS Git Propagation**:
   - TinaCMS is configured for simple site copy editing (`home.json`, FAQs) and provides an authenticated commit bridge.
   - When authenticated, pending drafts can be committed to the Git repository via Tina's GraphQL client.
4. **Data Portability & Compilable Exports**:
   - The editor provides instant client-side downloads for complete **JSON** text documents and compilable **LaTeX (`gb4e`)** packages.

## A2. Automated Quality Verification Suite

| Command | Function & Verification Target |
|---|---|
| `npm run validate:lemmas` | Audits token lemmas asserting compliance with canonical dictionary headwords. |
| `npm run validate:source` | Validates token and gloss alignment across source-backed texts. |
| `npm run sync:dictionary` | Normalizes dictionary records in `content/dictionary/`. |
| `npm run compile:content` | Pre-compiles master TeX source into structured JSON. |
| `npm run test:drafts` | Runs unit tests for local draft envelopes, slug sanitization, and collision prevention. |
| `npm run test:smoke` | Validates all public routes, reader views, and editor endpoints. |
| `npm run typecheck` | Validates TypeScript type safety across the entire codebase. |
| `npm run lint` | Runs ESLint asserting zero syntax errors, missing imports, or unused variables. |
| `npm run build` | Generates production Next.js application. |
