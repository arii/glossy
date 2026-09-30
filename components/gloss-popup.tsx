import type { GlossRecord } from "../lib/types";

type GlossPopupProps = {
  record: GlossRecord;
  onClose: () => void;
};

export function GlossPopup({ record, onClose }: GlossPopupProps) {
  const { analysis } = record;

  return (
    <aside className="gloss-popup" aria-live="polite" aria-label={`Gloss for ${record.surface}`}>
      <div className="popup-heading">
        <div>
          <p className="field-label">Selected word</p>
          <h2>{record.surface}</h2>
          <p className="lemma-line">
            {analysis.lemma} · {analysis.partOfSpeech}
          </p>
        </div>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close gloss">
          ×
        </button>
      </div>
      {analysis.phonetic && (
        <p className="phonetic">
          <span className="field-label">Pronunciation</span>
          {analysis.phonetic}
        </p>
      )}
      <div className="gloss-field">
        <p className="field-label">Source gloss</p>
        <p>{record.sourceGloss}</p>
      </div>
      <div className="gloss-field">
        <p className="field-label">Morphemes</p>
        <p className="morpheme-line">
          {analysis.morphemes.map((morpheme) => `${morpheme.form} = ${morpheme.gloss}`).join(" · ")}
        </p>
      </div>
      <div className="gloss-field">
        <p className="field-label">Inflection</p>
        <p>{formatFeatures(analysis.features)}</p>
      </div>
      {analysis.definition && (
        <div className="gloss-field">
          <p className="field-label">Definition</p>
          <p>{analysis.definition}</p>
        </div>
      )}
      {analysis.historicalNote && (
        <div className="gloss-field">
          <p className="field-label">Language note</p>
          <p>{analysis.historicalNote}</p>
        </div>
      )}
      {analysis.wiktionaryUrl && (
        <a className="reference-link" href={analysis.wiktionaryUrl} target="_blank" rel="noreferrer">
          Open in Wiktionary <span aria-hidden="true">↗</span>
        </a>
      )}
    </aside>
  );
}

function formatFeatures(features: GlossRecord["analysis"]["features"]) {
  return Object.entries(features)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}
