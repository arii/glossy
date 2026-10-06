"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "../../../components/site-nav";
import { tokenizeAndLemmatizeSentence } from "../../../lib/lemmatizer";
import { parseGb4e } from "../../../lib/gb4e";
import type { TextDocument, ReadingSentence } from "../../../lib/types";
import ingestPageData from "../../../content/pages/ingest.json";
import { useTina, tinaField } from "tinacms/dist/react";
import {
  FileText,
  BookOpen,
  RotateCcw,
  Check,
} from "lucide-react";

const INGEST_PAGE_QUERY = `
  query IngestPageQuery($relativePath: String!) {
    page(relativePath: $relativePath) {
      title
      eyebrow
      heading
      description
    }
  }
`;

type Preset = {
  id: string;
  title: string;
  slug: string;
  author: string;
  source: string;
  sourceFile: string;
  period: string;
  lines: Array<{ oe: string; en: string }>;
};

const PRESETS: Preset[] = [
  {
    id: "beowulf-prologue",
    title: "Beowulf: Prologue (Lines 1–11)",
    slug: "beowulf-prologue",
    author: "Anonymous (Nowell Codex)",
    source: "London, British Library, Cotton MS Vitellius A. xv, ff. 129r–198v",
    sourceFile: "references/Beowulf_Prologue.tex",
    period: "Heroic Epic Poetry (ca. 8th–11th c.)",
    lines: [
      {
        oe: "Hwæt! Wē Gār-Den-a in ġeār-dag-um,",
        en: "Listen! We of the Spear-Danes in days of yore,",
      },
      {
        oe: "þēod-cyning-a, þrym ġe-frūn-on,",
        en: "of the people's kings, have heard of their glory,",
      },
      {
        oe: "hū ðā æþeling-as ellen fremed-on.",
        en: "how those noble princes performed courageous deeds.",
      },
      {
        oe: "Oft Scyld Scēf-ing sceaþe-na þrēat-um,",
        en: "Often Scyld Scefing from troops of enemies,",
      },
      {
        oe: "manig-um mǣġþ-um, meodo-setl-a of-tēah,",
        en: "from many tribes, seized the mead-benches,",
      },
      {
        oe: "egs-od-e eorl-as, syððan ǣrest wearð",
        en: "terrified the earls, after he was first",
      },
      {
        oe: "fēa-sceaft fund-en; hē þæs frōfr-e ġe-bād,",
        en: "found destitute; he experienced solace for that,",
      },
      {
        oe: "wēox under wolcn-um, weorð-mynd-um þāh,",
        en: "grew under the clouds, prospered in honors,",
      },
      {
        oe: "oð-þæt him ǣġ-hwylċ þār-a ymb-sitt-end-ra",
        en: "until each of the surrounding peoples",
      },
      {
        oe: "ofer hron-rād-e hȳr-an scol-d-e,",
        en: "across the whale-road had to obey him,",
      },
      {
        oe: "gomb-an gyld-an. Þæt wæs gōd cyning!",
        en: "and pay tribute. That was a good king!",
      },
    ],
  },
  {
    id: "caedmon-hymn",
    title: "Cædmon's Hymn",
    slug: "caedmon-hymn",
    author: "Cædmon (Bede's Historia Ecclesiastica)",
    source: "Cambridge, University Library, MS Kk. 5. 16 (Moore Bede)",
    sourceFile: "references/Caedmon_Hymn.tex",
    period: "Northumbrian Religious Hymn (ca. 7th c.)",
    lines: [
      {
        oe: "Nū sculon herigean heofonrīces Weard, Meotodes meahte ond his mōdġeþanc, weorc Wuldorfæder, swā hē wundra ġehwæs, ēce Drihten, ōr onstealde.",
        en: "Now we must praise the Guardian of the heavenly kingdom, the Maker's might and His mind's thought, the work of the Father of Glory, as He, the eternal Lord, established the beginning of each wonder.",
      },
      {
        oe: "Hē ǣrest sceōp eorðan bearnum heofon tō hrōfe, hālig Scyppend; þā middanġeard moncynnes Weard, ēce Drihten, æfter tēode fīrum foldan, Fēa ælmihtig.",
        en: "He first created heaven as a roof for the children of earth, holy Creator; then the Guardian of mankind, the eternal Lord, Almighty Ruler, afterwards adorned the middle-earth, the world for men.",
      },
    ],
  },
  {
    id: "the-wanderer",
    title: "The Wanderer (Opening)",
    slug: "the-wanderer",
    author: "Anonymous (Exeter Book)",
    source: "Exeter, Cathedral Library, MS 3501, ff. 76v–79r",
    sourceFile: "references/The_Wanderer.tex",
    period: "Elegiac Verse (10th c.)",
    lines: [
      {
        oe: "Oft him ānhaga āre ġebīdeð, metudes miltse, þēah þe hē mōdċeariġ geond lagulāde longe sceolde hrēran mid hondum hrīmcealde sǣ, wadan wræclāstas.",
        en: "Often the solitary one awaits mercy for himself, the Maker's grace, though sorrowful of mind across the water-way he must long stir the frost-cold sea with his hands, tread paths of exile.",
      },
      {
        oe: "Wyrd bið ful ārǣd!",
        en: "Fate is fully fixed!",
      },
    ],
  },
];

export default function NewTextPage() {
  const router = useRouter();

  const { data: pageData } = useTina({
    query: INGEST_PAGE_QUERY,
    variables: { relativePath: "ingest.json" },
    data: ingestPageData,
  });

  // Top-level workflow tab: "custom" vs "preset"
  const [workflowTab, setWorkflowTab] = useState<"custom" | "preset">("custom");

  // Default to empty state
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [source, setSource] = useState("");
  const [sourceFile, setSourceFile] = useState("");

  const [inputMode, setInputMode] = useState<"text" | "gb4e">("text");
  const [rawText, setRawText] = useState("");
  const [rawTranslations, setRawTranslations] = useState("");
  const [latexSource, setLatexSource] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ kind: "idle" | "success" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });

  const oeLinesList = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const enLinesList = rawTranslations.split("\n").map((l) => l.trim()).filter(Boolean);
  const oeCount = oeLinesList.length;
  const enCount = enLinesList.length;
  const isLineCountMatched = oeCount > 0 && oeCount === enCount;

  // Clear all fields to return to a clean blank state
  const handleClearForm = () => {
    setActivePresetId(null);
    setTitle("");
    setSlug("");
    setAuthor("");
    setSource("");
    setSourceFile("");
    setRawText("");
    setRawTranslations("");
    setLatexSource("");
    setStatusMessage({
      kind: "idle",
      text: "",
    });
  };

  // Toggle presets on/off: clicking active preset deselects it and clears the form
  const handlePresetToggle = (preset: Preset) => {
    if (activePresetId === preset.id) {
      handleClearForm();
      setStatusMessage({
        kind: "idle",
        text: `Deselected "${preset.title}". Form reset to blank.`,
      });
    } else {
      setActivePresetId(preset.id);
      setTitle(preset.title);
      setSlug(preset.slug);
      setAuthor(preset.author);
      setSource(preset.source);
      setSourceFile(preset.sourceFile);
      setRawText(preset.lines.map((l) => l.oe).join("\n"));
      setRawTranslations(preset.lines.map((l) => l.en).join("\n"));
      setInputMode("text");
      setStatusMessage({
        kind: "success",
        text: `✓ Loaded preset: ${preset.title} (${preset.lines.length} lines with Old English and English translation).`,
      });
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug || "");
    setSourceFile(val.trim() ? `references/${val.replace(/[^a-zA-Z0-9]+/g, "_")}.tex` : "");
  };

  const handleCreateDocument = async () => {
    if (!title.trim() || !slug.trim()) {
      setStatusMessage({ kind: "error", text: "Please provide a valid Document Title and URL Slug." });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ kind: "idle", text: "" });

    try {
      let sentences: ReadingSentence[] = [];

      if (inputMode === "gb4e" && latexSource.trim()) {
        const parsed = parseGb4e(latexSource);
        sentences = parsed.sentences;
      } else {
        const oeLines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
        const enLines = rawTranslations.split("\n").map((l) => l.trim());

        if (oeLines.length === 0) {
          throw new Error("Please enter at least one Old English sentence.");
        }

        if (oeLines.length !== enLines.filter(Boolean).length && enLines.filter(Boolean).length > 0) {
          throw new Error(
            `Line count mismatch: ${oeLines.length} Old English lines vs ${enLines.filter(Boolean).length} English translations. Please ensure each line matches.`,
          );
        }

        sentences = oeLines.map((line, sIdx) => {
          const words = tokenizeAndLemmatizeSentence(line, sIdx + 1);
          return {
            id: `sent-${sIdx + 1}`,
            translation: enLines[sIdx] || `[Translation for sentence ${sIdx + 1}]`,
            words: words.map((w) => ({
              id: w.id,
              originalWord: w.sourceForm.replace(/[.,;:!?"'“”‘’()\[\]]+$/, ""),
              trailingPunctuation: (w.sourceForm.match(/[.,;:!?"'“”‘’()\[\]]+$/) || [""])[0],
              morphologicalGloss: w.sourceGloss,
              sourceGlossTex: w.literalTexGloss,
              analysis: {
                lemma: w.lemma,
                partOfSpeech: w.pos,
                definition: w.explanation,
                wiktionaryUrl: w.wiktionaryUrl,
                features: w.inflections || {},
                morphemes: w.morphemes
                  ? w.morphemes.map((m) => ({ form: m.morpheme, gloss: m.gloss }))
                  : [{ form: w.sourceForm, gloss: w.sourceGloss }],
              },
            })),
          };
        });
      }

      const documentPayload: TextDocument = {
        textId: slug,
        slug: slug,
        title: title.trim(),
        author: author.trim() || "Anonymous",
        source: source.trim() || "Historical Manuscript",
        sourceFile: sourceFile.trim() || `references/${slug}.tex`,
        language: "Old English",
        status: "published",
        sentences: sentences,
        blocks: [],
      };

      const response = await fetch("/api/save-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug,
          fileName: slug,
          document: documentPayload,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save new text.");
      }

      setStatusMessage({
        kind: "success",
        text: `Successfully created "${title}"! Redirecting to the live gloss editor...`,
      });

      setTimeout(() => {
        router.push(`/edit/${slug}`);
      }, 800);
    } catch (err) {
      setStatusMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "An unexpected error occurred.",
      });
      setIsSubmitting(false);
    }
  };

  const hasAnyContent = Boolean(
    title.trim() || slug.trim() || author.trim() || source.trim() || rawText.trim() || rawTranslations.trim() || latexSource.trim()
  );

  return (
    <>
      <SiteNav current="new" slug="ohthere-wulfstan" />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow" data-tina-field={tinaField(pageData, "eyebrow")}>
            {pageData.eyebrow || "Glossy · Corpus Ingestion"}
          </p>
          <h1 data-tina-field={tinaField(pageData, "heading")}>
            {pageData.heading || "Gloss a New Old English Text"}
          </h1>
          <p
            className="source-line"
            data-tina-field={tinaField(pageData, "description")}
            style={{ maxWidth: "48rem", fontSize: "1.05rem", lineHeight: 1.6 }}
          >
            {pageData.description || (
              <>
                Paste raw Old English sentences, choose a classic preset (such as <em>Beowulf</em> or{" "}
                <em>Cædmon&apos;s Hymn</em>), or paste LaTeX <code>gb4e</code> code. The ingestion engine will
                automatically tokenize, lemmatize, and initialize your interlinear glosses.
              </>
            )}
          </p>
        </header>

        {/* Workspace Card */}
        <section
          className="workspace-choice"
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            textAlign: "left",
            background: "var(--surface)",
            border: "1px solid var(--rule)",
            borderRadius: "0.5rem",
            padding: "clamp(1.5rem, 3vw, 2.5rem)",
            boxShadow: "0 0.5rem 2rem rgba(64, 47, 29, 0.04)",
          }}
        >
          {/* Top-Level Workflow Tabs */}
          <div
            className="docs-domain-tabs"
            style={{
              marginTop: 0,
              marginBottom: "1.75rem",
              borderTop: "none",
              paddingTop: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                type="button"
                role="tab"
                aria-selected={workflowTab === "custom"}
                onClick={() => setWorkflowTab("custom")}
                className={`docs-domain-tab ${workflowTab === "custom" ? "active" : ""}`}
              >
                <FileText style={{ width: "0.95rem", height: "0.95rem" }} />
                <span>Enter Custom Text</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={workflowTab === "preset"}
                onClick={() => setWorkflowTab("preset")}
                className={`docs-domain-tab ${workflowTab === "preset" ? "active" : ""}`}
              >
                <BookOpen style={{ width: "0.95rem", height: "0.95rem" }} />
                <span>Load Classic Preset</span>
                {activePresetId && (
                  <span className="docs-tab-count" style={{ background: "#22c55e", color: "#fff" }}>
                    Active
                  </span>
                )}
              </button>
            </div>

            {hasAnyContent && (
              <button
                type="button"
                onClick={handleClearForm}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "transparent",
                  border: "1px solid var(--rule)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "0.35rem",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--muted-ink)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                title="Clear all fields and reset form to blank"
              >
                <RotateCcw style={{ width: "0.8rem", height: "0.8rem" }} />
                <span>Start Blank / Clear Form</span>
              </button>
            )}
          </div>

          {/* Preset Workflow View */}
          {workflowTab === "preset" && (
            <div
              style={{
                marginBottom: "1.75rem",
                padding: "1.25rem",
                background: "#fbf7ee",
                borderRadius: "0.45rem",
                border: "1px solid #dfcfb8",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "0.92rem",
                      color: "var(--ink)",
                      fontFamily: "'Charis SIL', Georgia, serif",
                    }}
                  >
                    Select a Curated Old English Manuscript Preset
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                    Click a preset to populate the form. Click the active preset again to deselect it and start blank.
                  </span>
                </div>
                {activePresetId && (
                  <button
                    type="button"
                    onClick={handleClearForm}
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--accent)",
                      background: "#f3eadb",
                      border: "1px solid #dfcfb8",
                      borderRadius: "0.25rem",
                      padding: "0.25rem 0.5rem",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    ✕ Deselect Preset
                  </button>
                )}
              </div>

              <div className="docs-tier-cards-grid" style={{ marginTop: "0.75rem", gap: "0.75rem" }}>
                {PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetToggle(preset)}
                      style={{
                        textAlign: "left",
                        padding: "1rem",
                        borderRadius: "0.35rem",
                        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--rule)",
                        background: isSelected ? "#fbf2e6" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 2px 8px rgba(123, 63, 42, 0.15)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontFamily: "monospace",
                            fontWeight: 700,
                            padding: "0.15rem 0.4rem",
                            borderRadius: "0.2rem",
                            background: isSelected ? "var(--accent)" : "#ece3d3",
                            color: isSelected ? "#ffffff" : "var(--accent)",
                          }}
                        >
                          {preset.period}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.2rem",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              color: "var(--accent)",
                            }}
                          >
                            <Check style={{ width: "0.85rem", height: "0.85rem" }} /> Selected
                          </span>
                        )}
                      </div>
                      <h4
                        style={{
                          margin: "0 0 0.25rem",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                          fontFamily: "'Charis SIL', Georgia, serif",
                        }}
                      >
                        {preset.title}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--muted-ink)", lineHeight: 1.4 }}>
                        {preset.lines.length} lines · {preset.author}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Metadata Inputs */}
          <div
            style={{
              marginBottom: "1.5rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--accent)",
                }}
              >
                1. Document Metadata
              </span>
              {!activePresetId && !title && (
                <span style={{ fontSize: "0.75rem", color: "var(--muted-ink)", fontStyle: "italic" }}>
                  Empty state — enter your manuscript details below
                </span>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label
                  htmlFor="text-title"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}
                >
                  Document Title <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  id="text-title"
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Beowulf: Prologue, Cædmon's Hymn, or custom title"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    fontSize: "0.95rem",
                    background: "var(--paper)",
                    color: "var(--ink)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="text-slug"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}
                >
                  URL Slug / Text ID <span style={{ color: "var(--accent)" }}>*</span>
                </label>
                <input
                  id="text-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. beowulf-prologue or custom-slug"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    fontSize: "0.95rem",
                    background: "var(--paper)",
                    color: "var(--ink)",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="text-author"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}
                >
                  Author / Scribe Attribution
                </label>
                <input
                  id="text-author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Anonymous, King Alfred, Cynewulf"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    fontSize: "0.95rem",
                    background: "var(--paper)",
                    color: "var(--ink)",
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="text-source"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}
                >
                  Manuscript / Reference Locator
                </label>
                <input
                  id="text-source"
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Cotton MS Vitellius A. xv, Exeter Book"
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    fontSize: "0.95rem",
                    background: "var(--paper)",
                    color: "var(--ink)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Text Ingestion */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "Arial, sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--accent)",
                }}
              >
                2. Corpus Content &amp; Translation
              </span>

              {/* Input Format Sub-tabs */}
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.25rem",
                    border: "1px solid var(--rule)",
                    background: inputMode === "text" ? "var(--accent)" : "#fbf7ee",
                    color: inputMode === "text" ? "#ffffff" : "var(--ink)",
                    fontWeight: inputMode === "text" ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  📝 Plain Text &amp; Parallel English
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("gb4e")}
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "0.25rem",
                    border: "1px solid var(--rule)",
                    background: inputMode === "gb4e" ? "var(--accent)" : "#fbf7ee",
                    color: inputMode === "gb4e" ? "#ffffff" : "var(--ink)",
                    fontWeight: inputMode === "gb4e" ? 700 : 500,
                    cursor: "pointer",
                  }}
                >
                  📜 LaTeX gb4e Macros
                </button>
              </div>
            </div>

            {inputMode === "text" ? (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <label htmlFor="raw-oe" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                      Old English Text (One sentence/clause per line)
                    </label>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "var(--accent)",
                        background: "rgba(123, 63, 42, 0.08)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {oeCount} {oeCount === 1 ? "line" : "lines"}
                    </span>
                  </div>
                  <textarea
                    id="raw-oe"
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste Old English sentences here (e.g. Hwæt! Wē Gār-Dena in ġeārdagum...)"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border, #cbd5e1)",
                      fontFamily: "'Charis SIL', Georgia, serif",
                      fontSize: "1.05rem",
                      background: "var(--paper)",
                      color: "var(--ink)",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <label htmlFor="raw-en" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
                      Modern English Translations (One per line matching above)
                    </label>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "monospace",
                        color: "var(--accent)",
                        background: "rgba(123, 63, 42, 0.08)",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "0.25rem",
                      }}
                    >
                      {enCount} {enCount === 1 ? "line" : "lines"}
                    </span>
                  </div>
                  <textarea
                    id="raw-en"
                    rows={5}
                    value={rawTranslations}
                    onChange={(e) => setRawTranslations(e.target.value)}
                    placeholder="Paste matching Modern English translations here..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      border: "1px solid var(--color-border, #cbd5e1)",
                      fontSize: "0.95rem",
                      background: "var(--paper)",
                      color: "var(--ink)",
                    }}
                  />

                  {/* Line Count Sync Indicator */}
                  <div style={{ marginTop: "0.5rem" }}>
                    {oeCount > 0 && enCount > 0 && isLineCountMatched && (
                      <span style={{ fontSize: "0.8rem", color: "#15803d", fontWeight: 600 }}>
                        ✓ Perfect 1:1 line alignment ({oeCount} sentences paired)
                      </span>
                    )}
                    {oeCount > 0 && enCount > 0 && !isLineCountMatched && (
                      <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: 600 }}>
                        ⚠️ Line count mismatch: {oeCount} Old English lines vs {enCount} translations. Please ensure 1:1 sentence pairing.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  htmlFor="raw-latex"
                  style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}
                >
                  LaTeX gb4e Source Code
                </label>
                <textarea
                  id="raw-latex"
                  rows={10}
                  value={latexSource}
                  onChange={(e) => setLatexSource(e.target.value)}
                  placeholder={`\\begin{exe}\n\\ex \\gll Hwæt! Wē Gār-Den-a... \\\\\n     \\textsc{listen} 1\\textsc{pl.nom} spear-Dane-\\textsc{gen.pl} ... \\\\\n\\glt \`Listen! We of the Spear-Danes...\'\n\\end{exe}`}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border, #cbd5e1)",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    background: "var(--paper)",
                    color: "var(--ink)",
                  }}
                />
              </div>
            )}
          </div>

          {statusMessage.text && (
            <div
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                background: statusMessage.kind === "success" ? "#dcfce7" : "#fee2e2",
                color: statusMessage.kind === "success" ? "#15803d" : "#b91c1c",
                border: `1px solid ${statusMessage.kind === "success" ? "#86efac" : "#fca5a5"}`,
                fontSize: "0.9rem",
              }}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateDocument}
              disabled={isSubmitting}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? "Ingesting & Lemmatizing..." : "🚀 Create & Start Glossing"}
            </button>
            {hasAnyContent && (
              <button
                type="button"
                onClick={handleClearForm}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--muted-ink)",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                }}
              >
                Clear Form
              </button>
            )}
            <Link href="/" style={{ color: "var(--color-muted, #64748b)", textDecoration: "none", fontSize: "0.9rem" }}>
              Cancel
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
