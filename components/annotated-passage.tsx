import type { GlossRecord, PassageSegment } from "../lib/types";

type AnnotatedPassageProps = {
  segments: PassageSegment[];
  records: Record<string, GlossRecord>;
  selectedId: string | null;
  onHover: (id: string) => void;
  onSelect: (id: string) => void;
  onTriggerFocus: (id: string) => void;
};

export function AnnotatedPassage({
  segments,
  records,
  selectedId,
  onHover,
  onSelect,
  onTriggerFocus,
}: AnnotatedPassageProps) {
  return (
    <div className="interlinear-block">
      <p className="old-english">
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            return (
              <span
                className={selectedId ? "passage-text is-dimmed" : "passage-text"}
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

          return (
            <button
              key={`${segment.glossId}-${index}`}
              className={`gloss-trigger${record.analysis.morphemes.length > 1 ? " is-multi-morpheme" : ""}${selectedId === record.id ? " is-selected" : ""}${selectedId && selectedId !== record.id ? " is-dimmed" : ""}`}
              type="button"
              aria-label={`Show ${record.analysis.morphemes.length > 1 ? "multi-morpheme " : ""}gloss for ${record.surface}`}
              aria-pressed={selectedId === record.id}
              aria-expanded={selectedId === record.id}
              aria-controls="gloss-popup"
              title={`Show gloss for ${record.surface}`}
              data-selected={selectedId === record.id}
              onPointerOver={() => onHover(record.id)}
              onMouseOver={() => onHover(record.id)}
              onTouchStart={() => {
                onTriggerFocus(record.id);
                onSelect(record.id);
              }}
              onFocus={() => {
                onTriggerFocus(record.id);
                onHover(record.id);
              }}
              onClick={() => {
                onTriggerFocus(record.id);
                onSelect(record.id);
              }}
            >
              {segment.value}
            </button>
          );
        })}
      </p>
      <p className="source-gloss-line" aria-label="Source gloss line">
        {segments.map((segment, index) => {
          if (segment.type === "text") {
            const spacing = segment.value.replace(/[^\s]/gu, "");
            return spacing ? <span key={`space-${index}`}>{spacing}</span> : null;
          }

          const record = records[segment.glossId];
          return record ? (
            <span className="source-gloss-token" key={`${segment.glossId}-${index}`}>
              {record.sourceGloss}
            </span>
          ) : null;
        })}
      </p>
    </div>
  );
}
