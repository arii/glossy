"use client";

import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";
import { useCallback, useEffect, useRef, useState } from "react";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { getGlossRecords, getReadingPassage } from "../lib/passage-utils";
import type { DictionaryEntry, ManuscriptDocument, TextDocument } from "../lib/types";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";
import { GlossaryPanel, GlossWord, GlossaryProvider, useGlossary } from "./glossary";
import { AttributionModal } from "./attribution-modal";

type ReadingPageProps = {
  texts: TextDocument[];
  manuscripts?: ManuscriptDocument[];
  dictionary?: Record<string, DictionaryEntry>;
  initialSlug?: string;
};

export function ReadingPage({
  texts,
  manuscripts = [],
  dictionary = {},
  initialSlug,
}: ReadingPageProps) {
  return (
    <GlossaryProvider dictionaryMap={dictionary}>
      <ReadingPageInner
        texts={texts}
        manuscripts={manuscripts}
        dictionary={dictionary}
        initialSlug={initialSlug}
      />
    </GlossaryProvider>
  );
}

function ReadingPageInner({
  texts,
  manuscripts = [],
  initialSlug,
}: ReadingPageProps) {
  const { activeTerm, setActiveTerm } = useGlossary();

  const visibleManuscripts = manuscripts.filter(
    (manuscript) =>
      !texts.some(
        (text) =>
          text.textId === manuscript.slug ||
          text.slug === manuscript.slug ||
          normalizeTitle(text.title) === normalizeTitle(manuscript.title),
      ),
  );

  const defaultSlug =
    initialSlug ??
    texts[0]?.slug ??
    visibleManuscripts[0]?.slug ??
    "";

  const selectedSlug = defaultSlug;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const lastTriggerId = useRef<string | null>(null);
  const glossAreaRef = useRef<HTMLElement | null>(null);

  const activeManuscript = visibleManuscripts.find((m) => m.slug === selectedSlug);
  const selectedText = texts.find((text) => text.slug === selectedSlug) ?? (activeManuscript ? undefined : texts[0]);
  const glossRecords = selectedText ? getGlossRecords(selectedText) : {};
  const readingPassage = selectedText ? getReadingPassage(selectedText) : undefined;
  const selectedRecord = selectedId ? glossRecords[selectedId] : undefined;

  const currentTitle = activeManuscript?.title ?? readingPassage?.title;
  const currentSource = activeManuscript?.source ?? readingPassage?.source;

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

  const closeGloss = useCallback(() => {
    setSelectedId(null);
    setPinnedId(null);
    setActiveTerm(null);
  }, [setActiveTerm]);

  useEffect(() => {
    if (!selectedId && !activeTerm) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeGloss();
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedId, activeTerm, closeGloss]);

  useEffect(() => {
    if (!selectedId && !activeTerm) {
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
  }, [selectedId, activeTerm, closeGloss]);

  const markdownComponents: Components<{
    GlossWord: { text?: string; dictEntry?: string | DictionaryEntry };
  }> = {
    GlossWord: (props) => (
      <GlossWord text={String(props?.text ?? "")} dictEntry={props?.dictEntry} />
    ),
  };

  const [attributionOpen, setAttributionOpen] = useState(false);

  return (
    <>
      <SiteNav current="read" slug={texts.some((text) => text.slug === selectedSlug) ? selectedSlug : (texts[0]?.slug ?? "ohthere-wulfstan")} />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
            <p className="eyebrow" style={{ margin: 0 }}>Old English visual gloss</p>
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
          </div>
          <div>
            <h1 data-tina-field={activeManuscript?._tina_metadata?.title}>{currentTitle}</h1>
            <p className="source-line" data-tina-field={activeManuscript?._tina_metadata?.source}>{currentSource}</p>
          </div>
        </header>

        <AttributionModal
          isOpen={attributionOpen}
          onClose={() => setAttributionOpen(false)}
          slug={selectedSlug}
          title={currentTitle}
          author={selectedText?.author ?? activeManuscript?.author}
          source={currentSource}
        />

        <div className="reading-layout">
          <section className="passage" aria-labelledby="passage-heading">
            <h2 id="passage-heading">Text</h2>
            {activeManuscript?.blocks && activeManuscript.blocks.length > 0 ? (
              activeManuscript.blocks.map((block) => (
                <div className="passage-block" key={block.id}>
                  <div
                    className="old-english"
                    aria-label="Source gloss line"
                  >
                    <TinaMarkdown
                      content={block.body as Parameters<typeof TinaMarkdown>[0]["content"]}
                      components={markdownComponents}
                    />
                  </div>
                  {block.translation && (
                    <p className="translation">
                      {block.translation}
                    </p>
                  )}
                </div>
              ))
            ) : activeManuscript?.body ? (
              <div className="passage-block">
                <div
                  className="old-english"
                  data-tina-field={activeManuscript?._tina_metadata?.body}
                  aria-label="Source gloss line"
                >
                  <TinaMarkdown
                    content={activeManuscript.body as Parameters<typeof TinaMarkdown>[0]["content"]}
                    components={markdownComponents}
                  />
                </div>
                {activeManuscript.translation && (
                  <p
                    className="translation"
                    data-tina-field={activeManuscript?._tina_metadata?.translation}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {activeManuscript.translation}
                  </p>
                )}
              </div>
            ) : readingPassage?.blocks ? (
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
            className={`gloss-sidebar-container${selectedRecord || activeTerm ? " has-selection" : ""}`}
          >
            {activeTerm ? (
              <GlossaryPanel
                activeTerm={activeTerm}
                onClose={closeGloss}
              />
            ) : selectedRecord ? (
              <GlossPopup
                record={selectedRecord}
                onClose={closeGloss}
              />
            ) : (
              <GlossaryPanel
                activeTerm={null}
                onClose={() => {}}
              />
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/gu, " ").toLocaleLowerCase("und");
}
