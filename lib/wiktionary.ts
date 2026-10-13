export function getWiktionaryUrl(lemma: string): string {
  // Strip macrons and normalize Unicode NFC
  const clean = lemma
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
  return `https://en.wiktionary.org/wiki/${encodeURIComponent(clean)}#Old_English`;
}
