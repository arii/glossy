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
          router: ({ document }) => `/texts/${document._sys.filename}`,
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

