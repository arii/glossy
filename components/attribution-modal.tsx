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
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  sourceEdition?: string;
  source?: string;
  config?: AttributionConfig;
  content?: AttributionConfig;
  onDone?: () => void;
  showCloseButton?: boolean;
  hideHeader?: boolean;
  asCard?: boolean;
}

export function AttributionCard({
  slug = "ohthere",
  title = "The voyages of Ohthere and Wulfstan",
  author,
  editor,
  shelfmark,
  dialect,
  historicalDate,
  sourceEdition,
  source,
  config,
  content,
  onDone,
  showCloseButton = false,
  hideHeader = false,
  asCard = true,
}: AttributionCardProps) {
  const activeConfig = content || config || initialAttributionData;
  const [copiedFormat, setCopiedFormat] = useState<CitationFormat | null>(null);
  const [activeTab, setActiveTab] = useState<CitationFormat>("bibtex");

  const builtIn = getBuiltInMetadata(slug);

  const activePlatformCreator = activeConfig.platformCreator || initialAttributionData.platformCreator || "Ariel Anders";
  const activePlatformCreatorUrl = activeConfig.platformCreatorUrl || initialAttributionData.platformCreatorUrl || "https://boomtick.blog/services";

  const activeEditor = editor || builtIn?.editor || activeConfig.defaultEditor || initialAttributionData.defaultEditor || "Tyler Lemon";
  const activeDefaultEditorUrl = activeConfig.defaultEditorUrl || initialAttributionData.defaultEditorUrl || "https://sites.google.com/view/tyler-lemon";

  const activeAuthor = author || builtIn?.author || "Anonymous";
  const activeShelfmark = shelfmark || builtIn?.shelfmark || builtIn?.witness || source || builtIn?.source || "BL Cotton MS Tiberius B i, fol. 11r–15v";
  const activeDialect = dialect || builtIn?.dialect || "Early West Saxon";
  const activeHistoricalDate = historicalDate || builtIn?.historicalDate || builtIn?.origDate || "c. 890–900 AD";
  const activeSourceEdition = sourceEdition || builtIn?.sourceEdition || "Old English Orosius (ed. Bately 1980 / Sweet)";

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
    "Interlinear formatting conforms to international Leipzig Glossing Rules with LaTeX gb4e alignment, canonical lemmatization referenced to Bosworth-Toller and Wiktionary, and visual gloss layout inspired by Peter S. Baker's Old English Aerobics (oldenglishaerobics.net).";

  const bibtexKey = `Glossy${activeEditionDate}${slug.replace(/[^a-zA-Z0-9]/g, "")}`;

  const creatorSurname = activePlatformCreator.split(" ").slice(-1)[0];
  const creatorGiven = activePlatformCreator.split(" ").slice(0, -1).join(" ") || activePlatformCreator;
  const editorSurname = activeEditor.split(" ").slice(-1)[0];
  const editorGiven = activeEditor.split(" ").slice(0, -1).join(" ") || activeEditor;

  const bibtexAuthor = `${creatorSurname}, ${creatorGiven} and ${editorSurname}, ${editorGiven}`;
  const unifiedAuthor = `${creatorSurname}, ${creatorGiven} & ${activeEditor}`;
  const apaAuthor = `${creatorSurname}, ${creatorGiven.charAt(0)}., & ${editorSurname}, ${editorGiven.charAt(0)}.`;
  const chicagoAuthor = `${creatorSurname}, ${creatorGiven}, and ${activeEditor}`;

  const baseVars = {
    bibtexKey,
    title,
    booktitle: activeBooktitle,
    year: activeEditionDate,
    platformCreator: activePlatformCreator,
    defaultEditor: activeEditor,
    editorNote: `linguistic glossing and annotation by ${activeEditor}; critical edition: ${activeSourceEdition}`,
    url: `https://glossed.pages.dev/read/${slug}`,
    source: `${activeShelfmark} (${activeSourceEdition})`,
    shelfmark: activeShelfmark,
    sourceEdition: activeSourceEdition,
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
      style={
        asCard
          ? {
              background: "var(--surface)",
              borderRadius: "0.5rem",
              border: "1px solid var(--rule)",
              boxShadow: "0 0.5rem 2rem rgba(64, 47, 29, 0.08)",
              maxWidth: "44rem",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.75rem 2rem",
              boxSizing: "border-box",
            }
          : {
              width: "100%",
              boxSizing: "border-box",
            }
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      {!hideHeader && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--rule)",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Scroll style={{ width: "1.25rem", height: "1.25rem", color: "var(--accent)" }} />
              <h2
                id="attribution-title"
                data-tina-field={tinaField(activeConfig, "heading")}
                style={{
                  fontFamily: "'Charis SIL', Georgia, serif",
                  fontSize: "1.35rem",
                  fontWeight: 600,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {activeConfig.heading || "Scholarly Attribution & Citation"}
              </h2>
            </div>
            <p
              data-tina-field={tinaField(activeConfig, "description")}
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: "0.82rem",
                color: "var(--muted-ink)",
                lineHeight: 1.5,
                marginTop: "0.35rem",
                marginBottom: 0,
              }}
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
      )}

      {/* Provenance Metadata Grid (Tiles) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
          background: "#fbf7ee",
          padding: "1rem",
          borderRadius: "0.4rem",
          border: "1px solid #dfcfb8",
        }}
      >
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
            <User style={{ width: "0.75rem", height: "0.75rem" }} /> Linguistic Subject Matter Expert &amp; Editor
          </span>
          <p
            data-tina-field={tinaField(activeConfig, "defaultEditor")}
            style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}
          >
            {activeDefaultEditorUrl && activeEditor === activeConfig.defaultEditor ? (
              <a
                href={activeDefaultEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                {activeEditor}
              </a>
            ) : (
              activeEditor
            )}
          </p>
          {activeAuthor && activeAuthor !== activeEditor && (
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--muted-ink)" }}>
              Author: {activeAuthor}
            </p>
          )}
        </div>

        {/* Tile 3: Historical Date & Dialect */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <Calendar style={{ width: "0.75rem", height: "0.75rem" }} /> Historical Date &amp; Dialect
          </span>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.88rem", fontWeight: 600, color: "var(--ink)" }}>
            {activeHistoricalDate}{activeDialect ? ` (${activeDialect})` : ""}
          </p>
        </div>

        {/* Tile 4: Primary Manuscript Shelfmark */}
        <div>
          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--accent)", fontWeight: 700 }}>
            <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} /> Primary Manuscript Shelfmark
          </span>
          <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "var(--ink)" }}>
            {activeShelfmark}
          </p>
          {activeSourceEdition && (
            <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "var(--muted-ink)" }}>
              Edition: {activeSourceEdition}
            </p>
          )}
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--ink)",
            }}
          >
            Cite This Edition
          </span>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem",
              background: "#f0ebe1",
              borderRadius: "0.375rem",
              border: "1px solid var(--rule)",
            }}
          >
            {(["bibtex", "unified", "apa", "chicago"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.25rem 0.65rem",
                  borderRadius: "0.25rem",
                  fontSize: "0.72rem",
                  fontFamily: "monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.15s ease, color 0.15s ease",
                  border: activeTab === tab ? "1px solid var(--rule)" : "1px solid transparent",
                  background: activeTab === tab ? "var(--surface)" : "transparent",
                  color: activeTab === tab ? "var(--ink)" : "var(--muted-ink)",
                  boxShadow: activeTab === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                }}
              >
                {tab === "unified" ? "UNIFIED (LSA)" : tab}
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
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  sourceEdition?: string;
  source?: string;
  config?: AttributionConfig;
  content?: AttributionConfig;
}

export function AttributionModal({
  isOpen,
  onClose,
  slug = "ohthere",
  title = "The voyages of Ohthere and Wulfstan",
  author,
  editor,
  shelfmark,
  dialect,
  historicalDate,
  sourceEdition,
  source,
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
        editor={editor}
        shelfmark={shelfmark}
        dialect={dialect}
        historicalDate={historicalDate}
        sourceEdition={sourceEdition}
        source={source}
        config={resolvedConfig}
        onDone={onClose}
        showCloseButton={true}
      />
    </div>
  );
}

