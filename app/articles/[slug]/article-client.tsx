"use client";

import { useTina, tinaField } from "tinacms/dist/react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";
import { SiteNav } from "../../../components/site-nav";
import { SiteFooter } from "../../../components/site-footer";
import Link from "next/link";
import { useEffect, useState, ReactNode } from "react";
import client from "../../../tina/__generated__/client";
import type { ArticleQuery } from "../../../tina/__generated__/types";
import type { LocalArticle } from "../../../lib/articles";

const ARTICLE_QUERY = `
  query ArticleQuery($relativePath: String!) {
    article(relativePath: $relativePath) {
      id
      title
      author
      date
      coverImage
      summary
      body
      _sys {
        filename
      }
    }
  }
`;

function renderFormattedInlineText(text: string): ReactNode[] {
  // Regex to split bold (**...**), italic (*...*), and code (`...`)
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          style={{
            background: "var(--rule)",
            padding: "0.15rem 0.35rem",
            borderRadius: "0.2rem",
            fontSize: "0.9em",
            fontFamily: "monospace",
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function SimpleMarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let currentList: ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{ paddingLeft: "1.5rem", marginBottom: "1.25rem" }}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={idx} style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.25rem", margin: "1.5rem 0 0.5rem" }}>
          {renderFormattedInlineText(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={idx} style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.5rem", margin: "1.75rem 0 0.75rem", borderBottom: "1px solid var(--rule)", paddingBottom: "0.35rem" }}>
          {renderFormattedInlineText(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={idx} style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.85rem", margin: "2rem 0 1rem" }}>
          {renderFormattedInlineText(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote
          key={idx}
          style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: "1rem",
            margin: "1.25rem 0",
            fontStyle: "italic",
            color: "var(--muted-ink)",
          }}
        >
          {renderFormattedInlineText(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      currentList.push(
        <li key={idx} style={{ marginBottom: "0.35rem" }}>
          {renderFormattedInlineText(trimmed.slice(2))}
        </li>
      );
    } else {
      flushList();
      elements.push(
        <p key={idx} style={{ margin: "0 0 1.25rem", lineHeight: 1.75 }}>
          {renderFormattedInlineText(trimmed)}
        </p>
      );
    }
  });

  flushList();

  return <>{elements}</>;
}

export function ArticleClient({
  slug,
  initialArticle,
}: {
  slug: string;
  initialArticle: LocalArticle | null;
}) {
  const [tinaEnvelope, setTinaEnvelope] = useState<{
    data: ArticleQuery;
    query: string;
    variables: { relativePath: string };
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        const res = await client.queries.article({ relativePath: `${slug}.md` });
        if (isMounted && res.data) {
          setTinaEnvelope({
            data: res.data,
            query: res.query,
            variables: res.variables as { relativePath: string },
          });
        }
      } catch (e) {
        console.error("Error loading article from Tina GraphQL:", e);
      }
    }
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const { data } = useTina({
    query: tinaEnvelope?.query || ARTICLE_QUERY,
    variables: tinaEnvelope?.variables || { relativePath: `${slug}.md` },
    data: tinaEnvelope?.data || { article: null },
  });

  const articleFromTina = data?.article;

  const title = articleFromTina?.title || initialArticle?.title;
  const author = articleFromTina?.author || initialArticle?.author;
  const date = articleFromTina?.date || initialArticle?.date;
  const coverImage = articleFromTina?.coverImage || initialArticle?.coverImage;
  const bodyContent = articleFromTina?.body;
  const rawMarkdownContent = initialArticle?.content;

  return (
    <>
      <SiteNav current="articles" />
      <main className="site-shell" style={{ maxWidth: "48rem", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        {!articleFromTina && !initialArticle ? (
          <div
            style={{
              padding: "3rem",
              background: "var(--surface)",
              borderRadius: "0.5rem",
              border: "1px solid var(--rule)",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontFamily: "'Charis SIL', Georgia, serif", fontSize: "1.75rem", marginBottom: "0.75rem" }}>
              Article Not Found
            </h1>
            <p style={{ color: "var(--muted-ink)", marginBottom: "1.5rem" }}>
              The article &quot;{slug}&quot; could not be found.
            </p>
            <Link
              href="/articles"
              style={{
                display: "inline-flex",
                padding: "0.5rem 1rem",
                borderRadius: "0.35rem",
                background: "var(--accent)",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.88rem",
              }}
            >
              ← Back to Articles
            </Link>
          </div>
        ) : (
          <article
            className="reading-surface"
            style={{
              padding: "2.5rem",
              borderRadius: "0.5rem",
              border: "1px solid var(--rule)",
              background: "var(--surface)",
              boxShadow: "0 0.25rem 1.5rem rgba(64, 47, 29, 0.04)",
            }}
          >
            <div style={{ marginBottom: "1.5rem" }}>
              <Link
                href="/articles"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--accent)",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                ← Philology &amp; Digital Humanities Journal
              </Link>
            </div>

            <header style={{ borderBottom: "1px solid var(--rule)", paddingBottom: "1.5rem", marginBottom: "2rem" }}>
              <h1
                data-tina-field={articleFromTina ? tinaField(articleFromTina, "title") : undefined}
                style={{
                  margin: "0 0 0.75rem",
                  fontFamily: "'Charis SIL', Georgia, serif",
                  fontSize: "2.25rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: "var(--ink)",
                }}
              >
                {title}
              </h1>

              {(author || date) && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    fontSize: "0.82rem",
                    color: "var(--muted-ink)",
                    fontFamily: "monospace",
                    marginBottom: 0,
                  }}
                >
                  {author && (
                    <span data-tina-field={articleFromTina ? tinaField(articleFromTina, "author") : undefined}>
                      By {author}
                    </span>
                  )}
                  {author && date && <span>•</span>}
                  {date && (
                    <time data-tina-field={articleFromTina ? tinaField(articleFromTina, "date") : undefined}>
                      Published on {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                </div>
              )}
            </header>

            {coverImage && (
              <div style={{ marginBottom: "2rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  data-tina-field={articleFromTina ? tinaField(articleFromTina, "coverImage") : undefined}
                  src={coverImage}
                  alt={title || "Cover image"}
                  style={{
                    width: "100%",
                    maxHeight: "24rem",
                    objectFit: "cover",
                    borderRadius: "0.4rem",
                    border: "1px solid var(--rule)",
                  }}
                />
              </div>
            )}

            <div
              data-tina-field={articleFromTina ? tinaField(articleFromTina, "body") : undefined}
              className="article-content"
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.75,
                color: "var(--ink)",
              }}
            >
              {bodyContent ? (
                <TinaMarkdown content={bodyContent as TinaMarkdownContent} />
              ) : rawMarkdownContent ? (
                <SimpleMarkdownRenderer content={rawMarkdownContent} />
              ) : null}
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
