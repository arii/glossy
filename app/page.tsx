"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { TextDirectory, type TextChoice } from "../components/text-directory";
import { SiteFooter } from "../components/site-footer";
import { ExternalLink } from "lucide-react";
import { useTina, tinaField } from "tinacms/dist/react";
import homeContentData from "../content/pages/home.json";

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
  heading: "Interlinear Glossing & Morphology for Old English",
  description:
    "Read, edit, and publish morphologically tagged historical texts with standardized Leipzig three-tier alignment, canonical dictionary headwords, and compilable LaTeX gb4e export.",
  primaryAction: {
    label: "+ Ingest & Gloss New Text",
    href: "/edit/new",
  },
  secondaryAction: {
    label: "Explore Corpus ↓",
    href: "#corpus-directory",
  },
};

const HOME_PAGE_QUERY = `
  query HomePageQuery($relativePath: String!) {
    page(relativePath: $relativePath) {
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
    variables: { relativePath: "home.json" },
    data: (homeContentData as typeof DEFAULT_HOME_CONTENT) || DEFAULT_HOME_CONTENT,
  });

  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(1); // default to 'sǣde'

  // Pre-configured choices with complete attribution and metrics
  const choices: TextChoice[] = [
    {
      slug: "ohthere-wulfstan",
      title: "The voyages of Ohthere and Wulfstan",
      kind: "text",
      author: "Tyler Lemon (ed.) / King Alfred's Court",
      source: "London, British Library, Cotton MS Tiberius B. i",
      sentenceCount: 75,
      tokenCount: 1716,
      status: "published",
      isProtected: true,
    },
    {
      slug: "beowulf-prologue",
      title: "Beowulf: Prologue (Lines 1–11)",
      kind: "text",
      author: "Anonymous Anglo-Saxon Poet",
      source: "London, British Library, Cotton MS Vitellius A. xv (Nowell Codex)",
      sentenceCount: 11,
      tokenCount: 53,
      status: "published",
      isProtected: false,
    },
  ];

  const activeToken = HERO_PREVIEW_TOKENS[selectedTokenIdx];

  return (
    <>
      <SiteNav current="home" />
      <main className="site-shell" style={{ maxWidth: "76rem", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
        
        {/* ================================================================ */}
        {/* HERO SECTION: Split-Screen Value Prop + Live Interactive Widget */}
        {/* ================================================================ */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))",
            gap: "2.5rem",
            alignItems: "center",
            padding: "2rem 0 3.5rem",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          {/* Left Column: Headline & Primary CTAs */}
          <div>
            <p
              className="eyebrow"
              data-tina-field={tinaField(pageData, "eyebrow")}
              style={{ margin: "0 0 0.5rem" }}
            >
              {pageData.eyebrow || "Interlinear Texts"}
            </p>

            <h1
              data-tina-field={tinaField(pageData, "heading")}
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontFamily: "'Charis SIL', Georgia, serif",
                fontWeight: 700,
                lineHeight: 1.18,
                color: "var(--ink)",
                margin: "0 0 1rem",
              }}
            >
              {pageData.heading || "Interlinear Glossing & Morphology for Old English"}
            </h1>

            {pageData.description ? (
              <p
                data-tina-field={tinaField(pageData, "description")}
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.65,
                  color: "var(--muted-ink)",
                  margin: "0 0 1.5rem",
                  maxWidth: "34rem",
                }}
              >
                {pageData.description}
              </p>
            ) : null}

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
              <Link
                href={pageData.primaryAction?.href || "/edit/new"}
                data-tina-field={tinaField(pageData.primaryAction, "label")}
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
                <span>{pageData.primaryAction?.label || "+ Gloss a New Text"}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Live Gloss Preview Widget */}
          <div
            style={{
              background: "#1c1917",
              color: "#fafaf9",
              borderRadius: "0.6rem",
              padding: "1.5rem",
              boxShadow: "0 1rem 3rem rgba(0, 0, 0, 0.15)",
              border: "1px solid #332d29",
            }}
          >
            {/* Widget Header Bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "0.75rem",
                borderBottom: "1px solid #332d29",
                marginBottom: "1rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "#d6d3d1", fontFamily: "monospace", letterSpacing: "0.03em" }}>
                Leipzig Interlinear Reader Preview
              </span>
            </div>

            {/* Clickable Token Gloss Row */}
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
                      onClick={() => setSelectedTokenIdx(idx)}
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
        </section>

        <section id="corpus-directory" style={{ padding: "2.5rem 0 1rem" }}>
          <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.65rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
            Old English Corpus &amp; Editions
          </h2>

          <TextDirectory initialChoices={choices} />
        </section>

      </main>

      {/* Persistent Global Footer */}
      <SiteFooter />
    </>
  );
}
