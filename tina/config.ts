import { defineConfig, type TinaField } from "tinacms";

const branch = process.env.TINA_BRANCH ?? process.env.NEXT_PUBLIC_TINA_BRANCH ?? "main";
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "";
const token = process.env.TINA_TOKEN ?? "";

const inflectionFields: TinaField[] = [
  {
    type: "string",
    name: "case",
    label: "Case",
    options: ["nominative", "accusative", "genitive", "dative"],
  },
  { type: "string", name: "number", label: "Number", options: ["singular", "plural"] },
  {
    type: "string",
    name: "gender",
    label: "Gender",
    options: ["masculine", "feminine", "neuter"],
  },
  { type: "number", name: "person", label: "Person" },
  { type: "string", name: "tense", label: "Tense", options: ["present", "past"] },
  {
    type: "string",
    name: "mood",
    label: "Mood",
    options: ["indicative", "subjunctive", "imperative", "infinitive"],
  },
  {
    type: "string",
    name: "degree",
    label: "Degree",
    options: ["positive", "comparative", "superlative"],
  },
];

const morphemeFields: TinaField[] = [
  { type: "string", name: "form", label: "Form", required: true },
  { type: "string", name: "gloss", label: "Gloss", required: true },
  {
    type: "string",
    name: "kind",
    label: "Kind",
    options: ["stem", "prefix", "suffix", "ending"],
  },
];

const wordFields: TinaField[] = [
  {
    type: "string",
    name: "id",
    label: "Stable word ID",
    required: true,
    description: "Keep this ID stable when editing this word.",
  },
  {
    type: "string",
    name: "originalWord",
    label: "Original word",
    required: true,
  },
  {
    type: "string",
    name: "morphologicalGloss",
    label: "Morphological gloss",
    description: "Readable source gloss shown directly beneath the original word.",
  },
  {
    type: "string",
    name: "trailingPunctuation",
    label: "Trailing punctuation",
    description: "Punctuation displayed after the original word, such as a comma or period.",
  },
  {
    type: "string",
    name: "sourceGlossTex",
    label: "Literal TeX gloss (source)",
    description: "Preserve the source's exact gloss notation and TeX commands.",
  },
  {
    type: "object",
    name: "analysis",
    label: "Expanded word details",
    fields: [
      { type: "string", name: "lemma", label: "Dictionary lemma" },
      {
        type: "string",
        name: "partOfSpeech",
        label: "Part of speech",
        options: [
          "adjective",
          "adverb",
          "noun",
          "verb",
          "pronoun",
          "determiner",
          "preposition",
          "conjunction",
        ],
        required: true,
      },
      {
        type: "object",
        name: "features",
        label: "Inflection features",
        fields: inflectionFields,
      },
      { type: "string", name: "definition", label: "Meaning / definition" },
      { type: "string", name: "phonetic", label: "IPA transcription" },
      { type: "string", name: "pronunciationSource", label: "IPA source" },
      {
        type: "object",
        name: "morphemes",
        label: "Morphemes (one or more)",
        list: true,
        ui: {
          itemProps: (item) => ({
            label: `${item?.form || "New morpheme"} = ${item?.gloss || "gloss"}`,
          }),
        },
        fields: morphemeFields,
      },
      {
        type: "string",
        name: "historicalNote",
        label: "Historical / language note",
        ui: { component: "textarea" },
      },
      { type: "string", name: "wiktionaryUrl", label: "Wiktionary URL" },
    ],
  },
  {
    type: "object",
    name: "review",
    label: "Source review",
    fields: [
      {
        type: "string",
        name: "status",
        label: "Source transcription review",
        description: "This tracks source transcription checking, not scholarly approval of the analysis.",
        options: ["source-checked", "needs-review"],
        required: true,
      },
      {
        type: "object",
        name: "source",
        fields: [
          { type: "string", name: "file", label: "Source file" },
          {
            type: "string",
            name: "locator",
            label: "Source entry / locator",
          },
        ],
      },
      { type: "string", name: "notes", ui: { component: "textarea" } },
    ],
  },
];

export default defineConfig({
  branch,
  clientId,
  token,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  schema: {
    collections: [
      {
        name: "text",
        label: "Old English texts",
        path: "content",
        format: "json",
        match: { include: "**" },
        ui: {
          router: ({ document }) => `/texts/${document._sys.filename}`,
        },
        fields: [
          {
            type: "string",
            name: "textId",
            label: "Stable text ID",
            required: true,
            description: "Keep this identifier stable after creating the text.",
          },
          {
            type: "string",
            name: "slug",
            label: "Public slug",
            required: true,
            description: "Stable URL-safe identifier. Do not change after publishing.",
          },
          {
            type: "string",
            name: "language",
            options: ["Old English"],
            required: true,
          },
          { type: "string", name: "author", label: "Author / speaker" },
          { type: "string", name: "title", required: true },
          { type: "string", name: "source", label: "Attribution", required: true },
          {
            type: "string",
            name: "sourceFile",
            label: "Source manuscript path",
            required: true,
            description: "Repository-relative path to the source edition used for checking.",
          },
          {
            type: "string",
            name: "sourceEdition",
            label: "Source edition or scope",
            description: "Describe which manuscript or source entries this document represents.",
          },
          {
            type: "string",
            name: "status",
            label: "Text status",
            options: ["draft", "review", "published"],
            required: true,
          },
          {
            type: "object",
            name: "sentences",
            label: "Sentences",
            list: true,
            required: true,
            ui: {
              itemProps: (item) => ({ label: item?.id || "Sentence" }),
            },
            fields: [
              { type: "string", name: "id", label: "Stable sentence ID", required: true },
              {
                type: "object",
                name: "words",
                label: "Words in this sentence",
                list: true,
                required: true,
                ui: {
                  itemProps: (item) => ({
                    label: `${item?.originalWord || "New word"}${item?.trailingPunctuation || ""}`,
                  }),
                },
                fields: wordFields,
              },
              {
                type: "string",
                name: "translation",
                label: "English translation",
                required: true,
                ui: { component: "textarea" },
              },
            ],
          },
        ],
      },
    ],
  },
});
