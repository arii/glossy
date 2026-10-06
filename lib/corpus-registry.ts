export interface BuiltInTextMetadata {
  textId: string;
  slug: string;
  title: string;
  author: string;
  editor?: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  witness?: string;
  origDate?: string;
  protected: boolean;
  description?: string;
  defaultSentenceCount?: number;
  defaultTokenCount?: number;
}

export const BUILT_IN_CORPUS: BuiltInTextMetadata[] = [
  {
    textId: "ohthere",
    slug: "ohthere",
    title: "The Voyages of Ohthere and Wulfstan",
    author: "Alfred the Great's Circle / Anonymous",
    editor: "Tyler Lemon",
    source: "British Library, Cotton MS Tiberius B i",
    sourceFile: "ohthere.json",
    sourceEdition: "Old English Orosius (ed. Bately 1980 / Sweet)",
    witness: "BL Cotton MS Tiberius B i, fol. 11r-13v",
    origDate: "c. 890–900 AD",
    protected: true,
    description: "The classic Old English maritime travelogue detailing North Sea and Baltic voyages.",
    defaultSentenceCount: 75,
    defaultTokenCount: 1716,
  },
  {
    textId: "beowulf-prologue",
    slug: "beowulf-prologue",
    title: "Beowulf (Prologue)",
    author: "Anonymous",
    editor: "Tyler Lemon",
    source: "British Library, Cotton MS Vitellius A xv",
    sourceFile: "beowulf-prologue.json",
    sourceEdition: "Klaeber's Beowulf (4th ed. Fulk, Bjork, Niles 2008)",
    witness: "BL Cotton MS Vitellius A xv, fol. 132r (Nowell Codex)",
    origDate: "c. 700–1000 AD",
    protected: false,
    description: "The epic opening lines of the premier Old English heroic alliterative poem.",
    defaultSentenceCount: 11,
    defaultTokenCount: 53,
  },
  {
    textId: "caedmon-hymn",
    slug: "caedmon-hymn",
    title: "Cædmon's Hymn",
    author: "Cædmon",
    editor: "Tyler Lemon",
    source: "Cambridge University Library MS Kk.5.16 (Moore Bede)",
    sourceFile: "caedmon-hymn.json",
    sourceEdition: "Dobbie (1942), ASPR VI",
    witness: "CUL MS Kk.5.16, fol. 128v",
    origDate: "c. 658–680 AD",
    protected: false,
    description: "The earliest surviving recorded Old English Christian poem.",
    defaultSentenceCount: 9,
    defaultTokenCount: 42,
  },
  {
    textId: "the-wanderer",
    slug: "the-wanderer",
    title: "The Wanderer (Opening)",
    author: "Anonymous",
    editor: "Tyler Lemon",
    source: "Exeter Cathedral Library MS 3501 (Exeter Book)",
    sourceFile: "the-wanderer.json",
    sourceEdition: "Krapp & Dobbie (1936), ASPR III",
    witness: "Exeter Book, fol. 76v–77r",
    origDate: "c. 10th Century AD",
    protected: false,
    description: "An Old English elegiac poem reflecting on exile, memory, and the transience of worldly glory.",
    defaultSentenceCount: 5,
    defaultTokenCount: 26,
  },
];

export function isProtectedSlug(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return s === "ohthere" || s === "ohthere-wulfstan";
}

export function isBuiltInSlug(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  if (s === "ohthere-wulfstan") return true;
  return BUILT_IN_CORPUS.some((t) => t.slug.toLowerCase() === s || t.textId.toLowerCase() === s);
}

export function getBuiltInMetadata(slug: string): BuiltInTextMetadata | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  if (s === "ohthere-wulfstan") {
    return BUILT_IN_CORPUS.find((t) => t.slug === "ohthere");
  }
  return BUILT_IN_CORPUS.find((t) => t.slug.toLowerCase() === s || t.textId.toLowerCase() === s);
}
