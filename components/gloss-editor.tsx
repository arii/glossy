"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "./site-nav";
import { SentenceRow } from "./sentence-row";
import { PageHero } from "./page-hero";
import { SiteFooter } from "./site-footer";
import { exportToGb4eLatex, plainToTexGloss } from "../data/latex-export";
import { resolveOldEnglishLexicon } from "../lib/old-english-lexicon";
import { safeJsonStringify } from "../lib/safe-json";
import { isProtectedSlug } from "../lib/corpus-registry";
import {
  computeDocumentHash,
  deleteLocalDraft,
  getWorkspaceTexts,
  readDraft,
  writeDraft,
  type WorkspaceTextItem,
} from "../lib/local-drafts";
import type {
  TextDocument,
  ReadingSentence,
  InterlinearWord,
  Morpheme,
  PartOfSpeech,
  InflectionFeatures,
  NoteItem,
  NoteType,
  ReviewMetadata,
  PassageBlock,
  LinguisticAnalysis,
} from "../lib/types";
import {
  BookOpen,
  Edit,
  RefreshCw,
  Save,
  Trash2,
  FileText,
  X,
} from "lucide-react";
import { DraftSyncPrompt } from "./draft-sync-prompt";
import { isTinaAuthenticated } from "../lib/tina-sync";

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

export function GlossEditor({
  initialDocument,
  availableTexts = [],
}: {
  initialDocument: TextDocument & { fileName?: string };
  availableTexts?: Array<{ slug: string; title: string }>;
}) {
  const router = useRouter();
  const [documentState, setDocumentState] = useState<EditorDocument>(() =>
    textDocumentToEditorDoc(initialDocument),
  );
  const [activeSentenceId, setActiveSentenceId] = useState<string>(
    () => initialDocument.sentences?.[0]?.id || "",
  );
  const [activeTokenId, setActiveTokenId] = useState<string>(
    () => initialDocument.sentences?.[0]?.words?.[0]?.id || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    kind: "idle" | "success" | "error";
    message: string;
    details?: string;
  }>({
    kind: "idle",
    message: "",
  });
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);

  // Metadata modal form state
  const [metaTitle, setMetaTitle] = useState("");
  const [metaHistoricalAuthor, setMetaHistoricalAuthor] = useState("");
  const [metaGlossedBy, setMetaGlossedBy] = useState("");
  const [metaDate, setMetaDate] = useState("");
  const [metaSourceEdition, setMetaSourceEdition] = useState("");
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);

  const [workspaceTexts, setWorkspaceTexts] = useState<WorkspaceTextItem[]>(() =>
    getWorkspaceTexts({
      currentSlug: initialDocument.slug || initialDocument.textId,
      allLoadedTexts: availableTexts,
      excludeDeleted: true,
    }),
  );

  useEffect(() => {
    setWorkspaceTexts(
      getWorkspaceTexts({
        currentSlug: initialDocument.slug || initialDocument.textId,
        allLoadedTexts: availableTexts,
        excludeDeleted: true,
      }),
    );
  }, [initialDocument.slug, initialDocument.textId, availableTexts]);

  // Backup snapshot for "Discard Changes" comparison
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    safeJsonStringify(textDocumentToEditorDoc(initialDocument)),
  );

  const currentSlug = initialDocument.slug || initialDocument.textId || "";

  // Compute baseline hash from the normalized version of initialDocument
  const baselineHash = useMemo(() => {
    try {
      const normalized = editorDocToTextDocument(textDocumentToEditorDoc(initialDocument));
      return computeDocumentHash(normalized);
    } catch {
      return "";
    }
  }, [initialDocument]);

  // Restore from initial master document
  const loadFromMasterTex = useCallback(async () => {
    setIsLoading(true);
    try {
      const fallback = textDocumentToEditorDoc(initialDocument);
      setDocumentState(fallback);
      const dataStr = safeJsonStringify(fallback);
      setSavedSnapshot(dataStr);
      deleteLocalDraft(currentSlug);
      if (fallback.sentences.length > 0) {
        setActiveSentenceId(fallback.sentences[0].id);
        setActiveTokenId(fallback.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({ kind: "success", message: "Restored document to authoritative master edition!" });
    } catch (err) {
      setSaveStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "An error occurred while restoring the master edition.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [initialDocument, currentSlug]);

  // Initial mount load sequence with stale-cache invalidation
  useEffect(() => {
    const expectedSentenceCount = initialDocument.sentences?.length ?? 0;
    const stored = readDraft(currentSlug);

    if (stored?.doc) {
      try {
        const parsed = textDocumentToEditorDoc(stored.doc);
        if (!parsed.sentences || parsed.sentences.length !== expectedSentenceCount) {
          deleteLocalDraft(currentSlug);
          const fresh = textDocumentToEditorDoc(initialDocument);
          setDocumentState(fresh);
          setSavedSnapshot(safeJsonStringify(fresh));
          if (fresh.sentences.length > 0) {
            setActiveSentenceId(fresh.sentences[0].id);
            setActiveTokenId(fresh.sentences[0].tokens[0]?.id || "");
          }
          return;
        }

        const sanitized: EditorDocument = {
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
            tokens: (s.tokens || []).map((tok) => ({
              ...tok,
              morphemes: (tok.morphemes || []).map((m) => ({
                id: m.id,
                form: m.form || (m as unknown as { morpheme?: string }).morpheme || "",
                gloss: m.gloss || "",
                kind: m.kind,
              })),
            })),
          })),
        };

        setDocumentState(sanitized);
        setSavedSnapshot(safeJsonStringify(sanitized));
        if (sanitized.sentences.length > 0) {
          setActiveSentenceId(sanitized.sentences[0].id);
          setActiveTokenId(sanitized.sentences[0].tokens[0]?.id || "");
        }
      } catch {
        loadFromMasterTex();
      }
    } else {
      const initial = textDocumentToEditorDoc(initialDocument);
      setDocumentState(initial);
      setSavedSnapshot(safeJsonStringify(initial));
      if (initial.sentences.length > 0) {
        setActiveSentenceId(initial.sentences[0].id);
        setActiveTokenId(initial.sentences[0].tokens[0]?.id || "");
      }
    }
  }, [initialDocument, loadFromMasterTex, currentSlug]);

  // Autosave to localStorage debounced at 300ms
  useEffect(() => {
    if (!documentState || isLoading) return;

    // Skip autosaving if no edits have actually been made compared to the baseline master edition
    const currentDoc = editorDocToTextDocument(documentState);
    const currentHash = computeDocumentHash(currentDoc);

    if (currentHash === baselineHash) {
      deleteLocalDraft(currentSlug);
      setAutosaveStatus("idle");
      return;
    }

    const currentStr = safeJsonStringify(documentState);
    if (currentStr === savedSnapshot) {
      setAutosaveStatus("idle");
      return;
    }

    setAutosaveStatus("saving");
    const timer = window.setTimeout(() => {
      const res = writeDraft(documentState.slug || currentSlug, currentDoc);
      if (!res.ok) {
        if (res.reason === "quota") {
          setSaveStatus({
            kind: "error",
            message: res.message,
          });
        }
        setAutosaveStatus("idle");
      } else {
        setAutosaveStatus("saved");
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [documentState, isLoading, currentSlug, savedSnapshot, baselineHash]);

  // Find active sentence and active token
  const activeSentence = documentState?.sentences.find((s) => s.id === activeSentenceId);
  const activeToken =
    activeSentence?.tokens.find((t) => t.id === activeTokenId) ||
    documentState?.sentences.flatMap((s) => s.tokens).find((t) => t.id === activeTokenId);


  const currentIndex = documentState
    ? documentState.sentences.findIndex((s) => s.id === activeSentenceId)
    : -1;

  const addNoteToSentence = useCallback((sentenceId: string, targetWordIndex?: number) => {
    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((sent) => {
        if (sent.id !== sentenceId) return sent;
        const currentNotes = sent.notes || [];
        const noteNumber = currentNotes.length + 1;
        const newNote: NoteItem = {
          id: `fn-${sentenceId}-${Date.now()}-${noteNumber}`,
          targetWordIndex,
          marker: String(noteNumber),
          type: "manuscript_variant",
          text: "",
        };
        return {
          ...sent,
          notes: [...currentNotes, newNote],
        };
      }),
    }));
  }, []);

  const updateSentenceNote = useCallback((sentenceId: string, noteId: string, patch: Partial<NoteItem>) => {
    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((sent) => {
        if (sent.id !== sentenceId) return sent;
        return {
          ...sent,
          notes: (sent.notes || []).map((n) => (n.id === noteId ? { ...n, ...patch } : n)),
        };
      }),
    }));
  }, []);

  const removeSentenceNote = useCallback((sentenceId: string, noteId: string) => {
    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((sent) => {
        if (sent.id !== sentenceId) return sent;
        return {
          ...sent,
          notes: (sent.notes || []).filter((n) => n.id !== noteId),
        };
      }),
    }));
  }, []);

  const scrollToSentenceCard = useCallback((sentenceId: string) => {
    if (typeof window === "undefined") return;
    const el = window.document.getElementById(`editor-sentence-${sentenceId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const handlePrev = () => {
    if (documentState && currentIndex > 0) {
      const prevSent = documentState.sentences[currentIndex - 1];
      setActiveSentenceId(prevSent.id);
      if (prevSent.tokens.length > 0) {
        setActiveTokenId(prevSent.tokens[0].id);
      }
      scrollToSentenceCard(prevSent.id);
    }
  };

  const handleNext = () => {
    if (documentState && currentIndex < documentState.sentences.length - 1) {
      const nextSent = documentState.sentences[currentIndex + 1];
      setActiveSentenceId(nextSent.id);
      if (nextSent.tokens.length > 0) {
        setActiveTokenId(nextSent.tokens[0].id);
      }
      scrollToSentenceCard(nextSent.id);
    }
  };

  // Update token function
  const updateToken = useCallback(
    (patch: Partial<EditorToken>) => {
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
    },
    [activeTokenId],
  );

  // Update inflection feature helper
  const updateInflection = useCallback(
    (key: keyof InflectionFeatures, val: string | number | undefined) => {
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
    },
    [activeTokenId],
  );

  // Open metadata editing modal initialized with current state
  const handleOpenMetadataModal = () => {
    setMetaTitle(documentState.title || "");
    setMetaHistoricalAuthor(documentState.historicalAuthor || "Anonymous");
    setMetaGlossedBy(documentState.glossedBy || documentState.editor || "");
    setMetaDate(documentState.date || "");
    setMetaSourceEdition(documentState.sourceEdition || documentState.shelfmark || "");
    setIsEditingMetadata(true);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTitle = metaTitle.trim() || documentState.title;
    const updatedHistAuthor = metaHistoricalAuthor.trim() || "Anonymous";
    const updatedGlossedBy = metaGlossedBy.trim() || "";
    const updatedDate = metaDate.trim() || documentState.date;
    const updatedSourceEdition = metaSourceEdition.trim();

    setDocumentState((prev) => ({
      ...prev,
      title: updatedTitle,
      author: updatedGlossedBy,
      historicalAuthor: updatedHistAuthor,
      glossedBy: updatedGlossedBy,
      editor: updatedGlossedBy,
      date: updatedDate,
      sourceEdition: updatedSourceEdition,
      shelfmark: updatedSourceEdition || prev.shelfmark,
      source: `${updatedGlossedBy} · ${updatedDate}`,
    }));

    setIsEditingMetadata(false);
  };

  // Discard changes to restore initial snapshot and completely remove draft
  const discardChanges = () => {
    try {
      const fallback = textDocumentToEditorDoc(initialDocument);
      setDocumentState(fallback);
      setSavedSnapshot(safeJsonStringify(fallback));

      deleteLocalDraft(currentSlug);

      if (fallback.sentences.length > 0) {
        setActiveSentenceId(fallback.sentences[0].id);
        setActiveTokenId(fallback.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({
        kind: "success",
        message: "All local edits discarded. Reverted completely to the authoritative master edition.",
      });
      setAutosaveStatus("idle");
    } catch {
      setSaveStatus({
        kind: "error",
        message: "Failed to discard edits.",
      });
    }
  };

  const saveToTina = async () => {
    if (!documentState || isSaving) return;

    setIsSaving(true);
    setSaveStatus({ kind: "idle", message: "" });
    const textDoc = editorDocToTextDocument(documentState);
    const targetSlug = textDoc.slug || currentSlug;

    try {
      const res = writeDraft(targetSlug, textDoc);
      if (!res.ok) {
        setSaveStatus({
          kind: "error",
          message: res.error || res.message || "Failed to save local draft.",
        });
      } else {
        const serialized = safeJsonStringify(documentState);
        setSavedSnapshot(serialized);
        setShowSyncPrompt(true);
        setSaveStatus({
          kind: "success",
          message: `Saved working draft to browser storage. ${
            isTinaAuthenticated()
              ? 'Click "Commit Draft to Git" in the prompt below to publish your changes.'
              : "Sign in to Tina Admin to commit your changes to Git."
          }`,
        });
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "The save operation failed.";
      setSaveStatus({
        kind: "error",
        message: errMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    if (!documentState) return;
    const legacyDoc = editorDocToTextDocument(documentState);
    const jsonStr = safeJsonStringify(legacyDoc, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${initialDocument.fileName || initialDocument.textId || ""}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExportLatex = () => {
    if (!documentState) return;
    const legacyDoc = editorDocToTextDocument(documentState);
    const tex = exportToGb4eLatex(legacyDoc);

    const blob = new Blob([tex], { type: "application/x-tex;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${initialDocument.fileName || initialDocument.textId || ""}.tex`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const isProtectedText = isProtectedSlug(
    initialDocument.slug || initialDocument.textId || initialDocument.fileName || ""
  );

  const handleDeleteText = async () => {
    if (isProtectedText) return;
    setIsDeleting(true);
    try {
      if (currentSlug) {
        deleteLocalDraft(currentSlug);
      }

      router.push("/");
    } catch (err) {
      setSaveStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Failed to delete text.",
      });
      setIsDeleting(false);
    }
  };

  const syncMorphemesAndToken = (newMorphemes: Morpheme[]) => {
    if (!activeToken) return;
    const punct = activeToken.sourceForm.match(/[,.;:!?]+$/)?.[0] || "";
    const forms = newMorphemes.map((m) => m.form).filter(Boolean);
    const glosses = newMorphemes.map((m) => m.gloss).filter(Boolean);

    const newSourceForm = forms.length > 0 ? forms.join("-") + punct : activeToken.sourceForm;
    const newSourceGloss = glosses.length > 0 ? glosses.join("-") : activeToken.sourceGloss;
    const newLiteralTex =
      glosses.length > 0
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
        form: part,
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
    if (currentMorphemes.length <= 1) {
      const cleanWord = activeToken.sourceForm.replace(/[,.;:!?]+$/, "");
      const newMorpheme1: Morpheme = {
        id: `${activeTokenId}-morpheme-1`,
        form: currentMorphemes[0]?.form || cleanWord,
        gloss: currentMorphemes[0]?.gloss || activeToken.sourceGloss,
      };
      const newMorpheme2: Morpheme = {
        id: `${activeTokenId}-morpheme-2`,
        form: "",
        gloss: "",
      };
      syncMorphemesAndToken([newMorpheme1, newMorpheme2]);
    } else {
      const newMorpheme: Morpheme = {
        id: `${activeTokenId}-morpheme-${currentMorphemes.length + 1}`,
        form: "",
        gloss: "",
      };
      syncMorphemesAndToken([...currentMorphemes, newMorpheme]);
    }
  };

  const updateMorphemeVal = (mIdx: number, field: "form" | "gloss", val: string) => {
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


  const updateFreeTranslation = useCallback((sentId: string, val: string) => {
    setDocumentState((prev) => ({
      ...prev,
      sentences: prev.sentences.map((s) => {
        if (s.id === sentId) {
          return { ...s, freeTranslation: val };
        }
        return s;
      }),
    }));
  }, []);

  const filteredSentences =
    documentState?.sentences.filter((sent) => {
      if (!searchQuery) return true;
      const matchTranslation = sent.freeTranslation
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchWord = sent.tokens.some((tok) =>
        tok.sourceForm.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return matchTranslation || matchWord;
    }) || [];

  if (isLoading || !documentState) {
    return (
      <main className="workspace-shell flex items-center justify-center min-h-[60vh] bg-stone-50">
        <div className="text-center p-8 bg-white border border-stone-200 rounded-lg shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-4" />
          <h2 className="text-stone-900 font-semibold text-lg">Ingesting Master LaTeX Glosses...</h2>
          <p className="text-stone-500 text-sm mt-1">
            Parsing {initialDocument.sourceFile || "manuscript.tex"} working tree
          </p>
        </div>
      </main>
    );
  }


  // Clean, displayable form for the selected token header
  const cleanHeaderWord = activeToken?.sourceForm
    ? activeToken.sourceForm.replace(/[.,;:!?]+$/, "")
    : "";

  return (
    <>
      <SiteNav current="edit" slug={initialDocument.slug} />
      <main className="site-shell">
        {/* Header with Workspace Actions */}
        <PageHero
          eyebrow="Editing workspace"
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span>{documentState.title}</span>
              <button
                type="button"
                onClick={handleOpenMetadataModal}
                className="workspace-link"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.25rem 0.6rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  borderColor: "var(--rule)",
                  background: "#fbf7ee",
                }}
                title="Edit document title, author, date, and manuscript shelfmark"
              >
                <Edit style={{ width: "0.85rem", height: "0.85rem" }} />
                Edit Details
              </button>
            </div>
          }
          description={
            <div>
              <p className="source-line" style={{ margin: 0 }}>
                {documentState.historicalAuthor && (
                  <span style={{ fontWeight: 600, marginRight: "0.4rem" }}>
                    [{documentState.historicalAuthor}{documentState.historicalDate ? `, ${documentState.historicalDate}` : ""}]
                  </span>
                )}
                Translated and glossed by {documentState.glossedBy || documentState.author || ""} · {documentState.date}
              </p>
              {(documentState.sourceEdition || documentState.shelfmark) && (
                <p style={{ margin: "0.15rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)" }}>
                  Witness / Shelfmark: {documentState.sourceEdition || documentState.shelfmark}
                </p>
              )}
            </div>
          }
          actions={
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center", width: "100%", justifyContent: "space-between" }}>
              {workspaceTexts && workspaceTexts.length > 1 && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label htmlFor="editor-text-select" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Switch text:
                  </label>
                  <select
                    id="editor-text-select"
                    value={initialDocument.slug}
                    onChange={(e) => router.push(`/edit/${e.target.value}`)}
                    style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem", border: "1px solid var(--rule)", borderRadius: "0.25rem", background: "var(--surface)", color: "var(--ink)" }}
                  >
                    {workspaceTexts.map((t) => (
                      <option key={t.slug} value={t.slug}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="workspace-actions" style={{ marginLeft: "auto" }}>
                {(autosaveStatus === "saved" || autosaveStatus === "saving") && (
                  <span className={`editor-dirty ${autosaveStatus === "saved" ? "is-clean" : "is-dirty"}`}>
                    {autosaveStatus === "saved" ? "✓ Draft saved" : "Autosaving..."}
                  </span>
                )}

                <div className="workspace-action-grid">
                  <button
                    type="button"
                    onClick={discardChanges}
                    className="workspace-link"
                  >
                    Discard edits
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="workspace-link"
                    title="Download complete JSON document"
                  >
                    Export JSON
                  </button>

                  <button
                    type="button"
                    onClick={handleExportLatex}
                    className="workspace-link workspace-link-latex"
                    title="Download gb4e LaTeX file"
                  >
                    Export LaTeX
                  </button>

                  {!isProtectedText && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to remove "${documentState.title}" from Glossy? This will delete its JSON data, LaTeX files, and local drafts.`,
                          )
                        ) {
                          handleDeleteText();
                        }
                      }}
                      disabled={isDeleting}
                      className="workspace-link workspace-link-danger"
                    >
                      <Trash2 style={{ width: "0.85rem", height: "0.85rem", marginRight: "0.35rem" }} />
                      {isDeleting ? "Deleting..." : "Delete Text"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={saveToTina}
                    disabled={isSaving}
                    className="workspace-button workspace-button-primary"
                    title="Save working draft to browser storage (and sync to Git if connected)"
                  >
                    <Save style={{ width: "0.9rem", height: "0.9rem", marginRight: "0.35rem" }} />
                    {isSaving ? "Saving..." : "Save draft"}
                  </button>
                </div>
              </div>
            </div>
          }
        />

        {/* Global Action Alerts */}
        {saveStatus.message && (
          <div
            className={`editor-save-status ${
              saveStatus.kind === "success"
                ? "is-success"
                : saveStatus.kind === "error"
                ? "is-error"
                : ""
            }`}
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
              <p style={{ margin: 0, fontWeight: 500 }}>{saveStatus.message}</p>
              {saveStatus.kind === "error" && saveStatus.details && (
                <button
                  type="button"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    try {
                      await navigator.clipboard.writeText(saveStatus.details || saveStatus.message);
                      btn.textContent = "✓ Copied Error Details";
                      setTimeout(() => {
                        btn.textContent = "📋 Copy Error Details";
                      }, 2500);
                    } catch {
                      btn.textContent = "Select Below (Ctrl+C)";
                    }
                  }}
                  style={{
                    background: "rgba(185, 28, 28, 0.15)",
                    color: "#b91c1c",
                    border: "1px solid #f87171",
                    borderRadius: "0.25rem",
                    padding: "0.25rem 0.6rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  📋 Copy Error Details
                </button>
              )}
            </div>
            {saveStatus.kind === "error" && saveStatus.details && (
              <pre
                style={{
                  userSelect: "text",
                  WebkitUserSelect: "text",
                  margin: 0,
                  padding: "0.6rem 0.8rem",
                  background: "rgba(0, 0, 0, 0.05)",
                  color: "#991b1b",
                  borderRadius: "0.375rem",
                  fontSize: "0.75rem",
                  lineHeight: 1.4,
                  maxHeight: "8rem",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  border: "1px solid rgba(185, 28, 28, 0.2)",
                }}
              >
                {saveStatus.details}
              </pre>
            )}
          </div>
        )}

        {/* Top Sentence Navigator Bar (matching original screenshot) */}
        <section className="editor-nav-box" style={{ marginTop: "1.5rem" }}>
          <div>
            <p className="workspace-eyebrow" style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              SENTENCE NAVIGATOR
            </p>
            <strong style={{ fontSize: "1.2rem", fontFamily: "'Charis SIL', 'Noto Serif', Georgia, serif", color: "var(--ink)", fontWeight: 700 }}>
              {documentState.sentences.length} sentences loaded
            </strong>
          </div>

          <div className="editor-nav-controls">
            <button
              type="button"
              disabled={currentIndex <= 0}
              onClick={handlePrev}
              className="editor-nav-btn"
            >
              ← Prev
            </button>

            <select
              value={activeSentenceId}
              onChange={(e) => {
                const sId = e.target.value;
                setActiveSentenceId(sId);
                const targetSent = documentState.sentences.find((s) => s.id === sId);
                if (targetSent && targetSent.tokens.length > 0) {
                  setActiveTokenId(targetSent.tokens[0].id);
                }
                scrollToSentenceCard(sId);
              }}
            >
              {documentState.sentences.map((sent, index) => (
                <option key={sent.id} value={sent.id}>
                  Sentence {index + 1}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={currentIndex >= documentState.sentences.length - 1}
              onClick={handleNext}
              className="editor-nav-btn"
            >
              Next →
            </button>
          </div>
        </section>

        {/* Main Grid: Document Feed & Selected Token Inspector */}
        <div className="workspace-grid">
          {/* Left Column: Live Preview & Document Feed */}
          <section className="workspace-panel">
            <div className="editor-feed-header">
              <h2>
                <BookOpen style={{ width: "1.15rem", height: "1.15rem", display: "inline-block" }} />
                <span>Live preview &amp; document feed</span>
              </h2>
              <input
                type="text"
                placeholder="Filter by word or transla..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="editor-search-input"
              />
            </div>

            <div style={{ maxHeight: "calc(100vh - 16rem)", overflowY: "auto", paddingRight: "0.4rem" }}>
              {filteredSentences.map((sent) => {
                const isSentActive = sent.id === activeSentenceId;
                const actualIndex =
                  documentState.sentences.findIndex((s) => s.id === sent.id) + 1;
                return (
                  <SentenceRow
                    key={sent.id}
                    sent={sent}
                    isSentActive={isSentActive}
                    actualIndex={actualIndex}
                    activeTokenId={activeTokenId}
                    setActiveSentenceId={setActiveSentenceId}
                    setActiveTokenId={setActiveTokenId}
                    addNoteToSentence={addNoteToSentence}
                    updateFreeTranslation={updateFreeTranslation}
                  />
                );
              })}
            </div>
          </section>
          {/* Right Column: Selected Token Inspector */}
          <aside className="editor-inspector-card">
            <div className="editor-inspector-header">
              <h2 className="workspace-eyebrow" style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Selected Token Inspector
              </h2>
            </div>

            {activeToken ? (
              <div>
                {/* 1. Source form (raw token) */}
                <div className="editor-form-group">
                  <label>Source form (raw token)</label>
                  <input
                    type="text"
                    value={activeToken.sourceForm}
                    onChange={(e) => handleSourceFormChange(e.target.value)}
                  />
                </div>

                {/* 2. Readable Leipzig Gloss */}
                <div className="editor-form-group">
                  <label>Readable Leipzig Gloss</label>
                  <input
                    type="text"
                    value={activeToken.sourceGloss}
                    onChange={(e) => handleSourceGlossChange(e.target.value)}
                  />
                </div>

                {/* 3. Literal TeX Gloss */}
                <div className="editor-form-group">
                  <label>Literal TeX Gloss</label>
                  <input
                    type="text"
                    style={{ fontFamily: "monospace" }}
                    value={activeToken.literalTexGloss}
                    onChange={(e) => updateToken({ literalTexGloss: e.target.value })}
                  />
                </div>

                {/* 4. Lemma & Part of Speech */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div className="editor-form-group">
                    <label>Lemma</label>
                    <input
                      type="text"
                      value={activeToken.lemma}
                      onChange={(e) => updateToken({ lemma: e.target.value })}
                    />
                  </div>

                  <div className="editor-form-group">
                    <label>Part of Speech</label>
                    <select
                      value={activeToken.pos}
                      onChange={(e) =>
                        updateToken({ pos: e.target.value as PartOfSpeech })
                      }
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
                      <option value="interjection">Interjection</option>
                    </select>
                  </div>
                </div>

                {/* 5. Explanation */}
                <div className="editor-form-group">
                  <label>Explanation</label>
                  <textarea
                    rows={2}
                    value={activeToken.explanation}
                    onChange={(e) => updateToken({ explanation: e.target.value })}
                  />
                </div>

                {/* 6. Inflections & Features */}
                <fieldset className="editor-fieldset">
                  <legend>Inflections &amp; Features</legend>
                  <div className="editor-features-grid">
                    <div>
                      <label>Case</label>
                      <select
                        value={activeToken.inflections.case || ""}
                        onChange={(e) =>
                          updateInflection(
                            "case",
                            e.target.value as InflectionFeatures["case"],
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="nominative">Nominative</option>
                        <option value="accusative">Accusative</option>
                        <option value="genitive">Genitive</option>
                        <option value="dative">Dative</option>
                        <option value="instrumental">Instrumental</option>
                      </select>
                    </div>

                    <div>
                      <label>Number</label>
                      <select
                        value={activeToken.inflections.number || ""}
                        onChange={(e) =>
                          updateInflection(
                            "number",
                            e.target.value as InflectionFeatures["number"],
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="singular">Singular</option>
                        <option value="plural">Plural</option>
                        <option value="dual">Dual</option>
                      </select>
                    </div>

                    <div>
                      <label>Gender</label>
                      <select
                        value={activeToken.inflections.gender || ""}
                        onChange={(e) =>
                          updateInflection(
                            "gender",
                            e.target.value as InflectionFeatures["gender"],
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="masculine">Masculine</option>
                        <option value="feminine">Feminine</option>
                        <option value="neuter">Neuter</option>
                      </select>
                    </div>

                    <div>
                      <label>Tense</label>
                      <select
                        value={activeToken.inflections.tense || ""}
                        onChange={(e) =>
                          updateInflection(
                            "tense",
                            e.target.value as InflectionFeatures["tense"],
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="present">Present</option>
                        <option value="past">Past</option>
                      </select>
                    </div>

                    <div>
                      <label>Mood</label>
                      <select
                        value={activeToken.inflections.mood || ""}
                        onChange={(e) =>
                          updateInflection(
                            "mood",
                            e.target.value as InflectionFeatures["mood"],
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="indicative">Indicative</option>
                        <option value="subjunctive">Subjunctive</option>
                        <option value="imperative">Imperative</option>
                        <option value="infinitive">Infinitive</option>
                      </select>
                    </div>

                    <div>
                      <label>Person</label>
                      <select
                        value={activeToken.inflections.person ? String(activeToken.inflections.person) : ""}
                        onChange={(e) =>
                          updateInflection(
                            "person",
                            e.target.value ? (parseInt(e.target.value, 10) as 1 | 2 | 3) : undefined,
                          )
                        }
                      >
                        <option value="">None</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* 7. Morphemes Breakdown */}
                <div className="editor-form-group">
                  <label>
                    Morphemes Breakdown {activeToken.morphemes && activeToken.morphemes.length > 1 ? `(${activeToken.morphemes.length})` : ""}
                  </label>
                  <div>
                    {activeToken.morphemes && activeToken.morphemes.length > 1 && (
                      activeToken.morphemes.map((morpheme, idx) => (
                        <div key={morpheme.id || idx} style={{ marginBottom: "0.6rem" }}>
                          <div className="morpheme-row">
                            <input
                              type="text"
                              placeholder="form"
                              value={morpheme.form}
                              onChange={(e) => updateMorphemeVal(idx, "form", e.target.value)}
                            />
                            <input
                              type="text"
                              placeholder="gloss"
                              value={morpheme.gloss}
                              onChange={(e) => updateMorphemeVal(idx, "gloss", e.target.value)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMorpheme(idx)}
                            className="morpheme-remove-btn"
                            title="Remove morpheme"
                          >
                            ✕
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addMorpheme}
                    className="add-morpheme-btn"
                  >
                    + Add Morpheme
                  </button>
                </div>

                {/* 8. IPA Pronunciation */}
                <div className="editor-form-group">
                  <label>IPA Pronunciation</label>
                  <input
                    type="text"
                    placeholder="e.g. /ˈoːx.teː.re/"
                    value={activeToken.ipa}
                    onChange={(e) => updateToken({ ipa: e.target.value })}
                  />
                </div>

                {/* 9. Wiktionary URL */}
                <div className="editor-form-group">
                  <label>Wiktionary URL</label>
                  <input
                    type="url"
                    placeholder="https://en.wiktionary.org/wiki/..."
                    value={activeToken.wiktionaryUrl}
                    onChange={(e) => updateToken({ wiktionaryUrl: e.target.value })}
                  />
                </div>

                {/* 10. Sentence Footnotes / Critical Apparatus */}
                <fieldset className="editor-fieldset" style={{ marginTop: "1rem" }}>
                  <legend style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <FileText style={{ width: "0.85rem", height: "0.85rem", color: "var(--accent)" }} />
                    <span>Sentence Footnotes / Critical Apparatus ({activeSentence?.notes?.length || 0})</span>
                  </legend>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                    {(activeSentence?.notes || []).map((note, nIdx) => (
                      <div
                        key={note.id || nIdx}
                        style={{
                          background: "#fbf7ee",
                          border: "1px solid #dfcfb8",
                          borderRadius: "0.375rem",
                          padding: "0.6rem 0.75rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.4rem",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                            <input
                              type="text"
                              placeholder="Marker"
                              value={note.marker || ""}
                              onChange={(e) =>
                                activeSentence &&
                                updateSentenceNote(activeSentence.id, note.id, { marker: e.target.value })
                              }
                              style={{ width: "3.2rem", padding: "0.2rem 0.4rem", fontSize: "0.78rem", textAlign: "center" }}
                            />
                            <select
                              value={note.type || "manuscript_variant"}
                              onChange={(e) =>
                                activeSentence &&
                                updateSentenceNote(activeSentence.id, note.id, {
                                  type: e.target.value as NoteType,
                                })
                              }
                              style={{ padding: "0.2rem 0.4rem", fontSize: "0.78rem" }}
                            >
                              <option value="manuscript_variant">manuscript_variant</option>
                              <option value="grammatical_note">grammatical_note</option>
                              <option value="source_reference">source_reference</option>
                              <option value="general">general</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => activeSentence && removeSentenceNote(activeSentence.id, note.id)}
                            style={{ background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer" }}
                            title="Remove note"
                          >
                            <X style={{ width: "0.85rem", height: "0.85rem" }} />
                          </button>
                        </div>

                        {activeSentence && (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <label style={{ fontSize: "0.72rem", color: "var(--muted-ink)" }}>Target Word:</label>
                            <select
                              value={note.targetWordIndex != null ? String(note.targetWordIndex) : ""}
                              onChange={(e) =>
                                updateSentenceNote(activeSentence.id, note.id, {
                                  targetWordIndex: e.target.value !== "" ? Number(e.target.value) : undefined,
                                })
                              }
                              style={{ padding: "0.15rem 0.35rem", fontSize: "0.75rem", flex: 1 }}
                            >
                              <option value="">Whole Sentence</option>
                              {activeSentence.tokens.map((tok, tIdx) => (
                                <option key={tok.id} value={tIdx + 1}>
                                  Word #{tIdx + 1}: {tok.sourceForm}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        <textarea
                          rows={2}
                          placeholder="BL Cotton MS Tiberius B i reads 'hlaforde'..."
                          value={note.text}
                          onChange={(e) =>
                            activeSentence &&
                            updateSentenceNote(activeSentence.id, note.id, { text: e.target.value })
                          }
                          style={{ fontSize: "0.82rem", width: "100%" }}
                        />
                      </div>
                    ))}

                  </div>
                </fieldset>

                {/* 11. Reader Popup Preview */}
                <div className="editor-preview-card">
                  <h3>Reader Popup Preview</h3>
                  <p className="editor-preview-word">
                    {activeToken.lemma || cleanHeaderWord}
                    <span className="editor-preview-pos">
                      ({activeToken.pos || "unclassified"})
                    </span>
                  </p>

                  {activeToken.explanation && (
                    <p style={{ margin: "0.4rem 0", fontSize: "0.95rem", color: "var(--ink)" }}>
                      {activeToken.explanation}
                    </p>
                  )}

                  {activeToken.morphemes && activeToken.morphemes.length > 0 && (
                    <div className="editor-preview-morphemes">
                      <strong>Morphemes Breakdown</strong>
                      <span>
                        {activeToken.morphemes
                          .map((m) => `${m.form || "?"} = ${m.gloss || "?"}`)
                          .join("   ")}
                      </span>
                    </div>
                  )}

                  {activeToken.wiktionaryUrl && (
                    <div style={{ marginTop: "0.6rem" }}>
                      <a
                        href={activeToken.wiktionaryUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="reference-link"
                        style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}
                      >
                        Open in Wiktionary ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--muted-ink)", fontSize: "0.9rem" }}>
                Select any word in the document feed on the left to inspect its linguistic layers.
              </p>
            )}
          </aside>
        </div>
      </main>

      {/* Edit Document Details Modal */}
      {isEditingMetadata && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-metadata-title"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28, 25, 23, 0.65)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 9999,
          }}
          onClick={() => setIsEditingMetadata(false)}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--rule)",
              borderRadius: "0.6rem",
              maxWidth: "36rem",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.25)",
              padding: "1.75rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "0.85rem",
                borderBottom: "1px solid var(--rule)",
                marginBottom: "1.25rem",
              }}
            >
              <h2
                id="edit-metadata-title"
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontFamily: "'Charis SIL', Georgia, serif",
                  color: "var(--ink)",
                }}
              >
                Edit Document Details
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingMetadata(false)}
                aria-label="Close dialog"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted-ink)",
                  cursor: "pointer",
                  padding: "0.25rem",
                  borderRadius: "0.25rem",
                }}
              >
                <X style={{ width: "1.25rem", height: "1.25rem" }} />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="editor-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>
                  Original Text Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Voyages of Ohthere and Wulfstan"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", width: "100%" }}
                />
              </div>

              <div className="editor-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>
                  Historical Author / Speaker
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anonymous, King Alfred, Cædmon, Bede"
                  value={metaHistoricalAuthor}
                  onChange={(e) => setMetaHistoricalAuthor(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", width: "100%" }}
                />
              </div>

              <div className="editor-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>
                  Glossed by
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tyler Lemon"
                  value={metaGlossedBy}
                  onChange={(e) => setMetaGlossedBy(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", width: "100%" }}
                />
              </div>

              <div className="editor-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>
                  Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. September 30, 2026"
                  value={metaDate}
                  onChange={(e) => setMetaDate(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", width: "100%" }}
                />
              </div>

              <div className="editor-form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)" }}>
                  Edition
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL Cotton MS Tiberius B i, fol. 11r–15v"
                  value={metaSourceEdition}
                  onChange={(e) => setMetaSourceEdition(e.target.value)}
                  style={{ padding: "0.5rem 0.75rem", fontSize: "0.9rem", width: "100%" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.6rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--rule)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsEditingMetadata(false)}
                  style={{
                    padding: "0.45rem 1rem",
                    borderRadius: "0.35rem",
                    border: "1px solid var(--rule)",
                    background: "var(--surface)",
                    color: "var(--ink)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.45rem 1.1rem",
                    borderRadius: "0.35rem",
                    border: "none",
                    background: "var(--accent)",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DraftSyncPrompt
        forceShow={showSyncPrompt}
        currentSlug={documentState.slug}
        onSynced={() => {
          setSaveStatus({
            kind: "success",
            message: "Successfully committed working draft to Git repository!",
          });
          setShowSyncPrompt(false);
        }}
        onDismiss={() => setShowSyncPrompt(false)}
      />
      <SiteFooter />
    </>
  );
}
