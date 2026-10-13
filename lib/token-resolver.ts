import type { WordToken, LexiconMap, ResolvedWordToken, LexiconEntry } from "./types";
import { getWiktionaryUrl } from "./wiktionary";

export function resolveToken(token: WordToken, lexicon: LexiconMap): ResolvedWordToken {
  let entry: LexiconEntry | undefined;

  if (token.lemmaRef && lexicon[token.lemmaRef]) {
    entry = lexicon[token.lemmaRef];
    let depth = 0;
    while (entry?.redirectTo && lexicon[entry.redirectTo] && depth < 5) {
      entry = lexicon[entry.redirectTo];
      depth++;
    }
  }

  const cleanOriginal = (token.originalWord || "")
    .replace(/^[.,;:!?]+|[.,;:!?]+$/g, "")
    .normalize("NFC");

  const lemma = entry?.lemma || cleanOriginal;
  const pos = token.contextualOverride?.pos || entry?.pos || "N";
  const wiktionaryUrl = getWiktionaryUrl(lemma);

  let definition = "";
  let grammaticalNote: string | undefined;

  if (token.contextualOverride?.definition) {
    definition = token.contextualOverride.definition;
  } else if (entry && entry.senses) {
    const senseId = token.selectedSenseId || entry.defaultSenseId;
    const sense = entry.senses[senseId] || entry.senses[entry.defaultSenseId];
    if (sense) {
      definition = sense.definition;
      grammaticalNote = sense.grammaticalNote;
    }
  }

  if (!definition) {
    definition = token.morphologicalGloss || cleanOriginal;
  }

  const notes = token.contextualOverride?.notes || grammaticalNote;

  return {
    ...token,
    lemma,
    pos,
    definition,
    wiktionaryUrl,
    ipa: entry?.ipa,
    notes,
  };
}
