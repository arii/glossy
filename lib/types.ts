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
  pronunciationSource?: string;
  historicalNote?: string;
  wiktionaryUrl?: string;
};

export type InterlinearWord = {
  id: string;
  originalWord: string;
  morphologicalGloss?: string;
  trailingPunctuation?: string;
  sourceGlossTex?: string;
  analysis?: LinguisticAnalysis;
  review?: ReviewMetadata;
};

export type ReadingSentence = {
  id: string;
  translation: string;
  words: InterlinearWord[];
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

export type TextDocument = Passage & {
  textId: string;
  slug: string;
  language: "Old English";
  author?: string;
  title: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  status: "draft" | "review" | "published";
  sentences?: ReadingSentence[];
  blocks?: PassageBlock[];
  glossRecords?: GlossRecord[];
};

export type GlossRecord = {
  id: string;
  surface: string;
  sourceGloss: string;
  sourceGlossTex: string;
  analysis: LinguisticAnalysis;
  review: ReviewMetadata;
};

export type PassageDocument = TextDocument;

export type DictionaryMorpheme = {
  part: string;
  meaning: string;
};

export type DictionaryEntry = {
  id?: string;
  word: string;
  pronunciation?: string;
  sourceGloss?: string;
  morphemes?: DictionaryMorpheme[];
  inflection?: string;
  definition?: string;
  relativePath?: string;
};

export type ManuscriptSentenceBlock = {
  id: string;
  body: unknown;
  translation?: string;
};

export type ManuscriptDocument = {
  slug: string;
  title: string;
  author?: string;
  source?: string;
  translation?: string;
  blocks?: ManuscriptSentenceBlock[];
  body: unknown;
  rawBody?: string;
  _tina_metadata?: Record<string, string>;
};

