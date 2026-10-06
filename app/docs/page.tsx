"use client";

import { useState } from "react";
import { SiteNav } from "../../components/site-nav";
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
      heading
      description
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
    }
  }
`;

interface Abbreviation {
  abbr: string;
  name: string;
  desc: string;
  category: "Person & Number" | "Case" | "Gender & Mood" | "Part of Speech" | "Affixes & Morphemes";
}

export default function DocsPage() {
  const { data: pageData } = useTina({
    query: DOCS_PAGE_QUERY,
    variables: { relativePath: "architecture-faq.json" },
    data: docsData,
  });

  const [abbrOpen, setAbbrOpen] = useState(true);
  const [abbrQuery, setAbbrQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [wiktionaryOpen, setWiktionaryOpen] = useState(true);
  const [ipaOpen, setIpaOpen] = useState(true);

  const abbreviations: Abbreviation[] = (pageData.abbreviations as Abbreviation[]) || (docsData.abbreviations as Abbreviation[]);
  const sections: DocSectionItem[] = (pageData.sections as DocSectionItem[]) || (docsData.sections as DocSectionItem[]);

  const linguisticsSections = sections.filter((s) => s.domain === "linguistics");
  const architectureSections = sections.filter((s) => s.domain === "architecture");

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

  const pageEyebrow = pageData.eyebrow || "Linguistic Standards & System Architecture";
  const pageTitle = pageData.title || "Documentation & Reference Guides";

  return (
    <>
      <SiteNav current="docs" slug="ohthere-wulfstan" />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow" data-tina-field={tinaField(pageData, "eyebrow")}>{pageEyebrow}</p>
          <h1 className="docs-title" data-tina-field={tinaField(pageData, "title")}>{pageTitle}</h1>
        </header>

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
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    background: "#ece3d3",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "0.25rem",
                    color: "var(--accent)",
                  }}
                >
                  {sections.length} Sections
                </span>
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
                    <span className="docs-section-badge">L1</span>
                    <div>
                      <p className="docs-section-eyebrow">Beginner&apos;s Primer</p>
                      <h2 className="docs-section-h2">How Interlinear Glossing Works</h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      An <strong>interlinear gloss</strong> is a standard linguistic format that presents original
                      historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly
                      underneath:
                    </p>

                    {/* 3-Tier Code Block */}
                    <div className="docs-code-tier">
                      <div className="docs-tier-header">
                        <span>Three-Tier Interlinear Structure</span>
                        <span>Leipzig Glossing Rules</span>
                      </div>
                      <div className="docs-tier-grid">
                        <div>Ōhthere</div>
                        <div>sǣ-d-e</div>
                        <div>his hlāford-e</div>
                      </div>
                      <div className="docs-tier-glosses">
                        <div style={{ color: "#a8a29e" }}>Ohthere</div>
                        <div style={{ color: "#fde68a" }}>say-PST-IND.3SG</div>
                        <div style={{ color: "#fde68a" }}>his.GEN lord-DAT.SG</div>
                      </div>
                      <div className="docs-tier-trans">
                        &ldquo;Ohthere said to his lord, King Alfred...&rdquo;
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
                    <span className="docs-section-badge">L2</span>
                    <div>
                      <p className="docs-section-eyebrow">Linguistic Standards</p>
                      <h2 className="docs-section-h2">
                        Why Adjectives Use Masculine Nominative Singular Strong Form
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      In Old English, every single adjective inflects into over 15 distinct surface endings depending
                      on gender (masculine, feminine, neuter), grammatical case (nominative, accusative, genitive,
                      dative, instrumental), number (singular, plural), and declension (strong vs weak).
                    </p>
                    <p>
                      For instance, the word for <em>all</em> occurs in the text as <code>eall</code>, <code>ealne</code>,{" "}
                      <code>ealles</code>, <code>ealra</code>, <code>eallum</code>, and <code>ealle</code>. Standard
                      dictionaries (Bosworth-Toller, Sweet, Clark Hall, Wiktionary) universally choose the{" "}
                      <strong>Masculine Nominative Singular Strong</strong> form (
                      <strong style={{ color: "var(--accent)" }}>eall</strong>) as the single authoritative headword.
                    </p>

                    <div className="docs-callout-box" style={{ marginTop: "1rem" }}>
                      <h4>
                        <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} />
                        Ja/Jō-stem Adjectives Retaining Base &ldquo;-e&rdquo;
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-ink)" }}>
                        Certain adjectives historically belong to the <em>ja/jō</em>-stem class and legitimately end in{" "}
                        <code>-e</code> in their masculine nominative singular strong citation form (e.g.{" "}
                        <strong>wēste</strong> &ldquo;desert, waste&rdquo;, <strong>blīðe</strong> &ldquo;happy&rdquo;,{" "}
                        <strong>clǣne</strong> &ldquo;clean&rdquo;, <strong>dȳre</strong> &ldquo;precious&rdquo;). The
                        engine preserves these base forms without stripping their root vowel.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section L3: Numeral Lemmatization Standard */}
                <section id="section-l3" className="docs-section">
                  <div className="docs-section-heading">
                    <span className="docs-section-badge">L3</span>
                    <div>
                      <p className="docs-section-eyebrow">Morphological Edge Cases</p>
                      <h2 className="docs-section-h2">The Numeral Lemmatization Standard (Masculine Nominative)</h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      Lemmatizing Old English numbers requires a clear rule: for numbers that don&apos;t have a singular
                      form (e.g. 2, 3) or numbers above 1, we strictly cite the <strong>Masculine Nominative</strong>{" "}
                      form:
                    </p>

                    <div className="docs-tier-cards-grid">
                      {(
                        (docsData.numeralCards as Array<{
                          badge?: string;
                          title: string;
                          description: string;
                          isFullWidth?: boolean;
                        }>) || []
                      ).map((card, idx) => (
                        <div
                          key={idx}
                          className="docs-tier-card"
                          style={card.isFullWidth ? { gridColumn: "1 / -1" } : undefined}
                        >
                          <div>
                            {card.badge && <span className="docs-tier-badge">{card.badge}</span>}
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
                    <span className="docs-section-badge">L4</span>
                    <div>
                      <p className="docs-section-eyebrow">Lexicographic Standards</p>
                      <h2 className="docs-section-h2">Official Wiktionary &amp; IPA Formatting Standards</h2>
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
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              Wiktionary Entry Naming Conventions
                            </h3>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                              Standard URL and anchor formatting according to official policy
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
                          <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
                            Glossy generates external reference links according to official{" "}
                            <a
                              href="https://en.wiktionary.org/wiki/Wiktionary:About_Old_English"
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }}
                            >
                              Wiktionary:About Old English{" "}
                              <ExternalLink style={{ width: "0.75rem", height: "0.75rem", display: "inline" }} />
                            </a>{" "}
                            policies:
                          </p>

                          <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                            {(
                              (docsData.wiktionaryGuidelines as Array<{ title: string; description: string }>) || []
                            ).map((g, idx) => (
                              <div key={idx} className="docs-tier-card">
                                <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{g.title}</strong>
                                <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
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
                              style={{
                                margin: 0,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              International Phonetic Alphabet (IPA) Specifications
                            </h3>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                              Pronunciation guidelines for Old English historical phonology
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
                          <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                            {((docsData.ipaSpecifications as Array<{ title: string; description: string }>) || []).map(
                              (spec, idx) => (
                                <div key={idx} className="docs-tier-card">
                                  <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>{spec.title}</strong>
                                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                                    {spec.description}
                                  </p>
                                </div>
                              ),
                            )}
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
                      A1
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" style={{ color: "#475569" }}>
                        Corpus Expansion
                      </p>
                      <h2 className="docs-section-h2">
                        Ingesting &amp; Glossing New Texts (Beowulf, Cædmon, Custom OE)
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      Glossy allows scholars and learners to add any Old English text to the digital corpus at{" "}
                      <strong>/edit/new</strong>. When new sentences are pasted (or loaded via classic presets like{" "}
                      <em>Beowulf: Prologue</em>, <em>Cædmon&apos;s Hymn</em>, or <em>The Wanderer</em>):
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                      {(
                        (docsData.ingestionSteps as Array<{ num: string; title: string; description: string }>) || []
                      ).map((step, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            padding: "0.85rem 1rem",
                            background: "#fbf7ee",
                            border: "1px solid var(--rule)",
                            borderRadius: "0.35rem",
                          }}
                        >
                          <span className="docs-nav-num arch" style={{ marginTop: "0.15rem" }}>
                            {step.num}
                          </span>
                          <div>
                            <strong
                              style={{
                                display: "block",
                                color: "var(--ink)",
                                fontFamily: "'Charis SIL', Georgia, serif",
                              }}
                            >
                              {step.title}
                            </strong>
                            <span style={{ fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
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
                      A2
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" style={{ color: "#475569" }}>
                        Architecture &amp; Storage
                      </p>
                      <h2 className="docs-section-h2">
                        Local Session Drafts, Autosave, &amp; Dual-Write CMS Integration
                      </h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      Glossy provides a robust three-tier data synchronization model to prevent accidental data loss
                      while ensuring seamless Git and LaTeX interoperability:
                    </p>

                    <div className="docs-tier-cards-grid">
                      {(
                        (docsData.storageTiers as Array<{
                          tier: string;
                          timing: string;
                          title: string;
                          description: string;
                        }>) || []
                      ).map((tier, idx) => (
                        <div key={idx} className="docs-tier-card">
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.5rem",
                              }}
                            >
                              <span className="docs-tier-badge" style={{ margin: 0 }}>
                                {tier.tier}
                              </span>
                              <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--muted-ink)" }}>
                                {tier.timing}
                              </span>
                            </div>
                            <h4
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
                            <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
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
                      A3
                    </span>
                    <div>
                      <p className="docs-section-eyebrow" style={{ color: "#475569" }}>
                        Quality Assurance
                      </p>
                      <h2 className="docs-section-h2">Automated Quality Verification Suite</h2>
                    </div>
                  </div>

                  <div className="docs-body">
                    <p>
                      Glossy maintains automated verification scripts to ensure 100% data integrity between raw LaTeX
                      manuscripts, structured JSON content, and dictionary headwords:
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
                            (docsData.verificationTools as Array<{
                              name: string;
                              command: string;
                              target: string;
                            }>) || []
                          ).map((t, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{t.name}</td>
                              <td>
                                <span className="docs-tag-badge">{t.command}</span>
                              </td>
                              <td style={{ color: "var(--muted-ink)" }}>{t.target}</td>
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
    </>
  );
}
