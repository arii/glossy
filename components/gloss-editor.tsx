"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteNav } from "./site-nav";
import { exportToGb4eLatex, plainToTexGloss } from "../data/latex-export";
import { parseGb4e } from "../lib/gb4e";
import { resolveOldEnglishLexicon } from "../lib/old-english-lexicon";
import {
  BookOpen,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SlidersHorizontal,
  Upload,
  Download,
} from "lucide-react";

import { tokenizeAndLemmatizeSentence } from "../lib/lemmatizer";

// Definitions matching the exact schema requirements
interface Morpheme {
  id: string;
  morpheme: string;
  gloss: string;
}

interface Token {
  id: string;
  sourceForm: string; // token with potential punctuation (e.g. hlāforde,)
  sourceGloss: string; // readable leipzig gloss (e.g. lord.DAT.SG)
  literalTexGloss: string; // exact LaTeX gloss (e.g. lord.\textsc{dat.sg})
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
    declension?: string;
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

import type {
  TextDocument,
  ReadingSentence,
  InterlinearWord,
  Morpheme as LegacyMorpheme,
  PartOfSpeech,
  InflectionFeatures,
} from "../lib/types";

function mapLegacyTextDocToGlossDoc(legacyDoc: TextDocument): GlossDocument {
  const authorMatch = legacyDoc.author || (legacyDoc.source ? legacyDoc.source.split("·")[0]?.trim() : "Tyler Lemon");
  const dateMatch = legacyDoc.date || (legacyDoc.source ? legacyDoc.source.split("·")[1]?.trim() : "September 30, 2026");

  return {
    title: legacyDoc.title || "The voyages of Ohthere and Wulfstan",
    author: authorMatch,
    date: dateMatch,
    sentences: (legacyDoc.sentences || []).map((sent: ReadingSentence, sIdx: number) => ({
      id: sent.id || `sentence-${sIdx + 1}`,
      freeTranslation: sent.translation || "",
      tokens: (sent.words || []).map((w: InterlinearWord, tIdx: number) => {
        const inflections = w.analysis?.features || {};
        const lex = resolveOldEnglishLexicon(w.originalWord, w.morphologicalGloss || w.originalWord);
        const resolvedLemma = (w.analysis?.lemma && w.analysis.lemma !== w.originalWord) ? w.analysis.lemma : lex.lemma;
        const resolvedPos = w.analysis?.partOfSpeech || lex.pos || "noun";
        const resolvedExpl = (w.analysis?.definition && w.analysis.definition !== w.morphologicalGloss) ? w.analysis.definition : (lex.definition || w.morphologicalGloss || "");
        const resolvedIpa = w.analysis?.phonetic || lex.ipa || "";
        const resolvedWiktionary = w.analysis?.wiktionaryUrl || lex.wiktionaryUrl;

        return {
          id: w.id || `sentence-${sIdx + 1}-token-${tIdx + 1}`,
          sourceForm: `${w.originalWord}${w.trailingPunctuation || ""}`,
          sourceGloss: w.morphologicalGloss || w.originalWord,
          literalTexGloss: w.sourceGlossTex || w.morphologicalGloss || w.originalWord,
          lemma: resolvedLemma,
          pos: resolvedPos,
          explanation: resolvedExpl,
          inflections: {
            case: inflections.case,
            number: inflections.number,
            gender: inflections.gender,
            tense: inflections.tense,
            mood: inflections.mood,
            person: inflections.person ? String(inflections.person) : undefined,
            declension: (w.analysis?.features as Record<string, string | undefined>)?.declension,
          },
          morphemes: (w.analysis?.morphemes || []).map((m: LegacyMorpheme, mIdx: number) => ({
            id: `${w.id || "word"}-morpheme-${mIdx + 1}`,
            morpheme: m.form || "",
            gloss: m.gloss || "",
          })),
          ipa: resolvedIpa,
          wiktionaryUrl: resolvedWiktionary,
        };
      }),
    })),
  };
}

export function GlossEditor({
  initialDocument,
  availableTexts = [],
}: {
  initialDocument: TextDocument & { fileName?: string };
  availableTexts?: Array<{ slug: string; title: string }>;
}) {
  const router = useRouter();
  const [documentState, setDocumentState] = useState<GlossDocument>(() => mapLegacyTextDocToGlossDoc(initialDocument));
  const [activeSentenceId, setActiveSentenceId] = useState<string>(() => initialDocument.sentences?.[0]?.id || "");
  const [activeTokenId, setActiveTokenId] = useState<string>(() => initialDocument.sentences?.[0]?.words?.[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAllInflections, setShowAllInflections] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ kind: "idle" | "success" | "error"; message: string }>({
    kind: "idle",
    message: "",
  });
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [latexImportSource, setLatexImportSource] = useState("");
  const [importPreview, setImportPreview] = useState<Sentence[] | null>(null);

  // Backup snapshot for "Discard Changes" comparison
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(mapLegacyTextDocToGlossDoc(initialDocument)));

  const storageKey = `glossy_draft_${initialDocument.slug || initialDocument.textId || "ohthere"}`;

  // Ingest from API (/api/master-tex) helper
  const loadFromMasterTex = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (initialDocument.sourceFile) query.set("sourceFile", initialDocument.sourceFile);
      if (initialDocument.slug) query.set("slug", initialDocument.slug);
      
      const response = await fetch(`/api/master-tex?${query.toString()}`);
      if (!response.ok) {
        // Fallback to initialDocument directly if master TeX is not found
        const fallback = mapLegacyTextDocToGlossDoc(initialDocument);
        setDocumentState(fallback);
        const dataStr = JSON.stringify(fallback);
        setSavedSnapshot(dataStr);
        try { window.localStorage.setItem(storageKey, dataStr); } catch {}
        if (fallback.sentences.length > 0) {
          setActiveSentenceId(fallback.sentences[0].id);
          setActiveTokenId(fallback.sentences[0].tokens[0]?.id || "");
        }
        setSaveStatus({ kind: "success", message: "Loaded document directly from corpus definition!" });
        return;
      }

      const data = (await response.json()) as GlossDocument;
      
      setDocumentState(data);
      const dataStr = JSON.stringify(data);
      setSavedSnapshot(dataStr);
      try { window.localStorage.setItem(storageKey, dataStr); } catch {}

      if (data.sentences.length > 0) {
        setActiveSentenceId(data.sentences[0].id);
        setActiveTokenId(data.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({ kind: "success", message: "Successfully loaded document directly from Master TeX source!" });
    } catch (err) {
      setSaveStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "An error occurred while loading the TeX file.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialDocument, storageKey]);

  // Initial mount load sequence with robust stale-cache invalidation
  useEffect(() => {
    try {
      window.localStorage.removeItem("glossy_document_ohthere_full");
      window.localStorage.removeItem("glossy_document_ohthere_full_v2");
    } catch {}

    const expectedSentenceCount = initialDocument.sentences?.length ?? 0;
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as GlossDocument;
        if (!parsed.sentences || parsed.sentences.length !== expectedSentenceCount) {
          window.localStorage.removeItem(storageKey);
          const fresh = mapLegacyTextDocToGlossDoc(initialDocument);
          setDocumentState(fresh);
          setSavedSnapshot(JSON.stringify(fresh));
          if (fresh.sentences.length > 0) {
            setActiveSentenceId(fresh.sentences[0].id);
            setActiveTokenId(fresh.sentences[0].tokens[0]?.id || "");
          }
          return;
        }

        const sanitized: GlossDocument = {
          ...parsed,
          sentences: parsed.sentences.map((s) => ({
            ...s,
            freeTranslation: stripLatexFootnotes(s.freeTranslation)
              .replace(/\\(?:textit|textbf|textsc|emph)\{([^}]+)\}/g, "$1")
              .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, "$1")
              .replace(/\\url\{[^}]+\}/g, "")
              .replace(/^[`'‘"“\s]+|[`'’"”\}\s]+$/g, "")
              .replace(/\s+/g, " ")
              .trim(),
          })),
        };

        setDocumentState(sanitized);
        setSavedSnapshot(JSON.stringify(sanitized));
        if (sanitized.sentences.length > 0) {
          setActiveSentenceId(sanitized.sentences[0].id);
          setActiveTokenId(sanitized.sentences[0].tokens[0]?.id || "");
        }
      } catch {
        loadFromMasterTex();
      }
    } else {
      const initial = mapLegacyTextDocToGlossDoc(initialDocument);
      setDocumentState(initial);
      setSavedSnapshot(JSON.stringify(initial));
      if (initial.sentences.length > 0) {
        setActiveSentenceId(initial.sentences[0].id);
        setActiveTokenId(initial.sentences[0].tokens[0]?.id || "");
      }
    }
  }, [initialDocument, loadFromMasterTex, storageKey]);

  // Autosave to localStorage debounced at 300ms
  useEffect(() => {
    if (!documentState || isLoading) return;

    setAutosaveStatus("saving");
    const timer = window.setTimeout(() => {
      const serialized = JSON.stringify(documentState);
      try {
        window.localStorage.setItem(storageKey, serialized);
      } catch (e) {
        console.warn("LocalStorage quota exceeded, skipping local cache:", e);
      }
      setAutosaveStatus("saved");
    }, 300);

    return () => window.clearTimeout(timer);
  }, [documentState, isLoading, storageKey]);

  // Ingestion parsing function for multi-sentence gb4e input or plain Old English text
  const parseMultiSentenceGb4e = (rawInput: string): Sentence[] => {
    const isLatex = rawInput.includes("\\begin{exe}") || rawInput.includes("\\gll") || rawInput.includes("\\ex");
    if (isLatex) {
      const parsed = parseGb4e(rawInput);
      return parsed.sentences.map((sent, sIdx) => ({
        id: sent.id || `imported-sentence-${Date.now()}-${sIdx + 1}`,
        freeTranslation: sent.translation,
        tokens: sent.words.map((w, tIdx) => ({
          id: w.id || `imported-token-${Date.now()}-${tIdx + 1}`,
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
          morphemes: (w.analysis?.morphemes || []).map((m, mIdx) => ({
            id: m.id || `morpheme-${mIdx + 1}`,
            morpheme: m.form,
            gloss: m.gloss,
          })),
          ipa: w.analysis?.phonetic || "",
          wiktionaryUrl: w.analysis?.wiktionaryUrl || "",
        })),
      }));
    }

    const lines = rawInput.split("\n").map((l) => l.trim()).filter(Boolean);
    return lines.map((line, sIdx) => {
      const words = tokenizeAndLemmatizeSentence(line, sIdx + 1);
      return {
        id: `imported-sentence-${Date.now()}-${sIdx + 1}`,
        freeTranslation: `[Translation for appended sentence ${sIdx + 1}]`,
        tokens: words.map((w, tIdx) => ({
          id: `imported-token-${Date.now()}-${tIdx + 1}`,
          sourceForm: w.sourceForm,
          sourceGloss: w.sourceGloss,
          literalTexGloss: w.literalTexGloss,
          lemma: w.lemma,
          pos: w.pos,
          explanation: w.explanation,
          inflections: w.inflections ? {
            case: w.inflections.case,
            number: w.inflections.number,
            gender: w.inflections.gender,
            tense: w.inflections.tense,
            mood: w.inflections.mood,
            person: w.inflections.person ? String(w.inflections.person) : undefined,
          } : {},
          morphemes: w.morphemes || [],
          ipa: w.ipa || "",
          wiktionaryUrl: w.wiktionaryUrl,
        })),
      };
    });
  };

  const applyImportedSentences = () => {
    if (!importPreview || importPreview.length === 0) return;
    setDocumentState((prev) => ({
      ...prev,
      sentences: [...prev.sentences, ...importPreview],
    }));
    setSaveStatus({ kind: "success", message: `Successfully appended ${importPreview.length} sentences to the active document feed!` });
    setLatexImportSource("");
    setImportPreview(null);
  };

  // Find active sentence and active token
  const activeSentence = documentState?.sentences.find((s) => s.id === activeSentenceId);
  const activeToken = activeSentence?.tokens.find((t) => t.id === activeTokenId) || 
                      documentState?.sentences.flatMap(s => s.tokens).find((t) => t.id === activeTokenId);

  const currentIndex = documentState ? documentState.sentences.findIndex((s) => s.id === activeSentenceId) : -1;

  const handlePrev = () => {
    if (documentState && currentIndex > 0) {
      const prevSent = documentState.sentences[currentIndex - 1];
      setActiveSentenceId(prevSent.id);
      if (prevSent.tokens.length > 0) {
        setActiveTokenId(prevSent.tokens[0].id);
      }
    }
  };

  const handleNext = () => {
    if (documentState && currentIndex < documentState.sentences.length - 1) {
      const nextSent = documentState.sentences[currentIndex + 1];
      setActiveSentenceId(nextSent.id);
      if (nextSent.tokens.length > 0) {
        setActiveTokenId(nextSent.tokens[0].id);
      }
    }
  };

  // Update token function
  const updateToken = useCallback((patch: Partial<Token>) => {
    if (!activeTokenId) return;

    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((sent) => ({
        ...sent,
        tokens: sent.tokens.map((tok) => {
          if (tok.id === activeTokenId) {
            return {
              ...tok,
              ...patch,
              inflections: {
                ...tok.inflections,
                ...(patch.inflections ?? {}),
              },
            };
          }
          return tok;
        }),
      })),
    }));
  }, [activeTokenId]);

  // Update inflection feature helper
  const updateInflection = useCallback((key: keyof Token["inflections"], val: string | undefined) => {
    if (!activeTokenId) return;
    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((sent) => ({
        ...sent,
        tokens: sent.tokens.map((tok) => {
          if (tok.id === activeTokenId) {
            return {
              ...tok,
              inflections: {
                ...tok.inflections,
                [key]: val || undefined,
              },
            };
          }
          return tok;
        }),
      })),
    }));
  }, [activeTokenId]);

  // Discard changes to restore initial snapshot
  const discardChanges = () => {
    try {
      const parsed = JSON.parse(savedSnapshot) as GlossDocument;
      setDocumentState(parsed);
      if (parsed.sentences.length > 0) {
        setActiveSentenceId(parsed.sentences[0].id);
        setActiveTokenId(parsed.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({ kind: "success", message: "Edits successfully discarded. Reverted to previous save." });
    } catch {
      setSaveStatus({ kind: "error", message: "Failed to discard edits; saved state is invalid." });
    }
  };

  const mapToLegacyTextDocument = (doc: GlossDocument): TextDocument => {
    const rawDoc: TextDocument = {
      textId: initialDocument.textId || "ohthere",
      slug: initialDocument.slug || "ohthere-wulfstan",
      language: "Old English",
      author: doc.author,
      date: doc.date,
      title: doc.title,
      source: `${doc.author} · ${doc.date}`,
      sourceFile: initialDocument.sourceFile || "references/Voyages_of_Ohthere_Wulfstan.tex",
      status: "published",
      sentences: doc.sentences.map((sent) => ({
        id: sent.id,
        translation: sent.freeTranslation,
        words: sent.tokens.map((tok) => {
          const punctuationMatch = tok.sourceForm.match(/[.,;:!?]+$/);
          const originalCleanWord = (tok.morphemes && tok.morphemes.length > 1)
            ? tok.morphemes.map((m) => m.morpheme).filter(Boolean).join("-")
            : tok.sourceForm.replace(/[.,;:!?]+$/, "");
          
          const sourceGlossVal = (tok.morphemes && tok.morphemes.length > 1)
            ? tok.morphemes.map((m) => m.gloss).filter(Boolean).join("-")
            : (tok.sourceGloss || tok.sourceForm);

          const texGlossVal = (tok.morphemes && tok.morphemes.length > 1)
            ? tok.morphemes.map((m) => plainToTexGloss(m.gloss)).filter(Boolean).join("-")
            : (tok.literalTexGloss || plainToTexGloss(tok.sourceGloss));

          return {
            id: tok.id,
            originalWord: originalCleanWord,
            morphologicalGloss: sourceGlossVal,
            trailingPunctuation: punctuationMatch ? punctuationMatch[0] : undefined,
            sourceGlossTex: texGlossVal,
            analysis: {
              lemma: tok.lemma,
              partOfSpeech: (tok.pos || "noun") as PartOfSpeech,
              features: {
                case: tok.inflections.case as InflectionFeatures["case"],
                number: tok.inflections.number as InflectionFeatures["number"],
                gender: tok.inflections.gender as InflectionFeatures["gender"],
                tense: tok.inflections.tense as InflectionFeatures["tense"],
                mood: tok.inflections.mood as InflectionFeatures["mood"],
                person: tok.inflections.person ? (parseInt(String(tok.inflections.person), 10) as 1 | 2 | 3) : undefined,
              },
              morphemes: tok.morphemes.map((m) => ({
                id: m.id,
                form: m.morpheme,
                gloss: m.gloss,
              })),
              definition: tok.explanation,
              phonetic: tok.ipa,
              wiktionaryUrl: tok.wiktionaryUrl,
            },
          };
        }),
      })),
      blocks: [],
    };

    rawDoc.texSource = exportToGb4eLatex(rawDoc);
    return rawDoc;
  };

  const saveToTina = async () => {
    if (!documentState || isSaving) return;

    setIsSaving(true);
    setSaveStatus({ kind: "idle", message: "" });
    const legacyDoc = mapToLegacyTextDocument(documentState);

    try {
      const apiResponse = await fetch("/api/save-document", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: initialDocument.slug,
          fileName: initialDocument.fileName || "ohthere",
          document: legacyDoc,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "Failed to save document to server filesystem.");
      }

      try {
        await fetch(
          process.env.NEXT_PUBLIC_TINA_LOCAL_URL ?? "http://localhost:4001/graphql",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              query: `mutation UpdateText($relativePath: String!, $params: DocumentUpdateMutation!) {
                updateDocument(collection: "text", relativePath: $relativePath, params: $params) {
                  ... on Text { _sys { relativePath } }
                }
              }`,
              variables: {
                relativePath: `${initialDocument.fileName || "ohthere"}.json`,
                params: { text: legacyDoc },
              },
            }),
          },
        );
      } catch {}

      const serialized = JSON.stringify(documentState);
      setSavedSnapshot(serialized);
      setSaveStatus({
        kind: "success",
        message: `Saved document to master TeX source and TinaCMS repository successfully!`,
      });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The save operation failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportLatex = () => {
    if (!documentState) return;
    const legacyDoc = mapToLegacyTextDocument(documentState);
    const tex = exportToGb4eLatex(legacyDoc as unknown as TextDocument);
    
    const blob = new Blob([tex], { type: "application/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${initialDocument.fileName || "ohthere"}.tex`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const syncMorphemesAndToken = (newMorphemes: Morpheme[]) => {
    if (!activeToken) return;
    const punct = activeToken.sourceForm.match(/[,.;:!?]+$/)?.[0] || "";
    const forms = newMorphemes.map((m) => m.morpheme).filter(Boolean);
    const glosses = newMorphemes.map((m) => m.gloss).filter(Boolean);

    const newSourceForm = forms.length > 0 ? forms.join("-") + punct : activeToken.sourceForm;
    const newSourceGloss = glosses.length > 0 ? glosses.join("-") : activeToken.sourceGloss;
    const newLiteralTex = glosses.length > 0
      ? glosses.map((g) => plainToTexGloss(g)).join("-")
      : plainToTexGloss(activeToken.sourceGloss);

    updateToken({
      morphemes: newMorphemes,
      sourceForm: newSourceForm,
      sourceGloss: newSourceGloss,
      literalTexGloss: newLiteralTex,
    });
  };

  const handleSourceFormChange = (newVal: string) => {
    if (!activeToken) return;
    const punct = newVal.match(/[,.;:!?]+$/)?.[0] || "";
    const cleanWord = punct ? newVal.slice(0, -punct.length) : newVal;
    const parts = cleanWord.split("-").filter(Boolean);

    if (parts.length > 1) {
      const current = activeToken.morphemes || [];
      const updatedMorphemes: Morpheme[] = parts.map((part, idx) => ({
        id: current[idx]?.id || `${activeToken.id}-morpheme-${idx + 1}`,
        morpheme: part,
        gloss: current[idx]?.gloss || (idx === parts.length - 1 ? activeToken.sourceGloss : part),
      }));
      updateToken({
        sourceForm: newVal,
        morphemes: updatedMorphemes,
      });
    } else {
      updateToken({ sourceForm: newVal });
    }
  };

  const handleSourceGlossChange = (newVal: string) => {
    if (!activeToken) return;
    const parts = newVal.split("-").filter(Boolean);
    const current = activeToken.morphemes || [];
    if (parts.length > 1 && parts.length === current.length) {
      const updatedMorphemes: Morpheme[] = current.map((m, idx) => ({
        ...m,
        gloss: parts[idx] || m.gloss,
      }));
      updateToken({
        sourceGloss: newVal,
        literalTexGloss: parts.map((p) => plainToTexGloss(p)).join("-"),
        morphemes: updatedMorphemes,
      });
    } else {
      updateToken({
        sourceGloss: newVal,
        literalTexGloss: plainToTexGloss(newVal),
      });
    }
  };

  const addMorpheme = () => {
    if (!activeToken) return;
    const currentMorphemes = activeToken.morphemes || [];
    const newMorpheme: Morpheme = {
      id: `${activeTokenId}-morpheme-${currentMorphemes.length + 1}`,
      morpheme: "",
      gloss: "",
    };
    syncMorphemesAndToken([...currentMorphemes, newMorpheme]);
  };

  const updateMorphemeVal = (mIdx: number, field: "morpheme" | "gloss", val: string) => {
    if (!activeToken) return;
    const currentMorphemes = [...(activeToken.morphemes || [])];
    currentMorphemes[mIdx] = {
      ...currentMorphemes[mIdx],
      [field]: val,
    };
    syncMorphemesAndToken(currentMorphemes);
  };

  const removeMorpheme = (mIdx: number) => {
    if (!activeToken) return;
    const currentMorphemes = (activeToken.morphemes || []).filter((_, idx) => idx !== mIdx);
    syncMorphemesAndToken(currentMorphemes);
  };

  const filteredSentences = documentState?.sentences.filter((sent) => {
    if (!searchQuery) return true;
    const matchTranslation = sent.freeTranslation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchWord = sent.tokens.some((tok) => tok.sourceForm.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTranslation || matchWord;
  }) || [];

  // Determine relevant inflection features based on active POS
  const relevantFeatures = useMemo(() => {
    const pos = (activeToken?.pos || "noun").toLowerCase();
    if (showAllInflections) {
      return { case: true, number: true, gender: true, tense: true, mood: true, person: true, declension: true };
    }
    switch (pos) {
      case "noun":
      case "pronoun":
        return { case: true, number: true, gender: true, tense: false, mood: false, person: false, declension: false };
      case "verb":
        return { case: false, number: true, gender: false, tense: true, mood: true, person: true, declension: false };
      case "adjective":
        return { case: true, number: true, gender: true, tense: false, mood: false, person: false, declension: true };
      case "determiner":
      case "numeral":
        return { case: true, number: true, gender: true, tense: false, mood: false, person: false, declension: false };
      default:
        return { case: false, number: false, gender: false, tense: false, mood: false, person: false, declension: false };
    }
  }, [activeToken?.pos, showAllInflections]);

  if (isLoading || !documentState) {
    return (
      <main className="workspace-shell flex items-center justify-center min-h-[60vh] bg-stone-50">
        <div className="text-center p-8 bg-white border border-stone-200 rounded-xl shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-4" />
          <h2 className="text-stone-900 font-semibold text-lg">Ingesting Master LaTeX Glosses...</h2>
          <p className="text-stone-500 text-sm mt-1">Parsing Voyages_of_Ohthere_Wulfstan.tex working tree</p>
        </div>
      </main>
    );
  }

  // Clean, displayable form for the selected token header
  const cleanHeaderWord = activeToken?.sourceForm ? activeToken.sourceForm.replace(/[.,;:!?]+$/, "") : "";

  return (
    <main className="workspace-shell bg-[#fbf9f4] min-h-screen text-stone-900">
      <div className="workspace max-w-7xl mx-auto px-4 py-6">
        {/* Header card with site navigation & primary actions */}
        <header className="bg-white border border-stone-300/80 rounded-xl p-5 sm:p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <SiteNav current="edit" slug={initialDocument.slug} />
            <span className="sr-only">Editing workspace</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                Linguistic Editor
              </span>
              <span className="text-xs text-stone-500">
                {documentState.sentences.length} sentences · {documentState.sentences.reduce((acc, s) => acc + s.tokens.length, 0)} tokens
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 mt-1">
              {documentState.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Attribution: {documentState.author} · {documentState.date}
            </p>

            {availableTexts && availableTexts.length > 1 && (
              <div className="mt-3 flex items-center gap-2">
                <label htmlFor="editor-text-select" className="text-xs font-semibold text-stone-600">Switch corpus text:</label>
                <select
                  id="editor-text-select"
                  value={initialDocument.slug}
                  onChange={(e) => router.push(`/edit/${e.target.value}`)}
                  className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 font-medium text-stone-800 focus:outline-none focus:border-amber-800"
                >
                  {availableTexts.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Autosave badge */}
            {(autosaveStatus === "saved" || autosaveStatus === "saving") && (
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                autosaveStatus === "saved"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
              }`}>
                {autosaveStatus === "saved" ? "✓ Draft saved" : "Autosaving..."}
              </span>
            )}

            <Link
              href="/edit/new"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors flex items-center gap-1.5"
              title="Gloss a brand new Old English text from scratch"
            >
              <Plus className="w-3.5 h-3.5" /> New Text
            </Link>

            <button
              type="button"
              onClick={() => loadFromMasterTex()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 transition-colors flex items-center gap-1.5"
              title="Re-parse the raw .tex file and discard all local browser modifications"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload TeX
            </button>

            <button
              type="button"
              onClick={discardChanges}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-300 hover:bg-stone-200 transition-colors"
              title="Revert edits back to previous saved TinaCMS copy"
            >
              Discard edits
            </button>

            <button
              type="button"
              onClick={handleExportLatex}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-100/80 text-amber-950 border border-amber-300/80 hover:bg-amber-200 transition-colors flex items-center gap-1.5"
              title="Download compiled .tex document"
            >
              <Download className="w-3.5 h-3.5" /> Export LaTeX
            </button>

            <button
              type="button"
              onClick={saveToTina}
              disabled={isSaving}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? "Saving..." : "Save to TinaCMS"}
            </button>
          </div>
        </header>

        {/* Global Action Alerts */}
        {saveStatus.message && (
          <div className={`p-3.5 rounded-xl mb-6 text-xs font-medium border flex items-center justify-between ${
            saveStatus.kind === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : saveStatus.kind === "error"
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : "bg-stone-100 text-stone-800 border-stone-200"
          }`}>
            <p>{saveStatus.message}</p>
            <button
              type="button"
              onClick={() => setSaveStatus({ kind: "idle", message: "" })}
              className="text-stone-400 hover:text-stone-700 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* Sentence Navigation Quick Bar */}
        <section className="bg-white border border-stone-300/80 rounded-xl p-4 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
              Navigator
            </span>
            <strong className="text-xs text-stone-800">
              Sentence {currentIndex + 1} of {documentState.sentences.length}
            </strong>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={handlePrev}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <select
              value={activeSentenceId}
              onChange={(e) => {
                const sId = e.target.value;
                setActiveSentenceId(sId);
                const targetSent = documentState.sentences.find(s => s.id === sId);
                if (targetSent && targetSent.tokens.length > 0) {
                  setActiveTokenId(targetSent.tokens[0].id);
                }
              }}
              className="text-xs bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 font-medium text-stone-900 focus:outline-none focus:border-amber-800 flex-1 sm:flex-none"
            >
              {documentState.sentences.map((sent, index) => (
                <option key={sent.id} value={sent.id}>
                  Sentence {index + 1} ({sent.tokens.length} words)
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={currentIndex >= documentState.sentences.length - 1}
              onClick={handleNext}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* Main Workspace Layout (65/35 Split: Document Feed & Sticky Inspector) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Column: Live Preview & Document Feed (60-65% width) */}
          <section className="lg:col-span-7 xl:col-span-8 bg-white border border-stone-300/80 rounded-xl p-5 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100/80 text-amber-900 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900">
                    Live Preview &amp; Document Feed
                  </h2>
                  <p className="text-[11px] text-stone-500 font-sans">
                    Click any word token to load and inspect its morphological layers
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Filter by word or translation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-300 rounded-lg pl-3 pr-3 py-1.5 focus:outline-none focus:border-amber-800 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Scrollable Sentence Feed */}
            <div className="space-y-5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
              {filteredSentences.map((sent) => {
                const isSentActive = sent.id === activeSentenceId;
                const actualIndex = documentState.sentences.findIndex((s) => s.id === sent.id) + 1;

                return (
                  <div
                    key={sent.id}
                    onClick={() => setActiveSentenceId(sent.id)}
                    className={`p-5 rounded-xl border transition-all ${
                      isSentActive
                        ? "bg-[#fffdfa] border-amber-700/60 ring-1 ring-amber-700/20 shadow-md"
                        : "bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSentActive ? "bg-amber-800 text-white" : "bg-stone-100 text-stone-600"
                        }`}>
                          Sentence {actualIndex}
                        </span>
                        <span className="text-[11px] text-stone-600 font-medium">
                          {sent.tokens.length} tokens
                        </span>
                      </div>
                    </div>

                    {/* Word Tokens Grid Layout with custom word chips */}
                    <div className="flex flex-wrap gap-2.5 p-3.5 bg-stone-50/80 border border-stone-200/80 rounded-xl mb-4">
                      {sent.tokens.map((tok) => {
                        const isTokActive = tok.id === activeTokenId;
                        const isMultiMorpheme = tok.morphemes && tok.morphemes.length > 1;
                        return (
                          <button
                            key={tok.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSentenceId(sent.id);
                              setActiveTokenId(tok.id);
                            }}
                            className={`group inline-flex flex-col items-start px-3 py-2 rounded-lg border text-left transition-all ${
                              isTokActive
                                ? "bg-[#7b3f2a] text-white border-[#7b3f2a] shadow-sm scale-[1.02]"
                                : "bg-white text-stone-900 border-stone-300/80 hover:border-amber-700/60 hover:bg-amber-50/40"
                            }`}
                          >
                            <span className="text-sm font-semibold font-serif leading-tight">
                              {tok.sourceForm}
                            </span>
                            <span className={`text-[11px] font-sans font-bold uppercase tracking-wider mt-0.5 ${
                              isTokActive ? "text-amber-200" : "text-[#7b3f2a]"
                            }`}>
                              {tok.sourceGloss || tok.sourceForm}
                            </span>
                            {isMultiMorpheme && (
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold mt-1 ${
                                isTokActive ? "bg-amber-900/60 text-amber-100 border border-amber-700" : "bg-amber-100/80 text-amber-900 border border-amber-200"
                              }`}>
                                {tok.morphemes.length} morphs
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Free Translation Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                        Free English Translation
                      </label>
                      <textarea
                        rows={2}
                        value={sent.freeTranslation}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDocumentState((prev) => ({
                            ...prev,
                            sentences: prev.sentences.map((s) => {
                              if (s.id === sent.id) {
                                return { ...s, freeTranslation: val };
                              }
                              return s;
                            }),
                          }));
                        }}
                        placeholder="Enter sentence translation..."
                        className="w-full text-xs font-serif italic text-stone-800 bg-white border border-stone-300 rounded-lg p-2.5 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 leading-relaxed resize-vertical"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Sticky Selected Token Inspector (35-40% width) */}
          <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-6 space-y-4 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
            <div className={`bg-white border rounded-xl p-5 sm:p-6 shadow-sm transition-all ${
              activeToken
                ? "border-stone-300/90 border-l-4 border-l-[#7b3f2a]"
                : "border-stone-200"
            }`}>
              {/* Header with clean display */}
              <div className="pb-3 mb-4 border-b border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Selected Token Inspector
                  </span>
                  {activeToken && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      {activeToken.pos || "token"}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    {cleanHeaderWord || "No Token Selected"}
                  </h2>
                  {activeToken?.lemma && activeToken.lemma !== cleanHeaderWord && (
                    <span className="text-xs text-stone-500 font-sans italic">
                      &larr; lemma: <strong className="text-stone-700 font-semibold">{activeToken.lemma}</strong>
                    </span>
                  )}
                </div>
              </div>

              {activeToken ? (
                <div className="space-y-4 text-xs">
                  {/* 1. Core Source Form & Glosses */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Source Form (raw token)
                      </label>
                      <input
                        type="text"
                        value={activeToken.sourceForm}
                        onChange={(e) => handleSourceFormChange(e.target.value)}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-stone-900 font-serif focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Leipzig Gloss
                        </label>
                        <input
                          type="text"
                          value={activeToken.sourceGloss}
                          onChange={(e) => handleSourceGlossChange(e.target.value)}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-amber-900 font-bold uppercase tracking-wide focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Literal TeX Gloss
                        </label>
                        <input
                          type="text"
                          value={activeToken.literalTexGloss}
                          onChange={(e) => updateToken({ literalTexGloss: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs font-mono text-stone-800 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Lexical & Grammatical Properties */}
                  <div className="border-t border-stone-200/80 pt-3.5 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Canonical Lemma
                        </label>
                        <input
                          type="text"
                          value={activeToken.lemma}
                          onChange={(e) => updateToken({ lemma: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-stone-900 font-serif focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                          Part of Speech
                        </label>
                        <select
                          value={activeToken.pos}
                          onChange={(e) => updateToken({ pos: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs font-medium text-stone-900 focus:outline-none focus:border-amber-800 shadow-2xs"
                        >
                          <option value="noun">Noun</option>
                          <option value="verb">Verb</option>
                          <option value="adjective">Adjective</option>
                          <option value="adverb">Adverb</option>
                          <option value="pronoun">Pronoun</option>
                          <option value="determiner">Determiner</option>
                          <option value="numeral">Numeral</option>
                          <option value="preposition">Preposition</option>
                          <option value="conjunction">Conjunction</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Linguistic Explanation / Definition
                      </label>
                      <textarea
                        rows={2}
                        value={activeToken.explanation}
                        onChange={(e) => updateToken({ explanation: e.target.value })}
                        placeholder="Lexical gloss or definition..."
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-stone-800 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs leading-relaxed"
                      />
                    </div>

                    {/* De-cluttered Dynamic Inflections & Features */}
                    <div className="border border-stone-200/90 bg-stone-50/70 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-stone-200/80">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-700">
                          Active Inflections &amp; Features ({activeToken.pos || "unclassified"})
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAllInflections(!showAllInflections)}
                          className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          {showAllInflections ? "Show Relevant Only" : "Show All Fields"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {relevantFeatures.case && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Case
                            </label>
                            <select
                              value={activeToken.inflections.case || ""}
                              onChange={(e) => updateInflection("case", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="nominative">Nominative</option>
                              <option value="accusative">Accusative</option>
                              <option value="genitive">Genitive</option>
                              <option value="dative">Dative</option>
                              <option value="instrumental">Instrumental</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.number && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Number
                            </label>
                            <select
                              value={activeToken.inflections.number || ""}
                              onChange={(e) => updateInflection("number", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="singular">Singular</option>
                              <option value="plural">Plural</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.gender && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Gender
                            </label>
                            <select
                              value={activeToken.inflections.gender || ""}
                              onChange={(e) => updateInflection("gender", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="masculine">Masculine</option>
                              <option value="feminine">Feminine</option>
                              <option value="neuter">Neuter</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.tense && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Tense
                            </label>
                            <select
                              value={activeToken.inflections.tense || ""}
                              onChange={(e) => updateInflection("tense", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="present">Present</option>
                              <option value="past">Past (Preterite)</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.mood && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Mood
                            </label>
                            <select
                              value={activeToken.inflections.mood || ""}
                              onChange={(e) => updateInflection("mood", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="indicative">Indicative</option>
                              <option value="subjunctive">Subjunctive</option>
                              <option value="imperative">Imperative</option>
                              <option value="infinitive">Infinitive</option>
                              <option value="participle">Participle</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.person && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Person
                            </label>
                            <select
                              value={activeToken.inflections.person || ""}
                              onChange={(e) => updateInflection("person", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="1">1st Person</option>
                              <option value="2">2nd Person</option>
                              <option value="3">3rd Person</option>
                            </select>
                          </div>
                        )}

                        {relevantFeatures.declension && (
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-stone-500 mb-0.5">
                              Declension
                            </label>
                            <select
                              value={activeToken.inflections.declension || ""}
                              onChange={(e) => updateInflection("declension", e.target.value)}
                              className="w-full bg-white border border-stone-300 rounded-lg p-1.5 text-xs text-stone-900 focus:border-amber-800"
                            >
                              <option value="">None</option>
                              <option value="strong">Strong (Indefinite)</option>
                              <option value="weak">Weak (Definite)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Display active tags summary */}
                      {Object.values(activeToken.inflections).some(Boolean) && (
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-stone-200">
                          {Object.entries(activeToken.inflections)
                            .filter(([, v]) => Boolean(v))
                            .map(([k, v]) => (
                              <span key={k} className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-200">
                                {k}: {v}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Morphemes Interactive List Builder with Boxed Cells & Trash Icons */}
                  <div className="border-t border-stone-200/80 pt-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                        Morphemes Breakdown ({activeToken.morphemes?.length || 0})
                      </span>
                      <button
                        type="button"
                        onClick={addMorpheme}
                        className="text-[11px] text-amber-900 hover:text-amber-950 font-bold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      >
                        <Plus className="w-3 h-3" /> Add Morpheme
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(activeToken.morphemes || []).map((morpheme, idx) => (
                        <div
                          key={morpheme.id || idx}
                          className="p-2.5 bg-white border border-stone-300 rounded-xl shadow-2xs flex items-center gap-2 group hover:border-amber-700/60 transition-colors"
                        >
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                              Morpheme Segment
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. ġeār"
                              value={morpheme.morpheme}
                              onChange={(e) => updateMorphemeVal(idx, "morpheme", e.target.value)}
                              className="w-full border border-stone-200 rounded-md p-1.5 text-xs text-stone-900 font-serif focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-[9px] font-bold uppercase text-stone-400 mb-0.5">
                              Gloss / Tag
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. year"
                              value={morpheme.gloss}
                              onChange={(e) => updateMorphemeVal(idx, "gloss", e.target.value)}
                              className="w-full border border-stone-200 rounded-md p-1.5 text-xs text-stone-900 font-mono uppercase focus:outline-none focus:border-amber-800"
                            />
                          </div>

                          <div className="pt-3">
                            <button
                              type="button"
                              onClick={() => removeMorpheme(idx)}
                              className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove morpheme"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. IPA & Wiktionary Fields */}
                  <div className="border-t border-stone-200/80 pt-3.5 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        IPA Historical Pronunciation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. /ˈoːx.teː.re/"
                        value={activeToken.ipa}
                        onChange={(e) => updateToken({ ipa: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs font-mono text-stone-800 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-1">
                        Wiktionary External Reference URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://en.wiktionary.org/wiki/..."
                        value={activeToken.wiktionaryUrl}
                        onChange={(e) => updateToken({ wiktionaryUrl: e.target.value })}
                        className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs text-stone-800 focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* 5. Consolidate Duplicate Content -> Unified Dictionary & Reader Reference Card */}
                  <div className="border border-amber-200/90 bg-gradient-to-br from-amber-50/60 to-stone-50 rounded-xl p-4 shadow-2xs space-y-2 mt-4">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/70">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                        Reader Reference Preview
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Live Render</span>
                    </div>

                    <div>
                      <p className="text-stone-900 font-serif font-bold text-base flex items-baseline gap-2">
                        {activeToken.lemma || cleanHeaderWord}
                        <span className="text-xs font-sans text-stone-500 font-normal italic">
                          ({activeToken.pos || "unclassified"})
                        </span>
                      </p>
                      {activeToken.ipa && (
                        <p className="text-xs text-stone-600 font-mono mt-0.5">
                          {activeToken.ipa}
                        </p>
                      )}
                      <p className="text-xs text-stone-700 mt-1 leading-relaxed">
                        {activeToken.explanation || "No gloss definition set."}
                      </p>
                    </div>

                    {/* Morpheme & Inflection Chips */}
                    {activeToken.morphemes && activeToken.morphemes.length > 0 && (
                      <div className="pt-2 border-t border-amber-200/50">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Morpheme Alignment:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {activeToken.morphemes.map((m, mIdx) => (
                            <span key={m.id || mIdx} className="bg-white text-stone-800 px-2 py-0.5 rounded text-[10px] font-mono border border-stone-200 shadow-2xs">
                              {m.morpheme || "?"} <span className="text-amber-800 font-bold">&rarr;</span> {m.gloss || "?"}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeToken.wiktionaryUrl && (
                      <div className="pt-2 border-t border-amber-200/50 flex justify-end">
                        <a
                          href={activeToken.wiktionaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-amber-900 hover:text-amber-950 font-bold underline inline-flex items-center gap-1"
                        >
                          Open in Wiktionary <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 px-4 text-stone-500 space-y-2">
                  <BookOpen className="w-8 h-8 text-stone-400 mx-auto opacity-60" />
                  <p className="text-xs">
                    Select any word in the document feed on the left to inspect and customize its linguistic layers.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Multi-Sentence gb4e Batch Importer */}
        <section className="bg-white border border-stone-300/80 rounded-xl p-6 shadow-sm mt-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                Batch Import Pipeline
              </span>
              <h2 className="text-lg font-serif font-bold text-stone-900">
                Paste gb4e LaTeX Blocks or Plain Old English Text
              </h2>
            </div>

            <label className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg cursor-pointer border border-stone-300 font-semibold transition-colors flex items-center gap-1.5 shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-stone-600" />
              <span>Upload .tex file</span>
              <input
                type="file"
                accept=".tex,.txt"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text) {
                      setLatexImportSource(text);
                      setImportPreview(parseMultiSentenceGb4e(text));
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              value={latexImportSource}
              onChange={(e) => {
                setLatexImportSource(e.target.value);
                setImportPreview(null);
              }}
              placeholder="\ex{\gll Ōhthere sǣ-d-e his hlāforde ...\\&#10;Ohthere say-\textsc{pst}-\textsc{ind}3\textsc{sg} his lord ...\\&#10;\glt `Ohthere said to his lord...'}"
              className="w-full text-xs font-mono text-stone-900 bg-stone-50 border border-stone-300 rounded-xl p-3 focus:outline-none focus:border-amber-800 focus:bg-white transition-all shadow-inner"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                disabled={!latexImportSource.trim()}
                onClick={() => setImportPreview(parseMultiSentenceGb4e(latexImportSource))}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-800 border border-stone-300 rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                Preview Import
              </button>

              {importPreview && (
                <button
                  type="button"
                  onClick={applyImportedSentences}
                  className="px-4 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Apply {importPreview.length} sentences to document
                </button>
              )}
            </div>

            {importPreview && (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-center justify-between">
                <span>
                  Found <strong>{importPreview.length}</strong> sentences with <strong>{importPreview.reduce((acc, curr) => acc + curr.tokens.length, 0)}</strong> total tokens ready to append.
                </span>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
