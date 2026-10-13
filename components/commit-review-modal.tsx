"use client";

import React, { useMemo } from "react";
import type { TextDocument } from "../lib/types";
import { diffDocuments } from "../lib/document-diff";
import { X, CheckCircle, GitCommit, ShieldAlert } from "lucide-react";

export interface CommitReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCommit: () => void | Promise<void>;
  baseDoc: TextDocument;
  draftDoc: TextDocument;
  isSubmitting?: boolean;
}

export function CommitReviewModal({
  isOpen,
  onClose,
  onConfirmCommit,
  baseDoc,
  draftDoc,
  isSubmitting = false,
}: CommitReviewModalProps) {
  const diff = useMemo(() => {
    if (!isOpen || !baseDoc || !draftDoc) return null;
    return diffDocuments(baseDoc, draftDoc);
  }, [isOpen, baseDoc, draftDoc]);

  const overrideCount = useMemo(() => {
    if (!diff) return 0;
    return diff.sentenceDiffs.reduce((acc, sent) => {
      return acc + sent.tokenDeltas.filter((td) => td.field === "override").length;
    }, 0);
  }, [diff]);

  if (!isOpen || !diff) return null;

  const { summary, sentenceDiffs, hasChanges } = diff;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="commit-review-modal-title"
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
          maxWidth: "52rem",
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
              <GitCommit style={{ width: "1.25rem", height: "1.25rem", color: "var(--accent)" }} />
              <h2
                id="commit-review-modal-title"
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontFamily: "'Charis SIL', Georgia, serif",
                  color: "var(--ink)",
                }}
              >
                Review Changes Before Commit
              </h2>
            </div>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
              Comparing working draft against baseline repository edition for <strong>{draftDoc.title || draftDoc.slug}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close review modal"
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

        {/* Summary Chip Bar */}
        <div
          style={{
            padding: "0.85rem 1.5rem",
            borderBottom: "1px solid var(--rule)",
            background: "#f5eee6",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Summary:
          </span>

          {summary.metadataChanged && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde047",
              }}
            >
              Metadata Modified
            </span>
          )}

          {summary.translationsModified > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#dbeafe",
                color: "#1e40af",
                border: "1px solid #bfdbfe",
              }}
            >
              {summary.translationsModified} Translation{summary.translationsModified === 1 ? "" : "s"} Modified
            </span>
          )}

          {summary.tokensModified > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#dcfce7",
                color: "#166534",
                border: "1px solid #bbf7d0",
              }}
            >
              {summary.tokensModified} Token{summary.tokensModified === 1 ? "" : "s"} Updated
            </span>
          )}

          {overrideCount > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#fef9c3",
                color: "#854d0e",
                border: "1px solid #fde047",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <ShieldAlert style={{ width: "0.75rem", height: "0.75rem" }} />
              {overrideCount} Override{overrideCount === 1 ? "" : "s"} Active
            </span>
          )}

          {summary.sentencesAdded > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#e0e7ff",
                color: "#3730a3",
                border: "1px solid #c7d2fe",
              }}
            >
              {summary.sentencesAdded} Sentence{summary.sentencesAdded === 1 ? "" : "s"} Added
            </span>
          )}

          {summary.sentencesRemoved > 0 && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#fee2e2",
                color: "#991b1b",
                border: "1px solid #fca5a5",
              }}
            >
              {summary.sentencesRemoved} Sentence{summary.sentencesRemoved === 1 ? "" : "s"} Removed
            </span>
          )}

          {!hasChanges && (
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                padding: "0.2rem 0.6rem",
                borderRadius: "1rem",
                background: "#f3f4f6",
                color: "#4b5563",
              }}
            >
              No Changes Detected
            </span>
          )}
        </div>

        {/* Content Body */}
        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>
          {!hasChanges ? (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "var(--muted-ink)" }}>
              <CheckCircle style={{ width: "2.5rem", height: "2.5rem", color: "#16a34a", margin: "0 auto 0.75rem" }} />
              <p style={{ fontSize: "1rem", fontWeight: 600, color: "var(--ink)", margin: 0 }}>
                Working draft is identical to the baseline edition.
              </p>
              <p style={{ fontSize: "0.85rem", margin: "0.35rem 0 0" }}>
                No sentence translations, glosses, or overrides differ from baseline.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {sentenceDiffs
                .filter((s) => s.type !== "unchanged")
                .map((sDiff, sIdx) => (
                  <div
                    key={sDiff.sentenceId || sIdx}
                    style={{
                      border: "1px solid var(--rule)",
                      borderRadius: "0.5rem",
                      overflow: "hidden",
                      background: "var(--surface)",
                    }}
                  >
                    {/* Sentence Group Header */}
                    <div
                      style={{
                        background: "#fbf7ee",
                        padding: "0.6rem 1rem",
                        borderBottom: "1px solid var(--rule)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--ink)" }}>
                        Sentence ID: <code style={{ fontFamily: "monospace", color: "var(--accent)" }}>{sDiff.sentenceId}</code>
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          padding: "0.15rem 0.5rem",
                          borderRadius: "0.25rem",
                          background:
                            sDiff.type === "added"
                              ? "#dcfce7"
                              : sDiff.type === "removed"
                              ? "#fee2e2"
                              : "#fef3c7",
                          color:
                            sDiff.type === "added"
                              ? "#166534"
                              : sDiff.type === "removed"
                              ? "#991b1b"
                              : "#92400e",
                        }}
                      >
                        {sDiff.type}
                      </span>
                    </div>

                    <div style={{ padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                      {/* Sentence Translation Delta */}
                      {sDiff.translationDelta && (
                        <div>
                          <strong style={{ display: "block", fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                            Translation Modified
                          </strong>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                            <div
                              style={{
                                padding: "0.6rem 0.75rem",
                                background: "#fff5f5",
                                border: "1px solid #fca5a5",
                                borderRadius: "0.375rem",
                                fontSize: "0.85rem",
                                color: "#991b1b",
                              }}
                            >
                              <strong style={{ display: "block", fontSize: "0.7rem", color: "#b91c1c", marginBottom: "0.2rem" }}>
                                BEFORE
                              </strong>
                              {sDiff.translationDelta.before || "(empty)"}
                            </div>
                            <div
                              style={{
                                padding: "0.6rem 0.75rem",
                                background: "#f0fdf4",
                                border: "1px solid #86efac",
                                borderRadius: "0.375rem",
                                fontSize: "0.85rem",
                                color: "#166534",
                              }}
                            >
                              <strong style={{ display: "block", fontSize: "0.7rem", color: "#15803d", marginBottom: "0.2rem" }}>
                                AFTER
                              </strong>
                              {sDiff.translationDelta.after || "(empty)"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Token Deltas */}
                      {sDiff.tokenDeltas.length > 0 && (
                        <div>
                          <strong style={{ display: "block", fontSize: "0.75rem", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                            Token Changes ({sDiff.tokenDeltas.length})
                          </strong>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {sDiff.tokenDeltas.map((tDelta, tIdx) => (
                              <div
                                key={`${tDelta.tokenId}-${tDelta.field}-${tIdx}`}
                                style={{
                                  border: "1px solid var(--rule)",
                                  borderRadius: "0.375rem",
                                  padding: "0.5rem 0.75rem",
                                  background: "#ffffff",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink)" }}>
                                    Word: <span style={{ fontFamily: "'Charis SIL', Georgia, serif", color: "var(--accent)" }}>&quot;{tDelta.surface}&quot;</span>
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "0.72rem",
                                      fontWeight: 600,
                                      padding: "0.1rem 0.4rem",
                                      borderRadius: "0.2rem",
                                      background: tDelta.field === "override" ? "#fef9c3" : "#f3f4f6",
                                      color: tDelta.field === "override" ? "#854d0e" : "#374151",
                                      border: tDelta.field === "override" ? "1px solid #fde047" : "1px solid #e5e7eb",
                                    }}
                                  >
                                    Field: {tDelta.field}
                                  </span>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                                  <div
                                    style={{
                                      padding: "0.45rem 0.6rem",
                                      background: "#fff5f5",
                                      border: "1px solid #fca5a5",
                                      borderRadius: "0.25rem",
                                      fontSize: "0.82rem",
                                      color: "#991b1b",
                                    }}
                                  >
                                    <strong style={{ display: "block", fontSize: "0.68rem", color: "#b91c1c" }}>
                                      BEFORE
                                    </strong>
                                    {tDelta.before || "(empty)"}
                                  </div>
                                  <div
                                    style={{
                                      padding: "0.45rem 0.6rem",
                                      background: "#f0fdf4",
                                      border: "1px solid #86efac",
                                      borderRadius: "0.25rem",
                                      fontSize: "0.82rem",
                                      color: "#166534",
                                    }}
                                  >
                                    <strong style={{ display: "block", fontSize: "0.68rem", color: "#15803d" }}>
                                      AFTER
                                    </strong>
                                    {tDelta.after || "(empty)"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
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
            Cancel / Return to Editing
          </button>

          <button
            type="button"
            onClick={onConfirmCommit}
            disabled={isSubmitting || !hasChanges}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1.1rem",
              borderRadius: "0.3rem",
              background: "var(--accent)",
              border: "none",
              color: "#ffffff",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: isSubmitting || !hasChanges ? "not-allowed" : "pointer",
              opacity: isSubmitting || !hasChanges ? 0.6 : 1,
            }}
          >
            <GitCommit style={{ width: "0.9rem", height: "0.9rem" }} />
            {isSubmitting ? "Committing..." : "Confirm & Commit"}
          </button>
        </div>
      </div>
    </div>
  );
}
