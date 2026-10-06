import Link from "next/link";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new";
  slug?: string;
  canEdit?: boolean;
};

export function SiteNav({ current, slug = "ohthere-wulfstan", canEdit = true }: SiteNavProps) {
  const activeSlug = slug || "ohthere-wulfstan";

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
            href={`/read/${activeSlug}`}
            aria-current={current === "read" ? "page" : undefined}
          >
            Read
          </Link>
          {canEdit && (
            <Link
              href={`/edit/${activeSlug}`}
              aria-current={current === "edit" ? "page" : undefined}
            >
              Edit
            </Link>
          )}
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
            Architecture &amp; FAQ
          </Link>
        </nav>
      </div>
    </header>
  );
}
