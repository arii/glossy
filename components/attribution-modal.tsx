"use client";

import { useState } from "react";
import { Copy, Check, X, BookOpen, ShieldCheck, Scroll, Calendar, User } from "lucide-react";
import { getBuiltInMetadata } from "../lib/corpus-registry";

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
  slug = "ohthere",
  title = "The voyages of Ohthere and Wulfstan",
  author = "Tyler Lemon",
  source = "London, British Library, Additional MS 47967, ff. 5v–6r",
}: AttributionModalProps) {
  const [copiedFormat, setCopiedFormat] = useState<CitationFormat | null>(null);
  const [activeTab, setActiveTab] = useState<CitationFormat>("bibtex");

  if (!isOpen) return null;

  const builtIn = getBuiltInMetadata(slug);
  const isBuiltIn = Boolean(builtIn);

  const provenanceData = builtIn
    ? {
        platformCreator: "Ariel Anders",
        subjectMatterExpert: builtIn.editor || "Tyler Lemon",
        modernEditor: `Ariel Anders and ${builtIn.editor || "Tyler Lemon"}`,
        editionDate: "2026",
        historicalAuthor: builtIn.author,
        historicalPeriod: builtIn.origDate || "Old English",
        manuscriptShelfmark: builtIn.witness || builtIn.source,
        secondaryManuscript: "Tollemache / Cotton transcripts",
        linguisticPackage: "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing",
        bibtexKey: `AndersLemon2026${slug.replace(/[^a-zA-Z0-9]/g, "")}`,
      }
    : {
        platformCreator: "Ariel Anders",
        subjectMatterExpert: author || "Custom Editor",
        modernEditor: author || "Local Editor",
        editionDate: "2026",
        historicalAuthor: author || "Unknown",
        historicalPeriod: "Old English",
        manuscriptShelfmark: source || "Local Draft / Custom Source",
        secondaryManuscript: "N/A",
        linguisticPackage: "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing",
        bibtexKey: `GlossyDraft2026${(slug || "text").replace(/[^a-zA-Z0-9]/g, "")}`,
      };

  const bibtexAuthor = isBuiltIn
    ? "Anders, Ariel and Lemon, Tyler"
    : author
    ? author
    : "Anders, Ariel";

  const citations: Record<CitationFormat, string> = {
    bibtex: `@incollection{${provenanceData.bibtexKey},
  author       = {${bibtexAuthor}},
  title        = {{${title}}},
  booktitle    = {Glossy: Digital Scholarly Editions of Old English Interlinear Texts},
  year         = {2026},
  ${builtIn?.origDate ? `origdate     = {${builtIn.origDate}},` : ""}
  note         = {Digital platform created by Ariel Anders; ${isBuiltIn ? "linguistic glossing and annotation by Tyler Lemon" : `source: ${provenanceData.manuscriptShelfmark}`}. Interlinear glossing following Leipzig standards with gb4e LaTeX formatting},
  url          = {https://glossed.pages.dev/read/${slug}}
}`,
    unified: `${isBuiltIn ? "Anders, Ariel & Tyler Lemon" : (author || "Anonymous")}. 2026. ${title}. In Glossy: Digital Scholarly Editions of Old English Interlinear Texts. Digital platform created by Ariel Anders. Source/Witness: ${provenanceData.manuscriptShelfmark}. Leipzig interlinear glossing in gb4e.`,
    apa: `${isBuiltIn ? "Anders, A., & Lemon, T." : (author || "Anonymous")}. (2026). ${title} [Digital interlinear edition]. Glossy Old English Corpus. Platform created by Ariel Anders. ${provenanceData.manuscriptShelfmark}.`,
    chicago: `${isBuiltIn ? "Anders, Ariel, and Tyler Lemon, eds." : `${author || "Anonymous"}, ed.`} 2026. "${title}." Glossy: Digital Scholarly Editions of Old English Interlinear Texts. Platform created by Ariel Anders. Source: ${provenanceData.manuscriptShelfmark}.`,
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
              <User style={{ width: "0.75rem", height: "0.75rem" }} /> Digital Platform Creator
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
              <a
                href="https://boomtick.blog/services"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                Ariel Anders
              </a>
            </p>
          </div>

          <div>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <User style={{ width: "0.75rem", height: "0.75rem" }} /> Linguistic Subject Matter Expert
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
              {isBuiltIn ? (
                <a
                  href="https://sites.google.com/view/tyler-lemon"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  Tyler Lemon
                </a>
              ) : (
                author || "User Contribution"
              )}
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

          <div>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} /> Primary Manuscript Shelfmark
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--ink)" }}>
              {provenanceData.manuscriptShelfmark}
            </p>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
              <ShieldCheck style={{ width: "0.75rem", height: "0.75rem" }} /> Collaborative Development &amp; Standards
            </span>
            <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
              Developed through the collaborative partnership of <strong>Ariel Anders</strong> (software architecture, digital platform, and automated verification suite) and <strong>Tyler Lemon</strong> (linguistic subject matter expertise, Old English glossing, and grammatical accuracy). Interlinear formatting conforms to the international <em>Leipzig Glossing Rules</em> with LaTeX <code>gb4e</code> alignment, canonical lemmatization referenced to <em>Bosworth-Toller</em> and <em>Wiktionary</em>, and visual gloss layout inspired by Peter S. Baker&apos;s <em>Old English Aerobics</em> (oldenglishaerobics.net).
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
