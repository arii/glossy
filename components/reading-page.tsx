"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import { getGlossRecords, getReadingPassage } from "../data/ohthere";
import type { DictionaryEntry, ManuscriptDocument, TextDocument } from "../lib/types";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";
import { GlossaryPanel, GlossWord, GlossaryProvider, useGlossary } from "./glossary";

type ReadingPageProps = {
  texts: TextDocument[];
  manuscripts?: ManuscriptDocument[];
  dictionary?: Record<string, DictionaryEntry>;
  initialSlug?: string;
  query?: string;
  variables?: object;
  data?: Record<string, unknown>;
};

export function ReadingPage({
  texts,
  manuscripts = [],
  dictionary = {},
  initialSlug,
  query,
  variables,
  data,
}: ReadingPageProps) {
  return (
    <GlossaryProvider dictionaryMap={dictionary}>
      <ReadingPageInner
        texts={texts}
        manuscripts={manuscripts}
        dictionary={dictionary}
        initialSlug={initialSlug}
        query={query}
        variables={variables}
        data={data}
      />
    </GlossaryProvider>
  );
}

function ReadingPageInner({
  texts,
  manuscripts = [],
  initialSlug,
  query,
  variables,
  data,
}: ReadingPageProps) {
  const { data: tinaData } = useTina({
    query: query ?? "",
    variables: variables ?? {},
    data: data ?? {},
  });
  const { activeTerm, setActiveTerm } = useGlossary();

  const allItems = [
    ...manuscripts.map((m) => ({
      type: "manuscript" as const,
      slug: m.slug,
      title: m.title,
      item: m,
    })),
    ...texts.map((t) => ({
      type: "text" as const,
      slug: t.slug,
      title: t.title,
      item: t,
    })),
  ];

  const defaultSlug =
    initialSlug ??
    manuscripts[0]?.slug ??
    texts[0]?.slug ??
    "";

  const [selectedSlug, setSelectedSlug] = useState(defaultSlug);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const lastTriggerId = useRef<string | null>(null);
  const glossAreaRef = useRef<HTMLElement | null>(null);

  const activeManuscript =
    (tinaData as { manuscript?: ManuscriptDocument })?.manuscript ??
    manuscripts.find((m) => m.slug === selectedSlug) ??
    (manuscripts.length > 0 ? manuscripts[0] : null);

  const selectedText = texts.find((text) => text.slug === selectedSlug) ?? texts[0];
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

  const changeText = (slug: string) => {
    setSelectedSlug(slug);
    setSelectedId(null);
    setPinnedId(null);
    setActiveTerm(null);
  };

  const rememberTrigger = (id: string) => {
    lastTriggerId.current = id;
  };

  const closeGloss = useCallback(() => {
    setSelectedId(null);
    setPinnedId(null);
    setActiveTerm(null);
    const triggerId = lastTriggerId.current;
    if (triggerId) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-gloss-trigger="${triggerId}"]`)
          ?.focus();
      });
    }
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

    const closeOnOutsidePointer = (event: PointerEvent) => {
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
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [selectedId, activeTerm, closeGloss]);

  const markdownComponents: Components<{
    GlossWord: { text?: string; dictEntry?: string | DictionaryEntry };
  }> = {
    GlossWord: (props) => (
      <GlossWord text={String(props?.text ?? "")} dictEntry={props?.dictEntry} />
    ),
  };

  return (
    <main className="page-shell">
      <article className="reading-surface">
        <header className="page-header">
          <p className="eyebrow">Old English visual gloss</p>
          {allItems.length > 1 && (
            <div className="text-picker">
              <label htmlFor="text-select">Text</label>
              <select
                id="text-select"
                value={selectedSlug}
                onChange={(event) => changeText(event.target.value)}
              >
                {allItems.map((entry) => (
                  <option key={entry.slug} value={entry.slug}>
                    {entry.title}
                  </option>
                ))}
              </select>
            </div>
          )}
          <h1 data-tina-field={activeManuscript?._tina_metadata?.title}>{currentTitle}</h1>
          <p className="source-line" data-tina-field={activeManuscript?._tina_metadata?.source}>{currentSource}</p>
        </header>

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
            className="gloss-sidebar-container"
          >
            {activeTerm ? (
              <GlossaryPanel
                activeTerm={activeTerm}
                onClose={() => setActiveTerm(null)}
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

        <footer className="reader-footer">
          <p className="reader-footer-note">
            Glossy — Interactive Old English Reader &amp; Linguistic Visualizer
          </p>
          <a
            className="reader-admin-link"
            href="/admin/index.html#/collections/manuscript/~"
            title="Open TinaCMS dictionary and manuscript authoring tools"
          >
            Editorial &amp; CMS Tools →
          </a>
        </footer>
      </article>
    </main>
  );
}

