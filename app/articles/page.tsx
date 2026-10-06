import Link from "next/link";
import { SiteNav } from "../../components/site-nav";
import { SiteFooter } from "../../components/site-footer";
import { getAllLocalArticles } from "../../lib/articles";

export default function ArticlesIndexPage() {
  const articles = getAllLocalArticles();

  return (
    <>
      <SiteNav current="articles" />
      <main className="site-shell" style={{ maxWidth: "56rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <span
            style={{
              display: "inline-block",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "var(--accent)",
              marginBottom: "0.5rem",
            }}
          >
            Articles &amp; Blog
          </span>
          <h1
            style={{
              margin: "0 0 0.75rem",
              fontFamily: "'Charis SIL', Georgia, serif",
              fontSize: "2.25rem",
              fontWeight: 700,
              lineHeight: 1.2,
              color: "var(--ink)",
            }}
          >
            Philological Essays &amp; Platform Updates
          </h1>
          <p style={{ margin: 0, fontSize: "1.05rem", color: "var(--muted-ink)", lineHeight: 1.6 }}>
            Explore essays on Old English manuscripts, digital interlinear editing guidelines, and historical linguistic research.
          </p>
        </header>

        {articles.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              background: "var(--surface)",
              borderRadius: "0.5rem",
              border: "1px solid var(--rule)",
              textAlign: "center",
              color: "var(--muted-ink)",
            }}
          >
            No articles published yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {articles.map((art) => (
              <article
                key={art.slug}
                style={{
                  padding: "1.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--rule)",
                  background: "var(--surface)",
                  boxShadow: "0 0.25rem 1rem rgba(64, 47, 29, 0.03)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {(art.author || art.date) && (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.6rem",
                      alignItems: "center",
                      fontSize: "0.78rem",
                      color: "var(--muted-ink)",
                      fontFamily: "monospace",
                    }}
                  >
                    {art.author && <span>By {art.author}</span>}
                    {art.author && art.date && <span>•</span>}
                    {art.date && (
                      <time>
                        {new Date(art.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                )}

                <h2 style={{ margin: 0, fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.4rem" }}>
                  <Link
                    href={`/articles/${art.slug}`}
                    style={{ color: "var(--ink)", textDecoration: "none" }}
                  >
                    {art.title}
                  </Link>
                </h2>

                {art.summary && (
                  <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--muted-ink)", lineHeight: 1.5 }}>
                    {art.summary}
                  </p>
                )}

                <div>
                  <Link
                    href={`/articles/${art.slug}`}
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--accent)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
