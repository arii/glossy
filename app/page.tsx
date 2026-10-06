"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { TextDirectory, type TextChoice } from "../components/text-directory";
import { SiteFooter } from "../components/site-footer";
import {
  BookOpen,
  Sparkles,
  Code2,
  Database,
  ExternalLink,
} from "lucide-react";

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

export default function Home() {
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

  const scrollToCorpus = () => {
    const el = document.getElementById("corpus-directory");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.25rem 0.65rem",
                borderRadius: "2rem",
                background: "#f3eadb",
                border: "1px solid #dfcfb8",
                color: "var(--accent)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "1rem",
              }}
            >
              <Sparkles style={{ width: "0.8rem", height: "0.8rem" }} />
              <span>Digital Humanities Platform</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 4vw, 2.75rem)",
                fontFamily: "'Charis SIL', Georgia, serif",
                fontWeight: 700,
                lineHeight: 1.18,
                color: "var(--ink)",
                margin: "0 0 1rem",
              }}
            >
              Interlinear Glossing &amp; Morphology for Old English
            </h1>

            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.65,
                color: "var(--muted-ink)",
                margin: "0 0 1.5rem",
                maxWidth: "34rem",
              }}
            >
              Read, edit, and publish morphologically tagged historical texts with standardized 
              Leipzig three-tier alignment, canonical dictionary headwords, and compilable LaTeX <code>gb4e</code> export.
            </p>

            {/* Primary Action Button Row */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
              <Link
                href="/edit/new"
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
                <span>+</span> Ingest &amp; Gloss New Text
              </Link>

              <button
                type="button"
                onClick={scrollToCorpus}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.7rem 1.25rem",
                  borderRadius: "0.35rem",
                  background: "#fbf7ee",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <span>Explore Corpus ↓</span>
              </button>
            </div>

            {/* Scholarly Provenance & Inspiration Note */}
            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
              Inspired by Peter S. Baker&apos;s{" "}
              <a
                href="https://oldenglishaerobics.net/"
                target="_blank"
                rel="noreferrer"
                style={{ color: "var(--accent)", textDecoration: "underline", fontWeight: 600 }}
              >
                Old English Aerobics
              </a>{" "}
              · Master edition by Tyler Lemon (2026).
            </p>
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
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", background: "#ef4444" }} />
                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", background: "#f59e0b" }} />
                <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", background: "#10b981" }} />
                <span style={{ fontSize: "0.72rem", color: "#a8a29e", fontFamily: "monospace", marginLeft: "0.4rem" }}>
                  Leipzig Interlinear Reader Preview
                </span>
              </div>
              <span style={{ fontSize: "0.68rem", background: "#332d29", color: "#fbbf24", padding: "0.15rem 0.4rem", borderRadius: "0.2rem", fontFamily: "monospace" }}>
                Interactive Demo
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

        {/* ================================================================ */}
        {/* 3 FEATURE PILLARS SECTION                                        */}
        {/* ================================================================ */}
        <section style={{ padding: "3rem 0", borderBottom: "1px solid var(--rule)" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
              gap: "1.5rem",
            }}
          >
            {/* Pillar 1: Leipzig 3-Tier Morphology */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                boxShadow: "0 0.25rem 1rem rgba(64, 47, 29, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ background: "#f3eadb", padding: "0.45rem", borderRadius: "0.35rem", color: "var(--accent)" }}>
                  <BookOpen style={{ width: "1.1rem", height: "1.1rem" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
                  Leipzig Three-Tier Glossing
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-ink)", lineHeight: 1.6 }}>
                Full alignment between surface Old English, morphological gloss tags (42 manuscript abbreviations), 
                and free modern translations, with interactive chip inspection.
              </p>
            </div>

            {/* Pillar 2: Canonical Old English Lemmatizer */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                boxShadow: "0 0.25rem 1rem rgba(64, 47, 29, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ background: "#f3eadb", padding: "0.45rem", borderRadius: "0.35rem", color: "var(--accent)" }}>
                  <Code2 style={{ width: "1.1rem", height: "1.1rem" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
                  Canonical Lemmatization Engine
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-ink)", lineHeight: 1.6 }}>
                Strict lexicographical standards: masculine nominative strong adjectives, infinitive verbs, 
                and direct Wiktionary etymological links validated across all 1,716 corpus tokens.
              </p>
            </div>

            {/* Pillar 3: Dual-Write Architecture */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--rule)",
                borderRadius: "0.5rem",
                padding: "1.5rem",
                boxShadow: "0 0.25rem 1rem rgba(64, 47, 29, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ background: "#f3eadb", padding: "0.45rem", borderRadius: "0.35rem", color: "var(--accent)" }}>
                  <Database style={{ width: "1.1rem", height: "1.1rem" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "1.05rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
                  Dual-Write LaTeX &amp; CMS Sync
                </h3>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-ink)", lineHeight: 1.6 }}>
                3-tier data synchronization model syncing browser <code>localStorage</code>, compilable <code>gb4e</code> LaTeX, 
                structured JSON, and TinaCMS working trees with zero data loss.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* CORPUS DIRECTORY: Responsive Multi-Column Card Grid              */}
        {/* ================================================================ */}
        <section id="corpus-directory" style={{ padding: "3rem 0 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 0.25rem" }}>Digital Manuscripts</p>
              <h2 style={{ margin: 0, fontSize: "1.65rem", fontFamily: "'Charis SIL', Georgia, serif", color: "var(--ink)" }}>
                Old English Corpus &amp; Editions
              </h2>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link
                href="/edit/new"
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "#fbf7ee",
                  border: "1px solid var(--rule)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "0.25rem",
                  textDecoration: "none",
                }}
              >
                + Ingest New Text
              </Link>
            </div>
          </div>

          <TextDirectory initialChoices={choices} />
        </section>

      </main>

      {/* Persistent Global Footer */}
      <SiteFooter />
    </>
  );
}
