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

  if (!Array.isArray(document.sentences) || document.sentences.length === 0) {
    throw new Error(`${context} must contain a non-empty sentences array.`);
  }

  const glossRecords = document.sentences.flatMap((sentence, sIdx) => {
    requireString(sentence.id, `${context} sentence ${sIdx} is missing an ID`);
    if (!Array.isArray(sentence.words)) {
      throw new Error(`${context} sentence "${sentence.id}" must have a words array.`);
    }
    return sentence.words.map((word) => ({
      id: word.id,
      surface: `${word.originalWord ?? ""}${word.trailingPunctuation ?? ""}`,
      sourceGloss: word.morphologicalGloss ?? word.originalWord,
      sourceGlossTex: word.sourceGlossTex ?? word.morphologicalGloss ?? word.originalWord,
      review: word.review,
    }));
  });

  const glossesById = new Map();
  const glossIds = new Set();
  for (const record of glossRecords) {
    requireString(record.id, `A word record in ${contentPath} has no ID`);
    requireString(record.surface, `Word "${record.id}" has no source surface`);
    requireString(record.sourceGlossTex, `Word "${record.id}" has no literal source gloss`);
    assertUnique(glossIds, record.id, `word ID "${record.id}" in ${contentPath}`);
    glossesById.set(record.id, record);

    if (record.review?.source?.file && record.review.source.file !== document.sourceFile) {
      throw new Error(
        `Word "${record.id}" source file does not match text "${document.slug}" sourceFile.`,
      );
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
