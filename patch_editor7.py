import re

with open("components/gloss-editor.tsx", "r") as f:
    content = f.read()

# Add missing import for useRef
content = content.replace('import { useEffect, useState, useCallback, useMemo } from "react";', 'import { useEffect, useState, useCallback, useMemo, useRef } from "react";')

inline_components = """
export function InlineTitle({
  initialTitle,
  onSave,
}: {
  initialTitle: string;
  onSave: (title: string) => void;
}) {
  const [title, setTitle] = useState(initialTitle);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => setTitle(initialTitle), [initialTitle]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditing(false);
      onSave(title);
    } else if (e.key === "Escape") {
      setEditing(false);
      setTitle(initialTitle);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onSave(title);
        }}
        onKeyDown={handleKeyDown}
        className="border-b border-stone-800 bg-transparent outline-none"
        style={{ width: `${Math.max(1, title.length)}ch` }}
      />
    );
  }

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer hover:underline hover:bg-stone-200/50 rounded px-1 -mx-1"
      title="Click to edit title"
    >
      {title}
    </span>
  );
}

export function InlineMetadata({
  initialAuthor,
  initialDate,
  onSave,
}: {
  initialAuthor: string;
  initialDate: string;
  onSave: (meta: { author: string; date: string }) => void;
}) {
  const [author, setAuthor] = useState(initialAuthor);
  const [date, setDate] = useState(initialDate);
  const [editing, setEditing] = useState<"author" | "date" | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  useEffect(() => setAuthor(initialAuthor), [initialAuthor]);
  useEffect(() => setDate(initialDate), [initialDate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setEditing(null);
      onSave({ author, date });
    } else if (e.key === "Escape") {
      setEditing(null);
      setAuthor(initialAuthor);
      setDate(initialDate);
    }
  };

  return (
    <span className="text-sm text-stone-600 flex items-center gap-1.5 flex-wrap">
      <span>Translated and glossed by</span>

      {/* Author Inline Field */}
      {editing === "author" ? (
        <input
          ref={inputRef}
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          onBlur={() => {
            setEditing(null);
            onSave({ author, date });
          }}
          onKeyDown={handleKeyDown}
          style={{ width: `${Math.max(1, author.length)}ch` }}
          className="border-b border-stone-800 bg-transparent px-1 py-0.5 text-sm font-medium outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing("author")}
          className="cursor-pointer font-medium hover:underline hover:bg-stone-200/50 rounded px-1 -mx-1"
          title="Click to edit"
        >
          {author || "Anonymous"}
        </span>
      )}

      <span>·</span>

      {/* Date Inline Field */}
      {editing === "date" ? (
        <input
          ref={inputRef}
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onBlur={() => {
            setEditing(null);
            onSave({ author, date });
          }}
          onKeyDown={handleKeyDown}
          style={{ width: `${Math.max(1, date.length)}ch` }}
          className="border-b border-stone-800 bg-transparent px-1 py-0.5 text-sm outline-none"
        />
      ) : (
        <span
          onClick={() => setEditing("date")}
          className="cursor-pointer hover:underline hover:bg-stone-200/50 rounded px-1 -mx-1"
          title="Click to edit"
        >
          {date || "Add date"}
        </span>
      )}
    </span>
  );
}

"""
content = content.replace("export function GlossEditor({", inline_components + "export function GlossEditor({")


# Remove unused modal variables
content = re.sub(r'  const \[isEditingMetadata, setIsEditingMetadata\] = useState\(false\);\n', '', content)
# remove unused variables
content = re.sub(r'  // Metadata modal form state\n  const \[metaTitle, setMetaTitle\] = useState\(""\);\n  const \[metaHistoricalAuthor, setMetaHistoricalAuthor\] = useState\(""\);\n  const \[metaGlossedBy, setMetaGlossedBy\] = useState\(""\);\n  const \[metaDate, setMetaDate\] = useState\(""\);\n  const \[metaSourceEdition, setMetaSourceEdition\] = useState\(""\);\n', '', content)

# Remove the title block in reading-surface
old_title_block = """          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Charis SIL', Georgia, serif" }}>
                {documentState.title}
              </h1>
              <div className="text-stone-600 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                <span>Translated and glossed by <span className="font-medium text-stone-900">{documentState.glossedBy || "Anonymous"}</span></span>
                {documentState.date && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span>{documentState.date}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditingMetadata(true)}
              className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Details
            </button>
          </div>"""

new_title_block = """          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-stone-200 pb-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-3" style={{ fontFamily: "'Charis SIL', Georgia, serif" }}>
                <InlineTitle
                  initialTitle={documentState.title}
                  onSave={(newTitle) => updateDocumentField({ title: newTitle })}
                />
              </h1>
              <InlineMetadata
                initialAuthor={documentState.glossedBy || ""}
                initialDate={documentState.date || ""}
                onSave={({ author, date }) => updateDocumentField({ glossedBy: author, date })}
              />
            </div>
          </div>"""
content = content.replace(old_title_block, new_title_block)


# Remove the edit button from the header
content = re.sub(r'              <button\n                type="button"\n                onClick=\{handleOpenMetadataModal\}\n                className="workspace-link"\n                style=\{\{\n                  display: "inline-flex",\n                  alignItems: "center",\n                  gap: "0.3rem",\n                  padding: "0.25rem 0.6rem",\n                  fontSize: "0.8rem",\n                  fontWeight: 600,\n                  color: "var\(--accent\)",\n                  borderColor: "var\(--rule\)",\n                  background: "#fbf7ee",\n                \}\}\n                title="Edit document title, author, date, and manuscript shelfmark"\n              >\n                <Edit style=\{\{ width: "0.85rem", height: "0.85rem" \}\} />\n                Edit Details\n              </button>\n', '', content)


# Remove edit metadata handler
content = re.sub(r'  // Open metadata editing modal initialized with current state\n  const handleOpenMetadataModal = \(\) => \{\n.*?  \};\n\n  const handleSaveMetadata = \(e: React\.FormEvent\) => \{\n.*?  \};\n', '', content, flags=re.DOTALL)


# Remove the metadata modal entirely
modal_end_pattern = re.compile(r'\{\/\* Edit Document Details Modal \*\/\}.*?<\/div>\n      \)\}\n+', re.DOTALL)
content = modal_end_pattern.sub('', content)


content = content.replace('  Edit,', '')
content = content.replace('  Edit3,', '')

with open("components/gloss-editor.tsx", "w") as f:
    f.write(content)
