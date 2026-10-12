import type { TextDocument, ReadingSentence, InterlinearWord, Morpheme, PartOfSpeech, InflectionFeatures } from "./types";
import { safeJsonStringify } from "./safe-json";
import {
  isBuiltInSlug,
  isProtectedSlug,
  BUILT_IN_CORPUS,
  getBuiltInMetadata,
} from "./corpus-registry";

export const DRAFT_STORAGE_PREFIX = "glossy:v1:draft:";
export const PENDING_MANIFEST_KEY = "glossy:v1:pending_drafts";
export const HIDDEN_SLUGS_KEY = "glossy:v1:deleted_slugs";
export const ACTIVE_SLUG_KEY = "glossy:v1:active_slug";
export const TINA_AUTH_STORAGE_KEY = "tinacms-auth";

export interface StoredDraftEnvelope {
  version: 1;
  slug: string;
  baseHash: string;
  savedAt: string;
  updatedAt?: string;
  doc: TextDocument;
}

export type StoredDraft = StoredDraftEnvelope;

export interface PendingDraftEntry {
  slug: string;
  title: string;
  updatedAt: string;
  sentenceCount: number;
  wordCount: number;
  synced: boolean;
  baseHash?: string;
}

export interface DraftDivergenceStatus {
  hasDraft: boolean;
  isDiverged: boolean;
  isUpstreamModified: boolean;
  draftDoc: TextDocument | null;
  baseHash?: string;
  repoHash?: string;
  draftHash?: string;
  updatedAt?: string;
}

export type StorageErrorType =
  | "QUOTA_EXCEEDED"
  | "STORAGE_UNAVAILABLE"
  | "CORRUPTED_DATA"
  | "NOT_FOUND"
  | "INVALID_INPUT";

export type StorageResult<T = void> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: StorageErrorType;
      reason?: "quota" | "invalid" | "unavailable" | "not_found" | "corrupt";
      message: string;
    };

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

let isMigrated = false;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  let storage: Storage | null = null;
  try {
    storage = window.localStorage;
  } catch {
    return null;
  }

  if (storage && !isMigrated) {
    isMigrated = true;
    migrateLegacyDrafts(storage);
  }

  return storage;
}

export function migrateLegacyDrafts(storageOverride?: Storage): { migratedCount: number } {
  let storage: Storage | null = storageOverride || null;
  if (!storage && typeof window !== "undefined") {
    try {
      storage = window.localStorage;
    } catch {
      return { migratedCount: 0 };
    }
  }
  if (!storage) return { migratedCount: 0 };

  let migratedCount = 0;

  try {
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k) keys.push(k);
    }

    // 1. Migrate legacy draft keys: glossy_draft_<slug> and glossy_document_<slug>
    for (const key of keys) {
      let slug = "";
      if (key.startsWith("glossy_draft_")) {
        slug = key.slice("glossy_draft_".length);
      } else if (key.startsWith("glossy_document_")) {
        slug = key.slice("glossy_document_".length);
      }

      if (slug && !slug.includes("snapshot")) {
        const v1Key = `${DRAFT_STORAGE_PREFIX}${slug}`;
        const existingV1 = storage.getItem(v1Key);

        if (!existingV1) {
          const raw = storage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (parsed && typeof parsed === "object") {
                let doc: TextDocument | null = null;

                if (parsed.doc && parsed.doc.sentences) {
                  doc = parsed.doc as TextDocument;
                } else if (parsed.sentences && Array.isArray(parsed.sentences)) {
                  // Check if it is an EditorDocument (sentences containing tokens)
                  const firstSent = parsed.sentences[0];
                  if (firstSent && Array.isArray(firstSent.tokens) && !firstSent.words) {
                    // Convert EditorDocument shape to TextDocument shape
                    doc = {
                      textId: parsed.textId || slug,
                      slug: parsed.slug || slug,
                      language: "Old English",
                      title: parsed.title || slug,
                      author: parsed.author || parsed.glossedBy || "Anonymous",
                      historicalAuthor: parsed.historicalAuthor,
                      glossedBy: parsed.glossedBy,
                      editor: parsed.editor,
                      date: parsed.date || "c. 9th–11th Century",
                      source: parsed.source || slug,
                      sourceFile: parsed.sourceFile || `${slug}.json`,
                      status: parsed.status || "draft",
                      blocks: parsed.blocks || [],
                      sentences: parsed.sentences.map((s: {
                        id?: string;
                        freeTranslation?: string;
                        translation?: string;
                        footnotes?: string[];
                        notes?: ReadingSentence["notes"];
                        tokens?: Array<{
                          id?: string;
                          sourceForm?: string;
                          sourceGloss?: string;
                          literalTexGloss?: string;
                          lemma?: string;
                          pos?: PartOfSpeech;
                          explanation?: string;
                          inflections?: InflectionFeatures;
                          morphemes?: Morpheme[];
                          ipa?: string;
                          wiktionaryUrl?: string;
                          trailingPunctuation?: string;
                          review?: InterlinearWord["review"];
                        }>;
                      }, sIdx: number) => ({
                        id: s.id || `sent-${sIdx + 1}`,
                        translation: s.freeTranslation || s.translation || "",
                        footnotes: s.footnotes,
                        notes: s.notes,
                        words: (s.tokens || []).map((t, tIdx) => ({
                          id: t.id || `sent-${sIdx + 1}-token-${tIdx + 1}`,
                          originalWord: (t.sourceForm || "").replace(/[.,;:!?]+$/, ""),
                          morphologicalGloss: t.sourceGloss || "",
                          trailingPunctuation: t.trailingPunctuation,
                          sourceGlossTex: t.literalTexGloss,
                          analysis: {
                            lemma: t.lemma,
                            partOfSpeech: t.pos,
                            features: t.inflections,
                            morphemes: t.morphemes,
                            definition: t.explanation,
                            phonetic: t.ipa,
                            wiktionaryUrl: t.wiktionaryUrl,
                          },
                          review: t.review,
                        })),
                      })),
                    };
                  } else {
                    doc = parsed as TextDocument;
                  }
                }

                if (doc) {
                  const now = new Date().toISOString();
                  const envelope: StoredDraftEnvelope = {
                    version: 1,
                    slug,
                    baseHash: computeDocumentHash(doc),
                    savedAt: now,
                    updatedAt: now,
                    doc,
                  };
                  storage.setItem(v1Key, safeJsonStringify(envelope));
                  migratedCount++;
                }
              }
            } catch {}
          }
        }
        storage.removeItem(key);
      } else if (key.startsWith("glossy-editor-snapshot-v2-")) {
        storage.removeItem(key);
      }
    }

    // 2. Migrate legacy pending manifest: glossy_pending_drafts -> glossy:v1:pending_drafts
    const legacyPendingRaw = storage.getItem("glossy_pending_drafts");
    if (legacyPendingRaw) {
      try {
        const legacyPending = JSON.parse(legacyPendingRaw);
        const currentV1PendingRaw = storage.getItem(PENDING_MANIFEST_KEY);
        const v1Pending = currentV1PendingRaw ? JSON.parse(currentV1PendingRaw) : {};
        const merged = { ...legacyPending, ...v1Pending };
        storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(merged));
      } catch {}
      storage.removeItem("glossy_pending_drafts");
    }

    // 3. Migrate legacy deleted slugs: glossy_deleted_slugs -> glossy:v1:deleted_slugs
    const legacyDeletedRaw = storage.getItem("glossy_deleted_slugs");
    if (legacyDeletedRaw) {
      try {
        const legacyDeleted = JSON.parse(legacyDeletedRaw);
        const currentV1DeletedRaw = storage.getItem(HIDDEN_SLUGS_KEY);
        const v1Deleted = currentV1DeletedRaw ? JSON.parse(currentV1DeletedRaw) : [];
        const mergedSet = new Set([...(Array.isArray(legacyDeleted) ? legacyDeleted : []), ...(Array.isArray(v1Deleted) ? v1Deleted : [])]);
        storage.setItem(HIDDEN_SLUGS_KEY, JSON.stringify(Array.from(mergedSet)));
      } catch {}
      storage.removeItem("glossy_deleted_slugs");
    }
  } catch {}

  return { migratedCount };
}

export function readDraft(slug: string): StoredDraftEnvelope | null {
  const storage = getStorage();
  if (!storage || !slug) return null;

  const v1Key = `${DRAFT_STORAGE_PREFIX}${slug}`;
  const v1Raw = storage.getItem(v1Key);
  if (!v1Raw) return null;

  try {
    const parsed = JSON.parse(v1Raw) as StoredDraftEnvelope;
    if (parsed && parsed.doc && parsed.version === 1) {
      if (!parsed.savedAt && parsed.updatedAt) {
        parsed.savedAt = parsed.updatedAt;
      }
      if (!parsed.updatedAt && parsed.savedAt) {
        parsed.updatedAt = parsed.savedAt;
      }
      return parsed;
    }
  } catch {}

  return null;
}

export function writeDraft(
  slug: string,
  doc: TextDocument,
  options?: { baseHash?: string }
): StorageResult<StoredDraftEnvelope> {
  const storage = getStorage();
  if (!storage) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Browser local storage is not accessible.",
    };
  }

  try {
    const hash = computeDocumentHash(doc);
    const existing = readDraft(slug);
    const baseHash = options?.baseHash || existing?.baseHash || hash;
    const now = new Date().toISOString();

    const envelope: StoredDraftEnvelope = {
      version: 1,
      slug,
      baseHash,
      savedAt: now,
      updatedAt: now,
      doc,
    };

    const v1Key = `${DRAFT_STORAGE_PREFIX}${slug}`;
    storage.setItem(v1Key, safeJsonStringify(envelope));

    // Also update pending manifest
    markPending(slug, doc, baseHash);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("glossy:drafts-updated", { detail: { slug } }));
    }

    return { ok: true, data: envelope };
  } catch (err: unknown) {
    const isQuota =
      (err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22)) ||
      (err instanceof Error && (err.message.toLowerCase().includes("quota") || err.message.toLowerCase().includes("exceeded")));

    if (isQuota) {
      return {
        ok: false,
        error: "QUOTA_EXCEEDED",
        reason: "quota",
        message: "LocalStorage quota exceeded. Please discard old drafts to free space.",
      };
    }
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Storage error",
    };
  }
}

export function deleteLocalDraft(slug: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable or invalid slug.",
    };
  }

  try {
    storage.removeItem(`${DRAFT_STORAGE_PREFIX}${slug}`);

    // Remove from pending manifest
    const manifest = listPending();
    delete manifest[slug];
    storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(manifest));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("glossy:drafts-updated", { detail: { slug } }));
    }
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Delete operation failed.",
    };
  }
}

export function listLocalDrafts(): StoredDraftEnvelope[] {
  const storage = getStorage();
  if (!storage) return [];

  const results: StoredDraftEnvelope[] = [];
  const visitedSlugs = new Set<string>();

  try {
    const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i)).filter(
      (k): k is string => Boolean(k),
    );

    for (const key of keys) {
      if (key.startsWith(DRAFT_STORAGE_PREFIX)) {
        const slug = key.slice(DRAFT_STORAGE_PREFIX.length);
        const lower = slug.toLowerCase();
        if (!visitedSlugs.has(lower)) {
          visitedSlugs.add(lower);
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

export function markPending(slug: string, doc: TextDocument, currentHash?: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable or invalid slug.",
    };
  }

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
      window.dispatchEvent(new CustomEvent("glossy:drafts-updated", { detail: { slug } }));
    }
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Failed to update pending manifest.",
    };
  }
}

export function markDraftAsSynced(slug: string, syncedHash?: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable or invalid slug.",
    };
  }

  try {
    const manifest = listPending();
    if (manifest[slug]) {
      manifest[slug].synced = true;
      if (syncedHash) {
        manifest[slug].baseHash = syncedHash;
      }
      storage.setItem(PENDING_MANIFEST_KEY, JSON.stringify(manifest));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("glossy:drafts-updated", { detail: { slug } }));
      }
    }
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Failed to mark draft as synced.",
    };
  }
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

export function hideBuiltInText(slug: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable or invalid slug.",
    };
  }

  try {
    const hidden = new Set(getHiddenSlugs());
    hidden.add(slug);
    storage.setItem(HIDDEN_SLUGS_KEY, JSON.stringify(Array.from(hidden)));
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Failed to hide text.",
    };
  }
}

export function restoreHiddenText(slug: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable or invalid slug.",
    };
  }

  try {
    const hidden = new Set(getHiddenSlugs());
    hidden.delete(slug);
    storage.setItem(HIDDEN_SLUGS_KEY, JSON.stringify(Array.from(hidden)));
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Failed to restore text.",
    };
  }
}

export function restoreAllHiddenTexts(): StorageResult<void> {
  const storage = getStorage();
  if (!storage) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: "Storage unavailable.",
    };
  }

  try {
    storage.removeItem(HIDDEN_SLUGS_KEY);
    return { ok: true, data: undefined };
  } catch (err) {
    return {
      ok: false,
      error: "STORAGE_UNAVAILABLE",
      reason: "unavailable",
      message: err instanceof Error ? err.message : "Failed to restore all hidden texts.",
    };
  }
}

export function getLocalDraft(slug: string): TextDocument | null {
  const draft = readDraft(slug);
  return draft ? draft.doc : null;
}

export function getDraftDivergenceStatus(
  slug: string,
  repoDoc?: TextDocument | null
): DraftDivergenceStatus {
  const draft = readDraft(slug);
  if (!draft || !draft.doc) {
    return {
      hasDraft: false,
      isDiverged: false,
      isUpstreamModified: false,
      draftDoc: null,
    };
  }

  const draftHash = computeDocumentHash(draft.doc);

  if (repoDoc) {
    const repoHash = computeDocumentHash(repoDoc);
    const isDiverged = draftHash !== repoHash;
    const isUpstreamModified = Boolean(
      draft.baseHash &&
        draft.baseHash !== repoHash &&
        draftHash !== repoHash
    );

    return {
      hasDraft: true,
      isDiverged,
      isUpstreamModified,
      draftDoc: draft.doc,
      baseHash: draft.baseHash,
      repoHash,
      draftHash,
      updatedAt: draft.savedAt || draft.updatedAt,
    };
  }

  return {
    hasDraft: true,
    isDiverged: true,
    isUpstreamModified: false,
    draftDoc: draft.doc,
    baseHash: draft.baseHash,
    draftHash,
    updatedAt: draft.savedAt || draft.updatedAt,
  };
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
    return {
      ok: false,
      error: "INVALID_INPUT",
      reason: "invalid",
      message: "Document title is required.",
    };
  }

  const generatedSlug = (input.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `text-${Date.now()}`;

  if (isBuiltInSlug(generatedSlug) && !input.overwrite) {
    return {
      ok: false,
      error: "INVALID_INPUT",
      reason: "invalid",
      message: `The slug "${generatedSlug}" collides with a protected built-in corpus text. Please choose a different title or slug.`,
    };
  }

  const doc: TextDocument = {
    textId: generatedSlug,
    slug: generatedSlug,
    title,
    author: input.author?.trim() || "Anonymous",
    editor: input.editor?.trim() || "Tyler Lemon",
    shelfmark: input.shelfmark?.trim(),
    dialect: input.dialect?.trim(),
    historicalDate: input.historicalDate?.trim(),
    sourceEdition: input.sourceEdition?.trim(),
    date: input.historicalDate?.trim() || "c. 9th–11th Century",
    source: input.shelfmark?.trim() || input.source?.trim() || "User Uploaded / Local Draft",
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

  // 1. Built-in corpus texts
  for (const text of BUILT_IN_CORPUS) {
    const slug = text.slug;
    if (!hiddenSlugs.has(slug) && !seenSlugs.has(slug.toLowerCase())) {
      items.push({ slug, title: text.title });
      seenSlugs.add(slug.toLowerCase());
    }
  }

  // 2. Local drafts from user workspace
  const drafts = listLocalDrafts();
  for (const draft of drafts) {
    const slug = draft.doc.slug || draft.doc.textId;
    if (!slug) continue;
    if (!hiddenSlugs.has(slug) && !seenSlugs.has(slug.toLowerCase())) {
      items.push({ slug, title: draft.doc.title || slug });
      seenSlugs.add(slug.toLowerCase());
    }
  }

  // 3. Current active document, if opened directly via URL and not yet included
  if (
    currentSlug &&
    !seenSlugs.has(currentSlug.toLowerCase()) &&
    (!excludeDeleted || !hiddenSlugs.has(currentSlug))
  ) {
    const match = allLoadedTexts.find(
      (t) => t.slug.toLowerCase() === currentSlug.toLowerCase(),
    );
    const title = match?.title || getBuiltInMetadata(currentSlug)?.title || currentSlug;
    items.push({ slug: currentSlug, title });
    seenSlugs.add(currentSlug.toLowerCase());
  }

  return items;
}

export function getActiveSlug(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    return storage.getItem(ACTIVE_SLUG_KEY);
  } catch {
    return null;
  }
}

export function setActiveSlug(slug: string): StorageResult<void> {
  const storage = getStorage();
  if (!storage || !slug) {
    return { ok: false, error: "STORAGE_UNAVAILABLE", message: "Storage unavailable or empty slug." };
  }
  try {
    storage.setItem(ACTIVE_SLUG_KEY, slug);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: "STORAGE_UNAVAILABLE", message: err instanceof Error ? err.message : "Failed to set active slug." };
  }
}

export function clearActiveSlug(): StorageResult<void> {
  const storage = getStorage();
  if (!storage) {
    return { ok: false, error: "STORAGE_UNAVAILABLE", message: "Storage unavailable." };
  }
  try {
    storage.removeItem(ACTIVE_SLUG_KEY);
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: "STORAGE_UNAVAILABLE", message: err instanceof Error ? err.message : "Failed to clear active slug." };
  }
}

export function getTinaAuthToken(): string | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(TINA_AUTH_STORAGE_KEY);
    if (!raw) return null;

    let token = raw.trim();

    // If stored as JSON object (e.g. {"access_token": "...", "id_token": "..."}), extract token
    if (token.startsWith("{") && token.endsWith("}")) {
      try {
        const parsed = JSON.parse(token);
        if (parsed && typeof parsed === "object") {
          token = String(
            parsed.access_token ||
            parsed.id_token ||
            parsed.token ||
            parsed.accessToken ||
            parsed.idToken ||
            ""
          ).trim();
        }
      } catch {
        // Fall back to raw string if parsing fails
      }
    }

    // Strip wrapping quotes if any
    if (
      (token.startsWith('"') && token.endsWith('"')) ||
      (token.startsWith("'") && token.endsWith("'"))
    ) {
      token = token.slice(1, -1).trim();
    }

    // Strip leading "Bearer " if already present
    if (token.toLowerCase().startsWith("bearer ")) {
      token = token.slice(7).trim();
    }

    // Strip newlines, carriage returns, tabs, and control characters
    token = token.replace(/[\r\n\t\x00-\x1f\x7f]+/g, "").trim();

    return token.length > 0 ? token : null;
  } catch {
    return null;
  }
}
