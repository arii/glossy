import type { LexiconEntry, PartOfSpeech } from "./types.ts";
import { resolveOldEnglishLexicon } from "./old-english-lexicon.ts";

/**
 * Irregular, strong, and preterite-present Old English verb mappings.
 * All map to the canonical Infinitive (-an, -ian, -on, contracted -n).
 */
const VERB_ABLUT_MAP: Record<string, string> = {
  // Strong Class 1 (ī - ā - i - i)
  "bād": "bīdan",
  "bīd": "bīdan",
  "bīd-an": "bīdan",
  "bīdende": "bīdan",
  "stāg": "stīgan",
  "stīg-an": "stīgan",
  "rīd-an": "rīdan",
  "rād": "rīdan",
  "wrāt": "wrītan",
  "wrīt-an": "wrītan",

  // Strong Class 2 (ēo/ū - ēa - u - o)
  "bēag": "būgan",
  "būg-an": "būgan",
  "bēad": "bēodan",
  "bēod-an": "bēodan",
  "cēas": "ċēosan",
  "ċēos-an": "ċēosan",
  "ofer-fror-en": "oferfrēosan",
  "oferfroren": "oferfrēosan",

  // Strong Class 3 (e/i - ea/æ - u - o/u)
  "drinc": "drincan",
  "drinc-að": "drincan",
  "drincað": "drincan",
  "dranc": "drincan",
  "ġyld-að": "gildan",
  "gyld-að": "gildan",
  "ġylt": "gildan",
  "gylt": "gildan",
  "geald": "gildan",
  "bund-on": "bindan",
  "bundon": "bindan",
  "band": "bindan",
  "swamm": "swimman",
  "swimm-an": "swimman",
  "swimman": "swimman",
  "wearp": "weorpan",
  "wurpon": "weorpan",
  "weorp-an": "weorpan",
  "weorpan": "weorpan",
  "healfe": "healfan",
  "feoht-an": "feohtan",
  "feohtan": "feohtan",
  "feaht": "feohtan",

  // Strong Class 4 (e - æ - ǣ - o)
  "bær": "beran",
  "bǣron": "beran",
  "ber-an": "beran",
  "beran": "beran",
  "cym-ð": "cuman",
  "cymð": "cuman",
  "cum-að": "cuman",
  "cumað": "cuman",
  "cōm": "cuman",
  "cōm-on": "cuman",
  "cōmon": "cuman",
  "cuman": "cuman",
  "nam": "niman",
  "nōm": "niman",
  "nim-an": "niman",
  "niman": "niman",

  // Strong Class 5 (e - æ - ǣ - e)
  "cwæð": "cweþan",
  "cwǣd-on": "cweþan",
  "cwǣdon": "cweþan",
  "cweþ-an": "cweþan",
  "cweþan": "cweþan",
  "cweð-an": "cweþan",
  "cweðan": "cweþan",
  "cwe-an": "cweþan",
  "lǣġ-e": "licgan",
  "lǣġe": "licgan",
  "lǣg": "licgan",
  "lǣgon": "licgan",
  "lī-ð": "licgan",
  "līð": "licgan",
  "liċġ-að": "licgan",
  "liċġað": "licgan",
  "licg-an": "licgan",
  "licgan": "licgan",
  "ġe-seah": "sēon",
  "ġeseah": "sēon",
  "geseah": "sēon",
  "sēon": "sēon",
  "ġe-sāwon": "sēon",
  "ġesāwon": "sēon",
  "spræc": "sprecan",
  "sprec-an": "sprecan",
  "sprecan": "sprecan",
  "æt": "etan",
  "et-an": "etan",
  "etan": "etan",

  // Strong Class 6 (a - ō - ō - a)
  "fōr": "faran",
  "fōr-on": "faran",
  "fōron": "faran",
  "far-aþ": "faran",
  "faraþ": "faran",
  "far-an": "faran",
  "faran": "faran",
  "stōd": "standan",
  "stand-an": "standan",
  "standan": "standan",
  "slōg": "slēan",
  "of-slōg-e": "ofslēan",
  "ofslōge": "ofslēan",
  "of-slōg": "ofslēan",
  "ofslōg": "ofslēan",
  "slēan": "slēan",

  // Strong Class 7 (Reduplicating)
  "hēt": "hātan",
  "hāt-an": "hātan",
  "hātan": "hātan",
  "lēt": "lǣtan",
  "lǣt-an": "lǣtan",
  "lǣtan": "lǣtan",
  "fēoll": "feallan",
  "feall-an": "feallan",
  "feallan": "feallan",
  "hēold": "healdan",
  "heald-an": "healdan",
  "healdan": "healdan",
  "wēox": "weaxan",
  "weax-an": "weaxan",
  "weaxan": "weaxan",

  // Weak Class 1 (i-mutation / dental preterite)
  "sǣ-d-e": "secgan",
  "sǣde": "secgan",
  "secg-an": "secgan",
  "secgan": "secgan",
  "sōh-t-e": "sēcan",
  "sōhte": "sēcan",
  "sēcan": "sēcan",
  "ā-sett-e": "āsettan",
  "āsette": "āsettan",
  "āsett-an": "āsettan",
  "āsettan": "āsettan",
  "tǣh-t-e": "tǣċan",
  "tǣhte": "tǣċan",
  "tǣċ-an": "tǣċan",
  "tǣċan": "tǣċan",
  "dēmd-e": "dēman",
  "dēmde": "dēman",
  "fērd-e": "fēran",
  "fērde": "fēran",
  "fēr-an": "fēran",
  "fēran": "fēran",
  "leġd-e": "lecgan",
  "leġde": "lecgan",
  "leċġ-an": "lecgan",
  "leċġan": "lecgan",
  "dyde": "dōn",
  "dyd-on": "dōn",
  "dydon": "dōn",
  "ġe-dō-ð": "ġedōn",
  "ġedōð": "ġedōn",
  "dōn": "dōn",

  // Weak Class 2 (-ian, -ode)
  "seġl-o-d-e": "seġlian",
  "seġlode": "seġlian",
  "seġl-i-an": "seġlian",
  "seġlian": "seġlian",
  "ġe-seġl-i-an": "geseġlian",
  "ġeseġlian": "geseġlian",
  "ġe-siġl-an": "geseġlian",
  "gesiġlan": "geseġlian",
  "siġl-d-e": "seġlian",
  "siġlde": "seġlian",
  "wīc-o-d-e": "wīcian",
  "wīcode": "wīcian",
  "wīc-i-að": "wīcian",
  "wīciað": "wīcian",
  "wīcian": "wīcian",
  "fand-i-an": "fandian",
  "fandian": "fandian",
  "fand-o-d-e": "fandian",
  "fandode": "fandian",
  "lōc-o-d-e": "lōcian",
  "lōcode": "lōcian",
  "lōc-i-an": "lōcian",
  "lōcian": "lōcian",
  "mac-o-d-e": "macian",
  "macode": "macian",
  "mac-i-an": "macian",
  "macian": "macian",
  "earm-o-d-e": "earmian",
  "earmode": "earmian",
  "earmian": "earmian",

  // Weak Class 3 (habban, libban, hycgan)
  "hæf-d-e": "habban",
  "hæfde": "habban",
  "habb-að": "habban",
  "habbað": "habban",
  "habban": "habban",
  "n-æf-d-e": "nabban",
  "næfde": "nabban",
  "nabban": "nabban",
  "lif-d-e": "libban",
  "lifde": "libban",
  "libb-an": "libban",
  "libban": "libban",

  // Preterite-Present & Anomalous Verbs
  "wæs": "wesan",
  "is": "wesan",
  "sīe": "wesan",
  "sȳ": "wesan",
  "wǣron": "wesan",
  "wǣr-e": "wesan",
  "wǣre": "wesan",
  "bēo-ð": "bēon",
  "bēoð": "bēon",
  "bi-ð": "bēon",
  "bið": "bēon",
  "bēon": "bēon",
  "wesan": "wesan",
  "wol-d-e": "willan",
  "wolde": "willan",
  "wille": "willan",
  "will-að": "willan",
  "willað": "willan",
  "willan": "willan",
  "sċẹol-d-e": "sculan",
  "sċeolde": "sculan",
  "sceol-d-e": "sculan",
  "sceolde": "sculan",
  "sceal": "sculan",
  "scul-on": "sculan",
  "sculon": "sculan",
  "sculan": "sculan",
  "meah-t-e": "magan",
  "meahte": "magan",
  "mæġ": "magan",
  "mæg": "magan",
  "mag-on": "magan",
  "magon": "magan",
  "magan": "magan",
  "wiss-e": "witan",
  "wisse": "witan",
  "wāt": "witan",
  "wit-on": "witan",
  "witon": "witan",
  "witan": "witan",
  "n-yss-e": "nytan",
  "nysse": "nytan",
  "nāt": "nytan",
  "nytan": "nytan",
  "āg-en": "āgan",
  "āgen": "āgan",
  "āh": "āgan",
  "āgan": "āgan",
  "mōt": "mōtan",
  "mōs-t-e": "mōtan",
  "mōste": "mōtan",
  "mōtan": "mōtan",
  "cann": "cunnan",
  "cūð-e": "cunnan",
  "cūðe": "cunnan",
  "cunnan": "cunnan",
};

/**
 * Irregular and Oblique Noun Lemma mappings (all map to Nominative Singular).
 */
const NOUN_LEMMA_MAP: Record<string, string> = {
  // Irregular a-stems with vowel fronting in Nom Sg
  "dag-as": "dæġ",
  "dagas": "dæġ",
  "dag-um": "dæġ",
  "dagum": "dæġ",
  "dæġ-es": "dæġ",
  "dæġes": "dæġ",
  "dæġ": "dæġ",
  "dæg": "dæġ",

  // Consonant stems & umlaut plurals
  "norð-monn-a": "Norþman",
  "norðmonna": "Norþman",
  "norð-men": "Norþman",
  "norðmen": "Norþman",
  "monn-a": "mann",
  "monna": "mann",
  "men": "mann",
  "mon": "mann",
  "mann": "mann",
  "bēc": "bōc",
  "bōc": "bōc",
  "fēt": "fōt",
  "fōt": "fōt",
  "tēð": "tōð",
  "tōð": "tōð",
  "niht": "niht",

  // Weak Nouns (Nom Sg in -a or -e)
  "hwæl-hunt-an": "hwælhunta",
  "hwælhuntan": "hwælhunta",
  "hunt-an": "hunta",
  "huntan": "hunta",
  "nam-an": "nama",
  "naman": "nama",
  "nama": "nama",
  "gum-an": "guma",
  "guma": "guma",
  "ēag-an": "ēage",
  "ēage": "ēage",
  "ēar-an": "ēare",
  "ēare": "ēare",
  "hors-an": "hors",

  // Stems with specific endings
  "wēstenn-e": "wēsten",
  "wēstenne": "wēsten",
  "wēsten": "wēsten",
  "fætels-as": "fætels",
  "fǣtels-as": "fætels",
  "fǣtelsas": "fætels",
  "fætels": "fætels",
  "ċirr-e": "ċirr",
  "ċirre": "ċirr",
  "ċirr": "ċirr",
  "stōw-um": "stōw",
  "stōwum": "stōw",
  "stōw": "stōw",
  "mōr-as": "mōr",
  "mōras": "mōr",
  "mōr": "mōr",
  "hrān-as": "hrān",
  "hrānas": "hrān",
  "hrān": "hrān",
  "dēor-a": "dēor",
  "dēora": "dēor",
  "dēor": "dēor",
  "eal-að": "ealu",
  "ealað": "ealu",
  "ealu": "ealu",
  "wæter-es": "wæter",
  "wæteres": "wæter",
  "wæter": "wæter",
  "sumer-a": "sumor",
  "sumera": "sumor",
  "sumor": "sumor",
  "wintr-a": "winter",
  "wintra": "winter",
  "winter": "winter",
  "stēor-bord": "stēorbord",
  "stēorbord": "stēorbord",
  "bæc-bord": "bæcbord",
  "bæcbord": "bæcbord",
  "weġ": "weġ",
  "land-e": "land",
  "lande": "land",
  "land": "land",
  "sǣ": "sǣ",
  "hlāford-e": "hlāford",
  "hlāforde": "hlāford",
  "hlāford": "hlāford",
  "cyning-e": "cyning",
  "cyninge": "cyning",
  "cyning": "cyning",
  "fisc-aþ-e": "fiscaþ",
  "fiscathe": "fiscaþ",
  "fiscaþ": "fiscaþ",
  "hunt-oð-e": "huntoþ",
  "huntothe": "huntoþ",
  "huntoþ": "huntoþ",

  // Proper Nouns
  "ōhthere": "Ōhthere",
  "wulfstān": "Wulfstān",
  "wulfstan": "Wulfstān",
  "ælfrēd-e": "Ælfrēd",
  "ælfrēd-e": "Ælfrēd",
  "ælfrēd": "Ælfrēd",
  "ælfred-e": "Ælfrēd",
  "ælfrēd": "Ælfrēd",
  "ælfred": "Ælfrēd",
  "finn-as": "Finn",
  "finnas": "Finn",
  "finn": "Finn",
  "cwēn-as": "Cwēnas",
  "cwēnas": "Cwēnas",
  "scīringes-hēal": "Scīringeshēal",
  "scīringeshēal": "Scīringeshēal",
  "hālgoland": "Hālgoland",
  "trūso": "Trūso",
};

/**
 * Ja/Jō-stem adjectives that legitimately end in -e in the Strong Nom Sg Masc citation form.
 */
const JA_JO_ADJECTIVES = new Set([
  "wēste",
  "blīðe",
  "clǣne",
  "dȳre",
  "dēore",
  "grēne",
  "swēte",
  "gedēfe",
  "unmǣte",
]);

/**
 * Adjectives and Determiners mapping strictly to base Masculine Nominative Singular Strong form.
 */
const ADJ_LEMMA_MAP: Record<string, string> = {
  // eall
  "eal-ra": "eall",
  "ealra": "eall",
  "eal-ne": "eall",
  "ealne": "eall",
  "eal-lum": "eall",
  "eallum": "eall",
  "eal-re": "eall",
  "ealre": "eall",
  "eal": "eall",
  "eall": "eall",

  // wēste (ja/jō stem retaining -e)
  "wēst-e": "wēste",
  "wēste": "wēste",
  "wēst-ne": "wēste",
  "wēstne": "wēste",
  "wēst-um": "wēste",
  "wēstum": "wēste",

  // fēaw
  "fēaw-um": "fēaw",
  "fēawum": "fēaw",
  "fēaw-a": "fēaw",
  "fēawa": "fēaw",
  "fēaw": "fēaw",

  // ōþer
  "ōþr-um": "ōþer",
  "ōþrum": "ōþer",
  "ōþr-e": "ōþer",
  "ōþre": "ōþer",
  "ōþer-ne": "ōþer",
  "ōþerne": "ōþer",
  "ōþer": "ōþer",

  // Numerals
  "þrīe": "þrīe",
  "þri-m": "þrīe",
  "þrim": "þrīe",
  "fēower": "fēower",
  "fīf": "fīf",
  "syx": "siex",
  "siex": "siex",
  "seofon": "seofon",
  "eahta": "eahta",
  "nigon": "nigon",
  "tīen": "tīen",
  "twēntig": "twēntig",
  "hund": "hund",
  "hund-tēontiġ": "hundtēontiġ",

  // Directional & positional adjectives
  "norþ-weard-um": "norþweard",
  "norþweardum": "norþweard",
  "norþ-weard": "norþweard",
  "norþweard": "norþweard",
  "sūþ-weard": "sūþweard",
  "sūþweard": "sūþweard",
  "ēast-weard": "ēastweard",
  "ēastweard": "ēastweard",
  "west-weard": "westweard",
  "westweard": "westweard",
  "norþ-mest": "norþmest",
  "norþmest": "norþmest",

  // Degrees of Comparison
  "firr-est": "feorr",
  "firrest": "feorr",
  "feorr-est": "feorr",
  "feorrest": "feorr",
  "feorr": "feorr",
  "leng-ra": "lang",
  "lengra": "lang",
  "lang": "lang",
  "swīft-re": "swift",
  "swīftre": "swift",
  "swift": "swift",
  "mā-ra": "micel",
  "māra": "micel",
  "mǣst": "micel",
  "micel-re": "micel",
  "micelre": "micel",
  "micl-um": "micel",
  "miclum": "micel",
  "micl-an": "micel",
  "miclan": "micel",
  "micel": "micel",
  "bet-era": "gōd",
  "betera": "gōd",
  "betst": "gōd",
  "gōd": "gōd",
  "wiers-a": "yfel",
  "wiersa": "yfel",
  "wierst": "yfel",
  "yfel": "yfel",
  "lǣs-sa": "lȳtel",
  "lǣssa": "lȳtel",
  "lǣst": "lȳtel",
  "lȳtel": "lȳtel",

  // Common descriptive adjectives
  "swīþ-e": "swīðe",
  "swīðe": "swīðe",
  "swȳð-e": "swīðe",
  "swȳðe": "swīðe",
};

/**
 * Demonstratives and Articles mapping to Masculine Nominative Singular:
 * - Definite Article / Primary Demonstrative -> "sē"
 * - Proximal Demonstrative -> "þes"
 */
const DEMONSTRATIVE_ARTICLE_MAP: Record<string, string> = {
  // Primary Demonstrative / Definite Article (Lemma: sē)
  "sē": "sē",
  "se": "sē",
  "þe": "sē",
  "ðe": "sē",
  "sēo": "sē",
  "sīo": "sē",
  "ðēo": "sē",
  "þæt": "sē",
  "ðæt": "sē",
  "þet": "sē",
  "ðet": "sē",
  "þone": "sē",
  "ðone": "sē",
  "þæne": "sē",
  "ðæne": "sē",
  "þā": "sē",
  "ðā": "sē",
  "þæs": "sē",
  "ðæs": "sē",
  "þǣre": "sē",
  "ðǣre": "sē",
  "þāre": "sē",
  "ðāre": "sē",
  "þǣm": "sē",
  "ðǣm": "sē",
  "þām": "sē",
  "ðām": "sē",
  "þȳ": "sē",
  "ðȳ": "sē",
  "þon": "sē",
  "ðon": "sē",
  "þāra": "sē",
  "ðāra": "sē",
  "þǣra": "sē",
  "ðǣra": "sē",

  // Proximal Demonstrative (Lemma: þes)
  "þes": "þes",
  "ðes": "þes",
  "þēos": "þes",
  "ðēos": "þes",
  "þis": "þes",
  "ðis": "þes",
  "þys": "þes",
  "ðys": "þes",
  "þisne": "þes",
  "ðisne": "þes",
  "þysne": "þes",
  "ðysne": "þes",
  "þās": "þes",
  "ðās": "þes",
  "þisses": "þes",
  "ðisses": "þes",
  "þisse": "þes",
  "ðisse": "þes",
  "þissere": "þes",
  "ðissere": "þes",
  "þissum": "þes",
  "ðissum": "þes",
  "þyssum": "þes",
  "ðyssum": "þes",
  "þissa": "þes",
  "ðissa": "þes",
};

/**
 * Determiners & Quantifiers mapping to Masculine Nominative Singular Strong.
 */
const DETERMINER_MAP: Record<string, string> = {
  "sum": "sum",
  "sum-ne": "sum",
  "sumne": "sum",
  "sum-es": "sum",
  "sumes": "sum",
  "sum-re": "sum",
  "sumre": "sum",
  "sum-um": "sum",
  "sumum": "sum",
  "sum-ra": "sum",
  "sumra": "sum",
  "sum-e": "sum",
  "sume": "sum",

  "ǣlċ": "ǣlċ",
  "ælc": "ǣlċ",
  "ǣlc-ne": "ǣlċ",
  "ælcne": "ǣlċ",
  "ǣlc-es": "ǣlċ",
  "ælces": "ǣlċ",
  "ǣlc-um": "ǣlċ",
  "ælcum": "ǣlċ",

  "ǣniġ": "ǣniġ",
  "ænig": "ǣniġ",
  "ǣniġ-ne": "ǣniġ",
  "ænigne": "ǣniġ",
  "ǣniġ-es": "ǣniġ",
  "æniges": "ǣniġ",
  "ǣniġ-um": "ǣniġ",
  "ænigum": "ǣniġ",
  "ǣniġ-re": "ǣniġ",
  "ænigre": "ǣniġ",

  "nǣniġ": "nǣniġ",
  "nænig": "nǣniġ",
  "nǣniġ-ne": "nǣniġ",
  "nænigne": "nǣniġ",
  "nǣniġ-um": "nǣniġ",
  "nænigum": "nǣniġ",

  "swilċ": "swilċ",
  "swylċ": "swilċ",
  "swilc": "swilċ",
  "swylc": "swilċ",
  "swilc-es": "swilċ",
  "swilces": "swilċ",
  "swilc-um": "swilċ",
  "swilcum": "swilċ",

  "hwilċ": "hwilċ",
  "hwylċ": "hwilċ",
  "hwilc": "hwilċ",
  "hwylc": "hwilċ",
};

/**
 * Pronouns and Conjunctions.
 */
const PRON_CONJ_MAP: Record<string, { lemma: string; pos: PartOfSpeech }> = {
  "hē": { lemma: "hē", pos: "pronoun" },
  "his": { lemma: "hē", pos: "pronoun" },
  "him": { lemma: "hē", pos: "pronoun" },
  "hit": { lemma: "hē", pos: "pronoun" },
  "hȳ": { lemma: "hē", pos: "pronoun" },
  "hī": { lemma: "hē", pos: "pronoun" },
  "ic": { lemma: "ic", pos: "pronoun" },
  "mē": { lemma: "ic", pos: "pronoun" },
  "mīn": { lemma: "ic", pos: "pronoun" },
  "þū": { lemma: "þū", pos: "pronoun" },
  "þē": { lemma: "þū", pos: "pronoun" },
  "þīn": { lemma: "þū", pos: "pronoun" },
  "hwā": { lemma: "hwā", pos: "pronoun" },
  "hwæt": { lemma: "hwā", pos: "pronoun" },
  "hwone": { lemma: "hwā", pos: "pronoun" },
  "hwæs": { lemma: "hwā", pos: "pronoun" },
  "hwǣm": { lemma: "hwā", pos: "pronoun" },
  "hwæðer": { lemma: "hwæðer", pos: "conjunction" },
  "hwæþer": { lemma: "hwæðer", pos: "conjunction" },
  "þēah": { lemma: "þēah", pos: "conjunction" },
  "ac": { lemma: "ac", pos: "conjunction" },
  "and": { lemma: "and", pos: "conjunction" },
  "ond": { lemma: "and", pos: "conjunction" },
  "on": { lemma: "on", pos: "preposition" },
  "mid": { lemma: "mid", pos: "preposition" },
  "be": { lemma: "be", pos: "preposition" },
  "oð": { lemma: "oð", pos: "preposition" },
  "oþ": { lemma: "oð", pos: "preposition" },
  "oþþe": { lemma: "oþþe", pos: "conjunction" },
  "tō": { lemma: "tō", pos: "preposition" },
  "būton": { lemma: "būton", pos: "preposition" },
  "swā": { lemma: "swā", pos: "adverb" },
  "þonan": { lemma: "þonan", pos: "adverb" },
  "þǣr": { lemma: "þǣr", pos: "adverb" },
  "ðǣr": { lemma: "þǣr", pos: "adverb" },
  "norþ": { lemma: "norþ", pos: "adverb" },
  "ēast": { lemma: "ēast", pos: "adverb" },
  "sūþ": { lemma: "sūþ", pos: "adverb" },
  "west": { lemma: "west", pos: "adverb" },
  "hū": { lemma: "hū", pos: "adverb" },
  "hwōn": { lemma: "hwōn", pos: "adverb" },
};

/**
 * Main Old English Lemmatization Engine.
 * Enforces:
 * - Articles/Demonstratives/Determiners -> Masculine Nominative Singular (e.g. sē, þes, sum)
 * - Adjectives -> Masculine Nominative Singular Strong Form (e.g. eall, micel, wēste, fēaw)
 * - Verbs -> Canonical Infinitive (e.g. secgan, faran, licgan, dōn, bēon)
 * - Nouns -> Canonical Nominative Singular (e.g. dæġ, stōw, mann, hunta)
 */
export function lemmatizeOldEnglish(rawSurface: string, gloss: string): LexiconEntry {
  const nfc = rawSurface.normalize("NFC").toLowerCase().replace(/[.,;:!?]+$/, "").trim();
  const unhyphenatedNfc = nfc.replace(/-/g, "");
  const upperGloss = gloss.toUpperCase();

  // 1. Articles and Demonstratives (Definite Article -> "sē", Proximal -> "þes")
  if (DEMONSTRATIVE_ARTICLE_MAP[nfc] || DEMONSTRATIVE_ARTICLE_MAP[unhyphenatedNfc]) {
    const lemma = DEMONSTRATIVE_ARTICLE_MAP[nfc] || DEMONSTRATIVE_ARTICLE_MAP[unhyphenatedNfc];
    return {
      lemma,
      pos: "determiner",
      wiktionaryUrl: formatWiktionaryUrl(lemma),
      definition: gloss,
    };
  }

  // 2. Determiners and Quantifiers
  if (DETERMINER_MAP[nfc] || DETERMINER_MAP[unhyphenatedNfc]) {
    const lemma = DETERMINER_MAP[nfc] || DETERMINER_MAP[unhyphenatedNfc];
    return {
      lemma,
      pos: "determiner",
      wiktionaryUrl: formatWiktionaryUrl(lemma),
      definition: gloss,
    };
  }

  // 3. Direct Verb Lemmatization (Infinitive)
  if (VERB_ABLUT_MAP[nfc] || VERB_ABLUT_MAP[unhyphenatedNfc]) {
    const lemma = VERB_ABLUT_MAP[nfc] || VERB_ABLUT_MAP[unhyphenatedNfc];
    return {
      lemma,
      pos: "verb",
      wiktionaryUrl: formatWiktionaryUrl(lemma),
      definition: gloss,
    };
  }

  // 4. Direct Noun Lemmatization (Nominative Singular)
  if (NOUN_LEMMA_MAP[nfc] || NOUN_LEMMA_MAP[unhyphenatedNfc]) {
    const lemma = NOUN_LEMMA_MAP[nfc] || NOUN_LEMMA_MAP[unhyphenatedNfc];
    return {
      lemma,
      pos: "noun",
      wiktionaryUrl: formatWiktionaryUrl(lemma),
      definition: gloss,
    };
  }

  // 5. Direct Adjectives (Masculine Nominative Singular Strong Form)
  if (ADJ_LEMMA_MAP[nfc] || ADJ_LEMMA_MAP[unhyphenatedNfc]) {
    const lemma = ADJ_LEMMA_MAP[nfc] || ADJ_LEMMA_MAP[unhyphenatedNfc];
    return {
      lemma,
      pos: "adjective",
      wiktionaryUrl: formatWiktionaryUrl(lemma),
      definition: gloss,
    };
  }

  // 6. Pronouns & Conjunctions
  if (PRON_CONJ_MAP[nfc] || PRON_CONJ_MAP[unhyphenatedNfc]) {
    const entry = PRON_CONJ_MAP[nfc] || PRON_CONJ_MAP[unhyphenatedNfc];
    return {
      lemma: entry.lemma,
      pos: entry.pos,
      wiktionaryUrl: formatWiktionaryUrl(entry.lemma),
      definition: gloss,
    };
  }

  // 7. Lexicon Fallback Match
  const lex = resolveOldEnglishLexicon(rawSurface, gloss);
  if (lex.lemma && lex.lemma !== unhyphenatedNfc) {
    return lex;
  }

  // 8. Algorithmic Demorphing Engine for Unseen Words
  const isVerb =
    upperGloss.includes("PST") ||
    upperGloss.includes("PRS") ||
    upperGloss.includes("SJV") ||
    upperGloss.includes("IND") ||
    upperGloss.includes("INF") ||
    upperGloss.includes("IMP") ||
    upperGloss.includes("PTCP");

  const isNoun =
    upperGloss.includes("NOM") ||
    upperGloss.includes("ACC") ||
    upperGloss.includes("GEN") ||
    upperGloss.includes("DAT") ||
    upperGloss.includes("VOC");

  const isAdj = upperGloss.includes("ADJ");

  if (isAdj) {
    let adjLemma = unhyphenatedNfc;
    // Strip oblique endings: -ne, -um, -re, -ra, -an, -ena, -es
    if (adjLemma.endsWith("ena") && adjLemma.length > 5) {
      adjLemma = adjLemma.slice(0, -3);
    } else if (
      (adjLemma.endsWith("ne") ||
        adjLemma.endsWith("um") ||
        adjLemma.endsWith("re") ||
        adjLemma.endsWith("ra") ||
        adjLemma.endsWith("an") ||
        adjLemma.endsWith("es")) &&
      adjLemma.length > 4
    ) {
      adjLemma = adjLemma.slice(0, -2);
    } else if (
      (adjLemma.endsWith("e") || adjLemma.endsWith("a") || adjLemma.endsWith("u")) &&
      adjLemma.length > 3 &&
      !JA_JO_ADJECTIVES.has(adjLemma)
    ) {
      adjLemma = adjLemma.slice(0, -1);
    }

    // Stem restoration (e.g. eal- -> eall, micl- -> micel)
    if (adjLemma === "eal") adjLemma = "eall";
    if (adjLemma === "micl") adjLemma = "micel";
    if (adjLemma === "ōþr") adjLemma = "ōþer";

    return {
      lemma: adjLemma,
      pos: "adjective",
      wiktionaryUrl: formatWiktionaryUrl(adjLemma),
      definition: gloss,
    };
  }

  if (isVerb) {
    let verbInfinitive = unhyphenatedNfc;
    // Reconstruct weak verbs (-ode / -on / -að / -de / -te) -> -ian or -an
    if (
      verbInfinitive.endsWith("ode") ||
      verbInfinitive.endsWith("odon") ||
      verbInfinitive.endsWith("iað")
    ) {
      verbInfinitive = verbInfinitive.replace(/(?:ode|odon|iað)$/, "ian");
    } else if (
      verbInfinitive.endsWith("de") ||
      verbInfinitive.endsWith("te") ||
      verbInfinitive.endsWith("ed") ||
      verbInfinitive.endsWith("að") ||
      verbInfinitive.endsWith("on")
    ) {
      verbInfinitive = verbInfinitive.replace(/(?:de|te|ed|að|on)$/, "an");
    } else if (
      !verbInfinitive.endsWith("an") &&
      !verbInfinitive.endsWith("en") &&
      !verbInfinitive.endsWith("on")
    ) {
      verbInfinitive += "an";
    }

    return {
      lemma: verbInfinitive,
      pos: "verb",
      wiktionaryUrl: formatWiktionaryUrl(verbInfinitive),
      definition: gloss,
    };
  }

  if (isNoun) {
    let nounNomSg = unhyphenatedNfc;
    // Strip nominal plural/dative/genitive endings
    if (nounNomSg.endsWith("um") && nounNomSg.length > 3) {
      nounNomSg = nounNomSg.slice(0, -2);
    } else if (nounNomSg.endsWith("es") && nounNomSg.length > 3) {
      nounNomSg = nounNomSg.slice(0, -2);
    } else if (nounNomSg.endsWith("as") && nounNomSg.length > 3) {
      nounNomSg = nounNomSg.slice(0, -2);
    } else if (nounNomSg.endsWith("ra") && nounNomSg.length > 3) {
      nounNomSg = nounNomSg.slice(0, -2);
    } else if (nounNomSg.endsWith("e") && nounNomSg.length > 4) {
      nounNomSg = nounNomSg.slice(0, -1);
    }

    return {
      lemma: nounNomSg,
      pos: "noun",
      wiktionaryUrl: formatWiktionaryUrl(nounNomSg),
      definition: gloss,
    };
  }

  // 9. Generic Fallback
  const cleanLemma = unhyphenatedNfc.replace(/^-|-$/g, "");
  return {
    lemma: cleanLemma,
    pos: (lex.pos || "noun") as PartOfSpeech,
    wiktionaryUrl: formatWiktionaryUrl(cleanLemma),
    definition: gloss,
  };
}

export function formatWiktionaryUrl(lemma: string): string {
  // Normalize, strip decomposed accents but preserve standard macrons, capitalize known names
  const normalized = lemma.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const capitalized = [
    "aelfred",
    "ohthere",
    "wulfstan",
    "cwenas",
    "finn",
    "finnas",
    "sciringesheal",
    "halgoland",
    "truso",
  ].includes(normalized.toLowerCase())
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : normalized;

  return `https://en.wiktionary.org/wiki/${encodeURIComponent(capitalized)}#Old_English`;
}
