import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { loadTextDocuments } from "../../../lib/content";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      fileName?: string;
    };

    const slug = body?.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing text slug." }, { status: 400 });
    }

    // Protect the primary master manuscript
    if (slug === "ohthere-wulfstan" || slug === "ohthere" || body?.fileName === "ohthere") {
      return NextResponse.json(
        { error: "The primary reference manuscript 'The voyages of Ohthere and Wulfstan' is protected and cannot be deleted." },
        { status: 403 },
      );
    }

    const texts = loadTextDocuments();
    const targetDoc = texts.find((t) => t.slug === slug || t.textId === slug || t.fileName === slug || t.fileName === body?.fileName);

    const fileName = body.fileName || targetDoc?.fileName || targetDoc?.textId || slug;
    const jsonPath = path.join(process.cwd(), "content", "texts", `${fileName}.json`);

    // 1. Delete JSON content file
    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }

    // 2. Delete associated LaTeX references file if present
    if (targetDoc?.sourceFile) {
      const sourcePath = path.join(process.cwd(), targetDoc.sourceFile);
      if (fs.existsSync(sourcePath)) {
        fs.unlinkSync(sourcePath);
      }
    }

    // Check potential variants in references/
    const candidateTexPaths = [
      path.join(process.cwd(), "references", `${fileName}.tex`),
      path.join(process.cwd(), "references", `${slug}.tex`),
    ];
    for (const p of candidateTexPaths) {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully removed text "${targetDoc?.title || slug}" from the digital corpus.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to delete document.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
