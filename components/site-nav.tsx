"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { installSafeJsonGlobal } from "../lib/safe-json";
import {
  isWorkspaceSlug,
  getActiveSlug,
  setActiveSlug as saveActiveSlug,
  clearActiveSlug,
} from "../lib/local-drafts";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new" | "articles";
  slug?: string;
};

const DEFAULT_SLUG = "ohthere";

export function SiteNav({ current, slug }: SiteNavProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSlug, setNavActiveSlug] = useState<string>(() => {
    if (current === "home") return DEFAULT_SLUG;
    return slug || DEFAULT_SLUG;
  });

  // Automatically close mobile navigation drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle Escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    installSafeJsonGlobal();

    if (current === "home") {
      setNavActiveSlug(DEFAULT_SLUG);
      try {
        const cachedSlug = getActiveSlug();
        if (cachedSlug && !isWorkspaceSlug(cachedSlug)) {
          clearActiveSlug();
        }
      } catch {}
      return;
    }

    if (slug && slug.trim()) {
      setNavActiveSlug(slug);
      if (isWorkspaceSlug(slug)) {
        try {
          saveActiveSlug(slug);
        } catch {}
      }
    } else {
      try {
        const cachedSlug = getActiveSlug();
        if (cachedSlug && cachedSlug.trim() && isWorkspaceSlug(cachedSlug)) {
          setNavActiveSlug(cachedSlug);
        } else if (cachedSlug) {
          clearActiveSlug();
          setNavActiveSlug(DEFAULT_SLUG);
        }
      } catch {}
    }
  }, [current, slug]);

  const targetSlug = current === "home" ? DEFAULT_SLUG : (slug || activeSlug || DEFAULT_SLUG);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="global-site-header">
      <div className="global-site-header-inner">
        <div className="site-brand">
          <Link
            href="/"
            className="site-brand-link"
            aria-current={current === "home" ? "page" : undefined}
            onClick={closeMobileMenu}
          >
            Glossy
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="site-navigation-drawer"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          <span className="mobile-menu-icon" aria-hidden="true">
            {isMobileMenuOpen ? "✕" : "≡"}
          </span>
        </button>

        <nav
          id="site-navigation-drawer"
          className={`site-nav ${isMobileMenuOpen ? "is-open" : ""}`}
          aria-label="Site"
        >
          <Link
            href="/"
            aria-current={current === "home" ? "page" : undefined}
            onClick={closeMobileMenu}
          >
            Corpus
          </Link>
          <Link
            href={`/read/${targetSlug}`}
            aria-current={current === "read" ? "page" : undefined}
            onClick={closeMobileMenu}
          >
            Reader
          </Link>
          <Link
            href={`/edit/${targetSlug}`}
            aria-current={current === "edit" ? "page" : undefined}
            onClick={closeMobileMenu}
          >
            Editor
          </Link>
          <Link
            href="/edit/new"
            aria-current={current === "new" ? "page" : undefined}
            style={{ fontWeight: 600 }}
            onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
          >
            Documentation
          </Link>
        </nav>
      </div>
    </header>
  );
}
