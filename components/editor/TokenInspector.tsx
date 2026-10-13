"use client";

import React from "react";
import type { EditorToken, EditorSentence } from "../gloss-editor";
import type { PartOfSpeech, InflectionFeatures, NoteItem, NoteType, Morpheme } from "../../lib/types";
import { resolveOldEnglishLexicon } from "../../lib/old-english-lexicon";
import { FileText, X, RotateCcw, ShieldAlert } from "lucide-react";

export interface TokenInspectorProps {
  activeToken: EditorToken | null;
  activeSentence?: EditorSentence | null;
  updateToken: (patch: Partial<EditorToken>) => void;
  updateInflection: (key: keyof InflectionFeatures, val: string | number | undefined) => void;
  handleSourceFormChange: (val: string) => void;
  handleSourceGlossChange: (val: string) => void;
  addMorpheme: () => void;
  updateMorphemeVal: (mIdx: number, field: "form" | "gloss", val: string) => void;
  removeMorpheme: (mIdx: number) => void;
  addNoteToSentence?: (sentenceId: string, targetWordIndex?: number) => void;
  updateSentenceNote?: (sentenceId: string, noteId: string, patch: Partial<NoteItem>) => void;
  removeSentenceNote?: (sentenceId: string, noteId: string) => void;
}

export function TokenInspector({
  activeToken,
  activeSentence,
  updateToken,
  updateInflection,
  handleSourceFormChange,
  handleSourceGlossChange,
  addMorpheme,
  updateMorphemeVal,
  removeMorpheme,
  updateSentenceNote,
  removeSentenceNote,
}: TokenInspectorProps) {
  if (!activeToken) {
    return (
      <aside className="editor-inspector-card">
        <div className="editor-inspector-header">
          <h2
            className="workspace-eyebrow"
            style={{
              margin: 0,
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--accent)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Selected Token Inspector
          </h2>
        </div>
        <p style={{ color: "var(--muted-ink)", fontSize: "0.9rem" }}>
          Select any word in the document feed on the left to inspect its linguistic layers.
        </p>
      </aside>
    );
  }

  const cleanHeaderWord = activeToken.sourceForm
    ? activeToken.sourceForm.replace(/[.,;:!?]+$/, "")
    : "";

  const isOverrideActive = Boolean(activeToken.contextualOverride);

  const handleToggleOverride = (enable: boolean) => {
    if (enable) {
      const currentDef = activeToken.explanation || "";
      const currentPos = activeToken.pos || "noun";
      const currentNotes = activeToken.historicalNote || "";

      updateToken({
        contextualOverride: {
          definition: currentDef,
          pos: currentPos,
          notes: currentNotes,
        },
      });
    } else {
      handleRevertToLexiconDefault();
    }
  };

  const handleRevertToLexiconDefault = () => {
    const lex = resolveOldEnglishLexicon(
      activeToken.sourceForm.replace(/[,.;:!?]+$/, ""),
      activeToken.sourceGloss || activeToken.sourceForm,
    );
    const defaultPos = (lex.pos || "noun") as PartOfSpeech;
    const defaultDef = lex.definition || activeToken.sourceGloss || "";

    updateToken({
      contextualOverride: undefined,
      pos: defaultPos,
      explanation: defaultDef,
    });
  };

  const handleExplanationChange = (val: string) => {
    if (isOverrideActive) {
      updateToken({
        explanation: val,
        contextualOverride: {
          ...activeToken.contextualOverride,
          definition: val,
        },
      });
    } else {
      updateToken({ explanation: val });
    }
  };

  const handlePosChange = (newPos: PartOfSpeech) => {
    if (isOverrideActive) {
      updateToken({
        pos: newPos,
        contextualOverride: {
          ...activeToken.contextualOverride,
          pos: newPos,
        },
      });
    } else {
      updateToken({ pos: newPos });
    }
  };

  return (
    <aside className="editor-inspector-card">
      <div className="editor-inspector-header">
        <h2
          className="workspace-eyebrow"
          style={{
            margin: 0,
            fontSize: "0.82rem",
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Selected Token Inspector
        </h2>
      </div>

      <div>
        {/* Contextual Override Toggle & Controls */}
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: isOverrideActive ? "#fefce8" : "#fbf7ee",
            border: `1px solid ${isOverrideActive ? "#fde047" : "var(--rule)"}`,
            borderRadius: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "var(--ink)", margin: 0 }}>
              <input
                type="checkbox"
                checked={isOverrideActive}
                onChange={(e) => handleToggleOverride(e.target.checked)}
                style={{ cursor: "pointer", width: "1rem", height: "1rem", accentColor: "var(--accent)" }}
              />
              <span>Override for this occurrence</span>
            </label>

            {isOverrideActive && (
              <button
                type="button"
                onClick={handleRevertToLexiconDefault}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#854d0e",
                  background: "#ffffff",
                  border: "1px solid #fde047",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                }}
                title="Revert definition & POS to global lexicon defaults"
              >
                <RotateCcw style={{ width: "0.75rem", height: "0.75rem" }} />
                Revert to Lexicon Default
              </button>
            )}
          </div>

          <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)", lineHeight: 1.35 }}>
            {isOverrideActive ? (
              <span style={{ color: "#854d0e", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <ShieldAlert style={{ width: "0.8rem", height: "0.8rem" }} />
                Edits apply strictly to this token occurrence (`token.contextualOverride`).
              </span>
            ) : (
              "When enabled, edits write to `token.contextualOverride` without touching shared lexicon entries."
            )}
          </p>
        </div>

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
              onChange={(e) =>
                updateToken({
                  lemma: e.target.value,
                  lemmaRef: e.target.value,
                })
              }
            />
          </div>

          <div className="editor-form-group">
            <label>Part of Speech {isOverrideActive && "(Override)"}</label>
            <select
              value={activeToken.pos}
              onChange={(e) => handlePosChange(e.target.value as PartOfSpeech)}
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

        {/* 5. Explanation / Definition */}
        <div className="editor-form-group">
          <label htmlFor="token-inspector-explanation">
            Explanation {isOverrideActive ? "(Contextual Override Active)" : "(Lexicon Default)"}
          </label>
          <textarea
            id="token-inspector-explanation"
            rows={2}
            value={activeToken.explanation}
            onChange={(e) => handleExplanationChange(e.target.value)}
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
                value={
                  activeToken.inflections.person
                    ? String(activeToken.inflections.person)
                    : ""
                }
                onChange={(e) =>
                  updateInflection(
                    "person",
                    e.target.value
                      ? (parseInt(e.target.value, 10) as 1 | 2 | 3)
                      : undefined,
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
            Morphemes Breakdown{" "}
            {activeToken.morphemes && activeToken.morphemes.length > 1
              ? `(${activeToken.morphemes.length})`
              : ""}
          </label>
          <div>
            {activeToken.morphemes &&
              activeToken.morphemes.length > 1 &&
              activeToken.morphemes.map((morpheme: Morpheme, idx: number) => (
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
          <button type="button" onClick={addMorpheme} className="add-morpheme-btn">
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
            <span>
              Sentence Footnotes / Critical Apparatus ({activeSentence?.notes?.length || 0})
            </span>
          </legend>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            {(activeSentence?.notes || []).map((note: NoteItem, nIdx: number) => (
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
                        updateSentenceNote?.(activeSentence.id, note.id, { marker: e.target.value })
                      }
                      style={{ width: "3.2rem", padding: "0.2rem 0.4rem", fontSize: "0.78rem", textAlign: "center" }}
                    />
                    <select
                      value={note.type || "manuscript_variant"}
                      onChange={(e) =>
                        activeSentence &&
                        updateSentenceNote?.(activeSentence.id, note.id, {
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
                    onClick={() => activeSentence && removeSentenceNote?.(activeSentence.id, note.id)}
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
                        updateSentenceNote?.(activeSentence.id, note.id, {
                          targetWordIndex: e.target.value !== "" ? Number(e.target.value) : undefined,
                        })
                      }
                      style={{ padding: "0.15rem 0.35rem", fontSize: "0.75rem", flex: 1 }}
                    >
                      <option value="">Whole Sentence</option>
                      {activeSentence.tokens.map((tok: EditorToken, tIdx: number) => (
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
                    updateSentenceNote?.(activeSentence.id, note.id, { text: e.target.value })
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
                  .map((m: Morpheme) => `${m.form || "?"} = ${m.gloss || "?"}`)
                  .join("   ")}
              </span>
            </div>
          )}

          {activeToken.wiktionaryUrl && (
            <div style={{ marginTop: "0.6rem" }}>
              <a
                href={activeToken.wiktionaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="reference-link"
                style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: 700 }}
              >
                Open in Wiktionary ↗
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
