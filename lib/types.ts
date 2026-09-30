export type GlossRecord = {
  id: string;
  headword: string;
  definition?: string;
  phonetic?: string;
  grammar?: string;
  conjugation?: string;
  historicalNote?: string;
  wiktionaryUrl?: string;
};

export type PassageSegment =
  | { type: "text"; value: string }
  | { type: "gloss"; value: string; glossId: string };

export type Passage = {
  title: string;
  source: string;
  translation: string;
  segments: PassageSegment[];
};
