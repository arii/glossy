import type { GlossRecord, Passage, TextDocument } from "./types";

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
      segments: sentence.words.map((word) => ({
        type: "gloss",
        value: `${word.originalWord}${word.trailingPunctuation ?? ""}`,
        glossId: word.id,
      })),
    })),
  };
}
