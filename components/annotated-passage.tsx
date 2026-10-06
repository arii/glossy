import type { GlossRecord, PassageSegment } from "../lib/types";

type AnnotatedPassageProps = {
  segments: PassageSegment[];
  records: Record<string, GlossRecord>;
  selectedId: string | null;
  onHover: (id: string) => void;
  onSelect: (id: string) => void;
  onTriggerFocus: (id: string) => void;
};

export function renderLinguisticGloss(sourceGloss: string) {
  if (!sourceGloss) return null;
  const parts = sourceGloss.split(/([\-\.])/).filter(Boolean);
  return (
    <span className="source-gloss-token">
      {parts.map((part, index) => {
        if (part === "-" || part === ".") {
          return (
            <span key={index} className="gloss-punct">
              {part}
            </span>
          );
        }
        const isGrammar = /^(?:[0-9]+[A-Z]+|[A-Z0-9]+)$/.test(part);
        if (isGrammar) {
          return (
            <span key={index} className="gloss-tag">
              {part}
            </span>
          );
        }
        return (
          <span key={index} className="gloss-root">
            {part}
          </span>
        );
      })}
    </span>
  );
}

export function AnnotatedPassage({
  segments,
  records,
  selectedId,
  onHover,
  onSelect,
  onTriggerFocus,
}: AnnotatedPassageProps) {
  const handleHover = (id: string) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      onHover(id);
    }
  };

  return (
    <div className="interlinear-block">
      <div className="old-english" aria-label="Source gloss line">
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return (
              <span
                className="passage-text"
                key={`${segment.value}-${index}`}
              >
                {segment.value}
              </span>
            );
          }

          const record = records[segment.glossId];
          if (!record) {
            return <span key={`${segment.glossId}-${index}`}>{segment.value}</span>;
          }

          const isSelected = selectedId === record.id;

          return (
            <span
              key={`${segment.glossId}-${index}`}
              className={`inline-gloss-unit${isSelected ? " is-active-unit" : ""}`}
            >
              <button
                className={`gloss-trigger${record.analysis.morphemes.length > 1 ? " is-multi-morpheme" : ""}${isSelected ? " is-selected" : ""}`}
                type="button"
                data-gloss-trigger={record.id}
                aria-pressed={isSelected}
                aria-expanded={isSelected}
                aria-controls="gloss-popup"
                data-selected={isSelected}
                onPointerOver={() => handleHover(record.id)}
                onMouseOver={() => handleHover(record.id)}
                onFocus={() => {
                  onTriggerFocus(record.id);
                  handleHover(record.id);
                }}
                onClick={() => {
                  onTriggerFocus(record.id);
                  onSelect(record.id);
                }}
              >
                {segment.value}
              </button>
              {renderLinguisticGloss(record.sourceGloss)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
