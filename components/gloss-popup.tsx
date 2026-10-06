import type { GlossRecord } from "../lib/types";
import { renderLinguisticGloss } from "./annotated-passage";

type GlossPopupProps = {
  record: GlossRecord;
  onClose: () => void;
};

export function GlossPopup({ record, onClose }: GlossPopupProps) {
  const { analysis } = record;
  const isMultiMorpheme = analysis.morphemes.length > 1;
  const formattedFeatures = formatFeatures(analysis.features);

  // Hide definitions that merely restate the Leipzig gloss (e.g. "king-DAT.SG", "DET.DEF.DAT.SG.N")
  const rawDef = analysis.definition?.trim() ?? "";
  const isDefinitionRedundant =
    !rawDef ||
    rawDef === record.sourceGloss.trim() ||
    rawDef === record.surface.trim() ||
    /(^|[-.])[A-Z0-9]{2,}(?=$|[-.])/.test(rawDef);

  const cleanDefinition = isDefinitionRedundant ? null : rawDef;

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

      {/* Morphological Analysis: Single consolidated line */}
      <div className="gloss-field">
        <p className="field-label">Morphological gloss</p>
        {isMultiMorpheme ? (
          <div className="morpheme-line is-expanded">
            {analysis.morphemes.map((morpheme, index) => (
              <span
                className="morpheme-chip"
                key={`${morpheme.form}-${index}`}
                title={explainGloss(morpheme.gloss)}
              >
                {morpheme.form} = {morpheme.gloss}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.95rem" }}>
            {renderLinguisticGloss(record.sourceGloss)}
          </p>
        )}
      </div>

      {formattedFeatures ? (
        <div className="gloss-field">
          <p className="field-label">Inflection</p>
          <p>{formattedFeatures}</p>
        </div>
      ) : null}

      {cleanDefinition && (
        <div className="gloss-field">
          <p className="field-label">Definition</p>
          <p>{cleanDefinition}</p>
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
