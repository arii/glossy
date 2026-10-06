"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { installSafeJsonGlobal } from "../lib/safe-json";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new";
  slug?: string;
};

const DEFAULT_SLUG = "ohthere-wulfstan";
const SLUG_STORAGE_KEY = "glossy_active_slug";

export function SiteNav({ current, slug }: SiteNavProps) {
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>(slug || DEFAULT_SLUG);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle outside interactions (pointerdown, touchstart, mousedown) and keyboard Esc
  useEffect(() => {
    function handleDismiss(event: Event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDocsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDocsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleDismiss);
    document.addEventListener("touchstart", handleDismiss, { passive: true });
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleDismiss);
      document.removeEventListener("touchstart", handleDismiss);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

          <div
            className="site-nav-dropdown-container"
            ref={dropdownRef}
            onMouseEnter={() => setIsDocsOpen(true)}
            onMouseLeave={() => setIsDocsOpen(false)}
          >
            <button
              type="button"
              className={`site-nav-dropdown-trigger ${current === "docs" ? "active" : ""}`}
              onClick={() => setIsDocsOpen((prev) => !prev)}
              aria-haspopup="true"
              aria-expanded={isDocsOpen}
              aria-current={current === "docs" ? "page" : undefined}
            >
              <span>Documentation</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`nav-chevron ${isDocsOpen ? "nav-chevron-rotated" : ""}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isDocsOpen && (
              <div className="site-nav-dropdown-menu" role="menu">
                <Link
                  href="/docs#section-l1"
                  role="menuitem"
                  className="site-nav-dropdown-item"
                  onClick={() => setIsDocsOpen(false)}
                >
                  <div className="dropdown-item-title">Linguistic Standards</div>
                  <div className="dropdown-item-desc">Editorial rules, Leipzig glossing &amp; abbreviations</div>
                </Link>
                <Link
                  href="/docs#section-a1"
                  role="menuitem"
                  className="site-nav-dropdown-item"
                  onClick={() => setIsDocsOpen(false)}
                >
                  <div className="dropdown-item-title">System Architecture</div>
                  <div className="dropdown-item-desc">gb4e LaTeX pipeline, AST &amp; schema design</div>
                </Link>
                <div className="site-nav-dropdown-divider" />
                <Link
                  href="/docs"
                  role="menuitem"
                  className="site-nav-dropdown-item-all"
                  onClick={() => setIsDocsOpen(false)}
                >
                  All Documentation →
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
