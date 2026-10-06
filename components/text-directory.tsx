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
  Plus,
  RotateCcw,
  Lock,
  Search,
} from "lucide-react";
import { AttributionModal } from "./attribution-modal";
import { safeJsonParse } from "../lib/safe-json";
import type { TextDocument } from "../lib/types";

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
  isLocalOnly?: boolean;
  hasLocalDraft?: boolean;
};

export function TextDirectory({ initialChoices }: { initialChoices: TextChoice[] }) {
  const [choices, setChoices] = useState<TextChoice[]>(initialChoices);
  const [activeModalChoice, setActiveModalChoice] = useState<TextChoice | null>(null);
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>("");
  const [hiddenDefaultCount, setHiddenDefaultCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProtected = useCallback(
    (slug: string) => slug === "ohthere-wulfstan" || slug === "ohthere",
    []
  );

  const reloadCorpus = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Read deleted default slugs from localStorage
      const rawDeleted = window.localStorage.getItem("glossy_deleted_slugs");
      const deletedSlugs = new Set<string>(
        rawDeleted ? safeJsonParse<string[]>(rawDeleted) || [] : []
      );
      setHiddenDefaultCount(deletedSlugs.size);

      // 2. Discover custom drafts or local modifications from localStorage
      const customChoices: TextChoice[] = [];
      const localSlugsWithEdits = new Set<string>();

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("glossy_draft_")) {
          const slug = key.replace(/^glossy_draft_/, "");
          const raw = window.localStorage.getItem(key);
          if (!raw) continue;

          const parsed = safeJsonParse<TextDocument>(raw);
          if (!parsed) continue;

          const existsInInitial = initialChoices.some(
            (c) => c.slug === slug || (parsed.textId && c.slug === parsed.textId)
          );

          if (existsInInitial) {
            localSlugsWithEdits.add(slug);
            if (parsed.textId) localSlugsWithEdits.add(parsed.textId);
          } else {
            const totalTokens = (parsed.sentences || []).reduce(
              (acc, s) => acc + (s.words ? s.words.length : 0),
              0
            );
            customChoices.push({
              slug,
              title: parsed.title || slug,
              kind: "text",
              author: parsed.author || "Custom Ingested Text",
              source: parsed.source || "Local Browser Workspace",
              sentenceCount: parsed.sentences?.length || 0,
              tokenCount: totalTokens,
              status: "draft",
              isProtected: false,
              isLocalOnly: true,
            });
          }
        }
      }

      // 3. Assemble visible choices (filter out locally deleted default texts)
      const visibleInitial = initialChoices
        .filter((c) => !deletedSlugs.has(c.slug))
        .map((c) => ({
          ...c,
          hasLocalDraft: localSlugsWithEdits.has(c.slug),
        }));

      setChoices([...customChoices, ...visibleInitial]);
    } catch {
      // Ignore localStorage errors
    }
  }, [initialChoices]);

  useEffect(() => {
    reloadCorpus();
  }, [reloadCorpus]);

  const handleDelete = (choice: TextChoice) => {
    if (isProtected(choice.slug)) {
      alert("The Voyages of Ohthere is the permanent reference example text and cannot be removed.");
      return;
    }

    const confirmed = window.confirm(
      `Remove "${choice.title}" from your local corpus? (You can restore default texts at any time.)`
    );
    if (!confirmed) return;

    try {
      if (choice.isLocalOnly) {
        // Remove custom text from localStorage
        localStorage.removeItem(`glossy-editor-snapshot-v2-${choice.slug}`);
        localStorage.removeItem(`glossy_draft_${choice.slug}`);
      } else {
        // Record default text as locally hidden
        const rawDeleted = localStorage.getItem("glossy_deleted_slugs");
        const currentDeleted = rawDeleted ? safeJsonParse<string[]>(rawDeleted) || [] : [];
        if (!currentDeleted.includes(choice.slug)) {
          currentDeleted.push(choice.slug);
          localStorage.setItem("glossy_deleted_slugs", JSON.stringify(currentDeleted));
        }
        localStorage.removeItem(`glossy-editor-snapshot-v2-${choice.slug}`);
        localStorage.removeItem(`glossy_draft_${choice.slug}`);
        setHiddenDefaultCount(currentDeleted.length);
      }

      // Immediately update React state with zero page reload
      setChoices((prev) => prev.filter((item) => item.slug !== choice.slug));
    } catch {
      alert("Error while removing text.");
    }
  };

  const handleRevertDraft = (choice: TextChoice) => {
    const confirmed = window.confirm(
      `Discard local draft edits for "${choice.title}" and revert to the canonical edition?`
    );
    if (!confirmed) return;

    try {
      localStorage.removeItem(`glossy_draft_${choice.slug}`);
      localStorage.removeItem(`glossy-editor-snapshot-v2-${choice.slug}`);
      setChoices((prev) =>
        prev.map((c) => (c.slug === choice.slug ? { ...c, hasLocalDraft: false } : c))
      );
    } catch {
      alert("Error while reverting edits.");
    }
  };

  const handleRestoreDefaults = () => {
    try {
      localStorage.removeItem("glossy_deleted_slugs");
      setHiddenDefaultCount(0);
      reloadCorpus();
    } catch {
      alert("Error restoring default corpus texts.");
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

        let doc: TextDocument | null = null;
        if (file.name.endsWith(".json")) {
          doc = safeJsonParse<TextDocument>(content);
        } else {
          // Plain text line-by-line format
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const rawSlug = file.name
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          doc = {
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

        if (!doc || !doc.title || !doc.sentences) {
          alert("Invalid file format. Please upload a valid Glossy JSON document or plain text file.");
          return;
        }

        const slug =
          doc.slug ||
          doc.textId ||
          file.name
            .replace(/\.[^/.]+$/, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        doc.slug = slug;
        localStorage.setItem(`glossy_draft_${slug}`, JSON.stringify(doc));
        alert(`Successfully uploaded "${doc.title}" to your corpus!`);
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
      c.slug.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {/* Corpus Toolbar: Search, Ingest Link, Upload JSON, and Restore Defaults */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          padding: "0.75rem 1rem",
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          borderRadius: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: "1 1 14rem" }}>
          <Search style={{ width: "1rem", height: "1rem", color: "var(--muted-ink)" }} />
          <input
            type="text"
            placeholder="Search corpus texts..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              outline: "none",
              fontSize: "0.88rem",
              color: "var(--ink)",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {hiddenDefaultCount > 0 && (
            <button
              type="button"
              onClick={handleRestoreDefaults}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#1e3a8a",
                background: "#dbeafe",
                border: "1px solid #bfdbfe",
                borderRadius: "0.3rem",
                cursor: "pointer",
              }}
              title="Restore hidden canonical corpus texts"
            >
              <RotateCcw style={{ width: "0.8rem", height: "0.8rem" }} />
              Restore {hiddenDefaultCount} Default Text{hiddenDefaultCount > 1 ? "s" : ""}
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.txt"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--ink)",
              background: "#fbf7ee",
              border: "1px solid var(--rule)",
              borderRadius: "0.3rem",
              cursor: "pointer",
            }}
            title="Upload a local JSON text or plain text file into your workspace"
          >
            <Upload style={{ width: "0.8rem", height: "0.8rem" }} />
            Upload JSON / File
          </button>

          <Link
            href="/edit/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#ffffff",
              background: "var(--accent)",
              border: "1px solid var(--accent)",
              borderRadius: "0.3rem",
              textDecoration: "none",
            }}
          >
            <Plus style={{ width: "0.8rem", height: "0.8rem" }} />
            Ingest New Text
          </Link>
        </div>
      </div>

      {/* Grid Container for Cards */}
      <div
        className="workspace-choice-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 20rem), 1fr))",
          justifyContent: "center",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          gap: "1.25rem",
        }}
      >
        {filteredChoices.map((choice) => {
          const protectedText = isProtected(choice.slug);
          const displayAuthor =
            choice.author ||
            (protectedText ? "King Alfred's Court / Tyler Lemon" : "Anonymous");
          const displaySource =
            choice.source ||
            (protectedText
              ? "London, British Library, Cotton MS Tiberius B. i"
              : "Historical Manuscript Witness");

          return (
            <article
              className="workspace-choice-card"
              key={`${choice.kind}-${choice.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: "1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--rule)",
                background: "var(--surface)",
                boxShadow: "0 0.25rem 1.5rem rgba(64, 47, 29, 0.04)",
                transition: "all 0.15s ease",
              }}
            >
              <div>
                {/* Header Row: Title & Badges */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "1.2rem",
                      fontFamily: "'Charis SIL', Georgia, serif",
                      lineHeight: 1.3,
                      color: "var(--ink)",
                      wordBreak: "break-word",
                    }}
                  >
                    {choice.title}
                  </h2>

                  <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {protectedText && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                          fontSize: "0.68rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                          background: "#ecfdf5",
                          color: "#065f46",
                          border: "1px solid #a7f3d0",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                        title="Permanent Canonical Reference Text"
                      >
                        <Lock style={{ width: "0.65rem", height: "0.65rem" }} />
                        Protected
                      </span>
                    )}

                    {choice.isLocalOnly ? (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                          background: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fde68a",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Local Only
                      </span>
                    ) : choice.hasLocalDraft ? (
                      <span
                        style={{
                          fontSize: "0.68rem",
                          padding: "0.15rem 0.45rem",
                          borderRadius: "0.25rem",
                          background: "#e0e7ff",
                          color: "#3730a3",
                          border: "1px solid #c7d2fe",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        Edited (Draft)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Attribution & Manuscript Provenance */}
                <div
                  style={{
                    marginBottom: "0.75rem",
                    fontSize: "0.82rem",
                    color: "var(--muted-ink)",
                    lineHeight: 1.5,
                  }}
                >
                  <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "var(--ink)" }}>
                    {displayAuthor}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.78rem" }}>{displaySource}</p>
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
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
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

                {/* More Options Menu (Revert edits or Delete) */}
                {(!protectedText || choice.hasLocalDraft) && (
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuSlug(openMenuSlug === choice.slug ? null : choice.slug)
                      }
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
                          minWidth: "10rem",
                          padding: "0.3rem",
                        }}
                      >
                        {choice.hasLocalDraft && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuSlug(null);
                              handleRevertDraft(choice);
                            }}
                            style={{
                              width: "100%",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.4rem 0.6rem",
                              fontSize: "0.78rem",
                              fontWeight: 500,
                              color: "#3730a3",
                              background: "transparent",
                              border: "none",
                              borderRadius: "0.25rem",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <RotateCcw style={{ width: "0.75rem", height: "0.75rem" }} />
                            Revert to original
                          </button>
                        )}

                        {!protectedText && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuSlug(null);
                              handleDelete(choice);
                            }}
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
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <Trash2 style={{ width: "0.75rem", height: "0.75rem" }} />
                            Remove from corpus
                          </button>
                        )}
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
