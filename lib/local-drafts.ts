import type { TextDocument, PartOfSpeech, NoteItem } from "./types";
import { safeJsonStringify } from "./safe-json";
import {
  isBuiltInSlug,
  isProtectedSlug,
  BUILT_IN_CORPUS,
  getBuiltInMetadata,
  ALL_PRESETS_METADATA,
} from "./corpus-registry";

export const DRAFT_STORAGE_PREFIX = "glossy:v1:draft:";
export const PENDING_MANIFEST_KEY = "glossy_pending_drafts";
export const HIDDEN_SLUGS_KEY = "glossy_deleted_slugs";

export interface StoredDraft {
  version: 1;
  doc: TextDocument;
  baseHash: string;
  updatedAt: string;
}

export interface PendingDraftEntry {
  slug: string;
  title: string;
  updatedAt: string;
  sentenceCount: number;
  wordCount: number;
  synced: boolean;
  baseHash?: string;
}

export type StorageResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; reason: "quota" | "invalid" | "unavailable" | "not_found"; message: string; error?: string };

function computeSimpleHash(input: unknown): string {
  const str = typeof input === "string" ? input : safeJsonStringify(input);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

export function computeDocumentHash(doc: TextDocument): string {
  return computeSimpleHash({
    slug: doc.slug,
    title: doc.title,
    author: doc.author,
    historicalAuthor: doc.historicalAuthor,
    glossedBy: doc.glossedBy,
    date: doc.date,
    sourceEdition: doc.sourceEdition,
    sentences: (doc.sentences || []).map((s) => ({
      translation: s.translation,
      words: (s.words || []).map((w) => ({
        originalWord: w.originalWord,
        morphologicalGloss: w.morphologicalGloss,
        lemma: w.analysis?.lemma,
        pos: w.analysis?.partOfSpeech,
        definition: w.analysis?.definition,
      })),
    })),
  });
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readDraft(slug: string): StoredDraft | null {
  const storage = getStorage();
  if (!storage || !slug) return null;

  // 1. Try modern versioned draft key
  const v1Key = `${DRAFT_STORAGE_PREFIX}${slug}`;
  const v1Raw = storage.getItem(v1Key);
  if (v1Raw) {
    try {
      const parsed = JSON.parse(v1Raw) as StoredDraft;
      if (parsed && parsed.doc && parsed.version === 1) {
        delete (parsed.doc as Record<string, unknown>).texSource;
        delete (parsed.doc as Record<string, unknown>)["tex-source"];
        return parsed;
      }
    } catch {}
  }

  // 2. Fallback to legacy unversioned keys and auto-migrate
  const legacyKeys = [`glossy_draft_${slug}`, `glossy_doc_${slug}`];
  for (const lk of legacyKeys) {
    const raw = storage.getItem(lk);
    if (!raw) continue;
    try {
      const parsedLegacy = JSON.parse(raw) as Record<string, unknown>;
      if (!parsedLegacy) continue;

      let convertedDoc: TextDocument | null = null;
      if (Array.isArray(parsedLegacy.sentences)) {
        // Detect if sentences contain 'tokens' (editor shape) or 'words' (text shape)
        const hasTokens = parsedLegacy.sentences.some(
          (s: unknown) => s && typeof s === "object" && "tokens" in (s as Record<string, unknown>),
        );

        if (hasTokens) {
          convertedDoc = {
            textId: (parsedLegacy.textId as string) || slug,
            slug: (parsedLegacy.slug as string) || slug,
            title: (parsedLegacy.title as string) || slug,
            author: (parsedLegacy.author as string) || "Anonymous",
            date: (parsedLegacy.date as string) || "c. 9th–10th Century",
            source: (parsedLegacy.source as string) || "Local Working Draft",
            sourceFile: (parsedLegacy.sourceFile as string) || "manuscript.json",
            language: "Old English",
            status: (parsedLegacy.status as "draft" | "published" | "review") || "draft",
            blocks: (parsedLegacy.blocks as TextDocument["blocks"]) || [],
            sentences: (parsedLegacy.sentences as Array<Record<string, unknown>>).map(
              (sent, sIdx: number) => ({
                id: (sent.id as string) || `sent-${sIdx + 1}`,
                translation: (sent.freeTranslation as string) || (sent.translation as string) || "",
                footnotes: sent.footnotes as string[] | undefined,
                notes: sent.notes as NoteItem[] | undefined,
                words: (
                  ((sent.tokens || sent.words || []) as Array<Record<string, unknown>>)
                ).map((tok, tIdx: number) => ({
                  id: (tok.id as string) || `w-${sIdx + 1}-${tIdx + 1}`,
                  originalWord: (tok.sourceForm as string) || (tok.originalWord as string) || "",
                  morphologicalGloss:
                    (tok.sourceGloss as string) || (tok.morphologicalGloss as string) || "",
                  sourceGlossTex: (tok.literalTexGloss as string) || "",
                  analysis: {
                    lemma: (tok.lemma as string) || "",
                    partOfSpeech: ((tok.pos || tok.partOfSpeech || "noun") as PartOfSpeech),
                    definition: (tok.explanation as string) || (tok.definition as string) || "",
                    phonetic: (tok.ipa as string) || (tok.phonetic as string) || "",
                    wiktionaryUrl: tok.wiktionaryUrl as string | undefined,
                    morphemes: (
                      (tok.morphemes as Array<{ original?: string; form?: string; morpheme?: string; gloss: string }>) || []
                    ).map((m, mIdx) => ({
                      id: `${(tok.id as string) || "w"}-m-${mIdx}`,
                      form: m.form || m.original || m.morpheme || "",
                      gloss: m.gloss || "",
                    })),
                    features: (tok.inflections as Record<string, string>) || {},
                  },
                })),
              }),
            ),
          };
        } else {
          convertedDoc = parsedLegacy as unknown as TextDocument;
        }
      }

      if (convertedDoc && convertedDoc.title) {
        delete (convertedDoc as Record<string, unknown>).texSource;
        delete (convertedDoc as Record<string, unknown>)["tex-source"];
        const envelope: StoredDraft = {
          version: 1,
          doc: convertedDoc,
          baseHash: computeDocumentHash(convertedDoc),
          updatedAt: new Date().toISOString(),
        };
        // Migrate to versioned storage
        writeDraft(slug, convertedDoc);
        return envelope;
      }
    } catch {}
  }

  return null;
}

export function writeDraft(slug: string, doc: TextDocument): StorageResult<StoredDraft> {
  const storage = getStorage();
  if (!storage) {
    return { ok: false, reason: "unavailable", message: "Browser local storage is not accessible.", error: "Browser local storage is not accessible." };
  }

  try {
    delete (doc as Record<string, unknown>).texSource;
    delete (doc as Record<string, unknown>)["tex-source"];
    const hash = computeDocumentHash(doc);
    const envelope: StoredDraft = {
      version: 1,
      doc,
      baseHash: hash,
      updatedAt: new Date().toISOString(),
    };

    const v1Key = `${DRAFT_STORAGE_PREFIX}${slug}`;
    storage.setItem(v1Key, safeJsonStringify(envelope));

    // Also update pending manifest
    markPending(slug, doc, hash);

    return { ok: true, data: envelope };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Storage error";
    const isQuota = msg.toLowerCase().includes("quota") || msg.toLowerCase().includes("exceeded");
    return {
      ok: false,
      reason: isQuota ? "quota" : "unavailable",
      message: isQuota
        ? "LocalStorage quota exceeded. Please discard old drafts to free space."
        : msg,
      error: msg,
    };
  }
}

export function deleteLocalDraft(slug: string): boolean {
  const storage = getStorage();
  if (!storage || !slug) return false;

  try {
    const slugsToDelete = [slug];
    if (slug === "ohthere") slugsToDelete.push("ohthere-wulfstan");
    if (slug === "ohthere-wulfstan") slugsToDelete.push("ohthere");

    for (const s of slugsToDelete) {
      storage.removeItem(`${DRAFT_STORAGE_PREFIX}${s}`);
      storage.removeItem(`glossy_draft_${s}`);
      storage.removeItem(`glossy_doc_${s}`);
    }

    // Remove from pending manifest
    const manifest = listPending();
    for (const s of slugsToDelete) {
      delete manifest[s];
    }
    storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(manifest));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("glossy:drafts-updated"));
    }
    return true;
  } catch {
    return false;
  }
}

export function listLocalDrafts(): StoredDraft[] {
  const storage = getStorage();
  if (!storage) return [];

  const results: StoredDraft[] = [];
  const visitedSlugs = new Set<string>();

  try {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }

    for (const key of keys) {
      if (key.startsWith(DRAFT_STORAGE_PREFIX)) {
        const slug = key.slice(DRAFT_STORAGE_PREFIX.length);
        if (!visitedSlugs.has(slug)) {
          visitedSlugs.add(slug);
          const draft = readDraft(slug);
          if (draft) results.push(draft);
        }
      } else if (key.startsWith("glossy_draft_")) {
        const slug = key.slice("glossy_draft_".length);
        if (!visitedSlugs.has(slug)) {
          visitedSlugs.add(slug);
          const draft = readDraft(slug);
          if (draft) results.push(draft);
        }
      }
    }
  } catch {}

  return results;
}

export function listPending(): Record<string, PendingDraftEntry> {
  const storage = getStorage();
  if (!storage) return {};

  try {
    const raw = storage.getItem(PENDING_MANIFEST_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PendingDraftEntry>) : {};
  } catch {
    return {};
  }
}

export function markPending(slug: string, doc: TextDocument, currentHash?: string): void {
  const storage = getStorage();
  if (!storage || !slug) return;

  try {
    const manifest = listPending();
    const wordsCount = (doc.sentences || []).reduce(
      (acc, s) => acc + (s.words?.length || 0),
      0,
    );

    manifest[slug] = {
      slug,
      title: doc.title || slug,
      updatedAt: new Date().toISOString(),
      sentenceCount: doc.sentences?.length || 0,
      wordCount: wordsCount,
      synced: false,
      baseHash: currentHash || computeDocumentHash(doc),
    };

    storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(manifest));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("glossy:drafts-updated"));
    }
  } catch {}
}

export function markDraftAsSynced(slug: string, syncedHash?: string): void {
  const storage = getStorage();
  if (!storage || !slug) return;

  try {
    const manifest = listPending();
    if (manifest[slug]) {
      manifest[slug].synced = true;
      if (syncedHash) {
        manifest[slug].baseHash = syncedHash;
      }
      storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(manifest));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("glossy:drafts-updated"));
      }
    }
  } catch {}
}

export function getHiddenSlugs(): string[] {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(HIDDEN_SLUGS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function hideBuiltInText(slug: string): void {
  const storage = getStorage();
  if (!storage || !slug) return;

  try {
    const hidden = new Set(getHiddenSlugs());
    hidden.add(slug);
    storage.setItem(HIDDEN_SLUGS_KEY, JSON.stringify(Array.from(hidden)));
  } catch {}
}

export function restoreHiddenText(slug: string): void {
  const storage = getStorage();
  if (!storage || !slug) return;

  try {
    const hidden = new Set(getHiddenSlugs());
    hidden.delete(slug);
    storage.setItem(HIDDEN_SLUGS_KEY, JSON.stringify(Array.from(hidden)));
  } catch {}
}

export function restoreAllHiddenTexts(): void {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(HIDDEN_SLUGS_KEY);
  } catch {}
}

export function getLocalDraft(slug: string): TextDocument | null {
  const draft = readDraft(slug);
  return draft ? draft.doc : null;
}

export function createLocalDocument(input: {
  title: string;
  author?: string;
  editor?: string;
  shelfmark?: string;
  dialect?: string;
  historicalDate?: string;
  sourceEdition?: string;
  source?: string;
  slug?: string;
  sentences?: TextDocument["sentences"];
  overwrite?: boolean;
}): StorageResult<TextDocument> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, reason: "invalid", message: "Document title is required.", error: "Document title is required." };
  }

  const generatedSlug = (input.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `text-${Date.now()}`;

  if (isBuiltInSlug(generatedSlug) && !input.overwrite) {
    return {
      ok: false,
      reason: "invalid",
      message: `The slug "${generatedSlug}" collides with a protected built-in corpus text. Please choose a different title or slug.`,
      error: `The slug "${generatedSlug}" collides with a protected built-in corpus text.`,
    };
  }

  const presetMeta = ALL_PRESETS_METADATA[generatedSlug];
  const doc: TextDocument = {
    textId: generatedSlug,
    slug: generatedSlug,
    title: title || presetMeta?.title || generatedSlug,
    author: input.author?.trim() || presetMeta?.author || "Anonymous",
    editor: input.editor?.trim() || presetMeta?.editor || "Tyler Lemon",
    shelfmark: input.shelfmark?.trim() || presetMeta?.shelfmark || presetMeta?.witness,
    dialect: input.dialect?.trim() || presetMeta?.dialect,
    historicalDate: input.historicalDate?.trim() || presetMeta?.historicalDate || presetMeta?.origDate,
    sourceEdition: input.sourceEdition?.trim() || presetMeta?.sourceEdition,
    date: input.historicalDate?.trim() || presetMeta?.historicalDate || presetMeta?.origDate || "c. 9th–11th Century",
    source: input.shelfmark?.trim() || input.source?.trim() || presetMeta?.source || presetMeta?.witness || "User Uploaded / Local Draft",
    sourceFile: `${generatedSlug}.json`,
    language: "Old English",
    status: "draft",
    blocks: [],
    sentences: input.sentences || [],
  };

  const writeRes = writeDraft(generatedSlug, doc);
  if (!writeRes.ok) {
    return writeRes;
  }

  return { ok: true, data: doc };
}

export interface WorkspaceTextItem {
  slug: string;
  title: string;
}

export function isWorkspaceSlug(slug: string): boolean {
  if (!slug) return false;
  const s = slug.toLowerCase();
  if (isProtectedSlug(s)) return true;
  return readDraft(s) !== null;
}

export function getWorkspaceTexts(options?: {
  currentSlug?: string;
  allLoadedTexts?: Array<{ slug: string; title: string }>;
  excludeDeleted?: boolean;
}): WorkspaceTextItem[] {
  const { currentSlug, allLoadedTexts = [], excludeDeleted = true } = options || {};
  const hiddenSlugs = excludeDeleted ? new Set(getHiddenSlugs()) : new Set<string>();

  const items: WorkspaceTextItem[] = [];
  const seenSlugs = new Set<string>();

  // 1. Built-in corpus texts (currently Ohthere)
  for (const text of BUILT_IN_CORPUS) {
    const slug = text.slug;
    if (!hiddenSlugs.has(slug) && !seenSlugs.has(slug)) {
      items.push({ slug, title: text.title });
      seenSlugs.add(slug);
    }
  }

  // 2. Local drafts from user workspace
  const drafts = listLocalDrafts();
  for (const draft of drafts) {
    const slug = draft.doc.slug || draft.doc.textId;
    if (!slug) continue;
    if (!hiddenSlugs.has(slug) && !seenSlugs.has(slug)) {
      items.push({ slug, title: draft.doc.title || slug });
      seenSlugs.add(slug);
    }
  }

  // 3. Current active document, if opened directly via URL and not yet included
  if (
    currentSlug &&
    !seenSlugs.has(currentSlug) &&
    !(currentSlug.toLowerCase() === "ohthere-wulfstan" && seenSlugs.has("ohthere")) &&
    (!excludeDeleted || !hiddenSlugs.has(currentSlug))
  ) {
    const match = allLoadedTexts.find(
      (t) => t.slug.toLowerCase() === currentSlug.toLowerCase(),
    );
    const title = match?.title || getBuiltInMetadata(currentSlug)?.title || currentSlug;
    items.push({ slug: currentSlug, title });
    seenSlugs.add(currentSlug);
  }

  return items;
}

