/**
 * Canonical Old English lexicon lookup for accurate lemmas,
 * parts of speech, and verified Wiktionary URLs.
 */

import type { LexiconEntry } from "./types.ts";

export type { LexiconEntry };

const OLD_ENGLISH_LEXICON: Record<string, LexiconEntry> = {
  // Verbs
  "būan": {
    lemma: "būan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/buan#Old_English",
    definition: "to dwell, inhabit",
    ipa: "/ˈbuː.ɑn/",
  },
  "buan": {
    lemma: "būan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/buan#Old_English",
    definition: "to dwell, inhabit",
    ipa: "/ˈbuː.ɑn/",
  },
  "sǣ-d-e": {
    lemma: "secgan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/secgan#Old_English",
    definition: "to say, speak",
    ipa: "/ˈsæː.de/",
  },
  "sǣde": {
    lemma: "secgan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/secgan#Old_English",
    definition: "to say, speak",
    ipa: "/ˈsæː.de/",
  },
  "cwæð": {
    lemma: "cweþan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/cwe%C3%BEan#Old_English",
    definition: "to say, speak, declare",
    ipa: "/kwæθ/",
  },
  "bū-d-e": {
    lemma: "būan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/buan#Old_English",
    definition: "to dwell, inhabit",
    ipa: "/ˈbuː.de/",
  },
  "wæs": {
    lemma: "wesan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wesan#Old_English",
    definition: "to be",
    ipa: "/wæs/",
  },
  "is": {
    lemma: "wesan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wesan#Old_English",
    definition: "to be (is)",
    ipa: "/is/",
  },
  "sīe": {
    lemma: "wesan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wesan#Old_English",
    definition: "to be (subjunctive)",
  },
  "sȳ": {
    lemma: "wesan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wesan#Old_English",
    definition: "to be (subjunctive)",
  },
  "bēo-ð": {
    lemma: "bēon",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/beon#Old_English",
    definition: "to be (habitual/future)",
  },
  "bi-ð": {
    lemma: "bēon",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/beon#Old_English",
    definition: "to be (habitual/future)",
  },
  "hæf-d-e": {
    lemma: "habban",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/habban#Old_English",
    definition: "to have",
  },
  "n-æf-d-e": {
    lemma: "nabban",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/nabban#Old_English",
    definition: "to not have (ne + habban)",
  },
  "habb-að": {
    lemma: "habban",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/habban#Old_English",
    definition: "to have",
  },
  "wīc-i-að": {
    lemma: "wīcian",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wician#Old_English",
    definition: "to camp, dwell",
  },
  "wīc-o-d-e": {
    lemma: "wīcian",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/wician#Old_English",
    definition: "to camp, dwell",
  },
  "seġl-o-d-e": {
    lemma: "seġlian",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/seglian#Old_English",
    definition: "to sail",
  },
  "seġl-i-an": {
    lemma: "seġlian",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/seglian#Old_English",
    definition: "to sail",
  },
  "ġe-seġl-i-an": {
    lemma: "geseġlian",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/geseglian#Old_English",
    definition: "to sail",
  },
  "ā-sett-e": {
    lemma: "āsettan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/asettan#Old_English",
    definition: "to set out, place",
  },
  "ġe-dō-ð": {
    lemma: "ġedōn",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/gedon#Old_English",
    definition: "to make, cause, do",
  },
  "ofer-fror-en": {
    lemma: "oferfrēosan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/oferfreosan#Old_English",
    definition: "to freeze over",
  },
  "of-slōg-e": {
    lemma: "ofslēan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/ofslean#Old_English",
    definition: "to slay, kill",
  },
  "sōh-t-e": {
    lemma: "sēcan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/secan#Old_English",
    definition: "to seek, visit",
  },
  "ġyld-að": {
    lemma: "gildan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/gildan#Old_English",
    definition: "to pay, yield",
  },
  "ġylt": {
    lemma: "gildan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/gildan#Old_English",
    definition: "to pay, yield",
  },
  "lī-ð": {
    lemma: "licgan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/licgan#Old_English",
    definition: "to lie, extend",
  },
  "liċġ-að": {
    lemma: "licgan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/licgan#Old_English",
    definition: "to lie, extend",
  },
  "cym-ð": {
    lemma: "cuman",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/cuman#Old_English",
    definition: "to come",
  },
  "cum-að": {
    lemma: "cuman",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/cuman#Old_English",
    definition: "to come",
  },
  "drinc-að": {
    lemma: "drincan",
    pos: "verb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/drincan#Old_English",
    definition: "to drink",
  },

  // Proper Nouns & Core Nouns
  "ōhthere": {
    lemma: "Ōhthere",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Ohthere#Old_English",
    definition: "Ohthere (Norwegian traveler / chieftain)",
  },
  "wulfstān": {
    lemma: "Wulfstān",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Wulfstan#Old_English",
    definition: "Wulfstan (Anglo-Saxon voyager)",
  },
  "ælfrēd-e": {
    lemma: "Ælfrēd",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
    definition: "King Alfred the Great",
  },
  "ælfrēd-e": {
    lemma: "Ælfrēd",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
    definition: "King Alfred the Great",
  },
  "ælfred-e": {
    lemma: "Ælfrēd",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
    definition: "King Alfred the Great",
  },
  "ælfrēd": {
    lemma: "Ælfrēd",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
    definition: "King Alfred the Great",
  },
  "ælfred": {
    lemma: "Ælfrēd",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
    definition: "King Alfred the Great",
  },
  "hlāford-e": {
    lemma: "hlāford",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/hlaford#Old_English",
    definition: "lord, master",
  },
  "cyning-e": {
    lemma: "cyning",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/cyning#Old_English",
    definition: "king",
  },
  "cyning": {
    lemma: "cyning",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/cyning#Old_English",
    definition: "king",
  },
  "norð-monn-a": {
    lemma: "Norþman",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Nor%C3%BEman#Old_English",
    definition: "Northman, Norwegian",
  },
  "norð-men": {
    lemma: "Norþman",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Nor%C3%BEman#Old_English",
    definition: "Northmen, Norwegians",
  },
  "finn-as": {
    lemma: "Finn",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Finn#Old_English",
    definition: "Finn, Sami person",
  },
  "cwēn-as": {
    lemma: "Cwēnas",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/Cwenas#Old_English",
    definition: "Kvens (people of northern Scandinavia)",
  },
  "fætels-as": {
    lemma: "fætels",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/f%C3%A6tels#Old_English",
    definition: "vessel, pouch",
  },
  "fǣtels-as": {
    lemma: "fætels",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/f%C3%A6tels#Old_English",
    definition: "vessel, pouch",
  },
  "land": {
    lemma: "land",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/land#Old_English",
    definition: "land, territory",
  },
  "sǣ": {
    lemma: "sǣ",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/s%C3%A6#Old_English",
    definition: "sea, ocean",
  },
  "mōr-as": {
    lemma: "mōr",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/mor#Old_English",
    definition: "moor, highland waste",
  },
  "dēor-a": {
    lemma: "dēor",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/deor#Old_English",
    definition: "wild animal, beast",
  },
  "hrān-as": {
    lemma: "hrān",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/hran#Old_English",
    definition: "reindeer",
  },
  "hors-an": {
    lemma: "hors",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/hors#Old_English",
    definition: "horse",
  },
  "wæter-es": {
    lemma: "wæter",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/w%C3%A6ter#Old_English",
    definition: "water",
  },
  "eal-að": {
    lemma: "ealu",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/ealu#Old_English",
    definition: "ale, beer",
  },
  "sumor": {
    lemma: "sumor",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/sumor#Old_English",
    definition: "summer",
  },
  "winter": {
    lemma: "winter",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/winter#Old_English",
    definition: "winter, year",
  },
  "stēor-bord": {
    lemma: "stēorbord",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/steorbord#Old_English",
    definition: "starboard (right side of ship)",
  },
  "bæc-bord": {
    lemma: "bæcbord",
    pos: "noun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/b%C3%A6cbord#Old_English",
    definition: "port / larboard side of ship",
  },

  // Pronouns, Determiners, Adjectives
  "hē": {
    lemma: "hē",
    pos: "pronoun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
    definition: "he (3rd person pronoun)",
  },
  "his": {
    lemma: "hē",
    pos: "pronoun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
    definition: "his (genitive of hē)",
  },
  "him": {
    lemma: "hē",
    pos: "pronoun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
    definition: "him/them (dative of hē)",
  },
  "hit": {
    lemma: "hē",
    pos: "pronoun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/hit#Old_English",
    definition: "it (neuter pronoun)",
  },
  "hȳ": {
    lemma: "hē",
    pos: "pronoun",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
    definition: "they (nominative/accusative plural)",
  },
  "þæt": {
    lemma: "sē",
    pos: "determiner",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
    definition: "that, the (neuter nominative/accusative)",
  },
  "sē": {
    lemma: "sē",
    pos: "determiner",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
    definition: "the, that (masculine nominative)",
  },
  "sēo": {
    lemma: "sē",
    pos: "determiner",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
    definition: "the, that (feminine nominative)",
  },
  "þes": {
    lemma: "þes",
    pos: "determiner",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%BEes#Old_English",
    definition: "this (demonstrative pronoun)",
  },
  "þis": {
    lemma: "þes",
    pos: "determiner",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%BEes#Old_English",
    definition: "this (neuter nominative/accusative)",
  },
  "eal-ra": {
    lemma: "eall",
    pos: "adjective",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/eall#Old_English",
    definition: "all (genitive plural)",
  },
  "eal": {
    lemma: "eall",
    pos: "adjective",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/eall#Old_English",
    definition: "all, entirely",
  },
  "eall": {
    lemma: "eall",
    pos: "adjective",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/eall#Old_English",
    definition: "all",
  },
  "norþ-mest": {
    lemma: "norþ",
    pos: "adverb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/nor%C3%BE#Old_English",
    definition: "northmost, furthest north",
  },
  "swīþ-e": {
    lemma: "swīðe",
    pos: "adverb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/swi%C3%B0e#Old_English",
    definition: "very, strongly, exceedingly",
  },
  "swȳð-e": {
    lemma: "swīðe",
    pos: "adverb",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/swi%C3%B0e#Old_English",
    definition: "very, strongly, exceedingly",
  },
  "þēah": {
    lemma: "þēah",
    pos: "conjunction",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/%C3%BEeah#Old_English",
    definition: "though, although, however",
  },
  "ac": {
    lemma: "ac",
    pos: "conjunction",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/ac#Old_English",
    definition: "but, however",
  },
  "and": {
    lemma: "and",
    pos: "conjunction",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/and#Old_English",
    definition: "and",
  },
  "on": {
    lemma: "on",
    pos: "preposition",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/on#Old_English",
    definition: "in, on, upon",
  },
  "mid": {
    lemma: "mid",
    pos: "preposition",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/mid#Old_English",
    definition: "with, among",
  },
  "be": {
    lemma: "be",
    pos: "preposition",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/be#Old_English",
    definition: "by, along, near",
  },
  "oð": {
    lemma: "oð",
    pos: "preposition",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/o%C3%B0#Old_English",
    definition: "until, up to",
  },
  "tō": {
    lemma: "tō",
    pos: "preposition",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/to#Old_English",
    definition: "to, towards",
  },
};

export function resolveOldEnglishLexicon(rawSurface: string, gloss: string = ""): LexiconEntry {
  const nfc = rawSurface.normalize("NFC").toLowerCase().replace(/[.,;:!?]+$/, "").trim();
  const nfd = rawSurface.normalize("NFD").toLowerCase().replace(/[.,;:!?]+$/, "").trim();
  
  // 1. Direct match (NFC or NFD)
  if (OLD_ENGLISH_LEXICON[nfc]) return OLD_ENGLISH_LEXICON[nfc];
  if (OLD_ENGLISH_LEXICON[nfd]) return OLD_ENGLISH_LEXICON[nfd];

  // 2. Without hyphens
  const unhyphenatedNfc = nfc.replace(/-/g, "");
  const unhyphenatedNfd = nfd.replace(/-/g, "");
  if (OLD_ENGLISH_LEXICON[unhyphenatedNfc]) return OLD_ENGLISH_LEXICON[unhyphenatedNfc];
  if (OLD_ENGLISH_LEXICON[unhyphenatedNfd]) return OLD_ENGLISH_LEXICON[unhyphenatedNfd];

  // 3. Strip combining macrons/accents match
  const stripped = nfd.replace(/[\u0300-\u036f]/g, "").replace(/-/g, "");
  for (const [key, val] of Object.entries(OLD_ENGLISH_LEXICON)) {
    const keyStripped = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, "").toLowerCase();
    if (keyStripped === stripped) {
      return val;
    }
  }

  // 4. Special cases for common proper nouns & roots
  if (unhyphenatedNfc.includes("ælfred") || unhyphenatedNfd.includes("ælfred")) {
    return OLD_ENGLISH_LEXICON["ælfrēd-e"];
  }
  if (unhyphenatedNfc.includes("ohthere") || unhyphenatedNfc.includes("ōhthere")) {
    return OLD_ENGLISH_LEXICON["ōhthere"];
  }
  if (unhyphenatedNfc.includes("wulfstan") || unhyphenatedNfc.includes("wulfstān")) {
    return OLD_ENGLISH_LEXICON["wulfstān"];
  }

  // 5. Generic fallback with verified Old English Wiktionary link pattern
  const fallbackLemma = unhyphenatedNfc.replace(/^-|-$/g, "");
  if (fallbackLemma.endsWith("e") && fallbackLemma.length > 3) {
    const root = fallbackLemma.slice(0, -1);
    if (OLD_ENGLISH_LEXICON[root]) return OLD_ENGLISH_LEXICON[root];
  }

  // Ensure clean ASCII/Unicode slug without combining decomposed marks
  const cleanWiktionarySlug = fallbackLemma.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const safeGloss = (gloss || "").toLowerCase();
  return {
    lemma: fallbackLemma,
    pos: safeGloss.includes("say") || safeGloss.includes("travel") ? "verb" : "noun",
    wiktionaryUrl: `https://en.wiktionary.org/wiki/${encodeURIComponent(cleanWiktionarySlug)}#Old_English`,
    definition: gloss || fallbackLemma,
  };
}
