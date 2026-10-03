import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parseMDX } from "@tinacms/mdx";
import type { DictionaryEntry, ManuscriptDocument, TextDocument, ReadingSentence, InterlinearWord, Morpheme, PartOfSpeech } from "./types";
import { resolveOldEnglishLexicon } from "./old-english-lexicon";

const contentDirectory = path.join(process.cwd(), "content", "texts");

const glossWordTemplate = {
  name: "body",
  type: "rich-text" as const,
  templates: [
    {
      name: "GlossWord",
      label: "Gloss Word",
      inline: true,
      fields: [
        { type: "string" as const, name: "text" },
        { type: "reference" as const, name: "dictEntry", collections: ["dictionary"] },
      ],
    },
  ],
};

export function loadDictionary(): Record<string, DictionaryEntry> {
  const dictDir = path.join(process.cwd(), "content", "dictionary");
  const dictMap: Record<string, DictionaryEntry> = {};
  if (!fs.existsSync(dictDir)) return dictMap;

  for (const file of fs.readdirSync(dictDir)) {
    if (file.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(path.join(dictDir, file), "utf8")) as DictionaryEntry;
      const base = path.basename(file, ".json");
      const entry: DictionaryEntry = { ...data, id: base, relativePath: file };
      dictMap[file] = entry;
      dictMap[base] = entry;
      dictMap[`content/dictionary/${file}`] = entry;
      if (data.word) {
        dictMap[data.word] = entry;
      }
    }
  }
  return dictMap;
}

export function loadManuscripts(): ManuscriptDocument[] {
  const mDir = path.join(process.cwd(), "content", "manuscripts");
  if (!fs.existsSync(mDir)) return [];

  return fs.readdirSync(mDir).filter((f) => f.endsWith(".mdx")).map((file) => {
    const raw = fs.readFileSync(path.join(mDir, file), "utf8");
    const parsed = matter(raw);
    const frontmatter = parsed.data as Record<string, unknown>;
    const bodyText = parsed.content;
    const bodyAst = parseMDX(bodyText, glossWordTemplate, (val: string) => val);
    const slug = path.basename(file, ".mdx");
    const rawTranslation = typeof frontmatter.translation === "string" ? frontmatter.translation.trim() : undefined;

    // Split paragraphs into individual sentence blocks with their matching translations
    const rawParagraphs = bodyText.trim().split(/\n\s*\n/).filter(Boolean);
    const translationParagraphs = rawTranslation ? rawTranslation.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean) : [];

    const blocks = rawParagraphs.map((para, index) => {
      const paraAst = parseMDX(para, glossWordTemplate, (val: string) => val);
      return {
        id: `${slug}-block-${index + 1}`,
        body: paraAst,
        translation: translationParagraphs[index],
      };
    });

    return {
      slug,
      title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
      author: typeof frontmatter.author === "string" ? frontmatter.author : undefined,
      source: typeof frontmatter.source === "string" ? frontmatter.source : undefined,
      translation: rawTranslation,
      blocks: blocks.length > 0 ? blocks : undefined,
      body: bodyAst,
      rawBody: bodyText,
    };
  });
}

function stripLatexFootnotes(text: string): string {
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("\\footnote{", i)) {
      i += 10;
      let depth = 1;
      while (i < text.length && depth > 0) {
        if (text[i] === "{") depth++;
        else if (text[i] === "}") depth--;
        i++;
      }
    } else {
      result += text[i];
      i++;
    }
  }
  return result;
}

export type LoadedTextDocument = TextDocument & { fileName: string };

export function parseTexToLegacyTextDocument(): TextDocument {
  const texPath = path.join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");
  if (!fs.existsSync(texPath)) {
    throw new Error("Master TeX file not found.");
  }
  const content = fs.readFileSync(texPath, "utf8");

  // Extract document metadata from preamble
  const titleMatch = content.match(/\\title\{([\s\S]+?)\}/);
  const authorMatch = content.match(/\\author\{([\s\S]+?)\}/);
  const dateMatch = content.match(/\\date\{([\s\S]+?)\}/);

  const title = titleMatch ? titleMatch[1].replace(/\\textbf\{|\}/g, "").trim() : "The voyages of Ohthere and Wulfstan";
  const author = authorMatch ? authorMatch[1].replace(/\\textbf\{|\}/g, "").trim() : "Tyler Lemon";
  const date = dateMatch ? dateMatch[1].trim() : "September 30, 2026";

  const regex = /\\ex(?:\{)?\\gll\s+([\s\S]+?)\\\\\s*([\s\S]+?)\\\\\s*\\glt\s*([^\r\n]+)/g;

  let match;
  let sIdx = 1;
  const sentences: ReadingSentence[] = [];

  while ((match = regex.exec(content)) !== null) {
    const line1 = match[1].trim();
    const line2 = match[2].trim();
    const rawTranslation = match[3].trim();

    const cleanTranslation = stripLatexFootnotes(rawTranslation)
      .replace(/\\(?:textit|textbf|textsc|emph)\{([^}]+)\}/g, "$1")
      .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, "$1")
      .replace(/\\url\{[^}]+\}/g, "")
      .replace(/^[`'‘"“\s]+|[`'’"”\}\s]+$/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const rawSurfaceWords = line1.replace(/\\\\$/, "").trim().split(/\s+/);
    const rawGlossWords = line2.replace(/\\\\$/, "").trim().split(/\s+/);

    const words: InterlinearWord[] = [];
    const sentenceId = `sentence-${sIdx}`;

    const maxLen = Math.max(rawSurfaceWords.length, rawGlossWords.length);
    for (let tIdx = 0; tIdx < maxLen; tIdx++) {
      const rawSurf = rawSurfaceWords[tIdx] || "";
      const rawGl = rawGlossWords[tIdx] || "";

      const sourceForm = rawSurf.replace(/[.,;:!?]+$/, "");
      const literalTexGloss = rawGl;
      const sourceGloss = rawGl
        .replace(/\\textsc\{([^}]+)\}/g, "$1")
        .replace(/\\/g, "");

      const tokenId = `${sentenceId}-token-${tIdx + 1}`;

      const surfParts = sourceForm.split("-");
      const glossParts = sourceGloss.split("-");
      const morphemes: Morpheme[] = [];

      if (surfParts.length === glossParts.length && surfParts.length > 1) {
        for (let mIdx = 0; mIdx < surfParts.length; mIdx++) {
          morphemes.push({
            form: surfParts[mIdx],
            gloss: glossParts[mIdx],
          });
        }
      } else {
        morphemes.push({
          form: sourceForm,
          gloss: sourceGloss,
        });
      }

      const lex = resolveOldEnglishLexicon(sourceForm, sourceGloss);

      const caseVal = sourceGloss.toUpperCase().includes("NOM") ? "nominative" :
                      sourceGloss.toUpperCase().includes("ACC") ? "accusative" :
                      sourceGloss.toUpperCase().includes("GEN") ? "genitive" :
                      sourceGloss.toUpperCase().includes("DAT") ? "dative" : undefined;

      const numberVal = sourceGloss.toUpperCase().includes("PL") ? "plural" :
                        sourceGloss.toUpperCase().includes("SG") ? "singular" : undefined;

      const genderVal = sourceGloss.toUpperCase().includes("M") ? "masculine" :
                        sourceGloss.toUpperCase().includes("F") ? "feminine" :
                        sourceGloss.toUpperCase().includes("N") ? "neuter" : undefined;

      const tenseVal = sourceGloss.toUpperCase().includes("PST") ? "past" :
                       sourceGloss.toUpperCase().includes("PRS") ? "present" : undefined;

      const punctuationMatch = rawSurf.match(/[.,;:!?]+$/);

      words.push({
        id: tokenId,
        originalWord: sourceForm,
        morphologicalGloss: sourceGloss,
        trailingPunctuation: punctuationMatch ? punctuationMatch[0] : undefined,
        sourceGlossTex: literalTexGloss,
        analysis: {
          lemma: lex.lemma,
          partOfSpeech: (lex.pos || "noun") as PartOfSpeech,
          features: {
            case: caseVal,
            number: numberVal,
            gender: genderVal,
            tense: tenseVal,
          },
          morphemes,
          definition: lex.definition || sourceGloss,
          phonetic: lex.ipa || "",
          wiktionaryUrl: lex.wiktionaryUrl,
        },
      });
    }

    sentences.push({
      id: sentenceId,
      translation: cleanTranslation,
      words,
    });

    sIdx++;
  }

  return {
    textId: "ohthere",
    slug: "ohthere-wulfstan",
    language: "Old English",
    author,
    title,
    source: `${author} · ${date}`,
    sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
    status: "published",
    sentences,
    blocks: [],
  };
}

export function loadTextDocuments(): LoadedTextDocument[] {
  const fileNames = fs
    .readdirSync(contentDirectory)
    .filter((fileName) => fileName.endsWith(".json"));

  const documents = fileNames.map((fileName) => {
    const filePath = path.join(contentDirectory, fileName);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    const normalized = normalizeDocumentShape(requireObject(parsed, `Text document "${fileName}"`), fileName);

    // If it's the Voyages document, merge in any extra parsed sentences from Voyages_of_Ohthere_Wulfstan.tex
    if (normalized.slug === "ohthere-wulfstan" || normalized.textId === "ohthere") {
      try {
        const fullLegacy = parseTexToLegacyTextDocument();
        const existingSentences = (normalized.sentences as ReadingSentence[]) || [];
        const fullSentences = (fullLegacy.sentences as ReadingSentence[]) || [];
        
        // Merge the two arrays by sentence ID / index
        const mergedSentences = [...existingSentences];
        
        // Append sentences from fullSentences that are not present in existingSentences by comparing length
        for (let idx = existingSentences.length; idx < fullSentences.length; idx++) {
          mergedSentences.push(fullSentences[idx]);
        }
        
        normalized.sentences = mergedSentences;
      } catch (err) {
        console.error("Failed to dynamically load full TeX document in loadTextDocuments", err);
      }
    }

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
        requireString(sentence, "translation", sentenceContext);
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
      requireString(block, "translation", blockContext);
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
