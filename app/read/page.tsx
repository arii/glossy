"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ReadingPage } from "../../components/reading-page";
import { getLocalDraft } from "../../lib/local-drafts";
import { isBuiltInSlug } from "../../lib/corpus-registry";
import type { TextDocument } from "../../lib/types";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import Link from "next/link";

function ReadClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("slug");
  const [draftDoc, setDraftDoc] = useState<TextDocument | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.replace("/read/ohthere");
      return;
    }

    if (isBuiltInSlug(slug)) {
      router.replace(`/read/${slug}`);
      return;
    }

    const doc = getLocalDraft(slug);
    if (doc && Array.isArray(doc.sentences) && doc.sentences.length > 0) {
      setDraftDoc(doc);
    }
    setIsReady(true);
  }, [slug, router]);

  if (!isReady) {
    return (
      <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-ink)" }}>
        Loading text passage...
      </div>
    );
  }

  if (draftDoc) {
    return <ReadingPage texts={[draftDoc]} initialSlug={draftDoc.slug || draftDoc.textId} />;
  }

  return (
    <>
      <SiteNav slug="ohthere" />
      <main className="site-shell">
        <div className="reading-surface">
          <h1>Text Not Found</h1>
          <p>
            The local document <code>&quot;{slug}&quot;</code> could not be found in browser storage.
          </p>
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

/**
 * Client-side reader fallback route for query-parameter drafts (/read?slug=...).
 * Explicit <Suspense> boundary wraps useSearchParams() to prevent de-opting the route
 * or root layout from Next.js static site generation (output: 'export').
 */
export default function ReadRootPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted-ink)" }}>
          Loading reader...
        </div>
      }
    >
      <ReadClient />
    </Suspense>
  );
}
