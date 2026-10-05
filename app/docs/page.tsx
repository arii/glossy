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
  Compass,
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
    <main className="workspace-shell min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-[#fbf9f4] text-stone-900">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Card */}
        <header className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm mb-8">
          <SiteNav current="docs" slug="ohthere-wulfstan" />
          <div className="mt-4 border-t border-stone-200/80 pt-5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-100/70 border border-amber-300/60 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              Technical Documentation &amp; Linguistic Guide
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Architecture &amp; Linguistic Glossing FAQ
            </h1>
            <p className="text-stone-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
              Complete reference guide to Leipzig interlinear glossing, the 37 original LaTeX abbreviations, canonical Old English lemma standards (adjectives, verbs, nouns, numerals), and dual-write storage architecture.
            </p>
          </div>
        </header>

        {/* Layout with Sticky Table of Contents on Left and Content on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Table of Contents Sidebar */}
          <aside className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
            <div className="bg-white border border-stone-300/80 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <Layers className="w-4 h-4 text-amber-800" />
                  <span>Table of Contents</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                  7 Sections
                </span>
              </div>

              <nav className="mt-3 space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="w-full text-left flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:text-amber-950 hover:bg-amber-50/80 transition-all border border-transparent hover:border-amber-200 group"
                  >
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-stone-100 text-stone-700 font-bold text-[11px] group-hover:bg-amber-800 group-hover:text-white transition-colors shrink-0 mt-0.5">
                      {sec.num}
                    </span>
                    <span className="leading-snug pt-0.5 group-hover:underline">
                      {sec.title}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t border-stone-100 text-[11px] text-stone-500 flex items-center justify-between">
                <span>Glossy v0.1.0 Specification</span>
                <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">gb4e-compliant</span>
              </div>
            </div>

            {/* Quick Spec Card */}
            <div className="bg-gradient-to-br from-amber-50/70 to-stone-50 border border-amber-200/80 rounded-xl p-4 text-xs text-stone-700 shadow-2xs">
              <h4 className="font-bold text-amber-950 flex items-center gap-1.5 mb-1.5">
                <Code2 className="w-3.5 h-3.5 text-amber-800" />
                Quick Canonical Rule
              </h4>
              <p className="leading-relaxed text-stone-600">
                All Old English adjectives default to <strong className="text-stone-900">Masculine Nominative Singular Strong</strong> citation form. Numerals 2 &amp; 3 default to <strong className="text-stone-900">twēgen</strong> and <strong className="text-stone-900">þrīe</strong>.
              </p>
            </div>
          </aside>

          {/* Main Content Flow */}
          <div className="lg:col-span-8 space-y-8">
            {/* Section 1: Beginner's Guide to Interlinear Glossing */}
            <section
              id="section-1"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  1
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Beginner&apos;s Primer
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    How Interlinear Glossing Works
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed space-y-4 text-stone-700">
                <p>
                  An <strong className="text-stone-900 font-semibold">interlinear gloss</strong> is a standard linguistic format that presents original historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly underneath:
                </p>

                {/* Styled 3-Tier Code Block */}
                <div className="p-5 bg-stone-900 text-stone-100 rounded-xl font-mono text-xs space-y-3 overflow-x-auto shadow-inner border border-stone-800">
                  <div className="flex items-center justify-between text-stone-400 border-b border-stone-800 pb-2">
                    <span className="text-amber-400 font-bold uppercase text-[10px] tracking-wider">Three-Tier Interlinear Structure</span>
                    <span className="text-[10px] text-stone-400 font-sans">Leipzig Glossing Rules</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-amber-300 font-bold text-sm">
                    <div>Ōhthere</div>
                    <div>sǣ-d-e</div>
                    <div>his hlāford-e</div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-stone-300 text-xs">
                    <div className="text-stone-400">Ohthere</div>
                    <div className="text-amber-200/90">say-PST-IND3SG</div>
                    <div className="text-amber-200/90">his.GEN lord-DAT.SG</div>
                  </div>
                  <div className="text-stone-300 pt-2 border-t border-stone-800 italic text-xs font-serif">
                    &ldquo;Ohthere said to his lord...&rdquo;
                  </div>
                </div>

                {/* Collapsible Accordion for 37 Abbreviations */}
                <div className="border border-stone-300 rounded-xl overflow-hidden mt-6 bg-[#fffdfa]">
                  <button
                    type="button"
                    onClick={() => setAbbrOpen(!abbrOpen)}
                    className="w-full flex items-center justify-between p-4 bg-stone-50/90 hover:bg-stone-100/80 transition-colors text-left border-b border-stone-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-amber-100/80 text-amber-900 rounded-md">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 font-serif">
                          Complete Reference: 37 Glossing Abbreviations
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          Defined in Section 2 (<em>Glossing abbreviations</em>) of <code className="bg-stone-200/70 text-stone-800 px-1.5 py-0.5 rounded font-mono text-[11px] border border-stone-300/60">references/Voyages_of_Ohthere_Wulfstan.tex</code>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {filteredAbbrs.length} tags
                      </span>
                      {abbrOpen ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
                    </div>
                  </button>

                  {abbrOpen && (
                    <div className="p-4 space-y-3">
                      {/* Filter Controls */}
                      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between pb-3 border-b border-stone-200">
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Filter tags or functions..."
                            value={abbrQuery}
                            onChange={(e) => setAbbrQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-1 focus:ring-amber-800/20"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`text-[11px] px-2 py-1 rounded font-medium transition-all ${
                                selectedCategory === cat
                                  ? "bg-amber-800 text-white font-bold shadow-2xs"
                                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200/70"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Zebra Striped, Sticky Header Table */}
                      <div className="max-h-96 overflow-y-auto border border-stone-200 rounded-lg shadow-2xs">
                        <table className="min-w-full text-xs text-left divide-y divide-stone-200">
                          <thead className="sticky top-0 bg-stone-100 text-stone-800 font-bold uppercase tracking-wider shadow-2xs z-10">
                            <tr>
                              <th className="py-2.5 px-3.5 w-24 border-r border-stone-200">Tag</th>
                              <th className="py-2.5 px-3.5 w-48 border-r border-stone-200">Full Term</th>
                              <th className="py-2.5 px-3.5">Linguistic Function &amp; Example</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {filteredAbbrs.length > 0 ? (
                              filteredAbbrs.map((item, idx) => (
                                <tr
                                  key={item.abbr}
                                  className={`transition-colors hover:bg-amber-50/60 ${
                                    idx % 2 === 0 ? "bg-white" : "bg-stone-50/70"
                                  }`}
                                >
                                  <td className="py-2 px-3.5 font-mono font-bold text-amber-900 border-r border-stone-200">
                                    <span className="bg-amber-100/80 px-1.5 py-0.5 rounded text-[11px] border border-amber-200">
                                      {item.abbr}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3.5 font-semibold text-stone-900 border-r border-stone-200">
                                    {item.name}
                                  </td>
                                  <td className="py-2 px-3.5 text-stone-600 leading-relaxed">
                                    {item.desc}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="py-6 text-center text-stone-500">
                                  No abbreviations match &ldquo;{abbrQuery}&rdquo;
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Canonical Lemma Standards */}
            <section
              id="section-2"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  2
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Linguistic Standards
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Why Adjectives Use Masculine Nominative Singular Strong Form
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed space-y-4 text-stone-700">
                <p>
                  In Old English, every single adjective inflects into over 15 distinct surface endings depending on gender (masculine, feminine, neuter), grammatical case (nominative, accusative, genitive, dative, instrumental), number (singular, plural), and declension (strong vs weak).
                </p>
                <p>
                  For instance, the word for <em>all</em> occurs in the text as <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">eall</code>, <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">ealne</code>, <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">ealles</code>, <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">ealra</code>, <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">eallum</code>, and <code className="font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">ealle</code>. Dictionaries (Bosworth-Toller, Sweet, Clark Hall, Wiktionary) universally choose the <strong className="text-stone-900">Masculine Nominative Singular Strong</strong> form (<code className="font-serif font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">eall</code>) as the single authoritative headword.
                </p>

                <div className="p-4 border border-amber-200/90 bg-amber-50/40 rounded-xl space-y-2">
                  <h4 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    Ja/Jō-stem Adjectives Retaining Base &ldquo;-e&rdquo;
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Certain adjectives historically belong to the <em>ja/jō</em>-stem class and legitimately end in <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 font-bold text-amber-900">-e</code> in their masculine nominative singular strong citation form (e.g. <code className="font-serif font-bold text-stone-900">wēste</code> &ldquo;desert, waste&rdquo;, <code className="font-serif font-bold text-stone-900">blīðe</code> &ldquo;happy&rdquo;, <code className="font-serif font-bold text-stone-900">clǣne</code> &ldquo;clean&rdquo;, <code className="font-serif font-bold text-stone-900">dȳre</code> &ldquo;precious&rdquo;). The engine preserves these base forms without stripping their root vowel.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: The Numeral Challenge */}
            <section
              id="section-3"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  3
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Morphological Edge Cases
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    The Numeral Lemmatization Standard (Masculine Nominative)
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed space-y-4 text-stone-700">
                <p>
                  Lemmatizing Old English numbers requires a clear rule: for numbers that don&apos;t have a singular form (e.g. 2, 3) or numbers above 1, we strictly cite the <strong className="text-stone-900">Masculine Nominative</strong> form:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-stone-200 bg-stone-50/70 rounded-xl shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      Plural Nominals
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">1 vs. 2 &amp; 3 (Inherent Plurals)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">1 (ān)</code> declines with a masculine nominative singular form. However, <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">2 (twēgen/twā)</code> and <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">3 (þrīe/þrēo)</code> are inherently plural. Their canonical citation headwords are strictly the <strong className="text-stone-900">Masculine Nominative</strong> forms: <code className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">twēgen</code> and <code className="font-mono font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">þrīe</code>.
                    </p>
                  </div>

                  <div className="p-4 border border-stone-200 bg-stone-50/70 rounded-xl shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      Cardinals
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">4 to 19 (Indeclinable Cardinals)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Numbers from <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">4 (fēower)</code> to <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">19</code> are largely indeclinable when modifying nouns and do not have distinct gender forms. Their citation headword is simply the base cardinal stem (<code className="font-mono text-amber-900">fīf</code>, <code className="font-mono text-amber-900">siex</code>, <code className="font-mono text-amber-900">eahta</code>, <code className="font-mono text-amber-900">tīen</code>).
                    </p>
                  </div>

                  <div className="p-4 border border-stone-200 bg-stone-50/70 rounded-xl md:col-span-2 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      Quantifiers
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm">Decades &amp; Hundreds (Noun Quantifiers)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Decades and hundreds like <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">twēntig (20)</code>, <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">syxtig (60)</code>, and <code className="font-mono font-bold text-stone-900 bg-white px-1.5 py-0.5 rounded border border-stone-200">hundtēontiġ (100)</code> behave grammatically as neuter nouns that govern a dependent genitive plural (e.g. <em>syxtig hrāna</em> = &ldquo;sixty of reindeers&rdquo;). Their dictionary headwords are the base cardinal noun forms.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Verification Suite */}
            <section
              id="section-4"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  4
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Quality Assurance
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Automated Quality Verification Suite
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-stone-700 space-y-3">
                <p>
                  Glossy maintains automated verification scripts to ensure 100% data integrity between raw LaTeX manuscripts, structured JSON content, and dictionary headwords:
                </p>

                <div className="overflow-x-auto border border-stone-200 rounded-xl shadow-2xs">
                  <table className="min-w-full text-xs text-left divide-y divide-stone-200">
                    <thead className="bg-stone-100 font-bold text-stone-800 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3.5 border-r border-stone-200 w-44">Tool / Script</th>
                        <th className="py-2.5 px-3.5 border-r border-stone-200 w-56">Terminal Command</th>
                        <th className="py-2.5 px-3.5">Function &amp; Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      <tr className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">Lemma Accuracy Audit</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">node scripts/validate-lemmas.mjs</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Audits all tokens verifying 100% compliance across verbs, nouns, adjectives, determiners, and numerals.</td>
                      </tr>
                      <tr className="bg-stone-50/60 hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">Source Alignment Validator</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">npm run validate:source</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Validates 100% token and gloss alignment across all sentences with zero warnings.</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">Dictionary Sync</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">npm run sync:dictionary</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Generates clean, normalized dictionary files in <code className="font-mono text-[11px] bg-stone-100 px-1 rounded">content/dictionary/</code>.</td>
                      </tr>
                      <tr className="bg-stone-50/60 hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">Content Pre-compiler</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">npm run compile:content</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Pre-compiles master TeX source into <code className="font-mono text-[11px] bg-stone-100 px-1 rounded">content/texts/ohthere.json</code>.</td>
                      </tr>
                      <tr className="hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">Dead Code Audit</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">npm run audit:deadcode</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Automated Knip analysis verifying zero dead code or unlisted dependencies.</td>
                      </tr>
                      <tr className="bg-stone-50/60 hover:bg-amber-50/40">
                        <td className="py-2.5 px-3.5 font-semibold text-stone-900 border-r border-stone-200">TypeScript Typecheck</td>
                        <td className="py-2.5 px-3.5 font-mono text-amber-900 border-r border-stone-200">
                          <code className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200 text-[11px]">npm run typecheck</code>
                        </td>
                        <td className="py-2.5 px-3.5 text-stone-600">Strict type safety validation across the entire application codebase.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 5: Corpus Ingestion & Custom Texts */}
            <section
              id="section-5"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  5
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Corpus Expansion
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Ingesting &amp; Glossing New Texts (Beowulf, Cædmon, Custom OE)
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-stone-700 space-y-4">
                <p>
                  Glossy allows scholars and learners to add any Old English text to the digital corpus at <code className="font-mono text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">/edit/new</code>.
                  When new sentences are pasted (or loaded via classic presets like <em>Beowulf: Prologue</em>, <em>Cædmon&apos;s Hymn</em>, or <em>The Wanderer</em>):
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="w-6 h-6 rounded bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <strong className="text-stone-900 block font-serif">Automatic Tokenization &amp; Compound Splitting</strong>
                      <span className="text-xs text-stone-600 leading-relaxed">
                        Punctuation is cleanly isolated and bound morphemes (hyphenated compound terms like <code className="font-mono bg-white px-1 rounded border border-stone-200">ġeār-dag-um</code>) are systematically segmented into glossable lexical units.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="w-6 h-6 rounded bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <strong className="text-stone-900 block font-serif">Contextual Lemmatization Engine</strong>
                      <span className="text-xs text-stone-600 leading-relaxed">
                        Every token is evaluated through the Old English linguistic engine, assigning canonical masculine nominative singular strong adjective lemmas, infinitive verb lemmas, nominative noun lemmas, and direct Wiktionary etymological links.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="w-6 h-6 rounded bg-amber-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <strong className="text-stone-900 block font-serif">Dual-Write Persistence &amp; LaTeX Export</strong>
                      <span className="text-xs text-stone-600 leading-relaxed">
                        Saving writes structured JSON to <code className="font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-800 text-[11px] border border-stone-300">content/texts/&lt;slug&gt;.json</code> and compilable LaTeX to <code className="font-mono bg-stone-200/80 px-1.5 py-0.5 rounded text-stone-800 text-[11px] border border-stone-300">references/&lt;slug&gt;.tex</code>, immediately rendering the text available across the visual reader and live editor.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Official Wiktionary & IPA Standards */}
            <section
              id="section-6"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  6
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Lexicographic Standards
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Official Wiktionary &amp; IPA Formatting Standards
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-stone-700 space-y-4">
                {/* Collapsible Accordion 1: Wiktionary Conventions */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-[#fffdfa]">
                  <button
                    type="button"
                    onClick={() => setWiktionaryOpen(!wiktionaryOpen)}
                    className="w-full flex items-center justify-between p-4 bg-stone-50/90 hover:bg-stone-100/80 transition-colors text-left border-b border-stone-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-amber-100/80 text-amber-900 rounded-md">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 font-serif">
                          Wiktionary Entry Naming Conventions
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          Standard URL and anchor formatting according to official policy
                        </p>
                      </div>
                    </div>
                    {wiktionaryOpen ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
                  </button>

                  {wiktionaryOpen && (
                    <div className="p-4 space-y-3 text-xs leading-relaxed text-stone-700 bg-white">
                      <p className="text-stone-600">
                        Glossy generates external reference links according to official{" "}
                        <a
                          href="https://en.wiktionary.org/wiki/Wiktionary:About_Old_English"
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-900 font-semibold underline inline-flex items-center gap-1 hover:text-amber-950"
                        >
                          Wiktionary:About Old English <ExternalLink className="w-3 h-3" />
                        </a>{" "}
                        policies:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Diacritics Stripped in Page Titles</strong>
                          <p className="text-stone-600 text-[11px]">
                            Vowel macrons (<code className="font-mono bg-white px-1 rounded border border-stone-200">ā, ē, ī, ō, ū, ȳ</code>) and palatal dots (<code className="font-mono bg-white px-1 rounded border border-stone-200">ċ, ġ</code>) are modern editorial additions and are omitted from page titles (e.g. <code className="font-mono text-amber-900">secgan</code>, <code className="font-mono text-amber-900">hlaford</code>).
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Historical Letters Retained</strong>
                          <p className="text-stone-600 text-[11px]">
                            Ash (<code className="font-mono bg-white px-1 rounded border border-stone-200">æ</code>), thorn (<code className="font-mono bg-white px-1 rounded border border-stone-200">þ</code>), and eth (<code className="font-mono bg-white px-1 rounded border border-stone-200">ð</code>) are standard Latin letters in Wiktionary titles (e.g. <code className="font-mono text-amber-900">cweþan#Old_English</code>).
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Proper Noun Capitalization</strong>
                          <p className="text-stone-600 text-[11px]">
                            Proper nouns and tribal names are capitalized (<code className="font-mono text-stone-800">Ohthere</code>, <code className="font-mono text-stone-800">Ælfred</code>); common vocabulary is always lowercase.
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Anchor Standard</strong>
                          <p className="text-stone-600 text-[11px]">
                            Headword links specifically target the <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-amber-900 font-bold">#Old_English</code> section anchor to jump past other languages.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Accordion 2: IPA Specifications */}
                <div className="border border-stone-300 rounded-xl overflow-hidden bg-[#fffdfa]">
                  <button
                    type="button"
                    onClick={() => setIpaOpen(!ipaOpen)}
                    className="w-full flex items-center justify-between p-4 bg-stone-50/90 hover:bg-stone-100/80 transition-colors text-left border-b border-stone-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-amber-100/80 text-amber-900 rounded-md">
                        <Terminal className="w-4 h-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 font-serif">
                          International Phonetic Alphabet (IPA) Specifications
                        </h3>
                        <p className="text-xs text-stone-500 font-sans mt-0.5">
                          Pronunciation guidelines for Old English historical phonology
                        </p>
                      </div>
                    </div>
                    {ipaOpen ? <ChevronDown className="w-4 h-4 text-stone-500" /> : <ChevronRight className="w-4 h-4 text-stone-500" />}
                  </button>

                  {ipaOpen && (
                    <div className="p-4 space-y-3 text-xs leading-relaxed text-stone-700 bg-white">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Phonemic Slashes</strong>
                          <p className="text-stone-600 text-[11px]">
                            Transcriptions use phonemic slashes <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-amber-900 font-bold">/.../</code> for citation headwords.
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Triangular Length Colon</strong>
                          <p className="text-stone-600 text-[11px]">
                            Vowel length is transcribed with the standard IPA triangular length mark <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-amber-900 font-bold">ː</code> (<code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded border border-stone-200 text-stone-700">U+02D0</code>), not an ASCII colon (<code className="font-mono">:</code>).
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Primary Stress</strong>
                          <p className="text-stone-600 text-[11px]">
                            Polysyllabic stress is indicated with the IPA vertical stroke <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200 text-amber-900 font-bold">ˈ</code> (<code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded border border-stone-200 text-stone-700">U+02C8</code>) preceding the stressed syllable (e.g. <code className="font-mono text-amber-900">/ˈbuː.ɑn/</code>).
                          </p>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                          <strong className="text-stone-900 block font-semibold text-xs">Uninflected Citation</strong>
                          <p className="text-stone-600 text-[11px]">
                            Pronunciations reflect the canonical lemma headword rather than contextual inflected forms.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 7: Local Session, Autosave, & Dual-Write CMS */}
            <section
              id="section-7"
              className="bg-white border border-stone-300/80 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 scroll-mt-8"
            >
              <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
                <span className="w-8 h-8 rounded-lg bg-amber-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                  7
                </span>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                    Architecture &amp; Storage
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
                    Local Session Drafts, Autosave, &amp; Dual-Write CMS Integration
                  </h2>
                </div>
              </div>

              <div className="text-sm leading-relaxed text-stone-700 space-y-4">
                <p>
                  Glossy provides a robust three-tier data synchronization model to prevent accidental data loss while ensuring seamless Git and LaTeX interoperability:
                </p>

                {/* Differentiated Tiers Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mt-3">
                  <div className="p-5 border border-stone-300 rounded-xl bg-stone-50/80 shadow-2xs relative flex flex-col justify-between hover:border-amber-400 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                          Tier 1
                        </span>
                        <span className="text-[10px] text-stone-600 font-mono">300ms debounce</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm font-serif mb-1.5">
                        Browser Local Storage
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Every edit is automatically saved with a 300ms debounce to <code className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-800">localStorage</code> under unique slug keys, protecting work against accidental reloads or closing tabs.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 border border-stone-300 rounded-xl bg-stone-50/80 shadow-2xs relative flex flex-col justify-between hover:border-amber-400 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                          Tier 2
                        </span>
                        <span className="text-[10px] text-stone-600 font-mono">Ctrl+S Hotkey</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm font-serif mb-1.5">
                        Filesystem Dual-Write
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Clicking <strong className="text-stone-900">Save to TinaCMS</strong> or pressing <kbd className="px-1.5 py-0.5 bg-stone-200 text-stone-800 rounded text-[10px] font-mono border border-stone-300 font-bold">Ctrl+S</kbd> writes updated <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-stone-200">.tex</code> to <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-stone-200">references/</code> and structured JSON to <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-stone-200">content/texts/</code>.
                      </p>
                    </div>
                  </div>

                  <div className="p-5 border border-stone-300 rounded-xl bg-stone-50/80 shadow-2xs relative flex flex-col justify-between hover:border-amber-400 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                          Tier 3
                        </span>
                        <span className="text-[10px] text-stone-600 font-mono">GraphQL Bridge</span>
                      </div>
                      <h4 className="font-bold text-stone-900 text-sm font-serif mb-1.5">
                        TinaCMS GraphQL Bridge
                      </h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        The updated document is dispatched to TinaCMS GraphQL repository working trees, ensuring instant editorial synchronization and visual authoring fidelity.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
