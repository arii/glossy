import fs from "node:fs";
import path from "node:path";
import type {
  TextDocument,
  HomePageContent,
  IngestPageContent,
  AboutPageContent,
  PrivacyPageContent,
  AttributionPageContent,
  DocsPageContent,
} from "./types";

export { getGlossRecords, getReadingPassage } from "./passage-utils";

const contentDirectory = path.join(process.cwd(), "content", "texts");

export function loadHomePageContent(): HomePageContent {
  const filePath = path.join(process.cwd(), "content", "pages", "home.json");
  const defaults: HomePageContent = {
    pageId: "home",
    title: "Glossy · Interlinear Texts",
    eyebrow: "Interlinear Texts",
    heading: "Read a text or work on its glosses.",
    description:
      "Read, edit, and publish morphologically tagged historical texts with standardized Leipzig three-tier alignment, canonical dictionary headwords, and compilable LaTeX gb4e export.",
    primaryAction: {
      label: "+ Gloss a New Text",
      href: "/edit/new",
    },
    secondaryAction: {
      label: "Explore Corpus ↓",
      href: "#corpus-directory",
    },
  };

  if (!fs.existsSync(filePath)) return defaults;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as HomePageContent;
    return { ...defaults, ...parsed };
  } catch (err) {
    console.error("Failed reading content/pages/home.json", err);
    return defaults;
  }
}

export function loadIngestPageContent(): IngestPageContent {
  const filePath = path.join(process.cwd(), "content", "pages", "ingest.json");
  const defaults: IngestPageContent = {
    pageId: "ingest",
    title: "Gloss a New Old English Text",
    eyebrow: "Glossy · Corpus Ingestion",
    heading: "Gloss a New Old English Text",
    description:
      "Paste raw Old English sentences, select a classic preset (such as Beowulf or Cædmon's Hymn), or paste LaTeX gb4e code. The ingestion engine will automatically tokenize, lemmatize, and initialize your interlinear glosses.",
  };

  if (!fs.existsSync(filePath)) return defaults;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as IngestPageContent;
    return { ...defaults, ...parsed };
  } catch (err) {
    console.error("Failed reading content/pages/ingest.json", err);
    return defaults;
  }
}

export function loadAboutPageContent(): AboutPageContent {
  const filePath = path.join(process.cwd(), "content", "pages", "about.json");
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as AboutPageContent;
  } catch (err) {
    console.error("Failed reading content/pages/about.json", err);
    return {};
  }
}

export function loadPrivacyPageContent(): PrivacyPageContent {
  const filePath = path.join(process.cwd(), "content", "pages", "privacy.json");
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as PrivacyPageContent;
  } catch (err) {
    console.error("Failed reading content/pages/privacy.json", err);
    return {};
  }
}

export function loadAttributionPageContent(): AttributionPageContent {
  const filePath = path.join(process.cwd(), "content", "pages", "attribution.json");
  if (!fs.existsSync(filePath)) return {};
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as AttributionPageContent;
  } catch (err) {
    console.error("Failed reading content/pages/attribution.json", err);
    return {};
  }
}

export function loadDocsPageContent(): DocsPageContent {
  const filePath = path.join(process.cwd(), "content", "docs", "architecture-faq.json");
  if (!fs.existsSync(filePath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as DocsPageContent;
  } catch (err) {
    console.error("Failed reading content/docs/architecture-faq.json", err);
    return {};
  }
}

export type LoadedTextDocument = TextDocument & { fileName: string };

export function loadTextDocuments(): LoadedTextDocument[] {
  const fileNames = fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".json"));

  const documents = fileNames.map((fileName) => {
    const filePath = path.join(contentDirectory, fileName);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    const normalized = normalizeDocumentShape(requireObject(parsed, `Text document "${fileName}"`), fileName);

    return { ...normalized, fileName: path.basename(fileName, ".json") } as LoadedTextDocument;
  });

  assertTextDocuments(documents);
  return documents.sort((left, right) => left.title.localeCompare(right.title));
}

export function assertTextDocuments(documents: unknown[]): asserts documents is TextDocument[] {
  const textIds = new Set<string>();
  const slugs = new Set<string>();

  for (const [documentIndex, value] of documents.entries()) {
    const context = `Text document at index ${documentIndex}`;
    const document = requireObject(value, context);

    const textId = requireString(document, "textId", context);
    const slug = requireString(document, "slug", context);
    const title = requireString(document, "title", context);
    const source = requireString(document, "source", context);
    const sourceFile = requireString(document, "sourceFile", context);

    if (textIds.has(textId)) throw new Error(`Duplicate text ID: ${textId}`);
    if (slugs.has(slug)) throw new Error(`Duplicate text slug: ${slug}`);
    textIds.add(textId);
    slugs.add(slug);

    if (title.trim() === "" || source.trim() === "" || sourceFile.trim() === "") {
      throw new Error(`${context} has empty required metadata values.`);
    }

    const status = String(document.status ?? "");
    if (!["draft", "review", "published"].includes(status)) {
      throw new Error(`${context} "${slug}" has an invalid status.`);
    }

    const sentences = document.sentences;
    if (Array.isArray(sentences)) {
      for (const [sentenceIndex, sentenceValue] of sentences.entries()) {
        const sentenceContext = `${context} sentence ${sentenceIndex}`;
        const sentence = requireObject(sentenceValue, sentenceContext);
        requireString(sentence, "id", sentenceContext);
        if (typeof sentence.translation !== "string" || sentence.translation.trim() === "") {
          sentence.translation = typeof sentence.translation === "string" && sentence.translation !== ""
            ? sentence.translation
            : "No translation provided.";
        }
        const words = requireArray(sentence.words, `${sentenceContext} words`);
        for (const [wordIndex, wordValue] of words.entries()) {
          const wordContext = `${sentenceContext} word ${wordIndex}`;
          const word = requireObject(wordValue, wordContext);
          requireString(word, "id", wordContext);
          requireString(word, "originalWord", wordContext);
        }
      }
      continue;
    }

    const glossRecords = requireArray(document.glossRecords, `${context} "${slug}" glossRecords`);
    const blocks = requireArray(document.blocks, `${context} "${slug}" blocks`);
    const glossSurfaceById = new Map<string, string>();

    for (const [recordIndex, recordValue] of glossRecords.entries()) {
      const recordContext = `Gloss record ${recordIndex} in "${slug}"`;
      const record = requireObject(recordValue, recordContext);
      const recordId = requireString(record, "id", recordContext);
      const surface = requireString(record, "surface", recordContext);
      requireString(record, "sourceGloss", recordContext);
      requireString(record, "sourceGlossTex", recordContext);
      if (glossSurfaceById.has(recordId)) {
        throw new Error(`Duplicate gloss ID "${recordId}" in "${slug}".`);
      }
      glossSurfaceById.set(recordId, surface);

      const analysis = requireObject(record.analysis, `${recordContext} analysis`);
      requireString(analysis, "lemma", recordContext);
      requireString(analysis, "partOfSpeech", recordContext);
      requireString(analysis, "definition", recordContext);
      requireObject(analysis.features, `${recordContext} features`);
      const morphemes = requireArray(analysis.morphemes, `${recordContext} morphemes`);
      if (morphemes.length === 0) {
        throw new Error(`${recordContext} must contain at least one morpheme.`);
      }
      for (const [morphemeIndex, morphemeValue] of morphemes.entries()) {
        const morpheme = requireObject(morphemeValue, `${recordContext} morpheme ${morphemeIndex}`);
        requireString(morpheme, "form", recordContext);
        requireString(morpheme, "gloss", recordContext);
      }

      const review = requireObject(record.review, `${recordContext} review`);
      if (!["source-checked", "needs-review"].includes(String(review.status))) {
        throw new Error(`${recordContext} has an invalid review status.`);
      }
      const reviewSource = requireObject(review.source, `${recordContext} review source`);
      requireString(reviewSource, "file", recordContext);
      requireString(reviewSource, "locator", recordContext);
    }

    const blockIds = new Set<string>();
    for (const [blockIndex, blockValue] of blocks.entries()) {
      const blockContext = `Reading block ${blockIndex} in "${slug}"`;
      const block = requireObject(blockValue, blockContext);
      const blockId = requireString(block, "id", blockContext);
      if (blockIds.has(blockId)) {
        throw new Error(`Duplicate block ID "${blockId}" in "${slug}".`);
      }
      blockIds.add(blockId);
      if (typeof block.translation !== "string" || block.translation.trim() === "") {
        block.translation = typeof block.translation === "string" && block.translation !== ""
          ? block.translation
          : "No translation provided.";
      }
      const segments = requireArray(block.segments, `${blockContext} segments`);
      for (const [segmentIndex, segmentValue] of segments.entries()) {
        const segmentContext = `${blockContext}, segment ${segmentIndex}`;
        const segment = requireObject(segmentValue, segmentContext);
        const segmentValueText = segment.value as string | undefined;
        if (typeof segmentValueText !== "string") {
          throw new Error(`${segmentContext} must have a string value.`);
        }
        if (segment.type === "text") continue;
        if (segment.type !== "gloss") {
          throw new Error(`${segmentContext} must have type "text" or "gloss".`);
        }

        const glossId = requireString(segment, "glossId", segmentContext);
        const glossSurface = glossSurfaceById.get(glossId);
        if (glossSurface === undefined) {
          throw new Error(`Text "${slug}" references missing gloss "${glossId}".`);
        }
        if (normalizeForm(segmentValueText) !== normalizeForm(glossSurface)) {
          throw new Error(
            `${segmentContext} surface "${segmentValueText}" does not match gloss "${glossId}" surface "${glossSurface}" beyond capitalization or Unicode normalization.`,
          );
        }
      }
    }
  }
}

function normalizeDocumentShape(document: Record<string, unknown>, fileName: string): Record<string, unknown> {
  delete document.texSource;
  delete document["tex-source"];

  if (Array.isArray(document.sentences)) {
    return document;
  }

  const legacyBlocks = Array.isArray(document.blocks) ? document.blocks : [];
  const legacyGlossRecords = Array.isArray(document.glossRecords) ? document.glossRecords : [];

  const sentences = (legacyBlocks as Array<Record<string, unknown>>).map((block, index) => ({
    id: String((block.id as string | undefined) ?? `sentence-${fileName}-${index}`),
    translation: String((block.translation as string | undefined) ?? ""),
    words: (Array.isArray(block.segments) ? block.segments : [])
      .filter((segment) => {
        const segmentObject = requireObject(segment, `Segment in ${fileName}`);
        return segmentObject.type === "gloss";
      })
      .map((segment, segmentIndex) => {
        const segmentObject = requireObject(segment, `Segment ${segmentIndex} in ${fileName}`);
        const segmentValue = String(segmentObject.value ?? "");
        const glossId = typeof segmentObject.glossId === "string" ? segmentObject.glossId : undefined;
        const record = legacyGlossRecords.find((entry) => {
          const item = requireObject(entry, `Legacy gloss record in ${fileName}`);
          return item.id === glossId;
        });
        const word = record ? requireObject(record, `Word data in ${fileName}`) : {};
        const originalWord = segmentValue.trim() !== "" ? segmentValue : String((word.surface as string | undefined) ?? "");

        return {
          id: String(glossId ?? `${fileName}-word-${segmentIndex}`),
          originalWord,
          morphologicalGloss: typeof word.sourceGloss === "string" ? word.sourceGloss : undefined,
          trailingPunctuation: /[.,;:!?]$/u.test(originalWord) ? originalWord.slice(-1) : undefined,
          sourceGlossTex: typeof word.sourceGlossTex === "string" ? word.sourceGlossTex : undefined,
          analysis: word.analysis as Record<string, unknown> | undefined,
          review: word.review as Record<string, unknown> | undefined,
        };
      }),
  }));

  return {
    ...document,
    sentences,
    blocks: legacyBlocks,
    glossRecords: legacyGlossRecords,
  };
}

function normalizeForm(value: string) {
  return value.normalize("NFC").toLocaleLowerCase("und");
}

function requireObject(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${context} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function requireArray(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`${context} must be an array.`);
  }
  return value;
}

function requireString(
  value: Record<string, unknown>,
  field: string,
  context: string,
): string {
  const fieldValue = value[field];
  if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
    throw new Error(`${context} must have a non-empty "${field}" value.`);
  }
  return fieldValue;
}
