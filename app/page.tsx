import { ReadingPage } from "../components/reading-page";
import { assertTextDocuments, loadDictionary, loadManuscripts, loadTextDocuments } from "../lib/content";

export default function Home() {
  const texts = loadTextDocuments();
  assertTextDocuments(texts);
  const manuscripts = loadManuscripts();
  const dictionary = loadDictionary();

  return (
    <ReadingPage
      texts={texts}
      manuscripts={manuscripts}
      dictionary={dictionary}
    />
  );
}
