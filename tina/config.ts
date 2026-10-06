import React from "react";
import { createRoot } from "react-dom/client";
import { defineConfig, type TinaCMS } from "tinacms";
import { DraftSyncPrompt } from "../components/draft-sync-prompt";

import { TINA_BRANCH as branch, TINA_CLIENT_ID as clientId, TINA_TOKEN as token } from "../lib/tina-config";

export default defineConfig({
  branch,
  clientId,
  token,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "article",
        label: "Articles / Blog",
        path: "content/articles",
        format: "md",
        ui: {
          router: ({ document }) => `/articles/${document._sys.filename}`,
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "author",
            label: "Author",
          },
          {
            type: "datetime",
            name: "date",
            label: "Published Date",
          },
          {
            type: "image",
            name: "coverImage",
            label: "Cover Image",
          },
          {
            type: "string",
            name: "summary",
            label: "Brief Summary / Excerpt",
            ui: {
              component: "textarea",
            },
          },
          {
            type: "rich-text",
            name: "body",
            label: "Article Content",
            isBody: true,
          },
        ],
      },
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
          { type: "string", name: "editor", label: "Editor / Glossing Attribution" },
          { type: "string", name: "shelfmark", label: "Primary Manuscript Shelfmark" },
          { type: "string", name: "dialect", label: "Dialect" },
          { type: "string", name: "historicalDate", label: "Historical Date" },
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
                name: "notes",
                label: "Structured Notes / Apparatus",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: `${item?.marker || item?.id || "Note"}: ${item?.type || "general"}`,
                  }),
                },
                fields: [
                  { type: "string", name: "id", label: "Note ID", required: true },
                  { type: "number", name: "targetWordIndex", label: "Target Word Index (1-based, optional)" },
                  { type: "string", name: "marker", label: "Custom Marker (optional)" },
                  {
                    type: "string",
                    name: "type",
                    label: "Category / Type",
                    options: ["manuscript_variant", "grammatical_note", "source_reference", "general"],
                  },
                  { type: "string", name: "text", label: "Note Text", required: true, ui: { component: "textarea" } },
                ],
              },
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
        name: "homePage",
        label: "Page: Home",
        path: "content/pages",
        format: "json",
        match: {
          include: "home",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/",
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
        name: "aboutPage",
        label: "Page: About",
        path: "content/pages",
        format: "json",
        match: {
          include: "about",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/about",
        },
        fields: [
          { type: "string", name: "pageId", label: "Page Identifier", required: true, isTitle: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "heading", label: "Main Heading" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "missionTitle", label: "Mission Title" },
          { type: "string", name: "missionText", label: "Mission Text (Paragraph 1)", ui: { component: "textarea" } },
          { type: "string", name: "missionText2", label: "Mission Text (Paragraph 2)", ui: { component: "textarea" } },
          { type: "string", name: "capabilitiesTitle", label: "Capabilities Title" },
          {
            type: "object",
            name: "capabilities",
            label: "Capabilities",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.title || "Capability" }),
            },
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
            ],
          },
          { type: "string", name: "maintainersTitle", label: "Maintainers Title" },
          { type: "string", name: "maintainerAriel", label: "Maintainer: Ariel Anders", ui: { component: "textarea" } },
          { type: "string", name: "maintainerTyler", label: "Maintainer: Tyler Lemon", ui: { component: "textarea" } },
          { type: "string", name: "maintainerLicense", label: "Maintainer: License", ui: { component: "textarea" } },
          { type: "string", name: "architectureTitle", label: "Architecture Title" },
          { type: "string", name: "architectureItems", label: "Architecture Items", list: true },
        ],
      },
      {
        name: "privacyPage",
        label: "Page: Privacy",
        path: "content/pages",
        format: "json",
        match: {
          include: "privacy",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/privacy",
        },
        fields: [
          { type: "string", name: "pageId", label: "Page Identifier", required: true, isTitle: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "heading", label: "Main Heading" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "privacySummaryTitle", label: "Privacy Summary Title" },
          { type: "string", name: "privacySummaryText", label: "Privacy Summary Text", ui: { component: "textarea" } },
          {
            type: "object",
            name: "privacySections",
            label: "Privacy Sections",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.num || "#"}. ${item?.title || "Section"}` }),
            },
            fields: [
              { type: "string", name: "num", label: "Section Number" },
              { type: "string", name: "title", label: "Section Title" },
              { type: "string", name: "content", label: "Section Content", ui: { component: "textarea" } },
              { type: "string", name: "bullets", label: "Bullet Points", list: true },
            ],
          },
        ],
      },
      {
        name: "attributionPage",
        label: "Page: Attribution",
        path: "content/pages",
        format: "json",
        match: {
          include: "attribution",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/attribution",
        },
        fields: [
          { type: "string", name: "pageId", label: "Page Identifier", required: true, isTitle: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "heading", label: "Main Heading" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
          { type: "string", name: "platformCreator", label: "Platform Creator" },
          { type: "string", name: "platformCreatorUrl", label: "Platform Creator URL" },
          { type: "string", name: "defaultEditor", label: "Default Editor" },
          { type: "string", name: "defaultEditorUrl", label: "Default Editor URL" },
          { type: "string", name: "editionDate", label: "Edition Date" },
          { type: "string", name: "booktitle", label: "Book Title / Corpus Name" },
          { type: "string", name: "attributionLinguisticPackage", label: "Linguistic Package" },
          { type: "string", name: "attributionStandardsTitle", label: "Attribution: Standards Title" },
          { type: "string", name: "attributionStandardsStatement", label: "Attribution: Standards Statement", ui: { component: "textarea" } },
          { type: "string", name: "bibtexCitationTemplate", label: "BibTeX Citation Template", ui: { component: "textarea" } },
          { type: "string", name: "unifiedLsaCitationTemplate", label: "Unified / LSA Citation Template", ui: { component: "textarea" } },
          { type: "string", name: "apaCitationTemplate", label: "APA Citation Template", ui: { component: "textarea" } },
          { type: "string", name: "chicagoCitationTemplate", label: "Chicago Citation Template", ui: { component: "textarea" } },
        ],
      },
      {
        name: "ingestPage",
        label: "Page: Ingest New Text",
        path: "content/pages",
        format: "json",
        match: {
          include: "ingest",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/edit/new",
        },
        fields: [
          { type: "string", name: "pageId", label: "Page Identifier", required: true, isTitle: true },
          { type: "string", name: "title", label: "Page Title" },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "heading", label: "Main Heading" },
          { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
        ],
      },
      {
        name: "docs",
        label: "Documentation & FAQ",
        path: "content/docs",
        format: "json",
        match: {
          include: "architecture-faq",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          router: () => "/docs",
        },
        fields: [
          { type: "string", name: "title", label: "Document Title", required: true, isTitle: true },
          { type: "string", name: "eyebrow", label: "Eyebrow Text" },
          { type: "string", name: "description", label: "Overview Description", ui: { component: "textarea" } },
          { type: "string", name: "canonicalRuleTitle", label: "Quick Rule Title" },
          { type: "string", name: "canonicalRuleDescription", label: "Quick Rule Description", ui: { component: "textarea" } },
          { type: "string", name: "architectureSpecTitle", label: "Architecture Spec Title" },
          { type: "string", name: "architectureSpecDescription", label: "Architecture Spec Description", ui: { component: "textarea" } },
          { type: "string", name: "l1Intro", label: "L1: Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "l1TierHeaderTitle", label: "L1: Tier Header Title" },
          { type: "string", name: "l1TierHeaderBadge", label: "L1: Tier Header Badge" },
          { type: "string", name: "l1TierTokens", label: "L1: Tier Tokens" },
          { type: "string", name: "l1TierGlosses", label: "L1: Tier Glosses" },
          { type: "string", name: "l1TierTranslation", label: "L1: Tier Translation" },
          { type: "string", name: "l2Paragraph1", label: "L2: Paragraph 1", ui: { component: "textarea" } },
          { type: "string", name: "l2Paragraph2", label: "L2: Paragraph 2", ui: { component: "textarea" } },
          { type: "string", name: "l2CalloutTitle", label: "L2: Callout Title" },
          { type: "string", name: "l2CalloutBody", label: "L2: Callout Body", ui: { component: "textarea" } },
          { type: "string", name: "l3Intro", label: "L3: Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "l4WiktionaryTitle", label: "L4: Wiktionary Title" },
          { type: "string", name: "l4WiktionarySubtitle", label: "L4: Wiktionary Subtitle" },
          { type: "string", name: "l4WiktionaryIntro", label: "L4: Wiktionary Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "l4IpaTitle", label: "L4: IPA Title" },
          { type: "string", name: "l4IpaSubtitle", label: "L4: IPA Subtitle" },
          { type: "string", name: "l4IpaIntro", label: "L4: IPA Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "a1Intro", label: "A1: Ingesting Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "a2Intro", label: "A2: Storage Intro Text", ui: { component: "textarea" } },
          { type: "string", name: "a3Intro", label: "A3: QA Intro Text", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Documentation Sections",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.domainNum || item?.num || "#"}. ${item?.title || "Section"}` }),
            },
            fields: [
              { type: "string", name: "id", label: "Section Anchor ID", required: true },
              { type: "string", name: "domain", label: "Domain (linguistics / architecture)" },
              { type: "string", name: "domainNum", label: "Domain Number (e.g. L1, A1)" },
              { type: "string", name: "num", label: "Section Number", required: true },
              { type: "string", name: "eyebrow", label: "Section Eyebrow" },
              { type: "string", name: "title", label: "Section Title", required: true },
            ],
          },
          {
            type: "object",
            name: "abbreviations",
            label: "42 Leipzig Glossing Abbreviations",
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
            label: "Storage Architecture Stages",
            list: true,
            ui: {
              itemProps: (item) => ({ label: `${item?.tier || "Stage"}: ${item?.title || "Storage"}` }),
            },
            fields: [
              { type: "string", name: "tier", label: "Stage Label (e.g. Stage 1)", required: true },
              { type: "string", name: "timing", label: "Timing / Trigger", required: true },
              { type: "string", name: "title", label: "Stage Title", required: true },
              { type: "string", name: "description", label: "Description", ui: { component: "textarea" } },
            ],
          },
        ],
      },
    ],
  },
  cmsCallback: (cms: TinaCMS) => {
    if (typeof window !== "undefined") {
      const checkAndRenderSyncBar = () => {
        try {
          let container = document.getElementById("tina-draft-sync-container");
          if (!container) {
            container = document.createElement("div");
            container.id = "tina-draft-sync-container";
            document.body.appendChild(container);
            const root = createRoot(container);
            root.render(React.createElement(DraftSyncPrompt, { cms }));
          }
        } catch (e) {
          console.error("Draft sync check error", e);
        }
      };

      setTimeout(checkAndRenderSyncBar, 1200);
    }
    return cms;
  },
});
