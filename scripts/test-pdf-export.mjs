import fs from "node:fs";
import { createTypstCompiler, createTypstFontBuilder } from "@myriaddreamin/typst.ts";
import { generateTypstSource, escapeTypst } from "../lib/typst-generator.ts";

async function testPdfExportPipeline() {
  console.log("Testing client-side Typst WebAssembly PDF export pipeline & font preloading...");

  // Unit Test 1: escapeTypst
  const rawString = "Hello #world [test] $100 _italic_ *bold* \\slash @user";
  const escaped = escapeTypst(rawString);
  if (!escaped.includes("\\#world") || !escaped.includes("\\[test\\]") || !escaped.includes("\\$100")) {
    throw new Error(`escapeTypst failed: ${escaped}`);
  }
  console.log("✓ escapeTypst special character escaping verified.");

  const fontFiles = [
    "public/fonts/CharisSIL-Regular.ttf",
    "public/fonts/CharisSIL-Italic.ttf",
    "public/fonts/CharisSIL-Bold.ttf",
  ];

  for (const fontPath of fontFiles) {
    if (!fs.existsSync(fontPath)) {
      throw new Error(`Font file missing: ${fontPath}`);
    }
  }

  const fontBuilder = createTypstFontBuilder();
  await fontBuilder.init();

  for (const fontPath of fontFiles) {
    const buf = fs.readFileSync(fontPath);
    await fontBuilder.addFontData(new Uint8Array(buf));
  }

  const sampleDoc = {
    textId: "ohthere-smoke-test",
    slug: "ohthere",
    language: "Old English",
    title: "The Voyages of Ohthere and Wulfstan",
    author: "Tyler Lemon",
    date: "September 30, 2026",
    source: "BL Cotton MS Tiberius B i",
    sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
    status: "published",
    blocks: [],
    sentences: [
      {
        id: "p1-s1",
        translation: "Ohthere said to his lord, King Alfred, that he lived furthest north of all Northmen.",
        words: [
          {
            id: "p1-s1-w1",
            originalWord: "Ōhthere",
            morphologicalGloss: "Ohthere.NOM",
            trailingPunctuation: ",",
          },
          {
            id: "p1-s1-w2",
            originalWord: "sǣde",
            morphologicalGloss: "say.PST.3SG",
          },
          {
            id: "p1-s1-w3",
            originalWord: "his",
            morphologicalGloss: "his.GEN",
          },
          {
            id: "p1-s1-w4",
            originalWord: "hlāforde",
            morphologicalGloss: "lord.DAT.SG",
            trailingPunctuation: ",",
          },
        ],
      },
    ],
  };

  const typstSource = generateTypstSource(sampleDoc);

  // Unit Test 2: generateTypstSource assertions
  if (!typstSource.includes('#set page(paper: "a4", margin: 2.5cm)')) {
    throw new Error("Page setup missing in Typst source.");
  }
  if (!typstSource.includes('#set text(font: "Charis SIL", size: 11pt)')) {
    throw new Error("Font setup missing in Typst source.");
  }
  if (!typstSource.includes("columns: (auto, auto, auto, auto)")) {
    throw new Error("Sentence column count mismatch: expected 4 auto columns.");
  }
  if (!typstSource.includes("[Ōhthere,]") || !typstSource.includes("[sǣde]")) {
    throw new Error("Word forms missing or misformatted in Typst source.");
  }
  if (!typstSource.includes("[Ohthere.NOM]") || !typstSource.includes("[say.PST.3SG]")) {
    throw new Error("Gloss items missing or misformatted in Typst source.");
  }
  console.log("✓ generateTypstSource interlinear grid generation verified.");

  const pdfBytes = await fontBuilder.build(async (fontResolver) => {
    const compiler = createTypstCompiler();
    await compiler.init();
    compiler.setFonts(fontResolver);
    compiler.addSource("/main.typ", typstSource);

    const pdfRes = await compiler.runWithWorld(
      { mainFilePath: "/main.typ" },
      async (world) => world.pdf(),
    );

    if (!pdfRes || !pdfRes.result) {
      throw new Error("Compilation produced no result.");
    }
    return pdfRes.result;
  });

  if (!pdfBytes || pdfBytes.length === 0) {
    throw new Error("Generated PDF binary is empty.");
  }

  const headerStr = Buffer.from(pdfBytes.slice(0, 8)).toString("utf8");
  if (!headerStr.startsWith("%PDF-")) {
    throw new Error(`Invalid PDF header signature: ${headerStr}`);
  }

  console.log(`✓ PDF compiled successfully (${pdfBytes.length} bytes). Magic header: ${headerStr.trim()}`);
  console.log("Client-side Typst WASM PDF Export pipeline test PASSED!");
}

testPdfExportPipeline().catch((err) => {
  console.error("PDF Export test failed:", err);
  process.exit(1);
});
