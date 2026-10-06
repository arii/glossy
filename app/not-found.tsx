"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { SiteFooter } from "../components/site-footer";
import { GlossEditor } from "../components/gloss-editor";
import { ReadingPage } from "../components/reading-page";
import { getLocalDraft } from "../lib/local-drafts";
import type { TextDocument } from "../lib/types";

export default function NotFound() {
  const [draftDoc, setDraftDoc] = useState<TextDocument | null>(null);
  const [routeMode, setRouteMode] = useState<"edit" | "read" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = window.location.pathname;
    let slug = "";
    let mode: "edit" | "read" | null = null;

    if (path.startsWith("/edit/")) {
      slug = path.replace(/^\/edit\/?/, "").split("/")[0];
      mode = "edit";
    } else if (path.startsWith("/read/")) {
      slug = path.replace(/^\/read\/?/, "").split("/")[0];
      mode = "read";
    }

    if (slug) {
      const doc = getLocalDraft(slug);
      if (doc && Array.isArray(doc.sentences) && doc.sentences.length > 0) {
        setDraftDoc(doc);
        setRouteMode(mode);
      }
    }
  }, []);

  if (draftDoc && routeMode === "edit") {
    return <GlossEditor initialDocument={draftDoc} />;
  }

  if (draftDoc && routeMode === "read") {
    return <ReadingPage texts={[draftDoc]} initialSlug={draftDoc.slug || draftDoc.textId} />;
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
