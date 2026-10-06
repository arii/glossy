import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseGb4eToTextDocument } from "../lib/gb4e.ts";
import { exportToGb4eLatex } from "../data/latex-export.ts";

const texPath = join(process.cwd(), "references", "Voyages_of_Ohthere_Wulfstan.tex");
if (!existsSync(texPath)) {
  console.error(`Master TeX file not found at ${texPath}`);
  process.exit(1);
}

const contentDir = join(process.cwd(), "content", "texts");
if (!existsSync(contentDir)) {
  mkdirSync(contentDir, { recursive: true });
}

const texContent = readFileSync(texPath, "utf8");
const document = parseGb4eToTextDocument(texContent, {
  textId: "ohthere",
  slug: "ohthere-wulfstan",
  sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
  sourceEdition: "Full 75-example corpus from the accompanying gb4e LaTeX manuscript",
  status: "published",
});

const targetJsonPath = join(contentDir, "ohthere.json");
writeFileSync(targetJsonPath, JSON.stringify(document, null, 2) + "\n", "utf8");

console.log(
  `Successfully compiled full TeX document to ${targetJsonPath} (${document.sentences?.length || 0} sentences).`,
);
