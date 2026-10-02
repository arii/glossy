import { loadManuscripts, loadTextDocuments } from "../lib/content";

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
      <section className="workspace-choice">
        <p className="workspace-eyebrow">Glossy · Interlinear texts</p>
        <h1>Read a text or work on its glosses.</h1>
        <p className="workspace-choice-copy">
          The reader and editing workspace are separate. Choose a text below to read the published
          version or open its live gloss editor.
        </p>
        <div className="workspace-choice-list">
          {choices.map((choice) => (
            <article className="workspace-choice-card" key={`${choice.kind}-${choice.slug}`}>
              <h2>{choice.title}</h2>
              <p>
                <a href={`/read/${choice.slug}`}>Open reader</a>
                {" · "}
                {choice.kind === "text" ? (
                  <a href={`/edit/${choice.slug}`}>Edit glosses</a>
                ) : (
                  <span>Editing workspace coming soon</span>
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function normalizeTitle(title: string) {
  return title.trim().replace(/\s+/gu, " ").toLocaleLowerCase("und");
}
