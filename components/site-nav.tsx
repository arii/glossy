import Link from "next/link";

type SiteNavProps = {
  current?: "home" | "read" | "edit" | "docs" | "new";
  slug?: string;
};

export function SiteNav({ current }: SiteNavProps) {

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
            href="/edit/new"
            aria-current={current === "new" ? "page" : undefined}
            style={{ fontWeight: 600 }}
          >
            + New Text
          </Link>
          <Link
            href="/docs#section-l1"
            aria-current={current === "docs" ? "page" : undefined}
          >
            Linguistic Standards
          </Link>
          <Link
            href="/docs#section-a1"
            aria-current={current === "docs" ? "page" : undefined}
          >
            System Architecture
          </Link>
        </nav>
      </div>
    </header>
  );
}
