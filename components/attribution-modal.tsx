"use client";

import { useState } from "react";
import { Copy, Check, X, BookOpen, ShieldCheck, Scroll, Calendar, User } from "lucide-react";

type CitationFormat = "bibtex" | "unified" | "apa" | "chicago";

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  title?: string;
  author?: string;
  source?: string;
}

export function AttributionModal({
  isOpen,
  onClose,
  slug = "ohthere-wulfstan",
  title = "The voyages of Ohthere and Wulfstan",
  author = "Tyler Lemon",
  source = "London, British Library, Cotton MS Tiberius B. i",
}: AttributionModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<CitationFormat | null>(null);
  const [activeTab, setActiveTab] = useState<CitationFormat>("bibtex");

  if (!isOpen) return null;

  const isOhthere = slug === "ohthere-wulfstan" || slug === "ohthere";
  const isBeowulf = slug === "beowulf-prologue";

  const provenanceData = isOhthere
    ? {
        modernEditor: "Tyler Lemon",
        editionDate: "September 30, 2026",
        historicalAuthor: "King Alfred's Court (adaptation of Paulus Orosius)",
        historicalPeriod: "Late 9th Century (ca. 890 CE, West Saxon)",
        manuscriptShelfmark: "London, British Library, Cotton MS Tiberius B. i (ff. 5v–11v)",
        secondaryManuscript: "London, British Library, Additional MS 47967 (Lauderdale / Tollemache MS)",
        linguisticPackage: "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing",
        bibtexKey: "Lemon2026Voyages",
      }
    : isBeowulf
    ? {
        modernEditor: "Glossy Linguistic Engine (after Klaeber / Dobbie)",
        editionDate: "2026",
        historicalAuthor: "Anonymous Anglo-Saxon Poet",
        historicalPeriod: "Late West Saxon (ca. 8th–11th Century)",
        manuscriptShelfmark: "London, British Library, Cotton MS Vitellius A. xv (Nowell Codex, ff. 129r–198v)",
        secondaryManuscript: "Thorkelin Transcripts A and B (1787)",
        linguisticPackage: "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing",
        bibtexKey: "BeowulfPrologue2026",
      }
    : {
        modernEditor: author || "Curated Contributor",
        editionDate: "2026",
        historicalAuthor: "Historical Anglo-Saxon Scribe",
        historicalPeriod: "Old English (ca. 700–1100 CE)",
        manuscriptShelfmark: source || "Historical Manuscript",
        secondaryManuscript: "N/A",
        linguisticPackage: "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing",
        bibtexKey: `${(slug || "text").replace(/[^a-zA-Z0-9]/g, "")}2026`,
      };

  const citations: Record<CitationFormat, string> = {
    bibtex: `@incollection{${provenanceData.bibtexKey},
  author       = {${provenanceData.modernEditor}},
  title        = {{${title}}},
  booktitle    = {Glossy: Digital Scholarly Editions of Old English Interlinear Texts},
  year         = {2026},
  origdate     = {ca. 890},
  note         = {Manuscript witness: ${provenanceData.manuscriptShelfmark}. Interlinear glossing following Leipzig standards with gb4e LaTeX formatting},
  url          = {https://glossy.local/read/${slug}}
}`,
    unified: `${provenanceData.modernEditor}. 2026. ${title}. In Glossy: Digital Scholarly Editions of Old English Interlinear Texts. London: British Library witness (${provenanceData.manuscriptShelfmark}). Leipzig interlinear glossing in gb4e.`,
    apa: `${provenanceData.modernEditor}. (2026). ${title} [Digital interlinear edition]. Glossy Old English Corpus. ${provenanceData.manuscriptShelfmark}.`,
    chicago: `${provenanceData.modernEditor}, ed. 2026. "${title}." Glossy: Digital Scholarly Editions of Old English Interlinear Texts. Manuscript: ${provenanceData.manuscriptShelfmark}.`,
  };

  const copyToClipboard = async (format: CitationFormat) => {
    try {
      await navigator.clipboard.writeText(citations[format]);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="attribution-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(28, 25, 23, 0.65)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          borderRadius: "0.6rem",
          maxWidth: "44rem",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 1.5rem 3rem rgba(0, 0, 0, 0.25)",
          padding: "1.75rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1rem", borderBottom: "1px solid var(--rule)", marginBottom: "1.25rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scroll style={{ width: "1.2rem", height: "1.2rem", color: "var(--accent)" }} />
              <h2 id="attribution-title" style={{ margin: 0, fontSize: "1.3rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
                Scholarly Attribution &amp; Citation
              </h2>
            </div>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)" }}>
              Provenance, manuscript shelfmarks, and academic citation formats for <em>{title}</em>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close attribution dialog"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted-ink)",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "0.25rem",
            }}
          >
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* Provenance Metadata Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", background: "#fbf7ee", padding: "1rem", borderRadius: "0.4rem", border: "1px solid #dfcfb8" }}>
          <div>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <User style={{ width: "0.75rem", height: "0.75rem" }} /> Modern Linguistic Editor
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
              {provenanceData.modernEditor} ({provenanceData.editionDate})
            </p>
          </div>

          <div>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <Calendar style={{ width: "0.75rem", height: "0.75rem" }} /> Historical Date &amp; Dialect
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
              {provenanceData.historicalPeriod}
            </p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} /> Primary Manuscript Shelfmark
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--ink)" }}>
              {provenanceData.manuscriptShelfmark}
            </p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <ShieldCheck style={{ width: "0.75rem", height: "0.75rem" }} /> Standards &amp; Inspiration
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
              Interlinear formatting follows the <em>Leipzig Glossing Rules</em> with LaTeX <code>gb4e</code> alignment. Canonical lemmas referenced to <em>Bosworth-Toller</em> and <em>Wiktionary</em>. Digital visual gloss design inspired by Peter S. Baker&apos;s <em>Old English Aerobics</em> (oldenglishaerobics.net).
            </p>
          </div>
        </div>

        {/* Tabbed Citation Formats */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, color: "var(--accent)" }}>
              Cite This Edition
            </span>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["bibtex", "unified", "apa", "chicago"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "0.2rem 0.55rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.72rem",
                    fontWeight: activeTab === tab ? 700 : 500,
                    background: activeTab === tab ? "var(--accent)" : "#fbf7ee",
                    color: activeTab === tab ? "#ffffff" : "var(--ink)",
                    border: "1px solid var(--rule)",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ position: "relative", background: "#1c1917", color: "#fafaf9", borderRadius: "0.4rem", padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.82rem", border: "1px solid #332d29" }}>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}>
              {citations[activeTab]}
            </pre>
            <button
              type="button"
              onClick={() => copyToClipboard(activeTab)}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                background: copiedFormat === activeTab ? "#15803d" : "#44403c",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.25rem",
                padding: "0.35rem 0.65rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
            >
              {copiedFormat === activeTab ? (
                <>
                  <Check style={{ width: "0.8rem", height: "0.8rem" }} /> Copied!
                </>
              ) : (
                <>
                  <Copy style={{ width: "0.8rem", height: "0.8rem" }} /> Copy {activeTab.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.45rem 1.1rem",
              background: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "0.35rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
