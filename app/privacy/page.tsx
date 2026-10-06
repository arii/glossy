"use client";

import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { PageHeader } from "../../components/page-header";
import { ShieldCheck } from "lucide-react";
import privacyData from "../../content/pages/privacy.json";
import { useTina, tinaField } from "tinacms/dist/react";

const PRIVACY_PAGE_QUERY = `
  query PrivacyPageQuery($relativePath: String!) {
    privacyPage(relativePath: $relativePath) {
      title
      eyebrow
      heading
      description
      privacySummaryTitle
      privacySummaryText
      privacySections {
        num
        title
        content
        bullets
      }
    }
  }
`;

const INITIAL_PRIVACY_DATA = { privacyPage: privacyData };
const PRIVACY_PAGE_VARS = { relativePath: "privacy.json" };

export default function PrivacyPage() {
  const { data: pageData } = useTina({
    query: PRIVACY_PAGE_QUERY,
    variables: PRIVACY_PAGE_VARS,
    data: INITIAL_PRIVACY_DATA,
  });

  const page = pageData?.privacyPage || privacyData;
  const sections = (page.privacySections as Array<{
    num?: string;
    title: string;
    content?: string;
    bullets?: string[];
  }>) || privacyData.privacySections || [];

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <SiteNav />

      {/* Standardized Page Header outside the card on the parchment canvas */}
      <PageHeader
        containerClassName="max-w-3xl"
        eyebrow={page.eyebrow || "Privacy & Data Transparency"}
        eyebrowProps={{ "data-tina-field": tinaField(page, "eyebrow") }}
        title={page.heading || "Privacy Policy"}
        titleProps={{ "data-tina-field": tinaField(page, "heading") }}
        metadata={page.description || "Effective Date: March 2025 · Last Updated: October 2026"}
        metadataProps={{ "data-tina-field": tinaField(page, "description") }}
      />

      {/* Standardized Reading Container: max-w-3xl mx-auto px-6 mb-12 */}
      <main className="w-full max-w-3xl mx-auto px-6 mb-16 flex-1">
        <article className="bg-white rounded-lg border border-stone-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-1 ring-stone-900/5 p-8 md:p-12">
          {/* Summary Callout Banner */}
          <div className="flex items-start gap-3.5 p-4 md:p-5 rounded-lg bg-stone-50 border border-stone-200/70 mb-10">
            <ShieldCheck className="w-5 h-5 text-amber-900 shrink-0 mt-0.5" />
            <div>
              <strong
                data-tina-field={tinaField(page, "privacySummaryTitle")}
                className="block text-stone-900 text-sm font-semibold mb-1"
              >
                {page.privacySummaryTitle || "Summary: We do not track you."}
              </strong>
              <p
                data-tina-field={tinaField(page, "privacySummaryText")}
                className="text-xs md:text-sm text-stone-600 leading-relaxed m-0"
              >
                {page.privacySummaryText || "Glossy is an offline-first scholarly application. We do not use tracking cookies, analytics trackers, or user telemetry. Your custom texts and edits remain entirely within your own browser."}
              </p>
            </div>
          </div>

          {/* Sibling Sections with space-y-12 */}
          <div className="space-y-12">
            {sections.map((sec, idx) => (
              <section key={idx} data-tina-field={tinaField(sec)}>
                <h2
                  data-tina-field={tinaField(sec, "title")}
                  className="font-serif text-xl md:text-2xl font-medium text-stone-900 tracking-tight mb-4"
                >
                  {sec.num ? `${sec.num}. ` : ""}{sec.title}
                </h2>
                {sec.content && (
                  <p
                    data-tina-field={tinaField(sec, "content")}
                    className="font-serif text-stone-700 leading-relaxed text-base mb-4"
                  >
                    {sec.content}
                  </p>
                )}
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul
                    data-tina-field={tinaField(sec, "bullets")}
                    className="list-disc pl-5 space-y-2 text-stone-700 font-serif text-base leading-relaxed"
                  >
                    {sec.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
