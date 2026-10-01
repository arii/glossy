import { notFound } from "next/navigation";
import { ReadingPage } from "../../../components/reading-page";
import { assertTextDocuments, loadTextDocuments } from "../../../lib/content";

type TextPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  return texts.flatMap(({ slug, textId }) => [{ slug }, { slug: textId }]);
}

export default async function TextPreviewPage({ params }: TextPageProps) {
  const { slug } = await params;
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const text = texts.find((document) => document.slug === slug || document.textId === slug);

  if (!text) {
    notFound();
  }

  return <ReadingPage texts={texts} initialSlug={text.slug} />;
}
