"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, BookOpen, Edit3, Info, MoreVertical } from "lucide-react";
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
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
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
      try {
        await fetch("/api/delete-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: choice.slug }),
        });
      } catch {}

      try {
        localStorage.removeItem(`glossy-editor-snapshot-v2-${choice.slug}`);
      } catch {}

      setChoices((prev) => prev.filter((item) => item.slug !== choice.slug));
      router.refresh();
    } catch {
      alert("Error while removing text.");
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
                {/* Header Row: Title */}
                <div style={{ marginBottom: "0.5rem" }}>
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
                </div>

                {/* Attribution & Manuscript Provenance */}
                <div style={{ marginBottom: "0.75rem", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--ink)" }}>
                    {displayAuthor}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem" }}>
                    {displaySource}
                  </p>
                </div>

                {/* Document Metadata (clean typography) */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.45rem",
                    fontSize: "0.78rem",
                    color: "var(--muted-ink)",
                    marginBottom: "1.25rem",
                  }}
                >
                  <span>{choice.sentenceCount ?? 75} sentences</span>
                  <span style={{ opacity: 0.6 }}>•</span>
                  <span>{(choice.tokenCount ?? 1716).toLocaleString()} tokens</span>
                  <span style={{ opacity: 0.6 }}>•</span>
                  <span style={{ textTransform: "capitalize" }}>{choice.status ?? "Published"}</span>
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
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuSlug(openMenuSlug === choice.slug ? null : choice.slug)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "transparent",
                        border: "1px solid var(--rule)",
                        color: "var(--muted-ink)",
                        cursor: "pointer",
                        padding: "0.35rem 0.45rem",
                        borderRadius: "0.25rem",
                      }}
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical style={{ width: "0.85rem", height: "0.85rem" }} />
                    </button>

                    {openMenuSlug === choice.slug && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          bottom: "100%",
                          marginBottom: "0.35rem",
                          background: "var(--surface)",
                          border: "1px solid var(--rule)",
                          borderRadius: "0.35rem",
                          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                          zIndex: 20,
                          minWidth: "8rem",
                          padding: "0.3rem",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuSlug(null);
                            handleDelete(choice);
                          }}
                          disabled={isCurrentlyDeleting}
                          style={{
                            width: "100%",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.4rem 0.6rem",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                            color: "#b91c1c",
                            background: "transparent",
                            border: "none",
                            borderRadius: "0.25rem",
                            cursor: isCurrentlyDeleting ? "not-allowed" : "pointer",
                            textAlign: "left",
                          }}
                        >
                          <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />
                          {isCurrentlyDeleting ? "Deleting..." : "Delete text"}
                        </button>
                      </div>
                    )}
                  </div>
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
