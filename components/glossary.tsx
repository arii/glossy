"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { DictionaryEntry } from "../lib/types";

type GlossaryContextType = {
  activeTerm: DictionaryEntry | null;
  setActiveTerm: (term: DictionaryEntry | null) => void;
  dictionaryMap: Record<string, DictionaryEntry>;
};

const GlossaryContext = createContext<GlossaryContextType>({
  activeTerm: null,
  setActiveTerm: () => {},
  dictionaryMap: {},
});

export function GlossaryProvider({
  children,
  dictionaryMap,
}: {
  children: ReactNode;
  dictionaryMap: Record<string, DictionaryEntry>;
}) {
  const [activeTerm, setActiveTerm] = useState<DictionaryEntry | null>(null);

  return (
    <GlossaryContext.Provider value={{ activeTerm, setActiveTerm, dictionaryMap }}>
      {children}
    </GlossaryContext.Provider>
  );
}

export function useGlossary() {
  return useContext(GlossaryContext);
}

export type GlossWordProps = {
  text: string;
  dictEntry?: string | DictionaryEntry;
};

export function GlossWord({ text, dictEntry }: GlossWordProps) {
  const { activeTerm, setActiveTerm, dictionaryMap } = useGlossary();

  const resolvedTerm: DictionaryEntry | null =
    typeof dictEntry === "object" && dictEntry !== null
      ? dictEntry
      : typeof dictEntry === "string"
        ? dictionaryMap[dictEntry] ||
          dictionaryMap[dictEntry.replace(/^content\/dictionary\//, "")] ||
          dictionaryMap[dictEntry.replace(/\.json$/, "")] ||
          null
        : null;

  const isActive =
    Boolean(activeTerm && resolvedTerm) &&
    (activeTerm?.id === resolvedTerm?.id ||
      activeTerm?.word === resolvedTerm?.word ||
      activeTerm?.sourceGloss === resolvedTerm?.sourceGloss);

  const sourceGloss = resolvedTerm?.sourceGloss || "";
  const hasMultiMorphemes = (resolvedTerm?.morphemes?.length ?? 0) > 1;

  const handleSelect = () => {
    if (resolvedTerm) {
      setActiveTerm(resolvedTerm);
    }
  };

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      handleSelect();
    }
  };

  return (
    <span className="inline-gloss-unit">
      <button
        type="button"
        onClick={handleSelect}
        onMouseEnter={handleMouseEnter}
        onFocus={handleSelect}
        className={`gloss-trigger${hasMultiMorphemes ? " is-multi-morpheme" : ""}${isActive ? " is-selected" : ""}`}
        aria-label={`Show gloss for ${text}`}
        aria-pressed={isActive}
        title={sourceGloss ? `${text} (${sourceGloss})` : text}
      >
        {text}
      </button>
      {sourceGloss ? (
        <span className="source-gloss-token" aria-hidden="true">
          {sourceGloss}
        </span>
      ) : null}
    </span>
  );
}

export function GlossaryPanel({
  activeTerm,
  onClose,
}: {
  activeTerm: DictionaryEntry | null;
  onClose: () => void;
}) {
  if (!activeTerm) {
    return (
      <aside className="gloss-area" aria-label="Visual gloss">
        <p className="empty-gloss">
          Hover over a word to preview its gloss. Click or tap to keep it open while you follow a reference.
        </p>
      </aside>
    );
  }

  return (
    <aside className="gloss-area has-selection" aria-label="Visual gloss">
      <div className="gloss-popup">
        <div className="popup-heading">
          <div>
            <h2>{activeTerm.word}</h2>
            {activeTerm.pronunciation ? (
              <p className="lemma-line">{activeTerm.pronunciation}</p>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="close-button"
            type="button"
            aria-label="Close gloss details"
          >
            ×
          </button>
        </div>

        {activeTerm.sourceGloss ? (
          <div className="gloss-field">
            <span className="field-label">Source gloss</span>
            <p className="source-gloss-token">{activeTerm.sourceGloss}</p>
          </div>
        ) : null}

        {activeTerm.morphemes && activeTerm.morphemes.length > 0 ? (
          <div className="gloss-field">
            <span className="field-label">Morphemes</span>
            <div className="morpheme-line is-expanded">
              {activeTerm.morphemes.map((m, i) => (
                <span key={i} className="morpheme-chip">
                  {m.part} = {m.meaning}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {activeTerm.inflection ? (
          <div className="gloss-field">
            <span className="field-label">Inflection</span>
            <p>{activeTerm.inflection}</p>
          </div>
        ) : null}

        {activeTerm.definition ? (
          <div className="gloss-field">
            <span className="field-label">Definition</span>
            <p>{activeTerm.definition}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
