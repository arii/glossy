import type { GlossRecord, NoteItem, PassageSegment } from "../lib/types";

type AnnotatedPassageProps = {
  segments: PassageSegment[];
  records: Record<string, GlossRecord>;
  notes?: NoteItem[];
  selectedId: string | null;
  onHover: (id: string) => void;
  onSelect: (id: string) => void;
  onTriggerFocus: (id: string) => void;
  onNoteClick?: (noteId: string) => void;
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
  notes = [],
  selectedId,
  onHover,
  onSelect,
  onTriggerFocus,
  onNoteClick,
}: AnnotatedPassageProps) {
  const handleHover = (id: string) => {
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      onHover(id);
    }
  };

  // Find sentence-level notes without specific target word
  const generalSentenceNotes = notes.filter((n) => n.targetWordIndex == null);

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
          const wordIndex = index + 1;
          const wordNotes = notes.filter(
            (n) => n.targetWordIndex === wordIndex || n.targetWordIndex === index,
          );

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
              {wordNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNoteClick) {
                      onNoteClick(note.id);
                    } else {
                      const el = document.getElementById(note.id);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }
                  }}
                  title={`[${note.type}] ${note.text}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "0 1px",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#b45309",
                    cursor: "pointer",
                    verticalAlign: "super",
                    lineHeight: 1,
                  }}
                >
                  <sup>{note.marker || "*"}</sup>
                </button>
              ))}
              {renderLinguisticGloss(record.sourceGloss)}
            </span>
          );
        })}

        {generalSentenceNotes.map((note) => (
          <button
            key={note.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onNoteClick) {
                onNoteClick(note.id);
              } else {
                const el = document.getElementById(note.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            title={`[${note.type}] ${note.text}`}
            style={{
              background: "transparent",
              border: "none",
              padding: "0 2px",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#92400e",
              cursor: "pointer",
              verticalAlign: "super",
              marginLeft: "2px",
            }}
          >
            <sup>{note.marker || "fn"}</sup>
          </button>
        ))}
      </div>
    </div>
  );
}
