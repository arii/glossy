import type { GlossRecord, Passage } from "../lib/types";

const sourceFile = "references/Voyages_of_Ohthere_Wulfstan.tex";

export const glossRecords: Record<string, GlossRecord> = {
  saede: {
    id: "saede",
    surface: "sǣ-d-e",
    sourceGloss: "say-PST-IND.3SG",
    sourceGlossTex: "say-\\textsc{pst}-\\textsc{ind.3sg}",
    analysis: {
      lemma: "sǣgan",
      partOfSpeech: "verb",
      features: { tense: "past", mood: "indicative", person: 3, number: "singular" },
      morphemes: [
        { form: "sǣ", gloss: "say", kind: "stem" },
        { form: "d", gloss: "PST", kind: "suffix" },
        { form: "e", gloss: "IND.3SG", kind: "ending" },
      ],
      definition: "said, spoke",
      phonetic: "/ˈsæː.de/",
      historicalNote: "The long front vowel ǣ is characteristic of Old English spelling.",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/s%C7%A3gan",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
      notes: "Segmentation and source gloss follow the first \\gll entry.",
    },
  },
  hlaforde: {
    id: "hlaforde",
    surface: "hlāford-e",
    sourceGloss: "lord-DAT.SG",
    sourceGlossTex: "lord-\\textsc{dat.sg}",
    analysis: {
      lemma: "hlāford",
      partOfSpeech: "noun",
      features: { case: "dative", number: "singular", gender: "masculine" },
      morphemes: [
        { form: "hlāford", gloss: "lord", kind: "stem" },
        { form: "e", gloss: "DAT.SG", kind: "ending" },
      ],
      definition: "lord, master",
      phonetic: "/ˈhlɑː.vord/",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/hl%C4%81ford",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
      notes: "The dative singular is represented as an inflection, not a verb conjugation.",
    },
  },
  northmest: {
    id: "northmest",
    surface: "norþ-mest",
    sourceGloss: "north-most.ADV",
    sourceGlossTex: "north-most.\\textsc{adv}",
    analysis: {
      lemma: "norþ",
      partOfSpeech: "adverb",
      features: { degree: "superlative" },
      morphemes: [
        { form: "norþ", gloss: "north", kind: "stem" },
        { form: "mest", gloss: "most", kind: "suffix" },
      ],
      definition: "furthest north, northernmost",
      phonetic: "/ˈnorθ.mest/",
      historicalNote: "þ represents the thorn letter, pronounced like modern English th.",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/nor%C3%BEmest",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
      notes: "The source labels this token as north-most.adverb.",
    },
  },
  bude: {
    id: "bude",
    surface: "bū-d-e",
    sourceGloss: "dwell-PST-SJV.SG",
    sourceGlossTex: "dwell-\\textsc{pst}-\\textsc{sjv.sg}",
    analysis: {
      lemma: "būan",
      partOfSpeech: "verb",
      features: { tense: "past", mood: "subjunctive", person: 3, number: "singular" },
      morphemes: [
        { form: "bū", gloss: "dwell", kind: "stem" },
        { form: "d", gloss: "PST", kind: "suffix" },
        { form: "e", gloss: "SJV.SG", kind: "ending" },
      ],
      definition: "dwelt, lived",
      phonetic: "/ˈbuː.de/",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/b%C5%ABan",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
      notes: "The source gloss uses sjv.sg; the model expands this to subjunctive singular.",
    },
  },
  styccemaelum: {
    id: "styccemaelum",
    surface: "styċċe-mǣl-um",
    sourceGloss: "piece-meal-DAT.PL",
    sourceGlossTex: "piece-meal-\\textsc{dat.pl}",
    analysis: {
      lemma: "styċċemǣl",
      partOfSpeech: "noun",
      features: { case: "dative", number: "plural" },
      morphemes: [
        { form: "styċċe", gloss: "piece", kind: "stem" },
        { form: "mǣl", gloss: "meal", kind: "stem" },
        { form: "um", gloss: "DAT.PL", kind: "ending" },
      ],
      definition: "piece-meal, here and there",
      phonetic: "/ˈstyt.t͡ʃeˌmæː.lum/",
      historicalNote: "The source uses morpheme boundaries to show the word's structure.",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/styċċemǣl",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
    },
  },
  wiciad: {
    id: "wiciad",
    surface: "wīc-i-að",
    sourceGloss: "camp-THM-PRS.IND.PL",
    sourceGlossTex: "camp-\\textsc{thm}-\\textsc{prs.ind.pl}",
    analysis: {
      lemma: "wīcian",
      partOfSpeech: "verb",
      features: { tense: "present", mood: "indicative", person: 3, number: "plural" },
      morphemes: [
        { form: "wīc", gloss: "camp", kind: "stem" },
        { form: "i", gloss: "THM", kind: "suffix" },
        { form: "að", gloss: "PRS.IND.PL", kind: "ending" },
      ],
      definition: "camp, dwell temporarily",
      phonetic: "/ˈwiː.t͡ʃi.ɑːθ/",
      wiktionaryUrl: "https://en.wiktionary.org/wiki/w%C4%ABcian",
    },
    review: {
      status: "source-checked",
      source: { file: sourceFile, locator: "paragraph.1 / exercise 1" },
    },
  },
};

for (const record of Object.values(glossRecords)) {
  record.review.notes = `${record.review.notes ?? ""} Source: ${sourceFile}.`.trim();
}

export const readingPassage: Passage = {
  title: "The voyages of Ohthere and Wulfstan",
  source: "Translated and glossed by Tyler Lemon · September 30, 2026",
  segments: [
    { type: "text", value: "Ōhthere " },
    { type: "gloss", value: "sǣ-d-e", glossId: "saede" },
    { type: "text", value: " his " },
    { type: "gloss", value: "hlāford-e", glossId: "hlaforde" },
    { type: "text", value: ", Ælfrēd-e cyning-e, þæt hē eal-ra Norð-monn-a " },
    { type: "gloss", value: "norþ-mest", glossId: "northmest" },
    { type: "text", value: " " },
    { type: "gloss", value: "bū-d-e", glossId: "bude" },
    {
      type: "text",
      value:
        ".\nHē cwæð þæt hē bū-d-e on þǣm land-e norþ-weard-um wiþ þā West-sǣ.\n\nHē ",
    },
    { type: "gloss", value: "sǣ-d-e", glossId: "saede" },
    {
      type: "text",
      value:
        " þēah þæt þæt land sīe swīþ-e lang norþ þonan, ac hit is eal wēst-e, būton on fēaw-um stōw-um ",
    },
    { type: "gloss", value: "styċċe-mǣl-um", glossId: "styccemaelum" },
    { type: "text", value: " " },
    { type: "gloss", value: "wīc-i-að", glossId: "wiciad" },
    {
      type: "text",
      value:
        " Finn-as on hunt-oð-e on wintr-a and on sumer-a on fisc-aþ-e be þǣre sǣ.",
    },
  ],
  translation:
    "Ohthere said to his lord, King Alfred, that he lived the furthest north of all Norwegians. He said that he lived in the northern part of the land by the West Sea (ocean west of Norway). He said though that the land continues very long to the north from there, but it is all uninhabited, except in a few places here and there Finns (i.e. Sami) camp, hunting in winter and in summer fishing by the sea.",
};
