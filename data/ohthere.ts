import type { GlossRecord, Passage } from "../lib/types";

export const glossRecords: Record<string, GlossRecord> = {
  saede: {
    id: "saede",
    headword: "sǣde",
    definition: "said, spoke",
    phonetic: "/ˈsæː.de/",
    grammar: "Verb · past tense · indicative · 3rd person singular",
    conjugation: "sǣgan — to say: sǣde (past singular)",
    historicalNote: "The long front vowel ǣ is characteristic of Old English spelling.",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/s%C7%A3gan",
  },
  hlaforde: {
    id: "hlaforde",
    headword: "hlāforde",
    definition: "to lord, master",
    phonetic: "/ˈhlɑː.vor.de/",
    grammar: "Noun · dative singular masculine",
    conjugation: "hlāford — lord; the dative marks the person addressed.",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/hl%C4%81ford",
  },
  norþmest: {
    id: "northmest",
    headword: "norþmest",
    definition: "furthest north, northernmost",
    phonetic: "/ˈnorθ.mest/",
    grammar: "Superlative adjective/adverb",
    conjugation: "north + -mest — the superlative ending expresses the furthest degree.",
    historicalNote: "þ represents the thorn letter, pronounced like modern English th.",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/nor%C3%BEmest",
  },
  bude: {
    id: "bude",
    headword: "būde",
    definition: "dwelt, lived",
    phonetic: "/ˈbuː.de/",
    grammar: "Verb · past tense · subjunctive · 3rd person singular",
    conjugation: "būan — to dwell: būde (past subjunctive)",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/b%C5%ABan",
  },
  wiciað: {
    id: "wiciað",
    headword: "wīciað",
    definition: "they camp, dwell temporarily",
    phonetic: "/ˈwiː.t͡ʃi.ɑːθ/",
    grammar: "Verb · present tense · indicative · 3rd person plural",
    conjugation: "wīcian — to camp: wīciað (present plural)",
    wiktionaryUrl: "https://en.wiktionary.org/wiki/w%C4%ABcian",
  },
};

export const readingPassage: Passage = {
  title: "The voyages of Ohthere and Wulfstan",
  source: "Translated and glossed by Tyler Lemon · September 30, 2026",
  segments: [
    { type: "text", value: "Ōhthere " },
    { type: "gloss", value: "sǣde", glossId: "saede" },
    { type: "text", value: " his " },
    { type: "gloss", value: "hlāforde", glossId: "hlaforde" },
    { type: "text", value: ", Ælfrede cyninge, þæt hē ealra Norðmanna " },
    { type: "gloss", value: "norþmest", glossId: "norþmest" },
    { type: "text", value: " " },
    { type: "gloss", value: "būde", glossId: "bude" },
    {
      type: "text",
      value:
        ". Hē sǣde þēah þæt þæt land sīe swīþe lang norþ þonan, ac hit is eal wēste, būton on fēawum stōwum styċċemǣlum ",
    },
    { type: "gloss", value: "wīciað", glossId: "wiciað" },
    { type: "text", value: " Finnas, and þæt land wæs eall ġe-būn." },
  ],
  translation:
    "Ohthere said to his lord, King Alfred, that he lived the furthest north of all Norwegians. He said, however, that the land stretched far north from there, but was all uninhabited, except that Finns camped in a few places here and there.",
};
