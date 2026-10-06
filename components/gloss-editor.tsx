"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { exportToGb4eLatex, plainToTexGloss } from "../data/latex-export";
import { resolveOldEnglishLexicon } from "../lib/old-english-lexicon";
import { safeJsonStringify } from "../lib/safe-json";
import { isProtectedSlug } from "../lib/corpus-registry";
import type {
  TextDocument,
  ReadingSentence,
  InterlinearWord,
  Morpheme,
  PartOfSpeech,
  InflectionFeatures,
} from "../lib/types";
import {
  BookOpen,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";

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
}

export interface EditorSentence {
  id: string;
  tokens: EditorToken[];
  freeTranslation: string;
  footnotes?: string[];
}

export interface EditorDocument {
  textId: string;
  slug: string;
  title: string;
  author: string;
  date: string;
  source: string;
  sourceFile: string;
  language: "Old English";
  status: "draft" | "review" | "published";
  sentences: EditorSentence[];
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
  const resolvedLemma =
    w.analysis?.lemma && w.analysis.lemma !== w.originalWord ? w.analysis.lemma : lex.lemma;
  const resolvedPos = (w.analysis?.partOfSpeech || lex.pos || "noun") as PartOfSpeech;
  const resolvedExpl =
    w.analysis?.definition && w.analysis.definition !== w.morphologicalGloss
      ? w.analysis.definition
      : lex.definition || w.morphologicalGloss || "";
  const resolvedIpa = w.analysis?.phonetic || lex.ipa || "";
  const resolvedWiktionary = w.analysis?.wiktionaryUrl || lex.wiktionaryUrl;

  const rawMorphemes = w.analysis?.morphemes || [];
  const normalizedMorphemes: Morpheme[] = rawMorphemes.map((m, mIdx) => ({
    id: m.id || `${w.id || "word"}-morpheme-${mIdx + 1}`,
    form: m.form || (m as unknown as { morpheme?: string }).morpheme || "",
    gloss: m.gloss || "",
    kind: m.kind,
  }));

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
  };
}

export function textDocumentToEditorDoc(doc: TextDocument): EditorDocument {
  const rawAuthor = doc.author || (doc.source ? doc.source.split(/[·•]/)[0]?.trim() : "Tyler Lemon");
  const authorMatch = rawAuthor.replace(/^(Translated and glossed by\s*)+/gi, "").trim();
  const dateMatch =
    doc.date || (doc.source ? doc.source.split(/[·•]/)[1]?.trim() : "September 30, 2026");

  return {
    textId: doc.textId || "ohthere",
    slug: doc.slug || "ohthere-wulfstan",
    title: doc.title || "The voyages of Ohthere and Wulfstan",
    author: authorMatch,
    date: dateMatch,
    source: doc.source || `${authorMatch} · ${dateMatch}`,
    sourceFile: doc.sourceFile || "references/Voyages_of_Ohthere_Wulfstan.tex",
    language: "Old English",
    status: doc.status || "published",
    sentences: (doc.sentences || []).map((sent: ReadingSentence, sIdx: number) => ({
      id: sent.id || `sent-${sIdx + 1}`,
      freeTranslation: sent.translation || "",
      footnotes: sent.footnotes,
      tokens: (sent.words || []).map((w: InterlinearWord, tIdx: number) =>
        wordToEditorToken(w, sIdx, tIdx),
      ),
    })),
  };
}

export function editorDocToTextDocument(doc: EditorDocument): TextDocument {
  const result: TextDocument = {
    textId: doc.textId,
    slug: doc.slug,
    language: "Old English",
    author: doc.author,
    date: doc.date,
    title: doc.title,
    source: doc.source || `${doc.author} · ${doc.date}`,
    sourceFile: doc.sourceFile,
    status: doc.status,
    sentences: doc.sentences.map((sent) => ({
      id: sent.id,
      translation: sent.freeTranslation,
      footnotes: sent.footnotes,
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

        return {
          id: tok.id,
          originalWord: originalCleanWord,
          morphologicalGloss: sourceGlossVal,
          trailingPunctuation: punctuationMatch ? punctuationMatch[0] : undefined,
          sourceGlossTex: texGlossVal,
          analysis: {
            lemma: tok.lemma,
            partOfSpeech: tok.pos,
            features: { ...tok.inflections },
            morphemes: tok.morphemes.map((m) => ({
              id: m.id,
              form: m.form,
              gloss: m.gloss,
              kind: m.kind,
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

  result.texSource = exportToGb4eLatex(result);
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

  // Backup snapshot for "Discard Changes" comparison
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    safeJsonStringify(textDocumentToEditorDoc(initialDocument)),
  );

  const storageKey = `glossy_draft_${initialDocument.slug || initialDocument.textId || "ohthere"}`;

  // Restore from initial master document
  const loadFromMasterTex = useCallback(async () => {
    setIsLoading(true);
    try {
      const fallback = textDocumentToEditorDoc(initialDocument);
      setDocumentState(fallback);
      const dataStr = safeJsonStringify(fallback);
      setSavedSnapshot(dataStr);
      try {
        window.localStorage.setItem(storageKey, dataStr);
      } catch {}
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
  }, [initialDocument, storageKey]);

  // Initial mount load sequence with stale-cache invalidation
  useEffect(() => {
    try {
      window.localStorage.removeItem("glossy_document_ohthere_full");
      window.localStorage.removeItem("glossy_document_ohthere_full_v2");
    } catch {}

    const expectedSentenceCount = initialDocument.sentences?.length ?? 0;
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as EditorDocument;
        if (!parsed.sentences || parsed.sentences.length !== expectedSentenceCount) {
          window.localStorage.removeItem(storageKey);
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
  }, [initialDocument, loadFromMasterTex, storageKey]);

  // Autosave to localStorage debounced at 300ms
  useEffect(() => {
    if (!documentState || isLoading) return;

    setAutosaveStatus("saving");
    const timer = window.setTimeout(() => {
      const serialized = safeJsonStringify(documentState);
      try {
        window.localStorage.setItem(storageKey, serialized);
      } catch (e) {
        console.warn("LocalStorage quota exceeded, skipping local cache:", e);
      }
      setAutosaveStatus("saved");
    }, 300);

    return () => window.clearTimeout(timer);
  }, [documentState, isLoading, storageKey]);

  // Find active sentence and active token
  const activeSentence = documentState?.sentences.find((s) => s.id === activeSentenceId);
  const activeToken =
    activeSentence?.tokens.find((t) => t.id === activeTokenId) ||
    documentState?.sentences.flatMap((s) => s.tokens).find((t) => t.id === activeTokenId);

  const currentIndex = documentState
    ? documentState.sentences.findIndex((s) => s.id === activeSentenceId)
    : -1;

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

  // Discard changes to restore initial snapshot
  const discardChanges = () => {
    try {
      const parsed = JSON.parse(savedSnapshot) as EditorDocument;
      setDocumentState(parsed);
      if (parsed.sentences.length > 0) {
        setActiveSentenceId(parsed.sentences[0].id);
        setActiveTokenId(parsed.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({
        kind: "success",
        message: "Edits successfully discarded. Reverted to previous save.",
      });
    } catch {
      setSaveStatus({
        kind: "error",
        message: "Failed to discard edits; saved state is invalid.",
      });
    }
  };

  const saveToTina = async () => {
    if (!documentState || isSaving) return;

    setIsSaving(true);
    setSaveStatus({ kind: "idle", message: "" });
    const legacyDoc = editorDocToTextDocument(documentState);
    const targetSlug = legacyDoc.slug || initialDocument.slug || "ohthere";
    const targetFileName = `${initialDocument.fileName || initialDocument.textId || targetSlug}.json`;

    try {
      // 1. Always persist client-side snapshot in browser storage (localStorage)
      const serialized = safeJsonStringify(documentState);
      setSavedSnapshot(serialized);
      try {
        window.localStorage.setItem(storageKey, serialized);
        // Also save in TextDocument format for admin sync
        window.localStorage.setItem(`glossy_draft_${targetSlug}`, safeJsonStringify(legacyDoc));

        // Update pending drafts manifest
        const pendingRaw = window.localStorage.getItem("glossy_pending_drafts");
        const pending = pendingRaw ? JSON.parse(pendingRaw) : {};
        pending[targetSlug] = {
          slug: targetSlug,
          title: legacyDoc.title || initialDocument.title,
          updatedAt: new Date().toISOString(),
          sentenceCount: legacyDoc.sentences?.length ?? 0,
          wordCount: legacyDoc.sentences?.reduce((acc, s) => acc + (s.words?.length ?? 0), 0) ?? 0,
          synced: false,
        };
        window.localStorage.setItem("glossy_pending_drafts", JSON.stringify(pending));
      } catch {}

      // 2. Build full TextMutation payload
      const mutationVariables = {
        relativePath: targetFileName,
        params: {
          textId: legacyDoc.textId || targetSlug,
          slug: targetSlug,
          language: legacyDoc.language || "Old English",
          author: legacyDoc.author || "",
          title: legacyDoc.title || "",
          source: legacyDoc.source || "",
          sourceFile: legacyDoc.sourceFile || "",
          sourceEdition: legacyDoc.sourceEdition || "",
          status: legacyDoc.status || "draft",
          texSource: legacyDoc.texSource || "",
          sentences: (legacyDoc.sentences || []).map((sent) => ({
            id: sent.id,
            translation: sent.translation || "",
            footnotes: sent.footnotes || [],
            words: (sent.words || []).map((w) => ({
              id: w.id,
              originalWord: w.originalWord,
              morphologicalGloss: w.morphologicalGloss || "",
              trailingPunctuation: w.trailingPunctuation || "",
              sourceGlossTex: w.sourceGlossTex || "",
              analysis: w.analysis
                ? {
                    lemma: w.analysis.lemma || "",
                    partOfSpeech: w.analysis.partOfSpeech || "",
                    definition: w.analysis.definition || "",
                    phonetic: w.analysis.phonetic || "",
                    pronunciationSource: w.analysis.pronunciationSource || "",
                    historicalNote: w.analysis.historicalNote || "",
                    wiktionaryUrl: w.analysis.wiktionaryUrl || "",
                    features: w.analysis.features
                      ? {
                          case: w.analysis.features.case,
                          number: w.analysis.features.number,
                          gender: w.analysis.features.gender,
                          person:
                            w.analysis.features.person != null
                              ? Number(w.analysis.features.person)
                              : undefined,
                          tense: w.analysis.features.tense,
                          mood: w.analysis.features.mood,
                          degree: w.analysis.features.degree,
                        }
                      : undefined,
                    morphemes: (w.analysis.morphemes || []).map((m) => ({
                      form: m.form || "",
                      gloss: m.gloss || "",
                      kind: m.kind || "stem",
                    })),
                  }
                : undefined,
              review: w.review
                ? {
                    status: w.review.status || "source-checked",
                    notes: w.review.notes || "",
                    source: w.review.source
                      ? {
                          file: w.review.source.file || "",
                          locator: w.review.source.locator || "",
                        }
                      : undefined,
                  }
                : undefined,
            })),
          })),
        },
      };

      const updateMutationQuery = `mutation UpdateText($relativePath: String!, $params: TextMutation!) {
        updateText(relativePath: $relativePath, params: $params) {
          id
          title
          _sys { relativePath }
        }
      }`;

      // 3. Attempt Tina GraphQL update (local datalayer or authenticated TinaCloud)
      let graphQlSuccess = false;
      const isLocalhost =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      if (isLocalhost) {
        try {
          const tinaUrl =
            process.env.NEXT_PUBLIC_TINA_LOCAL_URL ?? "http://localhost:4001/graphql";
          const res = await fetch(tinaUrl, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: safeJsonStringify({
              query: updateMutationQuery,
              variables: mutationVariables,
            }),
          });
          const resJson = await res.json();
          if (resJson?.data?.updateText || resJson?.data?.updateDocument) {
            graphQlSuccess = true;
          }
        } catch {}
      }

      // If local didn't succeed, check for active TinaCloud session in browser
      if (!graphQlSuccess && typeof window !== "undefined") {
        try {
          const authToken = window.localStorage.getItem("tinacms-auth");
          if (authToken) {
            const cloudUrl =
              "https://content.tinajs.io/3.0/content/7cf6793a-dfc2-4a6b-ae23-c2665e22f286/github/main";
            const res = await fetch(cloudUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
                authorization: `Bearer ${authToken}`,
              },
              body: safeJsonStringify({
                query: updateMutationQuery,
                variables: mutationVariables,
              }),
            });
            const resJson = await res.json();
            if (resJson?.data?.updateText || resJson?.data?.updateDocument) {
              graphQlSuccess = true;
            }
          }
        } catch {}
      }

      if (graphQlSuccess) {
        try {
          const pendingRaw = window.localStorage.getItem("glossy_pending_drafts");
          if (pendingRaw) {
            const pending = JSON.parse(pendingRaw);
            if (pending[targetSlug]) {
              pending[targetSlug].synced = true;
              window.localStorage.setItem("glossy_pending_drafts", JSON.stringify(pending));
            }
          }
        } catch {}

        setSaveStatus({
          kind: "success",
          message: `Saved and synchronized directly to TinaCMS (content/texts/${targetFileName}) and browser storage.`,
        });
      } else {
        setSaveStatus({
          kind: "success",
          message: `Saved working draft to browser storage (key: "${storageKey}"). To commit your changes directly to Git, open Tina Admin (↗) or click "Export JSON".`,
        });
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "The save operation failed.";
      let errDetails = "";
      if (error instanceof Error) {
        errDetails = error.stack || error.message;
      } else if (typeof error === "object" && error !== null) {
        try {
          errDetails = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
        } catch {
          errDetails = String(error);
        }
      } else {
        errDetails = String(error);
      }
      setSaveStatus({
        kind: "error",
        message: errMessage,
        details: errDetails,
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
    anchor.download = `${initialDocument.fileName || initialDocument.textId || "ohthere"}.json`;
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
    anchor.download = `${initialDocument.fileName || initialDocument.textId || "ohthere"}.tex`;
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
      try {
        await fetch("/api/delete-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: safeJsonStringify({
            slug: initialDocument.slug,
            fileName: initialDocument.fileName || initialDocument.textId,
          }),
        });
      } catch {}

      try {
        localStorage.removeItem(storageKey);
      } catch {}

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
    const newMorpheme: Morpheme = {
      id: `${activeTokenId}-morpheme-${currentMorphemes.length + 1}`,
      form: "",
      gloss: "",
    };
    syncMorphemesAndToken([...currentMorphemes, newMorpheme]);
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
        <header className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <span className="sr-only">Editing workspace</span>
            <h1>{documentState.title}</h1>
            <p className="source-line" style={{ margin: "0.25rem 0 0" }}>
              {documentState.author?.toLowerCase().includes("anonymous")
                ? `${documentState.author} · ${documentState.date}`
                : `Translated and glossed by ${documentState.author?.replace(/^(Translated and glossed by\s*)+/gi, "")} · ${documentState.date}`}
            </p>

            {availableTexts && availableTexts.length > 1 && (
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label htmlFor="editor-text-select" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Switch text:
                </label>
                <select
                  id="editor-text-select"
                  value={initialDocument.slug}
                  onChange={(e) => router.push(`/edit/${e.target.value}`)}
                  style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem", border: "1px solid var(--rule)", borderRadius: "0.25rem", background: "var(--surface)", color: "var(--ink)" }}
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

          <div className="workspace-actions">
            {(autosaveStatus === "saved" || autosaveStatus === "saving") && (
              <span className={`editor-dirty ${autosaveStatus === "saved" ? "is-clean" : "is-dirty"}`}>
                {autosaveStatus === "saved" ? "✓ Draft saved" : "Autosaving..."}
              </span>
            )}

            <div style={{ display: "inline-flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => loadFromMasterTex()}
                className="workspace-link"
              >
                <RefreshCw style={{ width: "0.85rem", height: "0.85rem", marginRight: "0.35rem" }} /> Reload Master .tex
              </button>

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
                className="workspace-link"
                style={{ background: "#f3eadb", color: "#7b3f2a" }}
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
                  className="workspace-link"
                  style={{
                    background: "rgba(220, 38, 38, 0.08)",
                    color: "#b91c1c",
                    borderColor: "#fca5a5",
                  }}
                >
                  <Trash2 style={{ width: "0.85rem", height: "0.85rem", marginRight: "0.35rem" }} />
                  {isDeleting ? "Deleting..." : "Delete Text"}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={saveToTina}
              disabled={isSaving}
              className="workspace-button"
              style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", padding: "0.45rem 1.1rem" }}
              title="Save working draft to browser storage (and sync to Git if connected)"
            >
              <Save style={{ width: "0.9rem", height: "0.9rem", marginRight: "0.35rem" }} />
              {isSaving ? "Saving..." : "Save draft"}
            </button>
          </div>
        </header>

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
                  <div
                    key={sent.id}
                    onClick={() => setActiveSentenceId(sent.id)}
                    className={`editor-sentence-card${isSentActive ? " is-active" : ""}`}
                  >
                    <div className="editor-sentence-header">
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontFamily: "'Charis SIL', 'Noto Serif', Georgia, serif", fontWeight: 700, color: "var(--accent)" }}>
                        Sentence {actualIndex}
                      </h3>
                    </div>

                    {/* Word Chips */}
                    <div className="editor-tokens-list">
                      {sent.tokens.map((tok) => {
                        const isTokActive = tok.id === activeTokenId;
                        return (
                          <button
                            key={tok.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveSentenceId(sent.id);
                              setActiveTokenId(tok.id);
                            }}
                            className={`editor-word-chip${isTokActive ? " is-selected" : ""}`}
                          >
                            <span className="chip-form">
                              {tok.sourceForm}
                            </span>
                            <span className="chip-gloss">
                              {tok.sourceGloss || tok.sourceForm}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Free Translation */}
                    <div className="editor-translation-block">
                      <label>FREE TRANSLATION</label>
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
                        placeholder="Enter translation here..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Right Column: Selected Token Inspector */}
          <aside className="editor-inspector-card" style={{ position: "sticky", top: "1rem", maxHeight: "calc(100vh - 3rem)", overflowY: "auto" }}>
            <div className="editor-inspector-header">
              <p className="workspace-eyebrow" style={{ margin: 0, fontSize: "0.72rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                SELECTED TOKEN INSPECTOR
              </p>
              <h2 className="editor-inspector-heading">
                {cleanHeaderWord || "NO TOKEN SELECTED"}
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
                  <label>Morphemes Breakdown ({activeToken.morphemes?.length || 0})</label>
                  <div>
                    {(activeToken.morphemes || []).map((morpheme, idx) => (
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
                    ))}
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

                {/* 10. Reader Popup Preview */}
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
      <SiteFooter />
    </>
  );
}
