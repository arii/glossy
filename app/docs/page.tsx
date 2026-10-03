import Link from "next/link";
import { SiteNav } from "../../components/site-nav";
import { Code, Database, Layers, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Architecture & FAQ | Glossy",
  description: "Technical architecture, LaTeX parsing methodology, and linguistic data model FAQ for Glossy.",
};

export default function DocsPage() {
  return (
    <main className="workspace-shell min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-stone-50 text-stone-900">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <header className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
          <SiteNav current="docs" slug="ohthere-wulfstan" />
          <div className="mt-4 border-t border-stone-100 pt-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Technical Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-1">
              Architecture & Linguistic Data Model FAQ
            </h1>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              Detailed technical reference for the LaTeX <code className="bg-stone-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">gb4e</code> parsing pipeline, data schemas, lemma extraction, and editorial verification tools.
            </p>
          </div>
        </header>

        {/* Section 1: Parsing & Data Model */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Section 1</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                1. LaTeX Document Parsing & Data Model
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <h3 className="text-lg font-serif font-bold text-stone-900">How the Master .tex File is Parsed</h3>
            <p>
              The source text (<code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-xs">references/Voyages_of_Ohthere_Wulfstan.tex</code>) is authored using standard LaTeX linguistics conventions via the <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-xs">gb4e</code> package. The parsing engine in <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-xs">lib/content.ts</code> and <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono text-xs">app/api/master-tex/route.ts</code> processes the text through four deterministic stages:
            </p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Preamble Metadata Extraction:</strong> Extracts document title (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"\\title"}</code>), author (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"\\author"}</code>), and date (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"\\date"}</code>).
              </li>
              <li>
                <strong>gb4e Block Identification:</strong> Identifies each interlinear block matching <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"\\ex{\\gll Line1 \\\\ Line2 \\\\ \\glt Translation}"}</code>.
              </li>
              <li>
                <strong>Balanced Footnote & Macro Cleaning (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">stripLatexFootnotes</code>):</strong> Uses a brace-depth counter (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"{"}</code> and <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">{"}"}</code>) to safely extract and strip inline LaTeX footnotes without truncating sentences when nested formatting commands occur.
              </li>
              <li>
                <strong>Token Alignment & Morpheme Segmentation:</strong> Surface words and Leipzig gloss tags are split on whitespace and aligned 1-to-1 by array index. Hyphenated words (e.g. <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">sǣ-d-e</code>) are broken down into sub-morpheme units (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">sǣ</code> &rarr; <em>say</em>, <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">d</code> &rarr; <em>PST</em>, <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">e</code> &rarr; <em>IND3SG</em>).
              </li>
            </ol>

            <h3 className="text-lg font-serif font-bold text-stone-900 mt-6">Core TypeScript Data Model</h3>
            <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
{`interface GlossDocument {
  title: string;
  author: string;
  date: string;
  sentences: Sentence[];
}

interface Sentence {
  id: string;
  tokens: Token[];
  freeTranslation: string;
}

interface Token {
  id: string;
  sourceForm: string;        // e.g. "sǣ-d-e."
  sourceGloss: string;       // e.g. "say-PST-IND3SG"
  literalTexGloss: string;   // e.g. "say-\\textsc{pst}-\\textsc{ind.3sg}"
  lemma: string;             // e.g. "secgan"
  pos: string;               // e.g. "verb"
  explanation: string;       // English gloss definition
  inflections: {
    case?: "nominative" | "accusative" | "genitive" | "dative";
    number?: "singular" | "plural";
    gender?: "masculine" | "feminine" | "neuter";
    tense?: "present" | "past";
    mood?: "indicative" | "subjunctive" | "imperative" | "infinitive";
    person?: "1" | "2" | "3";
  };
  morphemes: Morpheme[];
  ipa: string;
  wiktionaryUrl: string;
}

interface Morpheme {
  id: string;
  morpheme: string;
  gloss: string;
}`}
            </pre>
          </div>
        </section>

        {/* Section 2: Reusability */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Section 2</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                2. Reusing the Pipeline for New Documents
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <p>
              The architecture is structured to support ingestion and generation of any new linguistic corpus:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose">
              <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                <h4 className="font-bold text-stone-900 text-sm mb-1">A. Master File Ingestion</h4>
                <p className="text-xs text-stone-600">
                  Place any valid LaTeX <code className="font-mono">.tex</code> file using <code className="font-mono">gb4e</code> into the <code className="font-mono">references/</code> directory. The route <code className="font-mono">/api/master-tex</code> automatically ingests and serves the full structured document.
                </p>
              </div>
              <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                <h4 className="font-bold text-stone-900 text-sm mb-1">B. Batch Paste Pipeline</h4>
                <p className="text-xs text-stone-600">
                  Paste raw LaTeX <code className="font-mono">\ex</code> blocks directly into the <strong>Batch Import Pipeline</strong> at the bottom of the editor workspace to parse, preview, and append new sentences on the fly.
                </p>
              </div>
              <div className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                <h4 className="font-bold text-stone-900 text-sm mb-1">C. Bidirectional LaTeX Export</h4>
                <p className="text-xs text-stone-600">
                  The <code className="font-mono">exportToGb4eLatex</code> generator takes the edited JSON document state and outputs a clean, publishable LaTeX document with complete glosses and translations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3 & 4: Lemmas & Wiktionary Links */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Section 3 & 4</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                3. Lemma Extraction & Wiktionary Resolution
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <h3 className="text-lg font-serif font-bold text-stone-900">Where Lemmas Come From</h3>
            <p>
              Because the raw LaTeX source provides surface tokens and grammatical glosses but does not explicitly declare dictionary headwords, the system resolves lemmas through a 3-tier hierarchy:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Curated Lexicon:</strong> Lookups against the dictionary dataset (<code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">data/ohthere.ts</code> / <code className="bg-stone-100 px-1 py-0.5 rounded font-mono text-xs">data/dictionary.json</code>) compiled from Bosworth-Toller and Wiktionary.</li>
              <li><strong>Heuristic Stem Fallback:</strong> For unindexed vocabulary, the system strips inflectional endings and boundary hyphens to deduce the root stem.</li>
              <li><strong>Visual Inspector:</strong> Editors can override the lemma, part of speech, and gloss directly in the <Link href="/edit/ohthere-wulfstan" className="text-amber-800 underline font-semibold">Editing Workspace</Link>.</li>
            </ul>

            <h3 className="text-lg font-serif font-bold text-stone-900 mt-6">Why <code className="text-amber-900 font-mono">sǣ-d-e</code> pointed to <code className="text-amber-900 font-mono">sægan</code></h3>
            <div className="p-4 border border-amber-200 bg-amber-50/40 rounded-lg space-y-2">
              <p className="text-xs text-amber-950 font-semibold">
                Linguistic Explanation & Resolution:
              </p>
              <p className="text-xs text-stone-700">
                In Old English, <code className="font-serif font-bold">sǣde</code> is the 3rd person singular past indicative of the Class 3 weak verb <strong className="font-serif">secgan</strong> (<em>to say</em>).
              </p>
              <p className="text-xs text-stone-700">
                An early heuristic stem parser stripped the suffix <code className="font-mono">-d-e</code> and naively constructed an unverified infinitive <code className="font-mono">*sǣgan</code>. The correct canonical dictionary headword is <strong>secgan</strong>, with the official Wiktionary entry at:
              </p>
              <p className="text-xs font-mono bg-white p-2 border border-amber-200 rounded">
                <a href="https://en.wiktionary.org/wiki/secgan#Old_English" target="_blank" rel="noreferrer" className="text-amber-800 hover:underline">
                  https://en.wiktionary.org/wiki/secgan#Old_English
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Verification & Tooling */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Section 5</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                4. Tools for Verifying Accuracy & Correctness
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed text-stone-700">
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left divide-y divide-stone-200 border border-stone-200 rounded-lg">
                <thead className="bg-stone-50 font-bold text-stone-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Tool / Script</th>
                    <th className="py-2.5 px-3">Command</th>
                    <th className="py-2.5 px-3">Function & Verification Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Source Validator</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run validate:source</td>
                    <td className="py-2.5 px-3 text-stone-600">Ensures 1:1 token alignment between surface words and gloss lines, verifies Leipzig tags, and checks for non-empty translations.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Smoke Test Suite</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run test:smoke</td>
                    <td className="py-2.5 px-3 text-stone-600">Verifies that all reader routes, editor routes, and document previews render without truncated translations or missing tokens.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">TypeScript Typecheck</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run typecheck</td>
                    <td className="py-2.5 px-3 text-stone-600">Enforces schema validation across all UI components and database operations.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Visual Token Inspector</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">/edit/ohthere-wulfstan</td>
                    <td className="py-2.5 px-3 text-stone-600">Interactive live inspector allowing linguists to audit lemmas, IPA transcriptions, and Wiktionary URLs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
