import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  getVocabularyIndex,
  lookupSurfaceForm,
} from "../lib/indexes.ts";

function isSorted(arr: string[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
}

function runTests() {
  console.log("🧪 Running tests/build-index.test.ts...");

  const generatedDir = join(process.cwd(), "content", "_generated");
  const surfaceMapPath = join(generatedDir, "surface-map.json");
  const lexiconIndexPath = join(generatedDir, "lexicon-index.json");
  const vocabularyIndexPath = join(generatedDir, "vocabulary-index.json");

  // 1. Verify files exist
  if (!existsSync(surfaceMapPath) || !existsSync(lexiconIndexPath) || !existsSync(vocabularyIndexPath)) {
    throw new Error("Missing generated index files in content/_generated/. Run npm run build:indexes first.");
  }

  // 2. Test deterministic key sorting
  const rawSurfaceMap = JSON.parse(readFileSync(surfaceMapPath, "utf8"));
  const surfaceKeys = Object.keys(rawSurfaceMap);
  if (!isSorted(surfaceKeys)) {
    throw new Error("surface-map.json keys are not sorted deterministically!");
  }

  const rawLexiconIndex = JSON.parse(readFileSync(lexiconIndexPath, "utf8"));
  const lexiconKeys = Object.keys(rawLexiconIndex);
  if (!isSorted(lexiconKeys)) {
    throw new Error("lexicon-index.json keys are not sorted deterministically!");
  }

  const vocabIndex = getVocabularyIndex();
  if (!isSorted(vocabIndex.hapaxLegomena)) {
    throw new Error("vocabulary-index.json hapaxLegomena array is not sorted!");
  }
  if (!isSorted(Object.keys(vocabIndex.lemmaFrequency))) {
    throw new Error("vocabulary-index.json lemmaFrequency keys are not sorted!");
  }
  if (!isSorted(Object.keys(vocabIndex.posDistribution))) {
    throw new Error("vocabulary-index.json posDistribution keys are not sorted!");
  }

  // 3. Test surface form resolution for inflected verbs
  const testCases: [string, string][] = [
    ["sæde", "secgan"],
    ["cwæð", "cweþan"],
    ["sōhte", "sēcan"],
    ["wæs", "wesan"],
  ];

  for (const [surface, expectedLemma] of testCases) {
    const candidates = lookupSurfaceForm(surface);
    if (!candidates.includes(expectedLemma)) {
      throw new Error(
        `Surface form '${surface}' did not resolve to expected lemma '${expectedLemma}'. Got: [${candidates.join(", ")}]`
      );
    }
  }

  // 4. Test vocabulary index metrics
  if (vocabIndex.totalTokens <= 0) {
    throw new Error(`Expected totalTokens > 0, got ${vocabIndex.totalTokens}`);
  }
  if (vocabIndex.uniqueLemmas <= 0) {
    throw new Error(`Expected uniqueLemmas > 0, got ${vocabIndex.uniqueLemmas}`);
  }
  if (vocabIndex.uniqueSurfaceForms <= 0) {
    throw new Error(`Expected uniqueSurfaceForms > 0, got ${vocabIndex.uniqueSurfaceForms}`);
  }

  // Verify hapax legomena
  for (const hapaxLemma of vocabIndex.hapaxLegomena) {
    const freq = vocabIndex.lemmaFrequency[hapaxLemma];
    if (freq !== 1) {
      throw new Error(`Hapax legomenon '${hapaxLemma}' has frequency ${freq} (expected 1).`);
    }
  }

  console.log("✅ All pre-computed index tests passed successfully!");
}

try {
  runTests();
} catch (err) {
  console.error("🚨 Test failure in tests/build-index.test.ts:", err);
  process.exit(1);
}
