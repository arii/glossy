"use client";

import { useEffect, useState, useCallback } from "react";
import { listPending, type PendingDraftEntry } from "../lib/local-drafts";
import { isTinaAuthenticated, commitAllPendingDrafts } from "../lib/tina-sync";

export interface DraftSyncPromptProps {
  cms?: unknown;
  onSynced?: (slugs: string[]) => void;
  onDismiss?: () => void;
  forceShow?: boolean;
  currentSlug?: string;
}

export function DraftSyncPrompt({
  cms,
  onSynced,
  onDismiss,
  forceShow = false,
  currentSlug,
}: DraftSyncPromptProps) {
  const [pendingDrafts, setPendingDrafts] = useState<PendingDraftEntry[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<"idle" | "success" | "error">("idle");

  const refreshPendingDrafts = useCallback(() => {
    const manifest = listPending();
    const unsynced = Object.values(manifest).filter((item) => !item.synced);
    setPendingDrafts(unsynced);
  }, []);

  useEffect(() => {
    refreshPendingDrafts();
  }, [refreshPendingDrafts, forceShow, currentSlug]);

  useEffect(() => {
    if (forceShow) {
      setIsDismissed(false);
    }
  }, [forceShow]);

  // Listen for local draft updates in browser window
  useEffect(() => {
    const handleStorageChange = () => {
      refreshPendingDrafts();
      setIsDismissed(false);
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("glossy:drafts-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("glossy:drafts-updated", handleStorageChange);
    };
  }, [refreshPendingDrafts]);

  if (isDismissed && !forceShow) {
    return null;
  }

  if (pendingDrafts.length === 0 && !forceShow) {
    return null;
  }

  const authenticated = isTinaAuthenticated(cms);

  // Focus current slug if provided, else list all titles
  const targetDrafts = currentSlug
    ? pendingDrafts.filter((d) => d.slug === currentSlug)
    : pendingDrafts;

  const displayDrafts = targetDrafts.length > 0 ? targetDrafts : pendingDrafts;
  const titlesList =
    displayDrafts.length > 0
      ? displayDrafts.map((d) => d.title || d.slug).join(", ")
      : currentSlug || "Current document";

  const draftCount = displayDrafts.length || 1;

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleCommit = async () => {
    setIsCommitting(true);
    setStatusKind("idle");
    setStatusMessage("Committing to Git repository...");

    try {
      const res = await commitAllPendingDrafts({ cms });

      if (res.committedSlugs.length > 0) {
        setStatusKind("success");
        setStatusMessage(
          `✅ Successfully committed ${res.committedSlugs.length} draft${
            res.committedSlugs.length > 1 ? "s" : ""
          } to Git!`,
        );

        refreshPendingDrafts();

        if (onSynced) {
          onSynced(res.committedSlugs);
        }

        setTimeout(() => {
          setIsDismissed(true);
        }, 2500);
      } else if (res.failedSlugs.length > 0) {
        setStatusKind("error");
        const firstErr =
          Object.values(res.errors)[0] ||
          "Commit failed. Please sign in to TinaCMS admin mode.";
        setStatusMessage(`Commit Failed: ${firstErr}`);
      } else {
        setStatusKind("idle");
        setStatusMessage("No pending drafts required committing.");
      }
    } catch (err) {
      setStatusKind("error");
      setStatusMessage(
        `Error: ${err instanceof Error ? err.message : "Commit failed"}`,
      );
    } finally {
      setIsCommitting(false);
    }
  };

  const firstSlug = displayDrafts[0]?.slug || currentSlug || "";

  return (
    <div
      id="tina-draft-sync-bar"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 99999,
        background: "#1c1917",
        color: "#fafaf9",
        padding: "1rem 1.25rem",
        borderRadius: "0.5rem",
        boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
        border: "1px solid #44403c",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: "0.875rem",
        maxWidth: "32rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.65rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 600, color: "#eab308", display: "flex", alignItems: "center", gap: "0.4rem" }}>
          📥 Unpublished Drafts Detected
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "#a8a29e",
            cursor: "pointer",
            fontSize: "1.2rem",
            lineHeight: 1,
            padding: "0.1rem 0.3rem",
          }}
          title="Dismiss prompt"
        >
          ×
        </button>
      </div>

      <div style={{ fontSize: "0.82rem", color: "#d6d3d1", lineHeight: 1.4 }}>
        {statusMessage ? (
          <span
            style={{
              color:
                statusKind === "success"
                  ? "#4ade80"
                  : statusKind === "error"
                  ? "#f87171"
                  : "#fef08a",
              fontWeight: 500,
            }}
          >
            {statusMessage}
          </span>
        ) : (
          <>
            Found unpublished local drafts in this browser for:{" "}
            <strong style={{ color: "#fff" }}>{titlesList}</strong>.{" "}
            {authenticated
              ? "You are signed into admin mode. Click below to commit your draft directly to the Git repository."
              : "Sign in to TinaCMS Admin to commit them to the Git repository."}
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap", alignItems: "center" }}>
        {authenticated ? (
          <button
            type="button"
            onClick={handleCommit}
            disabled={isCommitting}
            style={{
              background: isCommitting ? "#525252" : "#7b3f2a",
              color: "#fff",
              border: "none",
              padding: "0.45rem 0.9rem",
              borderRadius: "0.3rem",
              fontWeight: 600,
              cursor: isCommitting ? "wait" : "pointer",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {isCommitting
              ? "Committing to Git..."
              : `Commit Draft${draftCount > 1 ? "s" : ""} to Git`}
          </button>
        ) : (
          <a
            href="/admin"
            style={{
              background: "#7b3f2a",
              color: "#fff",
              border: "none",
              padding: "0.45rem 0.9rem",
              borderRadius: "0.3rem",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Sign in to Admin &amp; Commit
          </a>
        )}

        {firstSlug && typeof window !== "undefined" && !window.location.pathname.startsWith("/edit/") && (
          <a
            href={`/edit/${firstSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#292524",
              color: "#d6d3d1",
              padding: "0.45rem 0.9rem",
              borderRadius: "0.3rem",
              textDecoration: "none",
              fontSize: "0.82rem",
              display: "inline-flex",
              alignItems: "center",
              border: "1px solid #44403c",
            }}
          >
            Open Editor ↗
          </a>
        )}
      </div>
    </div>
  );
}
