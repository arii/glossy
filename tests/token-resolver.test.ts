import test from "node:test";
import assert from "node:assert";
import { resolveToken } from "../lib/token-resolver";
import type { LexiconMap, WordToken } from "../lib/types";

const mockLexicon: LexiconMap = {
  "secgan-v-1": {
    id: "secgan-v-1",
    lemma: "secgan",
    pos: "V",
    ipa: "/ˈsed.dʒɑn/",
    senses: {
      "sense-1": {
        id: "sense-1",
        definition: "to say, speak",
        grammaticalNote: "Weak verb class 3",
      },
      "sense-2": {
        id: "sense-2",
        definition: "to declare, recount",
      },
    },
    defaultSenseId: "sense-1",
  },
  "cyning-n-1": {
    id: "cyning-n-1",
    lemma: "cyning",
    pos: "N",
    senses: {
      "sense-1": {
        id: "sense-1",
        definition: "king, ruler",
      },
    },
    defaultSenseId: "sense-1",
  },
  "alias-v-1": {
    id: "alias-v-1",
    lemma: "secgan-alias",
    pos: "V",
    senses: {},
    defaultSenseId: "sense-1",
    redirectTo: "secgan-v-1",
  },
};

test("resolveToken falls back to defaultSenseId when no selectedSenseId or contextualOverride is present", () => {
  const token: WordToken = {
    id: "token-1",
    originalWord: "sǣde",
    morphologicalGloss: "say.PST.3SG",
    lemmaRef: "secgan-v-1",
  };

  const resolved = resolveToken(token, mockLexicon);
  assert.strictEqual(resolved.lemma, "secgan");
  assert.strictEqual(resolved.pos, "V");
  assert.strictEqual(resolved.definition, "to say, speak");
  assert.strictEqual(resolved.wiktionaryUrl, "https://en.wiktionary.org/wiki/secgan#Old_English");
  assert.strictEqual(resolved.notes, "Weak verb class 3");
  assert.strictEqual(resolved.ipa, "/ˈsed.dʒɑn/");
});

test("resolveToken uses selectedSenseId when provided", () => {
  const token: WordToken = {
    id: "token-2",
    originalWord: "sǣdon",
    morphologicalGloss: "say.PST.PL",
    lemmaRef: "secgan-v-1",
    selectedSenseId: "sense-2",
  };

  const resolved = resolveToken(token, mockLexicon);
  assert.strictEqual(resolved.lemma, "secgan");
  assert.strictEqual(resolved.definition, "to declare, recount");
});

test("resolveToken applies contextualOverride definitions and pos", () => {
  const token: WordToken = {
    id: "token-3",
    originalWord: "cyninge",
    morphologicalGloss: "king-DAT.SG",
    lemmaRef: "cyning-n-1",
    contextualOverride: {
      definition: "sovereign monarch",
      pos: "N",
      notes: "Contextual poetic usage",
    },
  };

  const resolved = resolveToken(token, mockLexicon);
  assert.strictEqual(resolved.lemma, "cyning");
  assert.strictEqual(resolved.definition, "sovereign monarch");
  assert.strictEqual(resolved.notes, "Contextual poetic usage");
});

test("resolveToken follows redirectTo entry chains", () => {
  const token: WordToken = {
    id: "token-4",
    originalWord: "secgan",
    morphologicalGloss: "say.INF",
    lemmaRef: "alias-v-1",
  };

  const resolved = resolveToken(token, mockLexicon);
  assert.strictEqual(resolved.lemma, "secgan");
  assert.strictEqual(resolved.definition, "to say, speak");
});

test("resolveToken handles missing or unresolvable lemmaRef gracefully", () => {
  const token: WordToken = {
    id: "token-5",
    originalWord: "unknownword",
    morphologicalGloss: "unknown.GLOSS",
    lemmaRef: null,
  };

  const resolved = resolveToken(token, mockLexicon);
  assert.strictEqual(resolved.lemma, "unknownword");
  assert.strictEqual(resolved.pos, "N");
  assert.strictEqual(resolved.definition, "unknown.GLOSS");
  assert.strictEqual(resolved.wiktionaryUrl, "https://en.wiktionary.org/wiki/unknownword#Old_English");
});
