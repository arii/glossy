import fs from "node:fs";
import path from "node:path";
import { tokenizeAndLemmatizeSentence } from "../lib/lemmatizer.ts";
import { exportToGb4eLatex } from "../data/latex-export.ts";

const lines = [
  {
    oe: "Hwæt! Wē Gār-Den-a in ġeār-dag-um,",
    en: "Listen! We of the Spear-Danes in days of yore,",
  },
  {
    oe: "þēod-cyning-a, þrym ġefrūnon,",
    en: "of the people's kings, have heard of their glory,",
  },
  {
    oe: "hū ðā æþelingas ellen fremedon.",
    en: "how those noble princes performed courageous deeds.",
  },
  {
    oe: "Oft Scyld Scēfing sceaþena þrēatum,",
    en: "Often Scyld Scefing from troops of enemies,",
  },
  {
    oe: "monegum mǣġþum, meodo-setl-a oftēah,",
    en: "from many tribes, seized the mead-benches,",
  },
  {
    oe: "egsode eorlas, syððan ǣrest wearð",
    en: "terrified the earls, after he was first",
  },
  {
    oe: "fēasceaft funden; hē þæs frōfre ġebād,",
    en: "found destitute; he experienced solace for that,",
  },
  {
    oe: "wēox under wolcnum, weorðmyndum þāh,",
    en: "grew under the clouds, prospered in honors,",
  },
  {
    oe: "oðþæt him ǣġhwylċ þāra ymbsittendra",
    en: "until each of the surrounding peoples",
  },
  {
    oe: "ofer hron-rād-e hȳran scolde,",
    en: "across the whale-road had to obey him,",
  },
  {
    oe: "gomban gyldan. Þæt wæs gōd cyning!",
    en: "and pay tribute. That was a good king!",
  },
];

const sentences = lines.map((line, sIdx) => {
  const words = tokenizeAndLemmatizeSentence(line.oe, sIdx + 1);
  return {
    id: `sent-${sIdx + 1}`,
    translation: line.en,
    words: words.map((w) => ({
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
  textId: "beowulf-prologue",
  slug: "beowulf-prologue",
  title: "Beowulf: Prologue (Lines 1–11)",
  author: "Anonymous (Nowell Codex)",
  source: "London, British Library, Cotton MS Vitellius A. xv, ff. 129r–198v",
  sourceFile: "references/Beowulf_Prologue.tex",
  language: "Old English",
  status: "published",
  sentences: sentences,
  blocks: [],
};

const texSource = exportToGb4eLatex(doc);
doc.texSource = texSource;

fs.writeFileSync(path.join(process.cwd(), "references", "Beowulf_Prologue.tex"), texSource, "utf8");
fs.writeFileSync(path.join(process.cwd(), "content", "texts", "beowulf-prologue.json"), JSON.stringify(doc, null, 2) + "\n", "utf8");

console.log(`Successfully compiled 11-line Beowulf Prologue (${sentences.length} sentences, ${sentences.reduce((acc, s) => acc + s.words.length, 0)} tokens)!`);
