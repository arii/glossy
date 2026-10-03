import type { InterlinearWord, ReadingSentence } from "./types";

export type Gb4eImport = {
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

  const labelPattern = /\\label\{ex:paragraph\.(\d+)\}/g;
  const labels = [...text.matchAll(labelPattern)].map((m) => ({ index: m.index ?? 0, paragraph: Number(m[1]) }));

  const exPattern = /\\ex\s*\{\s*\\gll\b/g;
  for (const match of text.matchAll(exPattern)) {
    const start = match.index ?? 0;
    const open = text.indexOf("{", start);
    const close = matchingBrace(text, open);
    if (close === -1) {
      warnings.push(`Unclosed \\ex{ near character ${start}; skipped.`);
      continue;
    }
    const body = text.slice(open + 1, close);
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

    const forms = splitOutsideBraces(lines[0]);
    const glosses = splitOutsideBraces(lines[1]);
    if (forms.length !== glosses.length) {
      warnings.push(`${id}: ${forms.length} words but ${glosses.length} gloss items; matched by position.`);
    }

    const words: InterlinearWord[] = forms.map((form, index) => {
      const punctuation = form.match(/[,.;:?!]+$/)?.[0];
      const originalWord = punctuation ? form.slice(0, -punctuation.length) : form;
      const rawGloss = glosses[index];
      const word: InterlinearWord = { id: `${id}-word-${index + 1}`, originalWord };
      if (punctuation) word.trailingPunctuation = punctuation;
      if (rawGloss) {
        word.sourceGlossTex = rawGloss;
        word.morphologicalGloss = texToPlain(rawGloss);
      }
      return word;
    });

    sentences.push({ id, translation: cleanTranslation(translationText), words });
  }

  if (sentences.length === 0) warnings.push("No \\ex{\\gll … \\glt …} examples were found.");
  return { sentences, footnotes, warnings };
}

function stripComments(source: string) {
  return source
    .split("\n")
    .map((line) => line.replace(/(^|[^\\])%.*$/, "$1"))
    .join("\n");
}

function matchingBrace(text: string, open: number) {
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

function splitOutsideBraces(line: string) {
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

function extractFootnotes(translation: string) {
  const notes: string[] = [];
  let out = "";
  let i = 0;
  while (i < translation.length) {
    if (translation.startsWith("\\footnote{", i)) {
      const open = i + "\\footnote".length;
      const close = matchingBrace(translation, open);
      if (close !== -1) {
        notes.push(texToPlain(translation.slice(open + 1, close)).replace(/\s+/g, " ").trim());
        i = close + 1;
        continue;
      }
    }
    out += translation[i++];
  }
  return { text: out, notes };
}

function cleanTranslation(raw: string) {
  return texToPlain(raw)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[`‘]\s*/, "")
    .replace(/\s*['’]$/, "");
}

// Gloss abbreviations become uppercase (Leipzig style); other commands keep their text.
function texToPlain(tex: string) {
  return tex
    .replace(/\\textsc\{([^}]*)\}/g, (_, abbreviation: string) => abbreviation.toUpperCase())
    .replace(/\\href\{[^}]*\}\{([^}]*)\}/g, "$1")
    .replace(/\\(?:textit|textbf|emph)\{([^}]*)\}/g, "$1")
    .replace(/\\([&%_#$])/g, "$1");
}
