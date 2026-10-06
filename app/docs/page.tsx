"use client";

import { useState } from "react";
import { SiteNav } from "../../components/site-nav";
import {
  CheckCircle2,
  BookOpen,
  HelpCircle,
  Hash,
  Sparkles,
  Layers,
  Search,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Code2,
  Terminal,
  Database,
} from "lucide-react";

interface Abbreviation {
  abbr: string;
  name: string;
  desc: string;
  category: "Person & Number" | "Case" | "Gender & Mood" | "Part of Speech" | "Affixes & Morphemes";
}

const GLOSSING_ABBREVIATIONS: Abbreviation[] = [
  { abbr: "1", name: "1st person", desc: "Speaker (ic, mē, mīn, wē, ūs)", category: "Person & Number" },
  { abbr: "2", name: "2nd person", desc: "Addressee (þū, þē, þīn, gē, ēow)", category: "Person & Number" },
  { abbr: "3", name: "3rd person", desc: "Third person (hē, hēo, hit, hīe, him, his)", category: "Person & Number" },
  { abbr: "ACC", name: "accusative case", desc: "Direct object of transitive verb or preposition", category: "Case" },
  { abbr: "ADJ", name: "adjective", desc: "Descriptive modifier", category: "Part of Speech" },
  { abbr: "ADV", name: "adverb", desc: "Modifying verb, adjective, or clause direction", category: "Part of Speech" },
  { abbr: "AGT", name: "agent", desc: "Agentive noun suffix (-ere, -a, e.g. hwælhuntan, fiscerum)", category: "Affixes & Morphemes" },
  { abbr: "CMP", name: "comparative", desc: "Comparative degree (-ra, -re, -or, e.g. lengra, swīftre)", category: "Gender & Mood" },
  { abbr: "COMP", name: "complementizer", desc: "Subordinating clause marker (þæt, that)", category: "Part of Speech" },
  { abbr: "DAT", name: "dative case", desc: "Indirect object (to/for) or prepositional object", category: "Case" },
  { abbr: "DEF", name: "definite", desc: "Definite article (sē, sēo, þæt, þā, þǣm)", category: "Part of Speech" },
  { abbr: "DEM", name: "demonstrative", desc: "Demonstrative pronoun/determiner (þes, þis, þās)", category: "Part of Speech" },
  { abbr: "DET", name: "determiner", desc: "Quantifier or demonstrative modifying a noun", category: "Part of Speech" },
  { abbr: "DIST", name: "distal", desc: "Distal demonstrative (that / those over there)", category: "Part of Speech" },
  { abbr: "F", name: "feminine gender", desc: "Grammatical feminine gender", category: "Gender & Mood" },
  { abbr: "GEN", name: "genitive case", desc: "Possession, origin, or partitive relation (of)", category: "Case" },
  { abbr: "HAB", name: "habitual", desc: "Habitual or timeless aspect (bēoð, bið)", category: "Gender & Mood" },
  { abbr: "IMP", name: "imperative mood", desc: "Direct command or exhortation", category: "Gender & Mood" },
  { abbr: "IND", name: "indicative mood", desc: "Stating factual reality", category: "Gender & Mood" },
  { abbr: "INDF", name: "indefinite", desc: "Indefinite article/pronoun (ān, sum, ǣniġ)", category: "Part of Speech" },
  { abbr: "INF", name: "infinitive", desc: "Uninflected verb citation base (-an, -ian)", category: "Part of Speech" },
  { abbr: "INS", name: "instrumental case", desc: "Means or instrument by which an action is done (þȳ, þon)", category: "Case" },
  { abbr: "M", name: "masculine gender", desc: "Grammatical masculine gender", category: "Gender & Mood" },
  { abbr: "N", name: "neuter gender", desc: "Grammatical neuter gender", category: "Gender & Mood" },
  { abbr: "NEG", name: "negative", desc: "Negative prefix or particle (ne, n-ān, næfde)", category: "Affixes & Morphemes" },
  { abbr: "NMLZ", name: "nominalizer", desc: "Suffix creating a noun (-oð, -aþ, e.g. huntoðe, fiscaþe)", category: "Affixes & Morphemes" },
  { abbr: "NOM", name: "nominative case", desc: "Grammatical subject of the clause", category: "Case" },
  { abbr: "PART", name: "participle", desc: "Past or present participle (-ende, -en, -ed, -od)", category: "Part of Speech" },
  { abbr: "PASS", name: "passive voice", desc: "Passive verbal construction", category: "Gender & Mood" },
  { abbr: "PFX", name: "prefix", desc: "Derivational or verbal prefix (ġe-, ā-, of-, be-)", category: "Affixes & Morphemes" },
  { abbr: "PL", name: "plural number", desc: "More than one entity", category: "Person & Number" },
  { abbr: "POSS", name: "possessive", desc: "Possessive pronoun or determiner", category: "Part of Speech" },
  { abbr: "PROX", name: "proximate", desc: "Proximate demonstrative (this / these here)", category: "Part of Speech" },
  { abbr: "PRS", name: "present tense", desc: "Action taking place in the present", category: "Gender & Mood" },
  { abbr: "PST", name: "past tense", desc: "Action completed in past time (preterite)", category: "Gender & Mood" },
  { abbr: "REL", name: "relativizer", desc: "Relative clause marker (þe, sē þe)", category: "Part of Speech" },
  { abbr: "SG", name: "singular number", desc: "Exactly one entity", category: "Person & Number" },
  { abbr: "SJV", name: "subjunctive mood", desc: "Hypothetical, counterfactual, or indirect clause", category: "Gender & Mood" },
  { abbr: "STR", name: "strong declension (indef.)", desc: "Strong adjectival inflection (alone without article)", category: "Gender & Mood" },
  { abbr: "SUP", name: "superlative", desc: "Superlative degree (-ost, -est, -mest, e.g. norþmest)", category: "Gender & Mood" },
  { abbr: "THM", name: "theme vowel", desc: "Formative thematic vowel in Class 2 weak verbs (-i-, -o-)", category: "Affixes & Morphemes" },
  { abbr: "WK", name: "weak declension (def.)", desc: "Weak adjectival or nominal inflection (after article)", category: "Gender & Mood" },
];

const SECTIONS = [
  { id: "section-1", num: "1", title: "How Interlinear Glossing Works", icon: HelpCircle },
  { id: "section-2", num: "2", title: "Adjective Citation Standards", icon: BookOpen },
  { id: "section-3", num: "3", title: "The Numeral Lemmatization Standard", icon: Hash },
  { id: "section-4", num: "4", title: "Automated Quality Verification Suite", icon: CheckCircle2 },
  { id: "section-5", num: "5", title: "Ingesting & Glossing New Texts", icon: Sparkles },
  { id: "section-6", num: "6", title: "Official Wiktionary & IPA Standards", icon: BookOpen },
  { id: "section-7", num: "7", title: "Local Drafts & Dual-Write Architecture", icon: Database },
];

export default function DocsPage() {
  // Accordion state
  const [abbrOpen, setAbbrOpen] = useState(true);
  const [abbrQuery, setAbbrQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [wiktionaryOpen, setWiktionaryOpen] = useState(true);
  const [ipaOpen, setIpaOpen] = useState(true);

  const filteredAbbrs = GLOSSING_ABBREVIATIONS.filter((item) => {
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

  return (
    <>
      <SiteNav current="docs" slug="ohthere-wulfstan" />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">Technical Documentation &amp; Linguistic Guide</p>
          <h1 className="docs-title">
            Architecture &amp; Linguistic Glossing FAQ
          </h1>
          <p className="source-line" style={{ maxWidth: "52rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Complete reference guide to Leipzig interlinear glossing, the 37 original LaTeX abbreviations, canonical Old English lemma standards (adjectives, verbs, nouns, numerals), and dual-write storage architecture.
          </p>
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
              <span style={{ fontSize: "0.7rem", fontFamily: "monospace", fontWeight: 700, background: "#ece3d3", padding: "0.15rem 0.45rem", borderRadius: "0.25rem", color: "var(--accent)" }}>
                7 Sections
              </span>
            </div>

            <nav className="docs-nav-list">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className="docs-nav-item"
                >
                  <span className="docs-nav-num">{sec.num}</span>
                  <span>{sec.title}</span>
                </button>
              ))}
            </nav>

            <div style={{ marginTop: "1.25rem", paddingTop: "0.85rem", borderTop: "1px solid var(--rule)", fontSize: "0.75rem", color: "var(--muted-ink)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Glossy v0.1.0 Specification</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.68rem", background: "#f3eadb", padding: "0.15rem 0.35rem", borderRadius: "0.2rem", color: "var(--ink)" }}>gb4e</span>
            </div>
          </div>

          {/* Quick Spec Card */}
          <div className="docs-callout-box">
            <h4>
              <Code2 style={{ width: "0.9rem", height: "0.9rem" }} />
              Quick Canonical Rule
            </h4>
            <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
              All Old English adjectives default to <strong>Masculine Nominative Singular Strong</strong> citation form. Numerals 2 &amp; 3 default to <strong>twēgen</strong> and <strong>þrīe</strong>.
            </p>
          </div>
        </aside>

        {/* Main Content Sections */}
        <div className="docs-content">
          {/* Section 1: Beginner's Guide */}
          <section id="section-1" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">1</span>
              <div>
                <p className="docs-section-eyebrow">Beginner&apos;s Primer</p>
                <h2 className="docs-section-h2">How Interlinear Glossing Works</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                An <strong>interlinear gloss</strong> is a standard linguistic format that presents original historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly underneath:
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
                  <div style={{ color: "#fde68a" }}>say-PST-IND3SG</div>
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
                      <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                        Complete Reference: 37 Glossing Abbreviations
                      </h3>
                      <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                        Defined in Section 2 of <code>references/Voyages_of_Ohthere_Wulfstan.tex</code>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", background: "#f3eadb", padding: "0.2rem 0.5rem", borderRadius: "0.25rem" }}>
                      {filteredAbbrs.length} tags
                    </span>
                    {abbrOpen ? <ChevronDown style={{ width: "1rem", height: "1rem" }} /> : <ChevronRight style={{ width: "1rem", height: "1rem" }} />}
                  </div>
                </button>

                {abbrOpen && (
                  <div style={{ border: "1px solid var(--rule)", borderTop: "none", borderRadius: "0 0 0.35rem 0.35rem", padding: "1rem", background: "var(--surface)" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "var(--paper)", border: "1px solid var(--rule)", borderRadius: "0.25rem", padding: "0.35rem 0.6rem", width: "min(100%, 18rem)" }}>
                        <Search style={{ width: "0.85rem", height: "0.85rem", color: "var(--muted-ink)" }} />
                        <input
                          type="text"
                          placeholder="Filter tags or functions..."
                          value={abbrQuery}
                          onChange={(e) => setAbbrQuery(e.target.value)}
                          style={{ border: "none", background: "transparent", fontSize: "0.82rem", outline: "none", width: "100%", color: "var(--ink)" }}
                        />
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            style={{
                              padding: "0.25rem 0.55rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.72rem",
                              fontWeight: selectedCategory === cat ? 700 : 500,
                              background: selectedCategory === cat ? "var(--accent)" : "#f3eadb",
                              color: selectedCategory === cat ? "#fff" : "var(--ink)",
                              border: "1px solid",
                              borderColor: selectedCategory === cat ? "var(--accent)" : "var(--rule)",
                              cursor: "pointer",
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
                              <td><span className="docs-tag-badge">{item.abbr}</span></td>
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

          {/* Section 2: Adjective Citation Standards */}
          <section id="section-2" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">2</span>
              <div>
                <p className="docs-section-eyebrow">Linguistic Standards</p>
                <h2 className="docs-section-h2">Why Adjectives Use Masculine Nominative Singular Strong Form</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                In Old English, every single adjective inflects into over 15 distinct surface endings depending on gender (masculine, feminine, neuter), grammatical case (nominative, accusative, genitive, dative, instrumental), number (singular, plural), and declension (strong vs weak).
              </p>
              <p>
                For instance, the word for <em>all</em> occurs in the text as <code>eall</code>, <code>ealne</code>, <code>ealles</code>, <code>ealra</code>, <code>eallum</code>, and <code>ealle</code>. Standard dictionaries (Bosworth-Toller, Sweet, Clark Hall, Wiktionary) universally choose the <strong>Masculine Nominative Singular Strong</strong> form (<strong style={{ color: "var(--accent)" }}>eall</strong>) as the single authoritative headword.
              </p>

              <div className="docs-callout-box" style={{ marginTop: "1rem" }}>
                <h4>
                  <BookOpen style={{ width: "0.9rem", height: "0.9rem" }} />
                  Ja/Jō-stem Adjectives Retaining Base &ldquo;-e&rdquo;
                </h4>
                <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.6, color: "var(--muted-ink)" }}>
                  Certain adjectives historically belong to the <em>ja/jō</em>-stem class and legitimately end in <code>-e</code> in their masculine nominative singular strong citation form (e.g. <strong>wēste</strong> &ldquo;desert, waste&rdquo;, <strong>blīðe</strong> &ldquo;happy&rdquo;, <strong>clǣne</strong> &ldquo;clean&rdquo;, <strong>dȳre</strong> &ldquo;precious&rdquo;). The engine preserves these base forms without stripping their root vowel.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Numeral Lemmatization Standard */}
          <section id="section-3" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">3</span>
              <div>
                <p className="docs-section-eyebrow">Morphological Edge Cases</p>
                <h2 className="docs-section-h2">The Numeral Lemmatization Standard (Masculine Nominative)</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                Lemmatizing Old English numbers requires a clear rule: for numbers that don&apos;t have a singular form (e.g. 2, 3) or numbers above 1, we strictly cite the <strong>Masculine Nominative</strong> form:
              </p>

              <div className="docs-tier-cards-grid">
                <div className="docs-tier-card">
                  <div>
                    <span className="docs-tier-badge">Plural Nominals</span>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)" }}>1 vs. 2 &amp; 3 (Inherent Plurals)</h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      <code>1 (ān)</code> declines with a masculine nominative singular form. However, <code>2 (twēgen/twā)</code> and <code>3 (þrīe/þrēo)</code> are inherently plural. Their canonical citation headwords are strictly the <strong>Masculine Nominative</strong> forms: <strong>twēgen</strong> and <strong>þrīe</strong>.
                    </p>
                  </div>
                </div>

                <div className="docs-tier-card">
                  <div>
                    <span className="docs-tier-badge">Cardinals</span>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)" }}>4 to 19 (Indeclinable Cardinals)</h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      Numbers from <code>4 (fēower)</code> to <code>19</code> are largely indeclinable when modifying nouns and do not have distinct gender forms. Their citation headword is simply the base cardinal stem (<code>fīf</code>, <code>siex</code>, <code>eahta</code>, <code>tīen</code>).
                    </p>
                  </div>
                </div>

                <div className="docs-tier-card" style={{ gridColumn: "1 / -1" }}>
                  <div>
                    <span className="docs-tier-badge">Quantifiers</span>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)" }}>Decades &amp; Hundreds (Noun Quantifiers)</h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      Decades and hundreds like <code>twēntig (20)</code>, <code>syxtig (60)</code>, and <code>hundtēontiġ (100)</code> behave grammatically as neuter nouns that govern a dependent genitive plural (e.g. <em>syxtig hrāna</em> = &ldquo;sixty of reindeers&rdquo;). Their dictionary headwords are the base cardinal noun forms.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Automated Verification Suite */}
          <section id="section-4" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">4</span>
              <div>
                <p className="docs-section-eyebrow">Quality Assurance</p>
                <h2 className="docs-section-h2">Automated Quality Verification Suite</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                Glossy maintains automated verification scripts to ensure 100% data integrity between raw LaTeX manuscripts, structured JSON content, and dictionary headwords:
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
                    <tr>
                      <td style={{ fontWeight: 600 }}>Lemma Accuracy Audit</td>
                      <td><span className="docs-tag-badge">node scripts/validate-lemmas.mjs</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Audits all tokens verifying 100% compliance across verbs, nouns, adjectives, determiners, and numerals.</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Source Alignment Validator</td>
                      <td><span className="docs-tag-badge">npm run validate:source</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Validates 100% token and gloss alignment across all sentences with zero warnings.</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Dictionary Sync</td>
                      <td><span className="docs-tag-badge">npm run sync:dictionary</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Generates clean, normalized dictionary files in <code>content/dictionary/</code>.</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Content Pre-compiler</td>
                      <td><span className="docs-tag-badge">npm run compile:content</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Pre-compiles master TeX source into <code>content/texts/ohthere.json</code>.</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>Dead Code Audit</td>
                      <td><span className="docs-tag-badge">npm run audit:deadcode</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Automated Knip analysis verifying zero dead code or unlisted dependencies.</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600 }}>TypeScript Typecheck</td>
                      <td><span className="docs-tag-badge">npm run typecheck</span></td>
                      <td style={{ color: "var(--muted-ink)" }}>Strict type safety validation across the entire application codebase.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: Ingesting New Texts */}
          <section id="section-5" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">5</span>
              <div>
                <p className="docs-section-eyebrow">Corpus Expansion</p>
                <h2 className="docs-section-h2">Ingesting &amp; Glossing New Texts (Beowulf, Cædmon, Custom OE)</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                Glossy allows scholars and learners to add any Old English text to the digital corpus at <strong>/edit/new</strong>.
                When new sentences are pasted (or loaded via classic presets like <em>Beowulf: Prologue</em>, <em>Cædmon&apos;s Hymn</em>, or <em>The Wanderer</em>):
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", padding: "0.85rem 1rem", background: "#fbf7ee", border: "1px solid var(--rule)", borderRadius: "0.35rem" }}>
                  <span className="docs-nav-num" style={{ marginTop: "0.15rem" }}>1</span>
                  <div>
                    <strong style={{ display: "block", color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>Automatic Tokenization &amp; Compound Splitting</strong>
                    <span style={{ fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                      Punctuation is cleanly isolated and bound morphemes (hyphenated compound terms like <code>ġeār-dag-um</code>) are systematically segmented into glossable lexical units.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", padding: "0.85rem 1rem", background: "#fbf7ee", border: "1px solid var(--rule)", borderRadius: "0.35rem" }}>
                  <span className="docs-nav-num" style={{ marginTop: "0.15rem" }}>2</span>
                  <div>
                    <strong style={{ display: "block", color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>Contextual Lemmatization Engine</strong>
                    <span style={{ fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                      Every token is evaluated through the Old English linguistic engine, assigning canonical masculine nominative singular strong adjective lemmas, infinitive verb lemmas, nominative noun lemmas, and direct Wiktionary etymological links.
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", padding: "0.85rem 1rem", background: "#fbf7ee", border: "1px solid var(--rule)", borderRadius: "0.35rem" }}>
                  <span className="docs-nav-num" style={{ marginTop: "0.15rem" }}>3</span>
                  <div>
                    <strong style={{ display: "block", color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>Dual-Write Persistence &amp; LaTeX Export</strong>
                    <span style={{ fontSize: "0.82rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                      Saving writes structured JSON to <code>content/texts/&lt;slug&gt;.json</code> and compilable LaTeX to <code>references/&lt;slug&gt;.tex</code>, immediately rendering the text available across the visual reader and live editor.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Wiktionary & IPA Standards */}
          <section id="section-6" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">6</span>
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
                      <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                        Wiktionary Entry Naming Conventions
                      </h3>
                      <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                        Standard URL and anchor formatting according to official policy
                      </p>
                    </div>
                  </div>
                  {wiktionaryOpen ? <ChevronDown style={{ width: "1rem", height: "1rem" }} /> : <ChevronRight style={{ width: "1rem", height: "1rem" }} />}
                </button>

                {wiktionaryOpen && (
                  <div style={{ border: "1px solid var(--rule)", borderTop: "none", borderRadius: "0 0 0.35rem 0.35rem", padding: "1.25rem", background: "var(--surface)" }}>
                    <p style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: "var(--muted-ink)" }}>
                      Glossy generates external reference links according to official{" "}
                      <a
                        href="https://en.wiktionary.org/wiki/Wiktionary:About_Old_English"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "underline" }}
                      >
                        Wiktionary:About Old English <ExternalLink style={{ width: "0.75rem", height: "0.75rem", display: "inline" }} />
                      </a>{" "}
                      policies:
                    </p>

                    <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Diacritics Stripped in Page Titles</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Vowel macrons (<code>ā, ē, ī, ō, ū, ȳ</code>) and palatal dots (<code>ċ, ġ</code>) are modern editorial additions and are omitted from page titles (e.g. <code>secgan</code>, <code>hlaford</code>).
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Historical Letters Retained</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Ash (<code>æ</code>), thorn (<code>þ</code>), and eth (<code>ð</code>) are standard Latin letters in Wiktionary titles (e.g. <code>cweþan#Old_English</code>).
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Proper Noun Capitalization</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Proper nouns and tribal names are capitalized (<code>Ohthere</code>, <code>Ælfred</code>); common vocabulary is always lowercase.
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Anchor Standard</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Headword links specifically target the <code>#Old_English</code> section anchor to jump past other languages directly to Old English.
                        </p>
                      </div>
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
                      <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                        International Phonetic Alphabet (IPA) Specifications
                      </h3>
                      <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "var(--muted-ink)" }}>
                        Pronunciation guidelines for Old English historical phonology
                      </p>
                    </div>
                  </div>
                  {ipaOpen ? <ChevronDown style={{ width: "1rem", height: "1rem" }} /> : <ChevronRight style={{ width: "1rem", height: "1rem" }} />}
                </button>

                {ipaOpen && (
                  <div style={{ border: "1px solid var(--rule)", borderTop: "none", borderRadius: "0 0 0.35rem 0.35rem", padding: "1.25rem", background: "var(--surface)" }}>
                    <div className="docs-tier-cards-grid" style={{ marginTop: 0 }}>
                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Phonemic Slashes</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Transcriptions use phonemic slashes <code>/.../</code> for citation headwords.
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Triangular Length Colon</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Vowel length is transcribed with the standard IPA triangular length mark <code>ː</code> (<code>U+02D0</code>), not an ASCII colon.
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Primary Stress</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Polysyllabic stress is indicated with the IPA vertical stroke <code>ˈ</code> (<code>U+02C8</code>) preceding the stressed syllable (e.g. <code>/ˈbuː.ɑn/</code>).
                        </p>
                      </div>

                      <div className="docs-tier-card">
                        <strong style={{ fontSize: "0.85rem", color: "var(--ink)" }}>Uninflected Citation</strong>
                        <p style={{ margin: "0.35rem 0 0", fontSize: "0.8rem", color: "var(--muted-ink)" }}>
                          Pronunciations reflect the canonical lemma headword rather than contextual inflected forms.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 7: Local Session Drafts & Dual-Write CMS */}
          <section id="section-7" className="docs-section">
            <div className="docs-section-heading">
              <span className="docs-section-badge">7</span>
              <div>
                <p className="docs-section-eyebrow">Architecture &amp; Storage</p>
                <h2 className="docs-section-h2">Local Session Drafts, Autosave, &amp; Dual-Write CMS Integration</h2>
              </div>
            </div>

            <div className="docs-body">
              <p>
                Glossy provides a robust three-tier data synchronization model to prevent accidental data loss while ensuring seamless Git and LaTeX interoperability:
              </p>

              <div className="docs-tier-cards-grid">
                <div className="docs-tier-card">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="docs-tier-badge" style={{ margin: 0 }}>Tier 1</span>
                      <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--muted-ink)" }}>300ms debounce</span>
                    </div>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                      Browser Local Storage
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      Every edit is automatically saved with a 300ms debounce to <code>localStorage</code> under unique slug keys, protecting work against accidental reloads or closing tabs.
                    </p>
                  </div>
                </div>

                <div className="docs-tier-card">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="docs-tier-badge" style={{ margin: 0 }}>Tier 2</span>
                      <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--muted-ink)" }}>Ctrl+S Hotkey</span>
                    </div>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                      Filesystem Dual-Write
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      Clicking <strong>Save to TinaCMS</strong> or pressing <kbd style={{ padding: "0.1rem 0.35rem", background: "#ece3d3", borderRadius: "0.2rem", border: "1px solid #dfcfb8", fontSize: "0.75rem", fontFamily: "monospace" }}>Ctrl+S</kbd> writes updated <code>.tex</code> to <code>references/</code> and structured JSON to <code>content/texts/</code>.
                    </p>
                  </div>
                </div>

                <div className="docs-tier-card">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span className="docs-tier-badge" style={{ margin: 0 }}>Tier 3</span>
                      <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--muted-ink)" }}>GraphQL Bridge</span>
                    </div>
                    <h4 style={{ margin: "0 0 0.35rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--ink)", fontFamily: "'Charis SIL', Georgia, serif" }}>
                      TinaCMS GraphQL Bridge
                    </h4>
                    <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted-ink)" }}>
                      The updated document is dispatched to TinaCMS GraphQL repository working trees, ensuring instant editorial synchronization and visual authoring fidelity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  </>
  );
}
