import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

interface Morpheme {
  id: string;
  morpheme: string;
  gloss: string;
}

interface Token {
  id: string;
  sourceForm: string;
  sourceGloss: string;
  literalTexGloss: string;
  lemma: string;
  pos: string;
  explanation: string;
  inflections: {
    case?: string;
    number?: string;
    gender?: string;
    tense?: string;
    mood?: string;
    person?: string;
  };
  morphemes: Morpheme[];
  ipa: string;
  wiktionaryUrl: string;
}

interface Sentence {
  id: string;
  tokens: Token[];
  freeTranslation: string;
}

interface GlossDocument {
  title: string;
  author: string;
  date: string;
  sentences: Sentence[];
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

export async function GET() {
  try {
    const texPath = path.join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");
    if (!fs.existsSync(texPath)) {
      return NextResponse.json({ error: "Master TeX file not found." }, { status: 404 });
    }

    const content = fs.readFileSync(texPath, "utf8");

    // Extract document metadata from preamble
    const titleMatch = content.match(/\\title\{([\s\S]+?)\}/);
    const authorMatch = content.match(/\\author\{([\s\S]+?)\}/);
    const dateMatch = content.match(/\\date\{([\s\S]+?)\}/);

    const title = titleMatch ? titleMatch[1].replace(/\\textbf\{|\}/g, "").trim() : "The voyages of Ohthere and Wulfstan";
    const author = authorMatch ? authorMatch[1].replace(/\\textbf\{|\}/g, "").trim() : "Tyler Lemon";
    const date = dateMatch ? dateMatch[1].trim() : "September 30, 2026";

    const sentences: Sentence[] = [];

    // Comprehensive regex to find all \ex{\gll ... \\ ... \\ \glt '...'} blocks
    // This supports optionally curly-braced ex structures and xlists
    const regex = /\\ex(?:\{)?\\gll\s+([\s\S]+?)\\\\\s*([\s\S]+?)\\\\\s*\\glt\s*([^\r\n]+)/g;

    let match;
    let sIdx = 1;

    while ((match = regex.exec(content)) !== null) {
      const line1 = match[1].trim();
      const line2 = match[2].trim();
      const rawTranslation = match[3].trim();

      // Clean translation of raw quotes, footnotes, or LaTeX formatting
      const cleanTranslation = stripLatexFootnotes(rawTranslation)
        .replace(/\\(?:textit|textbf|textsc|emph)\{([^}]+)\}/g, "$1")
        .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, "$1")
        .replace(/\\url\{[^}]+\}/g, "")
        .replace(/^[`'‘"“\s]+|[`'’"”\}\s]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Token splitting - clean up extra backslashes at ends of lines
      const rawSurfaceWords = line1.replace(/\\\\$/, "").trim().split(/\s+/);
      const rawGlossWords = line2.replace(/\\\\$/, "").trim().split(/\s+/);

      const tokens: Token[] = [];
      const sentenceId = `sentence-${sIdx}`;

      // Iterate and pair surface tokens with their glosses
      const maxLen = Math.max(rawSurfaceWords.length, rawGlossWords.length);
      for (let tIdx = 0; tIdx < maxLen; tIdx++) {
        const rawSurf = rawSurfaceWords[tIdx] || "";
        const rawGl = rawGlossWords[tIdx] || "";

        // Strip trailing punctuation from original surface to form clean sourceForm
        const sourceForm = rawSurf.replace(/[.,;:!?]+$/, "");
        
        // Preserve original LaTeX gloss
        const literalTexGloss = rawGl;

        // Clean LaTeX tags to create human-readable Leipzig sourceGloss
        const sourceGloss = rawGl
          .replace(/\\textsc\{([^}]+)\}/g, "$1")
          .replace(/\\/g, "");

        const tokenId = `${sentenceId}-token-${tIdx + 1}`;

        // Infer morpheme segmentation based on hyphens/boundaries
        const surfParts = sourceForm.split("-");
        const glossParts = sourceGloss.split("-");
        const morphemes: Morpheme[] = [];

        if (surfParts.length === glossParts.length && surfParts.length > 1) {
          for (let mIdx = 0; mIdx < surfParts.length; mIdx++) {
            morphemes.push({
              id: `${tokenId}-morpheme-${mIdx + 1}`,
              morpheme: surfParts[mIdx],
              gloss: glossParts[mIdx],
            });
          }
        } else {
          morphemes.push({
            id: `${tokenId}-morpheme-1`,
            morpheme: sourceForm,
            gloss: sourceGloss,
          });
        }

        // Infer initial POS and inflections from gloss indicators
        let pos = "noun";
        if (sourceGloss.toLowerCase().includes("say") || sourceGloss.toLowerCase().includes("dwell") || sourceGloss.toLowerCase().includes("travel")) {
          pos = "verb";
        } else if (sourceGloss.toUpperCase().includes("DET") || sourceGloss.toUpperCase().includes("DEM")) {
          pos = "determiner";
        } else if (sourceGloss.toUpperCase().includes("3SG") || sourceGloss.toUpperCase().includes("3PL")) {
          pos = "pronoun";
        }

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

        tokens.push({
          id: tokenId,
          sourceForm: rawSurf, // Hold raw token with punctuation in place for clean flow spacing
          sourceGloss,
          literalTexGloss,
          lemma: sourceForm.replace(/^-|-$/g, ""),
          pos,
          explanation: sourceGloss,
          inflections: {
            case: caseVal,
            number: numberVal,
            gender: genderVal,
            tense: tenseVal,
          },
          morphemes,
          ipa: "",
          wiktionaryUrl: "",
        });
      }

      sentences.push({
        id: sentenceId,
        tokens,
        freeTranslation: cleanTranslation,
      });

      sIdx++;
    }

    const doc: GlossDocument = {
      title,
      author,
      date,
      sentences,
    };

    return NextResponse.json(doc);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to parse Master TeX file.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
