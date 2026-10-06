import type { ReadingSentence, TextDocument } from "../lib/types.ts";

export function exportToGb4eLatex(document: TextDocument, customSentences?: ReadingSentence[]): string {
  const sentences = customSentences ?? document.sentences ?? [];
  const paragraphs = groupSentencesByParagraph(sentences);

  const title = document.title || "Untitled Document";
  const rawAuthor = document.author || document.source || "";
  const cleanAuthor = rawAuthor.replace(/^(Translated and glossed by\s*)+/gi, "").trim();
  const author = cleanAuthor
    ? (cleanAuthor.toLowerCase().includes("anonymous") ? cleanAuthor : `Translated and glossed by ${cleanAuthor}`)
    : "";
  const date = document.date || "September 30, 2026";

  let tex = `%!TEX TS-program = xelatex
% !BIB program = biber
\\documentclass{article}[12pt]
\\usepackage{setspace}
\\singlespacing
\\usepackage{ifpdf}
\\usepackage{fontspec}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{amsthm, amsmath, amssymb}
\\usepackage[linguistics]{forest}
\\usepackage{adjustbox}
\\usepackage[loose,nice]{units}
\\usepackage{tipa}
\\usepackage{graphicx}
\\usepackage{covington}
\\usepackage{gb4e}
\\noautomath
\\let\\eachwordone=\\normalfont
\\let\\eachwordone=\\textbf
\\usepackage{hanging}
\\usepackage{textgreek}
\\usepackage{multirow}
\\usepackage{multicol}
\\setlength{\\multicolsep}{0pt}
\\usepackage[normalem]{ulem}
\\usepackage{stmaryrd}
\\usepackage{hyperref}
\\usepackage[backend=biber,style=unified,citestyle=authoryear-comp,maxcitenames=3,maxbibnames=99]{biblatex}
\\DeclareFieldFormat{postnote}{#1}
\\renewcommand{\\postnotedelim}{\\addcolon\\space}
\\usepackage[utf8x]{inputenc}

\\title{\\textbf{${escapeTex(title)}}}
${author ? `\\author{${escapeTex(author)}}` : ""}
\\date{${date}}

${document.sourceFile?.includes("Voyages") ? "\\addbibresource{Voyages_of_Ohthere_Wulfstan.bib}\n" : ""}
\\begin{document}
\\maketitle

\\section{Text}
`;

  for (const [paragraphNum, paraSentences] of paragraphs.entries()) {
    tex += `\n\\begin{exe}\n\\ex \\label{ex:paragraph.${paragraphNum}} \\begin{xlist}\n\n`;

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
          const joinedGloss = word.analysis.morphemes.map((m) => plainToTexGloss(m.gloss)).filter(Boolean).join("-");
          if (joinedGloss) {
            return joinedGloss;
          }
        }
        if (word.sourceGlossTex) return word.sourceGlossTex;
        if (word.morphologicalGloss) return plainToTexGloss(word.morphologicalGloss);
        return word.originalWord;
      });

      const surfaceLine = surfaceWords.join(" ");
      const glossLine = glossWords.join(" ");

      let translationText = sentence.translation;
      if (sentence.footnotes && sentence.footnotes.length > 0) {
        for (const footnote of sentence.footnotes) {
          translationText += `\\footnote{${footnote}}`;
        }
      }

      tex += `\\ex{\\gll ${surfaceLine}\\\\\n${glossLine}\\\\\n\\glt \`${translationText}'}\n\n`;
    }

    tex += `\\end{xlist}\n\\end{exe}\n`;
  }

  if (document.slug?.includes("ohthere") || document.textId === "ohthere") {
    tex += `\n\\section{Glossing abbreviations}\n
\\begin{multicols}{2}
\\begin{description}
\\item[1] 1st person
\\item[2] 2nd person
\\item[3] 3rd person
\\item[ACC] accusative case
\\item[ADJ] adjective
\\item[ADV] adverb
\\item[AGT] agent
\\item[CMP] comparative
\\item[COMP] complementizer
\\item[DAT] dative case
\\item[DEF] definite
\\item[DEM] demonstrative
\\item[DET] determiner
\\item[DIST] distal
\\item[F] feminine gender
\\item[GEN] genitive case
\\item[HAB] habitual
\\item[IMP] imperative mood
\\item[IND] indicative mood
\\item[INDF] indefinite
\\item[INF] infinitive
\\item[INS] instrumental case
\\item[M] masculine gender
\\item[N] neuter gender
\\item[NEG] negative
\\item[NMLZ] nominalizer
\\item[NOM] nominative case
\\item[PART] participle
\\item[PASS] passive voice
\\item[PFX] prefix
\\item[PL] plural number
\\item[POSS] possessive
\\item[PROX] proximate
\\item[PRS] present tense
\\item[PST] past tense
\\item[REL] relativizer
\\item[SG] singular number
\\item[SJV] subjunctive mood
\\item[STR] strong declension
\\item[SUP] superlative
\\item[THM] theme vowel
\\item[WK] weak declension
\\end{description}
\\end{multicols}

\\printbibliography
`;
  }

  tex += `\n\\end{document}\n`;

  return tex;
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

  // If no sentences matched paragraph pattern, put all into paragraph 1
  if (map.size === 0 && sentences.length > 0) {
    map.set(1, sentences);
  }

  return map;
}

export function plainToTexGloss(gloss: string): string {
  if (!gloss) return "";
  if (gloss.includes("\\textsc{")) return gloss;

  // Convert Leipzig abbreviations like PST, NOM, IND.3SG to \textsc{pst}, \textsc{nom}, etc.
  return gloss.replace(/\b([A-Z0-9.]+)\b/g, (match) => {
    if (/^[A-Z0-9.]+$/.test(match) && !/^[A-Z][a-z]+$/.test(match)) {
      const lower = match.toLowerCase();
      return `\\textsc{${lower}}`;
    }
    return match;
  });
}

function escapeTex(text: string): string {
  return text.replace(/([%$&#_])/g, "\\$1");
}
