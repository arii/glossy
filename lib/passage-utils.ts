import type { GlossRecord, InflectionFeatures, LinguisticAnalysis, Passage, TextDocument } from "./types";
import { extractInflectionFeatures } from "./gb4e";

/**
 * Formats a human-readable inflection summary for a word based on its part of speech and morphological features.
 *
 * Rules:
 * - Nouns, pronouns, determiners/demonstratives, numerals: case, number, gender.
 * - Adjectives and past participles: case, number, gender, strong/weak (declension), degree.
 * - Adverbs: comparative/superlative (degree).
 * - Verbs: person, number, tense, mood (except infinitive verbs which return "infinitive").
 * - Prepositions, complementizers, conjunctions, interjections: not inflected (null).
 */
export function formatInflectionDescription(
  analysis: LinguisticAnalysis,
  sourceGloss?: string,
): string | null {
  const pos = analysis.partOfSpeech?.toLowerCase();

  // Prepositions, conjunctions, interjections are not inflected.
  if (!pos || pos === "preposition" || pos === "conjunction" || pos === "interjection") {
    return null;
  }

  const sourceFeatures = sourceGloss ? extractInflectionFeatures(sourceGloss) : {};
  const features: InflectionFeatures = {
    ...sourceFeatures,
    ...(analysis.features || {}),
  };

  const glossUpper = (sourceGloss || "").toUpperCase();

  // Detect past participles or nominal participle usage
  const isParticiple =
    glossUpper.includes("PTCP") ||
    glossUpper.includes("PP") ||
    (pos === "verb" && (features.case || features.declension || features.gender));

  // Category 1: Nouns, Pronouns, Determiners/Demonstratives, Numerals
  if (pos === "noun" || pos === "pronoun" || pos === "determiner" || pos === "numeral") {
    const parts: string[] = [];
    if (features.case) parts.push(features.case);
    if (features.number) parts.push(features.number);
    if (features.gender) parts.push(features.gender);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  // Category 2: Adjectives and Past Participles
  if (pos === "adjective" || isParticiple) {
    const parts: string[] = [];
    if (features.case) parts.push(features.case);
    if (features.number) parts.push(features.number);
    if (features.gender) parts.push(features.gender);
    if (features.declension) parts.push(features.declension);
    if (features.degree && features.degree !== "positive") parts.push(features.degree);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  // Category 3: Adverbs
  if (pos === "adverb") {
    if (features.degree) {
      return features.degree;
    }
    if (glossUpper.includes("SUP") || glossUpper.includes("MEST") || glossUpper.includes("MOST")) return "superlative";
    if ((glossUpper.includes("CMP") || glossUpper.includes("COMPR")) && !glossUpper.includes("COMP")) return "comparative";
    return null;
  }

  // Category 4: Verbs (non-participle)
  if (pos === "verb") {
    if (features.mood === "infinitive" || glossUpper.includes("INF")) {
      return "infinitive";
    }

    const parts: string[] = [];
    if (features.person) {
      const ordinals: Record<number, string> = { 1: "1st person", 2: "2nd person", 3: "3rd person" };
      parts.push(ordinals[features.person] || `${features.person} person`);
    }
    if (features.number) parts.push(features.number);
    if (features.tense) parts.push(features.tense);
    if (features.mood) parts.push(features.mood);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  return null;
}

export function getGlossRecords(document: TextDocument): Record<string, GlossRecord> {
  if (document.glossRecords && document.glossRecords.length > 0) {
    return Object.fromEntries(
      document.glossRecords.map((record) => [record.id, record]),
    );
  }

  const records: Record<string, GlossRecord> = {};
  for (const sentence of document.sentences ?? []) {
    for (const [index, word] of sentence.words.entries()) {
      records[word.id] = {
        id: word.id,
        surface: `${word.originalWord}${word.trailingPunctuation ?? ""}`,
        sourceGloss: word.morphologicalGloss ?? word.originalWord,
        sourceGlossTex: word.sourceGlossTex ?? word.morphologicalGloss ?? word.originalWord,
        analysis:
          word.analysis ?? {
            lemma: word.originalWord,
            partOfSpeech: "noun",
            features: {},
            morphemes: [
              {
                form: word.originalWord,
                gloss: word.morphologicalGloss ?? word.originalWord,
              },
            ],
            definition: word.morphologicalGloss ?? word.originalWord,
          },
        review:
          word.review ?? {
            status: "needs-review",
            source: {
              file: document.sourceFile,
              locator: `${sentence.id}:${index + 1}`,
            },
          },
      };
    }
  }

  return records;
}

export function getReadingPassage(document: TextDocument): Passage {
  if (document.blocks && document.blocks.length > 0) {
    return {
      title: document.title,
      source: document.source,
      blocks: document.blocks,
    };
  }

  return {
    title: document.title,
    source: document.source,
    blocks: (document.sentences ?? []).map((sentence) => ({
      id: sentence.id,
      translation: sentence.translation,
      notes: sentence.notes,
      footnotes: sentence.footnotes,
      segments: sentence.words.map((word) => ({
        type: "gloss",
        value: `${word.originalWord}${word.trailingPunctuation ?? ""}`,
        glossId: word.id,
      })),
    })),
  };
}
