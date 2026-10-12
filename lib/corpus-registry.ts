import ohthereData from "../content/texts/ohthere.json";
import beowulfData from "../content/texts/beowulf-prologue.json";
import caedmonData from "../content/texts/caedmon-hymn.json";
import wandererData from "../content/texts/the-wanderer.json";
import type { TextDocument } from "./types";

export interface BuiltInTextMetadata {
  textId: string;
  slug: string;
  title: string;
  author: string;
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  source: string;
  sourceFile: string;
  sourceEdition?: string;
  witness?: string;
  origDate?: string;
  description?: string;
  sentenceCount?: number;
  tokenCount?: number;
}

const RAW_TEXTS = [
  ohthereData,
  beowulfData,
  caedmonData,
  wandererData,
] as unknown as TextDocument[];

function extractMetadata(doc: TextDocument): BuiltInTextMetadata {
  const sentenceCount = doc.sentences?.length || 0;
  const tokenCount = (doc.sentences || []).reduce(
    (acc, s) => acc + (s.words?.length || 0),
    0
  );

  return {
    textId: doc.textId || doc.slug,
    slug: doc.slug,
    title: doc.title,
    author: doc.author || doc.historicalAuthor || "Anonymous",
    editor: doc.editor || doc.glossedBy,
    shelfmark: doc.shelfmark,
    dialect: doc.dialect,
    historicalDate: doc.historicalDate,
    source: doc.source,
    sourceFile: doc.sourceFile || `${doc.slug}.json`,
    sourceEdition: doc.sourceEdition,
    witness: doc.shelfmark || doc.source,
    origDate: doc.historicalDate,
    sentenceCount,
    tokenCount,
  };
}

export const BUILT_IN_CORPUS: BuiltInTextMetadata[] = RAW_TEXTS.map(extractMetadata);

export function isBuiltInSlug(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  return BUILT_IN_CORPUS.some((t) => t.slug.toLowerCase() === s || t.textId.toLowerCase() === s);
}

export function getBuiltInMetadata(slug: string): BuiltInTextMetadata | undefined {
  if (!slug) return undefined;
  const s = slug.toLowerCase();
  return BUILT_IN_CORPUS.find((t) => t.slug.toLowerCase() === s || t.textId.toLowerCase() === s);
}
