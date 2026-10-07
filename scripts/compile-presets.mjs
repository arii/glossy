import fs from "node:fs";
import path from "node:path";
import { tokenizeAndLemmatizeSentence } from "../lib/lemmatizer.ts";
import { exportToGb4eLatex } from "../data/latex-export.ts";
import { formatJson } from "./format-json.mjs";

const PRESETS = [
  {
    id: "caedmon-hymn",
    title: "Cædmon's Hymn",
    slug: "caedmon-hymn",
    author: "Cædmon (Bede's Historia Ecclesiastica)",
    glossedBy: "Cædmon (Bede's Historia Ecclesiastica)",
    editor: "Tyler Lemon",
    shelfmark: "CUL MS Kk. 5. 16, fol. 128v (Moore Bede)",
    dialect: "Northumbrian (Early Old English)",
    historicalDate: "c. 658–680 AD (MS c. 737 AD)",
    source: "Cambridge, University Library, MS Kk. 5. 16 (Moore Bede)",
    sourceEdition: "Dobbie (1942), ASPR VI",
    sourceFile: "references/Caedmon_Hymn.tex",
    period: "Northumbrian Religious Hymn (ca. 7th c.)",
    lines: [
      {
        oe: "Nū sculon herigean heofonrīces Weard, Meotodes meahte ond his mōdġeþanc, weorc Wuldorfæder, swā hē wundra ġehwæs, ēce Drihten, ōr onstealde.",
        en: "Now we must praise the Guardian of the heavenly kingdom, the Maker's might and His mind's thought, the work of the Father of Glory, as He, the eternal Lord, established the beginning of each wonder.",
      },
      {
        oe: "Hē ǣrest sceōp eorðan bearnum heofon tō hrōfe, hālig Scyppend; þā middanġeard moncynnes Weard, ēce Drihten, æfter tēode fīrum foldan, Fēa ælmihtig.",
        en: "He first created heaven as a roof for the children of earth, holy Creator; then the Guardian of mankind, the eternal Lord, Almighty Ruler, afterwards adorned the middle-earth, the world for men.",
      },
    ],
  },
  {
    id: "the-wanderer",
    title: "The Wanderer (Opening)",
    slug: "the-wanderer",
    author: "Anonymous (Exeter Book)",
    editor: "Tyler Lemon",
    shelfmark: "Exeter Cathedral Library MS 3501, fol. 76v–79r (Exeter Book)",
    dialect: "Late West Saxon",
    historicalDate: "c. 10th Century AD (MS c. 970 AD)",
    source: "Exeter, Cathedral Library, MS 3501, ff. 76v–79r",
    sourceEdition: "Krapp & Dobbie (1936), ASPR III",
    sourceFile: "references/The_Wanderer.tex",
    period: "Elegiac Verse (10th c.)",
    lines: [
      {
        oe: "Oft him ānhaga āre ġebīdeð, metudes miltse, þēah þe hē mōdċeariġ geond lagulāde longe sceolde hrēran mid hondum hrīmcealde sǣ, wadan wræclāstas.",
        en: "Often the solitary one awaits mercy for himself, the Maker's grace, though sorrowful of mind across the water-way he must long stir the frost-cold sea with his hands, tread paths of exile.",
      },
      {
        oe: "Wyrd bið ful ārǣd!",
        en: "Fate is fully fixed!",
      },
    ],
  },
];

for (const preset of PRESETS) {
  const sentences = preset.lines.map((line, sIdx) => {
    const rawTokens = tokenizeAndLemmatizeSentence(line.oe, sIdx + 1);
    return {
      id: `${preset.id}-s${sIdx + 1}`,
      translation: line.en,
      words: rawTokens.map((w) => ({
        id: w.id,
        originalWord: w.sourceForm.replace(/[.,;:!?"'“”‘’()\[\]]+$/, ""),
        trailingPunctuation: (w.sourceForm.match(/[.,;:!?"'“”‘’()\[\]]+$/) || [""])[0],
        morphologicalGloss: w.sourceGloss,
        sourceGlossTex: w.literalTexGloss,
        analysis: {
          lemma: w.lemma,
          partOfSpeech: w.pos,
          definition: w.explanation,
          wiktionaryUrl: w.wiktionaryUrl,
          features: w.inflections || {},
          morphemes: w.morphemes
            ? w.morphemes.map((m) => ({ form: m.morpheme, gloss: m.gloss }))
            : [{ form: w.sourceForm, gloss: w.sourceGloss }],
        },
      })),
    };
  });

  const doc = {
    textId: preset.slug,
    slug: preset.slug,
    title: preset.title,
    author: preset.author,
    glossedBy: preset.glossedBy,
    editor: preset.editor,
    shelfmark: preset.shelfmark,
    dialect: preset.dialect,
    historicalDate: preset.historicalDate,
    source: preset.source,
    sourceEdition: preset.sourceEdition,
    sourceFile: preset.sourceFile,
    language: "Old English",
    status: "published",
    sentences,
    blocks: [],
  };

  const tex = exportToGb4eLatex(doc);

  fs.writeFileSync(path.join(process.cwd(), preset.sourceFile), tex, "utf8");
  const jsonPath = path.join(process.cwd(), "content", "texts", `${preset.slug}.json`);
  const formatted = await formatJson(JSON.stringify(doc), jsonPath);
  fs.writeFileSync(jsonPath, formatted, "utf8");

  console.log(`Compiled preset "${preset.title}" -> ${preset.sourceFile} and content/texts/${preset.slug}.json`);
}
