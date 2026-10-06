import type { ReadingSentence, TextDocument } from "./types";

function escapeTypstString(str: string): string {
  if (!str) return "";
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeTypstContent(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/\*/g, "\\*")
    .replace(/\_/g, "\\_")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>");
}

export function plainToTypstGloss(gloss: string): string {
  if (!gloss) return "";
  return gloss.replace(/\b([A-Z0-9.]+)\b/g, (match) => {
    if (/^[A-Z0-9.]+$/.test(match) && !/^[A-Z][a-z]+$/.test(match)) {
      const lower = match.toLowerCase();
      return `#smallcaps("${escapeTypstString(lower)}")`;
    }
    return escapeTypstContent(match);
  });
}

function groupSentencesByParagraph(sentences: ReadingSentence[]): Map<number, ReadingSentence[]> {
  const map = new Map<number, ReadingSentence[]>();

  for (const sentence of sentences) {
    const match = sentence.id.match(/paragraph-(\d+)/);
    const paragraphNum = match ? parseInt(match[1], 10) : 1;

    if (!map.has(paragraphNum)) {
      map.set(paragraphNum, []);
    }
    map.get(paragraphNum)!.push(sentence);
  }

  if (map.size === 0 && sentences.length > 0) {
    map.set(1, sentences);
  }

  return map;
}

export function exportToTypst(document: TextDocument, customSentences?: ReadingSentence[]): string {
  const sentences = customSentences ?? document.sentences ?? [];
  const paragraphs = groupSentencesByParagraph(sentences);

  const title = document.title || "Untitled Document";
  const rawAuthor = document.author || document.source || "";
  const cleanAuthor = rawAuthor.replace(/^(Translated and glossed by\s*)+/gi, "").trim();
  const author = cleanAuthor
    ? cleanAuthor.toLowerCase().includes("anonymous")
      ? cleanAuthor
      : `Translated and glossed by ${cleanAuthor}`
    : "";
  const date = document.date || "September 30, 2026";

  let typ = `#set page(
  paper: "us-letter",
  margin: (x: 2cm, top: 2.5cm, bottom: 2.5cm),
  header: align(right)[
    #text(8pt, fill: luma(120))[Glossy Editorial Platform · Client-Side Typeset]
  ],
  footer: context [
    #align(center)[#text(9pt, fill: luma(100))[#counter(page).display()]]
  ]
)

#set text(
  font: ("Charis SIL", "Georgia", "serif"),
  size: 10.5pt,
  lang: "en"
)

#set par(justify: true, leading: 0.65em)

// Custom Interlinear Gloss Macros
#let gloss-pair(orig, gl) = stack(
  dir: ttb,
  spacing: 0.35em,
  [#text(weight: "semibold", fill: rgb("#1c1917"))[#orig]],
  [#text(size: 8.5pt, fill: rgb("#44403c"))[#gl]]
)

#let gloss-sentence(num, words, translation, footnotes: ()) = block(
  width: 100%,
  breakable: false,
  inset: (bottom: 0.8em),
  [
    #grid(
      columns: (auto, 1fr),
      column-gutter: 0.8em,
      [#text(weight: "bold", fill: rgb("#8b261b"))[(#num)]],
      [
        #grid(
          columns: words.map(_ => auto),
          column-gutter: 0.65em,
          row-gutter: 0.65em,
          ..words.map(w => gloss-pair(w.at(0), w.at(1)))
        )
        #v(0.35em)
        #text(style: "italic", fill: rgb("#2a2825"))["#translation"#for fn in footnotes [ #footnote(fn)]]
      ]
    )
  ]
)

// Document Header
#align(center)[
  #v(0.5em)
  #text(18pt, weight: "bold", fill: rgb("#1c1917"))["${escapeTypstString(title)}"]
  #v(0.4em)
  ${author ? `#text(11pt, style: "italic", fill: rgb("#44403c"))["${escapeTypstString(author)}"] \n  #v(0.2em)` : ""}
  #text(9.5pt, fill: rgb("#78716c"))["${escapeTypstString(date)}"]
  #v(1em)
]

#line(length: 100%, stroke: 0.5pt + rgb("#e7e5e4"))
#v(1em)

#heading(level: 1, numbering: none)[Text]
#v(0.5em)
`;

  let sentenceCounter = 1;

  for (const [paragraphNum, paraSentences] of paragraphs.entries()) {
    typ += `// Paragraph ${paragraphNum}\n`;

    for (const sentence of paraSentences) {
      const surfaceWords = sentence.words.map((word) => {
        if (word.analysis?.morphemes && word.analysis.morphemes.length > 1) {
          const joinedForm = word.analysis.morphemes.map((m) => m.form).filter(Boolean).join("-");
          if (joinedForm) {
            return `${joinedForm}${word.trailingPunctuation ?? ""}`;
          }
        }
        return `${word.originalWord}${word.trailingPunctuation ?? ""}`;
      });

      const glossWords = sentence.words.map((word) => {
        if (word.analysis?.morphemes && word.analysis.morphemes.length > 1) {
          const joinedGloss = word.analysis.morphemes.map((m) => plainToTypstGloss(m.gloss)).filter(Boolean).join("-");
          if (joinedGloss) {
            return joinedGloss;
          }
        }
        if (word.sourceGlossTex) return plainToTypstGloss(word.sourceGlossTex);
        if (word.morphologicalGloss) return plainToTypstGloss(word.morphologicalGloss);
        return escapeTypstContent(word.originalWord);
      });

      const pairsTypst = surfaceWords
        .map((surf, i) => `([#text("${escapeTypstString(surf)}")], [${glossWords[i]}])`)
        .join(", ");

      const translationEscaped = escapeTypstString(sentence.translation);
      const fnEscaped = (sentence.footnotes || []).map((f) => `[${escapeTypstContent(f)}]`).join(", ");

      typ += `#gloss-sentence(${sentenceCounter}, (${pairsTypst}), "${translationEscaped}"${
        fnEscaped ? `, footnotes: (${fnEscaped})` : ""
      })\n\n`;

      sentenceCounter++;
    }
  }

  if (document.slug?.includes("ohthere") || document.textId === "ohthere") {
    typ += `
#v(1.5em)
#line(length: 100%, stroke: 0.5pt + rgb("#e7e5e4"))
#v(0.8em)
#heading(level: 2, numbering: none)[Glossing Abbreviations]
#v(0.5em)

#columns(2, [
  #set text(size: 8.5pt)
  / 1: 1st person
  / 2: 2nd person
  / 3: 3rd person
  / ACC: accusative case
  / ADJ: adjective
  / ADV: adverb
  / AGT: agent
  / CMP: comparative
  / COMP: complementizer
  / DAT: dative case
  / DEF: definite
  / DEM: demonstrative
  / DET: determiner
  / DIST: distal
  / F: feminine gender
  / GEN: genitive case
  / HAB: habitual
  / IMP: imperative mood
  / IND: indicative mood
  / INDF: indefinite
  / INF: infinitive
  / INS: instrumental case
  / M: masculine gender
  / N: neuter gender
  / NEG: negative
  / NMLZ: nominalizer
  / NOM: nominative case
  / PART: participle
  / PASS: passive voice
  / PFX: prefix
  / PL: plural number
  / POSS: possessive
  / PROX: proximate
  / PRS: present tense
  / PST: past tense
  / REL: relativizer
  / SG: singular number
  / SJV: subjunctive mood
  / STR: strong declension
  / SUP: superlative
  / THM: theme vowel
  / WK: weak declension
])
`;
  }

  return typ;
}
