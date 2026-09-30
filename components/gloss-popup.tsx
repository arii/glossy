import type { GlossRecord } from "../lib/types";

type GlossPopupProps = {
  record: GlossRecord;
  onClose: () => void;
};

export function GlossPopup({ record, onClose }: GlossPopupProps) {
  return (
    <aside className="gloss-popup" aria-live="polite" aria-label={`Gloss for ${record.headword}`}>
      <div className="popup-heading">
        <div>
          <p className="field-label">Selected word</p>
          <h2>{record.headword}</h2>
        </div>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close gloss">
          ×
        </button>
      </div>
      {record.phonetic && (
        <p className="phonetic">
          <span className="field-label">Pronunciation</span>
          {record.phonetic}
        </p>
      )}
      {record.definition && (
        <div className="gloss-field">
          <p className="field-label">Definition</p>
          <p>{record.definition}</p>
        </div>
      )}
      {record.grammar && (
        <div className="gloss-field">
          <p className="field-label">Grammar</p>
          <p>{record.grammar}</p>
        </div>
      )}
      {record.conjugation && (
        <div className="gloss-field">
          <p className="field-label">Conjugation</p>
          <p>{record.conjugation}</p>
        </div>
      )}
      {record.historicalNote && (
        <div className="gloss-field">
          <p className="field-label">Language note</p>
          <p>{record.historicalNote}</p>
        </div>
      )}
      {record.wiktionaryUrl && (
        <a className="reference-link" href={record.wiktionaryUrl} target="_blank" rel="noreferrer">
          Open in Wiktionary <span aria-hidden="true">↗</span>
        </a>
      )}
    </aside>
  );
}
