"use client";

import { useState } from "react";
import { Copy, Check, X, BookOpen, ShieldCheck, Scroll, Calendar, User } from "lucide-react";
import { tinaField } from "tinacms/dist/react";
import { getBuiltInMetadata } from "../lib/corpus-registry";
import initialAttributionData from "../content/pages/attribution.json";

export type CitationFormat = "bibtex" | "unified" | "apa" | "chicago";

export type AttributionConfig = {
  pageId?: string;
  title?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  platformCreator?: string;
  platformCreatorUrl?: string;
  defaultEditor?: string;
  defaultEditorUrl?: string;
  editionDate?: string;
  booktitle?: string;
  attributionLinguisticPackage?: string;
  attributionStandardsTitle?: string;
  attributionStandardsStatement?: string;
  bibtexCitationTemplate?: string;
  unifiedLsaCitationTemplate?: string;
  apaCitationTemplate?: string;
  chicagoCitationTemplate?: string;
  [key: string]: unknown;
};

export function interpolateCitation(template: string, vars: Record<string, string>): string {
  if (!template) return "";
  return template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => vars[key] ?? "");
}

export interface AttributionCardProps {
  slug?: string;
  title?: string;
  author?: string;
  source?: string;
  config?: AttributionConfig;
  content?: AttributionConfig;
  onDone?: () => void;
  showCloseButton?: boolean;
}

export function AttributionCard({
  slug = "ohthere",
  title = "The voyages of Ohthere and Wulfstan",
  author = "Tyler Lemon",
  source = "London, British Library, Additional MS 47967, ff. 5v–6r",
  config,
  content,
  onDone,
  showCloseButton = false,
}: AttributionCardProps) {
  const activeConfig = content || config || initialAttributionData;
  const [copiedFormat, setCopiedFormat] = useState<CitationFormat | null>(null);
  const [activeTab, setActiveTab] = useState<CitationFormat>("bibtex");

  const builtIn = getBuiltInMetadata(slug);
  const isBuiltIn = Boolean(builtIn);

  const activePlatformCreator = activeConfig.platformCreator || initialAttributionData.platformCreator || "Ariel Anders";
  const activePlatformCreatorUrl = activeConfig.platformCreatorUrl || initialAttributionData.platformCreatorUrl || "https://boomtick.blog/services";
  const activeDefaultEditor = builtIn?.editor || activeConfig.defaultEditor || initialAttributionData.defaultEditor || "Tyler Lemon";
  const activeDefaultEditorUrl = activeConfig.defaultEditorUrl || initialAttributionData.defaultEditorUrl || "https://sites.google.com/view/tyler-lemon";
  const activeEditionDate = activeConfig.editionDate || initialAttributionData.editionDate || "2026";
  const activeBooktitle = activeConfig.booktitle || initialAttributionData.booktitle || "Glossy: Digital Scholarly Editions of Old English Interlinear Texts";
  const activeLinguisticPackage =
    activeConfig.attributionLinguisticPackage ||
    initialAttributionData.attributionLinguisticPackage ||
    "LaTeX gb4e with Leipzig Three-Tier Interlinear Glossing";
  const activeStandardsTitle =
    activeConfig.attributionStandardsTitle ||
    initialAttributionData.attributionStandardsTitle ||
    "Collaborative Development & Standards";
  const activeStandardsStatement =
    activeConfig.attributionStandardsStatement ||
    initialAttributionData.attributionStandardsStatement ||
    `Developed through the collaborative partnership of ${activePlatformCreator} (software architecture, digital platform, and automated verification suite) and ${activeDefaultEditor} (linguistic subject matter expertise, Old English glossing, and grammatical accuracy). Interlinear formatting conforms to the international Leipzig Glossing Rules with LaTeX gb4e alignment, canonical lemmatization referenced to Bosworth-Toller and Wiktionary, and visual gloss layout inspired by Peter S. Baker's Old English Aerobics (oldenglishaerobics.net).`;

  const provenanceData = builtIn
    ? {
        platformCreator: activePlatformCreator,
        subjectMatterExpert: activeDefaultEditor,
        modernEditor: `${activePlatformCreator} and ${activeDefaultEditor}`,
        editionDate: activeEditionDate,
        historicalAuthor: builtIn.author,
        historicalPeriod: builtIn.origDate || "c. 890–900 AD",
        manuscriptShelfmark: builtIn.witness || builtIn.source,
        secondaryManuscript: "Tollemache / Cotton transcripts",
        linguisticPackage: activeLinguisticPackage,
        bibtexKey: `AndersLemon${activeEditionDate}${slug.replace(/[^a-zA-Z0-9]/g, "")}`,
      }
    : {
        platformCreator: activePlatformCreator,
        subjectMatterExpert: author || "Custom Editor",
        modernEditor: author || "Local Editor",
        editionDate: activeEditionDate,
        historicalAuthor: author || "Unknown",
        historicalPeriod: "Old English",
        manuscriptShelfmark: source || "Local Draft / Custom Source",
        secondaryManuscript: "N/A",
        linguisticPackage: activeLinguisticPackage,
        bibtexKey: `GlossyDraft${activeEditionDate}${(slug || "text").replace(/[^a-zA-Z0-9]/g, "")}`,
      };

  const creatorSurname = activePlatformCreator.split(" ").slice(-1)[0];
  const creatorGiven = activePlatformCreator.split(" ").slice(0, -1).join(" ") || activePlatformCreator;
  const editorSurname = activeDefaultEditor.split(" ").slice(-1)[0];
  const editorGiven = activeDefaultEditor.split(" ").slice(0, -1).join(" ") || activeDefaultEditor;

  const bibtexAuthor = isBuiltIn
    ? `${creatorSurname}, ${creatorGiven} and ${editorSurname}, ${editorGiven}`
    : author || activePlatformCreator;

  const unifiedAuthor = isBuiltIn
    ? `${creatorSurname}, ${creatorGiven} & ${activeDefaultEditor}`
    : author || "Anonymous";

  const apaAuthor = isBuiltIn
    ? `${creatorSurname}, ${creatorGiven.charAt(0)}., & ${editorSurname}, ${editorGiven.charAt(0)}.`
    : author || "Anonymous";

  const chicagoAuthor = isBuiltIn
    ? `${creatorSurname}, ${creatorGiven}, and ${activeDefaultEditor}`
    : author || "Anonymous";

  const baseVars = {
    bibtexKey: provenanceData.bibtexKey,
    title,
    booktitle: activeBooktitle,
    year: activeEditionDate,
    platformCreator: activePlatformCreator,
    defaultEditor: activeDefaultEditor,
    editorNote: isBuiltIn
      ? `linguistic glossing and annotation by ${activeDefaultEditor}`
      : `source: ${provenanceData.manuscriptShelfmark}`,
    url: `https://glossed.pages.dev/read/${slug}`,
    source: provenanceData.manuscriptShelfmark,
    linguisticPackage: activeLinguisticPackage,
  };

  const bibtexTemplate =
    activeConfig.bibtexCitationTemplate ||
    initialAttributionData.bibtexCitationTemplate ||
    "";
  const unifiedTemplate =
    activeConfig.unifiedLsaCitationTemplate ||
    initialAttributionData.unifiedLsaCitationTemplate ||
    "";
  const apaTemplate =
    activeConfig.apaCitationTemplate ||
    initialAttributionData.apaCitationTemplate ||
    "";
  const chicagoTemplate =
    activeConfig.chicagoCitationTemplate ||
    initialAttributionData.chicagoCitationTemplate ||
    "";

  const citations: Record<CitationFormat, string> = {
    bibtex: interpolateCitation(bibtexTemplate, { ...baseVars, author: bibtexAuthor }),
    unified: interpolateCitation(unifiedTemplate, { ...baseVars, author: unifiedAuthor }),
    apa: interpolateCitation(apaTemplate, { ...baseVars, author: apaAuthor }),
    chicago: interpolateCitation(chicagoTemplate, { ...baseVars, author: chicagoAuthor }),
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
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "1rem", borderBottom: "1px solid var(--rule)", marginBottom: "1.25rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Scroll style={{ width: "1.2rem", height: "1.2rem", color: "var(--accent)" }} />
            <h2
              id="attribution-title"
              data-tina-field={tinaField(activeConfig, "heading")}
              style={{ margin: 0, fontSize: "1.3rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}
            >
              {activeConfig.heading || "Scholarly Attribution & Citation"}
            </h2>
          </div>
          <p
            data-tina-field={tinaField(activeConfig, "description")}
            style={{ margin: "0.25rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)" }}
          >
            {activeConfig.description ? (
              <span>{activeConfig.description} (<em>{title}</em>)</span>
            ) : (
              <span>Provenance, manuscript shelfmarks, and academic citation formats for <em>{title}</em></span>
            )}
          </p>
        </div>
        {showCloseButton && onDone && (
          <button
            type="button"
            onClick={onDone}
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
        )}
      </div>

      {/* Provenance Metadata Grid (Tiles) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem", background: "#fbf7ee", padding: "1rem", borderRadius: "0.4rem", border: "1px solid #dfcfb8" }}>
        {/* Tile 1: Digital Platform Creator */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <User style={{ width: "0.75rem", height: "0.75rem" }} /> Digital Platform Creator
          </span>
          <p
            data-tina-field={tinaField(activeConfig, "platformCreator")}
            style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
          >
            {activePlatformCreatorUrl ? (
              <a
                href={activePlatformCreatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {activePlatformCreator}
              </a>
            ) : (
              activePlatformCreator
            )}
          </p>
        </div>

        {/* Tile 2: Linguistic Subject Matter Expert */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <User style={{ width: "0.75rem", height: "0.75rem" }} /> Linguistic Subject Matter Expert
          </span>
          <p
            data-tina-field={tinaField(activeConfig, "defaultEditor")}
            style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
          >
            {isBuiltIn ? (
              activeDefaultEditorUrl ? (
                <a
                  href={activeDefaultEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "underline" }}
                >
                  {activeDefaultEditor}
                </a>
              ) : (
                activeDefaultEditor
              )
            ) : (
              author || "User Contribution"
            )}
          </p>
        </div>

        {/* Tile 3: Historical Date & Dialect */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <Calendar style={{ width: "0.75rem", height: "0.75rem" }} /> Historical Date &amp; Dialect
          </span>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
            {provenanceData.historicalPeriod}
          </p>
        </div>

        {/* Tile 4: Primary Manuscript Shelfmark */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} /> Primary Manuscript Shelfmark
          </span>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--ink)" }}>
            {provenanceData.manuscriptShelfmark}
          </p>
        </div>

        {/* Tile 5: Collaborative Development & Standards */}
        <div style={{ gridColumn: "1 / -1" }}>
          <span
            data-tina-field={tinaField(activeConfig, "attributionStandardsTitle")}
            style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}
          >
            <ShieldCheck style={{ width: "0.75rem", height: "0.75rem" }} /> {activeStandardsTitle}
          </span>
          <p
            data-tina-field={tinaField(activeConfig, "attributionStandardsStatement")}
            style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}
          >
            {activeStandardsStatement}
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
          <pre
            data-tina-field={
              activeTab === "bibtex" ? tinaField(activeConfig, "bibtexCitationTemplate") :
              activeTab === "unified" ? tinaField(activeConfig, "unifiedLsaCitationTemplate") :
              activeTab === "apa" ? tinaField(activeConfig, "apaCitationTemplate") :
              tinaField(activeConfig, "chicagoCitationTemplate")
            }
            style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5 }}
          >
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
      {onDone && (
        <div style={{ marginTop: "1.25rem", paddingTop: "0.75rem", borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onDone}
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
      )}
    </div>
  );
}

export interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug?: string;
  title?: string;
  author?: string;
  source?: string;
  config?: AttributionConfig;
  content?: AttributionConfig;
}

export function AttributionModal({
  isOpen,
  onClose,
  slug = "ohthere",
  title = "The voyages of Ohthere and Wulfstan",
  author = "Tyler Lemon",
  source = "London, British Library, Additional MS 47967, ff. 5v–6r",
  config,
  content,
}: AttributionModalProps) {
  if (!isOpen) return null;
  const resolvedConfig = content || config;

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
      <AttributionCard
        slug={slug}
        title={title}
        author={author}
        source={source}
        config={resolvedConfig}
        onDone={onClose}
        showCloseButton={true}
      />
    </div>
  );
}

