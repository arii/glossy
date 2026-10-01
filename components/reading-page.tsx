"use client";

import { useEffect, useRef, useState } from "react";
import { getGlossRecords, getReadingPassage } from "../data/ohthere";
import type { TextDocument } from "../lib/types";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";

type ReadingPageProps = {
  texts: TextDocument[];
  initialSlug?: string;
};

export function ReadingPage({ texts, initialSlug }: ReadingPageProps) {
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? texts[0]?.slug ?? "");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const lastTriggerId = useRef<string | null>(null);
  const glossAreaRef = useRef<HTMLElement | null>(null);
  const selectedText = texts.find((text) => text.slug === selectedSlug) ?? texts[0];
  const glossRecords = selectedText ? getGlossRecords(selectedText) : {};
  const readingPassage = selectedText ? getReadingPassage(selectedText) : undefined;
  const selectedRecord = selectedId ? glossRecords[selectedId] : undefined;

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
  };

  const rememberTrigger = (id: string) => {
    lastTriggerId.current = id;
  };

  const closeGloss = () => {
    setSelectedId(null);
    setPinnedId(null);
    const triggerId = lastTriggerId.current;
    if (triggerId) {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[data-gloss-trigger="${triggerId}"]`)
          ?.focus();
      });
    }
  };

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
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
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

      if (target instanceof Element && target.closest("[data-gloss-trigger]")) {
        return;
      }

      closeGloss();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [selectedId]);

  return (
    <main className="page-shell">
      <article className="reading-surface">
        <header className="page-header">
          <p className="eyebrow">Old English visual gloss</p>
          <div className="text-picker">
            <label htmlFor="text-select">Text</label>
            <select
              id="text-select"
              value={selectedText?.slug}
              onChange={(event) => changeText(event.target.value)}
            >
              {texts.map((text) => (
                <option key={text.slug} value={text.slug}>
                  {text.title}
                </option>
              ))}
            </select>
          </div>
          <a className="editor-link" href="/admin/index.html#/collections/text/~">
            Edit text and glosses
          </a>
          <h1>{readingPassage?.title}</h1>
          <p className="source-line">{readingPassage?.source}</p>
        </header>

        <div className="reading-layout">
          <section className="passage" aria-labelledby="passage-heading">
            <h2 id="passage-heading">Text</h2>
            {readingPassage?.blocks.map((block) => (
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
            ))}
          </section>
          <section
            ref={glossAreaRef}
            className={`gloss-area${selectedRecord ? " has-selection" : ""}`}
            aria-label="Visual gloss"
          >
            {selectedRecord ? (
              <GlossPopup
                record={selectedRecord}
                onClose={closeGloss}
              />
            ) : (
              <p className="empty-gloss">Hover over a word to preview its gloss. Click or tap to keep it open while you follow a reference.</p>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
