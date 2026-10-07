"use client";

import { SiteNav } from "../../components/site-nav";
import { PageHero } from "../../components/page-hero";
import { SiteFooter } from "../../components/site-footer";
import { AttributionCard } from "../../components/attribution-modal";
import attributionData from "../../content/pages/attribution.json";
import { useTina, tinaField } from "tinacms/dist/react";

const ATTRIBUTION_PAGE_QUERY = `
  query AttributionPageQuery($relativePath: String!) {
    attributionPage(relativePath: $relativePath) {
      pageId
      title
      eyebrow
      heading
      description
      platformCreator
      platformCreatorUrl
      defaultEditor
      defaultEditorUrl
      editionDate
      booktitle
      attributionLinguisticPackage
      attributionStandardsTitle
      attributionStandardsStatement
      bibtexCitationTemplate
      unifiedLsaCitationTemplate
      apaCitationTemplate
      chicagoCitationTemplate
    }
  }
`;

const INITIAL_ATTRIBUTION_DATA = { attributionPage: attributionData };
const ATTRIBUTION_PAGE_VARS = { relativePath: "attribution.json" };

export default function AttributionPage() {
  const { data: pageData } = useTina({
    query: ATTRIBUTION_PAGE_QUERY,
    variables: ATTRIBUTION_PAGE_VARS,
    data: INITIAL_ATTRIBUTION_DATA,
  });

  const page = pageData?.attributionPage || attributionData;

  return (
    <>
      <SiteNav />
      <main
        className="site-shell"
        style={{
          maxWidth: "56rem",
          margin: "0 auto",
          padding: "2.5rem 1.5rem",
        }}
      >
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
          <PageHero
            eyebrow={page.eyebrow || "Scholarly Attribution"}
            eyebrowDataTinaField={tinaField(page, "eyebrow")}
            title={page.heading || "Attribution & Citation"}
            titleDataTinaField={tinaField(page, "heading")}
            description={page.description || "Official bibliographical citations and platform credits for the Glossy Old English corpus."}
            descriptionDataTinaField={tinaField(page, "description")}
          />
          <AttributionCard
            slug="ohthere"
            title="The voyages of Ohthere and Wulfstan"
            author={page.defaultEditor || "Tyler Lemon"}
            source="London, British Library, Additional MS 47967, ff. 5v–6r"
            config={page}
            showCloseButton={false}
            hideHeader={true}
            asCard={false}
          />
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
