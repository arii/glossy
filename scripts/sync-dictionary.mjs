import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { lemmatizeOldEnglish } from "../lib/lemmatizer.ts";

const dictDir = join(process.cwd(), "content", "dictionary");
if (!existsSync(dictDir)) {
  mkdirSync(dictDir, { recursive: true });
}

// Canonical headwords list covering Old English corpus
const canonicalWords = [
  "sǣ-d-e",
  "cwæð",
  "bū-d-e",
  "wæs",
  "is",
  "sīe",
  "sȳ",
  "bēo-ð",
  "bi-ð",
  "hæf-d-e",
  "n-æf-d-e",
  "habb-að",
  "wīc-i-að",
  "wīc-o-d-e",
  "seġl-o-d-e",
  "seġl-i-an",
  "ġe-seġl-i-an",
  "ā-sett-e",
  "ġe-dō-ð",
  "ofer-fror-en",
  "of-slōg-e",
  "sōh-t-e",
  "ġyld-að",
  "ġylt",
  "lī-ð",
  "liċġ-að",
  "cym-ð",
  "cum-að",
  "drinc-að",
  "ōhthere",
  "wulfstān",
  "ælfrēd-e",
  "hlāford-e",
  "cyning-e",
  "cyning",
  "norð-monn-a",
  "norð-men",
  "finn-as",
  "cwēn-as",
  "fætels-as",
  "land",
  "sǣ",
  "mōr-as",
  "dēor-a",
  "hrān-as",
  "hors-an",
  "wæter-es",
  "eal-að",
  "sumor",
  "winter",
  "stēor-bord",
  "bæc-bord",
  "lang",
  "fēaw-um",
  "stōw-um",
  "wēst-e",
  "būton",
  "fisc-aþ-e",
  "hunt-oð-e",
  "styċċe-mǣl-um",
  "wiþ",
  "þonan",
  "hē",
  "his",
  "him",
  "hit",
  "hȳ",
  "þæt",
  "sē",
  "sēo",
  "þes",
  "þis",
  "eal-ra",
  "eall",
  "norþ-mest",
  "swīþ-e",
  "þēah",
  "ac",
  "and",
  "on",
  "mid",
  "be",
  "oð",
  "tō",
];

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip macrons/accents
    .replace(/æ/g, "ae")
    .replace(/Æ/g, "ae")
    .replace(/þ/g, "th")
    .replace(/Þ/g, "th")
    .replace(/ð/g, "th")
    .replace(/Ð/g, "th")
    .replace(/ġ/g, "g")
    .replace(/ċ/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map unique lemmas to clean files
const generatedEntries = new Map();

for (const surface of canonicalWords) {
  const lex = lemmatizeOldEnglish(surface, surface);
  const slug = slugify(lex.lemma);

  if (!generatedEntries.has(slug)) {
    const entry = {
      word: lex.lemma,
      lemma: lex.lemma,
      pronunciation: lex.ipa || "",
      pos: lex.pos,
      definition: lex.definition || "",
      wiktionaryUrl: lex.wiktionaryUrl,
      sourceGloss: surface,
    };
    generatedEntries.set(slug, entry);
  }
}

// Clean old directory files
for (const file of readdirSync(dictDir)) {
  if (file.endsWith(".json")) {
    unlinkSync(join(dictDir, file));
  }
}

// Write clean dictionary entries
let writtenCount = 0;
for (const [slug, entry] of generatedEntries.entries()) {
  const filePath = join(dictDir, `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(entry, null, 2) + "\n", "utf8");
  writtenCount++;
}

console.log(`Successfully synchronized ${writtenCount} dictionary entries to ${dictDir}`);
