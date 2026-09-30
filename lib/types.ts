export type PartOfSpeech =
  | "adjective"
  | "adverb"
  | "noun"
  | "verb"
  | "pronoun"
  | "determiner"
  | "preposition"
  | "conjunction";

export type InflectionFeatures = {
  case?: "nominative" | "accusative" | "genitive" | "dative";
  number?: "singular" | "plural";
  gender?: "masculine" | "feminine" | "neuter";
  person?: 1 | 2 | 3;
  tense?: "present" | "past";
  mood?: "indicative" | "subjunctive" | "imperative" | "infinitive";
  degree?: "positive" | "comparative" | "superlative";
};

export type Morpheme = {
  form: string;
  gloss: string;
  kind?: "stem" | "prefix" | "suffix" | "ending";
};

export type SourceReference = {
  file: string;
  locator: string;
};

export type ReviewMetadata = {
  status: "source-checked" | "needs-review";
  source: SourceReference;
  notes?: string;
};

export type LinguisticAnalysis = {
  lemma: string;
  partOfSpeech: PartOfSpeech;
  features: InflectionFeatures;
  morphemes: Morpheme[];
  definition: string;
  phonetic?: string;
  speechText?: string;
  pronunciationSource?: string;
  historicalNote?: string;
  wiktionaryUrl?: string;
};

export type GlossRecord = {
  id: string;
  surface: string;
  sourceGloss: string;
  sourceGlossTex: string;
  analysis: LinguisticAnalysis;
  review: ReviewMetadata;
};

export type PassageSegment =
  | { type: "text"; value: string }
  | { type: "gloss"; value: string; glossId: string };

export type PassageBlock = {
  id: string;
  segments: PassageSegment[];
  translation: string;
};

export type Passage = {
  title: string;
  source: string;
  blocks: PassageBlock[];
};
