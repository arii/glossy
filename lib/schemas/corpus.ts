import { z } from "zod";

export const WordTokenSchema = z
  .object({
    id: z.string(),
    originalWord: z.string(),
    morphologicalGloss: z.string().default(""),
    lemmaRef: z.string().nullable().default(null),
    selectedSenseId: z.string().optional(),
    features: z.record(z.string(), z.string()).optional(),
    contextualOverride: z
      .object({
        definition: z.string().optional(),
        pos: z.string().optional(),
        notes: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export const SentenceSchema = z.preprocess(
  (val) => {
    if (typeof val === "object" && val !== null) {
      const obj = { ...(val as Record<string, unknown>) };
      if (!obj.tokens && Array.isArray(obj.words)) {
        obj.tokens = obj.words;
      }
      if (!obj.words && Array.isArray(obj.tokens)) {
        obj.words = obj.tokens;
      }
      if (!obj.originalText && Array.isArray(obj.tokens)) {
        obj.originalText = (obj.tokens as Array<Record<string, unknown>>)
          .map((t) => (t?.originalWord as string) || "")
          .join(" ");
      }
      return obj;
    }
    return val;
  },
  z
    .object({
      id: z.string(),
      sentenceNumber: z.number().int().positive().default(1),
      originalText: z.string().default(""),
      translation: z.string().default(""),
      tokens: z.array(WordTokenSchema),
      words: z.array(WordTokenSchema).optional(),
    })
    .passthrough(),
);

export const TextDocumentSchema = z
  .object({
    textId: z.string().optional(),
    slug: z.string(),
    title: z.string(),
    author: z.string().default("Anonymous"),
    editor: z.string().default(""),
    date: z.string().default(""),
    edition: z.string().default(""),
    shelfmark: z.string().optional(),
    dialect: z.string().optional(),
    historicalDate: z.string().optional(),
    historicalAuthor: z.string().optional(),
    glossedBy: z.string().optional(),
    source: z.string().default(""),
    sourceFile: z.string().default(""),
    sourceEdition: z.string().optional(),
    language: z.string().default("Old English"),
    status: z.enum(["draft", "review", "published"]).default("published"),
    sentences: z.array(SentenceSchema),
    blocks: z.array(z.unknown()).optional(),
  })
  .passthrough();

export type WordTokenInput = z.input<typeof WordTokenSchema>;
export type WordTokenOutput = z.output<typeof WordTokenSchema>;
export type SentenceInput = z.input<typeof SentenceSchema>;
export type SentenceOutput = z.output<typeof SentenceSchema>;
export type TextDocumentInput = z.input<typeof TextDocumentSchema>;
export type TextDocumentOutput = z.output<typeof TextDocumentSchema>;
