import Link from "next/link";
import { loadManuscripts, loadTextDocuments } from "../lib/content";
import { SiteNav } from "../components/site-nav";

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
  const choices = [
    ...uniqueManuscripts.map((item) => ({
      slug: item.slug,
      title: item.title,
      kind: "manuscript" as const,
    })),
    ...texts.map((item) => ({
      slug: item.slug,
      title: item.title,
      kind: "text" as const,
    })),
  ];

  return (
    <main className="workspace-shell">
      <div className="workspace">
        <header className="workspace-header" style={{ marginBottom: "2rem", display: "block" }}>
          <SiteNav current="home" />
          <div style={{ marginTop: "1rem" }}>
            <p className="workspace-eyebrow">Glossy · Interlinear texts</p>
            <h1>Read a text or work on its glosses.</h1>
            <p className="workspace-choice-copy" style={{ maxWidth: "48rem" }}>
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
          </div>
        </header>

        <div className="workspace-choice-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "1.25rem" }}>
          {choices.map((choice) => (
            <article className="workspace-choice-card" key={`${choice.kind}-${choice.slug}`}>
              <h2>{choice.title}</h2>
              <p>
                <Link href={`/read/${choice.slug}`}>Open reader</Link>
                {" · "}
                {choice.kind === "text" ? (
                  <Link href={`/edit/${choice.slug}`}>Edit glosses</Link>
                ) : (
                  <span>Editing workspace coming soon</span>
                )}
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/gu, " ").toLocaleLowerCase("und");
}
