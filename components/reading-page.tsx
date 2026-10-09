"use client";

import { SiteNav } from "./site-nav";
import { PageHero } from "./page-hero";
import { SiteFooter } from "./site-footer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGlossRecords, getReadingPassage } from "../lib/passage-utils";
import type { TextDocument } from "../lib/types";
import {
  getLocalDraft,
  getDraftDivergenceStatus,
  deleteLocalDraft,
  getHiddenSlugs,
  restoreHiddenText,
  getWorkspaceTexts,
  type WorkspaceTextItem,
} from "../lib/local-drafts";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";
import { AttributionModal } from "./attribution-modal";
import { DraftDiffModal } from "./draft-diff-modal";
import { GitCommit, Edit3, Trash2, AlertTriangle } from "lucide-react";

type ReadingPageProps = {
  texts: TextDocument[];
  initialSlug?: string;
};

export function ReadingPage({
  texts,
  initialSlug,
}: ReadingPageProps) {
  const router = useRouter();

  const [deletedSlugs, setDeletedSlugs] = useState<string[]>([]);
  const [localDraftText, setLocalDraftText] = useState<TextDocument | null>(null);
  const [isClientReady, setIsClientReady] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const lastTriggerId = useRef<string | null>(null);
  const glossAreaRef = useRef<HTMLElement | null>(null);

  const defaultSlug = initialSlug ?? texts[0]?.slug ?? "";
  const selectedSlug = defaultSlug;

  useEffect(() => {
    try {
      const hidden = getHiddenSlugs();
      setDeletedSlugs(hidden);
    } catch {}

    try {
      const draftDoc = getLocalDraft(selectedSlug);
      if (draftDoc) {
        setLocalDraftText(draftDoc);
      } else {
        setLocalDraftText(null);
      }
    } catch {}

    setIsClientReady(true);
  }, [selectedSlug]);

  const closeGloss = useCallback(() => {
    setSelectedId(null);
    setPinnedId(null);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGloss();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedId, closeGloss]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const closeOnOutsidePointer = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }

      if (glossAreaRef.current?.contains(target)) {
        return;
      }

      if (target instanceof Element && target.closest("[data-gloss-trigger], .gloss-trigger")) {
        return;
      }

      closeGloss();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("touchstart", closeOnOutsidePointer, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("touchstart", closeOnOutsidePointer);
    };
  }, [selectedId, closeGloss]);

  const handleRestore = () => {
    try {
      restoreHiddenText(selectedSlug);
      setDeletedSlugs((prev) => prev.filter((s) => s !== selectedSlug));
    } catch {}
  };

  const [workspaceTexts, setWorkspaceTexts] = useState<WorkspaceTextItem[]>(() =>
    getWorkspaceTexts({
      currentSlug: selectedSlug,
      allLoadedTexts: texts.map((t) => ({ slug: t.slug, title: t.title })),
      excludeDeleted: true,
    }),
  );

  useEffect(() => {
    setWorkspaceTexts(
      getWorkspaceTexts({
        currentSlug: selectedSlug,
        allLoadedTexts: texts.map((t) => ({ slug: t.slug, title: t.title })),
        excludeDeleted: true,
      }),
    );
  }, [selectedSlug, texts, deletedSlugs]);

  // Memoize base lookup so we don't scan the entire corpus on every render.
  const baseText = useMemo(() => texts.find((text) => text.slug === selectedSlug), [texts, selectedSlug]);
  const selectedText = localDraftText ?? baseText;

  const divergenceStatus = useMemo(
    () => getDraftDivergenceStatus(selectedSlug, baseText),
    [selectedSlug, baseText]
  );

  // Memoize heavy object instantiation from getGlossRecords to prevent unnecessary downstream re-renders.
  const glossRecords = useMemo(() => selectedText ? getGlossRecords(selectedText) : {}, [selectedText]);

  // Memoize the reading passage transformation which involves nested array iterations.
  const readingPassage = useMemo(() => selectedText ? getReadingPassage(selectedText) : undefined, [selectedText]);
  const selectedRecord = selectedId ? glossRecords[selectedId] : undefined;

  const currentTitle = readingPassage?.title;
  const witnessShelfmark = selectedText?.shelfmark;
  const sourceEdition = selectedText?.sourceEdition;
  const currentSource = witnessShelfmark && sourceEdition ? `Witness: ${witnessShelfmark} · Critical Edition: ${sourceEdition}` : "";

    // Aggregate all notes across sentences
  // Memoized because flatMap and nested iterations are expensive to run on every state change (e.g. hover).
  const aggregatedApparatus = useMemo(() => {
    const doc = selectedText || { slug: "", textId: "" };
    return (selectedText?.sentences || []).flatMap((sent, sIdx: number) => {
      const sNum = sent.id.match(/\d+$/)?.[0] || String(sIdx + 1);
      const itemNotes = (sent.notes || []).map((note) => {
        let targetWordForm = "";
        if (note.targetWordIndex != null && sent.words[note.targetWordIndex - 1]) {
          targetWordForm = sent.words[note.targetWordIndex - 1].originalWord;
        }
        return {
          id: note.id,
          sentenceId: sent.id,
          sentenceLabel: `Sentence ${sNum}${note.targetWordIndex ? `.${note.targetWordIndex}` : ""}`,
          wordForm: targetWordForm,
          marker: note.marker || "*",
          type: note.type || "general",
          text: note.text,
        };
      });

      const stringNotes = (sent.footnotes || []).map((fnText: string, fnIdx: number) => ({
        id: `fn-${doc.slug || doc.textId}-${sent.id}-${fnIdx + 1}`,
        sentenceId: sent.id,
        sentenceLabel: `Sentence ${sNum}`,
        wordForm: "",
        gloss: fnText,
        marker: String(fnIdx + 1),
        type: "general" as const,
        text: fnText,
      }));

      return [...itemNotes, ...stringNotes];
    });
  }, [selectedText]);

  const isDeletedLocally = isClientReady && deletedSlugs.includes(selectedSlug);

  if (isDeletedLocally) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <SiteNav current="read" slug={selectedSlug} />
        <main className="site-shell" style={{ maxWidth: "44rem", margin: "4rem auto", padding: "2.5rem 2rem", textAlign: "center", background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "0.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.75rem", color: "var(--ink)", marginBottom: "0.75rem" }}>
            Text Removed from Workspace
          </h2>
          <p style={{ color: "var(--muted-ink)", marginBottom: "1.75rem", fontSize: "1rem", lineHeight: 1.6 }}>
            <em>{currentTitle || selectedSlug}</em> was removed from your local corpus. You can restore it to read and inspect its interlinear glosses, or return to the main directory.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleRestore}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.35rem",
                background: "var(--accent)",
                color: "#ffffff",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Restore Text to Corpus
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.6rem 1.25rem",
                borderRadius: "0.35rem",
                background: "#fbf7ee",
                color: "var(--ink)",
                fontWeight: 600,
                border: "1px solid var(--rule)",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Return to Corpus Directory
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const selectOnHover = (id: string) => {
    if (!pinnedId) {
      setSelectedId(id);
    }
  };

  const pinSelection = (id: string) => {
    lastTriggerId.current = id;
    setSelectedId(id);
    setPinnedId(id);
  };

  const rememberTrigger = (id: string) => {
    lastTriggerId.current = id;
  };



  return (
    <>
      <SiteNav current="read" slug={texts.some((text) => text.slug === selectedSlug) ? selectedSlug : (texts[0]?.slug ?? "ohthere-wulfstan")} />
      <main className="site-shell">
        <PageHero
          eyebrow="Interlinear"
          badge={
            <button
              type="button"
              onClick={() => setAttributionOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.6rem",
                background: "#fbf7ee",
                border: "1px solid #dfcfb8",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--accent)",
                cursor: "pointer",
              }}
            >
              Attribution &amp; Citation
            </button>
          }
          title={currentTitle}
          description={currentSource}
          actions={
            workspaceTexts && workspaceTexts.length > 1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label htmlFor="viewer-text-select" style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Switch text:
                </label>
                <select
                  id="viewer-text-select"
                  value={selectedSlug}
                  onChange={(e) => router.push(`/read/${e.target.value}`)}
                  style={{ padding: "0.35rem 0.6rem", fontSize: "0.85rem", border: "1px solid var(--rule)", borderRadius: "0.25rem", background: "var(--surface)", color: "var(--ink)" }}
                >
                  {workspaceTexts.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          }
        />

        <AttributionModal
          isOpen={attributionOpen}
          onClose={() => setAttributionOpen(false)}
          slug={selectedSlug}
          title={currentTitle || selectedSlug}
          author={selectedText?.author}
          editor={selectedText?.editor}
          shelfmark={selectedText?.shelfmark}
          dialect={selectedText?.dialect}
          historicalDate={selectedText?.historicalDate}
          sourceEdition={selectedText?.sourceEdition}
          source={currentSource}
        />

        {divergenceStatus.isDiverged && (
          <div
            style={{
              margin: "1rem 0 1.5rem",
              padding: "0.85rem 1.25rem",
              background: divergenceStatus.isUpstreamModified ? "#fef2f2" : "#fefce8",
              border: `1px solid ${divergenceStatus.isUpstreamModified ? "#f87171" : "#fef08a"}`,
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <AlertTriangle style={{ width: "1.25rem", height: "1.25rem", color: divergenceStatus.isUpstreamModified ? "#dc2626" : "#ca8a04", flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: "0.88rem", color: divergenceStatus.isUpstreamModified ? "#991b1b" : "#854d0e", display: "block" }}>
                  {divergenceStatus.isUpstreamModified
                    ? "Upstream Conflict: Local Draft Diverged from Updated Repository Edition"
                    : "Viewing Working Client Draft (Unpublished Local Edits)"}
                </strong>
                <span style={{ fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                  {divergenceStatus.isUpstreamModified
                    ? "The underlying repository document was updated upstream after your local edits were saved."
                    : "This reading view displays your uncommitted client-side draft."}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setDiffModalOpen(true)}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "0.25rem",
                  background: "#ffffff",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <GitCommit style={{ width: "0.85rem", height: "0.85rem" }} />
                Compare Diff
              </button>

              <Link
                href={`/edit/${selectedSlug}`}
                style={{
                  padding: "0.35rem 0.75rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "0.25rem",
                  background: "var(--accent)",
                  color: "#ffffff",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Edit3 style={{ width: "0.85rem", height: "0.85rem" }} />
                Edit Draft
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Discard local edits for "${currentTitle}" and revert to published repository edition?`)) {
                    deleteLocalDraft(selectedSlug);
                    setLocalDraftText(null);
                  }
                }}
                style={{
                  padding: "0.35rem 0.65rem",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  borderRadius: "0.25rem",
                  background: "transparent",
                  border: "1px solid #f87171",
                  color: "#b91c1c",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
                title="Discard local draft and revert to repository edition"
              >
                <Trash2 style={{ width: "0.85rem", height: "0.85rem" }} />
                Revert
              </button>
            </div>
          </div>
        )}

        <DraftDiffModal
          isOpen={diffModalOpen}
          onClose={() => setDiffModalOpen(false)}
          slug={selectedSlug}
          repoDoc={baseText}
          draftDoc={localDraftText}
          updatedAt={divergenceStatus.updatedAt}
          isUpstreamModified={divergenceStatus.isUpstreamModified}
          onDiscard={() => {
            deleteLocalDraft(selectedSlug);
            setLocalDraftText(null);
          }}
          onOpenEditor={() => router.push(`/edit/${selectedSlug}`)}
          onExport={() => router.push(`/edit/${selectedSlug}`)}
        />

        <div className="reading-layout">
          <section className="passage" aria-label="Passage text">
            {readingPassage?.blocks ? (
              readingPassage.blocks.map((block) => (
                <div className="passage-block" key={block.id}>
                  <AnnotatedPassage
                    segments={block.segments}
                    records={glossRecords}
                    notes={block.notes}
                    selectedId={selectedId}
                    onHover={selectOnHover}
                    onSelect={pinSelection}
                    onTriggerFocus={rememberTrigger}
                  />
                  <p className="translation">{block.translation}</p>
                </div>
              ))
            ) : null}
          </section>

          <section
            ref={glossAreaRef}
            className={`gloss-sidebar-container${selectedRecord ? " has-selection" : ""}`}
          >
            {selectedRecord ? (
              <GlossPopup
                record={selectedRecord}
                onClose={closeGloss}
              />
            ) : (
              <aside className="gloss-area" aria-label="Visual gloss">
                <p className="empty-gloss">
                  Hover over a word to preview its gloss. Click or tap to keep it open while you follow a reference.
                </p>
              </aside>
            )}
          </section>
        </div>

        {aggregatedApparatus.length > 0 && (
          <section
            id="critical-apparatus"
            style={{
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "2px solid var(--rule)",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontFamily: "'Charis SIL', Georgia, serif",
                color: "var(--ink)",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              Critical Apparatus &amp; References
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "0.5rem",
                padding: "1.25rem 1.5rem",
              }}
            >
              {aggregatedApparatus.map((item) => (
                <div
                  key={item.id}
                  id={item.id}
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.5,
                    color: "var(--ink)",
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "baseline",
                  }}
                >
                  <strong style={{ color: "#7b3f2a", fontFamily: "monospace", minWidth: "4rem" }}>
                    {item.sentenceLabel}
                    {item.wordForm ? ` (${item.wordForm})` : ""}:
                  </strong>
                  <span>{item.text}</span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: "#fef3c7",
                      color: "#92400e",
                      borderRadius: "0.25rem",
                      padding: "0.1rem 0.4rem",
                      marginLeft: "auto",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.type.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
