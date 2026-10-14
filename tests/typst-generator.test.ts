import { generateTypstSource, escapeTypst } from "../lib/typst-generator.ts";
import type { TextDocument } from "../lib/types";

function runTests() {
  console.log("Running Typst generator unit tests...");

  // Test 1: escapeTypst
  const rawString = "Hello #world [test] $100 _italic_ *bold* \\slash @user";
  const escaped = escapeTypst(rawString);
  if (!escaped.includes("\\#world") || !escaped.includes("\\[test\\]") || !escaped.includes("\\$100")) {
    throw new Error(`escapeTypst failed: ${escaped}`);
  }
  console.log("✓ escapeTypst special character escaping verified.");

  // Test 2: generateTypstSource with sample TextDocument
  const sampleDoc: TextDocument = {
    textId: "ohthere-test",
    slug: "ohthere",
    language: "Old English",
    title: "The Voyages of Ohthere and Wulfstan",
    author: "Alfred the Great",
    historicalAuthor: "King Alfred",
    date: "890 AD",
    source: "BL Cotton MS Tiberius B i",
    sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
    status: "published",
    blocks: [],
    sentences: [
      {
        id: "s1",
        translation: "Ohthere said to his lord, King Alfred, that he lived furthest north of all Northmen.",
        words: [
          {
            id: "w1",
            originalWord: "Ōhthere",
            morphologicalGloss: "Ohthere.NOM",
            trailingPunctuation: ",",
          },
          {
            id: "w2",
            originalWord: "sǣde",
            morphologicalGloss: "say.PST.3SG",
          },
          {
            id: "w3",
            originalWord: "his",
            morphologicalGloss: "his.GEN",
          },
        ],
      },
      {
        id: "s2",
        translation: "He said that the land extends very far to the north.",
        words: [
          {
            id: "w4",
            originalWord: "Hē",
            morphologicalGloss: "he.NOM",
          },
          {
            id: "w5",
            originalWord: "cwæþ",
            morphologicalGloss: "say.PST.3SG",
            trailingPunctuation: ".",
          },
        ],
      },
    ],
  };

  const source = generateTypstSource(sampleDoc);

  // Assertions
  if (!source.includes('#set page(paper: "a4", margin: 2.5cm)')) {
    throw new Error("Page setup missing in Typst source.");
  }

  if (!source.includes('#set text(font: "Charis SIL", size: 11pt)')) {
    throw new Error("Font setup missing in Typst source.");
  }

  if (!source.includes("The Voyages of Ohthere and Wulfstan")) {
    throw new Error("Title missing in Typst source.");
  }

  // Sentence 1 checks
  if (!source.includes("columns: (auto, auto, auto)")) {
    throw new Error("Sentence 1 column count mismatch: expected 3 auto columns.");
  }

  if (!source.includes("[Ōhthere,]") || !source.includes("[sǣde]") || !source.includes("[his]")) {
    throw new Error("Sentence 1 word forms missing or misformatted.");
  }

  if (!source.includes("[Ohthere.NOM]") || !source.includes("[say.PST.3SG]") || !source.includes("[his.GEN]")) {
    throw new Error("Sentence 1 gloss items missing or misformatted.");
  }

  // Sentence 2 checks
  if (!source.includes("columns: (auto, auto)")) {
    throw new Error("Sentence 2 column count mismatch: expected 2 auto columns.");
  }

  if (!source.includes("[cwæþ.]")) {
    throw new Error("Sentence 2 word form with trailing punctuation missing.");
  }

  // Test 3: escapeTypst does not double escape dollar signs
  const mathStr = "approx ($sim$14 feet) or $10";
  const mathEscaped = escapeTypst(mathStr);
  if (mathEscaped.includes("\\\\$") || !mathEscaped.includes("\\$sim\\$14 feet") || !mathEscaped.includes("\\$10")) {
    throw new Error(`escapeTypst dollar handling failed: ${mathEscaped}`);
  }
  console.log("✓ escapeTypst single dollar escaping verified.");

  // Test 4: generateTypstSource with EditorDocument format
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorDoc: any = {
    title: "Editor Document",
    slug: "editor-doc",
    sentences: [
      {
        id: "s1",
        freeTranslation: "This is a free translation.",
        tokens: [
          { id: "t1", sourceForm: "Wordone", sourceGloss: "Glossone" },
          { id: "t2", sourceForm: "Wordtwo.", sourceGloss: "Glosstwo" },
        ],
      },
      {
        id: "s2",
        freeTranslation: "Long sentence translation.",
        tokens: Array.from({ length: 12 }, (_, i) => ({
          id: `t${i + 1}`,
          sourceForm: `W${i + 1}`,
          sourceGloss: `G${i + 1}`,
        })),
      },
    ],
  };

  const editorSource = generateTypstSource(editorDoc);
  if (!editorSource.includes("[Wordone]") || !editorSource.includes("[Wordtwo.]") || !editorSource.includes("[Glossone]")) {
    throw new Error("EditorDocument tokens not properly mapped in Typst source.");
  }
  if (!editorSource.includes("This is a free translation.")) {
    throw new Error("EditorDocument freeTranslation missing in Typst source.");
  }
  // Check chunking for sentence with 12 words (8 + 4)
  if (!editorSource.includes("columns: (auto, auto, auto, auto, auto, auto, auto, auto)") || !editorSource.includes("columns: (auto, auto, auto, auto)")) {
    throw new Error("Sentence with 12 words should be split into 8-col and 4-col grids.");
  }
  console.log("✓ EditorDocument and long sentence chunking verified.");

  console.log("✓ generateTypstSource interlinear grid generation verified.");
  console.log("All Typst generator unit tests passed successfully!");
}

runTests();
