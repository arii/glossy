import { ReadingPage } from "../components/reading-page";
import { assertTextDocuments, loadTextDocuments } from "../lib/content";

export default function Home() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  return <ReadingPage texts={texts} />;
}
