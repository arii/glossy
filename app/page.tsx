import { readingPassage } from "../data/ohthere";

export default function Home() {
  return (
    <main className="page-shell">
      <article className="reading-surface">
        <header className="page-header">
          <p className="eyebrow">Old English visual gloss</p>
          <h1>{readingPassage.title}</h1>
          <p className="source-line">{readingPassage.source}</p>
        </header>

        <section className="passage" aria-labelledby="passage-heading">
          <h2 id="passage-heading">Text</h2>
          <p className="old-english">
            {readingPassage.oldEnglish}
          </p>
          <p className="translation">{readingPassage.translation}</p>
        </section>
      </article>
    </main>
  );
}
