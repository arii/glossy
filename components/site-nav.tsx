import Link from "next/link";

type SiteNavProps = {
  current?: "read" | "edit" | "docs" | "new";
  slug?: string;
  canEdit?: boolean;
};

export function SiteNav({ current, slug = "ohthere-wulfstan", canEdit = true }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label="Site">
      <Link href="/" className="site-nav-home">Glossy</Link>
      <Link href={`/read/${slug}`} aria-current={current === "read" ? "page" : undefined}>Read</Link>
      {canEdit && (
        <Link href={`/edit/${slug}`} aria-current={current === "edit" ? "page" : undefined}>Edit</Link>
      )}
      <Link href="/edit/new" aria-current={current === "new" ? "page" : undefined} style={{ fontWeight: 600 }}>+ New Text</Link>
      <Link href="/docs" aria-current={current === "docs" ? "page" : undefined}>Architecture & FAQ</Link>
    </nav>
  );
}
