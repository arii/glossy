"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteNav } from "../../../components/site-nav";
import { tokenizeAndLemmatizeSentence } from "../../../lib/lemmatizer";
import { parseGb4e } from "../../../lib/gb4e";
import type { TextDocument, ReadingSentence } from "../../../lib/types";

type Preset = {
  id: string;
  title: string;
  slug: string;
  author: string;
  source: string;
  sourceFile: string;
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
    lines: [
      {
        oe: "Hwæt! Wē Gār-Dena in ġeār-dagum,",
        en: "Listen! We of the Spear-Danes in days of yore,",
      },
      {
        oe: "þēod-cyninga, þrym ġefrūnon,",
        en: "of the people's kings, have heard of their glory,",
      },
      {
        oe: "hū ðā æþelingas ellen fremedon.",
        en: "how those noble princes performed courageous deeds.",
      },
      {
        oe: "Oft Scyld Scēfing sceaþena þrēatum,",
        en: "Often Scyld Scefing from troops of enemies,",
      },
      {
        oe: "monegum mǣġþum, meodo-setla oftēah,",
        en: "from many tribes, seized the mead-benches,",
      },
      {
        oe: "egsode eorlas, syððan ǣrest wearð",
        en: "terrified the earls, after he was first",
      },
      {
        oe: "fēasceaft funden; hē þæs frōfre ġebād,",
        en: "found destitute; he experienced solace for that,",
      },
      {
        oe: "wēox under wolcnum, weorðmyndum þāh,",
        en: "grew under the clouds, prospered in honors,",
      },
      {
        oe: "oðþæt him ǣġhwylċ þāra ymbsittendra",
        en: "until each of the surrounding peoples",
      },
      {
        oe: "ofer hron-rāde hȳran scolde,",
        en: "across the whale-road had to obey him,",
      },
      {
        oe: "gomban gyldan. Þæt wæs gōd cyning!",
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
  const [title, setTitle] = useState("Beowulf: Prologue (Lines 1–11)");
  const [slug, setSlug] = useState("beowulf-prologue");
  const [author, setAuthor] = useState("Anonymous (Nowell Codex)");
  const [source, setSource] = useState("London, British Library, Cotton MS Vitellius A. xv, ff. 129r–198v");
  const [sourceFile, setSourceFile] = useState("references/Beowulf_Prologue.tex");
  
  const [inputMode, setInputMode] = useState<"text" | "gb4e">("text");
  const [rawText, setRawText] = useState(
    PRESETS[0].lines.map((l) => l.oe).join("\n")
  );
  const [rawTranslations, setRawTranslations] = useState(
    PRESETS[0].lines.map((l) => l.en).join("\n")
  );
  const [latexSource, setLatexSource] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ kind: "idle" | "success" | "error"; text: string }>({
    kind: "idle",
    text: "",
  });

  const loadPreset = (preset: Preset) => {
    setTitle(preset.title);
    setSlug(preset.slug);
    setAuthor(preset.author);
    setSource(preset.source);
    setSourceFile(preset.sourceFile);
    setRawText(preset.lines.map((l) => l.oe).join("\n"));
    setRawTranslations(preset.lines.map((l) => l.en).join("\n"));
    setInputMode("text");
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setSlug(generatedSlug || "new-text");
    setSourceFile(`references/${val.replace(/[^a-zA-Z0-9]+/g, "_")}.tex`);
  };

  const handleCreateDocument = async () => {
    if (!title.trim() || !slug.trim()) {
      setStatusMessage({ kind: "error", text: "Please provide a valid Title and Slug." });
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

  return (
    <main className="workspace-shell">
      <SiteNav current="edit" slug="" canEdit={false} />
      
      <section className="workspace-choice" style={{ maxWidth: "860px", margin: "0 auto", textAlign: "left" }}>
        <p className="workspace-eyebrow">Glossy · Corpus Ingestion</p>
        <h1 style={{ marginBottom: "0.5rem" }}>Gloss a New Old English Text</h1>
        <p className="workspace-choice-copy" style={{ marginBottom: "1.5rem" }}>
          Paste raw Old English sentences, select a classic preset (such as <em>Beowulf</em> or <em>Cædmon&apos;s Hymn</em>),
          or paste LaTeX <code>gb4e</code> code. The ingestion engine will automatically tokenize, lemmatize, and initialize
          your interlinear glosses.
        </p>

        {/* Preset Selector */}
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "var(--color-surface, #f8fafc)", borderRadius: "8px", border: "1px solid var(--color-border, #e2e8f0)" }}>
          <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ⚡ Quick-Load Classic Presets
          </strong>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem", cursor: "pointer" }}
                onClick={() => loadPreset(preset)}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Inputs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div>
            <label htmlFor="text-title" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Document Title
            </label>
            <input
              id="text-title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Beowulf: Prologue"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontSize: "0.95rem" }}
            />
          </div>
          <div>
            <label htmlFor="text-slug" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              URL Slug / Text ID
            </label>
            <input
              id="text-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. beowulf-prologue"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontSize: "0.95rem" }}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <label htmlFor="text-author" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Author / Scribe Attribution
            </label>
            <input
              id="text-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Anonymous (Nowell Codex)"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontSize: "0.95rem" }}
            />
          </div>
          <div>
            <label htmlFor="text-source" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Manuscript / Reference Locator
            </label>
            <input
              id="text-source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Cotton MS Vitellius A. xv"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontSize: "0.95rem" }}
            />
          </div>
        </div>

        {/* Input Mode Selector */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "2px solid var(--color-border, #e2e8f0)", marginBottom: "1rem", paddingBottom: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            style={{
              background: "none",
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              color: inputMode === "text" ? "var(--color-primary, #0284c7)" : "inherit",
              borderBottom: inputMode === "text" ? "2px solid var(--color-primary, #0284c7)" : "none",
            }}
          >
            📝 Plain Old English Text &amp; Translations
          </button>
          <button
            type="button"
            onClick={() => setInputMode("gb4e")}
            style={{
              background: "none",
              border: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              padding: "0.25rem 0.5rem",
              color: inputMode === "gb4e" ? "var(--color-primary, #0284c7)" : "inherit",
              borderBottom: inputMode === "gb4e" ? "2px solid var(--color-primary, #0284c7)" : "none",
            }}
          >
            📜 LaTeX gb4e Macros
          </button>
        </div>

        {inputMode === "text" ? (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <label htmlFor="raw-oe" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Old English Text (One sentence/clause per line)
              </label>
              <textarea
                id="raw-oe"
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste Old English sentences here..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontFamily: "serif", fontSize: "1.05rem" }}
              />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="raw-en" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                Modern English Translations (One per line matching above)
              </label>
              <textarea
                id="raw-en"
                rows={5}
                value={rawTranslations}
                onChange={(e) => setRawTranslations(e.target.value)}
                placeholder="Paste matching English translations here..."
                style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontSize: "0.95rem" }}
              />
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="raw-latex" style={{ display: "block", fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              LaTeX gb4e Source Code
            </label>
            <textarea
              id="raw-latex"
              rows={10}
              value={latexSource}
              onChange={(e) => setLatexSource(e.target.value)}
              placeholder={`\\begin{exe}\n\\ex \\gll Hwæt! Wē Gār-Dena... \\\\\n     hear 1PL spear-Dane.GEN.PL ... \\\\\n\\glt "Listen! We have heard..."\n\\end{exe}`}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--color-border, #cbd5e1)", fontFamily: "monospace", fontSize: "0.9rem" }}
            />
          </div>
        )}

        {statusMessage.text && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "6px",
              marginBottom: "1rem",
              background: statusMessage.kind === "success" ? "#dcfce7" : "#fee2e2",
              color: statusMessage.kind === "success" ? "#15803d" : "#b91c1c",
              border: `1px solid ${statusMessage.kind === "success" ? "#86efac" : "#fca5a5"}`,
            }}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Action Button */}
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
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
          <Link href="/" style={{ color: "var(--color-muted, #64748b)", textDecoration: "none" }}>
            Cancel
          </Link>
        </div>
      </section>
    </main>
  );
}
