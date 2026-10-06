"use client";

import Link from "next/link";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { PageHeader } from "../../components/page-header";
import { ExternalLink, BookOpen, Edit3, Code2 } from "lucide-react";
import aboutData from "../../content/pages/about.json";
import { useTina, tinaField } from "tinacms/dist/react";

const ABOUT_PAGE_QUERY = `
  query AboutPageQuery($relativePath: String!) {
    aboutPage(relativePath: $relativePath) {
      title
      eyebrow
      heading
      description
      missionTitle
      missionText
      missionText2
      capabilitiesTitle
      capabilities {
        title
        description
      }
      maintainersTitle
      maintainerAriel
      maintainerTyler
      maintainerLicense
      architectureTitle
      architectureItems
    }
  }
`;

const INITIAL_ABOUT_DATA = { aboutPage: aboutData };
const ABOUT_PAGE_VARS = { relativePath: "about.json" };

export default function AboutPage() {
  const { data: pageData } = useTina({
    query: ABOUT_PAGE_QUERY,
    variables: ABOUT_PAGE_VARS,
    data: INITIAL_ABOUT_DATA,
  });

  const page = pageData?.aboutPage || aboutData;
  const capabilities = (page.capabilities as Array<{
    title: string;
    description: string;
  }>) || aboutData.capabilities || [];
  const architectureItems = (page.architectureItems as string[]) || aboutData.architectureItems || [];

  const capabilityIcons = [BookOpen, Edit3, Code2];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <SiteNav />

      {/* Standardized Page Header outside the card on the parchment canvas */}
      <PageHeader
        containerClassName="max-w-3xl"
        eyebrow={page.eyebrow || "About the Project"}
        eyebrowProps={{ "data-tina-field": tinaField(page, "eyebrow") }}
        title={page.heading || "Glossy · Digital Interlinear Philology"}
        titleProps={{ "data-tina-field": tinaField(page, "heading") }}
        metadata={page.description || "An open-access digital humanities platform dedicated to historical linguistic annotation, standardized Leipzig interlinear glossing, and accessible manuscript reading."}
        metadataProps={{ "data-tina-field": tinaField(page, "description") }}
      />

      {/* Standardized Reading Container: max-w-3xl mx-auto px-6 mb-16 */}
      <main className="w-full max-w-3xl mx-auto px-6 mb-16 flex-1">
        <article className="bg-white rounded-lg border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5 p-8 md:p-12">
          <div className="space-y-12">
            {/* Section: The Mission */}
            <section>
              <h2
                data-tina-field={tinaField(page, "missionTitle")}
                className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4"
              >
                {page.missionTitle || "The Mission"}
              </h2>
              <p
                data-tina-field={tinaField(page, "missionText")}
                className="font-serif text-stone-700 leading-relaxed text-base mb-4"
              >
                {page.missionText || "Reading and analyzing historical languages like Old English requires balancing multiple layers of linguistic information: original orthography, morphological segmentation, grammatical case and verbal agreement, canonical dictionary headwords, and overarching narrative sense."}
              </p>
              <p
                data-tina-field={tinaField(page, "missionText2")}
                className="font-serif text-stone-700 leading-relaxed text-base m-0"
              >
                {page.missionText2 || "Glossy brings these layers together in an intuitive, browser-based environment. Whether you are an undergraduate encountering Anglo-Saxon verse for the first time, a researcher compiling linguistic examples for publication, or a digital editor transcribing a manuscript witness, Glossy provides the precision tools needed for rigorous interlinear work."}
              </p>
            </section>

            {/* Section: Key Capabilities */}
            <section>
              <h2
                data-tina-field={tinaField(page, "capabilitiesTitle")}
                className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4"
              >
                {page.capabilitiesTitle || "Key Capabilities"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {capabilities.map((cap, idx) => {
                  const IconComponent = capabilityIcons[idx % capabilityIcons.length];
                  return (
                    <div
                      key={idx}
                      data-tina-field={tinaField(cap)}
                      className="bg-white rounded-lg border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4 text-amber-900 shrink-0" />
                          <h3
                            data-tina-field={tinaField(cap, "title")}
                            className="font-mono text-xs font-semibold tracking-wider uppercase text-stone-800 m-0"
                          >
                            {cap.title}
                          </h3>
                        </div>
                        <p
                          data-tina-field={tinaField(cap, "description")}
                          className="font-sans text-xs text-stone-600 leading-relaxed m-0"
                        >
                          {cap.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section: Maintainers & Open Source */}
            <section>
              <h2
                data-tina-field={tinaField(page, "maintainersTitle")}
                className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4"
              >
                {page.maintainersTitle || "Maintainers & Open Source"}
              </h2>
              <p
                data-tina-field={tinaField(page, "maintainerAriel")}
                className="font-serif text-stone-700 leading-relaxed text-base mb-4"
              >
                {page.maintainerAriel || "Glossy was created and engineered by Ariel Anders (Ariel Anders Consulting), who architected the platform, the interactive Leipzig interlinear engine, the offline-first local workspace, and the automated verification suite."}
              </p>
              <p
                data-tina-field={tinaField(page, "maintainerTyler")}
                className="font-serif text-stone-700 leading-relaxed text-base mb-4"
              >
                {page.maintainerTyler || (
                  <>
                    Tyler Lemon served as the linguistic subject matter expert, meticulously glossing all texts in the canonical corpus, standardizing Old English lemmatization (including masculine nominative standards and strong adjective conventions), and ensuring philological fidelity to historical manuscript witnesses. Learn more at{" "}
                    <a
                      href="https://sites.google.com/view/tyler-lemon"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-amber-900 hover:text-amber-950 font-medium"
                    >
                      https://sites.google.com/view/tyler-lemon
                    </a>.
                  </>
                )}
              </p>
              <p
                data-tina-field={tinaField(page, "maintainerLicense")}
                className="font-serif text-stone-700 leading-relaxed text-base mb-6"
              >
                {page.maintainerLicense || "The project is entirely open source under the MIT License. Contributions, bug reports, and morphological corrections are welcomed via GitHub."}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="https://github.com/arii/glossy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-stone-900 text-stone-50 text-xs font-mono uppercase tracking-wider hover:bg-stone-800 transition-colors"
                >
                  <svg
                    className="w-4 h-4 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    />
                  </svg>
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <Link
                  href="/docs"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-stone-100 border border-stone-300/80 text-stone-800 text-xs font-mono uppercase tracking-wider hover:bg-stone-200 transition-colors"
                >
                  <span>Documentation &amp; FAQ →</span>
                </Link>
              </div>
            </section>

            {/* Section: Technical Architecture */}
            <section>
              <h2
                data-tina-field={tinaField(page, "architectureTitle")}
                className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4"
              >
                {page.architectureTitle || "Technical Architecture"}
              </h2>
              <ul
                data-tina-field={tinaField(page, "architectureItems")}
                className="list-disc pl-5 space-y-2 text-stone-700 font-serif text-base leading-relaxed m-0"
              >
                {architectureItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
