"use client";

import React, { useMemo } from "react";
import type { TextDocument } from "../lib/types";
import { X, Trash2, Edit3, GitCommit, CheckCircle, AlertTriangle } from "lucide-react";
import { areDocumentsIdentical, findDocumentDifferences } from "../lib/canonical-json";

export interface DraftDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  repoDoc?: TextDocument | null;
  draftDoc?: TextDocument | null;
  updatedAt?: string;
  isUpstreamModified?: boolean;
  onDiscard?: () => void;
  onOpenEditor?: () => void;
  onExport?: () => void;
}

export interface DiffItem {
  id: string;
  type:
    | "meta"
    | "sentence_translation"
    | "sentence_notes"
    | "word_raw"
    | "word_gloss"
    | "word_pos"
    | "word_features"
    | "word_morphemes"
    | "word_definition"
    | "sentence_count";
  label: string;
  repoValue: string;
  draftValue: string;
}

function formatFeatures(features?: Record<string, unknown>): string {
  if (!features || Object.keys(features).length === 0) return "(none)";
  return Object.entries(features)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ") || "(none)";
}

function formatMorphemes(morphemes?: Array<{ form?: string; gloss?: string }>): string {
  if (!morphemes || morphemes.length === 0) return "(none)";
  return morphemes.map((m) => `${m.form || "?"} [${m.gloss || "?"}]`).join(" + ") || "(none)";
}

function formatNotes(notes?: Array<{ marker?: string; text?: string; type?: string }>): string {
  if (!notes || notes.length === 0) return "(none)";
  return notes.map((n) => `[${n.marker || "*"}] (${n.type || "note"}): ${n.text || ""}`).join("; ") || "(none)";
}

export function computeDraftDiffs(
  repoDoc?: TextDocument | null,
  draftDoc?: TextDocument | null
): DiffItem[] {
  if (!draftDoc) return [];
  const items: DiffItem[] = [];

  if (repoDoc) {
    if ((repoDoc.title || "").trim() !== (draftDoc.title || "").trim()) {
        items.push({
          id: "meta-title",
          type: "meta",
          label: "Document Title",
          repoValue: repoDoc.title || "(empty)",
          draftValue: draftDoc.title || "(empty)",
        });
      }

      const repoHist = (repoDoc.historicalAuthor || "").trim();
      const draftHist = (draftDoc.historicalAuthor || "").trim();
      if (repoHist !== draftHist) {
        items.push({
          id: "meta-historical-author",
          type: "meta",
          label: "Historical Author / Speaker",
          repoValue: repoHist || "(empty)",
          draftValue: draftHist || "(empty)",
        });
      }

      const repoAuthorRaw = (repoDoc.author || "").trim();
      const draftAuthorRaw = (draftDoc.author || "").trim();
      const repoGlossedBy = (repoDoc.glossedBy || repoDoc.editor || "").trim();
      const draftGlossedBy = (draftDoc.glossedBy || draftDoc.editor || "").trim();
      if (repoAuthorRaw !== draftAuthorRaw || repoGlossedBy !== draftGlossedBy) {
        items.push({
          id: "meta-author",
          type: "meta",
          label: "Author / Glossed by",
          repoValue: repoAuthorRaw ? `${repoAuthorRaw}${repoGlossedBy && repoGlossedBy !== repoAuthorRaw ? ` (Glossed: ${repoGlossedBy})` : ""}` : (repoGlossedBy || "(empty)"),
          draftValue: draftAuthorRaw ? `${draftAuthorRaw}${draftGlossedBy && draftGlossedBy !== draftAuthorRaw ? ` (Glossed: ${draftGlossedBy})` : ""}` : (draftGlossedBy || "(empty)"),
        });
      }

      const repoDate = (repoDoc.date || repoDoc.historicalDate || "").trim();
      const draftDate = (draftDoc.date || draftDoc.historicalDate || "").trim();
      if (repoDate !== draftDate) {
        items.push({
          id: "meta-date",
          type: "meta",
          label: "Date",
          repoValue: repoDate || "(empty)",
          draftValue: draftDate || "(empty)",
        });
      }

      const repoEdition = (repoDoc.sourceEdition || repoDoc.shelfmark || "").trim();
      const draftEdition = (draftDoc.sourceEdition || draftDoc.shelfmark || "").trim();
      if (repoEdition !== draftEdition) {
        items.push({
          id: "meta-edition",
          type: "meta",
          label: "Critical Edition / Witness",
          repoValue: repoEdition || "(empty)",
          draftValue: draftEdition || "(empty)",
        });
      }

      const repoDialect = (repoDoc.dialect || "").trim();
      const draftDialect = (draftDoc.dialect || "").trim();
      if (repoDialect !== draftDialect) {
        items.push({
          id: "meta-dialect",
          type: "meta",
          label: "Dialect",
          repoValue: repoDialect || "(empty)",
          draftValue: draftDialect || "(empty)",
        });
      }

      const repoSentences = repoDoc.sentences || [];
      const draftSentences = draftDoc.sentences || [];

      if (repoSentences.length !== draftSentences.length) {
        items.push({
          id: "sentence-count",
          type: "sentence_count",
          label: "Total Sentences",
          repoValue: `${repoSentences.length} sentence(s)`,
          draftValue: `${draftSentences.length} sentence(s)`,
        });
      }

      const maxLen = Math.max(repoSentences.length, draftSentences.length);
      for (let i = 0; i < maxLen; i++) {
        const repoSent = repoSentences[i];
        const draftSent = draftSentences[i];

        if (repoSent && draftSent) {
          if ((repoSent.translation || "").trim() !== (draftSent.translation || "").trim()) {
            items.push({
              id: `sent-trans-${i + 1}`,
              type: "sentence_translation",
              label: `Sentence ${i + 1} Translation`,
              repoValue: repoSent.translation || "(no translation)",
              draftValue: draftSent.translation || "(no translation)",
            });
          }

          const repoNotesFormatted = formatNotes(repoSent.notes);
          const draftNotesFormatted = formatNotes(draftSent.notes);
          if (repoNotesFormatted !== draftNotesFormatted) {
            items.push({
              id: `sent-notes-${i + 1}`,
              type: "sentence_notes",
              label: `Sentence ${i + 1} Notes / Critical Apparatus`,
              repoValue: repoNotesFormatted,
              draftValue: draftNotesFormatted,
            });
          }

          const repoWords = repoSent.words || [];
          const draftWords = draftSent.words || [];
          const maxWords = Math.max(repoWords.length, draftWords.length);

          for (let w = 0; w < maxWords; w++) {
            const rw = repoWords[w];
            const dw = draftWords[w];
            if (rw && dw) {
              const wordWord = dw.originalWord || rw.originalWord;
              const rwWord = (rw.originalWord || "").trim();
              const dwWord = (dw.originalWord || "").trim();
              const rwPunct = (rw.trailingPunctuation || "").trim();
              const dwPunct = (dw.trailingPunctuation || "").trim();

              if (rwWord !== dwWord || rwPunct !== dwPunct) {
                items.push({
                  id: `word-raw-${i + 1}-${w + 1}`,
                  type: "word_raw",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Source Form / Raw Token`,
                  repoValue: `"${rwWord}${rwPunct}" (Token: "${rwWord}"${rwPunct ? `, Punct: "${rwPunct}"` : ""})`,
                  draftValue: `"${dwWord}${dwPunct}" (Token: "${dwWord}"${dwPunct ? `, Punct: "${dwPunct}"` : ""})`,
                });
              }

              const rwGloss = rw.morphologicalGloss || rw.originalWord;
              const dwGloss = dw.morphologicalGloss || dw.originalWord;
              const rwLemma = rw.analysis?.lemma || "";
              const dwLemma = dw.analysis?.lemma || "";

              if (rwGloss !== dwGloss || rwLemma !== dwLemma) {
                items.push({
                  id: `word-gloss-${i + 1}-${w + 1}`,
                  type: "word_gloss",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Gloss / Lemma`,
                  repoValue: `Gloss: "${rwGloss}"${rwLemma ? ` · Lemma: ${rwLemma}` : ""}`,
                  draftValue: `Gloss: "${dwGloss}"${dwLemma ? ` · Lemma: ${dwLemma}` : ""}`,
                });
              }

              const rwPos = rw.analysis?.partOfSpeech || "";
              const dwPos = dw.analysis?.partOfSpeech || "";
              if (rwPos !== dwPos) {
                items.push({
                  id: `word-pos-${i + 1}-${w + 1}`,
                  type: "word_pos",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Part of Speech`,
                  repoValue: rwPos || "(unclassified)",
                  draftValue: dwPos || "(unclassified)",
                });
              }

              const rwDef = (rw.analysis?.definition || "").trim();
              const dwDef = (dw.analysis?.definition || "").trim();
              if (rwDef !== dwDef) {
                items.push({
                  id: `word-def-${i + 1}-${w + 1}`,
                  type: "word_definition",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Definition`,
                  repoValue: rwDef || "(none)",
                  draftValue: dwDef || "(none)",
                });
              }

              const rwFeaturesFormatted = formatFeatures(rw.analysis?.features as Record<string, unknown> | undefined);
              const dwFeaturesFormatted = formatFeatures(dw.analysis?.features as Record<string, unknown> | undefined);
              if (rwFeaturesFormatted !== dwFeaturesFormatted) {
                items.push({
                  id: `word-feat-${i + 1}-${w + 1}`,
                  type: "word_features",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Inflection Features`,
                  repoValue: rwFeaturesFormatted,
                  draftValue: dwFeaturesFormatted,
                });
              }

              const rwMorphemesFormatted = formatMorphemes(rw.analysis?.morphemes);
              const dwMorphemesFormatted = formatMorphemes(dw.analysis?.morphemes);
              if (rwMorphemesFormatted !== dwMorphemesFormatted) {
                items.push({
                  id: `word-morph-${i + 1}-${w + 1}`,
                  type: "word_morphemes",
                  label: `Sentence ${i + 1}, Word #${w + 1} (${wordWord}) — Morphemes`,
                  repoValue: rwMorphemesFormatted,
                  draftValue: dwMorphemesFormatted,
                });
              }
            } else if (!rw && dw) {
              items.push({
                id: `word-added-${i + 1}-${w + 1}`,
                type: "word_gloss",
                label: `Sentence ${i + 1}, Word #${w + 1} (${dw.originalWord})`,
                repoValue: "(word absent in repo edition)",
                draftValue: `Gloss: "${dw.morphologicalGloss || dw.originalWord}"`,
              });
            }
          }
        }
      }
    } else {
      items.push({
        id: "new-local-doc",
        type: "meta",
        label: "New Local Document",
        repoValue: "Not present in repository corpus",
        draftValue: `Created locally (${draftDoc.sentences?.length || 0} sentences)`,
      });
    }

    if (items.length === 0 && repoDoc && !areDocumentsIdentical(draftDoc, repoDoc)) {
      const fallbackDiffs = findDocumentDifferences(draftDoc, repoDoc);
      for (const fd of fallbackDiffs) {
        items.push({
          id: `diff-fallback-${fd.path}`,
          type: "meta",
          label: `Property: ${fd.path}`,
          repoValue: fd.repoVal !== undefined ? JSON.stringify(fd.repoVal) : "(absent)",
          draftValue: fd.draftVal !== undefined ? JSON.stringify(fd.draftVal) : "(absent)",
        });
      }
    }

    return items;
}

export function DraftDiffModal({
  isOpen,
  onClose,
  slug,
  repoDoc,
  draftDoc,
  updatedAt,
  isUpstreamModified = false,
  onDiscard,
  onOpenEditor,
  onExport,
}: DraftDiffModalProps) {
  const diffs = useMemo(() => computeDraftDiffs(repoDoc, draftDoc), [repoDoc, draftDoc]);

  if (!isOpen || !draftDoc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-diff-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(28, 25, 23, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          borderRadius: "0.6rem",
          maxWidth: "48rem",
          width: "100%",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--rule)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background: "#fbf7ee",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2
                id="draft-diff-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontFamily: "'Charis SIL', Georgia, serif",
                  color: "var(--ink)",
                }}
              >
                Local Draft Divergence &amp; Diff
              </h2>
              {isUpstreamModified ? (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#991b1b",
                    background: "#fef2f2",
                    border: "1px solid #fca5a5",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <AlertTriangle style={{ width: "0.75rem", height: "0.75rem" }} />
                  Upstream Updated
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#854d0e",
                    background: "#fef9c3",
                    border: "1px solid #fde047",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  Local Edits ({diffs.length} difference{diffs.length === 1 ? "" : "s"})
                </span>
              )}
            </div>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
              Target Document: <strong>{draftDoc.title || slug}</strong>
              {updatedAt && ` · Last edited in browser ${new Date(updatedAt).toLocaleString()}`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close diff modal"
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

        {/* Content Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {isUpstreamModified && (
            <div
              style={{
                marginBottom: "1.25rem",
                padding: "0.85rem 1rem",
                background: "#fef2f2",
                border: "1px solid #f87171",
                borderRadius: "0.375rem",
                fontSize: "0.85rem",
                color: "#991b1b",
                lineHeight: 1.5,
              }}
            >
              <strong>Upstream Conflict Alert:</strong> The repository version of this text was updated after your local draft was created. Review the differences below before choosing whether to discard local edits or export/commit your draft.
            </div>
          )}

          {diffs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--muted-ink)" }}>
              <CheckCircle style={{ width: "2.5rem", height: "2.5rem", color: "#16a34a", margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Local draft is identical to the published repository edition.
              </p>
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
                No diverged revisions or uncommitted edits detected for <em>{draftDoc.title}</em>.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {diffs.map((diff) => (
                <div
                  key={diff.id}
                  style={{
                    border: "1px solid var(--rule)",
                    borderRadius: "0.4rem",
                    overflow: "hidden",
                    background: "var(--surface)",
                  }}
                >
                  <div
                    style={{
                      background: "#f5eee6",
                      padding: "0.45rem 0.85rem",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
                    {diff.label}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
                    <div
                      style={{
                        padding: "0.75rem 0.85rem",
                        background: "#fff5f5",
                        borderRight: "1px solid var(--rule)",
                        fontSize: "0.88rem",
                        color: "#991b1b",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.72rem", color: "#b91c1c", marginBottom: "0.25rem" }}>
                        PUBLISHED REPOSITORY EDITION
                      </strong>
                      <span style={{ lineHeight: 1.4 }}>{diff.repoValue}</span>
                    </div>

                    <div
                      style={{
                        padding: "0.75rem 0.85rem",
                        background: "#f0fdf4",
                        fontSize: "0.88rem",
                        color: "#166534",
                      }}
                    >
                      <strong style={{ display: "block", fontSize: "0.72rem", color: "#15803d", marginBottom: "0.25rem" }}>
                        WORKING CLIENT DRAFT
                      </strong>
                      <span style={{ lineHeight: 1.4 }}>{diff.draftValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--rule)",
            background: "#fbf7ee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {onDiscard && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Discard local edits for "${draftDoc.title}" and revert to published repository edition?`)) {
                  onDiscard();
                  onClose();
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.5rem 0.9rem",
                borderRadius: "0.3rem",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                color: "#b91c1c",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Trash2 style={{ width: "0.85rem", height: "0.85rem" }} />
              Discard Local Draft
            </button>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
            {onOpenEditor && (
              <button
                type="button"
                onClick={() => {
                  onOpenEditor();
                  onClose();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 0.9rem",
                  borderRadius: "0.3rem",
                  background: "#ffffff",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <Edit3 style={{ width: "0.85rem", height: "0.85rem" }} />
                Open Editor
              </button>
            )}

            {onExport && (
              <button
                type="button"
                onClick={() => {
                  onExport();
                  onClose();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.3rem",
                  background: "var(--accent)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <GitCommit style={{ width: "0.85rem", height: "0.85rem" }} />
                Export / Commit to Repo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
