import { SiteNav } from "../../components/site-nav";
import { CheckCircle2, BookOpen, HelpCircle, Hash } from "lucide-react";

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
              Technical Documentation &amp; Learning Guide
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-1">
              Architecture &amp; Linguistic Glossing FAQ
            </h1>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              Complete guide to interlinear glossing, Old English grammatical tags, canonical lemma standards (adjectives, verbs, nouns, numerals), and LaTeX parsing.
            </p>
          </div>
        </header>

        {/* Section 1: Beginner's Guide to Interlinear Glossing */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Beginner&apos;s Primer</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                1. How Interlinear Glossing Works
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <p>
              An <strong>interlinear gloss</strong> is a standard linguistic format that presents original historical text with word-by-word and morpheme-by-morpheme grammatical breakdowns aligned directly underneath:
            </p>

            <div className="p-4 bg-stone-900 text-stone-100 rounded-lg font-mono text-xs space-y-2 overflow-x-auto not-prose">
              <div className="text-stone-400">Three-Tier Interlinear Structure</div>
              <div className="grid grid-cols-3 gap-4 text-amber-300 font-bold">
                <div>Ōhthere</div>
                <div>sǣ-d-e</div>
                <div>his hlāford-e</div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-stone-300">
                <div>Ohthere</div>
                <div>say-PST-IND3SG</div>
                <div>his.GEN lord-DAT.SG</div>
              </div>
              <div className="text-stone-400 pt-2 border-t border-stone-700">
                &ldquo;Ohthere said to his lord...&rdquo;
              </div>
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 mt-6">Decoding Leipzig Grammatical Abbreviations</h3>
            <div className="overflow-x-auto not-prose">
              <table className="min-w-full text-xs text-left divide-y divide-stone-200 border border-stone-200 rounded-lg">
                <thead className="bg-stone-50 font-bold text-stone-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Tag</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Meaning &amp; Sentence Role</th>
                    <th className="py-2.5 px-3">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">NOM</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Nominative</td>
                    <td className="py-2 px-3 text-stone-600">The subject doing the action</td>
                    <td className="py-2 px-3 font-mono text-stone-800"><em>Ōhthere</em> sǣde</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">ACC</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Accusative</td>
                    <td className="py-2 px-3 text-stone-600">The direct object receiving the action</td>
                    <td className="py-2 px-3 font-mono text-stone-800">hē hæfde <em>dēor</em></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">GEN</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Genitive</td>
                    <td className="py-2 px-3 text-stone-600">Possession or partitive (&ldquo;of&rdquo;)</td>
                    <td className="py-2 px-3 font-mono text-stone-800"><em>ealra</em> Norþmonna</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">DAT</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Dative</td>
                    <td className="py-2 px-3 text-stone-600">Indirect object (&ldquo;to/for&rdquo;) or prepositional object</td>
                    <td className="py-2 px-3 font-mono text-stone-800">to his <em>hlāforde</em></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">STR</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Strong Declension</td>
                    <td className="py-2 px-3 text-stone-600">Indefinite adjective (used alone without demonstrative)</td>
                    <td className="py-2 px-3 font-mono text-stone-800"><em>micel</em> scip</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">WK</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Weak Declension</td>
                    <td className="py-2 px-3 text-stone-600">Definite adjective (used following &ldquo;the/this/his&rdquo;)</td>
                    <td className="py-2 px-3 font-mono text-stone-800">se <em>micla</em> mann</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">PST</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Past (Preterite)</td>
                    <td className="py-2 px-3 text-stone-600">Action completed in the past</td>
                    <td className="py-2 px-3 font-mono text-stone-800"><em>fōr</em> (went)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">PRS</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Present Tense</td>
                    <td className="py-2 px-3 text-stone-600">Action occurring in the present</td>
                    <td className="py-2 px-3 font-mono text-stone-800"><em>is</em> (is)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono font-bold text-amber-900">IND / SJV</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">Indicative / Subjunctive</td>
                    <td className="py-2 px-3 text-stone-600">Factual statement vs. hypothetical/reported speech</td>
                    <td className="py-2 px-3 font-mono text-stone-800">sǣde vs. wǣre</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 2: Canonical Lemma Standards */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Linguistic Standards</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                2. Why Adjectives Use Masculine Nominative Singular Strong Form
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <p>
              In Old English, every single adjective inflects into over 15 distinct surface endings depending on gender (masculine, feminine, neuter), grammatical case (nominative, accusative, genitive, dative, instrumental), number (singular, plural), and declension (strong vs weak).
            </p>
            <p>
              For instance, the word for <em>all</em> occurs in the text as <code className="font-mono">eall</code>, <code className="font-mono">ealne</code>, <code className="font-mono">ealles</code>, <code className="font-mono">ealra</code>, <code className="font-mono">eallum</code>, and <code className="font-mono">ealle</code>. Dictionaries (Bosworth-Toller, Sweet, Clark Hall, Wiktionary) universally choose the <strong>Masculine Nominative Singular Strong</strong> form (<code className="font-serif font-bold">eall</code>) as the single authoritative headword.
            </p>

            <div className="p-4 border border-stone-200 bg-stone-50 rounded-lg space-y-2">
              <h4 className="font-bold text-stone-900 text-sm">Ja/Jō-stem Adjectives Retaining Base &ldquo;-e&rdquo;</h4>
              <p className="text-xs text-stone-600">
                Certain adjectives historically belong to the <em>ja/jō</em>-stem class and legitimately end in <code className="font-mono">-e</code> in their masculine nominative singular strong citation form (e.g. <code className="font-serif font-bold">wēste</code> &ldquo;desert, waste&rdquo;, <code className="font-serif font-bold">blīðe</code> &ldquo;happy&rdquo;, <code className="font-serif font-bold">clǣne</code> &ldquo;clean&rdquo;, <code className="font-serif font-bold">dȳre</code> &ldquo;precious&rdquo;). The engine preserves these base forms without stripping their root vowel.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: The Numeral Challenge */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Morphological Edge Cases</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                3. The Numeral Lemmatization Challenge
              </h2>
            </div>
          </div>

          <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4 text-stone-700">
            <p>
              Lemmatizing Old English numbers is notoriously challenging because different numerals follow completely different grammatical paradigms:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="p-4 border border-stone-200 bg-stone-50 rounded-lg">
                <h4 className="font-bold text-stone-900 text-sm mb-1">1 vs. 2 &amp; 3 (Inherent Plurals)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  <code className="font-mono font-bold text-stone-900">1 (ān)</code> declines like a normal adjective with a singular masculine form. However, <code className="font-mono font-bold text-stone-900">2 (twēgen/twā)</code> and <code className="font-mono font-bold text-stone-900">3 (þrīe/þrēo)</code> are <strong>inherently plural</strong> in meaning and lack singular forms entirely. Their canonical citation headwords are therefore cited in the plural (<code className="font-mono">twēgen</code>, <code className="font-mono">þrīe</code>).
                </p>
              </div>

              <div className="p-4 border border-stone-200 bg-stone-50 rounded-lg">
                <h4 className="font-bold text-stone-900 text-sm mb-1">4 to 19 (Indeclinable Cardinals)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Numbers from <code className="font-mono font-bold text-stone-900">4 (fēower)</code> to <code className="font-mono font-bold text-stone-900">19</code> are largely <strong>indeclinable</strong> when modifying nouns and do not have distinct masculine, feminine, or neuter forms. Their citation headword is simply the base cardinal stem (<code className="font-mono">fīf</code>, <code className="font-mono">siex</code>, <code className="font-mono">eahta</code>, <code className="font-mono">tīen</code>).
                </p>
              </div>

              <div className="p-4 border border-stone-200 bg-stone-50 rounded-lg md:col-span-2">
                <h4 className="font-bold text-stone-900 text-sm mb-1">Decades &amp; Hundreds (Noun Quantifiers)</h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Decades and hundreds like <code className="font-mono font-bold text-stone-900">twēntig (20)</code>, <code className="font-mono font-bold text-stone-900">syxtig (60)</code>, and <code className="font-mono font-bold text-stone-900">hundtēontiġ (100)</code> behave grammatically as neuter nouns that govern a dependent genitive plural (e.g. <em>syxtig hrāna</em> = &ldquo;sixty of reindeers&rdquo;). Their dictionary headwords are the base cardinal noun forms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Verification Suite */}
        <section className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="p-2 bg-amber-50 text-amber-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Quality Assurance</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900">
                4. Automated Quality Verification Suite
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
                    <th className="py-2.5 px-3">Function &amp; Verification Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Lemma Accuracy Audit</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">node scripts/validate-lemmas.mjs</td>
                    <td className="py-2.5 px-3 text-stone-600">Runs heuristic checks on lemma shapes and Wiktionary URL formatting. This is not a scholarly accuracy audit and is not currently wired to an npm script.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Source Alignment Validator</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run validate:source</td>
                    <td className="py-2.5 px-3 text-stone-600">Checks parsed examples for words/translations and source surface/gloss alignment for text records. Parser warnings may be reported; this does not verify linguistic correctness.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Dictionary Sync</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run sync:dictionary</td>
                    <td className="py-2.5 px-3 text-stone-600">Regenerates dictionary JSON in content/dictionary/ from the curated lexicon list.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">Content Pre-compiler</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run compile:content</td>
                    <td className="py-2.5 px-3 text-stone-600">Regenerates content/texts/ohthere.json from the supplied TeX source, including exported texSource.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-stone-900">TypeScript Typecheck</td>
                    <td className="py-2.5 px-3 font-mono text-amber-900">npm run typecheck</td>
                    <td className="py-2.5 px-3 text-stone-600">Type safety validation across the entire application codebase.</td>
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
