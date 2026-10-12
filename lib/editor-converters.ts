import type {
  TextDocument,
  ReadingSentence,
  InterlinearWord,
  Morpheme,
  PartOfSpeech,
  InflectionFeatures,
  NoteItem,
  ReviewMetadata,
  PassageBlock,
  LinguisticAnalysis,
} from "./types";
import { plainToTexGloss } from "../data/latex-export";
import { resolveOldEnglishLexicon } from "./old-english-lexicon";

export interface EditorToken {
  id: string;
  sourceForm: string;
  sourceGloss: string;
  literalTexGloss: string;
  lemma: string;
  pos: PartOfSpeech;
  explanation: string;
  inflections: InflectionFeatures;
  morphemes: Morpheme[];
  ipa: string;
  wiktionaryUrl: string;
  trailingPunctuation?: string;
  pronunciationSource?: string;
  historicalNote?: string;
  review?: ReviewMetadata;
}

export interface EditorSentence {
  id: string;
  tokens: EditorToken[];
  freeTranslation: string;
  footnotes?: string[];
  notes?: NoteItem[];
}

export interface EditorDocument {
  textId: string;
  slug: string;
  title: string;
  author: string;
  historicalAuthor?: string;
  glossedBy?: string;
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  date: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  language: "Old English";
  status: "draft" | "review" | "published";
  sentences: EditorSentence[];
  blocks?: PassageBlock[];
}

export function stripLatexFootnotes(text: string): string {
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

export function wordToEditorToken(w: InterlinearWord, sIdx: number, tIdx: number): EditorToken {
  const inflections = w.analysis?.features || {};
  const lex = resolveOldEnglishLexicon(w.originalWord, w.morphologicalGloss || w.originalWord);
  const resolvedLemma = w.analysis?.lemma || lex.lemma;
  const resolvedPos = (w.analysis?.partOfSpeech || lex.pos || "noun") as PartOfSpeech;
  const resolvedExpl =
    w.analysis?.definition !== undefined && w.analysis.definition !== ""
      ? w.analysis.definition
      : lex.definition || w.morphologicalGloss || "";
  const resolvedIpa = w.analysis?.phonetic || "";
  const resolvedWiktionary = w.analysis?.wiktionaryUrl || "";

  const rawMorphemes = w.analysis?.morphemes || [];
  const normalizedMorphemes: Morpheme[] = rawMorphemes.map((m) => {
    const res: Morpheme = {
      form: m.form || (m as unknown as { morpheme?: string }).morpheme || "",
      gloss: m.gloss || "",
    };
    if (m.id) res.id = m.id;
    if (m.kind) res.kind = m.kind;
    return res;
  });

  return {
    id: w.id || `sent-${sIdx + 1}-token-${tIdx + 1}`,
    sourceForm: `${w.originalWord}${w.trailingPunctuation || ""}`,
    sourceGloss: w.morphologicalGloss || w.originalWord,
    literalTexGloss: w.sourceGlossTex || w.morphologicalGloss || w.originalWord,
    lemma: resolvedLemma,
    pos: resolvedPos,
    explanation: resolvedExpl,
    inflections: { ...inflections },
    morphemes: normalizedMorphemes,
    ipa: resolvedIpa,
    wiktionaryUrl: resolvedWiktionary,
    trailingPunctuation: w.trailingPunctuation,
    pronunciationSource: w.analysis?.pronunciationSource,
    historicalNote: w.analysis?.historicalNote,
    review: w.review,
  };
}

export function textDocumentToEditorDoc(doc: TextDocument): EditorDocument {
  const rawAuthor = doc.author || (doc.source ? doc.source.split(/[·•]/)[0]?.trim() : "");
  const glossedByMatch =
    doc.glossedBy ||
    doc.editor ||
    (rawAuthor.includes("Alfred") || rawAuthor.includes("Anonymous")
      ? "Tyler Lemon"
      : rawAuthor.replace(/^(Translated and glossed by\s*)+/gi, "").trim());
  const dateMatch =
    doc.date || (doc.source ? doc.source.split(/[·•]/)[1]?.trim() : "");

  return {
    textId: doc.textId || "",
    slug: doc.slug || "",
    title: doc.title || "",
    author: glossedByMatch,
    historicalAuthor: doc.historicalAuthor || (doc.author?.includes("Alfred") ? doc.author : undefined),
    glossedBy: glossedByMatch,
    editor: doc.editor || glossedByMatch,
    shelfmark: doc.shelfmark,
    dialect: doc.dialect,
    historicalDate: doc.historicalDate,
    date: doc.date || dateMatch,
    source: doc.source || `${glossedByMatch} · ${dateMatch}`,
    sourceFile: doc.sourceFile || "",
    sourceEdition: doc.sourceEdition || undefined,
    language: "Old English",
    status: doc.status || "published",
    blocks: doc.blocks || [],
    sentences: (doc.sentences || []).map((sent: ReadingSentence, sIdx: number) => ({
      id: sent.id || `sent-${sIdx + 1}`,
      freeTranslation: sent.translation || "",
      footnotes: sent.footnotes,
      notes: sent.notes ? [...sent.notes] : undefined,
      tokens: (sent.words || []).map((w: InterlinearWord, tIdx: number) =>
        wordToEditorToken(w, sIdx, tIdx),
      ),
    })),
  };
}

export function editorDocToTextDocument(doc: EditorDocument): TextDocument {
  const resolvedAuthor = doc.author || doc.glossedBy;
  const result: TextDocument = {
    textId: doc.textId,
    slug: doc.slug,
    language: "Old English",
    author: resolvedAuthor,
    historicalAuthor: doc.historicalAuthor || undefined,
    glossedBy: doc.glossedBy || undefined,
    editor: doc.editor || undefined,
    shelfmark: doc.shelfmark || undefined,
    dialect: doc.dialect || undefined,
    historicalDate: doc.historicalDate || undefined,
    date: doc.date,
    title: doc.title,
    source: doc.source || (resolvedAuthor ? `${resolvedAuthor} · ${doc.date}` : doc.date),
    sourceFile: doc.sourceFile,
    sourceEdition: doc.sourceEdition || undefined,
    status: doc.status,
    sentences: doc.sentences.map((sent) => ({
      id: sent.id,
      translation: sent.freeTranslation,
      footnotes: sent.footnotes && sent.footnotes.length > 0 ? sent.footnotes : undefined,
      notes: sent.notes && sent.notes.length > 0 ? [...sent.notes] : undefined,
      words: sent.tokens.map((tok) => {
        const punctuationMatch = tok.sourceForm.match(/[.,;:!?]+$/);
        const originalCleanWord =
          tok.morphemes && tok.morphemes.length > 1
            ? tok.morphemes.map((m) => m.form).filter(Boolean).join("-")
            : tok.sourceForm.replace(/[.,;:!?]+$/, "");

        const sourceGlossVal =
          tok.morphemes && tok.morphemes.length > 1
            ? tok.morphemes.map((m) => m.gloss).filter(Boolean).join("-")
            : tok.sourceGloss || tok.sourceForm;

        const texGlossVal =
          tok.morphemes && tok.morphemes.length > 1
            ? tok.morphemes.map((m) => plainToTexGloss(m.gloss)).filter(Boolean).join("-")
            : tok.literalTexGloss || plainToTexGloss(tok.sourceGloss);

        const trailingPunctuation =
          tok.trailingPunctuation !== undefined
            ? tok.trailingPunctuation
            : punctuationMatch
            ? punctuationMatch[0]
            : undefined;

        const analysis: LinguisticAnalysis = {
          lemma: tok.lemma,
          partOfSpeech: tok.pos,
          features: { ...tok.inflections },
          morphemes: tok.morphemes.map((m) => {
            const res: Morpheme = { form: m.form, gloss: m.gloss };
            if (m.id) res.id = m.id;
            if (m.kind) res.kind = m.kind;
            return res;
          }),
          definition: tok.explanation,
          phonetic: tok.ipa || undefined,
          pronunciationSource: tok.pronunciationSource || undefined,
          historicalNote: tok.historicalNote || undefined,
          wiktionaryUrl: tok.wiktionaryUrl || undefined,
        };

        const word: InterlinearWord = {
          id: tok.id,
          originalWord: originalCleanWord,
          morphologicalGloss: sourceGlossVal,
          trailingPunctuation,
          sourceGlossTex: texGlossVal,
          analysis,
          review: tok.review,
        };
        return word;
      }),
    })),
    blocks: doc.blocks || [],
  };

  return result;
}
