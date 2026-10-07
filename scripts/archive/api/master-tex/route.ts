import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { parseGb4eToTextDocument } from "../../../lib/gb4e";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedFile = url.searchParams.get("sourceFile");
    const requestedSlug = url.searchParams.get("slug") || "ohthere-wulfstan";

    let texPath = requestedFile
      ? path.join(process.cwd(), requestedFile)
      : path.join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");

    if (!fs.existsSync(texPath)) {
      // Try resolving within references/
      if (requestedFile && !requestedFile.startsWith("references/")) {
        texPath = path.join(process.cwd(), "references", requestedFile);
      }
    }

    if (!fs.existsSync(texPath)) {
      texPath = path.join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");
    }

    if (!fs.existsSync(texPath)) {
      return NextResponse.json({ error: "Master TeX file not found." }, { status: 404 });
    }

    const content = fs.readFileSync(texPath, "utf8");
    const document = parseGb4eToTextDocument(content, {
      textId: requestedSlug,
      slug: requestedSlug,
      sourceFile: path.relative(process.cwd(), texPath),
      status: "published",
    });

    // Provide both the canonical ReadingSentence format and UI-friendly tokens
    const responseData = {
      ...document,
      sentences: (document.sentences || []).map((sent) => ({
        id: sent.id,
        freeTranslation: sent.translation,
        translation: sent.translation,
        footnotes: sent.footnotes,
        words: sent.words,
        tokens: sent.words.map((w) => ({
          id: w.id,
          sourceForm: `${w.originalWord}${w.trailingPunctuation || ""}`,
          sourceGloss: w.morphologicalGloss || w.originalWord,
          literalTexGloss: w.sourceGlossTex || w.morphologicalGloss || w.originalWord,
          lemma: w.analysis?.lemma || w.originalWord,
          pos: w.analysis?.partOfSpeech || "noun",
          explanation: w.analysis?.definition || w.morphologicalGloss || "",
          inflections: {
            case: w.analysis?.features?.case,
            number: w.analysis?.features?.number,
            gender: w.analysis?.features?.gender,
            tense: w.analysis?.features?.tense,
            mood: w.analysis?.features?.mood,
            person: w.analysis?.features?.person ? String(w.analysis.features.person) : undefined,
          },
          morphemes: (w.analysis?.morphemes || []).map((m, idx) => ({
            id: m.id || `${w.id}-morpheme-${idx + 1}`,
            morpheme: m.form,
            gloss: m.gloss,
          })),
          ipa: w.analysis?.phonetic || "",
          wiktionaryUrl: w.analysis?.wiktionaryUrl || "",
        })),
      })),
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to parse Master TeX file.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
