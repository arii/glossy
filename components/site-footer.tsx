"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function SiteFooter() {
  const [currentUrl, setCurrentUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const feedbackUrl = (() => {
    const base = "https://github.com/arii/glossy/issues/new?template=feedback.yml";
    const title = encodeURIComponent("Feedback / Report");
    const context = encodeURIComponent(currentUrl || "https://glossed.pages.dev");
    const body = encodeURIComponent(
      `### Context\n- Page URL: ${currentUrl || "N/A"}\n- Timestamp: ${new Date().toISOString()}\n\n### Feedback Details\n`
    );
    return `${base}&title=${title}&context_url=${context}&body=${body}`;
  })();

  return (
    <footer
      className="site-footer"
      style={{
        marginTop: "4rem",
        borderTop: "1px solid var(--rule)",
        background: "var(--surface)",
        color: "var(--ink)",
        padding: "1.75rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "76rem",
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          fontSize: "0.82rem",
          color: "var(--muted-ink)",
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "'Charis SIL', Georgia, serif",
              fontWeight: 700,
              color: "var(--ink)",
              fontSize: "0.95rem",
              marginRight: "0.5rem",
            }}
          >
            Glossy
          </span>
          <span>— Old English Interlinear Glossing &amp; Morphology</span>
        </div>

        <nav
          style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}
          aria-label="Footer Navigation"
        >
          <Link
            href="/about"
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            About
          </Link>
          <span style={{ color: "var(--rule)" }}>·</span>
          <Link
            href="/privacy"
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            Privacy
          </Link>
          <span style={{ color: "var(--rule)" }}>·</span>
          <a
            href={feedbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--ink)",
              textDecoration: "none",
              transition: "color 0.15s ease",
            }}
          >
            Feedback / Report Bug
          </a>
          <span style={{ color: "var(--rule)" }}>·</span>
          <a
            href="/admin/index.html"
            style={{
              color: "var(--accent)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Admin Login
          </a>
        </nav>
      </div>
    </footer>
  );
}
