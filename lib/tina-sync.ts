import type { TextDocument } from "./types";
import { computeDocumentHash, markDraftAsSynced } from "./local-drafts";

export interface TinaCommitResult {
  status: "committed" | "needs_auth" | "error" | "draft_saved";
  message: string;
  errorDetails?: string;
}

export async function syncDocumentToTina(
  doc: TextDocument,
  fileName?: string,
): Promise<TinaCommitResult> {
  const slug = doc.slug || doc.textId;
  const targetFileName = `${fileName || slug}.json`;

  const payload = {
    query: `
      mutation UpdateTextMutation($relativePath: String!, $params: TextParams!) {
        updateText(relativePath: $relativePath, params: $params) {
          __typename
        }
      }
    `,
    variables: {
      relativePath: targetFileName,
      params: {
        textId: doc.textId || slug,
        slug: doc.slug || slug,
        language: doc.language || "Old English",
        author: doc.author || "",
        title: doc.title || "",
        source: doc.source || "",
        sourceFile: doc.sourceFile || `${slug}.json`,
        sourceEdition: doc.sourceEdition || "",
        status: doc.status || "draft",
        sentences: (doc.sentences || []).map((sent) => ({
          id: sent.id,
          translation: sent.translation || "",
          footnotes: sent.footnotes || [],
          words: (sent.words || []).map((w) => ({
            id: w.id,
            originalWord: w.originalWord,
            morphologicalGloss: w.morphologicalGloss || "",
            trailingPunctuation: w.trailingPunctuation || "",
            sourceGlossTex: w.sourceGlossTex || "",
            analysis: w.analysis
              ? {
                  lemma: w.analysis.lemma || "",
                  partOfSpeech: w.analysis.partOfSpeech || "",
                  definition: w.analysis.definition || "",
                  phonetic: w.analysis.phonetic || "",
                  pronunciationSource: w.analysis.pronunciationSource || "",
                  historicalNote: w.analysis.historicalNote || "",
                  wiktionaryUrl: w.analysis.wiktionaryUrl || "",
                  features: w.analysis.features
                    ? {
                        case: w.analysis.features.case,
                        number: w.analysis.features.number,
                        gender: w.analysis.features.gender,
                        person:
                          w.analysis.features.person != null
                            ? Number(w.analysis.features.person)
                            : undefined,
                        tense: w.analysis.features.tense,
                        mood: w.analysis.features.mood,
                        degree: w.analysis.features.degree,
                      }
                    : undefined,
                  morphemes: (w.analysis.morphemes || []).map((m) => ({
                    form: m.form || "",
                    gloss: m.gloss || "",
                    kind: m.kind || "stem",
                  })),
                }
              : undefined,
          })),
        })),
      },
    },
  };

  try {
    const res = await fetch("/admin/index.html", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        return {
          status: "needs_auth",
          message: "TinaCMS authentication required to commit to Git repository. Please sign in via Tina Admin.",
        };
      }
      return {
        status: "error",
        message: `TinaCMS GraphQL server returned HTTP ${res.status}. Draft preserved locally.`,
      };
    }

    const json = (await res.json()) as { errors?: Array<{ message?: string }> };
    if (json.errors && json.errors.length > 0) {
      const errMsg = json.errors
        .map((e) => e.message || "Unknown error")
        .join("; ");
      return {
        status: "error",
        message: `TinaCMS mutation failed: ${errMsg}`,
        errorDetails: errMsg,
      };
    }

    const currentHash = computeDocumentHash(doc);
    markDraftAsSynced(slug, currentHash);

    return {
      status: "committed",
      message: `Successfully committed "${doc.title}" to TinaCMS / Git repository!`,
    };
  } catch {
    return {
      status: "draft_saved",
      message: "Saved working draft to browser storage. (GraphQL backend unreachable; sign in via Tina Admin to commit.)",
    };
  }
}
