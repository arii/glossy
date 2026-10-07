"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  BookOpen,
  Edit3,
  Info,
  MoreVertical,
} from "lucide-react";
import { AttributionModal, type AttributionConfig } from "./attribution-modal";
import {
  listLocalDrafts,
  deleteLocalDraft,
} from "../lib/local-drafts";
import { isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry";

export type TextChoice = {
  slug: string;
  title: string;
  kind: "manuscript" | "text";
  author?: string;
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  sourceEdition?: string;
  source?: string;
  witness?: string;
  sentenceCount?: number;
  tokenCount?: number;
  status?: string;
  isProtected?: boolean;
  isLocalOnly?: boolean;
  hasLocalDraft?: boolean;
};

export function TextDirectory({
  initialChoices,
  attributionConfig,
}: {
  initialChoices: TextChoice[];
  attributionConfig?: AttributionConfig;
}) {
  const [choices, setChoices] = useState<TextChoice[]>(initialChoices);
  const [activeModalChoice, setActiveModalChoice] = useState<TextChoice | null>(null);
  const [openMenuSlug, setOpenMenuSlug] = useState<string | null>(null);

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
            editor: doc.editor,
            shelfmark: doc.shelfmark,
            dialect: doc.dialect,
            historicalDate: doc.historicalDate,
            sourceEdition: doc.sourceEdition,
            source: doc.source || "Local Browser Workspace",
            witness: doc.shelfmark || doc.source || "Local Browser Draft",
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
          editor: c.editor || meta?.editor,
          shelfmark: c.shelfmark || meta?.shelfmark || meta?.witness,
          dialect: c.dialect || meta?.dialect,
          historicalDate: c.historicalDate || meta?.historicalDate || meta?.origDate,
          sourceEdition: c.sourceEdition || meta?.sourceEdition,
          witness: c.shelfmark || c.witness || meta?.shelfmark || meta?.witness || c.source,
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
        return;
      }
      deleteLocalDraft(choice.slug);
      setChoices((prev) => prev.filter((item) => item.slug !== choice.slug));
      reloadCorpus();
    } else if (choice.hasLocalDraft) {
      deleteLocalDraft(choice.slug);
      setChoices((prev) =>
        prev.map((item) =>
          item.slug === choice.slug ? { ...item, hasLocalDraft: false } : item
        )
      );
      reloadCorpus();
    }
  };

  return (
    <div id="corpus-directory" className="corpus-directory-container" style={{ marginTop: "3.5rem" }}>
      {/* Section Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h2 className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4">
          Old English Corpus &amp; Editions
        </h2>
      </div>

      {/* Grid of Texts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 18rem), 1fr))",
          gap: "1.25rem",
        }}
      >
        {choices.map((choice) => {
          const isMenuOpen = openMenuSlug === choice.slug;
          const meta = getBuiltInMetadata(choice.slug);
          const displayAuthor = choice.author || meta?.author || "Anonymous";
          const displayWitness = choice.witness || meta?.witness || choice.source || "";

          return (
            <div
              key={choice.slug}
              className="workspace-choice-card"
            >
              <div>
                {/* Top row: Title */}
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
                  flexWrap: "nowrap",
                  gap: "0.35rem",
                  marginTop: "auto",
                  paddingTop: "0.75rem",
                  position: "relative",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    flexShrink: 1,
                    minWidth: 0,
                  }}
                >
                  <Link
                    href={`/read/${choice.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                      minHeight: "40px",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "0.25rem",
                      background: "var(--accent)",
                      color: "#ffffff",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <BookOpen style={{ width: "0.85rem", height: "0.85rem" }} /> Read
                  </Link>

                  <Link
                    href={`/edit/${choice.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.25rem",
                      minHeight: "40px",
                      padding: "0.4rem 0.6rem",
                      borderRadius: "0.25rem",
                      background: "#ffffff",
                      border: "1px solid var(--rule)",
                      color: "var(--ink)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Edit3 style={{ width: "0.85rem", height: "0.85rem" }} /> Edit
                  </Link>

                </div>

                {/* 3-dot context menu */}
                <div style={{ marginLeft: "auto", position: "relative", flexShrink: 0 }}>
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
                      minHeight: "44px",
                      minWidth: "44px",
                      padding: "0.5rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="More actions"
                  >
                    <MoreVertical style={{ width: "0.95rem", height: "0.95rem" }} />
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
                          minHeight: "44px",
                          padding: "0.5rem 0.85rem",
                          fontSize: "0.82rem",
                          background: "transparent",
                          border: "none",
                          color: "var(--ink)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <Info style={{ width: "0.85rem", height: "0.85rem" }} /> Scholarly Citation
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
                            minHeight: "44px",
                            padding: "0.5rem 0.85rem",
                            fontSize: "0.82rem",
                            background: "transparent",
                            border: "none",
                            color: "#b91c1c",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <Trash2 style={{ width: "0.85rem", height: "0.85rem" }} />{" "}
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
          editor={activeModalChoice.editor}
          shelfmark={activeModalChoice.shelfmark || activeModalChoice.witness}
          dialect={activeModalChoice.dialect}
          historicalDate={activeModalChoice.historicalDate}
          sourceEdition={activeModalChoice.sourceEdition}
          source={activeModalChoice.witness || activeModalChoice.source}
          config={attributionConfig}
          content={attributionConfig}
        />
      )}
    </div>
  );
}
