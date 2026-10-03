import Link from "next/link";

type SiteNavProps = {
  current: "read" | "edit";
  slug: string;
  canEdit?: boolean;
};

export function SiteNav({ current, slug, canEdit = true }: SiteNavProps) {
  return (
    <nav className="site-nav" aria-label="Site">
      <Link href="/" className="site-nav-home">Glossy</Link>
      <Link href={`/read/${slug}`} aria-current={current === "read" ? "page" : undefined}>Read</Link>
      {canEdit && (
        <Link href={`/edit/${slug}`} aria-current={current === "edit" ? "page" : undefined}>Edit</Link>
      )}
    </nav>
  );
}
