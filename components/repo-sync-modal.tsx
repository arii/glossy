"use client";

import React, { useState } from "react";
import { GitPullRequest, GitCommit, Download, ExternalLink, X, CheckCircle2, AlertCircle } from "lucide-react";
import { isTinaAuthenticated, commitPendingDraft } from "../lib/tina-sync";
import { readDraft } from "../lib/local-drafts";
import { formatExportJson } from "../lib/canonical-json";
import { exportToGb4eLatex } from "../data/latex-export";
import type { TextDocument } from "../lib/types";

export interface RepoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  cms?: unknown;
  currentDocument?: TextDocument;
  onOpenDiffModal?: () => void;
  onSynced?: () => void;
}

export function RepoSyncModal({
  isOpen,
  onClose,
  slug,
  cms,
  currentDocument,
  onOpenDiffModal,
  onSynced,
}: RepoSyncModalProps) {
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<"idle" | "success" | "error">("idle");

  if (!isOpen) return null;

  const authenticated = isTinaAuthenticated(cms);

  const handleCommit = async () => {
    setIsCommitting(true);
    setStatusKind("idle");
    setStatusMessage("Committing document changes to Git repository...");

    try {
      const res = await commitPendingDraft(slug, { cms });

      if (res.ok) {
        setStatusKind("success");
        setStatusMessage("✅ Successfully committed changes to Git repository!");
        if (onSynced) {
          onSynced();
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusKind("error");
        setStatusMessage(`Commit Failed: ${res.error || "Please sign in to TinaCMS admin mode."}`);
      }
    } catch (err) {
      setStatusKind("error");
      setStatusMessage(`Error: ${err instanceof Error ? err.message : "Commit failed"}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleExportPRPackage = () => {
    const draft = readDraft(slug);
    const docToExport = draft?.doc || currentDocument;
    if (!docToExport) return;

    // Export JSON
    const jsonStr = formatExportJson(docToExport);
    const jsonBlob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const jsonUrl = URL.createObjectURL(jsonBlob);
    const jsonAnchor = window.document.createElement("a");
    jsonAnchor.href = jsonUrl;
    jsonAnchor.download = `${slug}.json`;
    jsonAnchor.click();
    URL.revokeObjectURL(jsonUrl);

    // Export LaTeX
    const texStr = exportToGb4eLatex(docToExport);
    const texBlob = new Blob([texStr], { type: "application/x-tex;charset=utf-8" });
    const texUrl = URL.createObjectURL(texBlob);
    const texAnchor = window.document.createElement("a");
    texAnchor.href = texUrl;
    texAnchor.download = `${slug}.tex`;
    texAnchor.click();
    URL.revokeObjectURL(texUrl);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "0.75rem",
          maxWidth: "32rem",
          width: "100%",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e7e5e4",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #e7e5e4",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fafaf9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <GitPullRequest style={{ width: "1.25rem", height: "1.25rem", color: "#d97706" }} />
            <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#1c1917" }}>
              Repository Sync &amp; Publishing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#78716c",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.25rem",
            }}
            title="Close modal"
          >
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Authentication Status Badge */}
          <div
            style={{
              padding: "0.85rem 1rem",
              borderRadius: "0.5rem",
              background: authenticated ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${authenticated ? "#bbf7d0" : "#fef08a"}`,
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
            }}
          >
            {authenticated ? (
              <CheckCircle2 style={{ width: "1.25rem", height: "1.25rem", color: "#16a34a", flexShrink: 0, marginTop: "0.1rem" }} />
            ) : (
              <AlertCircle style={{ width: "1.25rem", height: "1.25rem", color: "#d97706", flexShrink: 0, marginTop: "0.1rem" }} />
            )}
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: "0.88rem", color: authenticated ? "#15803d" : "#b45309", display: "block" }}>
                {authenticated ? "Authenticated with TinaCMS Admin" : "TinaCMS Authentication Required"}
              </strong>
              <span style={{ fontSize: "0.82rem", color: "#57534e", lineHeight: 1.4, display: "block", marginTop: "0.15rem" }}>
                {authenticated
                  ? "You have write access to commit changes directly to the repository."
                  : "Sign in to TinaCMS admin to commit changes directly, or export a PR package for offline review."}
              </span>

              {!authenticated && (
                <a
                  href="/admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "0.6rem",
                    padding: "0.35rem 0.75rem",
                    background: "#7b3f2a",
                    color: "#ffffff",
                    borderRadius: "0.375rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Log In to Admin <ExternalLink style={{ width: "0.8rem", height: "0.8rem" }} />
                </a>
              )}
            </div>
          </div>

          {statusMessage && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.375rem",
                fontSize: "0.85rem",
                fontWeight: 500,
                background:
                  statusKind === "success"
                    ? "#f0fdf4"
                    : statusKind === "error"
                    ? "#fef2f2"
                    : "#fffbeb",
                color:
                  statusKind === "success"
                    ? "#15803d"
                    : statusKind === "error"
                    ? "#b91c1c"
                    : "#b45309",
                border: `1px solid ${
                  statusKind === "success"
                    ? "#bbf7d0"
                    : statusKind === "error"
                    ? "#fecaca"
                    : "#fef08a"
                }`,
              }}
            >
              {statusMessage}
            </div>
          )}

          {/* Action Sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {/* 1. Review Changes */}
            {onOpenDiffModal && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "0.5rem" }}>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#1c1917", display: "block" }}>Visual Diff Inspection</strong>
                  <span style={{ fontSize: "0.8rem", color: "#78716c" }}>Compare local draft edits against the baseline repository edition.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDiffModal();
                  }}
                  style={{
                    padding: "0.45rem 0.85rem",
                    background: "#ffffff",
                    border: "1px solid #d6d3d1",
                    borderRadius: "0.375rem",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "#1c1917",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  <GitCommit style={{ width: "0.85rem", height: "0.85rem" }} /> Review Diff
                </button>
              </div>
            )}

            {/* 2. Direct Commit (If Authenticated) */}
            {authenticated && (
              <div style={{ padding: "1rem", background: "#fbf7ee", border: "1px solid #e7d5c0", borderRadius: "0.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "#7b3f2a", display: "block" }}>Commit Draft to Git</strong>
                  <span style={{ fontSize: "0.8rem", color: "#78716c" }}>Publish your working draft directly into the Git corpus.</span>
                </div>

                <input
                  type="text"
                  placeholder="Optional commit summary..."
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  style={{
                    padding: "0.45rem 0.75rem",
                    fontSize: "0.82rem",
                    border: "1px solid #d6d3d1",
                    borderRadius: "0.375rem",
                    width: "100%",
                  }}
                />

                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={isCommitting}
                  style={{
                    padding: "0.5rem 1rem",
                    background: isCommitting ? "#78716c" : "#7b3f2a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "0.375rem",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: isCommitting ? "wait" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                  }}
                >
                  <GitPullRequest style={{ width: "0.9rem", height: "0.9rem" }} />
                  {isCommitting ? "Committing..." : "Publish / Commit to Git"}
                </button>
              </div>
            )}

            {/* 3. Export PR Package */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 1rem", background: "#fafaf9", border: "1px solid #e7e5e4", borderRadius: "0.5rem" }}>
              <div>
                <strong style={{ fontSize: "0.88rem", color: "#1c1917", display: "block" }}>Export PR Package</strong>
                <span style={{ fontSize: "0.8rem", color: "#78716c" }}>Download formatted JSON and LaTeX export bundle for offline PRs.</span>
              </div>
              <button
                type="button"
                onClick={handleExportPRPackage}
                style={{
                  padding: "0.45rem 0.85rem",
                  background: "#292524",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "0.375rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  whiteSpace: "nowrap",
                }}
              >
                <Download style={{ width: "0.85rem", height: "0.85rem" }} /> Export Bundle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
