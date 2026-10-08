import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import type { TextDocument } from "../../../lib/types";
import { exportToGb4eLatex } from "../../../data/latex-export";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      fileName?: string;
      document: TextDocument;
    };

    if (!body || !body.document) {
      return NextResponse.json({ error: "Missing document payload." }, { status: 400 });
    }

    const document = body.document;
    const fileName = body.fileName || document.textId || "ohthere";
    const slug = body.slug || document.slug || "ohthere-wulfstan";
    document.textId = document.textId || fileName || slug;
    document.slug = document.slug || slug;

    // 1. Export compilable LaTeX source
    const texSource = exportToGb4eLatex(document);
    document.texSource = texSource;

    // 2. Determine target TeX path
    const texTarget = document.sourceFile
      ? path.join(process.cwd(), document.sourceFile)
      : path.join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");

    // Ensure directory exists
    const texDir = path.dirname(texTarget);
    if (!fs.existsSync(texDir)) {
      fs.mkdirSync(texDir, { recursive: true });
    }

    fs.writeFileSync(texTarget, texSource, "utf8");

    // 3. Determine target JSON path
    const jsonTarget = path.join(process.cwd(), "content", "texts", `${fileName}.json`);
    const jsonDir = path.dirname(jsonTarget);
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    fs.writeFileSync(jsonTarget, JSON.stringify(document, null, 2) + "\n", "utf8");

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${slug} to master TeX (${path.relative(process.cwd(), texTarget)}) and TinaCMS JSON (${path.relative(process.cwd(), jsonTarget)})!`,
      texFile: path.relative(process.cwd(), texTarget),
      jsonFile: path.relative(process.cwd(), jsonTarget),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to save document.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
