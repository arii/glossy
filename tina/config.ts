import { defineConfig } from "tinacms";

const branch = process.env.TINA_BRANCH ?? process.env.NEXT_PUBLIC_TINA_BRANCH ?? "main";
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? "";
const token = process.env.TINA_TOKEN ?? "";

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
        label: "Texts",
        path: "content/texts",
        format: "json",
        ui: {
          router: ({ document }) => `/edit/${document._sys.filename}`,
        },
        fields: [
          { type: "string", name: "textId", label: "Text ID", required: true },
          { type: "string", name: "slug", label: "Reader Slug", required: true },
          { type: "string", name: "language", label: "Language", required: true },
          { type: "string", name: "author", label: "Author / Speaker" },
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          { type: "string", name: "source", label: "Attribution", required: true },
          { type: "string", name: "sourceFile", label: "Source File", required: true },
          { type: "string", name: "sourceEdition", label: "Source Edition" },
          {
            type: "string",
            name: "status",
            label: "Status",
            options: ["draft", "review", "published"],
          },
          {
            type: "object",
            name: "sentences",
            label: "Examples",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.id || "Example" }),
            },
            fields: [
              { type: "string", name: "id", label: "Example ID", required: true },
              { type: "string", name: "translation", label: "English Translation", ui: { component: "textarea" } },
              { type: "string", name: "footnotes", label: "Footnotes", list: true, ui: { component: "textarea" } },
              {
                type: "object",
                name: "words",
                label: "Words",
                list: true,
                ui: {
                  itemProps: (item) => ({ label: item?.originalWord || "Word" }),
                },
                fields: [
                  { type: "string", name: "id", label: "Word ID", required: true },
                  { type: "string", name: "originalWord", label: "Source Form", required: true },
                  { type: "string", name: "morphologicalGloss", label: "Source Gloss" },
                  { type: "string", name: "trailingPunctuation", label: "Trailing Punctuation" },
                  { type: "string", name: "sourceGlossTex", label: "Literal TeX Gloss" },
                  {
                    type: "object",
                    name: "analysis",
                    label: "Linguistic Analysis",
                    fields: [
                      { type: "string", name: "lemma", label: "Lemma" },
                      {
                        type: "string",
                        name: "partOfSpeech",
                        label: "Part of Speech",
                        options: ["adjective", "adverb", "noun", "verb", "pronoun", "determiner", "preposition", "conjunction"],
                      },
                      {
                        type: "object",
                        name: "features",
                        label: "Inflection",
                        fields: [
                          { type: "string", name: "case", label: "Case" },
                          { type: "string", name: "number", label: "Number" },
                          { type: "string", name: "gender", label: "Gender" },
                          { type: "number", name: "person", label: "Person" },
                          { type: "string", name: "tense", label: "Tense" },
                          { type: "string", name: "mood", label: "Mood" },
                          { type: "string", name: "degree", label: "Degree" },
                        ],
                      },
                      {
                        type: "object",
                        name: "morphemes",
                        label: "Morphemes",
                        list: true,
                        ui: {
                          itemProps: (item) => ({
                            label: `${item?.form || "form"} = ${item?.gloss || "gloss"}`,
                          }),
                        },
                        fields: [
                          { type: "string", name: "form", label: "Form" },
                          { type: "string", name: "gloss", label: "Gloss" },
                          { type: "string", name: "kind", label: "Type", options: ["stem", "prefix", "suffix", "ending"] },
                        ],
                      },
                      { type: "string", name: "definition", label: "Definition", ui: { component: "textarea" } },
                      { type: "string", name: "phonetic", label: "IPA Pronunciation" },
                      { type: "string", name: "pronunciationSource", label: "Pronunciation Source" },
                      { type: "string", name: "historicalNote", label: "Language Note", ui: { component: "textarea" } },
                      { type: "string", name: "wiktionaryUrl", label: "Wiktionary URL" },
                    ],
                  },
                  {
                    type: "object",
                    name: "review",
                    label: "Source Review",
                    fields: [
                      { type: "string", name: "status", label: "Review Status", options: ["source-checked", "needs-review"] },
                      {
                        type: "object",
                        name: "source",
                        label: "Source Location",
                        fields: [
                          { type: "string", name: "file", label: "Source File" },
                          { type: "string", name: "locator", label: "Locator" },
                        ],
                      },
                      { type: "string", name: "notes", label: "Review Notes", ui: { component: "textarea" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "dictionary",
        label: "Dictionary",
        path: "content/dictionary",
        format: "json",
        fields: [
          { type: "string", name: "word", label: "Base Word", required: true, isTitle: true },
          { type: "string", name: "pronunciation", label: "Pronunciation" },
          { type: "string", name: "sourceGloss", label: "Source Gloss" },
          {
            type: "object",
            name: "morphemes",
            label: "Morphemes",
            list: true,
            ui: {
              itemProps: (item) => ({
                label: `${item?.part || "part"} = ${item?.meaning || "meaning"}`,
              }),
            },
            fields: [
              { type: "string", name: "part", label: "Part (e.g., sǣ)" },
              { type: "string", name: "meaning", label: "Meaning (e.g., say)" },
            ],
          },
          { type: "string", name: "inflection", label: "Inflection", ui: { component: "textarea" } },
          { type: "string", name: "definition", label: "Definition" },
        ],
      },
      {
        name: "manuscript",
        label: "Manuscript",
        path: "content/manuscripts",
        format: "mdx",
        ui: {
          router: ({ document }) => `/read/${document._sys.filename}`,
        },
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "string", name: "author", label: "Author / Speaker" },
          { type: "string", name: "source", label: "Attribution" },
          { type: "string", name: "translation", label: "English Translation", ui: { component: "textarea" } },
          {
            type: "rich-text",
            name: "body",
            label: "Manuscript Body",
            isBody: true,
            templates: [
              {
                name: "GlossWord",
                label: "Gloss Word",
                inline: true,
                fields: [
                  { type: "string", name: "text", label: "Display Text in Sentence", required: true },
                  {
                    type: "reference",
                    name: "dictEntry",
                    label: "Dictionary Entry",
                    collections: ["dictionary"],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
});
