import type { TextDocument, ReadingSentence, InterlinearWord } from "./types";

export interface DocumentDiff {
  hasChanges: boolean;
  summary: {
    metadataChanged: boolean;
    sentencesAdded: number;
    sentencesRemoved: number;
    translationsModified: number;
    tokensModified: number;
  };
  sentenceDiffs: Array<{
    sentenceId: string;
    type: "added" | "removed" | "modified" | "unchanged";
    translationDelta?: { before: string; after: string };
    tokenDeltas: Array<{
      tokenId: string;
      surface: string;
      field: "morphologicalGloss" | "lemmaRef" | "override";
      before: string;
      after: string;
    }>;
  }>;
}

function formatOverride(override?: { definition?: string; pos?: string; notes?: string }): string {
  if (!override) return "(none)";
  const parts: string[] = [];
  if (override.definition != null && override.definition !== "") {
    parts.push(`def: "${override.definition}"`);
  }
  if (override.pos != null && override.pos !== "") {
    parts.push(`pos: ${override.pos}`);
  }
  if (override.notes != null && override.notes !== "") {
    parts.push(`notes: "${override.notes}"`);
  }
  return parts.length > 0 ? parts.join(", ") : "(none)";
}

function getSentenceWords(sent: ReadingSentence): InterlinearWord[] {
  if (Array.isArray(sent.words)) return sent.words;
  const rawSent = sent as unknown as { tokens?: InterlinearWord[] };
  if (Array.isArray(rawSent.tokens)) return rawSent.tokens;
  return [];
}

export function diffDocuments(baseDoc: TextDocument, draftDoc: TextDocument): DocumentDiff {
  let metadataChanged = false;

  const baseTitle = (baseDoc.title || "").trim();
  const draftTitle = (draftDoc.title || "").trim();
  if (baseTitle !== draftTitle) metadataChanged = true;

  const baseAuthor = (baseDoc.author || baseDoc.glossedBy || baseDoc.editor || "").trim();
  const draftAuthor = (draftDoc.author || draftDoc.glossedBy || draftDoc.editor || "").trim();
  if (baseAuthor !== draftAuthor) metadataChanged = true;

  const baseDate = (baseDoc.date || "").trim();
  const draftDate = (draftDoc.date || "").trim();
  if (baseDate !== draftDate) metadataChanged = true;

  const baseSource = (baseDoc.source || "").trim();
  const draftSource = (draftDoc.source || "").trim();
  if (baseSource !== draftSource) metadataChanged = true;

  const baseEdition = (baseDoc.sourceEdition || "").trim();
  const draftEdition = (draftDoc.sourceEdition || "").trim();
  if (baseEdition !== draftEdition) metadataChanged = true;

  const baseSentences = baseDoc.sentences || [];
  const draftSentences = draftDoc.sentences || [];

  let sentencesAdded = 0;
  let sentencesRemoved = 0;
  let translationsModified = 0;
  let tokensModified = 0;

  const sentenceDiffs: DocumentDiff["sentenceDiffs"] = [];

  const maxSentences = Math.max(baseSentences.length, draftSentences.length);

  for (let i = 0; i < maxSentences; i++) {
    const baseSent = baseSentences[i];
    const draftSent = draftSentences[i];

    if (!baseSent && draftSent) {
      sentencesAdded++;
      sentenceDiffs.push({
        sentenceId: draftSent.id || `sent-${i + 1}`,
        type: "added",
        translationDelta: draftSent.translation
          ? { before: "", after: draftSent.translation }
          : undefined,
        tokenDeltas: [],
      });
      continue;
    }

    if (baseSent && !draftSent) {
      sentencesRemoved++;
      sentenceDiffs.push({
        sentenceId: baseSent.id || `sent-${i + 1}`,
        type: "removed",
        translationDelta: baseSent.translation
          ? { before: baseSent.translation, after: "" }
          : undefined,
        tokenDeltas: [],
      });
      continue;
    }

    if (baseSent && draftSent) {
      const sentenceId = draftSent.id || baseSent.id || `sent-${i + 1}`;
      let translationDelta: { before: string; after: string } | undefined;

      const baseTrans = (baseSent.translation || "").trim();
      const draftTrans = (draftSent.translation || "").trim();

      if (baseTrans !== draftTrans) {
        translationDelta = { before: baseTrans, after: draftTrans };
        translationsModified++;
      }

      const baseWords = getSentenceWords(baseSent);
      const draftWords = getSentenceWords(draftSent);

      const maxWords = Math.max(baseWords.length, draftWords.length);
      const tokenDeltas: DocumentDiff["sentenceDiffs"][number]["tokenDeltas"] = [];

      for (let w = 0; w < maxWords; w++) {
        const baseWord = baseWords[w];
        const draftWord = draftWords[w];
        if (!baseWord && !draftWord) continue;

        const surface = draftWord?.originalWord || baseWord?.originalWord || `word-${w + 1}`;
        const tokenId = draftWord?.id || baseWord?.id || `${sentenceId}-token-${w + 1}`;
        let tokenHasDelta = false;

        // 1. Morphological Gloss
        const baseGloss = (baseWord?.morphologicalGloss || "").trim();
        const draftGloss = (draftWord?.morphologicalGloss || "").trim();
        if (baseGloss !== draftGloss) {
          tokenDeltas.push({
            tokenId,
            surface,
            field: "morphologicalGloss",
            before: baseGloss,
            after: draftGloss,
          });
          tokenHasDelta = true;
        }

        // 2. Lemma Reference
        const baseLemma = (baseWord?.lemmaRef || baseWord?.analysis?.lemma || "").trim();
        const draftLemma = (draftWord?.lemmaRef || draftWord?.analysis?.lemma || "").trim();
        if (baseLemma !== draftLemma) {
          tokenDeltas.push({
            tokenId,
            surface,
            field: "lemmaRef",
            before: baseLemma,
            after: draftLemma,
          });
          tokenHasDelta = true;
        }

        // 3. Contextual Override
        const baseOv = formatOverride(baseWord?.contextualOverride);
        const draftOv = formatOverride(draftWord?.contextualOverride);
        if (baseOv !== draftOv) {
          tokenDeltas.push({
            tokenId,
            surface,
            field: "override",
            before: baseOv,
            after: draftOv,
          });
          tokenHasDelta = true;
        }

        if (tokenHasDelta) {
          tokensModified++;
        }
      }

      const isModified = Boolean(translationDelta || tokenDeltas.length > 0);

      sentenceDiffs.push({
        sentenceId,
        type: isModified ? "modified" : "unchanged",
        translationDelta,
        tokenDeltas,
      });
    }
  }

  const hasChanges =
    metadataChanged ||
    sentencesAdded > 0 ||
    sentencesRemoved > 0 ||
    translationsModified > 0 ||
    tokensModified > 0;

  return {
    hasChanges,
    summary: {
      metadataChanged,
      sentencesAdded,
      sentencesRemoved,
      translationsModified,
      tokensModified,
    },
    sentenceDiffs,
  };
}
