"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { installSafeJsonGlobal } from "../lib/safe-json";
import { isWorkspaceSlug } from "../lib/local-drafts";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new" | "articles";
  slug?: string;
};

const DEFAULT_SLUG = "ohthere";
const SLUG_STORAGE_KEY = "glossy_active_slug";

export function SiteNav({ current, slug }: SiteNavProps) {
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (current === "home") return DEFAULT_SLUG;
    return slug || DEFAULT_SLUG;
  });

  useEffect(() => {
    installSafeJsonGlobal();

    if (current === "home") {
      setActiveSlug(DEFAULT_SLUG);
      try {
        const cachedSlug = window.localStorage.getItem(SLUG_STORAGE_KEY);
        if (cachedSlug && !isWorkspaceSlug(cachedSlug)) {
          window.localStorage.removeItem(SLUG_STORAGE_KEY);
        }
      } catch {}
      return;
    }

    if (slug && slug.trim()) {
      setActiveSlug(slug);
      if (isWorkspaceSlug(slug)) {
        try {
          window.localStorage.setItem(SLUG_STORAGE_KEY, slug);
        } catch {}
      }
    } else {
      try {
        const cachedSlug = window.localStorage.getItem(SLUG_STORAGE_KEY);
        if (cachedSlug && cachedSlug.trim() && isWorkspaceSlug(cachedSlug)) {
          setActiveSlug(cachedSlug);
        } else if (cachedSlug) {
          window.localStorage.removeItem(SLUG_STORAGE_KEY);
          setActiveSlug(DEFAULT_SLUG);
        }
      } catch {}
    }
  }, [current, slug]);

  const targetSlug = current === "home" ? DEFAULT_SLUG : (slug || activeSlug || DEFAULT_SLUG);

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
            Reader
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
            href="/articles"
            aria-current={current === "articles" ? "page" : undefined}
          >
            Articles
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
