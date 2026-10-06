"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, BookOpen, Edit3, ShieldCheck } from "lucide-react";

export type TextChoice = {
  slug: string;
  title: string;
  kind: "manuscript" | "text";
  isProtected?: boolean;
};

export function TextDirectory({ initialChoices }: { initialChoices: TextChoice[] }) {
  const [choices, setChoices] = useState<TextChoice[]>(initialChoices);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
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
    <div
      className="workspace-choice-list"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
        gap: "1.25rem",
      }}
    >
      {choices.map((choice) => {
        const protectedText = isProtected(choice.slug);
        const isCurrentlyDeleting = deletingSlug === choice.slug;

        return (
          <article
            className="workspace-choice-card"
            key={`${choice.kind}-${choice.slug}`}
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <h2 style={{ margin: 0 }}>{choice.title}</h2>
                {protectedText ? (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--accent)",
                      background: "rgba(123, 63, 42, 0.08)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "0.25rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      whiteSpace: "nowrap",
                    }}
                    title="Master reference text cannot be removed"
                  >
                    <ShieldCheck style={{ width: "0.8rem", height: "0.8rem" }} /> Master Text
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDelete(choice)}
                    disabled={isCurrentlyDeleting}
                    style={{
                      border: "1px solid #fca5a5",
                      background: "rgba(220, 38, 38, 0.06)",
                      color: "#b91c1c",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "0.25rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: isCurrentlyDeleting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                    title={`Remove ${choice.title}`}
                    aria-label={`Remove ${choice.title}`}
                  >
                    <Trash2 style={{ width: "0.8rem", height: "0.8rem" }} />
                    {isCurrentlyDeleting ? "Removing..." : "Remove"}
                  </button>
                )}
              </div>
            </div>

            <p style={{ margin: "1rem 0 0", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={`/read/${choice.slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} /> Open reader
              </Link>
              <span style={{ color: "var(--muted)" }}>·</span>
              {choice.kind === "text" ? (
                <Link
                  href={`/edit/${choice.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  <Edit3 style={{ width: "0.9rem", height: "0.9rem" }} /> Edit glosses
                </Link>
              ) : (
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                  Editing workspace coming soon
                </span>
              )}
            </p>
          </article>
        );
      })}
    </div>
  );
}
