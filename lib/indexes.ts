/**
 * Static loaders and O(1) lookup helpers for pre-computed lexicon indexes.
 */

import surfaceMapData from "../content/_generated/surface-map.json";
import lexiconIndexData from "../content/_generated/lexicon-index.json";
import vocabularyIndexData from "../content/_generated/vocabulary-index.json";

export type Occurrence = {
  textSlug: string;
  textTitle?: string;
  sentenceId: string;
  wordId: string;
  surface: string;
  originalWord: string;
  morphologicalGloss?: string;
};

export type LexiconIndexEntry = {
  lemma: string;
  pos?: string;
  definition?: string;
  wiktionaryUrl?: string;
  occurrencesCount: number;
  occurrences: Occurrence[];
};

export type SurfaceMap = Record<string, string[]>;
export type LexiconIndex = Record<string, LexiconIndexEntry>;

export type VocabularyIndex = {
  totalTokens: number;
  uniqueLemmas: number;
  uniqueSurfaceForms: number;
  hapaxLegomena: string[];
  lemmaFrequency: Record<string, number>;
  posDistribution: Record<string, number>;
};

function normalizeOrthography(form: string): string {
  if (!form) return "";
  return form
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,;:!?"'“”‘’()\[\]]+$/g, "")
    .replace(/^-+|-+$/g, "")
    .trim();
}

/**
 * Loads pre-computed surface form map (content/_generated/surface-map.json).
 */
export function getSurfaceMap(): SurfaceMap {
  return (surfaceMapData as SurfaceMap) || {};
}

/**
 * Loads pre-computed lexicon index (content/_generated/lexicon-index.json).
 */
export function getLexiconIndex(): LexiconIndex {
  return (lexiconIndexData as LexiconIndex) || {};
}

/**
 * Loads pre-computed vocabulary metrics index (content/_generated/vocabulary-index.json).
 */
export function getVocabularyIndex(): VocabularyIndex {
  return (vocabularyIndexData as VocabularyIndex) || {
    totalTokens: 0,
    uniqueLemmas: 0,
    uniqueSurfaceForms: 0,
    hapaxLegomena: [],
    lemmaFrequency: {},
    posDistribution: {},
  };
}

/**
 * O(1) lookup for candidate lemma IDs corresponding to a normalized surface form.
 */
export function lookupSurfaceForm(surface: string): string[] {
  if (!surface) return [];
  const map = getSurfaceMap();
  const key = normalizeOrthography(surface);
  const directMatch = map[key];
  if (directMatch && directMatch.length > 0) {
    return directMatch;
  }
  const unhyphenated = key.replace(/-/g, "");
  if (unhyphenated && unhyphenated !== key && map[unhyphenated]) {
    return map[unhyphenated];
  }
  return [];
}
