import type { TextDocument } from "./types";
import {
  readDraft,
  listPending,
  markDraftAsSynced,
  computeDocumentHash,
  getTinaAuthToken,
} from "./local-drafts";
import { TINA_LOCAL_GRAPHQL_URL, getTinaCloudUrl } from "./tina-config";

export type CommitOutcome = "committed" | "needs-login" | "unreachable" | "rejected";

export interface CommitResult {
  outcome: CommitOutcome;
  ok: boolean;
  slug: string;
  error?: string;
  errors?: string[];
}

export interface BatchCommitResult {
  committedSlugs: string[];
  failedSlugs: string[];
  errors: Record<string, string>;
  outcomes: Record<string, CommitOutcome>;
}

export function sanitizeDraftForTinaMutation(
  draftDoc: Record<string, unknown> | TextDocument,
): Record<string, unknown> {
  const doc = draftDoc as Record<string, unknown>;
  const sentencesRaw = Array.isArray(doc.sentences) ? doc.sentences : [];

  const sentences = sentencesRaw.map((s: Record<string, unknown>) => {
    const wordsRaw = Array.isArray(s.words)
      ? s.words
      : Array.isArray(s.tokens)
      ? s.tokens
      : [];

    const words = wordsRaw.map((w: Record<string, unknown>) => {
      const wordObj: Record<string, unknown> = {
        id: String(w.id || ""),
        originalWord: String(w.originalWord || w.sourceForm || ""),
        morphologicalGloss: String(w.morphologicalGloss || w.sourceGloss || ""),
        trailingPunctuation: w.trailingPunctuation ? String(w.trailingPunctuation) : undefined,
        sourceGlossTex: String(w.sourceGlossTex || w.literalTexGloss || ""),
      };

      if ((w.analysis && typeof w.analysis === "object") || w.lemma || w.pos || w.explanation) {
        const a = (
          w.analysis && typeof w.analysis === "object" ? w.analysis : {}
        ) as Record<string, unknown>;

        const analysisObj: Record<string, unknown> = {
          lemma: String(a.lemma || w.lemma || ""),
          partOfSpeech: String(a.partOfSpeech || w.pos || ""),
          definition: String(a.definition || w.explanation || ""),
          phonetic: (a.phonetic || w.ipa) ? String(a.phonetic || w.ipa) : undefined,
          pronunciationSource: a.pronunciationSource ? String(a.pronunciationSource) : undefined,
          historicalNote: a.historicalNote ? String(a.historicalNote) : undefined,
          wiktionaryUrl: (a.wiktionaryUrl || w.wiktionaryUrl) ? String(a.wiktionaryUrl || w.wiktionaryUrl) : undefined,
        };

        const featuresRaw = (a.features || w.inflections || {}) as Record<string, unknown>;
        if (featuresRaw && typeof featuresRaw === "object" && Object.keys(featuresRaw).length > 0) {
          const featuresObj: Record<string, unknown> = {};
          if (featuresRaw.case) featuresObj.case = String(featuresRaw.case);
          if (featuresRaw.number) featuresObj.number = String(featuresRaw.number);
          if (featuresRaw.gender) featuresObj.gender = String(featuresRaw.gender);
          if (featuresRaw.person != null) {
            const p = Number(featuresRaw.person);
            if (!isNaN(p)) featuresObj.person = p;
          }
          if (featuresRaw.tense) featuresObj.tense = String(featuresRaw.tense);
          if (featuresRaw.mood) featuresObj.mood = String(featuresRaw.mood);
          if (featuresRaw.degree) featuresObj.degree = String(featuresRaw.degree);
          if (featuresRaw.declension) featuresObj.declension = String(featuresRaw.declension);
          if (featuresRaw.voice) featuresObj.voice = String(featuresRaw.voice);
          analysisObj.features = featuresObj;
        }

        const morphemesRaw = Array.isArray(a.morphemes)
          ? a.morphemes
          : Array.isArray(w.morphemes)
          ? w.morphemes
          : [];
        analysisObj.morphemes = morphemesRaw.map((m: Record<string, unknown>) => {
          const res: Record<string, unknown> = {
            form: String(m.form || ""),
            gloss: String(m.gloss || ""),
          };
          if (m.id) res.id = String(m.id);
          if (m.kind) res.kind = String(m.kind);
          return res;
        });

        Object.keys(analysisObj).forEach((k) => analysisObj[k] === undefined && delete analysisObj[k]);
        wordObj.analysis = analysisObj;
      }

      if (w.review && typeof w.review === "object") {
        const r = w.review as Record<string, unknown>;
        const src = (
          r.source && typeof r.source === "object" ? r.source : {}
        ) as Record<string, unknown>;
        wordObj.review = {
          status: String(r.status || "source-checked"),
          notes: String(r.notes || ""),
          source: {
            file: String(src.file || ""),
            locator: String(src.locator || ""),
          },
        };
      }

      Object.keys(wordObj).forEach((k) => wordObj[k] === undefined && delete wordObj[k]);
      return wordObj;
    });

    const footnotesRaw = Array.isArray(s.footnotes) ? s.footnotes : [];
    const notesRaw = Array.isArray(s.notes) ? s.notes : [];
    const notes = notesRaw.map((n: Record<string, unknown>) => ({
      id: String(n.id || ""),
      targetWordIndex: n.targetWordIndex != null ? Number(n.targetWordIndex) : undefined,
      marker: n.marker ? String(n.marker) : undefined,
      type: String(n.type || "general"),
      text: String(n.text || ""),
    }));

    const sentObj: Record<string, unknown> = {
      id: String(s.id || ""),
      translation: String(s.translation || s.freeTranslation || ""),
      footnotes: footnotesRaw.length > 0 ? footnotesRaw.map((fn: unknown) => String(fn)) : undefined,
      notes: notes.length > 0 ? notes : undefined,
      words,
    };
    Object.keys(sentObj).forEach((k) => sentObj[k] === undefined && delete sentObj[k]);
    return sentObj;
  });

  const resDoc: Record<string, unknown> = {
    textId: String(doc.textId || doc.slug || ""),
    slug: String(doc.slug || doc.textId || ""),
    language: String(doc.language || "Old English"),
    author: String(doc.author || ""),
    historicalAuthor: doc.historicalAuthor ? String(doc.historicalAuthor) : undefined,
    glossedBy: doc.glossedBy ? String(doc.glossedBy) : undefined,
    editor: doc.editor ? String(doc.editor) : undefined,
    shelfmark: doc.shelfmark ? String(doc.shelfmark) : undefined,
    dialect: doc.dialect ? String(doc.dialect) : undefined,
    historicalDate: doc.historicalDate ? String(doc.historicalDate) : undefined,
    title: String(doc.title || ""),
    source: String(doc.source || ""),
    sourceFile: String(doc.sourceFile || ""),
    sourceEdition: doc.sourceEdition ? String(doc.sourceEdition) : undefined,
    status: String(doc.status || "draft"),
    sentences,
  };
  Object.keys(resDoc).forEach((k) => resDoc[k] === undefined && delete resDoc[k]);
  return resDoc as unknown as ReturnType<typeof sanitizeDraftForTinaMutation>;
}

export function isTinaAuthenticated(cms?: unknown): boolean {
  if (typeof window === "undefined") return false;

  // Check cms instance API
  if (cms && typeof cms === "object" && "api" in cms) {
    const tinaApi = (cms as { api?: { tina?: { request?: unknown } } })?.api?.tina;
    if (typeof tinaApi?.request === "function") {
      return true;
    }
  }

  // Check local dev server
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return true;
  }

  // Check stored auth token via centralized storage helper
  const token = getTinaAuthToken();
  return Boolean(token);
}

export const UPDATE_TEXT_MUTATION = `
  mutation UpdateText($relativePath: String!, $params: TextMutation!) {
    updateText(relativePath: $relativePath, params: $params) {
      id
      title
      _sys { relativePath }
    }
  }
`;

export async function commitPendingDraft(
  slug: string,
  options?: { cms?: unknown },
): Promise<CommitResult> {
  if (typeof window === "undefined") {
    return {
      outcome: "unreachable",
      ok: false,
      slug,
      error: "Window object unavailable.",
    };
  }

  const storedDraft = readDraft(slug);
  if (!storedDraft?.doc) {
    return {
      outcome: "rejected",
      ok: false,
      slug,
      error: `No local draft document found for slug: ${slug}`,
    };
  }

  const textDoc = storedDraft.doc;
  const draftDoc = storedDraft.doc as unknown as Record<string, unknown>;

  const sanitizedParams = sanitizeDraftForTinaMutation(draftDoc);
  const contentHash = textDoc ? computeDocumentHash(textDoc) : computeDocumentHash(sanitizedParams as unknown as TextDocument);
  const fileName = (draftDoc.fileName || draftDoc.textId || slug) as string;
  const relativePath = `${fileName.endsWith(".json") ? fileName : `${fileName}.json`}`;

  // Attempt 1: Using TinaCMS client API object
  if (options?.cms && typeof options.cms === "object" && "api" in options.cms) {
    const tinaApi = (options.cms as {
      api?: {
        tina?: {
          request: (
            query: string,
            options?: { variables: Record<string, unknown> },
          ) => Promise<{ data?: unknown; errors?: Array<{ message: string }> }>;
        };
      };
    })?.api?.tina;

    if (tinaApi?.request) {
      try {
        const res = await tinaApi.request(UPDATE_TEXT_MUTATION, {
          variables: { relativePath, params: sanitizedParams },
        });

        if (res?.errors && res.errors.length > 0) {
          const errMsgs = res.errors.map((e) => e.message);
          return {
            outcome: "rejected",
            ok: false,
            slug,
            error: errMsgs[0] || "GraphQL mutation rejected",
            errors: errMsgs,
          };
        }

        markDraftAsSynced(slug, contentHash);
        return { outcome: "committed", ok: true, slug };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Tina API client request failed";
        const isAuthErr = msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("unauthorized");
        return {
          outcome: isAuthErr ? "needs-login" : "rejected",
          ok: false,
          slug,
          error: msg,
        };
      }
    }
  }

  // Attempt 2: Localhost GraphQL endpoint
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    try {
      const res = await fetch(TINA_LOCAL_GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: UPDATE_TEXT_MUTATION,
          variables: { relativePath, params: sanitizedParams },
        }),
      });

      if (res.status === 401 || res.status === 403) {
        return {
          outcome: "needs-login",
          ok: false,
          slug,
          error: "TinaCMS authentication required.",
        };
      }

      const json = await res.json();
      if (json.errors && json.errors.length > 0) {
        const errMsgs = json.errors.map((e: { message: string }) => e.message);
        return {
          outcome: "rejected",
          ok: false,
          slug,
          error: errMsgs[0] || "GraphQL mutation rejected",
          errors: errMsgs,
        };
      }

      if (json.data?.updateText || json.data?.updateDocument) {
        markDraftAsSynced(slug, contentHash);
        return { outcome: "committed", ok: true, slug };
      }
    } catch (err) {
      // Fallthrough to TinaCloud if localhost connection failed
      console.warn("[tina-sync] Localhost GraphQL request failed:", err);
    }
  }

  // Attempt 3: TinaCloud with tinacms-auth token via centralized storage helper
  const authToken = getTinaAuthToken();
  if (authToken) {
    try {
      const cloudUrl = getTinaCloudUrl();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const cleanToken = authToken.replace(/[\r\n\t\x00-\x1f\x7f]+/g, "").trim();
      if (cleanToken) {
        headers["Authorization"] = `Bearer ${cleanToken}`;
      }

      const res = await fetch(cloudUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query: UPDATE_TEXT_MUTATION,
          variables: { relativePath, params: sanitizedParams },
        }),
      });

      if (res.status === 401 || res.status === 403) {
        return {
          outcome: "needs-login",
          ok: false,
          slug,
          error: "TinaCloud authentication token invalid or expired. Please log in again.",
        };
      }

      const json = await res.json();
      if (json.errors && json.errors.length > 0) {
        const errMsgs = json.errors.map((e: { message: string }) => e.message);
        return {
          outcome: "rejected",
          ok: false,
          slug,
          error: errMsgs[0] || "TinaCloud GraphQL error",
          errors: errMsgs,
        };
      }

      if (json.data?.updateText || json.data?.updateDocument) {
        markDraftAsSynced(slug, contentHash);
        return { outcome: "committed", ok: true, slug };
      }
    } catch (err) {
      return {
        outcome: "unreachable",
        ok: false,
        slug,
        error: err instanceof Error ? err.message : "TinaCloud commit network failure",
      };
    }
  }

  return {
    outcome: "needs-login",
    ok: false,
    slug,
    error: "TinaCMS authentication required. Please sign in to Tina Admin to commit.",
  };
}

export async function commitAllPendingDrafts(
  options?: { cms?: unknown },
): Promise<BatchCommitResult> {
  const pending = listPending();
  const unsyncedSlugs = Object.keys(pending).filter((s) => !pending[s].synced);

  const committedSlugs: string[] = [];
  const failedSlugs: string[] = [];
  const errors: Record<string, string> = {};
  const outcomes: Record<string, CommitOutcome> = {};

  for (const slug of unsyncedSlugs) {
    const res = await commitPendingDraft(slug, options);
    outcomes[slug] = res.outcome;
    if (res.ok) {
      committedSlugs.push(slug);
    } else {
      failedSlugs.push(slug);
      if (res.error) {
        errors[slug] = res.error;
      }
    }
  }

  return { committedSlugs, failedSlugs, errors, outcomes };
}
