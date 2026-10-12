import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { EditorDocument } from "./gloss-editor";

interface EditMetadataModalProps {
  document: EditorDocument;
  onSave: (updatedMeta: Partial<EditorDocument>) => void;
  onClose: () => void;
}

export function EditMetadataModal({ document, onSave, onClose }: EditMetadataModalProps) {
  const [metaTitle, setMetaTitle] = useState(document.title || "");
  const [metaHistoricalAuthor, setMetaHistoricalAuthor] = useState(document.historicalAuthor || "Anonymous");
  const [metaGlossedBy, setMetaGlossedBy] = useState(document.glossedBy || document.editor || "");
  const [metaDate, setMetaDate] = useState(document.date || "");
  const [metaSourceEdition, setMetaSourceEdition] = useState(document.sourceEdition || document.shelfmark || "");

  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTitle = metaTitle.trim() || document.title;
    const updatedHistAuthor = metaHistoricalAuthor.trim() || "Anonymous";
    const updatedGlossedBy = metaGlossedBy.trim() || "";
    const updatedDate = metaDate.trim() || document.date;
    const updatedSourceEdition = metaSourceEdition.trim();

    onSave({
      title: updatedTitle,
      author: updatedGlossedBy,
      historicalAuthor: updatedHistAuthor,
      glossedBy: updatedGlossedBy,
      editor: updatedGlossedBy,
      date: updatedDate,
      sourceEdition: updatedSourceEdition,
      shelfmark: updatedSourceEdition || document.shelfmark,
      source: `${updatedGlossedBy} · ${updatedDate}`,
    });
  };

  return (
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
      onMouseDown={(e) => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
          onClose();
        }
        mouseDownTargetRef.current = null;
      }}
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
            onClick={onClose}
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
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
              onFocus={(e) => e.target.select()}
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
              onClick={onClose}
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
  );
}
