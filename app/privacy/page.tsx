import type { Metadata } from "next";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Glossy · Old English Interlinear Glosses",
  description: "Privacy policy for Glossy: offline-first architecture, zero tracking cookies, local storage usage, and user data privacy.",
};

export default function PrivacyPage() {
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
          <header style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
            <span
              style={{
                display: "inline-block",
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "var(--accent)",
                marginBottom: "0.5rem",
              }}
            >
              Privacy &amp; Data Transparency
            </span>
            <h1
              style={{
                margin: "0 0 0.75rem",
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "2.25rem",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "var(--ink)",
              }}
            >
              Privacy Policy
            </h1>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--muted-ink)", lineHeight: 1.6 }}>
              Effective Date: March 2025 · Last Updated: October 2026
            </p>
          </header>

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
                <strong style={{ display: "block", color: "var(--ink)", fontSize: "0.95rem", marginBottom: "0.25rem" }}>
                  Summary: We do not track you.
                </strong>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                  Glossy is an offline-first scholarly application. We do not use tracking cookies, analytics trackers, or user telemetry. Your custom texts and edits remain entirely within your own browser.
                </p>
              </div>
            </div>

            <h2
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.35rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              1. Information We Do Not Collect
            </h2>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              Unlike commercial web platforms, Glossy operates without tracking infrastructure. Specifically:
            </p>
            <ul style={{ paddingLeft: "1.25rem", margin: "0 0 1rem", lineHeight: 1.7, color: "var(--ink)" }}>
              <li><strong>No tracking cookies</strong>: We do not set marketing, cross-site, or advertising cookies.</li>
              <li><strong>No third-party analytics</strong>: We do not use Google Analytics, Mixpanel, Hotjar, or similar behavioral tracking scripts.</li>
              <li><strong>No user telemetry</strong>: We do not record your keystrokes, reading speeds, or session replay data.</li>
              <li><strong>No personal profiles</strong>: You do not need to register an account or provide personal information to read, gloss, or export texts.</li>
            </ul>
          </section>

          {/* Section: Local Storage */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.35rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              2. Browser Storage (localStorage)
            </h2>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              To ensure that your work is not lost when refreshing the page or working offline, Glossy stores draft documents and editing snapshots in your web browser&apos;s <code>localStorage</code> under keys prefixed with:
            </p>
            <ul style={{ paddingLeft: "1.25rem", margin: "0 0 1rem", lineHeight: 1.7, color: "var(--ink)" }}>
              <li><code>glossy_draft_[slug]</code>: Holds your custom text or working draft data in standard JSON format.</li>
              <li><code>glossy-editor-snapshot-v2-[slug]</code>: Holds editor undo history, cursor position, and active tab state.</li>
              <li><code>glossy_last_slug</code>: Remembers the last document you viewed to preserve your reading context.</li>
            </ul>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>
              This data resides exclusively on your local device. It is never transmitted across the network unless you explicitly download a file (JSON or LaTeX) or authenticate to commit changes to GitHub via the TinaCMS admin interface.
            </p>
          </section>

          {/* Section: Third-Party Integrations */}
          <section style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.35rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              3. Third-Party Services
            </h2>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              Glossy interacts with the following external services only when you explicitly invoke them:
            </p>
            <ul style={{ paddingLeft: "1.25rem", margin: "0 0 1rem", lineHeight: 1.7, color: "var(--ink)" }}>
              <li>
                <strong>Cloudflare Pages</strong>: Glossy is hosted statically on Cloudflare Pages. Cloudflare may process basic HTTP request metadata (such as IP addresses and request headers) strictly for DDoS mitigation, caching, and edge routing in accordance with their privacy policy.
              </li>
              <li>
                <strong>TinaCloud &amp; GitHub (Optional Admin Access)</strong>: If you authenticate as a repository maintainer via <code>/admin/index.html</code>, your session is authenticated through TinaCloud and GitHub OAuth to write git commits to the repository.
              </li>
              <li>
                <strong>Lexicographical Links</strong>: When you click external links to Wiktionary or Bosworth-Toller, you navigate directly to those public resources, which govern their own data collection.
              </li>
            </ul>
          </section>

          {/* Section: Data Rights & Contact */}
          <section>
            <h2
              style={{
                fontFamily: "'Charis SIL', Georgia, serif",
                fontSize: "1.35rem",
                color: "var(--ink)",
                marginBottom: "0.75rem",
              }}
            >
              4. Controlling Your Data
            </h2>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: "0 0 1rem" }}>
              Since all draft data is stored locally in your browser, you retain complete sovereignty over your data. You can delete individual texts directly within the corpus directory or purge all Glossy storage at any time by clearing your browser&apos;s site data for this domain.
            </p>
            <p style={{ lineHeight: 1.7, color: "var(--ink)", margin: 0 }}>
              Questions or suggestions regarding privacy practices may be submitted via our{" "}
              <a
                href="https://github.com/arii/glossy/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)", textDecoration: "underline" }}
              >
                GitHub Issues page
              </a>
              .
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
