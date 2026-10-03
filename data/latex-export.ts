import type { ReadingSentence, TextDocument } from "../lib/types";

export function exportToGb4eLatex(document: TextDocument, customSentences?: ReadingSentence[]): string {
  const sentences = customSentences ?? document.sentences ?? [];
  const paragraphs = groupSentencesByParagraph(sentences);

  const title = document.title || "Untitled Document";
  const author = document.author ? `Translated and glossed by ${document.author}` : document.source || "";
  const date = "September 30, 2026";

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

\\addbibresource{Voyages_of_Ohthere_Wulfstan.bib}

\\begin{document}
\\maketitle

\\section{Text}
`;

  for (const [paragraphNum, paraSentences] of paragraphs.entries()) {
    tex += `\n\\begin{exe}\n\\ex \\label{ex:paragraph.${paragraphNum}} \\begin{xlist}\n\n`;

    for (const sentence of paraSentences) {
      const surfaceWords = sentence.words.map((word) => `${word.originalWord}${word.trailingPunctuation ?? ""}`);
      const glossWords = sentence.words.map((word) => {
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

function plainToTexGloss(gloss: string): string {
  // Convert Leipzig abbreviations like PST, NOM, IND.3SG to \textsc{pst}, \textsc{nom}, etc.
  return gloss.replace(/\b([A-Z0-9.]+)\b/g, (match) => {
    // If it's pure numbers or contains non-letters other than dots
    const lower = match.toLowerCase();
    return `\\textsc{${lower}}`;
  });
}

function escapeTex(text: string): string {
  return text.replace(/([%$&#_])/g, "\\$1");
}
