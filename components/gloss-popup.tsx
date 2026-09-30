import type { GlossRecord } from "../lib/types";
import { SpeechButton } from "./speech-button";

type GlossPopupProps = {
  record: GlossRecord;
  onClose: () => void;
  onSpeak: () => void;
  speechAvailable: boolean;
};

export function GlossPopup({ record, onClose, onSpeak, speechAvailable }: GlossPopupProps) {
  const { analysis } = record;

  return (
    <aside
      id="gloss-popup"
      className="gloss-popup"
      role="region"
      aria-live="polite"
      aria-labelledby="gloss-popup-heading"
      tabIndex={-1}
    >
      <div className="popup-heading">
        <div>
          <p className="field-label">Selected word</p>
          <h2 id="gloss-popup-heading">{record.surface}</h2>
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
          <span>{analysis.phonetic}</span>{" "}
          {analysis.pronunciationSource && (
            <a
              className="pronunciation-source"
              href={analysis.pronunciationSource}
              target="_blank"
              rel="noreferrer"
            >
              source
            </a>
          )}
        </p>
      )}
      <SpeechButton disabled={!speechAvailable} onClick={onSpeak}>
        Hear word
      </SpeechButton>
      <p className="speech-note">
        Browser speech uses a pronunciation hint; it is not an authoritative reconstructed
        recording.
      </p>
      {!speechAvailable && <p className="speech-note">Speech is not available in this browser.</p>}
      <div className="gloss-field">
        <p className="field-label">Source gloss</p>
        <p>{record.sourceGloss}</p>
      </div>
      <div className="gloss-field">
        <p className="field-label">Morphemes</p>
        <p
          className={`morpheme-line${analysis.morphemes.length > 1 ? " is-expanded" : ""}`}
          aria-label={
            analysis.morphemes.length > 1
              ? `${analysis.morphemes.length} morphemes`
              : "One morpheme"
          }
        >
          {analysis.morphemes.map((morpheme, index) => (
            <span
              className="morpheme-chip"
              key={`${morpheme.form}-${index}`}
              title={explainGloss(morpheme.gloss)}
            >
              {index > 0 && " · "}
              {morpheme.form} = {morpheme.gloss}
            </span>
          ))}
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

function explainGloss(gloss: string) {
  const explanations: Record<string, string> = {
    DAT: "dative case",
    "DAT.PL": "dative plural",
    "DAT.SG": "dative singular",
    IND: "indicative mood",
    "IND.3SG": "indicative, third-person singular",
    PL: "plural",
    PRS: "present tense",
    "PRS.IND.PL": "present indicative plural",
    PST: "past tense",
    SG: "singular",
    "SJV.SG": "subjunctive singular",
    THM: "thematic vowel",
  };

  return explanations[gloss] ?? "Source gloss abbreviation";
}

function formatFeatures(features: GlossRecord["analysis"]["features"]) {
  return Object.entries(features)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}
