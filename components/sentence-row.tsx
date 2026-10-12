import React from "react";
import { Plus } from "lucide-react";
import type { EditorSentence } from "./gloss-editor";

export const SentenceRow = React.memo(function SentenceRow({
  sent,
  isSentActive,
  actualIndex,
  activeTokenId,
  setActiveSentenceId,
  setActiveTokenId,
  addNoteToSentence,
  updateFreeTranslation
}: {
  sent: EditorSentence;
  isSentActive: boolean;
  actualIndex: number;
  activeTokenId: string;
  setActiveSentenceId: (id: string) => void;
  setActiveTokenId: (id: string) => void;
  addNoteToSentence: (id: string) => void;
  updateFreeTranslation: (id: string, text: string) => void;
}) {
  return (
    <div
      id={`editor-sentence-${sent.id}`}
      onClick={() => setActiveSentenceId(sent.id)}
      className={`editor-sentence-card${isSentActive ? " is-active" : ""}`}
    >
      <div className="editor-sentence-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontFamily: "'Charis SIL', 'Noto Serif', Georgia, serif", fontWeight: 700, color: "var(--accent)" }}>
            Sentence {actualIndex}
          </h3>
          {sent.notes && sent.notes.length > 0 && (
            <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", borderRadius: "1rem", padding: "0.1rem 0.5rem", fontWeight: 600 }}>
              {sent.notes.length} {sent.notes.length === 1 ? "note" : "notes"}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveSentenceId(sent.id);
            addNoteToSentence(sent.id);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#7b3f2a",
            background: "#fbf7ee",
            border: "1px solid #dfcfb8",
            borderRadius: "0.3rem",
            padding: "0.25rem 0.55rem",
            cursor: "pointer",
          }}
          title="Add Note / Footnote to sentence"
        >
          <Plus style={{ width: "0.8rem", height: "0.8rem" }} />
          <span>Add Note / Footnote</span>
        </button>
      </div>

      {/* Word Chips */}
      <div className="editor-tokens-list">
        {sent.tokens.map((tok, tokIdx) => {
          const isTokActive = tok.id === activeTokenId;
          const tokNotes = (sent.notes || []).filter(
            (n) => n.targetWordIndex === tokIdx || n.targetWordIndex === tokIdx + 1,
          );

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
              style={{ position: "relative" }}
            >
              <span className="chip-form">
                {tok.sourceForm}
                {tokNotes.length > 0 && (
                  <sup style={{ fontSize: "0.68rem", fontWeight: 800, color: "#b45309", marginLeft: "2px" }}>
                    {tokNotes.map((n) => n.marker || "*").join(",")}
                  </sup>
                )}
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
          onChange={(e) => updateFreeTranslation(sent.id, e.target.value)}
          placeholder="Enter translation here..."
        />
      </div>
    </div>
  );
});
