"use client";

import { SiteNav } from "../../components/site-nav";
import { PageHero } from "../../components/page-hero";
import { SiteFooter } from "../../components/site-footer";
import { ExternalLink } from "lucide-react";
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
      maintainersTitle
      maintainerAriel
      maintainerTyler
      maintainerLicense
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

  return (
    <>
      <SiteNav />
      <main className="site-shell" style={{ maxWidth: "56rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <article
          className="reading-surface"
          style={{
            padding: "2.5rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--rule)",
            background: "var(--surface)",
            boxShadow: "0 0.25rem 1.5rem rgba(64, 47, 29, 0.04)",
          }}
        >
          {/* Header */}
          <PageHero
            eyebrow={page.eyebrow || "About the Project"}
            eyebrowDataTinaField={tinaField(page, "eyebrow")}
            title={page.heading || "Glossy · Digital Interlinear Philology"}
            titleDataTinaField={tinaField(page, "heading")}
            description={page.description || "An open-access digital humanities platform dedicated to historical linguistic annotation, standardized Leipzig interlinear glossing, and accessible manuscript reading."}
            descriptionDataTinaField={tinaField(page, "description")}
          />

          {/* Section: Mission */}
          <section style={{ marginBottom: "2.25rem" }}>
            <h2
              data-tina-field={tinaField(page, "missionTitle")}
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.4rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              {page.missionTitle || "The Mission"}
            </h2>
            <p data-tina-field={tinaField(page, "missionText")} style={{ lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>
              {page.missionText || "Reading and analyzing historical languages like Old English requires balancing multiple layers of linguistic information: original orthography, morphological segmentation, grammatical case and verbal agreement, canonical dictionary headwords, and overarching narrative sense."}
            </p>
          </section>

          {/* Section: Maintainer & Open Source */}
          <section>
            <h2
              data-tina-field={tinaField(page, "maintainersTitle")}
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.4rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              {page.maintainersTitle || "Maintainers & Open Source"}
            </h2>
            <p data-tina-field={tinaField(page, "maintainerAriel")} style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              {page.maintainerAriel || "Glossy was created and engineered by Ariel Anders, who architected the platform, the interactive Leipzig interlinear engine, the offline-first local workspace, and the automated verification suite."}
            </p>
            <p data-tina-field={tinaField(page, "maintainerTyler")} style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              {page.maintainerTyler || "Tyler Lemon served as the linguistic subject matter expert, meticulously glossing all texts in the canonical corpus, standardizing Old English lemmatization (including masculine nominative standards and strong adjective conventions), and ensuring philological fidelity to historical manuscript witnesses."}
            </p>
            <p data-tina-field={tinaField(page, "maintainerLicense")} style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1.25rem" }}>
              {page.maintainerLicense || "The project is entirely open source under the MIT License. Contributions, bug reports, and morphological corrections are welcomed via GitHub."}
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="https://github.com/arii/glossy"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 1rem",
                  borderRadius: "0.35rem",
                  background: "#1c1917",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                }}
              >
                <svg
                  style={{ width: "1rem", height: "1rem", fill: "currentColor" }}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                GitHub Repository
                <ExternalLink style={{ width: "0.8rem", height: "0.8rem", opacity: 0.7 }} />
              </a>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
