"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, BookOpen, Edit3, ShieldCheck, FileCode, Info } from "lucide-react";
import { AttributionModal } from "./attribution-modal";

export type TextChoice = {
  slug: string;
  title: string;
  kind: "manuscript" | "text";
  author?: string;
  source?: string;
  sentenceCount?: number;
  tokenCount?: number;
  status?: string;
  isProtected?: boolean;
};

export function TextDirectory({ initialChoices }: { initialChoices: TextChoice[] }) {
  const [choices, setChoices] = useState<TextChoice[]>(initialChoices);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [activeModalChoice, setActiveModalChoice] = useState<TextChoice | null>(null);
  const router = useRouter();

  const isProtected = (slug: string) =>
    slug === "ohthere-wulfstan" || slug === "ohthere";

  const handleDelete = async (choice: TextChoice) => {
    if (isProtected(choice.slug)) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove "${choice.title}" from Glossy? This will delete its JSON data and LaTeX files.`,
    );
    if (!confirmed) return;

    setDeletingSlug(choice.slug);
    try {
      const res = await fetch("/api/delete-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: choice.slug }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to remove text.");
        setDeletingSlug(null);
        return;
      }

      try {
        localStorage.removeItem(`glossy-editor-snapshot-v2-${choice.slug}`);
      } catch {}

      setChoices((prev) => prev.filter((item) => item.slug !== choice.slug));
      router.refresh();
    } catch {
      alert("Network error while deleting text.");
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <>
      <div
        className="workspace-choice-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(22rem, 1fr))",
          gap: "1.5rem",
        }}
      >
        {choices.map((choice) => {
          const protectedText = isProtected(choice.slug);
          const isCurrentlyDeleting = deletingSlug === choice.slug;
          const displayAuthor = choice.author || (protectedText ? "King Alfred's Court / Tyler Lemon" : "Anonymous");
          const displaySource = choice.source || (protectedText ? "London, British Library, Cotton MS Tiberius B. i" : "Historical Manuscript Witness");
          const sentenceNum = choice.sentenceCount ?? (protectedText ? 75 : choice.slug === "beowulf-prologue" ? 11 : 0);
          const tokenNum = choice.tokenCount ?? (protectedText ? 1716 : choice.slug === "beowulf-prologue" ? 53 : 0);

          return (
            <article
              className="workspace-choice-card"
              key={`${choice.kind}-${choice.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--rule)",
                background: "var(--surface)",
                boxShadow: "0 0.25rem 1.5rem rgba(64, 47, 29, 0.04)",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                {/* Header Row: Title and Status Badge */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.25rem",
                      fontFamily: "'Charis SIL', Georgia, serif",
                      lineHeight: 1.3,
                      color: "var(--ink)",
                    }}
                  >
                    {choice.title}
                  </h2>
                  {protectedText ? (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "var(--accent)",
                        background: "#f3eadb",
                        border: "1px solid #dfcfb8",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                      title="Master authoritative gb4e reference text"
                    >
                      <ShieldCheck style={{ width: "0.8rem", height: "0.8rem" }} /> Master Text
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "#0369a1",
                        background: "#e0f2fe",
                        border: "1px solid #bae6fd",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "0.25rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      <FileCode style={{ width: "0.75rem", height: "0.75rem" }} /> Custom Text
                    </span>
                  )}
                </div>

                {/* Attribution & Manuscript Provenance */}
                <div style={{ marginBottom: "1rem", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--ink)" }}>
                    {displayAuthor}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem" }}>
                    {displaySource}
                  </p>
                </div>

                {/* Metric Badges */}
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  {sentenceNum > 0 && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        background: "#fbf7ee",
                        border: "1px solid var(--rule)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "0.25rem",
                        color: "var(--ink)",
                      }}
                    >
                      {sentenceNum} sentences
                    </span>
                  )}
                  {tokenNum > 0 && (
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        background: "#fbf7ee",
                        border: "1px solid var(--rule)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "0.25rem",
                        color: "var(--ink)",
                      }}
                    >
                      {tokenNum} tokens
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontFamily: "monospace",
                      background: "#fbf7ee",
                      border: "1px solid var(--rule)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "0.25rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}
                  >
                    gb4e LaTeX
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div
                style={{
                  paddingTop: "0.85rem",
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <Link
                    href={`/read/${choice.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "0.3rem",
                      background: "var(--accent)",
                      color: "#ffffff",
                      textDecoration: "none",
                    }}
                  >
                    <BookOpen style={{ width: "0.85rem", height: "0.85rem" }} /> Read
                  </Link>

                  <Link
                    href={`/edit/${choice.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "0.3rem",
                      background: "#fbf7ee",
                      border: "1px solid var(--rule)",
                      color: "var(--ink)",
                      textDecoration: "none",
                    }}
                  >
                    <Edit3 style={{ width: "0.85rem", height: "0.85rem" }} /> Edit
                  </Link>

                  <button
                    type="button"
                    onClick={() => setActiveModalChoice(choice)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      background: "transparent",
                      border: "none",
                      color: "var(--muted-ink)",
                      cursor: "pointer",
                      fontSize: "0.78rem",
                      padding: "0.35rem",
                    }}
                    title="View manuscript provenance & copy citation"
                  >
                    <Info style={{ width: "0.85rem", height: "0.85rem" }} /> Cite
                  </button>
                </div>

                {!protectedText && (
                  <button
                    type="button"
                    onClick={() => handleDelete(choice)}
                    disabled={isCurrentlyDeleting}
                    style={{
                      border: "1px solid #fca5a5",
                      background: "rgba(220, 38, 38, 0.06)",
                      color: "#b91c1c",
                      padding: "0.3rem 0.55rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: isCurrentlyDeleting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    title={`Remove ${choice.title}`}
                    aria-label={`Remove ${choice.title}`}
                  >
                    <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />
                    {isCurrentlyDeleting ? "..." : "Delete"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {activeModalChoice && (
        <AttributionModal
          isOpen={Boolean(activeModalChoice)}
          onClose={() => setActiveModalChoice(null)}
          slug={activeModalChoice.slug}
          title={activeModalChoice.title}
          author={activeModalChoice.author}
          source={activeModalChoice.source}
        />
      )}
    </>
  );
}
