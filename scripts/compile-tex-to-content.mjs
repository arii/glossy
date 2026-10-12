import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parseGb4eToTextDocument } from "../lib/gb4e.ts";
import { formatJson } from "./format-json.mjs";

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
  slug: "ohthere",
  title: "The voyages of Ohthere and Wulfstan",
  author: "Alfred the Great's Circle / Anonymous",
  editor: "Tyler Lemon",
  shelfmark: "BL Cotton MS Tiberius B i, fol. 11r–15v",
  dialect: "Early West Saxon",
  historicalDate: "c. 890–900 AD",
  source: "London, British Library, Cotton MS Tiberius B i, fol. 11r–15v",
  sourceFile: "references/Voyages_of_Ohthere_Wulfstan.tex",
  sourceEdition: "Old English Orosius (ed. Bately 1980 / Sweet)",
  date: "September 30, 2026",
  language: "Old English",
  status: "published",
});

const targetJsonPath = join(contentDir, "ohthere.json");
const formatted = await formatJson(JSON.stringify(document), targetJsonPath);
writeFileSync(targetJsonPath, formatted, "utf8");

console.log(
  `Successfully compiled full TeX document to ${targetJsonPath} (${document.sentences?.length || 0} sentences).`,
);
