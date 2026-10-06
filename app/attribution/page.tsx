"use client";

import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { PageHeader } from "../../components/page-header";
import { AttributionCard } from "../../components/attribution-modal";
import attributionData from "../../content/pages/attribution.json";
import { useTina } from "tinacms/dist/react";

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
    <div className="min-h-screen flex flex-col justify-between">
      <SiteNav />

      {/* Standardized Reusable PageHeader */}
      <PageHeader
        containerClassName="max-w-3xl"
        eyebrow="Corpus Attribution"
        title="Scholarly Attribution & Citation"
        metadata="Provenance, manuscript shelfmarks, and academic citation formats for the canonical Old English editions."
      />

      <main className="w-full max-w-3xl mx-auto px-6 mb-16 flex-1 flex justify-center">
        <AttributionCard
          slug="ohthere"
          title="The voyages of Ohthere and Wulfstan"
          author={page.defaultEditor || "Tyler Lemon"}
          source="London, British Library, Additional MS 47967, ff. 5v–6r"
          config={page}
          showCloseButton={false}
        />
      </main>

      <SiteFooter />
    </div>
  );
}
