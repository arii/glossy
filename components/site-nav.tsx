"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (current === "home") return DEFAULT_SLUG;
    return slug || DEFAULT_SLUG;
  });

  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((url: string) => {
    startTransition(() => {
      router.push(url);
    });
  }, [router]);

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
      setActiveSlug(DEFAULT_SLUG);
      try {
        const cachedSlug = getActiveSlug();
        if (cachedSlug && !isWorkspaceSlug(cachedSlug)) {
          clearActiveSlug();
        }
      } catch {}
      return;
    }

    if (slug && slug.trim()) {
      setActiveSlug(slug);
      if (isWorkspaceSlug(slug)) {
        try {
          saveActiveSlug(slug);
        } catch {}
      }
    } else {
      try {
        const cachedSlug = getActiveSlug();
        if (cachedSlug && cachedSlug.trim() && isWorkspaceSlug(cachedSlug)) {
          setActiveSlug(cachedSlug);
        } else if (cachedSlug) {
          clearActiveSlug();
          setActiveSlug(DEFAULT_SLUG);
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
          <a
            href="/"
            className="site-brand-link"
            aria-current={current === "home" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate("/");
            }}
          >
            Glossy
          </a>
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
          className={`site-nav ${isMobileMenuOpen ? "is-open" : ""} ${isPending ? "is-pending" : ""}`}
          aria-label="Site"
        >
          <a
            href="/"
            aria-current={current === "home" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate("/");
            }}
          >
            Corpus
          </a>
          <a
            href={`/read/${targetSlug}`}
            aria-current={current === "read" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate(`/read/${targetSlug}`);
            }}
          >
            Reader
          </a>
          <a
            href={`/edit/${targetSlug}`}
            aria-current={current === "edit" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate(`/edit/${targetSlug}`);
            }}
          >
            Editor
          </a>
          <a
            href="/edit/new"
            aria-current={current === "new" ? "page" : undefined}
            style={{ fontWeight: 600 }}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate("/edit/new");
            }}
          >
            + New Text
          </a>
          <a
            href="/articles"
            aria-current={current === "articles" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              navigate("/articles");
            }}
          >
            Articles
          </a>
          <a
            href="/docs"
            aria-current={current === "docs" ? "page" : undefined}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              closeMobileMenu();
              navigate("/docs");
            }}
          >
            Documentation
          </a>
        </nav>
      </div>
    </header>
  );
}
