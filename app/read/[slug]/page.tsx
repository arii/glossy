import { notFound } from "next/navigation";
import { ReadingPage } from "../../../components/reading-page";
import { assertTextDocuments, loadDictionary, loadManuscripts, loadTextDocuments } from "../../../lib/content";

type ReadPageProps = {
  params: Promise<{ slug: string }>;
};


export function generateStaticParams() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const manuscripts = loadManuscripts();
  return [
    ...texts.flatMap(({ slug, textId }) => [{ slug }, { slug: textId }]),
    ...manuscripts.map(({ slug }) => ({ slug })),
  ];
}

export default async function ReadPage({ params }: ReadPageProps) {
  const { slug } = await params;
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const manuscripts = loadManuscripts();
  const dictionary = loadDictionary();
  const text = texts.find((document) => document.slug === slug || document.textId === slug);
  const manuscript = manuscripts.find((document) => document.slug === slug);

  if (!text && !manuscript) {
    notFound();
  }

  return (
    <ReadingPage
      texts={texts}
      manuscripts={manuscripts}
      dictionary={dictionary}
      initialSlug={text?.slug ?? manuscript?.slug}
    />
  );
}
