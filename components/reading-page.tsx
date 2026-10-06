"use client";

import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getGlossRecords, getReadingPassage } from "../lib/passage-utils";
import type { TextDocument } from "../lib/types";
import {
  getLocalDraft,
  getHiddenSlugs,
  restoreHiddenText,
  getWorkspaceTexts,
  type WorkspaceTextItem,
} from "../lib/local-drafts";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";
import { AttributionModal } from "./attribution-modal";
import { PageHeader } from "./page-header";

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

  const baseText = texts.find((text) => text.slug === selectedSlug) ?? texts[0];
  const selectedText = localDraftText ?? baseText;
  const glossRecords = selectedText ? getGlossRecords(selectedText) : {};
  const readingPassage = selectedText ? getReadingPassage(selectedText) : undefined;
  const selectedRecord = selectedId ? glossRecords[selectedId] : undefined;

  const currentTitle = readingPassage?.title;
  const currentSource = readingPassage?.source;

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

      {/* Standardized Reusable PageHeader */}
      <PageHeader
        containerClassName="max-w-7xl"
        eyebrow="Old English visual gloss"
        title={currentTitle}
        metadata={currentSource}
        actions={
          <button
            type="button"
            onClick={() => setAttributionOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-stone-300 shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-stone-700 text-xs font-mono uppercase tracking-wider hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Attribution &amp; Citation
          </button>
        }
      />

      {/* Persistent Workspace Toolbar */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="h-12 border border-stone-200/90 rounded-lg bg-stone-100/60 px-4 flex items-center justify-between gap-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 text-xs font-mono text-stone-600">
            <span className="font-semibold text-stone-900 uppercase tracking-wider">
              Corpus Reader
            </span>
            <span className="text-stone-300">|</span>
            <span>
              {readingPassage?.blocks?.length || 0} sentence{readingPassage?.blocks?.length === 1 ? "" : "s"} loaded
            </span>
          </div>

          {workspaceTexts && workspaceTexts.length > 1 && (
            <div className="flex items-center gap-2">
              <label htmlFor="viewer-text-select" className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                Switch text:
              </label>
              <select
                id="viewer-text-select"
                value={selectedSlug}
                onChange={(e) => router.push(`/read/${e.target.value}`)}
                className="px-2.5 py-1 text-xs border border-stone-300 rounded bg-white text-stone-800 font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
              >
                {workspaceTexts.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <main className="site-shell" style={{ paddingTop: 0 }}>

        <AttributionModal
          isOpen={attributionOpen}
          onClose={() => setAttributionOpen(false)}
          slug={selectedSlug}
          title={currentTitle || selectedSlug}
          author={selectedText?.author}
          source={currentSource}
        />

        <div className="reading-layout">
          <section className="passage" aria-labelledby="passage-heading">
            <h2 id="passage-heading">Text</h2>
            {readingPassage?.blocks ? (
              readingPassage.blocks.map((block) => (
                <div className="passage-block" key={block.id}>
                  <AnnotatedPassage
                    segments={block.segments}
                    records={glossRecords}
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
      </main>
      <SiteFooter />
    </>
  );
}
