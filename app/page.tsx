"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { TextDirectory, type TextChoice } from "../components/text-directory";
import { SiteFooter } from "../components/site-footer";
import { ExternalLink, BookOpen, Edit3, Code2 } from "lucide-react";
import { useTina, tinaField } from "tinacms/dist/react";
import homeContentData from "../content/pages/home.json";
import attributionData from "../content/pages/attribution.json";
import { BUILT_IN_CORPUS } from "../lib/corpus-registry";
import type { HomePageContent } from "../lib/types";

// Mock interactive token data for live hero preview widget
const HERO_PREVIEW_TOKENS = [
  {
    word: "Ōhthere",
    gloss: "Ohthere.NOM",
    pos: "proper noun",
    lemma: "Ōhthere",
    analysis: "Nominative Singular Masculine personal name",
    wiktionary: "https://en.wiktionary.org/wiki/Ohthere#Old_English",
  },
  {
    word: "sǣde",
    gloss: "say-PST-IND.3SG",
    pos: "verb (Class 3 weak)",
    lemma: "secgan",
    analysis: "Past Indicative 3rd Person Singular from infinitive secgan",
    wiktionary: "https://en.wiktionary.org/wiki/secgan#Old_English",
  },
  {
    word: "his",
    gloss: "3SG.M.GEN",
    pos: "pronoun",
    lemma: "hē",
    analysis: "Genitive Singular Masculine possessive pronoun",
    wiktionary: "https://en.wiktionary.org/wiki/he#Old_English",
  },
  {
    word: "hlāforde,",
    gloss: "lord-DAT.SG",
    pos: "noun (masculine)",
    lemma: "hlāford",
    analysis: "Dative Singular Masculine indirect object",
    wiktionary: "https://en.wiktionary.org/wiki/hlaford#Old_English",
  },
  {
    word: "Ælfrēde",
    gloss: "Alfred-DAT.SG",
    pos: "proper noun",
    lemma: "Ælfrēd",
    analysis: "Dative Singular Masculine personal name in apposition",
    wiktionary: "https://en.wiktionary.org/wiki/%C3%86lfred#Old_English",
  },
  {
    word: "cyninge,",
    gloss: "king-DAT.SG",
    pos: "noun (masculine)",
    lemma: "cyning",
    analysis: "Dative Singular Masculine royal title in apposition",
    wiktionary: "https://en.wiktionary.org/wiki/cyning#Old_English",
  },
];

// Default seed content for home page
const DEFAULT_HOME_CONTENT = {
  title: "Glossy · Interlinear Texts",
  eyebrow: "Interlinear Texts",
  heading: "Read a text or work on its glosses.",
  description:
    "Read, edit, and publish morphologically tagged historical texts with standardized Leipzig three-tier alignment, canonical dictionary headwords, and compilable LaTeX gb4e export.",
  primaryAction: {
    label: "+ Gloss a New Text",
    href: "/edit/new",
  },
  secondaryAction: {
    label: "Explore Corpus ↓",
    href: "#corpus-directory",
  },
};

const INITIAL_HOME_PAGE_DATA = {
  homePage: (homeContentData as unknown as HomePageContent) || (DEFAULT_HOME_CONTENT as HomePageContent),
};
const HOME_PAGE_VARS = { relativePath: "home.json" };

const HOME_PAGE_QUERY = `
  query HomePageQuery($relativePath: String!) {
    homePage(relativePath: $relativePath) {
      title
      eyebrow
      heading
      description
      primaryAction {
        label
        href
      }
      secondaryAction {
        label
        href
      }
    }
  }
`;

export default function Home() {
  const { data: pageData } = useTina({
    query: HOME_PAGE_QUERY,
    variables: HOME_PAGE_VARS,
    data: INITIAL_HOME_PAGE_DATA,
  });

  const page = ((pageData?.homePage || homeContentData) as unknown as HomePageContent) || (DEFAULT_HOME_CONTENT as HomePageContent);

  const [previewMode, setPreviewMode] = useState<"reader" | "editor">("reader");
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(3); // default to 'hlāforde'
  const [editedLemma, setEditedLemma] = useState<string>("hlāford");
  const [editedGloss, setEditedGloss] = useState<string>("lord-DAT.SG");

  // Derive choices from centralized corpus metadata
  const choices: TextChoice[] = Object.values(BUILT_IN_CORPUS).map((c) => ({
    slug: c.slug,
    title: c.title,
    kind: "text",
    author: c.author,
    source: c.source,
    sentenceCount: c.defaultSentenceCount,
    tokenCount: c.defaultTokenCount,
    status: "published",
    isProtected: c.protected,
  }));

  const activeToken = HERO_PREVIEW_TOKENS[selectedTokenIdx];

  return (
    <>
      <SiteNav current="home" />
      <main className="site-shell" style={{ maxWidth: "76rem", margin: "0 auto" }}>
        
        {/* ================================================================ */}
        {/* HERO SECTION: Split-Screen Two-Column Value Prop + Preview */}
        {/* ================================================================ */}
        <section className="hero-two-column">
          {/* Left Column: Headline & Primary CTAs */}
          <div>
            {page.eyebrow ? (
              <p
                data-tina-field={tinaField(page, "eyebrow")}
                style={{
                  fontSize: "0.82rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--accent)",
                  margin: "0 0 0.5rem",
                }}
              >
                {page.eyebrow}
              </p>
            ) : null}
            <h1
              data-tina-field={tinaField(page, "heading")}
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontFamily: "'Charis SIL', Georgia, serif",
                fontWeight: 700,
                lineHeight: 1.18,
                color: "var(--ink)",
                margin: "0 0 1rem",
              }}
            >
              {page.heading || "Read a text or work on its glosses."}
            </h1>

            {page.description ? (
              <p
                data-tina-field={tinaField(page, "description")}
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.65,
                  color: "var(--muted-ink)",
                  margin: "0 0 1.5rem",
                  maxWidth: "34rem",
                }}
              >
                {page.description}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Link
                href={page.primaryAction?.href || "/edit/new"}
                data-tina-field={page.primaryAction ? tinaField(page.primaryAction, "label") : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.7rem 1.35rem",
                  borderRadius: "0.35rem",
                  background: "var(--accent)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 2px 6px rgba(123, 63, 42, 0.25)",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{page.primaryAction?.label || "+ Gloss a New Text"}</span>
              </Link>
              <Link
                href={page.secondaryAction?.href || "#corpus-directory"}
                data-tina-field={page.secondaryAction ? tinaField(page.secondaryAction, "label") : undefined}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.7rem 1.25rem",
                  borderRadius: "0.35rem",
                  background: "#fbf7ee",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                }}
              >
                <span>{page.secondaryAction?.label || "Explore Corpus ↓"}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Live Gloss & Morpheme Studio Preview */}
          <div className="hero-preview-card">
            {/* Widget Header Bar with Mode Switcher */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #332d29",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  background: "#292524",
                  borderRadius: "0.35rem",
                  padding: "0.2rem",
                  border: "1px solid #44403c",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewMode("reader")}
                  style={{
                    background: previewMode === "reader" ? "var(--accent)" : "transparent",
                    color: previewMode === "reader" ? "#ffffff" : "#a8a29e",
                    border: "none",
                    borderRadius: "0.25rem",
                    padding: "0.25rem 0.65rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <BookOpen style={{ width: "0.75rem", height: "0.75rem" }} />
                  <span>Reader Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("editor")}
                  style={{
                    background: previewMode === "editor" ? "var(--accent)" : "transparent",
                    color: previewMode === "editor" ? "#ffffff" : "#a8a29e",
                    border: "none",
                    borderRadius: "0.25rem",
                    padding: "0.25rem 0.65rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Edit3 style={{ width: "0.75rem", height: "0.75rem" }} />
                  <span>Editor Preview</span>
                </button>
              </div>

              <span
                style={{
                  fontSize: "0.68rem",
                  fontFamily: "monospace",
                  background: "#292524",
                  border: "1px solid #44403c",
                  color: "#a8a29e",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                Cotton MS Tiberius B. i
              </span>
            </div>

            {/* Mode 1: Interactive Reader Preview */}
            {previewMode === "reader" && (
              <div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <p style={{ margin: "0 0 0.5rem", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#a8a29e" }}>
                    Click any word to inspect grammatical features:
                  </p>
                  
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.65rem 0.85rem" }}>
                    {HERO_PREVIEW_TOKENS.map((token, idx) => {
                      const isSelected = selectedTokenIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedTokenIdx(idx);
                            setEditedLemma(token.lemma);
                            setEditedGloss(token.gloss);
                          }}
                          style={{
                            display: "inline-flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            background: isSelected ? "#3b2a22" : "transparent",
                            border: isSelected ? "1px solid #fbbf24" : "1px solid transparent",
                            borderRadius: "0.3rem",
                            padding: "0.3rem 0.45rem",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontFamily: "'Charis SIL', Georgia, serif",
                              fontWeight: 700,
                              color: isSelected ? "#fbbf24" : "#fde68a",
                            }}
                          >
                            {token.word}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontFamily: "monospace",
                              color: isSelected ? "#ffffff" : "#a8a29e",
                            }}
                          >
                            {token.gloss}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aligned Free Translation */}
                <div
                  style={{
                    paddingTop: "0.75rem",
                    borderTop: "1px dashed #332d29",
                    marginBottom: "1rem",
                    fontStyle: "italic",
                    fontFamily: "'Charis SIL', Georgia, serif",
                    fontSize: "0.92rem",
                    color: "#d6d3d1",
                  }}
                >
                  &ldquo;Ohthere said to his lord, King Alfred, that he lived the furthest north of all Norwegians.&rdquo;
                </div>

                {/* Selected Token Inspector Card */}
                {activeToken && (
                  <div
                    style={{
                      background: "#292524",
                      border: "1px solid #44403c",
                      borderRadius: "0.4rem",
                      padding: "0.85rem 1rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <div>
                        <span style={{ fontSize: "1rem", fontFamily: "'Charis SIL', Georgia, serif", fontWeight: 700, color: "#fbbf24" }}>
                          {activeToken.word.replace(/[.,]/g, "")}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "#a8a29e", marginLeft: "0.5rem" }}>
                          Lemma: <strong style={{ color: "#fafaf9" }}>{activeToken.lemma}</strong> ({activeToken.pos})
                        </span>
                      </div>

                      <a
                        href={activeToken.wiktionary}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: "0.72rem",
                          color: "#60a5fa",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        Wiktionary <ExternalLink style={{ width: "0.65rem", height: "0.65rem" }} />
                      </a>
                    </div>

                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#e7e5e4", lineHeight: 1.4 }}>
                      {activeToken.analysis}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Interactive Morpheme Studio / Editor Preview */}
            {previewMode === "editor" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.72rem", color: "#a8a29e", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Sentence 1 of 75 · Morphological Segmentation
                  </span>
                  <Link
                    href="/edit/ohthere"
                    style={{
                      fontSize: "0.75rem",
                      color: "#fbbf24",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    Open in Full Studio →
                  </Link>
                </div>

                {/* Token breakdown fields */}
                <div
                  style={{
                    background: "#292524",
                    border: "1px solid #44403c",
                    borderRadius: "0.4rem",
                    padding: "0.85rem 1rem",
                    marginBottom: "0.85rem",
                  }}
                >
                  <div className="hero-breakdown-grid">
                    <div>
                      <label style={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", color: "#a8a29e", marginBottom: "0.25rem" }}>
                        Surface Form
                      </label>
                      <div
                        style={{
                          background: "#1c1917",
                          border: "1px solid #44403c",
                          borderRadius: "0.25rem",
                          padding: "0.35rem 0.5rem",
                          fontFamily: "'Charis SIL', Georgia, serif",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          color: "#fbbf24",
                        }}
                      >
                        hlāforde
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", color: "#a8a29e", marginBottom: "0.25rem" }}>
                        Dictionary Lemma
                      </label>
                      <input
                        type="text"
                        value={editedLemma}
                        onChange={(e) => setEditedLemma(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#1c1917",
                          border: "1px solid #44403c",
                          borderRadius: "0.25rem",
                          padding: "0.35rem 0.5rem",
                          color: "#fafaf9",
                          fontSize: "0.85rem",
                          fontFamily: "'Charis SIL', Georgia, serif",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.68rem", textTransform: "uppercase", color: "#a8a29e", marginBottom: "0.25rem" }}>
                      Leipzig Gloss
                    </label>
                    <input
                      type="text"
                      value={editedGloss}
                      onChange={(e) => setEditedGloss(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#1c1917",
                        border: "1px solid #44403c",
                        borderRadius: "0.25rem",
                        padding: "0.35rem 0.5rem",
                        color: "#fafaf9",
                        fontSize: "0.82rem",
                        fontFamily: "monospace",
                        marginBottom: "0.5rem",
                      }}
                    />

                    {/* Quick Leipzig Tag Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", alignItems: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "#78716c", marginRight: "0.2rem" }}>Tags:</span>
                      {["DAT", "SG", "NOM", "ACC", "GEN", "PST", "IND", "3SG"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (!editedGloss.includes(tag)) {
                              setEditedGloss((prev) => (prev ? `${prev}.${tag}` : tag));
                            }
                          }}
                          style={{
                            background: editedGloss.includes(tag) ? "#451a03" : "#1c1917",
                            border: editedGloss.includes(tag) ? "1px solid #d97706" : "1px solid #44403c",
                            color: editedGloss.includes(tag) ? "#fbbf24" : "#d6d3d1",
                            padding: "0.15rem 0.4rem",
                            borderRadius: "0.2rem",
                            fontSize: "0.65rem",
                            fontFamily: "monospace",
                            cursor: "pointer",
                          }}
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live gb4e LaTeX export preview */}
                <div
                  style={{
                    background: "#0c0a09",
                    border: "1px solid #292524",
                    borderRadius: "0.35rem",
                    padding: "0.65rem 0.85rem",
                    fontSize: "0.72rem",
                    fontFamily: "monospace",
                    color: "#a8a29e",
                    lineHeight: 1.45,
                    overflowX: "auto",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem", color: "#78716c", fontSize: "0.65rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <Code2 style={{ width: "0.7rem", height: "0.7rem" }} /> gb4e LaTeX Preview
                    </span>
                    <span>Compiles with pdfLaTeX / XeLaTeX</span>
                  </div>
                  <pre style={{ margin: 0, color: "#d6d3d1" }}>
{`\\gll Ōhthere sǣde his hlāforde \\\\
     Ohthere.NOM say-PST-IND.3SG 3SG.M.GEN ${editedGloss} \\\\
\\glt \`Ohthere said to his lord, King Alfred...\'`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="corpus-directory" style={{ padding: "1rem 0 1rem" }}>
          <TextDirectory initialChoices={choices} attributionConfig={attributionData} />
        </section>

      </main>

      {/* Persistent Global Footer */}
      <SiteFooter />
    </>
  );
}
