"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Trash2,
  BookOpen,
  Edit3,
  Info,
  MoreVertical,
  Upload,
  Search,
  Plus,
  Lock,
} from "lucide-react";
import { AttributionModal } from "./attribution-modal";
import { safeJsonParse } from "../lib/safe-json";
import type { TextDocument } from "../lib/types";
import {
  listLocalDrafts,
  deleteLocalDraft,
  createLocalDocument,
} from "../lib/local-drafts";
import { isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry";

export type TextChoice = {
  slug: string;
  title: string;
  kind: "manuscript" | "text";
  author?: string;
  source?: string;
  witness?: string;
  sentenceCount?: number;
  tokenCount?: number;
  status?: string;
  isProtected?: boolean;
  isLocalOnly?: boolean;
  hasLocalDraft?: boolean;
};

export function TextDirectory({ initialChoices }: { initialChoices: TextChoice[] }) {
  const [choices, setChoices] = useState<TextChoice[]>(initialChoices);
  const [activeModalChoice, setActiveModalChoice] = useState<TextChoice | null>(null);
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadCorpus = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const drafts = listLocalDrafts();
      const customChoices: TextChoice[] = [];
      const localSlugsWithEdits = new Set<string>();

      for (const envelope of drafts) {
        const doc = envelope.doc;
        const slug = doc.slug || doc.textId;
        const existsInInitial = initialChoices.some(
          (c) => c.slug === slug || (doc.textId && c.slug === doc.textId)
        );

        if (existsInInitial) {
          localSlugsWithEdits.add(slug);
          if (doc.textId) localSlugsWithEdits.add(doc.textId);
        } else {
          customChoices.push({
            slug,
            title: doc.title || slug,
            kind: "text",
            author: doc.author || "Custom Ingested Text",
            source: doc.source || "Local Browser Workspace",
            witness: doc.source || "Local Browser Draft",
            status: "draft",
            isProtected: false,
            isLocalOnly: true,
            hasLocalDraft: true,
          });
        }
      }

      const visibleInitial = initialChoices.map((c) => {
        const meta = getBuiltInMetadata(c.slug);
        return {
          ...c,
          author: c.author || meta?.author,
          witness: c.witness || meta?.witness || c.source,
          hasLocalDraft: localSlugsWithEdits.has(c.slug) || localSlugsWithEdits.has(meta?.slug || "") || localSlugsWithEdits.has(meta?.textId || ""),
        };
      });

      setChoices([...customChoices, ...visibleInitial]);
    } catch {
      // Ignore localStorage read errors
    }
  }, [initialChoices]);

  useEffect(() => {
    reloadCorpus();
  }, [reloadCorpus]);

  // Close context menu on outside click
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuSlug(null);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleDelete = (choice: TextChoice) => {
    if (choice.isLocalOnly) {
      if (isProtectedSlug(choice.slug)) {
        alert("This canonical text is part of the core corpus and cannot be deleted.");
        return;
      }
      const confirmed = window.confirm(
        `Delete local draft "${choice.title}"? This cannot be undone.`
      );
      if (!confirmed) return;
      deleteLocalDraft(choice.slug);
      setChoices((prev) => prev.filter((item) => item.slug !== choice.slug));
    } else if (choice.hasLocalDraft) {
      const confirmed = window.confirm(
        `Discard all local edits for "${choice.title}" and revert to the master edition?`
      );
      if (!confirmed) return;
      deleteLocalDraft(choice.slug);
      reloadCorpus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        let parsedDoc: TextDocument | null = null;
        if (file.name.endsWith(".json")) {
          parsedDoc = safeJsonParse<TextDocument>(content);
        } else {
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const rawSlug = file.name
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          parsedDoc = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            slug: rawSlug,
            textId: rawSlug,
            language: "Old English",
            author: "Imported Document",
            source: "Local Upload",
            sourceFile: file.name,
            status: "draft",
            blocks: [],
            sentences: lines.map((line, idx) => ({
              id: `s-${idx + 1}`,
              translation: "",
              words: line.split(/\s+/).map((w, wIdx) => ({
                id: `w-${idx + 1}-${wIdx + 1}`,
                originalWord: w,
                morphologicalGloss: "",
              })),
            })),
          };
        }

        if (!parsedDoc || !parsedDoc.title || !parsedDoc.sentences) {
          alert("Invalid file format. Please upload a valid Glossy JSON document or plain text file.");
          return;
        }

        const res = createLocalDocument({
          title: parsedDoc.title,
          slug: parsedDoc.slug || parsedDoc.textId,
          author: parsedDoc.author,
          source: parsedDoc.source || "Local Upload",
          sentences: parsedDoc.sentences,
          texSource: parsedDoc.texSource,
          overwrite: true,
        });

        if (!res.ok) {
          alert(`Upload failed: ${res.error}`);
          return;
        }

        alert(`Added "${parsedDoc.title}" to this browser's local drafts. (To publish, sign in via Tina Admin.)`);
        reloadCorpus();
      } catch {
        alert("Failed to parse uploaded file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filteredChoices = choices.filter((c) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      (c.author && c.author.toLowerCase().includes(q)) ||
      (c.source && c.source.toLowerCase().includes(q)) ||
      (c.witness && c.witness.toLowerCase().includes(q)) ||
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <div id="corpus-directory" className="corpus-directory-container" style={{ marginTop: "3.5rem" }}>
      {/* Section Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontFamily: "'Charis SIL', Georgia, serif",
            fontSize: "1.35rem",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink)",
            margin: "0 0 1.25rem",
          }}
        >
          Old English Corpus &amp; Editions
        </h2>

        {/* Search & Actions Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div style={{ position: "relative", minWidth: "16rem", flex: 1, maxWidth: "24rem" }}>
            <Search
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "0.95rem",
                height: "0.95rem",
                color: "var(--muted-ink)",
              }}
            />
            <input
              type="text"
              placeholder="Search corpus texts..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.1rem",
                borderRadius: "0.35rem",
                border: "1px solid var(--rule)",
                background: "var(--surface)",
                fontSize: "0.875rem",
                color: "var(--ink)",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json,.txt"
              style={{ display: "none" }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.85rem",
                borderRadius: "0.35rem",
                border: "1px solid var(--rule)",
                background: "#ffffff",
                color: "var(--ink)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
              }}
              title="Upload a JSON or plain text file into your local browser workspace"
            >
              <Upload style={{ width: "0.85rem", height: "0.85rem" }} /> Upload JSON / File
            </button>

            <Link
              href="/edit/new"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.5rem 0.95rem",
                borderRadius: "0.35rem",
                background: "var(--accent)",
                color: "#ffffff",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 3px rgba(123, 63, 42, 0.2)",
              }}
            >
              <Plus style={{ width: "0.85rem", height: "0.85rem" }} /> + Ingest New Text
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Texts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(21rem, 1fr))",
          gap: "1.25rem",
        }}
      >
        {filteredChoices.map((choice) => {
          const isMenuOpen = openMenuSlug === choice.slug;
          const isItemProtected = isProtectedSlug(choice.slug) && !choice.isLocalOnly;
          const meta = getBuiltInMetadata(choice.slug);
          const displayAuthor = choice.author || meta?.author || "Anonymous";
          const displayWitness = choice.witness || meta?.witness || choice.source || "";

          return (
            <div
              key={choice.slug}
              className="workspace-choice-card"
              style={{
                background: "#ffffff",
                border: "1px solid var(--rule)",
                borderRadius: "0.5rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "13rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                position: "relative",
              }}
            >
              <div>
                {/* Top row: Title and Badges */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.125rem",
                      fontFamily: "'Charis SIL', Georgia, serif",
                      fontWeight: 700,
                      lineHeight: 1.25,
                      color: "var(--ink)",
                    }}
                  >
                    {choice.title}
                  </h3>

                  {/* Badges on Top Right */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "0.25rem",
                      flexShrink: 0,
                    }}
                  >
                    {isItemProtected && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          border: "1px solid #86efac",
                          background: "#f0fdf4",
                          color: "#15803d",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        <Lock style={{ width: "0.65rem", height: "0.65rem" }} /> Protected
                      </span>
                    )}
                    {choice.hasLocalDraft && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          border: "1px solid #c7d2fe",
                          background: "#e0e7ff",
                          color: "#3730a3",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        Edited (Draft)
                      </span>
                    )}
                    {choice.isLocalOnly && !choice.hasLocalDraft && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          border: "1px solid #fed7aa",
                          background: "#fff7ed",
                          color: "#9a3412",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                        }}
                      >
                        Local Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Author line in bold */}
                <p
                  style={{
                    margin: "0.5rem 0 0.25rem",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    lineHeight: 1.35,
                  }}
                >
                  {displayAuthor}
                </p>

                {/* Witness / Manuscript line */}
                {displayWitness && (
                  <p
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "0.78rem",
                      color: "var(--muted-ink)",
                      lineHeight: 1.35,
                    }}
                  >
                    {displayWitness}
                  </p>
                )}
              </div>

              {/* Action Buttons Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginTop: "auto",
                  paddingTop: "0.75rem",
                  position: "relative",
                }}
              >
                <Link
                  href={`/read/${choice.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.38rem 0.75rem",
                    borderRadius: "0.25rem",
                    background: "var(--accent)",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <BookOpen style={{ width: "0.82rem", height: "0.82rem" }} /> Read
                </Link>

                <Link
                  href={`/edit/${choice.slug}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.38rem 0.75rem",
                    borderRadius: "0.25rem",
                    background: "#ffffff",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <Edit3 style={{ width: "0.82rem", height: "0.82rem" }} /> Edit
                </Link>

                <button
                  type="button"
                  onClick={() => setActiveModalChoice(choice)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.38rem 0.75rem",
                    borderRadius: "0.25rem",
                    background: "#ffffff",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <Info style={{ width: "0.82rem", height: "0.82rem" }} /> Cite
                </button>

                {/* 3-dot context menu */}
                <div style={{ marginLeft: "auto", position: "relative" }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuSlug(isMenuOpen ? null : choice.slug);
                    }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid var(--rule)",
                      borderRadius: "0.25rem",
                      color: "var(--muted-ink)",
                      cursor: "pointer",
                      padding: "0.38rem 0.45rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="More actions"
                  >
                    <MoreVertical style={{ width: "0.85rem", height: "0.85rem" }} />
                  </button>

                  {isMenuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: "absolute",
                        right: 0,
                        bottom: "100%",
                        marginBottom: "0.35rem",
                        background: "#ffffff",
                        border: "1px solid var(--rule)",
                        borderRadius: "0.35rem",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        zIndex: 100,
                        minWidth: "11rem",
                        padding: "0.25rem 0",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModalChoice(choice);
                          setOpenMenuSlug(null);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "0.45rem 0.75rem",
                          fontSize: "0.8rem",
                          background: "transparent",
                          border: "none",
                          color: "var(--ink)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <Info style={{ width: "0.8rem", height: "0.8rem" }} /> Scholarly Citation
                      </button>

                      {(choice.isLocalOnly || choice.hasLocalDraft) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleDelete(choice);
                            setOpenMenuSlug(null);
                          }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            padding: "0.45rem 0.75rem",
                            fontSize: "0.8rem",
                            background: "transparent",
                            border: "none",
                            color: "#b91c1c",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Trash2 style={{ width: "0.8rem", height: "0.8rem" }} />{" "}
                          {choice.isLocalOnly ? "Delete Local Draft" : "Revert edits / Discard Draft"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attribution Modal */}
      {activeModalChoice && (
        <AttributionModal
          isOpen={Boolean(activeModalChoice)}
          onClose={() => setActiveModalChoice(null)}
          slug={activeModalChoice.slug}
          title={activeModalChoice.title}
          author={activeModalChoice.author}
          source={activeModalChoice.witness || activeModalChoice.source}
        />
      )}
    </div>
  );
}
