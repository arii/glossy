import { notFound } from "next/navigation";
import { GlossEditor } from "../../../components/gloss-editor";
import { assertTextDocuments, loadTextDocuments } from "../../../lib/content";

type EditPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  return texts.flatMap(({ slug, textId }) => [{ slug }, { slug: textId }]);
}

export default async function EditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const document = texts.find((item) => item.slug === slug || item.textId === slug);

  if (!document) {
    notFound();
  }
  if (!document.sentences || document.sentences.length === 0) {
    throw new Error(`Text "${document.slug}" has no sentence data for the live editor.`);
  }

  return (
    <GlossEditor
      initialDocument={
        document as typeof document & { sentences: NonNullable<typeof document.sentences> }
      }
    />
  );
}
