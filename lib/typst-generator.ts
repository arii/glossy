import type { TextDocument, InterlinearWord } from "./types";

export function escapeTypst(str: string): string {
  if (!str) return "";
  return str
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\$/g, "\\$")
    .replace(/_/g, "\\_")
    .replace(/\*/g, "\\*")
    .replace(/@/g, "\\@");
}

export function generateTypstSource(doc: TextDocument): string {
  const lines: string[] = [];

  lines.push('#set page(paper: "a4", margin: 2.5cm)');
  lines.push('#set text(font: "Charis SIL", size: 11pt)');
  lines.push("");

  if (doc.title) {
    lines.push(`#align(center)[#text(size: 18pt, weight: "bold")[${escapeTypst(doc.title)}]]`);
  }

  const metaParts: string[] = [];
  if (doc.historicalAuthor) {
    metaParts.push(`Author: ${doc.historicalAuthor}`);
  }
  if (doc.author || doc.glossedBy || doc.editor) {
    metaParts.push(`Editor/Glossed by: ${doc.glossedBy || doc.editor || doc.author}`);
  }
  if (doc.date) {
    metaParts.push(doc.date);
  }
  if (doc.sourceEdition || doc.shelfmark) {
    metaParts.push(`Witness: ${doc.sourceEdition || doc.shelfmark}`);
  } else if (doc.source) {
    metaParts.push(doc.source);
  }

  if (metaParts.length > 0) {
    lines.push(
      `#align(center)[#text(size: 9.5pt, style: "italic", fill: rgb("#544e45"))[${escapeTypst(metaParts.join("  ·  "))}]]`,
    );
  }

  lines.push("#v(1.5em)");

  interface SentenceLike {
    id?: string;
    words?: InterlinearWord[];
    tokens?: Array<{
      id?: string;
      text?: string;
      gloss?: string;
      originalWord?: string;
      morphologicalGloss?: string;
      sourceForm?: string;
      sourceGloss?: string;
      literalTexGloss?: string;
      trailingPunctuation?: string;
    }>;
    translation?: string;
    freeTranslation?: string;
  }

  const sentences: SentenceLike[] =
    doc.sentences && doc.sentences.length > 0
      ? (doc.sentences as SentenceLike[])
      : (doc.blocks || []).map((block, idx) => ({
          id: block.id || `sent-${idx + 1}`,
          translation: block.translation,
          words: block.segments
            .filter((s) => s.type === "gloss")
            .map(
              (s, wIdx): InterlinearWord => ({
                id: s.glossId || `word-${wIdx + 1}`,
                originalWord: s.value,
                morphologicalGloss: s.value,
              }),
            ),
        }));

  // A4 paper printable width: 210mm - 2*25mm = 160mm (~6.3 inches).
  // At 11pt Charis SIL font size, average character width is ~5-6pt.
  // 160mm ≈ 453pt printable width.
  // 453pt / 6pt per char ≈ 75 printable characters max per line.
  // Allowing a safety margin and accounting for column gutters (~8pt = ~1.5 chars each),
  // a line character budget of 55 ensures column contents won't exceed page width.
  const LINE_CHAR_BUDGET = 55;
  const GUTTER_CHAR_WEIGHT = 2;

  function chunkWordsDynamic(words: InterlinearWord[]): InterlinearWord[][] {
    const chunks: InterlinearWord[][] = [];
    let currentChunk: InterlinearWord[] = [];
    let currentLineWidth = 0;

    for (const w of words) {
      const form = `${w.originalWord || ""}${w.trailingPunctuation || ""}`;
      let gloss = w.morphologicalGloss || w.sourceGlossTex || w.originalWord || "";
      gloss = gloss.replace(/\\textsc\{([^}]+)\}/g, "$1");

      const columnWidth = Math.max(form.length, gloss.length);
      const effectiveColumnWidth = columnWidth + GUTTER_CHAR_WEIGHT;

      if (
        currentChunk.length > 0 &&
        currentLineWidth + effectiveColumnWidth > LINE_CHAR_BUDGET
      ) {
        chunks.push(currentChunk);
        currentChunk = [w];
        currentLineWidth = columnWidth;
      } else {
        currentChunk.push(w);
        currentLineWidth += effectiveColumnWidth;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  for (const [sIdx, sentence] of sentences.entries()) {
    const sNum = sIdx + 1;
    const words: InterlinearWord[] =
      sentence.words ||
      (sentence.tokens || []).map((t, tIdx) => ({
        id: t.id || `sent-${sNum}-word-${tIdx + 1}`,
        originalWord: t.originalWord || t.sourceForm || t.text || "",
        morphologicalGloss:
          t.morphologicalGloss ||
          t.sourceGloss ||
          t.literalTexGloss ||
          t.gloss ||
          "",
        trailingPunctuation: t.originalWord ? (t.trailingPunctuation || "") : "",
      }));

    if (words.length > 0) {
      lines.push(`// Sentence ${sNum}`);
      const chunks = chunkWordsDynamic(words);

      for (const [cIdx, chunk] of chunks.entries()) {
        const colSpec = Array(chunk.length).fill("auto").join(", ");

        const formCells = chunk
          .map((w) => {
            const form = `${w.originalWord || ""}${w.trailingPunctuation || ""}`;
            return `[${escapeTypst(form)}]`;
          })
          .join(", ");

        const glossCells = chunk
          .map((w) => {
            let gloss = w.morphologicalGloss || w.sourceGlossTex || w.originalWord || "";
            gloss = gloss.replace(/\\textsc\{([^}]+)\}/g, "$1");
            return `[${escapeTypst(gloss)}]`;
          })
          .join(", ");

        lines.push("#grid(");
        lines.push(`  columns: (${colSpec}),`);
        lines.push("  gutter: 8pt,");
        lines.push(`  ${formCells},`);
        lines.push(`  ${glossCells}`);
        lines.push(")");
        if (cIdx < chunks.length - 1) {
          lines.push("#v(0.4em)");
        }
      }
    }

    const translationText = sentence.translation || sentence.freeTranslation;
    if (translationText) {
      lines.push("#v(0.3em)");
      lines.push(
        `#block(inset: (left: 8pt), stroke: (left: 2pt + rgb("#7b3f2a")))[#text(style: "italic", fill: rgb("#25231f"))[${escapeTypst(translationText)}]]`,
      );
    }

    lines.push("#v(1.2em)");
  }

  return lines.join("\n");
}
