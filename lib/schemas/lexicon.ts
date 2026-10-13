import { z } from "zod";

export const LexiconSenseSchema = z.object({
  id: z.string(),
  definition: z.string(),
  grammaticalNote: z.string().optional(),
});

export const LexiconEntrySchema = z.object({
  id: z.string(),
  lemma: z.string(),
  pos: z.enum(["N", "V", "ADJ", "ADV", "PRON", "PREP", "CONJ", "INTERJ"]),
  canonicalFeatures: z
    .object({
      gender: z.enum(["MASC", "FEM", "NEUT"]).optional(),
      verbClass: z.string().optional(),
    })
    .optional(),
  ipa: z.string().optional(),
  senses: z.record(z.string(), LexiconSenseSchema),
  defaultSenseId: z.string(),
  redirectTo: z.string().optional(),
});

export type LexiconSenseInput = z.input<typeof LexiconSenseSchema>;
export type LexiconSenseOutput = z.output<typeof LexiconSenseSchema>;
export type LexiconEntryInput = z.input<typeof LexiconEntrySchema>;
export type LexiconEntryOutput = z.output<typeof LexiconEntrySchema>;
