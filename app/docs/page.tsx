"use client";

import { useState } from "react";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import {
  BookOpen,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Terminal,
} from "lucide-react";
import docsData from "../../content/docs/architecture-faq.json";
import { DocSectionItem } from "../../lib/types";
import { useTina, tinaField } from "tinacms/dist/react";

const DOCS_PAGE_QUERY = `
  query DocsPageQuery($relativePath: String!) {
    docs(relativePath: $relativePath) {
      title
      eyebrow
      description
      canonicalRuleTitle
      canonicalRuleDescription
      architectureSpecTitle
      architectureSpecDescription
      l1Intro
      l1TierHeaderTitle
      l1TierHeaderBadge
      l1TierTokens
      l1TierGlosses
      l1TierTranslation
      l2Paragraph1
      l2Paragraph2
      l2CalloutTitle
      l2CalloutBody
      l3Intro
      l4WiktionaryTitle
      l4WiktionarySubtitle
      l4WiktionaryIntro
      l4IpaTitle
      l4IpaSubtitle
      l4IpaIntro
      a1Intro
      a2Intro
      a3Intro
      sections {
        id
        domain
        domainNum
        num
        eyebrow
        title
      }
      abbreviations {
        abbr
        name
        desc
        category
      }
      numeralCards {
        badge
        title
        description
        isFullWidth
      }
      verificationTools {
        name
        command
        target
      }
      ingestionSteps {
        num
        title
        description
      }
      wiktionaryGuidelines {
        title
        description
      }
      ipaSpecifications {
        title
        description
      }
      storageTiers {
        tier
        timing
        title
        description
      }
    }
  }
`;

interface Abbreviation {
  abbr: string;
  name: string;
  desc: string;
  category: "Person & Number" | "Case" | "Gender & Mood" | "Part of Speech" | "Affixes & Morphemes";
}

const INITIAL_DOCS_DATA = { docs: docsData };
const DOCS_PAGE_VARS = { relativePath: "architecture-faq.json" };

export default function DocsPage() {
  const { data: pageData } = useTina({
    query: DOCS_PAGE_QUERY,
    variables: DOCS_PAGE_VARS,
    data: INITIAL_DOCS_DATA,
  });

  const docs = pageData?.docs || docsData;

  const [abbrOpen, setAbbrOpen] = useState(true);
  const [abbrQuery, setAbbrQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [wiktionaryOpen, setWiktionaryOpen] = useState(true);
  const [ipaOpen, setIpaOpen] = useState(true);

  const abbreviations: Abbreviation[] = (docs.abbreviations as Abbreviation[]) || (docsData.abbreviations as Abbreviation[]);
  const sections: DocSectionItem[] = (docs.sections as DocSectionItem[]) || (docsData.sections as DocSectionItem[]);

  const linguisticsSections = sections.filter((s) => s.domain === "linguistics");
  const architectureSections = sections.filter((s) => s.domain === "architecture");

  const secL1 = sections.find((s) => s.id === "section-l1");
  const secL2 = sections.find((s) => s.id === "section-l2");
  const secL3 = sections.find((s) => s.id === "section-l3");
  const secL4 = sections.find((s) => s.id === "section-l4");
  const secA1 = sections.find((s) => s.id === "section-a1");
  const secA2 = sections.find((s) => s.id === "section-a2");
  const secA3 = sections.find((s) => s.id === "section-a3");

  const filteredAbbrs = abbreviations.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchText =
      item.abbr.toLowerCase().includes(abbrQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(abbrQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(abbrQuery.toLowerCase());
    return matchCat && matchText;
  });

  const categories = ["All", "Person & Number", "Case", "Gender & Mood", "Part of Speech", "Affixes & Morphemes"];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const pageEyebrow = docs.eyebrow || "Linguistic Standards & System Architecture";
  const pageTitle = docs.title || "Documentation & Reference Guides";

  const allSections = [...linguisticsSections, ...architectureSections];

  return (
    <>
      <SiteNav current="docs" slug="ohthere-wulfstan" />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow" data-tina-field={tinaField(docs, "eyebrow")}>{pageEyebrow}</p>
          <h1 className="docs-title" data-tina-field={tinaField(docs, "title")}>{pageTitle}</h1>
        </header>

        {/* Mobile Collapsible TOC (Visible only on mobile screens <= 48rem) */}
        <div className="docs-mobile-toc">
          <details style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: "0.5rem", padding: "0.75rem 1rem", marginBottom: "1.5rem" }}>
            <summary style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Layers style={{ width: "0.95rem", height: "0.95rem" }} /> Table of Contents ({allSections.length} Sections)
            </summary>
            <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {allSections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: "0.35rem 0.5rem",
                    fontSize: "0.82rem",
                    color: "var(--ink)",
                    cursor: "pointer",
                    borderRadius: "0.25rem",
                  }}
                >
                  <span className={`docs-nav-num ${sec.id.startsWith("section-a") ? "arch" : ""}`}>
                    {sec.domainNum || sec.num}
                  </span>
                  <span>{sec.title}</span>
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Two-Column Grid: Sticky TOC on Left, Content on Right */}
        <div className="docs-grid">
          {/* Sticky Sidebar */}
          <aside className="docs-sidebar">
            <div className="docs-card">
              <div className="docs-card-header">
                <div className="docs-card-title">
                  <Layers style={{ width: "1rem", height: "1rem" }} />
                  <span>Table of Contents</span>
                </div>
              </div>

              {/* Grouped TOC Navigation */}
              <nav className="docs-nav-list">
                <div className="docs-toc-group">
                  <div className="docs-toc-group-header">
                    <span>Linguistics &amp; Editorial</span>
                    <span>{linguisticsSections.length} Items</span>
                  </div>
                  {linguisticsSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className="docs-nav-item"
                    >
                      <span className="docs-nav-num">{sec.domainNum || sec.num}</span>
                      <span>{sec.title}</span>
                    </button>
                  ))}
                </div>

                <div className="docs-toc-group">
                  <div className="docs-toc-group-header">
                    <span>System Architecture</span>
                    <span>{architectureSections.length} Items</span>
                  </div>
                  {architectureSections.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => scrollToSection(sec.id)}
                      className="docs-nav-item"
                    >
                      <span className="docs-nav-num arch">{sec.domainNum || sec.num}</span>
                      <span>{sec.title}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content Sections */}
          <div className="docs-content">
            {/* ============================================================== */}
            {/* LINGUISTICS DOMAIN SECTIONS                                    */}
            {/* ============================================================== */}
                {/* Section L1: Interlinear Glossing */}
                <section id="section-l1" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge">{secL1?.domainNum || "L1"}</span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secL1 ? tinaField(secL1, "eyebrow") : undefined}>
                        {secL1?.eyebrow || "Beginner's Primer"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secL1 ? tinaField(secL1, "title") : undefined}>
                        {secL1?.title || "How Interlinear Glossing Works"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "l1Intro")}>
                      {docs.l1Intro || "An interlinear gloss is a standard linguistic format that presents original historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly underneath:"}
                    </p>

                    {/* 3-Tier Code Block */}
                    <div className="docs-code-tier">
                      <div className="docs-tier-header">
                        <span data-tina-field={tinaField(docs, "l1TierHeaderTitle")}>
                          {docs.l1TierHeaderTitle || "Three-Tier Interlinear Structure"}
                        </span>
                        <span data-tina-field={tinaField(docs, "l1TierHeaderBadge")}>
                          {docs.l1TierHeaderBadge || "Leipzig Glossing Rules"}
                        </span>
                      </div>
                      <div className="docs-tier-grid" data-tina-field={tinaField(docs, "l1TierTokens")}>
                        {(docs.l1TierTokens || "Ōhthere | sǣ-d-e | his hlāford-e").split("|").map((token, i) => (
                          <div key={i}>{token.trim()}</div>
                        ))}
                      </div>
                      <div className="docs-tier-glosses" data-tina-field={tinaField(docs, "l1TierGlosses")}>
                        {(docs.l1TierGlosses || "Ohthere | say-PST-IND.3SG | his.GEN lord-DAT.SG").split("|").map((gloss, i) => (
                          <div key={i} style={{ color: i === 0 ? "#a8a29e" : "#fde68a" }}>
                            {gloss.trim()}
                          </div>
                        ))}
                      </div>
                      <div className="docs-tier-trans" data-tina-field={tinaField(docs, "l1TierTranslation")}>
                        {docs.l1TierTranslation || "“Ohthere said to his lord, King Alfred...”"}
                      </div>
                    </div>

                    {/* 37 Abbreviations Reference */}
                    <div style={{ marginTop: "1.5rem" }}>
                      <button
                        type="button"
                        onClick={() => setAbbrOpen(!abbrOpen)}
                        className="docs-accordion-btn"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <BookOpen style={{ width: "1.1rem", height: "1.1rem", color: "var(--accent)" }} />
                          <div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              Complete Reference: 42 Glossing Abbreviations
                            </h3>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                              Defined in Section 2 of <code>references/Voyages_of_Ohthere_Wulfstan.tex</code>
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              color: "var(--accent)",
                              background: "#f3eadb",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "0.25rem",
                            }}
                          >
                            {filteredAbbrs.length} tags
                          </span>
                          {abbrOpen ? (
                            <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                          ) : (
                            <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                          )}
                        </div>
                      </button>

                      {abbrOpen && (
                        <div
                          style={{
                            border: "1px solid var(--rule)",
                            borderTop: "none",
                            borderRadius: "0 0 0.35rem 0.35rem",
                            padding: "1rem",
                            background: "var(--surface)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.75rem",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                background: "var(--paper)",
                                border: "1px solid var(--rule)",
                                borderRadius: "0.25rem",
                                padding: "0.35rem 0.6rem",
                                width: "min(100%, 18rem)",
                              }}
                            >
                              <Search style={{ width: "0.85rem", height: "0.85rem", color: "var(--muted-ink)" }} />
                              <input
                                type="text"
                                placeholder="Filter tags or functions..."
                                value={abbrQuery}
                                onChange={(e) => setAbbrQuery(e.target.value)}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  fontSize: "0.82rem",
                                  outline: "none",
                                  width: "100%",
                                  color: "var(--ink)",
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                              {categories.map((cat) => (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => setSelectedCategory(cat)}
                                  style={{
                                    padding: "0.3rem 0.65rem",
                                    borderRadius: "0.25rem",
                                    fontSize: "0.74rem",
                                    fontWeight: selectedCategory === cat ? 700 : 500,
                                    background: selectedCategory === cat ? "var(--accent)" : "#fbf7ee",
                                    color: selectedCategory === cat ? "#ffffff" : "var(--ink)",
                                    border:
                                      selectedCategory === cat
                                        ? "1px solid var(--accent)"
                                        : "1px solid var(--rule)",
                                    boxShadow:
                                      selectedCategory === cat ? "0 1px 3px rgba(123, 63, 42, 0.25)" : "none",
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="docs-table-wrapper" style={{ maxHeight: "24rem", overflowY: "auto", margin: 0 }}>
                            <table className="docs-table">
                              <thead>
                                <tr>
                                  <th style={{ width: "5rem" }}>Tag</th>
                                  <th style={{ width: "11rem" }}>Full Term</th>
                                  <th>Linguistic Function &amp; Example</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredAbbrs.map((item) => (
                                  <tr key={item.abbr}>
                                    <td>
                                      <span className="docs-tag-badge">{item.abbr}</span>
                                    </td>
                                    <td style={{ fontWeight: 600, color: "var(--ink)" }}>{item.name}</td>
                                    <td style={{ color: "var(--muted-ink)" }}>{item.desc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section L2: Adjective Citation Standards */}
                <section id="section-l2" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge">{secL2?.domainNum || "L2"}</span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secL2 ? tinaField(secL2, "eyebrow") : undefined}>
                        {secL2?.eyebrow || "Linguistic Standards"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secL2 ? tinaField(secL2, "title") : undefined}>
                        {secL2?.title || "Why Adjectives Use Masculine Nominative Singular Strong Form"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "l2Paragraph1")}>
                      {docs.l2Paragraph1 || "In Old English, every single adjective inflects into over 15 distinct surface endings depending on gender (masculine, feminine, neuter), grammatical case (nominative, accusative, genitive, dative, instrumental), number (singular, plural), and declension (strong vs weak)."}
                    </p>
                    <p data-tina-field={tinaField(docs, "l2Paragraph2")}>
                      {docs.l2Paragraph2 || "For instance, the word for all occurs in the text as eall, ealne, ealles, ealra, eallum, and ealle. Standard dictionaries (Bosworth-Toller, Sweet, Clark Hall, Wiktionary) universally choose the Masculine Nominative Singular Strong form (eall) as the single authoritative headword."}
                    </p>

                    <div className="docs-callout-box" style={{ marginTop: "1rem" }}>
                      <h4 data-tina-field={tinaField(docs, "l2CalloutTitle")}>
                        <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} />
                        {docs.l2CalloutTitle || "Ja/Jō-stem Adjectives Retaining Base \"-e\""}
                      </h4>
                      <p data-tina-field={tinaField(docs, "l2CalloutBody")} style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-ink)" }}>
                        {docs.l2CalloutBody || "Certain adjectives historically belong to the ja/jō-stem class and legitimately end in -e in their masculine nominative singular strong citation form (e.g. wēste \"desert, waste\", blīðe \"happy\", clǣne \"clean\", dȳre \"precious\"). The engine preserves these base forms without stripping their root vowel."}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section L3: Numeral Lemmatization Standard */}
                <section id="section-l3" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge">{secL3?.domainNum || "L3"}</span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secL3 ? tinaField(secL3, "eyebrow") : undefined}>
                        {secL3?.eyebrow || "Morphological Edge Cases"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secL3 ? tinaField(secL3, "title") : undefined}>
                        {secL3?.title || "The Numeral Lemmatization Standard (Masculine Nominative)"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "l3Intro")}>
                      {docs.l3Intro || "Lemmatizing Old English numbers requires a clear rule: for numbers that don't have a singular form (e.g. 2, 3) or numbers above 1, we strictly cite the Masculine Nominative form:"}
                    </p>

                    <div className="docs-tier-cards-grid">
                      {(
                        (docs.numeralCards as Array<{
                          badge?: string;
                          title: string;
                          description: string;
                          isFullWidth?: boolean;
                        }>) ||
                        (docsData.numeralCards as Array<{
                          badge?: string;
                          title: string;
                          description: string;
                          isFullWidth?: boolean;
                        }>) || []
                      ).map((card, idx) => (
                        <div
                          key={idx}
                          data-tina-field={tinaField(card)}
                          className="docs-tier-card"
                          style={card.isFullWidth ? { gridColumn: "1 / -1" } : undefined}
                        >
                          <div>
                            {card.badge && <span className="docs-tier-badge" data-tina-field={tinaField(card, "badge")}>{card.badge}</span>}
                            <h4
                              style={{
                                margin: "0 0 0.35rem",
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                              }}
                            >
                              {card.title}
                            </h4>
                            <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                              {card.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section L4: Wiktionary & IPA Standards */}
                <section id="section-l4" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge">{secL4?.domainNum || "L4"}</span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secL4 ? tinaField(secL4, "eyebrow") : undefined}>
                        {secL4?.eyebrow || "Lexicographic Standards"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secL4 ? tinaField(secL4, "title") : undefined}>
                        {secL4?.title || "Official Wiktionary & IPA Formatting Standards"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    {/* Wiktionary Accordion */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <button
                        type="button"
                        onClick={() => setWiktionaryOpen(!wiktionaryOpen)}
                        className="docs-accordion-btn"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <BookOpen style={{ width: "1.1rem", height: "1.1rem", color: "var(--accent)" }} />
                          <div>
                            <h3
                              data-tina-field={tinaField(docs, "l4WiktionaryTitle")}
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              {docs.l4WiktionaryTitle || "Wiktionary Entry Naming Conventions"}
                            </h3>
                            <p data-tina-field={tinaField(docs, "l4WiktionarySubtitle")} style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                              {docs.l4WiktionarySubtitle || "Standard URL and anchor formatting according to official policy"}
                            </p>
                          </div>
                        </div>
                        {wiktionaryOpen ? (
                          <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                        ) : (
                          <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                        )}
                      </button>

                      {wiktionaryOpen && (
                        <div
                          style={{
                            border: "1px solid var(--rule)",
                            borderTop: "none",
                            borderRadius: "0 0 0.35rem 0.35rem",
                            padding: "1.25rem",
                            background: "var(--surface)",
                          }}
                        >
                          <p data-tina-field={tinaField(docs, "l4WiktionaryIntro")} style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
                            {docs.l4WiktionaryIntro || "Glossy generates external reference links according to official policies:"}{" "}
                            <a
                              href="https://en.wiktionary.org/wiki/Wiktionary:About_Old_English"
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }}
                            >
                              Wiktionary:About Old English{" "}
                              <ExternalLink style={{ width: "0.75rem", height: "0.75rem", display: "inline" }} />
                            </a>
                          </p>

                          <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                            {(
                              (docs.wiktionaryGuidelines as Array<{ title: string; description: string }>) ||
                              (docsData.wiktionaryGuidelines as Array<{ title: string; description: string }>) || []
                            ).map((g, idx) => (
                              <div key={idx} data-tina-field={tinaField(g)} className="docs-tier-card">
                                <strong data-tina-field={tinaField(g, "title")} style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{g.title}</strong>
                                <p data-tina-field={tinaField(g, "description")} style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                                  {g.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* IPA Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIpaOpen(!ipaOpen)}
                        className="docs-accordion-btn"
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <Terminal style={{ width: "1.1rem", height: "1.1rem", color: "var(--accent)" }} />
                          <div>
                            <h3
                              data-tina-field={tinaField(docs, "l4IpaTitle")}
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              {docs.l4IpaTitle || "IPA Phonetic Transcription Standard"}
                            </h3>
                            <p data-tina-field={tinaField(docs, "l4IpaSubtitle")} style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                              {docs.l4IpaSubtitle || "Pronunciation keys aligned with West Saxon phonology"}
                            </p>
                          </div>
                        </div>
                        {ipaOpen ? (
                          <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                        ) : (
                          <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                        )}
                      </button>

                      {ipaOpen && (
                        <div
                          style={{
                            border: "1px solid var(--rule)",
                            borderTop: "none",
                            borderRadius: "0 0 0.35rem 0.35rem",
                            padding: "1.25rem",
                            background: "var(--surface)",
                          }}
                        >
                          <p data-tina-field={tinaField(docs, "l4IpaIntro")} style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
                            {docs.l4IpaIntro || "Phonetic transcriptions follow the International Phonetic Alphabet standards established for West Saxon Old English:"}
                          </p>
                          <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                            {(
                              (docs.ipaSpecifications as Array<{ title: string; description: string }>) ||
                              (docsData.ipaSpecifications as Array<{ title: string; description: string }>) || []
                            ).map((spec, idx) => (
                              <div key={idx} data-tina-field={tinaField(spec)} className="docs-tier-card">
                                <strong data-tina-field={tinaField(spec, "title")} style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{spec.title}</strong>
                                <p data-tina-field={tinaField(spec, "description")} style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                                  {spec.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

            {/* ============================================================== */}
            {/* ARCHITECTURE DOMAIN SECTIONS                                   */}
            {/* ============================================================== */}
                {/* Section A1: Ingesting New Texts */}
                <section id="section-a1" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge" style={{ background: "#334155" }}>
                      {secA1?.domainNum || "A1"}
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secA1 ? tinaField(secA1, "eyebrow") : undefined} style={{ color: "#475569" }}>
                        {secA1?.eyebrow || "Corpus Expansion"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secA1 ? tinaField(secA1, "title") : undefined}>
                        {secA1?.title || "Ingesting & Glossing New Texts (Beowulf, Cædmon, Custom OE)"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "a1Intro")}>
                      {docs.a1Intro || "Glossy allows scholars and learners to add any Old English text to the digital corpus at /edit/new. When new sentences are pasted (or loaded via classic presets like Beowulf: Prologue, Cædmon's Hymn, or The Wanderer):"}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                      {(
                        (docs.ingestionSteps as Array<{ num: string; title: string; description: string }>) ||
                        (docsData.ingestionSteps as Array<{ num: string; title: string; description: string }>) || []
                      ).map((step, idx) => (
                        <div
                          key={idx}
                          data-tina-field={tinaField(step)}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.85rem 1rem",
                            background: "#fbf7ee",
                            border: "1px solid var(--rule)",
                            borderRadius: "0.35rem",
                          }}
                        >
                          <span className="docs-nav-num arch" style={{ marginTop: "0.15rem" }} data-tina-field={tinaField(step, "num")}>
                            {step.num}
                          </span>
                          <div>
                            <strong
                              data-tina-field={tinaField(step, "title")}
                              style={{
                                display: "block",
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              {step.title}
                            </strong>
                            <span data-tina-field={tinaField(step, "description")} style={{ fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                              {step.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section A2: Local Session Drafts & Dual-Write CMS */}
                <section id="section-a2" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge" style={{ background: "#334155" }}>
                      {secA2?.domainNum || "A2"}
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secA2 ? tinaField(secA2, "eyebrow") : undefined} style={{ color: "#475569" }}>
                        {secA2?.eyebrow || "Architecture & Storage"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secA2 ? tinaField(secA2, "title") : undefined}>
                        {secA2?.title || "Local Drafts, Manifest Tracking, & TinaCMS Publishing"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "a2Intro")}>
                      {docs.a2Intro || "Glossy provides a reliable local-first persistence and publishing workflow to ensure seamless editing and Git-backed content management:"}
                    </p>

                    <div className="docs-tier-cards-grid">
                      {(
                        (docs.storageTiers as Array<{
                          tier: string;
                          timing: string;
                          title: string;
                          description: string;
                        }>) ||
                        (docsData.storageTiers as Array<{
                          tier: string;
                          timing: string;
                          title: string;
                          description: string;
                        }>) || []
                      ).map((tier, idx) => (
                        <div key={idx} data-tina-field={tinaField(tier)} className="docs-tier-card">
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span className="docs-tier-badge" style={{ margin: 0 }} data-tina-field={tinaField(tier, "tier")}>
                                {tier.tier}
                              </span>
                              <span data-tina-field={tinaField(tier, "timing")} style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--muted-ink)" }}>
                                {tier.timing}
                              </span>
                            </div>
                            <h4
                              data-tina-field={tinaField(tier, "title")}
                              style={{
                                margin: "0 0 0.35rem",
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              {tier.title}
                            </h4>
                            <p data-tina-field={tinaField(tier, "description")} style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                              {tier.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Section A3: Automated Verification Suite */}
                <section id="section-a3" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge" style={{ background: "#334155" }}>
                      {secA3?.domainNum || "A3"}
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" data-tina-field={secA3 ? tinaField(secA3, "eyebrow") : undefined} style={{ color: "#475569" }}>
                        {secA3?.eyebrow || "Quality Assurance"}
                      </p>
                      <h2 className="docs-section-h2" data-tina-field={secA3 ? tinaField(secA3, "title") : undefined}>
                        {secA3?.title || "Automated Quality Verification Suite"}
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p data-tina-field={tinaField(docs, "a3Intro")}>
                      {docs.a3Intro || "Glossy maintains automated verification scripts to ensure 100% data integrity between raw LaTeX manuscripts, structured JSON content, and dictionary headwords:"}
                    </p>

                    <div className="docs-table-wrapper">
                      <table className="docs-table">
                        <thead>
                          <tr>
                            <th style={{ width: "12rem" }}>Tool / Script</th>
                            <th style={{ width: "15rem" }}>Terminal Command</th>
                            <th>Function &amp; Target</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            (docs.verificationTools as Array<{
                              name: string;
                              command: string;
                              target: string;
                            }>) ||
                            (docsData.verificationTools as Array<{
                              name: string;
                              command: string;
                              target: string;
                            }>) || []
                          ).map((t, idx) => (
                            <tr key={idx} data-tina-field={tinaField(t)}>
                              <td data-tina-field={tinaField(t, "name")} style={{ fontWeight: 600 }}>{t.name}</td>
                              <td>
                                <span data-tina-field={tinaField(t, "command")} className="docs-tag-badge">{t.command}</span>
                              </td>
                              <td data-tina-field={tinaField(t, "target")} style={{ color: "var(--muted-ink)" }}>{t.target}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
