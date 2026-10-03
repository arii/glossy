import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseGb4e } from "../lib/gb4e.ts";

const contentDirectory = "content/texts";
const contentFiles = readdirSync(contentDirectory).filter((fileName) =>
  fileName.endsWith(".json"),
);
const textIds = new Set();
const slugs = new Set();

let checkedDocuments = 0;
let checkedRecords = 0;

for (const fileName of contentFiles) {
  const contentPath = join(contentDirectory, fileName);
  const document = JSON.parse(readFileSync(contentPath, "utf8"));
  const context = `Text document "${contentPath}"`;

  for (const field of ["textId", "slug", "title", "sourceFile"]) {
    requireString(document[field], `${context} is missing ${field}`);
  }
  assertUnique(textIds, document.textId, `text ID "${document.textId}"`);
  assertUnique(slugs, document.slug, `text slug "${document.slug}"`);

  const legacyGlossRecords = Array.isArray(document.glossRecords) ? document.glossRecords : [];
  const sentenceWords = Array.isArray(document.sentences)
    ? document.sentences.flatMap((sentence) =>
        (Array.isArray(sentence.words) ? sentence.words : []).map((word) => ({
          id: word.id,
          surface: `${word.originalWord ?? ""}${word.trailingPunctuation ?? ""}`,
          sourceGloss: word.morphologicalGloss ?? word.originalWord,
          sourceGlossTex: word.sourceGlossTex ?? word.morphologicalGloss ?? word.originalWord,
          review: word.review,
        })),
      )
    : [];
  const glossRecords = legacyGlossRecords.length > 0 ? legacyGlossRecords : sentenceWords;

  if (legacyGlossRecords.length === 0 && sentenceWords.length === 0) {
    throw new Error(`${context} must have blocks/glossRecords or sentence words.`);
  }

  const glossesById = new Map();
  const glossIds = new Set();
  for (const record of glossRecords) {
    requireString(record.id, `A gloss record in ${contentPath} has no ID`);
    requireString(record.surface ?? record.originalWord, `Gloss "${record.id}" has no source surface`);
    requireString(record.sourceGlossTex ?? record.morphologicalGloss ?? record.originalWord, `Gloss "${record.id}" has no literal source gloss`);
    assertUnique(glossIds, record.id, `gloss ID "${record.id}" in ${contentPath}`);
    glossesById.set(record.id, record);

    if (record.review?.source?.file && record.review.source.file !== document.sourceFile) {
      throw new Error(
        `Gloss "${record.id}" source file does not match text "${document.slug}" sourceFile.`,
      );
    }
  }

  const blocks = Array.isArray(document.blocks) ? document.blocks : [];
  const blockIds = new Set();
  for (const block of blocks) {
    requireString(block.id, `A reading block in ${contentPath} has no ID`);
    assertUnique(blockIds, block.id, `block ID "${block.id}" in ${contentPath}`);
    if (!Array.isArray(block.segments)) {
      throw new Error(`Block "${block.id}" in ${contentPath} must have a segments array.`);
    }

    for (const segment of block.segments) {
      if (segment.type === "text") {
        continue;
      }
      if (segment.type !== "gloss") {
        throw new Error(`Block "${block.id}" in ${contentPath} has an invalid segment type.`);
      }
      const record = glossesById.get(segment.glossId);
      if (!record) {
        throw new Error(
          `Block "${block.id}" in ${contentPath} references missing gloss "${segment.glossId}".`,
        );
      }
      if (normalizeSurface(segment.value) !== normalizeSurface(record.surface ?? record.originalWord)) {
        throw new Error(
          `Block "${block.id}" surface "${segment.value}" does not match gloss "${record.id}" surface "${record.surface ?? record.originalWord}" beyond capitalization or Unicode normalization.`,
        );
      }
    }
  }

  if (!existsSync(document.sourceFile)) {
    if (glossRecords.some((record) => record.review?.status === "source-checked")) {
      throw new Error(
        `Text "${document.slug}" marks glosses source-checked but source file is missing: ${document.sourceFile}`,
      );
    }
    console.warn(`No source file found for ${document.slug}; source alignment was not checked.`);
    continue;
  }

  const source = readFileSync(document.sourceFile, "utf8");
  const alignedPairs = readAlignedGlossPairs(source, document.sourceFile);
  for (const record of glossRecords) {
    const surface = record.surface ?? record.originalWord;
    const literalGloss = record.sourceGlossTex ?? record.morphologicalGloss ?? record.originalWord;
    const matchingPair = alignedPairs.some(
      (pair) =>
        normalizeSurface(pair.surface) === normalizeSurface(surface) &&
        pair.gloss === literalGloss,
    );
    if (!matchingPair) {
      throw new Error(
        `Source form "${surface}" and TeX gloss "${literalGloss}" are not aligned in the same ${document.sourceFile} gloss entry.`,
      );
    }
    checkedRecords += 1;
  }
  checkedDocuments += 1;
}

console.log(
  `Validated ${checkedRecords} aligned source glosses across ${checkedDocuments} source-backed text documents.`,
);

// Comprehensive Master LaTeX Validation
const masterTexPath = "references/Voyages_of_Ohthere_Wulfstan.tex";
if (existsSync(masterTexPath)) {
  const masterTexContent = readFileSync(masterTexPath, "utf8");
  const parsedTex = parseGb4e(masterTexContent);

  if (parsedTex.warnings.length > 0) {
    console.warn(`Master LaTeX warnings (${parsedTex.warnings.length}):`, parsedTex.warnings);
  }

  let totalTokensInTex = 0;
  for (const sentence of parsedTex.sentences) {
    if (!sentence.translation || sentence.translation.trim() === "") {
      throw new Error(`Master TeX sentence "${sentence.id}" has an empty translation.`);
    }
    if (!sentence.words || sentence.words.length === 0) {
      throw new Error(`Master TeX sentence "${sentence.id}" has no words.`);
    }
    for (const word of sentence.words) {
      requireString(word.originalWord, `Master TeX sentence "${sentence.id}" has empty originalWord.`);
      totalTokensInTex += 1;
    }
  }

  console.log(
    `Validated master LaTeX document "${masterTexPath}": ${parsedTex.sentences.length} sentences, ${totalTokensInTex} tokens, ${parsedTex.warnings.length} warnings.`,
  );
}

function readAlignedGlossPairs(source) {
  const parsed = parseGb4e(source);
  const pairs = [];
  for (const sentence of parsed.sentences) {
    for (const word of sentence.words) {
      pairs.push({
        surface: `${word.originalWord}${word.trailingPunctuation ?? ""}`,
        gloss: word.sourceGlossTex ?? word.morphologicalGloss ?? word.originalWord,
      });
    }
  }
  return pairs;
}

function normalizeSurface(surface) {
  return surface
    .replace(/^[,.;:!?]+|[,.;:!?]+$/gu, "")
    .normalize("NFC")
    .toLocaleLowerCase("und");
}

function assertUnique(values, value, description) {
  if (values.has(value)) {
    throw new Error(`Duplicate ${description}.`);
  }
  values.add(value);
}

function requireString(value, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }
}
