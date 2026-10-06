"use client";

import { SiteNav } from "../../components/site-nav";
import { PageHero } from "../../components/page-hero";
import { SiteFooter } from "../../components/site-footer";
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
            eyebrow={page.eyebrow || "Privacy & Data Transparency"}
            eyebrowDataTinaField={tinaField(page, "eyebrow")}
            title={page.heading || "Privacy Policy"}
            titleDataTinaField={tinaField(page, "heading")}
            description={page.description || "Effective Date: March 2025 · Last Updated: October 2026"}
            descriptionDataTinaField={tinaField(page, "description")}
          />

          {/* Section: Core Philosophy */}
          <section style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1rem 1.25rem",
                background: "rgba(123, 63, 42, 0.05)",
                border: "1px solid rgba(123, 63, 42, 0.15)",
                borderRadius: "0.4rem",
                marginBottom: "1.5rem",
              }}
            >
              <ShieldCheck style={{ width: "1.5rem", height: "1.5rem", color: "var(--accent)", flexShrink: 0, marginTop: "0.15rem" }} />
              <div>
                <strong data-tina-field={tinaField(page, "privacySummaryTitle")} style={{ display: "block", color: "var(--ink)", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  {page.privacySummaryTitle || "Summary: We do not track you."}
                </strong>
                <p data-tina-field={tinaField(page, "privacySummaryText")} style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                  {page.privacySummaryText || "Glossy is an offline-first scholarly application. We do not use tracking cookies, analytics trackers, or user telemetry. Your custom texts and edits remain entirely within your own browser."}
                </p>
              </div>
            </div>

            {sections.map((sec, idx) => (
              <div key={idx} style={{ marginBottom: "2rem" }} data-tina-field={tinaField(sec)}>
                <h2
                  data-tina-field={tinaField(sec, "title")}
                  style={{
                    fontFamily: "'Charis SIL', Georgia, serif",
                    fontSize: "1.35rem",
                    color: "var(--ink)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {sec.num ? `${sec.num}. ` : ""}{sec.title}
                </h2>
                {sec.content && (
                  <p data-tina-field={tinaField(sec, "content")} style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
                    {sec.content}
                  </p>
                )}
                {sec.bullets && sec.bullets.length > 0 && (
                  <ul data-tina-field={tinaField(sec, "bullets")} style={{ paddingLeft: "1.25rem", margin: "0 0 1rem", lineHeight: 1.7, color: "var(--ink)" }}>
                    {sec.bullets.map((bullet, bIdx) => (
                      <li key={bIdx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
