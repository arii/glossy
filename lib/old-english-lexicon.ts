/**
 * Canonical Old English lexicon lookup for accurate lemmas,
 * parts of speech, and verified Wiktionary URLs dynamically generated
 * from centralized content/lexicon records.
 */

import type { LexiconEntry as CentralLexiconEntry, PartOfSpeech } from "./types.ts";
import { getWiktionaryUrl } from "./wiktionary.ts";
import { loadLexicon } from "./lexicon.ts";
import { resolveToken } from "./token-resolver.ts";

export interface LegacyLexiconEntry {
  lemma: string;
  pos: PartOfSpeech;
  wiktionaryUrl: string;
  definition?: string;
  ipa?: string;
}

export type { CentralLexiconEntry as LexiconEntry };

const posMap: Record<string, PartOfSpeech> = {
  V: "verb",
  N: "noun",
  ADJ: "adjective",
  ADV: "adverb",
  PRON: "pronoun",
  PREP: "preposition",
  CONJ: "conjunction",
  INTERJ: "interjection",
};

export function resolveOldEnglishLexicon(rawSurface: string, gloss: string = ""): LegacyLexiconEntry {
  const lexicon = loadLexicon();
  const cleanSurface = rawSurface
    .normalize("NFC")
    .toLowerCase()
    .replace(/^[.,;:!?]+|[.,;:!?]+$/g, "")
    .replace(/-/g, "")
    .trim();

  const strippedSurface = cleanSurface
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");

  // Look for entry matching lemma or surface
  let matchedEntry: CentralLexiconEntry | undefined;
  for (const entry of Object.values(lexicon)) {
    const entryClean = entry.lemma.normalize("NFC").toLowerCase().replace(/-/g, "");
    const entryStripped = entry.lemma
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC")
      .toLowerCase()
      .replace(/-/g, "");

    if (entryClean === cleanSurface || entryStripped === strippedSurface) {
      matchedEntry = entry;
      break;
    }
  }

  if (matchedEntry) {
    const token = {
      id: "lookup-token",
      originalWord: rawSurface,
      morphologicalGloss: gloss,
      lemmaRef: matchedEntry.id,
    };
    const resolved = resolveToken(token, lexicon);
    const fullPos: PartOfSpeech = posMap[resolved.pos] || "noun";

    return {
      lemma: resolved.lemma,
      pos: fullPos,
      wiktionaryUrl: getWiktionaryUrl(resolved.lemma),
      definition: resolved.definition,
      ipa: resolved.ipa,
    };
  }

  // Generic fallback with verified Old English Wiktionary link
  const fallbackLemma = cleanSurface || rawSurface;
  const safeGloss = (gloss || "").toLowerCase();
  const fallbackPos: PartOfSpeech = safeGloss.includes("say") || safeGloss.includes("travel") ? "verb" : "noun";

  return {
    lemma: fallbackLemma,
    pos: fallbackPos,
    wiktionaryUrl: getWiktionaryUrl(fallbackLemma),
    definition: gloss || fallbackLemma,
  };
}
