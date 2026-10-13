import assert from "node:assert/strict";
import { diffDocuments } from "../lib/document-diff";
import type { TextDocument } from "../lib/types";

console.log("Running document-diff unit tests...");

const sampleDoc: TextDocument = {
  textId: "test-text",
  slug: "test-text",
  title: "Test Voyage",
  language: "Old English",
  author: "Anonymous",
  date: "9th century",
  source: "Anonymous · 9th century",
  sourceFile: "content/texts/test-text.json",
  status: "draft",
  blocks: [],
  sentences: [
    {
      id: "sent-1",
      translation: "Ohthere said that he lived furthest north.",
      words: [
        {
          id: "sent-1-token-1",
          originalWord: "Ōhthere",
          morphologicalGloss: "Ohthere",
          analysis: {
            lemma: "Ōhthere",
            partOfSpeech: "noun",
            features: { case: "nominative" },
            morphemes: [],
            definition: "Ohthere (proper name)",
          },
        },
        {
          id: "sent-1-token-2",
          originalWord: "sæde",
          morphologicalGloss: "said",
          analysis: {
            lemma: "secgan",
            partOfSpeech: "verb",
            features: { person: 3, tense: "past" },
            morphemes: [],
            definition: "to say",
          },
        },
      ],
    },
    {
      id: "sent-2",
      translation: "He said that he wished to investigate.",
      words: [
        {
          id: "sent-2-token-1",
          originalWord: "He",
          morphologicalGloss: "he",
          analysis: {
            lemma: "hē",
            partOfSpeech: "pronoun",
            features: { case: "nominative" },
            morphemes: [],
            definition: "he",
          },
        },
      ],
    },
  ],
};

// Test 1: Identical documents should yield hasChanges = false
{
  const diff = diffDocuments(sampleDoc, sampleDoc);
  assert.equal(diff.hasChanges, false, "Identical documents should have no changes");
  assert.equal(diff.summary.tokensModified, 0);
  assert.equal(diff.summary.translationsModified, 0);
  assert.equal(diff.summary.metadataChanged, false);
}

// Test 2: Modifying a single token's morphologicalGloss registers tokensModified: 1 and isolates sentence ID
{
  const draftDoc: TextDocument = {
    ...sampleDoc,
    sentences: sampleDoc.sentences?.map((s) => {
      if (s.id === "sent-2") {
        return {
          ...s,
          words: s.words.map((w) => {
            if (w.id === "sent-2-token-1") {
              return { ...w, morphologicalGloss: "he-PRON" };
            }
            return w;
          }),
        };
      }
      return s;
    }),
  };

  const diff = diffDocuments(sampleDoc, draftDoc);
  assert.equal(diff.hasChanges, true, "Modifying gloss should trigger hasChanges");
  assert.equal(diff.summary.tokensModified, 1, "Should register exactly 1 modified token");
  assert.equal(diff.summary.translationsModified, 0, "No translation modified");

  const sent2Diff = diff.sentenceDiffs.find((d) => d.sentenceId === "sent-2");
  assert.ok(sent2Diff, "Should find diff for sent-2");
  assert.equal(sent2Diff.type, "modified");
  assert.equal(sent2Diff.tokenDeltas.length, 1);
  assert.equal(sent2Diff.tokenDeltas[0].tokenId, "sent-2-token-1");
  assert.equal(sent2Diff.tokenDeltas[0].field, "morphologicalGloss");
  assert.equal(sent2Diff.tokenDeltas[0].before, "he");
  assert.equal(sent2Diff.tokenDeltas[0].after, "he-PRON");

  const sent1Diff = diff.sentenceDiffs.find((d) => d.sentenceId === "sent-1");
  assert.ok(sent1Diff, "Should find sent-1");
  assert.equal(sent1Diff.type, "unchanged", "sent-1 should remain unchanged");
}

// Test 3: Modifying translation registers translationsModified: 1
{
  const draftDoc: TextDocument = {
    ...sampleDoc,
    sentences: sampleDoc.sentences?.map((s) => {
      if (s.id === "sent-1") {
        return { ...s, translation: "Ohthere declared that he lived furthest north." };
      }
      return s;
    }),
  };

  const diff = diffDocuments(sampleDoc, draftDoc);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.summary.translationsModified, 1);
  assert.equal(diff.summary.tokensModified, 0);

  const sent1Diff = diff.sentenceDiffs.find((d) => d.sentenceId === "sent-1");
  assert.ok(sent1Diff);
  assert.equal(sent1Diff.type, "modified");
  assert.deepEqual(sent1Diff.translationDelta, {
    before: "Ohthere said that he lived furthest north.",
    after: "Ohthere declared that he lived furthest north.",
  });
}

// Test 4: Adding contextual override registers tokensModified: 1 and field: "override"
{
  const draftDoc: TextDocument = {
    ...sampleDoc,
    sentences: sampleDoc.sentences?.map((s) => {
      if (s.id === "sent-1") {
        return {
          ...s,
          words: s.words.map((w) => {
            if (w.id === "sent-1-token-2") {
              return {
                ...w,
                contextualOverride: {
                  definition: "said / narrated in manuscript",
                  pos: "verb",
                },
              };
            }
            return w;
          }),
        };
      }
      return s;
    }),
  };

  const diff = diffDocuments(sampleDoc, draftDoc);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.summary.tokensModified, 1);

  const sent1Diff = diff.sentenceDiffs.find((d) => d.sentenceId === "sent-1");
  assert.ok(sent1Diff);
  assert.equal(sent1Diff.type, "modified");
  assert.equal(sent1Diff.tokenDeltas.length, 1);
  assert.equal(sent1Diff.tokenDeltas[0].field, "override");
  assert.equal(sent1Diff.tokenDeltas[0].before, "(none)");
  assert.ok(sent1Diff.tokenDeltas[0].after.includes("said / narrated in manuscript"));
}

// Test 5: Metadata modification registers metadataChanged: true
{
  const draftDoc: TextDocument = {
    ...sampleDoc,
    title: "The Voyages of Ohthere",
  };

  const diff = diffDocuments(sampleDoc, draftDoc);
  assert.equal(diff.hasChanges, true);
  assert.equal(diff.summary.metadataChanged, true);
}

console.log("✓ All document-diff unit tests passed successfully!");
