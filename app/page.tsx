import Link from "next/link";
import { loadManuscripts, loadTextDocuments } from "../lib/content";
import { SiteNav } from "../components/site-nav";
import { TextDirectory, type TextChoice } from "../components/text-directory";

export const dynamic = "force-dynamic";

export default function Home() {
  const texts = loadTextDocuments();
  const manuscripts = loadManuscripts();
  const uniqueManuscripts = manuscripts.filter(
    (manuscript) =>
      !texts.some(
        (text) =>
          text.textId === manuscript.slug ||
          text.slug === manuscript.slug ||
          normalizeTitle(text.title) === normalizeTitle(manuscript.title),
      ),
  );
  const choices: TextChoice[] = [
    ...uniqueManuscripts.map((item) => ({
      slug: item.slug,
      title: item.title,
      kind: "manuscript" as const,
      isProtected: item.slug === "ohthere-wulfstan" || item.slug === "ohthere",
    })),
    ...texts.map((item) => ({
      slug: item.slug,
      title: item.title,
      kind: "text" as const,
      isProtected: item.slug === "ohthere-wulfstan" || item.slug === "ohthere",
    })),
  ];

  return (
    <>
      <SiteNav current="home" />
      <main className="site-shell">
        <header className="page-header" style={{ marginBottom: "2rem" }}>
          <p className="eyebrow">Glossy · Interlinear texts</p>
          <h1>Read a text or work on its glosses.</h1>
          <p className="source-line" style={{ maxWidth: "48rem", fontSize: "1.05rem", lineHeight: 1.6 }}>
            The reader and editing workspace are separate. Choose a text below to read the published
            version, open its live gloss editor, or start glossing a new Old English text (e.g. <em>Beowulf</em>, <em>Cædmon&apos;s Hymn</em>).
          </p>
          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link
              href="/edit/new"
              className="workspace-link"
              style={{
                background: "var(--accent)",
                color: "#fff",
                borderColor: "var(--accent)",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <span>+</span> Gloss a New Text
            </Link>
            <Link
              href="/docs"
              className="workspace-link"
              style={{
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Architecture &amp; FAQ
            </Link>
          </div>
        </header>

        <TextDirectory initialChoices={choices} />
      </main>
    </>
  );
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/gu, " ").toLocaleLowerCase("und");
}
