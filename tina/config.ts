import { defineConfig } from "tinacms";

const branch = process.env.TINA_BRANCH ?? process.env.NEXT_PUBLIC_TINA_BRANCH ?? "main";
const clientId = process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "cc29fe7b-9d48-4d53-83f1-115a9f5f48b8";
const token = process.env.TINA_TOKEN || "local-build-token";

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
            type: "string",
            name: "texSource",
            label: "Raw LaTeX Source (gb4e)",
            ui: { component: "textarea" },
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
      {
        name: "page",
        label: "Pages",
        path: "content/pages",
        format: "json",
        ui: {
          router: ({ document }) => {
            if (document._sys.filename === "home") return "/";
            if (document._sys.filename === "ingest") return "/edit/new";
            return `/${document._sys.filename}`;
          },
        },
        fields: [
          { type: "string", name: "pageId", label: "Page Identifier", required: true, isTitle: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "heading", label: "Main Heading" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          {
            type: "object",
            name: "primaryAction",
            label: "Primary Action Button",
            fields: [
              { type: "string", name: "label", label: "Button Label" },
              { type: "string", name: "href", label: "Link URL" },
            ],
          },
          {
            type: "object",
            name: "secondaryAction",
            label: "Secondary Action Button",
            fields: [
              { type: "string", name: "label", label: "Button Label" },
              { type: "string", name: "href", label: "Link URL" },
            ],
          },
        ],
      },
      {
        name: "docs",
        label: "Documentation & FAQ",
        path: "content/docs",
        format: "json",
        ui: {
          router: () => "/docs",
        },
        fields: [
          { type: "string", name: "title", label: "Document Title", required: true, isTitle: true },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "description", label: "Overview Description", ui: { component: "textarea" } },
          { type: "string", name: "canonicalRuleTitle", label: "Quick Rule Title" },
          { type: "string", name: "canonicalRuleDescription", label: "Quick Rule Description", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Documentation Sections",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.num || "#"}. ${item?.title || "Section"}` }),
            },
            fields: [
              { type: "string", name: "id", label: "Section Anchor ID", required: true },
              { type: "string", name: "num", label: "Section Number", required: true },
              { type: "string", name: "eyebrow", label: "Section Eyebrow" },
              { type: "string", name: "title", label: "Section Title", required: true },
            ],
          },
          {
            type: "object",
            name: "abbreviations",
            label: "37 Leipzig Glossing Abbreviations",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.abbr || "TAG"}: ${item?.name || "Term"}` }),
            },
            fields: [
              { type: "string", name: "abbr", label: "Tag / Abbreviation", required: true },
              { type: "string", name: "name", label: "Full Term Name", required: true },
              { type: "string", name: "desc", label: "Description & Examples", required: true, ui: { component: "textarea" } },
              {
                type: "string",
                name: "category",
                label: "Category",
                options: ["Person & Number", "Case", "Gender & Mood", "Part of Speech", "Affixes & Morphemes"],
              },
            ],
          },
          {
            type: "object",
            name: "numeralCards",
            label: "Numeral Lemmatization Cards",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "Card" }),
            },
            fields: [
              { type: "string", name: "badge", label: "Badge Label" },
              { type: "string", name: "title", label: "Card Title", required: true },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
              { type: "boolean", name: "isFullWidth", label: "Full Width Layout" },
            ],
          },
          {
            type: "object",
            name: "verificationTools",
            label: "Quality Verification Tools Table",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.name || "Tool" }),
            },
            fields: [
              { type: "string", name: "name", label: "Tool Name", required: true },
              { type: "string", name: "command", label: "Terminal Command", required: true },
              { type: "string", name: "target", label: "Function & Verification Target", required: true, ui: { component: "textarea" } },
            ],
          },
          {
            type: "object",
            name: "ingestionSteps",
            label: "Corpus Ingestion Steps",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.num || "#"}. ${item?.title || "Step"}` }),
            },
            fields: [
              { type: "string", name: "num", label: "Step Number" },
              { type: "string", name: "title", label: "Step Title", required: true },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
            ],
          },
          {
            type: "object",
            name: "wiktionaryGuidelines",
            label: "Wiktionary Formatting Guidelines",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "Guideline" }),
            },
            fields: [
              { type: "string", name: "title", label: "Rule Title", required: true },
              { type: "string", name: "description", label: "Rule Description", ui: { component: "textarea" } },
            ],
          },
          {
            type: "object",
            name: "ipaSpecifications",
            label: "IPA Phonetic Guidelines",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "Specification" }),
            },
            fields: [
              { type: "string", name: "title", label: "Specification Title", required: true },
              { type: "string", name: "description", label: "Specification Description", ui: { component: "textarea" } },
            ],
          },
          {
            type: "object",
            name: "storageTiers",
            label: "Dual-Write Storage Architecture Tiers",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.tier || "Tier"}: ${item?.title || "Storage"}` }),
            },
            fields: [
              { type: "string", name: "tier", label: "Tier Label (e.g. Tier 1)", required: true },
              { type: "string", name: "timing", label: "Timing / Trigger (e.g. 300ms debounce)", required: true },
              { type: "string", name: "title", label: "Tier Title", required: true },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
});
