"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { EditorDocument } from "../lib/editor-converters";

export interface EditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentState: EditorDocument;
  onSave: (metadata: {
    title: string;
    historicalAuthor: string;
    glossedBy: string;
    date: string;
    sourceEdition: string;
  }) => void;
}

export function EditMetadataModal({
  isOpen,
  onClose,
  documentState,
  onSave,
}: EditMetadataModalProps) {
  const [metaTitle, setMetaTitle] = useState("");
  const [metaHistoricalAuthor, setMetaHistoricalAuthor] = useState("");
  const [metaGlossedBy, setMetaGlossedBy] = useState("");
  const [metaDate, setMetaDate] = useState("");
  const [metaSourceEdition, setMetaSourceEdition] = useState("");

  useEffect(() => {
    if (isOpen && documentState) {
      setMetaTitle(documentState.title || "");
      setMetaHistoricalAuthor(documentState.historicalAuthor || "Anonymous");
      setMetaGlossedBy(documentState.glossedBy || documentState.editor || "");
      setMetaDate(documentState.date || "");
      setMetaSourceEdition(
        documentState.sourceEdition || documentState.shelfmark || ""
      );
    }
  }, [isOpen, documentState]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title: metaTitle.trim() || documentState.title,
      historicalAuthor: metaHistoricalAuthor.trim() || "Anonymous",
      glossedBy: metaGlossedBy.trim(),
      date: metaDate.trim() || documentState.date,
      sourceEdition: metaSourceEdition.trim(),
    });
    onClose();
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
      onClick={onClose}
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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
