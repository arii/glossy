import type { GlossRecord, PassageSegment } from "../lib/types";

type AnnotatedPassageProps = {
  segments: PassageSegment[];
  records: Record<string, GlossRecord>;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function AnnotatedPassage({
  segments,
  records,
  selectedId,
  onSelect,
}: AnnotatedPassageProps) {
  return (
    <p className="old-english">
      {segments.map((segment, index) => {
        if (segment.type === "text") {
          return <span key={`${segment.value}-${index}`}>{segment.value}</span>;
        }

        const record = records[segment.glossId];
        if (!record) {
          return <span key={`${segment.glossId}-${index}`}>{segment.value}</span>;
        }

        return (
          <button
            key={`${segment.glossId}-${index}`}
            className={`gloss-trigger${selectedId === record.id ? " is-selected" : ""}`}
            type="button"
            aria-label={`Show gloss for ${record.headword}`}
            aria-pressed={selectedId === record.id}
            onMouseEnter={() => onSelect(record.id)}
            onFocus={() => onSelect(record.id)}
            onClick={() => onSelect(record.id)}
          >
            {segment.value}
          </button>
        );
      })}
    </p>
  );
}
