"use client";

import { useEffect, useState, useCallback } from "react";
import { SiteNav } from "./site-nav";
import { exportToGb4eLatex } from "../data/latex-export";
import {
  BookOpen,
  RefreshCw,
  Save,
} from "lucide-react";

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

import type { TextDocument, ReadingSentence, InterlinearWord, Morpheme as LegacyMorpheme } from "../lib/types";

function mapLegacyTextDocToGlossDoc(legacyDoc: TextDocument): GlossDocument {
  const authorMatch = legacyDoc.author ? legacyDoc.author : "Tyler Lemon";
  const dateMatch = legacyDoc.source ? legacyDoc.source.split("·")[1]?.trim() : "September 30, 2026";

  return {
    title: legacyDoc.title || "The voyages of Ohthere and Wulfstan",
    author: authorMatch,
    date: dateMatch || "September 30, 2026",
    sentences: (legacyDoc.sentences || []).map((sent: ReadingSentence, sIdx: number) => ({
      id: sent.id || `sentence-${sIdx + 1}`,
      freeTranslation: sent.translation || "",
      tokens: (sent.words || []).map((w: InterlinearWord, tIdx: number) => {
        const inflections = w.analysis?.features || {};
        return {
          id: w.id || `sentence-${sIdx + 1}-token-${tIdx + 1}`,
          sourceForm: `${w.originalWord}${w.trailingPunctuation || ""}`,
          sourceGloss: w.morphologicalGloss || w.originalWord,
          literalTexGloss: w.sourceGlossTex || w.morphologicalGloss || w.originalWord,
          lemma: w.analysis?.lemma || w.originalWord,
          pos: w.analysis?.partOfSpeech || "noun",
          explanation: w.analysis?.definition || "",
          inflections: {
            case: inflections.case,
            number: inflections.number,
            gender: inflections.gender,
            tense: inflections.tense,
            mood: inflections.mood,
            person: inflections.person ? String(inflections.person) : undefined,
          },
          morphemes: (w.analysis?.morphemes || []).map((m: LegacyMorpheme, mIdx: number) => ({
            id: `${w.id || "word"}-morpheme-${mIdx + 1}`,
            morpheme: m.form || "",
            gloss: m.gloss || "",
          })),
          ipa: w.analysis?.phonetic || "",
          wiktionaryUrl: w.analysis?.wiktionaryUrl || "",
        };
      }),
    })),
  };
}

export function GlossEditor({ initialDocument }: { initialDocument: TextDocument & { fileName?: string } }) {
  const [documentState, setDocumentState] = useState<GlossDocument>(() => mapLegacyTextDocToGlossDoc(initialDocument));
  const [activeSentenceId, setActiveSentenceId] = useState<string>(() => initialDocument.sentences?.[0]?.id || "");
  const [activeTokenId, setActiveTokenId] = useState<string>(() => initialDocument.sentences?.[0]?.words?.[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
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

  const storageKey = "glossy_document_ohthere_full";

  // Ingest from API (/api/master-tex) helper
  const loadFromMasterTex = async (confirmOverwrite = false) => {
    if (confirmOverwrite && !window.confirm("Are you sure you want to reload from the Master .tex source? This will overwrite your local changes.")) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/master-tex");
      if (!response.ok) throw new Error("Failed to load Master TeX file.");
      const data = (await response.json()) as GlossDocument;
      
      setDocumentState(data);
      const dataStr = JSON.stringify(data);
      setSavedSnapshot(dataStr);
      window.localStorage.setItem(storageKey, dataStr);

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
  };

  // Initial mount load sequence
  useEffect(() => {
    const cached = window.localStorage.getItem(storageKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as GlossDocument;
        setDocumentState(parsed);
        setSavedSnapshot(cached);
        if (parsed.sentences.length > 0) {
          setActiveSentenceId(parsed.sentences[0].id);
          setActiveTokenId(parsed.sentences[0].tokens[0]?.id || "");
        }
      } catch {
        // Fallback to reload if JSON is corrupt
        loadFromMasterTex();
      }
    } else {
      // Ingest the full text directly from master source if no local cache exists
      loadFromMasterTex();
    }
  }, []);

  // Autosave to localStorage debounced at 300ms
  useEffect(() => {
    if (!documentState || isLoading) return;

    setAutosaveStatus("saving");
    const timer = window.setTimeout(() => {
      const serialized = JSON.stringify(documentState);
      window.localStorage.setItem(storageKey, serialized);
      setAutosaveStatus("saved");
    }, 300);

    return () => window.clearTimeout(timer);
  }, [documentState, isLoading]);

  // Ingestion parsing function for multi-sentence gb4e input
  const parseMultiSentenceGb4e = (latex: string): Sentence[] => {
    const sentences: Sentence[] = [];
    const regex = /\\gll\s+([\s\S]+?)\\\\\s*([\s\S]+?)\\\\\s*\\glt\s*([^\r\n]+)/g;
    let match;
    let idx = 1;

    while ((match = regex.exec(latex)) !== null) {
      const line1 = match[1].trim();
      const line2 = match[2].trim();
      const rawTranslation = match[3].trim();

      const cleanTranslation = stripLatexFootnotes(rawTranslation)
        .replace(/\\(?:textit|textbf|textsc|emph)\{([^}]+)\}/g, "$1")
        .replace(/\\href\{[^}]+\}\{([^}]+)\}/g, "$1")
        .replace(/\\url\{[^}]+\}/g, "")
        .replace(/^[`'‘"“\s]+|[`'’"”\}\s]+$/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const rawSurfaceWords = line1.replace(/\\\\$/, "").trim().split(/\s+/);
      const rawGlossWords = line2.replace(/\\\\$/, "").trim().split(/\s+/);

      const tokens: Token[] = [];
      const sentenceId = `imported-sentence-${Date.now()}-${idx}`;

      const maxLen = Math.max(rawSurfaceWords.length, rawGlossWords.length);
      for (let tIdx = 0; tIdx < maxLen; tIdx++) {
        const rawSurf = rawSurfaceWords[tIdx] || "";
        const rawGl = rawGlossWords[tIdx] || "";

        const sourceForm = rawSurf.replace(/[.,;:!?]+$/, "");
        const literalTexGloss = rawGl;
        const sourceGloss = rawGl
          .replace(/\\textsc\{([^}]+)\}/g, "$1")
          .replace(/\\/g, "");

        const tokenId = `${sentenceId}-token-${tIdx + 1}`;

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

        tokens.push({
          id: tokenId,
          sourceForm: rawSurf,
          sourceGloss,
          literalTexGloss,
          lemma: sourceForm.replace(/^-|-$/g, ""),
          pos: "noun",
          explanation: sourceGloss,
          inflections: {},
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
      idx++;
    }

    return sentences;
  };

  const applyImportedSentences = () => {
    if (!importPreview || importPreview.length === 0) return;
    setDocumentState((prev) => {
      return {
        ...prev,
        sentences: [...prev.sentences, ...importPreview],
      };
    });
    alert(`Successfully appended ${importPreview.length} sentences to the active document feed!`);
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

    setDocumentState((prev) => {
      return {
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
      };
    });
  }, [activeTokenId]);

  // Update inflection feature helper
  const updateInflection = useCallback((key: keyof Token["inflections"], val: string | undefined) => {
    if (!activeTokenId) return;
    setDocumentState((prev) => {
      return {
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
      };
    });
  }, [activeTokenId]);

  // Discard changes to restore initial snapshot
  const discardChanges = () => {
    if (!window.confirm("Are you sure you want to discard your unsaved edits?")) return;
    try {
      const parsed = JSON.parse(savedSnapshot) as GlossDocument;
      setDocumentState(parsed);
      if (parsed.sentences.length > 0) {
        setActiveSentenceId(parsed.sentences[0].id);
        setActiveTokenId(parsed.sentences[0].tokens[0]?.id || "");
      }
      setSaveStatus({ kind: "success", message: "Edits successfully discarded. Reverted to previous save." });
    } catch {
      alert("Failed to discard edits; saved state is invalid.");
    }
  };

  // Convert GlossDocument to legacy TextDocument shape for compatible backend updates
  const mapToLegacyTextDocument = (doc: GlossDocument) => {
    return {
      textId: initialDocument.textId || "ohthere",
      slug: initialDocument.slug || "ohthere-wulfstan",
      language: "Old English",
      author: doc.author,
      title: doc.title,
      source: `${doc.author} · ${doc.date}`,
      sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
      status: "published",
      sentences: doc.sentences.map((sent) => ({
        id: sent.id,
        translation: sent.freeTranslation,
        words: sent.tokens.map((tok) => {
          // Extract trailing punctuation safely if present
          const punctuationMatch = tok.sourceForm.match(/[.,;:!?]+$/);
          const originalCleanWord = tok.sourceForm.replace(/[.,;:!?]+$/, "");
          return {
            id: tok.id,
            originalWord: originalCleanWord,
            morphologicalGloss: tok.sourceGloss,
            trailingPunctuation: punctuationMatch ? punctuationMatch[0] : null,
            sourceGlossTex: tok.literalTexGloss,
            analysis: {
              lemma: tok.lemma,
              partOfSpeech: tok.pos,
              features: {
                case: tok.inflections.case,
                number: tok.inflections.number,
                gender: tok.inflections.gender,
                tense: tok.inflections.tense,
                mood: tok.inflections.mood,
                person: tok.inflections.person ? parseInt(String(tok.inflections.person), 10) : undefined,
              },
              morphemes: tok.morphemes.map((m) => ({
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
    };
  };

  // Save to TinaCMS
  const saveToTina = async () => {
    if (!documentState || isSaving) return;

    setIsSaving(true);
    setSaveStatus({ kind: "idle", message: "" });
    const legacyDoc = mapToLegacyTextDocument(documentState);

    try {
      const response = await fetch(
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

      const result = (await response.json()) as {
        data?: { updateDocument?: { _sys?: { relativePath?: string } } };
        errors?: Array<{ message: string }>;
      };

      if (!response.ok || result.errors?.length || !result.data?.updateDocument?._sys?.relativePath) {
        throw new Error(
          result.errors?.map((error) => error.message).join("; ") || `TinaCMS server returned HTTP ${response.status}.`
        );
      }

      const serialized = JSON.stringify(documentState);
      setSavedSnapshot(serialized);
      setSaveStatus({
        kind: "success",
        message: `Saved content/texts/${result.data.updateDocument._sys.relativePath} to TinaCMS working tree successfully!`,
      });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "The TinaCMS save operation failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // LaTeX Exporter mapping
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

  // Morphemes management
  const addMorpheme = () => {
    if (!activeToken) return;
    const currentMorphemes = activeToken.morphemes || [];
    const newMorpheme: Morpheme = {
      id: `${activeTokenId}-morpheme-${currentMorphemes.length + 1}`,
      morpheme: "",
      gloss: "",
    };
    updateToken({
      morphemes: [...currentMorphemes, newMorpheme],
    });
  };

  const updateMorphemeVal = (mIdx: number, field: "morpheme" | "gloss", val: string) => {
    if (!activeToken) return;
    const currentMorphemes = [...(activeToken.morphemes || [])];
    currentMorphemes[mIdx] = {
      ...currentMorphemes[mIdx],
      [field]: val,
    };
    updateToken({ morphemes: currentMorphemes });
  };

  const removeMorpheme = (mIdx: number) => {
    if (!activeToken) return;
    const currentMorphemes = (activeToken.morphemes || []).filter((_, idx) => idx !== mIdx);
    updateToken({ morphemes: currentMorphemes });
  };

  // Filter sentences by query
  const filteredSentences = documentState?.sentences.filter((sent) => {
    if (!searchQuery) return true;
    const matchTranslation = sent.freeTranslation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchWord = sent.tokens.some((tok) => tok.sourceForm.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTranslation || matchWord;
  }) || [];

  if (isLoading || !documentState) {
    return (
      <main className="workspace-shell flex items-center justify-center min-h-[60vh] bg-stone-50">
        <div className="text-center p-8 bg-white border border-stone-200 rounded-lg shadow-sm">
          <RefreshCw className="w-8 h-8 text-amber-800 animate-spin mx-auto mb-4" />
          <h2 className="text-stone-900 font-semibold text-lg">Ingesting Master LaTeX Glosses...</h2>
          <p className="text-stone-500 text-sm mt-1">Parsing Voyages_of_Ohthere_Wulfstan.tex working tree</p>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace-shell bg-stone-50 min-h-screen">
      <div className="workspace max-w-7xl mx-auto px-4 py-6">
        <header className="workspace-header bg-white border border-stone-200 rounded-lg p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <SiteNav current="edit" slug={initialDocument.slug} />
            <span className="sr-only">Editing workspace</span>
            <h1 className="text-2xl font-bold font-serif text-stone-900 mt-1">{documentState.title}</h1>
            <p className="text-sm text-stone-500 mt-1">
              By {documentState.author} · {documentState.date}
            </p>
          </div>

          <div className="editor-actions-grid">
            {/* Status alerts */}
            {(autosaveStatus === "saved" || autosaveStatus === "saving") && (
              <span className={`editor-dirty ${autosaveStatus === "saved" ? "is-clean" : "is-dirty"}`}>
                {autosaveStatus === "saved" ? "✓ Draft saved" : "Autosaving..."}
              </span>
            )}

            <button
              onClick={() => loadFromMasterTex(true)}
              className="workspace-link"
              title="Re-parse the raw .tex file and discard all local browser modifications"
            >
              <RefreshCw className="w-3.5 h-3.5" style={{ marginRight: "0.25rem" }} /> Reload Master .tex
            </button>
            <button
              onClick={discardChanges}
              className="workspace-link"
              title="Revert edits back to previous saved TinaCMS copy"
            >
              Discard edits
            </button>
            <button
              onClick={handleExportLatex}
              className="workspace-link"
              style={{ background: "#f3eadb", color: "#7b3f2a" }}
              title="Download compiled .tex document"
            >
              Export LaTeX
            </button>
            <button
              onClick={saveToTina}
              disabled={isSaving}
              className="workspace-button"
              style={{ background: "#25231f", color: "#fff" }}
            >
              <Save className="w-3.5 h-3.5" style={{ marginRight: "0.25rem" }} />
              {isSaving ? "Saving..." : "Save to TinaCMS"}
            </button>
          </div>
        </header>

        {/* Global Action Messages */}
        {saveStatus.message && (
          <div className={`editor-save-status ${saveStatus.kind === "success" ? "is-success" : saveStatus.kind === "error" ? "is-error" : ""}`}>
            <p>{saveStatus.message}</p>
          </div>
        )}

        {/* Sentence Navigation Jump Selector & Pagination */}
        <section className="editor-nav-box">
          <div>
            <p className="workspace-eyebrow" style={{ margin: 0 }}>Sentence Navigator</p>
            <strong>{documentState.sentences.length} sentences loaded</strong>
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
                const targetSent = documentState.sentences.find(s => s.id === sId);
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

        {/* Full-Text Workspace Grid */}
        <div className="workspace-grid">
          {/* Complete Text Column (Left/Center) */}
          <section className="workspace-panel">
            <div className="editor-sentence-header">
              <h2 style={{ margin: 0, fontSize: "1.2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BookOpen className="w-4 h-4" /> Live preview & Document Feed
              </h2>
              <input
                type="text"
                placeholder="Filter by word or translation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: "0.35rem 0.6rem", border: "1px solid var(--rule)", borderRadius: "0.25rem", font: "inherit", fontSize: "0.85rem", width: "14rem" }}
              />
            </div>

            <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: "0.5rem" }}>
              {filteredSentences.map((sent) => {
                const isSentActive = sent.id === activeSentenceId;
                const actualIndex = documentState.sentences.findIndex((s) => s.id === sent.id) + 1;

                return (
                  <div
                    key={sent.id}
                    onClick={() => setActiveSentenceId(sent.id)}
                    className={`editor-sentence-card ${isSentActive ? "is-active" : ""}`}
                  >
                    <div className="editor-sentence-header">
                      <strong style={{ fontSize: "0.85rem", color: "var(--accent)" }}>
                        Sentence {actualIndex}
                      </strong>
                    </div>

                    {/* Word Tokens Grid Layout with custom word cards */}
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
                            className={`editor-word-chip ${isTokActive ? "is-selected" : ""}`}
                          >
                            <span className="chip-form">{tok.sourceForm}</span>
                            <span className="chip-gloss">
                              {tok.sourceGloss || tok.sourceForm}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Free Translation Input Block - Sitting cleanly below and full-width */}
                    <div className="editor-translation-block">
                      <label>Free Translation</label>
                      <textarea
                        rows={3}
                        value={sent.freeTranslation}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDocumentState((prev) => {
                            return {
                              ...prev,
                              sentences: prev.sentences.map((s) => {
                                if (s.id === sent.id) {
                                  return { ...s, freeTranslation: val };
                                }
                                return s;
                              }),
                            };
                          });
                        }}
                        placeholder="Enter translation here..."
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Persistent Sidebar Inspector (Right Column) */}
          <aside className="editor-inspector" style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "0.75rem", marginBottom: "1rem" }}>
              <span className="workspace-eyebrow" style={{ margin: 0 }}>Selected Token Inspector</span>
              <h2 style={{ margin: "0.25rem 0 0", fontSize: "1.6rem" }}>
                {activeToken?.sourceForm ? activeToken.sourceForm.replace(/[.,;:!?]+$/, "") : "No token active"}
              </h2>
            </div>

            {activeToken ? (
              <div className="space-y-4">
                {/* 1. Source Form & Glosses */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-stone-700">
                    Source form (raw token)
                    <input
                      type="text"
                      value={activeToken.sourceForm}
                      onChange={(e) => updateToken({ sourceForm: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    />
                  </label>

                  <label className="block text-xs font-bold text-stone-700">
                    Readable Leipzig Gloss
                    <input
                      type="text"
                      value={activeToken.sourceGloss}
                      onChange={(e) => updateToken({ sourceGloss: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    />
                  </label>

                  <label className="block text-xs font-bold text-stone-700">
                    Literal TeX Gloss
                    <input
                      type="text"
                      value={activeToken.literalTexGloss}
                      onChange={(e) => updateToken({ literalTexGloss: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800 font-mono"
                    />
                  </label>
                </div>

                {/* 2. Grammar & Lexicon */}
                <div className="border-t border-stone-100 pt-3 space-y-3">
                  <label className="block text-xs font-bold text-stone-700">
                    Lemma
                    <input
                      type="text"
                      value={activeToken.lemma}
                      onChange={(e) => updateToken({ lemma: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    />
                  </label>

                  <label className="block text-xs font-bold text-stone-700">
                    Part of Speech
                    <select
                      value={activeToken.pos}
                      onChange={(e) => updateToken({ pos: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    >
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                      <option value="pronoun">Pronoun</option>
                      <option value="determiner">Determiner</option>
                      <option value="preposition">Preposition</option>
                      <option value="conjunction">Conjunction</option>
                    </select>
                  </label>

                  <label className="block text-xs font-bold text-stone-700">
                    Explanation
                    <textarea
                      rows={2}
                      value={activeToken.explanation}
                      onChange={(e) => updateToken({ explanation: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    />
                  </label>

                  {/* Grammatical features grid */}
                  <fieldset className="border border-stone-200 rounded p-3 mt-3">
                    <legend className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-1">
                      Inflections & Features
                    </legend>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                      <label className="block">
                        Case
                        <select
                          value={activeToken.inflections.case || ""}
                          onChange={(e) => updateInflection("case", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="nominative">Nominative</option>
                          <option value="accusative">Accusative</option>
                          <option value="genitive">Genitive</option>
                          <option value="dative">Dative</option>
                        </select>
                      </label>

                      <label className="block">
                        Number
                        <select
                          value={activeToken.inflections.number || ""}
                          onChange={(e) => updateInflection("number", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="singular">Singular</option>
                          <option value="plural">Plural</option>
                        </select>
                      </label>

                      <label className="block">
                        Gender
                        <select
                          value={activeToken.inflections.gender || ""}
                          onChange={(e) => updateInflection("gender", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="masculine">Masculine</option>
                          <option value="feminine">Feminine</option>
                          <option value="neuter">Neuter</option>
                        </select>
                      </label>

                      <label className="block">
                        Tense
                        <select
                          value={activeToken.inflections.tense || ""}
                          onChange={(e) => updateInflection("tense", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="present">Present</option>
                          <option value="past">Past</option>
                        </select>
                      </label>

                      <label className="block">
                        Mood
                        <select
                          value={activeToken.inflections.mood || ""}
                          onChange={(e) => updateInflection("mood", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="indicative">Indicative</option>
                          <option value="subjunctive">Subjunctive</option>
                          <option value="imperative">Imperative</option>
                          <option value="infinitive">Infinitive</option>
                        </select>
                      </label>

                      <label className="block">
                        Person
                        <select
                          value={activeToken.inflections.person || ""}
                          onChange={(e) => updateInflection("person", e.target.value)}
                          className="w-full border border-stone-300 rounded p-1 mt-0.5 text-xs"
                        >
                          <option value="">None</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </label>
                    </div>
                  </fieldset>
                </div>

                {/* 3. Morphemes Interactive List Builder */}
                <div className="border-t border-stone-100 pt-3">
                  <span className="block text-xs font-bold text-stone-700 mb-2">
                    Morphemes Breakdown ({activeToken.morphemes?.length || 0})
                  </span>
                  <div className="space-y-2">
                    {(activeToken.morphemes || []).map((morpheme, idx) => (
                      <div key={morpheme.id || idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Morpheme"
                          value={morpheme.morpheme}
                          onChange={(e) => updateMorphemeVal(idx, "morpheme", e.target.value)}
                          className="border border-stone-300 rounded p-1 text-xs w-1/2 focus:outline-none focus:border-amber-800"
                        />
                        <input
                          type="text"
                          placeholder="Gloss"
                          value={morpheme.gloss}
                          onChange={(e) => updateMorphemeVal(idx, "gloss", e.target.value)}
                          className="border border-stone-300 rounded p-1 text-xs w-1/2 focus:outline-none focus:border-amber-800"
                        />
                        <button
                          type="button"
                          onClick={() => removeMorpheme(idx)}
                          className="text-stone-400 hover:text-amber-800 text-sm font-bold p-1"
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
                    className="text-xs text-amber-900 font-semibold underline mt-2 flex items-center"
                  >
                    + Add Morpheme
                  </button>
                </div>

                {/* 4. Lexical Details */}
                <div className="border-t border-stone-100 pt-3 space-y-3">
                  <label className="block text-xs font-bold text-stone-700">
                    IPA Pronunciation
                    <input
                      type="text"
                      placeholder="e.g. /ˈoːx.teː.re/"
                      value={activeToken.ipa}
                      onChange={(e) => updateToken({ ipa: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800 font-mono"
                    />
                  </label>

                  <label className="block text-xs font-bold text-stone-700">
                    Wiktionary URL
                    <input
                      type="url"
                      placeholder="https://en.wiktionary.org/wiki/..."
                      value={activeToken.wiktionaryUrl}
                      onChange={(e) => updateToken({ wiktionaryUrl: e.target.value })}
                      className="w-full border border-stone-300 rounded p-2 mt-1 text-xs focus:outline-none focus:border-amber-800"
                    />
                  </label>
                </div>

                {/* 5. Reader Popup Preview Card */}
                <div className="border-t border-stone-200 pt-4 mt-4 bg-amber-50/20 p-4 border rounded-lg border-amber-100">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-800 mb-1.5">
                    Reader Popup Preview
                  </span>
                  <div className="space-y-1">
                    <p className="text-stone-900 font-serif font-bold text-base flex items-center gap-1.5">
                      {activeToken.lemma || activeToken.sourceForm.replace(/[.,;:!?]+$/, "")}
                      <span className="text-xs font-sans text-stone-500 font-normal italic">
                        ({activeToken.pos || "unclassified"})
                      </span>
                    </p>
                    {activeToken.ipa && (
                      <p className="text-xs text-stone-500 font-mono">
                        {activeToken.ipa}
                      </p>
                    )}
                    <p className="text-sm text-stone-700 mt-1">
                      {activeToken.explanation || "No gloss definition set."}
                    </p>
                    {Object.values(activeToken.inflections).some(Boolean) && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(activeToken.inflections)
                          .filter(([, v]) => Boolean(v))
                          .map(([k, v]) => (
                            <span key={k} className="text-[10px] bg-amber-100/60 text-amber-900 px-1.5 py-0.5 rounded uppercase font-bold tracking-tight">
                              {v}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-stone-500 text-sm mt-4 text-center py-8">
                Select any word in the document feed to inspect and customize its linguistic layers.
              </p>
            )}
          </aside>
        </div>

        {/* Multi-Sentence gb4e Importer (Dedicated full-width section at bottom of page) */}
        <section className="workspace-panel editor-import" style={{ marginTop: "2rem" }}>
          <p className="workspace-eyebrow" style={{ margin: 0 }}>Batch Import Pipeline</p>
          <h2 id="import-heading" style={{ margin: "0.25rem 0 1rem", fontSize: "1.3rem" }}>Paste one or more gb4e</h2>
          
          <div className="editor-field" style={{ marginTop: 0 }}>
            <label>{"Paste gb4e latex blocks (multiple \\ex or \\begin{exe} structures supported)"}</label>
            <textarea
              rows={5}
              value={latexImportSource}
              onChange={(e) => {
                setLatexImportSource(e.target.value);
                setImportPreview(null);
              }}
              placeholder="\ex{\gll Ōhthere sǣ-d-e ...\\&#10;Ohthere.\textsc{nom} say-\textsc{pst} ...\\&#10;\glt `Ohthere said ...'}"
            />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              disabled={!latexImportSource.trim()}
              onClick={() => setImportPreview(parseMultiSentenceGb4e(latexImportSource))}
              className="workspace-button"
            >
              Preview Import
            </button>
          </div>

          {importPreview && (
            <div style={{ marginTop: "1rem", padding: "1rem", background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "0.35rem" }}>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                Found <strong>{importPreview.length}</strong> sentences with <strong>{importPreview.reduce((acc, curr) => acc + curr.tokens.length, 0)}</strong> total tokens.
              </p>
              {importPreview.length > 0 && (
                <button
                  type="button"
                  onClick={applyImportedSentences}
                  className="workspace-button"
                  style={{ marginTop: "0.75rem", background: "var(--accent)", color: "#fff" }}
                >
                  Apply {importPreview.length} sentences to document
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
