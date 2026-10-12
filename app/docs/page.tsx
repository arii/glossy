"use client";

import { useState } from "react";
import { SiteNav } from "../../components/site-nav";
import { PageHero } from "../../components/page-hero";
import { SiteFooter } from "../../components/site-footer";
import {
  BookOpen,
  Search,
  ChevronDown,
  ChevronRight,
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
      l1Intro
      l1TierHeaderTitle
      l1TierHeaderBadge
      l1TierTokens
      l1TierGlosses
      l1TierTranslation
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

  const abbreviations: Abbreviation[] = (docs.abbreviations as Abbreviation[]) || (docsData.abbreviations as Abbreviation[]);
  const sections: DocSectionItem[] = (docs.sections as DocSectionItem[]) || (docsData.sections as DocSectionItem[]);

  const secL1 = sections.find((s) => s.id === "section-l1") || sections[0];

  const filteredAbbrs = abbreviations.filter((item) => {
    const matchCat = selectedCategory === "All" || item.category === selectedCategory;
    const matchText =
      item.abbr.toLowerCase().includes(abbrQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(abbrQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(abbrQuery.toLowerCase());
    return matchCat && matchText;
  });

  const categories = ["All", "Person & Number", "Case", "Gender & Mood", "Part of Speech", "Affixes & Morphemes"];

  const pageEyebrow = docs.eyebrow || "Linguistic Reference & Standards";
  const pageTitle = docs.title || "Documentation & Reference Guides";

  return (
    <>
      <SiteNav current="docs" slug="ohthere" />
      <main className="site-shell">
        <PageHero
          eyebrow={pageEyebrow}
          eyebrowDataTinaField={tinaField(docs, "eyebrow")}
          title={pageTitle}
          titleDataTinaField={tinaField(docs, "title")}
          description={docs.description || "Comprehensive guide to Leipzig interlinear glossing standards and morphological tagging abbreviations."}
          descriptionDataTinaField={tinaField(docs, "description")}
        />

        <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "0 1rem 3rem" }}>
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
                {docs.l1Intro || "An interlinear gloss is a standard linguistic format following Leipzig glossing standards that presents original historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly underneath:"}
              </p>

              {/* 3-Tier Code Block */}
              <div className="docs-code-tier">
                <div className="docs-tier-header">
                  <span data-tina-field={tinaField(docs, "l1TierHeaderTitle")}>
                    {docs.l1TierHeaderTitle || "Three-Tier Interlinear Structure"}
                  </span>
                  {docs.l1TierHeaderBadge ? (
                    <span data-tina-field={tinaField(docs, "l1TierHeaderBadge")}>
                      {docs.l1TierHeaderBadge}
                    </span>
                  ) : null}
                </div>
                <div className="docs-tier-grid" data-tina-field={tinaField(docs, "l1TierTokens")}>
                  {(docs.l1TierTokens || "Hwæt | wē | Gār-Den-a | in | ġeār-dag-um").split("|").map((token, i) => (
                    <div key={i}>{token.trim()}</div>
                  ))}
                </div>
                <div className="docs-tier-glosses" data-tina-field={tinaField(docs, "l1TierGlosses")}>
                  {(docs.l1TierGlosses || "what | we.NOM | Spear-Dane-GEN.PL | in | yore-day-DAT.PL").split("|").map((gloss, i) => (
                    <div key={i} style={{ color: i === 0 ? "#d6d3d1" : "#fde68a" }}>
                      {gloss.trim()}
                    </div>
                  ))}
                </div>
                <div className="docs-tier-trans" data-tina-field={tinaField(docs, "l1TierTranslation")}>
                  {docs.l1TierTranslation || "“Lo! We have heard of the Spear-Danes in days of yore...”"}
                </div>
              </div>

              {/* Abbreviations Reference */}
              <div style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  onClick={() => setAbbrOpen(!abbrOpen)}
                  className="docs-accordion-btn"
                  aria-label="Toggle Glossing Abbreviations reference"
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", minWidth: 0, flex: 1 }}>
                    <BookOpen style={{ width: "1.1rem", height: "1.1rem", color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
                    <div style={{ minWidth: 0, overflowWrap: "break-word" }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "var(--ink)",
                          fontFamily: "'Charis SIL', Georgia, serif",
                          lineHeight: 1.3,
                        }}
                      >
                        Complete Reference: Glossing Abbreviations
                      </h3>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, marginLeft: "0.5rem", color: "var(--muted-ink)" }}>
                    {abbrOpen ? (
                      <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                    ) : (
                      <ChevronRight style={{ width: "1rem", height: "1rem" }} />
                    )}
                  </div>
                </button>

                {abbrOpen && (
                  <div
                    className="docs-accordion-content"
                    style={{
                      border: "1px solid var(--rule)",
                      borderTop: "none",
                      borderRadius: "0 0 0.35rem 0.35rem",
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

                    <div className="docs-table-wrapper" style={{ maxHeight: "28rem", overflowY: "auto", margin: 0 }}>
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
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
