import assert from "node:assert/strict";
import { formatInflectionDescription } from "../../lib/passage-utils";

console.log("Running formatInflectionDescription unit tests...");

// Test 1: Nouns (case, number, gender)
assert.equal(
  formatInflectionDescription(
    { lemma: "Ōhthere", partOfSpeech: "noun", features: { case: "nominative", gender: "neuter" }, morphemes: [], definition: "" },
    "Ohthere.NOM"
  ),
  "nominative, neuter",
  "Noun should format case and gender"
);

assert.equal(
  formatInflectionDescription(
    { lemma: "hlāford", partOfSpeech: "noun", features: { case: "dative", number: "singular" }, morphemes: [], definition: "" },
    "lord-DAT.SG"
  ),
  "dative, singular",
  "Noun should format case and number"
);

// Test 2: Pronouns (case, number, gender)
assert.equal(
  formatInflectionDescription(
    {
      lemma: "hē",
      partOfSpeech: "pronoun",
      features: { case: "genitive", number: "singular", gender: "masculine", person: 3 },
      morphemes: [],
      definition: "",
    },
    "3SG.M.GEN"
  ),
  "genitive, singular, masculine",
  "Pronoun should format case, number, gender"
);

// Test 3: Determiners & Numerals (case, number, gender)
assert.equal(
  formatInflectionDescription(
    {
      lemma: "sē",
      partOfSpeech: "determiner",
      features: { case: "dative", number: "singular", gender: "feminine" },
      morphemes: [],
      definition: "",
    },
    "DET.DEF.DAT.SG.F"
  ),
  "dative, singular, feminine",
  "Determiner should format case, number, gender"
);

assert.equal(
  formatInflectionDescription(
    {
      lemma: "þrīe",
      partOfSpeech: "numeral",
      features: { case: "accusative", gender: "masculine" },
      morphemes: [],
      definition: "",
    },
    "three.ACC.M"
  ),
  "accusative, masculine",
  "Numeral should format case and gender"
);

// Test 4: Adjectives (case, number, gender, strong/weak, degree)
assert.equal(
  formatInflectionDescription(
    {
      lemma: "eall",
      partOfSpeech: "adjective",
      features: { case: "genitive", number: "plural", declension: "strong" },
      morphemes: [],
      definition: "",
    },
    "all-GEN.PL.STR"
  ),
  "genitive, plural, strong",
  "Adjective should format case, number, strong declension"
);

assert.equal(
  formatInflectionDescription(
    {
      lemma: "feorr",
      partOfSpeech: "adjective",
      features: { gender: "masculine", degree: "superlative" },
      morphemes: [],
      definition: "",
    },
    "north-most.ADV"
  ),
  "masculine, superlative",
  "Adjective should format degree superlative"
);

// Test 5: Past Participle (as adjective / participle verb)
assert.equal(
  formatInflectionDescription(
    {
      lemma: "oferfrēosan",
      partOfSpeech: "verb",
      features: { case: "nominative", number: "singular", gender: "masculine", declension: "strong", tense: "past" },
      morphemes: [],
      definition: "",
    },
    "over-freeze.PST.PTCP.NOM.SG.M.STR"
  ),
  "nominative, singular, masculine, strong",
  "Past participle should format case, number, gender, declension"
);

// Test 6: Adverbs (comparative / superlative)
assert.equal(
  formatInflectionDescription(
    { lemma: "feorr", partOfSpeech: "adverb", features: { degree: "superlative" }, morphemes: [], definition: "" },
    "furthest"
  ),
  "superlative",
  "Adverb degree should return superlative"
);

assert.equal(
  formatInflectionDescription(
    { lemma: "swīðe", partOfSpeech: "adverb", features: {}, morphemes: [], definition: "" },
    "very"
  ),
  null,
  "Plain adverb without degree should return null"
);

// Test 7: Finite Verbs (person, number, tense, mood)
assert.equal(
  formatInflectionDescription(
    {
      lemma: "secgan",
      partOfSpeech: "verb",
      features: { person: 3, number: "singular", tense: "past", mood: "indicative" },
      morphemes: [],
      definition: "",
    },
    "say-PST-IND.3SG"
  ),
  "3rd person, singular, past, indicative",
  "Finite verb should format person, number, tense, mood"
);

assert.equal(
  formatInflectionDescription(
    {
      lemma: "būan",
      partOfSpeech: "verb",
      features: { number: "singular", tense: "past", mood: "subjunctive" },
      morphemes: [],
      definition: "",
    },
    "dwell-PST-SJV.SG"
  ),
  "singular, past, subjunctive",
  "Verb without explicit person should format number, tense, mood"
);

// Test 8: Infinitive Verbs ("infinitive")
assert.equal(
  formatInflectionDescription(
    {
      lemma: "faran",
      partOfSpeech: "verb",
      features: { mood: "infinitive" },
      morphemes: [],
      definition: "",
    },
    "go-INF"
  ),
  "infinitive",
  "Infinitive verb should return 'infinitive'"
);

assert.equal(
  formatInflectionDescription(
    {
      lemma: "faran",
      partOfSpeech: "verb",
      features: {},
      morphemes: [],
      definition: "",
    },
    "go-INF"
  ),
  "infinitive",
  "Infinitive verb detected from gloss should return 'infinitive'"
);

// Test 9: Prepositions, Conjunctions, Interjections (uninflected)
assert.equal(
  formatInflectionDescription(
    { lemma: "on", partOfSpeech: "preposition", features: {}, morphemes: [], definition: "" },
    "in"
  ),
  null,
  "Preposition should return null"
);

assert.equal(
  formatInflectionDescription(
    { lemma: "þæt", partOfSpeech: "conjunction", features: {}, morphemes: [], definition: "" },
    "COMP"
  ),
  null,
  "Conjunction should return null"
);

assert.equal(
  formatInflectionDescription(
    { lemma: "hwæt", partOfSpeech: "interjection", features: {}, morphemes: [], definition: "" },
    "listen"
  ),
  null,
  "Interjection should return null"
);

console.log("✓ All formatInflectionDescription unit tests passed successfully!");
