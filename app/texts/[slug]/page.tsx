import { notFound } from "next/navigation";
import { ReadingPage } from "../../../components/reading-page";
import { assertTextDocuments, loadDictionary, loadManuscripts, loadTextDocuments } from "../../../lib/content";

type TextPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const manuscripts = loadManuscripts();
  const textParams = texts.flatMap(({ slug, textId }) => [{ slug }, { slug: textId }]);
  const manuscriptParams = manuscripts.map(({ slug }) => ({ slug }));
  return [...textParams, ...manuscriptParams];
}

export default async function TextPreviewPage({ params }: TextPageProps) {
  const { slug } = await params;
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const manuscripts = loadManuscripts();
  const dictionary = loadDictionary();

  const text = texts.find((document) => document.slug === slug || document.textId === slug);
  const manuscript = manuscripts.find((doc) => doc.slug === slug);

  if (!text && !manuscript) {
    notFound();
  }

  return (
    <ReadingPage
      texts={texts}
      manuscripts={manuscripts}
      dictionary={dictionary}
      initialSlug={manuscript?.slug ?? text?.slug}
    />
  );
}

