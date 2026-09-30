"use client";

import { useState } from "react";
import { glossRecords, readingPassage } from "../data/ohthere";
import { AnnotatedPassage } from "./annotated-passage";
import { GlossPopup } from "./gloss-popup";

export function ReadingPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedRecord = selectedId ? glossRecords[selectedId] : undefined;

  return (
    <main className="page-shell">
      <article className="reading-surface">
        <header className="page-header">
          <p className="eyebrow">Old English visual gloss</p>
          <h1>{readingPassage.title}</h1>
          <p className="source-line">{readingPassage.source}</p>
        </header>

        <div className="reading-layout">
          <section className="passage" aria-labelledby="passage-heading">
            <h2 id="passage-heading">Text</h2>
            <AnnotatedPassage
              segments={readingPassage.segments}
              records={glossRecords}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <p className="translation">{readingPassage.translation}</p>
          </section>
          <section className="gloss-area" aria-label="Visual gloss">
            {selectedRecord ? (
              <GlossPopup record={selectedRecord} onClose={() => setSelectedId(null)} />
            ) : (
              <p className="empty-gloss">Hover over or select an underlined word to explore its gloss.</p>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
