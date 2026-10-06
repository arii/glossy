"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { GlossEditor } from "../components/gloss-editor";
import { safeJsonParse } from "../lib/safe-json";
import type { TextDocument } from "../lib/types";

export default function NotFound() {
  const [draftDoc, setDraftDoc] = useState<TextDocument | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    // Support client-created drafts that are not pre-rendered static routes
    if (path.startsWith("/edit/")) {
      const slug = path.replace(/^\/edit\/?/, "").split("/")[0];
      if (slug) {
        const raw = window.localStorage.getItem(`glossy_draft_${slug}`);
        if (raw) {
          const parsed = safeJsonParse<TextDocument>(raw);
          if (parsed && Array.isArray(parsed.sentences) && parsed.sentences.length > 0) {
            setDraftDoc(parsed);
          }
        }
      }
    }
  }, []);

  if (draftDoc) {
    return <GlossEditor initialDocument={draftDoc} />;
  }

  return (
    <>
      <SiteNav slug="ohthere-wulfstan" />
      <main className="site-shell">
        <div className="reading-surface">
          <h1>404 - Not Found</h1>
          <p>The requested passage or editor workspace could not be found.</p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/" className="workspace-link">
              Return to Glossy Home
            </Link>
            <Link href="/edit/new" className="workspace-link">
              + Gloss a New Text
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
