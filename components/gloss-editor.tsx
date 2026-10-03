"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "./site-nav";
import { parseGb4e, type Gb4eImport } from "../lib/gb4e";
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
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialDocument));

  const draftKey = `glossy-draft-v1:${initialDocument.slug}`;
  const [draftNotice, setDraftNotice] = useState("");

  // Restore an unsaved draft once on load.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as EditableDocument;
      if (!Array.isArray(draft.sentences) || draft.slug !== initialDocument.slug) return;
      setDocument(draft);
      setDraftNotice("Restored your unsaved draft from this browser.");
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey, initialDocument.slug]);

  // Debounced draft backup; clear it when the document matches the saved copy.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (JSON.stringify(document) === savedSnapshot) {
        window.localStorage.removeItem(draftKey);
      } else {
        window.localStorage.setItem(draftKey, JSON.stringify(document));
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [document, savedSnapshot, draftKey]);

  const [latexSource, setLatexSource] = useState("");
  const [latexResult, setLatexResult] = useState<Gb4eImport | null>(null);

  const applyLatex = () => {
    if (!latexResult || latexResult.sentences.length === 0) return;
    const imported = latexResult.sentences.map((sentence) => ({
      ...sentence,
      footnotes: latexResult.footnotes[sentence.id],
    }));
    setDocument((current) => {
      const existing = new Map(current.sentences.map((sentence) => [sentence.id, sentence]));
      // Keep existing analysis for words whose source form is unchanged.
      const merged = imported.map((sentence) => {
        const old = existing.get(sentence.id);
        return {
          ...sentence,
          words: sentence.words.map((word, index) => {
            const oldWord = old?.words[index];
            return oldWord && oldWord.originalWord === word.originalWord
              ? { ...word, analysis: oldWord.analysis, review: oldWord.review }
              : word;
          }),
        };
      });
      const importedIds = new Set(merged.map((sentence) => sentence.id));
      const rest = current.sentences.filter((sentence) => !importedIds.has(sentence.id));
      return { ...current, sentences: [...merged, ...rest] };
    });
    setDraftNotice(`Imported ${imported.length} examples from LaTeX. Review them, then save.`);
    setLatexResult(null);
    setLatexSource("");
  };

  const discardDraft = () => {
    if (!window.confirm("Discard unsaved changes and go back to the last saved version?")) return;
    setDocument(JSON.parse(savedSnapshot) as EditableDocument);
    setDraftNotice("");
  };

  const activeSentence = document.sentences.find((sentence) => sentence.id === activeSentenceId);
  const activeWord = activeSentence?.words.find((word) => word.id === activeWordId);
  const isDirty = JSON.stringify(document) !== savedSnapshot;

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
      setSavedSnapshot(JSON.stringify(document));
      setDraftNotice("");
      setSaveState({
        kind: "success",
        message: `Saved content/texts/${result.data.updateDocument._sys.relativePath} to the Git working tree. It has not been committed or pushed.`,
      });
    } catch (error) {
      setSaveState({
        kind: "error",
        message:
          (error instanceof TypeError ? "Could not reach TinaCMS. Saving only works while `npm run dev` is running locally. " : "") +
          (error instanceof Error ? error.message : "The TinaCMS save failed."),
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
            <SiteNav current="edit" slug={document.slug} />
            <p className="workspace-eyebrow">Editing workspace</p>
            <h1>{document.title}</h1>
            <p className="source-line">{document.source}</p>
          </div>
          <nav className="workspace-actions" aria-label="Editor actions">
            <a className="workspace-link" href="/admin/index.html">TinaCMS</a>
            <span className={`editor-dirty is-${isDirty ? "dirty" : "clean"}`}>
              {isDirty ? "Unsaved changes" : "No unsaved changes"}
            </span>
            <button className="workspace-link" type="button" disabled={!isDirty || isSaving} onClick={discardDraft}>
              Discard changes
            </button>
            <button className="workspace-button" type="button" disabled={!isDirty || isSaving} onClick={saveToTina}>
              {isSaving ? "Saving…" : "Save to TinaCMS"}
            </button>
          </nav>
        </header>
        <ol className="editor-steps">
          <li>Pick an example and click a word.</li>
          <li>Edit its fields on the right; the preview updates live.</li>
          <li>Edits are kept as a draft in this browser. Click “Save to TinaCMS” (top right) to write them to the JSON file.</li>
        </ol>
        {draftNotice && <p className="editor-save-status is-idle" role="status">{draftNotice}</p>}
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
            <p className="editor-translation">‘{activeSentence.translation}’</p>
          </section>

          <section className="workspace-panel editor-import" aria-labelledby="import-heading">
            <p className="workspace-eyebrow">Import</p>
            <h2 id="import-heading">Paste gb4e LaTeX</h2>
            <label className="editor-field">
              Paste one or more gb4e examples (gll / glt blocks)
              <textarea
                rows={6}
                value={latexSource}
                onChange={(event) => {
                  setLatexSource(event.target.value);
                  setLatexResult(null);
                }}
              />
            </label>
            <button className="workspace-link" type="button" disabled={!latexSource.trim()} onClick={() => setLatexResult(parseGb4e(latexSource))}>
              Preview import
            </button>
            {latexResult && (
              <div role="status">
                <p>
                  Found {latexResult.sentences.length} examples,{" "}
                  {latexResult.sentences.reduce((total, sentence) => total + sentence.words.length, 0)} words,{" "}
                  {Object.keys(latexResult.footnotes).length} with footnotes.
                </p>
                {latexResult.warnings.length > 0 && (
                  <ul>{latexResult.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                )}
                {latexResult.sentences.length > 0 && (
                  <>
                    <button className="workspace-button" type="button" onClick={applyLatex}>
                      Add or update these examples
                    </button>
                    <p className="editor-source-note">
                      Examples with the same ID are replaced; analysis is kept for words whose source form is unchanged. Nothing is saved until you click Save to TinaCMS.
                    </p>
                  </>
                )}
              </div>
            )}
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
