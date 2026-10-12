"use client";

import Link from "next/link";
import { SiteNav } from "../../../components/site-nav";
import { SiteFooter } from "../../../components/site-footer";

export default function ReadingPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleReset = () => {
    try {
      reset();
    } catch {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }
  };

  return (
    <>
      <SiteNav current="read" slug="ohthere" />
      <main className="site-shell">
        <div className="reading-surface" role="alert" aria-live="assertive">
          <h1 style={{ color: "var(--accent)" }}>Unable to load passage</h1>
          <p style={{ color: "var(--muted-ink)", marginBottom: "1.5rem" }}>
            An unexpected error occurred while processing this text document. You can try reloading the reader or return to the main corpus directory.
          </p>
          {error?.message && (
            <p
              style={{
                fontSize: "0.85rem",
                fontFamily: "monospace",
                padding: "0.75rem 1rem",
                background: "var(--error-bg, #fee2e2)",
                border: "1px solid var(--error-border, #fca5a5)",
                color: "var(--error-text, #b91c1c)",
                borderRadius: "0.375rem",
                marginBottom: "1.5rem",
              }}
            >
              {error.message}
            </p>
          )}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button className="workspace-button workspace-button-primary" type="button" onClick={handleReset}>
              Try Again
            </button>
            <Link href="/" className="workspace-link">
              Return to Corpus Directory
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
