import { defineConfig, type TinaCMS } from "tinacms";

const branch =
  process.env.TINA_BRANCH ??
  process.env.NEXT_PUBLIC_TINA_BRANCH ??
  process.env.CF_PAGES_BRANCH ??
  process.env.HEAD ??
  "main";
const clientId =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ||
  "7cf6793a-dfc2-4a6b-ae23-c2665e22f286";
const token =
  process.env.TINA_TOKEN ||
  "1003b7a92c90f98a00ad4e6cf8e2ad87fb2455d9";

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
          { type: "string", name: "architectureSpecTitle", label: "Architecture Spec Title" },
          { type: "string", name: "architectureSpecDescription", label: "Architecture Spec Description", ui: { component: "textarea" } },
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
  cmsCallback: (cms: TinaCMS) => {
    function escapeForHtml(str: string): string {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function sanitizeDraftForTinaMutation(draftDoc: Record<string, unknown>) {
      const sentencesRaw = Array.isArray(draftDoc.sentences) ? draftDoc.sentences : [];
      const sentences = sentencesRaw.map((s: Record<string, unknown>) => {
        const wordsRaw = Array.isArray(s.words) ? s.words : [];
        const words = wordsRaw.map((w: Record<string, unknown>) => {
          const wordObj: Record<string, unknown> = {
            id: String(w.id || ""),
            originalWord: String(w.originalWord || ""),
            morphologicalGloss: String(w.morphologicalGloss || ""),
            trailingPunctuation: String(w.trailingPunctuation || ""),
            sourceGlossTex: String(w.sourceGlossTex || ""),
          };

          if (w.analysis && typeof w.analysis === "object") {
            const a = w.analysis as Record<string, unknown>;
            const analysisObj: Record<string, unknown> = {
              lemma: String(a.lemma || ""),
              partOfSpeech: String(a.partOfSpeech || ""),
              definition: String(a.definition || ""),
              phonetic: String(a.phonetic || ""),
              pronunciationSource: String(a.pronunciationSource || ""),
              historicalNote: String(a.historicalNote || ""),
              wiktionaryUrl: String(a.wiktionaryUrl || ""),
            };

            if (a.features && typeof a.features === "object") {
              const f = a.features as Record<string, unknown>;
              const featuresObj: Record<string, unknown> = {};
              if (f.case) featuresObj.case = String(f.case);
              if (f.number) featuresObj.number = String(f.number);
              if (f.gender) featuresObj.gender = String(f.gender);
              if (f.person != null) {
                const p = Number(f.person);
                if (!isNaN(p)) featuresObj.person = p;
              }
              if (f.tense) featuresObj.tense = String(f.tense);
              if (f.mood) featuresObj.mood = String(f.mood);
              if (f.degree) featuresObj.degree = String(f.degree);
              analysisObj.features = featuresObj;
            }

            if (Array.isArray(a.morphemes)) {
              analysisObj.morphemes = a.morphemes.map((m: Record<string, unknown>) => ({
                form: String(m.form || ""),
                gloss: String(m.gloss || ""),
                kind: String(m.kind || "stem"),
              }));
            }

            wordObj.analysis = analysisObj;
          }

          if (w.review && typeof w.review === "object") {
            const r = w.review as Record<string, unknown>;
            const src = (r.source && typeof r.source === "object" ? r.source : {}) as Record<string, unknown>;
            wordObj.review = {
              status: String(r.status || "source-checked"),
              notes: String(r.notes || ""),
              source: {
                file: String(src.file || ""),
                locator: String(src.locator || ""),
              },
            };
          }

          return wordObj;
        });

        const footnotesRaw = Array.isArray(s.footnotes) ? s.footnotes : [];
        return {
          id: String(s.id || ""),
          translation: String(s.translation || ""),
          footnotes: footnotesRaw.map((fn: unknown) => String(fn)),
          words,
        };
      });

      return {
        textId: String(draftDoc.textId || draftDoc.slug || ""),
        slug: String(draftDoc.slug || draftDoc.textId || ""),
        language: String(draftDoc.language || "Old English"),
        author: String(draftDoc.author || ""),
        title: String(draftDoc.title || ""),
        source: String(draftDoc.source || ""),
        sourceFile: String(draftDoc.sourceFile || ""),
        sourceEdition: String(draftDoc.sourceEdition || ""),
        status: String(draftDoc.status || "draft"),
        texSource: String(draftDoc.texSource || ""),
        sentences,
      };
    }

    function showDraftErrorModal(options: {
      title: string;
      summary: string;
      rawError: unknown;
      draftJson?: string;
      slug?: string;
    }) {
      if (typeof window === "undefined" || typeof document === "undefined") return;

      const { title, summary, rawError, draftJson, slug } = options;

      let errorDetailsText = "";
      if (rawError instanceof Error) {
        errorDetailsText = rawError.stack
          ? `${rawError.name}: ${rawError.message}\n\nStack:\n${rawError.stack}`
          : `${rawError.name}: ${rawError.message}`;
      } else if (typeof rawError === "object" && rawError !== null) {
        try {
          errorDetailsText = JSON.stringify(rawError, Object.getOwnPropertyNames(rawError), 2);
        } catch {
          errorDetailsText = String(rawError);
        }
      } else {
        errorDetailsText = String(rawError);
      }

      const errObj = rawError as {
        errors?: Array<{ message: string }>;
      };
      if (errObj?.errors && Array.isArray(errObj.errors)) {
        const messages = errObj.errors.map((e, idx) => `[Error ${idx + 1}] ${e.message}`).join("\n\n");
        errorDetailsText = `${messages}\n\n--- Full Details ---\n${errorDetailsText}`;
      }

      document.getElementById("tina-error-modal-overlay")?.remove();

      const overlay = document.createElement("div");
      overlay.id = "tina-error-modal-overlay";
      overlay.style.cssText =
        "position:fixed;inset:0;z-index:999999;background:rgba(15,23,42,0.8);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:1.25rem;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;";

      const modal = document.createElement("div");
      modal.style.cssText =
        "background:#18181b;color:#fafafa;border:1px solid #3f3f46;border-radius:0.75rem;width:100%;max-width:44rem;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.7);overflow:hidden;";

      modal.innerHTML = `
        <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #27272a;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;">
          <div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span style="display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:9999px;background:rgba(239,68,68,0.2);color:#ef4444;font-weight:bold;font-size:1rem;">✕</span>
              <h3 style="margin:0;font-size:1.15rem;font-weight:600;color:#f43f5e;">
                ${escapeForHtml(title)}
              </h3>
            </div>
            <p style="margin:0.4rem 0 0;font-size:0.85rem;color:#a1a1aa;line-height:1.4;">
              ${escapeForHtml(summary)}
            </p>
          </div>
          <button id="tina-modal-close-x" style="background:transparent;border:none;color:#71717a;font-size:1.6rem;line-height:1;cursor:pointer;padding:0.2rem 0.5rem;border-radius:0.25rem;" title="Close">&times;</button>
        </div>

        <div style="padding:1.25rem 1.5rem;overflow-y:auto;display:flex;flex-direction:column;gap:1rem;">
          <div style="background:#27272a;padding:0.75rem 1rem;border-radius:0.5rem;font-size:0.82rem;color:#d4d4d8;line-height:1.45;">
            <strong style="color:#fafafa;">What this means:</strong> Your visual edits are safely retained in browser localStorage. If TinaCloud session authentication is expired or unauthorized, log in again at <a href="/admin/index.html" style="color:#38bdf8;text-decoration:underline;">/admin</a>. You can also download your JSON draft directly below.
          </div>

          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;">
              <span style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#a1a1aa;">
                Error Details (Selectable &amp; Copyable)
              </span>
              <button id="tina-modal-copy-link" style="background:transparent;border:none;color:#38bdf8;font-size:0.75rem;cursor:pointer;text-decoration:underline;padding:0;">
                Copy error text
              </button>
            </div>
            <textarea id="tina-error-textarea" readonly style="user-select:text;-webkit-user-select:text;background:#09090b;color:#fca5a5;padding:0.85rem 1rem;border-radius:0.5rem;font-size:0.8rem;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;line-height:1.5;height:12rem;width:100%;border:1px solid #27272a;box-sizing:border-box;resize:vertical;outline:none;">${escapeForHtml(errorDetailsText)}</textarea>
          </div>
        </div>

        <div style="padding:1rem 1.5rem;border-top:1px solid #27272a;background:#121215;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.75rem;">
          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <button id="tina-copy-error-btn" style="background:#27272a;color:#fafafa;border:1px solid #52525b;padding:0.5rem 0.9rem;border-radius:0.375rem;font-size:0.825rem;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;">
              📋 Copy Error Details
            </button>
            ${
              draftJson
                ? `<button id="tina-download-draft-btn" style="background:#27272a;color:#fafafa;border:1px solid #52525b;padding:0.5rem 0.9rem;border-radius:0.375rem;font-size:0.825rem;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:0.4rem;">
                    💾 Download Draft JSON
                  </button>`
                : ""
            }
          </div>
          <button id="tina-modal-close-btn" style="background:#7b3f2a;color:#fff;border:none;padding:0.5rem 1.1rem;border-radius:0.375rem;font-size:0.825rem;font-weight:600;cursor:pointer;">
            Dismiss
          </button>
        </div>
      `;

      overlay.appendChild(modal);
      document.body.appendChild(overlay);

      const closeModal = () => overlay.remove();
      document.getElementById("tina-modal-close-x")?.addEventListener("click", closeModal);
      document.getElementById("tina-modal-close-btn")?.addEventListener("click", closeModal);
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
      });

      const handleCopy = async () => {
        const copyBtn = document.getElementById("tina-copy-error-btn");
        const copyLink = document.getElementById("tina-modal-copy-link");
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(errorDetailsText);
          } else {
            const textarea = document.getElementById("tina-error-textarea") as HTMLTextAreaElement | null;
            if (textarea) {
              textarea.focus();
              textarea.select();
              document.execCommand("copy");
            }
          }
          if (copyBtn) copyBtn.textContent = "✅ Copied to Clipboard!";
          if (copyLink) copyLink.textContent = "Copied!";
          setTimeout(() => {
            if (copyBtn) copyBtn.textContent = "📋 Copy Error Details";
            if (copyLink) copyLink.textContent = "Copy error text";
          }, 2500);
        } catch {
          if (copyBtn) copyBtn.textContent = "Selected (Press Ctrl+C)";
        }
      };

      document.getElementById("tina-copy-error-btn")?.addEventListener("click", handleCopy);
      document.getElementById("tina-modal-copy-link")?.addEventListener("click", handleCopy);

      if (draftJson) {
        document.getElementById("tina-download-draft-btn")?.addEventListener("click", () => {
          const blob = new Blob([draftJson], { type: "application/json;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${slug || "draft"}-backup.json`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }
    }

    if (typeof window !== "undefined") {
      const checkAndRenderSyncBar = () => {
        try {
          const draftsRaw = window.localStorage.getItem("glossy_pending_drafts");
          if (!draftsRaw) return;
          const pending = JSON.parse(draftsRaw);
          const unsyncedSlugs = Object.keys(pending).filter((k) => !pending[k].synced);
          if (unsyncedSlugs.length === 0) return;

          if (document.getElementById("tina-draft-sync-bar")) return;

          const bar = document.createElement("div");
          bar.id = "tina-draft-sync-bar";
          bar.style.cssText =
            "position:fixed;bottom:1.5rem;right:1.5rem;z-index:99999;background:#1c1917;color:#fafaf9;padding:1rem 1.25rem;border-radius:0.5rem;box-shadow:0 12px 30px rgba(0,0,0,0.35);border:1px solid #44403c;font-family:sans-serif;font-size:0.875rem;max-width:30rem;display:flex;flex-direction:column;gap:0.65rem;";

          bar.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:600;color:#eab308;display:flex;align-items:center;gap:0.4rem;">
                📥 Local Storage Draft Detected
              </span>
              <button id="tina-draft-sync-close" style="background:transparent;border:none;color:#a8a29e;cursor:pointer;font-size:1.2rem;line-height:1;" title="Dismiss">&times;</button>
            </div>
            <div style="font-size:0.82rem;color:#d6d3d1;line-height:1.4;">
              Found unsynced working draft from the visual editor for <strong>${unsyncedSlugs.join(", ")}</strong>. Commit this draft directly to TinaCMS & Git repository:
            </div>
            <div style="display:flex;gap:0.5rem;margin-top:0.25rem;">
              <button id="tina-draft-sync-action" style="background:#7b3f2a;color:#fff;border:none;padding:0.45rem 0.9rem;border-radius:0.3rem;font-weight:600;cursor:pointer;font-size:0.82rem;">Commit Draft to Git</button>
              <a href="/edit/${unsyncedSlugs[0]}" target="_blank" style="background:#292524;color:#d6d3d1;padding:0.45rem 0.9rem;border-radius:0.3rem;text-decoration:none;font-size:0.82rem;display:inline-flex;align-items:center;border:1px solid #44403c;">Open Editor ↗</a>
            </div>
          `;

          document.body.appendChild(bar);

          document.getElementById("tina-draft-sync-close")?.addEventListener("click", () => {
            bar.remove();
          });

          document.getElementById("tina-draft-sync-action")?.addEventListener("click", async () => {
            const btn = document.getElementById("tina-draft-sync-action");
            if (btn) btn.textContent = "Committing to Git...";
            let currentSlug = unsyncedSlugs[0] || "";
            let currentDraftRaw = "";
            try {
              const tinaApi = (cms.api as {
                tina?: {
                  request: (
                    query: string,
                    options?: { variables: Record<string, unknown> }
                  ) => Promise<unknown>;
                };
              })?.tina;
              if (!tinaApi?.request) {
                throw new Error("Tina API client is not initialized.");
              }

              for (const slug of unsyncedSlugs) {
                currentSlug = slug;
                const draftDataRaw = window.localStorage.getItem(`glossy_draft_${slug}`);
                if (!draftDataRaw) continue;
                currentDraftRaw = draftDataRaw;
                const draftDoc = JSON.parse(draftDataRaw);
                const sanitizedParams = sanitizeDraftForTinaMutation(draftDoc);

                await tinaApi.request(
                  `mutation UpdateText($relativePath: String!, $params: TextMutation!) {
                    updateText(relativePath: $relativePath, params: $params) {
                      id
                      title
                      _sys { relativePath }
                    }
                  }`,
                  {
                    variables: {
                      relativePath: `${draftDoc.fileName || draftDoc.textId || slug}.json`,
                      params: sanitizedParams,
                    },
                  }
                );

                pending[slug].synced = true;
              }
              window.localStorage.setItem("glossy_pending_drafts", JSON.stringify(pending));
              if (btn) btn.textContent = "✅ Committed!";
              setTimeout(() => bar.remove(), 2500);
            } catch (err: unknown) {
              if (btn) btn.textContent = "Sync Failed";
              showDraftErrorModal({
                title: "Could Not Commit Draft to TinaCMS",
                summary: `Failed while attempting to commit draft changes for "${currentSlug}". Your draft is safely preserved in browser storage.`,
                rawError: err,
                draftJson: currentDraftRaw,
                slug: currentSlug,
              });
            }
          });
        } catch (e) {
          console.error("Draft sync check error", e);
        }
      };

      setTimeout(checkAndRenderSyncBar, 1200);
    }
    return cms;
  },
});
