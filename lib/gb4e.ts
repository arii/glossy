import type {
  InflectionFeatures,
  InterlinearWord,
  Morpheme,
  NoteItem,
  PartOfSpeech,
  ReadingSentence,
  TextDocument,
} from "./types.ts";
import { lemmatizeOldEnglish } from "./lemmatizer.ts";

export type Gb4eImport = {
  title?: string;
  author?: string;
  date?: string;
  sentences: ReadingSentence[];
  footnotes: Record<string, string[]>;
  warnings: string[];
};

// Parses gb4e `\ex{\gll … \\ … \\ \glt `…'}` entries. Paragraph numbers come from
// the nearest preceding `\label{ex:paragraph.N}`; without one, everything is paragraph 1.
export function parseGb4e(source: string): Gb4eImport {
  const text = stripComments(source);
  const sentences: ReadingSentence[] = [];
  const footnotes: Record<string, string[]> = {};
  const warnings: string[] = [];
  const perParagraph = new Map<number, number>();

  // Extract document metadata from LaTeX preamble using balanced brace extraction
  const title = extractLatexMacro(text, "title");
  const rawAuthor = extractLatexMacro(text, "author");
  const author = rawAuthor ? rawAuthor.replace(/^(Translated and glossed by\s*)+/gi, "").trim() : undefined;
  const date = extractLatexMacro(text, "date");

  const labelPattern = /\\label\{ex:paragraph\.(\d+)\}/g;
  const labels = [...text.matchAll(labelPattern)].map((m) => ({
    index: m.index ?? 0,
    paragraph: Number(m[1]),
  }));

  const exPattern = /\\ex\s*(?:\{\s*)?\\gll\b/g;
  for (const match of text.matchAll(exPattern)) {
    const start = match.index ?? 0;
    let body = "";
    const open = text.indexOf("{", start);

    // Check if \ex has matching outer braces \ex{...}
    if (open !== -1 && open - start < 10) {
      const close = matchingBrace(text, open);
      if (close !== -1) {
        body = text.slice(open + 1, close);
      }
    }

    if (!body) {
      // Fallback for unbraced \ex \gll ... \\ ... \\ \glt ...
      const gltIndex = text.indexOf("\\glt", start);
      if (gltIndex !== -1) {
        const nextExIndex = text.indexOf("\\ex", gltIndex);
        const endBlock = text.indexOf("\\end{", gltIndex);
        let end = text.length;
        if (nextExIndex !== -1 && nextExIndex < end) end = nextExIndex;
        if (endBlock !== -1 && endBlock < end) end = endBlock;
        body = text.slice(start, end);
      } else {
        warnings.push(`Unmatched \\ex block near character ${start}; skipped.`);
        continue;
      }
    }

    const paragraph = labels.filter((label) => label.index < start).at(-1)?.paragraph ?? 1;
    const number = (perParagraph.get(paragraph) ?? 0) + 1;
    perParagraph.set(paragraph, number);
    const id = `paragraph-${paragraph}-sentence-${number}`;

    const gltAt = body.indexOf("\\glt");
    const lines = body
      .slice(body.indexOf("\\gll") + 4, gltAt === -1 ? undefined : gltAt)
      .split(/\\\\/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2 || gltAt === -1) {
      warnings.push(`${id}: expected two gloss lines and a \\glt translation; skipped.`);
      continue;
    }

    const { text: translationText, notes } = extractFootnotes(body.slice(gltAt + 4));
    if (notes.length > 0) footnotes[id] = notes;

    const structuredNotes: NoteItem[] = notes.map((noteText, nIdx) => ({
      id: `fn-${id}-${nIdx + 1}`,
      marker: String(nIdx + 1),
      type: "manuscript_variant",
      text: noteText,
    }));

    const forms = splitOutsideBraces(lines[0]);
    const glosses = splitOutsideBraces(lines[1]);
    if (forms.length !== glosses.length) {
      warnings.push(`${id}: ${forms.length} words but ${glosses.length} gloss items; matched by position.`);
    }

    const maxLen = Math.max(forms.length, glosses.length);
    const words: InterlinearWord[] = [];

    for (let index = 0; index < maxLen; index++) {
      const form = forms[index] || "";
      const rawGloss = glosses[index] || "";

      const punctuation = form.match(/[,.;:?!]+$/)?.[0];
      const originalWord = punctuation ? form.slice(0, -punctuation.length) : form;
      const plainGloss = rawGloss ? texToPlain(rawGloss) : originalWord;
      const wordId = `${id}-word-${index + 1}`;

      // Morpheme segmentation on hyphens
      const formParts = originalWord.split("-").filter(Boolean);
      const glossParts = plainGloss.split("-").filter(Boolean);
      const morphemes: Morpheme[] = [];

      if (formParts.length === glossParts.length && formParts.length > 1) {
        for (let mIdx = 0; mIdx < formParts.length; mIdx++) {
          morphemes.push({
            id: `${wordId}-morpheme-${mIdx + 1}`,
            form: formParts[mIdx],
            gloss: glossParts[mIdx],
          });
        }
      } else if (formParts.length > 1) {
        // Expand gloss parts if gloss uses dot notation for inflection suffixes (e.g. Dane.GEN.PL for Den-a)
        const expandedGloss: string[] = [];
        for (let i = 0; i < glossParts.length; i++) {
          const part = glossParts[i];
          if (i === glossParts.length - 1 && formParts.length > glossParts.length && part.includes(".")) {
            const dotParts = part.split(".");
            expandedGloss.push(dotParts[0], dotParts.slice(1).join("."));
          } else {
            expandedGloss.push(part);
          }
        }

        for (let mIdx = 0; mIdx < formParts.length; mIdx++) {
          morphemes.push({
            id: `${wordId}-morpheme-${mIdx + 1}`,
            form: formParts[mIdx],
            gloss: expandedGloss[mIdx] || formParts[mIdx],
          });
        }
      } else {
        morphemes.push({
          id: `${wordId}-morpheme-1`,
          form: originalWord,
          gloss: plainGloss,
        });
      }

      const lex = lemmatizeOldEnglish(originalWord, plainGloss);
      const features = extractInflectionFeatures(plainGloss);

      const word: InterlinearWord = {
        id: wordId,
        originalWord,
        morphologicalGloss: plainGloss,
        trailingPunctuation: punctuation,
        sourceGlossTex: rawGloss || undefined,
        analysis: {
          lemma: lex.lemma,
          partOfSpeech: (lex.pos || "noun") as PartOfSpeech,
          features,
          morphemes,
          definition: lex.definition || plainGloss,
          phonetic: lex.ipa || undefined,
          wiktionaryUrl: lex.wiktionaryUrl,
        },
        review: {
          status: "source-checked",
          source: {
            file: "references/Voyages_of_Ohthere_Wulfstan.tex",
            locator: `paragraph.${paragraph} / sentence ${number}`,
          },
        },
      };

      words.push(word);
    }

    sentences.push({
      id,
      translation: cleanTranslation(translationText),
      footnotes: notes.length > 0 ? notes : undefined,
      notes: structuredNotes.length > 0 ? structuredNotes : undefined,
      words,
    });
  }

  if (sentences.length === 0) warnings.push("No \\ex{\\gll … \\glt …} examples were found.");
  return {
    title,
    author,
    date,
    sentences,
    footnotes,
    warnings,
  };
}

export function parseGb4eToTextDocument(
  source: string,
  defaults: Partial<TextDocument> = {},
): TextDocument {
  const parsed = parseGb4e(source);
  const title = defaults.title ?? parsed.title ?? "";
  const author = defaults.author ?? parsed.author ?? "";
  const date = defaults.date ?? parsed.date ?? "";
  const slug = defaults.slug ?? "ohthere-wulfstan";
  const textId = defaults.textId ?? "ohthere";

  return {
    textId,
    slug,
    language: defaults.language || "Old English",
    author,
    editor: defaults.editor,
    shelfmark: defaults.shelfmark,
    dialect: defaults.dialect,
    historicalDate: defaults.historicalDate,
    date,
    title,
    source: defaults.source || `${author} · ${date}`,
    sourceFile: defaults.sourceFile || "references/Voyages_of_Ohthere_Wulfstan.tex",
    sourceEdition: defaults.sourceEdition,
    status: defaults.status || "published",
    sentences: parsed.sentences,
    blocks: defaults.blocks || [],
  };
}

function extractInflectionFeatures(gloss: string): InflectionFeatures {
  const upper = gloss.toUpperCase();
  const features: InflectionFeatures = {};

  if (upper.includes("NOM")) features.case = "nominative";
  else if (upper.includes("ACC")) features.case = "accusative";
  else if (upper.includes("GEN")) features.case = "genitive";
  else if (upper.includes("DAT")) features.case = "dative";
  else if (upper.includes("INS")) features.case = "instrumental";

  if (upper.includes("PL")) features.number = "plural";
  else if (upper.includes("DU")) features.number = "dual";
  else if (upper.includes("SG")) features.number = "singular";

  if (upper.includes(".M") || upper.includes("-M") || upper.endsWith(".M") || upper.includes("M.NOM") || upper.includes("M.ACC") || upper.includes("M.DAT") || upper.includes("M.GEN")) {
    features.gender = "masculine";
  } else if (upper.includes(".F") || upper.includes("-F") || upper.endsWith(".F") || upper.includes("F.NOM") || upper.includes("F.ACC") || upper.includes("F.DAT") || upper.includes("F.GEN")) {
    features.gender = "feminine";
  } else if (upper.includes(".N") || upper.includes("-N") || upper.endsWith(".N") || upper.includes("N.NOM") || upper.includes("N.ACC") || upper.includes("N.DAT") || upper.includes("N.GEN")) {
    features.gender = "neuter";
  }

  if (upper.includes("PST")) features.tense = "past";
  else if (upper.includes("PRS")) features.tense = "present";

  if (upper.includes("SJV")) features.mood = "subjunctive";
  else if (upper.includes("IND")) features.mood = "indicative";
  else if (upper.includes("IMP")) features.mood = "imperative";
  else if (upper.includes("INF")) features.mood = "infinitive";

  if (upper.includes("1SG") || upper.includes("1PL") || upper.includes(".1")) features.person = 1;
  else if (upper.includes("2SG") || upper.includes("2PL") || upper.includes(".2")) features.person = 2;
  else if (upper.includes("3SG") || upper.includes("3PL") || upper.includes(".3")) features.person = 3;

  if (upper.includes("SUP")) features.degree = "superlative";
  else if (upper.includes("CMP") && !upper.includes("COMP")) features.degree = "comparative";

  if (upper.includes("STR")) features.declension = "strong";
  else if (upper.includes("WK")) features.declension = "weak";

  return features;
}

function stripComments(source: string): string {
  return source
    .split("\n")
    .map((line) => line.replace(/(^|[^\\])%.*$/, "$1"))
    .join("\n");
}

function matchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "\\") {
      i++;
    } else if (text[i] === "{") {
      depth++;
    } else if (text[i] === "}" && --depth === 0) {
      return i;
    }
  }
  return -1;
}

function splitOutsideBraces(line: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of line) {
    if (char === "{") depth++;
    if (char === "}") depth--;
    if (/\s/.test(char) && depth === 0) {
      if (current) parts.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function extractFootnotes(translation: string): { text: string; notes: string[] } {
  const notes: string[] = [];
  let out = "";
  let i = 0;
  while (i < translation.length) {
    if (translation.startsWith("\\footnote{", i)) {
      const open = i + "\\footnote".length;
      const close = matchingBrace(translation, open);
      if (close !== -1) {
        notes.push(cleanLatexFormatting(translation.slice(open + 1, close)).replace(/\s+/g, " ").trim());
        i = close + 1;
        continue;
      }
    }
    out += translation[i++];
  }
  return { text: out, notes };
}

function extractLatexMacro(text: string, macro: string): string | undefined {
  const prefix = `\\${macro}`;
  const idx = text.indexOf(prefix);
  if (idx === -1) return undefined;
  const open = text.indexOf("{", idx + prefix.length);
  if (open === -1 || open - (idx + prefix.length) > 5) return undefined;
  const close = matchingBrace(text, open);
  if (close === -1) return undefined;
  const inner = text.slice(open + 1, close);
  return cleanLatexFormatting(inner);
}

function cleanLatexFormatting(text: string): string {
  let cleaned = text;
  let prev = "";
  // Recursively unnest LaTeX formatting macros
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned
      .replace(/\\(?:textit|textbf|textsc|emph)\{([^}]*)\}/g, "$1")
      .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
      .replace(/\\url\{[^}]*\}/g, "");
  }
  // Strip any lingering macro prefixes or braces
  cleaned = cleaned
    .replace(/\\(?:textit|textbf|textsc|emph)\{?/g, "")
    .replace(/\\([&%_#$])/g, "$1")
    .replace(/[{}\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned;
}

function cleanTranslation(raw: string): string {
  return cleanLatexFormatting(texToPlain(raw))
    .replace(/^[`'‘"“\s]+|[`'’"”\}\s]+$/g, "")
    .trim();
}

// Gloss abbreviations become uppercase (Leipzig style); other commands keep their text.
function texToPlain(tex: string): string {
  return tex
    .replace(/\\textsc\{([^}]*)\}/g, (_, abbreviation: string) => abbreviation.toUpperCase())
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\\(?:textit|textbf|emph)\{([^}]*)\}/g, "$1")
    .replace(/\\([&%_#$])/g, "$1")
    .replace(/\\/g, "");
}
