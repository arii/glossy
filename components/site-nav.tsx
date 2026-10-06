"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { installSafeJsonGlobal } from "../lib/safe-json";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new";
  slug?: string;
};

const DEFAULT_SLUG = "ohthere-wulfstan";
const SLUG_STORAGE_KEY = "glossy_active_slug";

export function SiteNav({ current, slug }: SiteNavProps) {
  const [activeSlug, setActiveSlug] = useState<string>(slug || DEFAULT_SLUG);

  // Sync active slug with localStorage and props
  useEffect(() => {
    installSafeJsonGlobal();

    if (slug && slug.trim()) {
      setActiveSlug(slug);
      try {
        window.localStorage.setItem(SLUG_STORAGE_KEY, slug);
      } catch {}
    } else {
      try {
        const cachedSlug = window.localStorage.getItem(SLUG_STORAGE_KEY);
        if (cachedSlug && cachedSlug.trim()) {
          setActiveSlug(cachedSlug);
        }
      } catch {}
    }
  }, [slug]);

  const targetSlug = activeSlug || DEFAULT_SLUG;

  return (
    <header className="global-site-header">
      <div className="global-site-header-inner">
        <div className="site-brand">
          <Link
            href="/"
            className="site-brand-link"
            aria-current={current === "home" ? "page" : undefined}
          >
            Glossy
          </Link>
        </div>
        <nav className="site-nav" aria-label="Site">
          <Link
            href="/"
            aria-current={current === "home" ? "page" : undefined}
          >
            Corpus
          </Link>
          <Link
            href={`/read/${targetSlug}`}
            aria-current={current === "read" ? "page" : undefined}
          >
            Viewer
          </Link>
          <Link
            href={`/edit/${targetSlug}`}
            aria-current={current === "edit" ? "page" : undefined}
          >
            Editor
          </Link>
          <Link
            href="/edit/new"
            aria-current={current === "new" ? "page" : undefined}
            style={{ fontWeight: 600 }}
          >
            + New Text
          </Link>
          <Link
            href="/docs"
            aria-current={current === "docs" ? "page" : undefined}
          >
            Documentation
          </Link>
        </nav>
      </div>
    </header>
  );
}

