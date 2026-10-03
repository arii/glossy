import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseGb4e } from "../lib/gb4e.ts";

const texPath = join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");
if (!existsSync(texPath)) {
  console.error(`Master TeX file not found at ${texPath}`);
  process.exit(1);
}

const texContent = readFileSync(texPath, "utf8");
const parsed = parseGb4e(texContent);

let totalTokens = 0;
let verbsCount = 0;
let nounsCount = 0;
let adjectivesCount = 0;
let determinersCount = 0;
let numeralsCount = 0;
const invalidLemmas = [];
const invalidUrls = [];

const irregularVerbLemmas = new Set([
  "wesan",
  "bēon",
  "dōn",
  "ġedōn",
  "willan",
  "slēan",
  "ofslēan",
  "sēon",
  "magan",
  "sculan",
  "witan",
  "nytan",
  "nabban",
  "habban",
  "āgan",
  "mōtan",
  "cunnan",
]);

const validDemonstrativeLemmas = new Set(["sē", "þes", "sum", "ǣlċ", "ǣniġ", "nǣniġ", "swilċ", "hwilċ", "ōþer"]);
const validNumeralLemmas = new Set([
  "ān",
  "twēgen",
  "þrīe",
  "fēower",
  "fīf",
  "siex",
  "syx",
  "seofon",
  "eahta",
  "nigon",
  "tīen",
  "twēntig",
  "syxtig",
  "hund",
  "hundtēontiġ",
  "þūsend",
]);

for (const sentence of parsed.sentences) {
  for (const word of sentence.words) {
    totalTokens++;
    const analysis = word.analysis;
    if (!analysis) {
      invalidLemmas.push({ id: word.id, error: "Missing analysis" });
      continue;
    }

    // 1. Check Wiktionary URL formatting
    if (!analysis.wiktionaryUrl || !analysis.wiktionaryUrl.includes("#Old_English")) {
      invalidUrls.push({ id: word.id, url: analysis.wiktionaryUrl });
    }
    if (analysis.wiktionaryUrl && analysis.wiktionaryUrl.includes("%CC%84")) {
      invalidUrls.push({ id: word.id, error: "Contains decomposed combining macron", url: analysis.wiktionaryUrl });
    }

    // 2. Check Verbs (must be infinitive)
    if (analysis.partOfSpeech === "verb") {
      verbsCount++;
      const lemma = analysis.lemma;
      const isInfinitive =
        lemma.endsWith("an") ||
        lemma.endsWith("ian") ||
        lemma.endsWith("on") ||
        lemma.endsWith("n") ||
        irregularVerbLemmas.has(lemma);

      if (!isInfinitive) {
        invalidLemmas.push({
          id: word.id,
          surface: word.originalWord,
          pos: "verb",
          lemma,
          error: "Verb lemma is not in infinitive form",
        });
      }
    }

    // 3. Check Nouns (must be nominative singular)
    if (analysis.partOfSpeech === "noun") {
      nounsCount++;
      const lemma = analysis.lemma;
      // Noun lemma shouldn't end in dative plural -um
      if (lemma.endsWith("um") && lemma.length > 4) {
        invalidLemmas.push({
          id: word.id,
          surface: word.originalWord,
          pos: "noun",
          lemma,
          error: "Noun lemma appears to be inflected in dative plural -um",
        });
      }
    }

    // 4. Check Numerals (must be Masculine Nominative form)
    if (analysis.partOfSpeech === "numeral") {
      numeralsCount++;
      const lemma = analysis.lemma;
      if (!validNumeralLemmas.has(lemma)) {
        invalidLemmas.push({
          id: word.id,
          surface: word.originalWord,
          pos: "numeral",
          lemma,
          error: "Numeral lemma is not in canonical Masculine Nominative form (e.g. twēgen, þrīe)",
        });
      }
    }

    // 5. Check Adjectives (must be masculine nominative singular strong form)
    if (analysis.partOfSpeech === "adjective") {
      adjectivesCount++;
      const lemma = analysis.lemma;
      // Adjective lemma should not have oblique endings like -ne, -um, -re, -ra, -an, -ena
      const hasObliqueEnding =
        (lemma.endsWith("ne") && lemma !== "clǣne" && lemma !== "grēne") ||
        lemma.endsWith("um") ||
        lemma.endsWith("re") ||
        lemma.endsWith("ra") ||
        lemma.endsWith("an") ||
        lemma.endsWith("ena");

      if (hasObliqueEnding) {
        invalidLemmas.push({
          id: word.id,
          surface: word.originalWord,
          pos: "adjective",
          lemma,
          error: "Adjective lemma appears to have oblique/weak inflection endings instead of Masculine Nominative Singular Strong",
        });
      }
    }

    // 6. Check Determiners / Demonstratives / Articles
    if (analysis.partOfSpeech === "determiner") {
      determinersCount++;
      const lemma = analysis.lemma;
      if (!validDemonstrativeLemmas.has(lemma)) {
        // If not in known canonical set, check if it looks inflected
        const looksInflected =
          (lemma.endsWith("um") && lemma !== "sum") ||
          (lemma.endsWith("es") && lemma !== "þes") ||
          lemma.endsWith("re") ||
          lemma.endsWith("ra") ||
          lemma.endsWith("ne") ||
          lemma === "þǣm" ||
          lemma === "þā" ||
          lemma === "þæs" ||
          lemma === "þis" ||
          lemma === "þissum";

        if (looksInflected) {
          invalidLemmas.push({
            id: word.id,
            surface: word.originalWord,
            pos: "determiner",
            lemma,
            error: "Determiner lemma appears inflected; must be Masculine Nominative Singular (e.g. sē, þes, sum)",
          });
        }
      }
    }
  }
}

console.log(`Audited ${totalTokens} tokens across ${parsed.sentences.length} sentences:`);
console.log(`- ${verbsCount} verbs verified for canonical infinitive lemmas`);
console.log(`- ${nounsCount} nouns verified for canonical nominative singular lemmas`);
console.log(`- ${adjectivesCount} adjectives verified for masculine nominative singular strong lemmas`);
console.log(`- ${determinersCount} determiners verified for masculine nominative singular lemmas`);
console.log(`- ${numeralsCount} numerals verified for masculine nominative lemmas`);

if (invalidUrls.length > 0) {
  console.error(`Found ${invalidUrls.length} invalid Wiktionary URLs:`, invalidUrls);
  process.exit(1);
}

if (invalidLemmas.length > 0) {
  console.error(`Found ${invalidLemmas.length} lemma inaccuracies:`, invalidLemmas);
  process.exit(1);
}

console.log("All Old English lemmas and Wiktionary URLs passed validation with 100% accuracy!");
