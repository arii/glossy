"use client";

import { useState } from "react";
import Link from "next/link";
import type { InterlinearWord, ReadingSentence, TextDocument } from "../lib/types";

type EditableDocument = TextDocument & { fileName: string; sentences: ReadingSentence[] };

export function GlossEditor({ initialDocument }: { initialDocument: EditableDocument }) {
  const [document, setDocument] = useState<EditableDocument>(() => structuredClone(initialDocument));
  const [activeSentenceId, setActiveSentenceId] = useState(initialDocument.sentences[0]?.id ?? "");
  const [activeWordId, setActiveWordId] = useState(initialDocument.sentences[0]?.words[0]?.id ?? "");
  const [saveState, setSaveState] = useState<{ kind: "idle" | "success" | "error"; message: string }>({
    kind: "idle",
    message: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const activeSentence = document.sentences.find((sentence) => sentence.id === activeSentenceId);
  const activeWord = activeSentence?.words.find((word) => word.id === activeWordId);
  const isDirty = JSON.stringify(document) !== JSON.stringify(initialDocument);

  const updateSentence = (patch: Partial<ReadingSentence>) => {
    setDocument((current) => ({
      ...current,
      sentences: current.sentences.map((sentence) =>
        sentence.id === activeSentenceId ? { ...sentence, ...patch } : sentence,
      ),
    }));
  };

  const updateWord = (patch: Partial<InterlinearWord>) => {
    setDocument((current) => ({
      ...current,
      sentences: current.sentences.map((sentence) =>
        sentence.id === activeSentenceId
          ? {
              ...sentence,
              words: sentence.words.map((word) =>
                word.id === activeWordId
                  ? {
                      ...word,
                      ...patch,
                      analysis: word.analysis
                        ? { ...word.analysis, ...(patch.analysis ?? {}) }
                        : patch.analysis,
                    }
                  : word,
              ),
            }
          : sentence,
      ),
    }));
  };

  const selectSentence = (sentenceId: string) => {
    const sentence = document.sentences.find((item) => item.id === sentenceId);
    setActiveSentenceId(sentenceId);
    setActiveWordId(sentence?.words[0]?.id ?? "");
  };

  const saveToTina = async () => {
    if (!isDirty || isSaving) return;
    if (!window.confirm(`Save the current edits to TinaCMS for "${document.title}"? This updates the Git-backed JSON file in your working tree.`)) {
      return;
    }

    setIsSaving(true);
    setSaveState({ kind: "idle", message: "" });
    const { fileName, ...content } = document;

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
              relativePath: `${fileName}.json`,
              params: { text: content },
            },
          }),
        },
      );
      const result = (await response.json()) as {
        data?: { updateDocument?: { _sys?: { relativePath?: string } } };
        errors?: Array<{ message: string }>;
      };
      if (!response.ok || result.errors?.length || !result.data?.updateDocument?._sys?.relativePath) {
        throw new Error(result.errors?.map((error) => error.message).join("; ") || `TinaCMS returned HTTP ${response.status}.`);
      }
      setSaveState({
        kind: "success",
        message: `Saved content/texts/${result.data.updateDocument._sys.relativePath} to the Git working tree. It has not been committed or pushed.`,
      });
    } catch (error) {
      setSaveState({
        kind: "error",
        message: error instanceof Error ? error.message : "The TinaCMS save failed.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeSentence) {
    return (
      <main className="workspace-shell">
        <p>This text has no examples to edit yet.</p>
        <Link href="/">Back to Glossy</Link>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <div className="workspace">
        <header className="workspace-header">
          <div>
            <p className="workspace-eyebrow">Glossy · Editing workspace</p>
            <h1>{document.title}</h1>
            <p className="source-line">{document.source}</p>
          </div>
          <nav className="workspace-actions" aria-label="Editor actions">
            <a className="workspace-link" href={`/read/${document.slug}`}>Open reader</a>
            <a className="workspace-link" href="/admin/index.html">TinaCMS</a>
            <button className="workspace-button" type="button" disabled={!isDirty || isSaving} onClick={saveToTina}>
              {isSaving ? "Saving…" : "Save to TinaCMS"}
            </button>
          </nav>
        </header>
        {saveState.message && (
          <p className={`editor-save-status is-${saveState.kind}`} role={saveState.kind === "error" ? "alert" : "status"}>
            {saveState.message}
          </p>
        )}

        <div className="workspace-grid">
          <section className="workspace-panel" aria-labelledby="live-preview-heading">
            <p className="workspace-eyebrow">Live preview</p>
            <h2 id="live-preview-heading">Interlinear text</h2>
            <label className="editor-sentence-picker">
              Example
              <select
                value={activeSentenceId}
                onChange={(event) => selectSentence(event.target.value)}
              >
                {document.sentences.map((sentence, index) => (
                  <option key={sentence.id} value={sentence.id}>
                    {index + 1}. {sentence.words.slice(0, 5).map((word) => word.originalWord).join(" ")}
                  </option>
                ))}
              </select>
            </label>

            <div className="editor-interlinear" aria-label="Editable interlinear preview">
              {activeSentence.words.map((word) => (
                <button
                  type="button"
                  key={word.id}
                  className={`editor-token${word.id === activeWordId ? " is-active" : ""}`}
                  aria-pressed={word.id === activeWordId}
                  onClick={() => setActiveWordId(word.id)}
                >
                  <span>{word.originalWord}{word.trailingPunctuation}</span>
                  <span className="editor-token-gloss">{word.morphologicalGloss ?? word.originalWord}</span>
                </button>
              ))}
            </div>

            <label className="editor-field">
              Free translation
              <textarea
                value={activeSentence.translation}
                onChange={(event) => updateSentence({ translation: event.target.value })}
              />
            </label>
            <p className="editor-translation">{activeSentence.translation}</p>
            <p className="editor-source-note">
              Selecting a word opens its fields in the inspector. Changes here update this preview only.
            </p>
          </section>

          <aside className="editor-inspector" aria-labelledby="inspector-heading">
            <p className="workspace-eyebrow">Selected token</p>
            <h2 id="inspector-heading">{activeWord?.originalWord ?? "Choose a word"}</h2>
            {activeWord ? (
              <>
                <label className="editor-field">
                  Source form
                  <input
                    value={activeWord.originalWord}
                    onChange={(event) => updateWord({ originalWord: event.target.value })}
                  />
                </label>
                <label className="editor-field">
                  Source gloss
                  <input
                    value={activeWord.morphologicalGloss ?? ""}
                    onChange={(event) => updateWord({ morphologicalGloss: event.target.value })}
                  />
                </label>
                <label className="editor-field">
                  Lemma
                  <input
                    value={activeWord.analysis?.lemma ?? ""}
                    onChange={(event) =>
                      updateWord({ analysis: { ...(activeWord.analysis ?? emptyAnalysis(activeWord)), lemma: event.target.value } })
                    }
                  />
                </label>
                <label className="editor-field">
                  Explanation
                  <textarea
                    value={activeWord.analysis?.definition ?? ""}
                    onChange={(event) =>
                      updateWord({ analysis: { ...(activeWord.analysis ?? emptyAnalysis(activeWord)), definition: event.target.value } })
                    }
                  />
                </label>
                <div className="editor-preview-details">
                  <span className="field-label">Reader detail</span>
                  <p>{activeWord.analysis?.definition || activeWord.morphologicalGloss || activeWord.originalWord}</p>
                </div>
              </>
            ) : (
              <p>Select a token in the preview to inspect its fields.</p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function emptyAnalysis(word: InterlinearWord) {
  return {
    lemma: word.originalWord,
    partOfSpeech: "noun" as const,
    features: {},
    morphemes: [],
    definition: "",
  };
}
