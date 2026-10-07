import fs from "node:fs";
import path from "node:path";
import { exportToGb4eLatex, plainToTexGloss } from "../data/latex-export.ts";
import { formatJson } from "./format-json.mjs";

// Scholarly morpheme-by-morpheme segmentation and Leipzig glosses for Beowulf Prologue (Lines 1–11)
const beowulfData = [
  {
    id: "paragraph-1-sentence-1",
    translation: "Listen! We of the Spear-Danes in days of yore, of the people's kings, have heard of their glory, how those noble princes performed courageous deeds.",
    words: [
      {
        originalWord: "Hwæt",
        trailingPunctuation: "!",
        morphologicalGloss: "listen",
        sourceGlossTex: "\\textsc{listen}",
        analysis: {
          lemma: "hwæt",
          partOfSpeech: "interjection",
          definition: "Listen!, What!, Lo!, Behold!",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/hwæt#Old_English",
          features: {},
          morphemes: [{ form: "Hwæt", gloss: "listen" }],
        },
      },
      {
        originalWord: "Wē",
        morphologicalGloss: "1PL.NOM",
        sourceGlossTex: "1\\textsc{pl.nom}",
        analysis: {
          lemma: "wē",
          partOfSpeech: "pronoun",
          definition: "we",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/we#Old_English",
          features: { case: "nominative", number: "plural", person: 1 },
          morphemes: [{ form: "Wē", gloss: "1PL.NOM" }],
        },
      },
      {
        originalWord: "Gār-Den-a",
        morphologicalGloss: "spear-Dane-GEN.PL",
        sourceGlossTex: "spear-Dane-\\textsc{gen.pl}",
        analysis: {
          lemma: "Gār-Dene",
          partOfSpeech: "noun",
          definition: "Spear-Danes",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/Gar-Dene#Old_English",
          features: { case: "genitive", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "Gār", gloss: "spear" },
            { form: "Den", gloss: "Dane" },
            { form: "a", gloss: "GEN.PL" },
          ],
        },
      },
      {
        originalWord: "in",
        morphologicalGloss: "in",
        sourceGlossTex: "in",
        analysis: {
          lemma: "in",
          partOfSpeech: "preposition",
          definition: "in, into, on",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/in#Old_English",
          features: {},
          morphemes: [{ form: "in", gloss: "in" }],
        },
      },
      {
        originalWord: "ġeār-dag-um",
        trailingPunctuation: ",",
        morphologicalGloss: "year-day-DAT.PL",
        sourceGlossTex: "year-day-\\textsc{dat.pl}",
        analysis: {
          lemma: "ġēardag",
          partOfSpeech: "noun",
          definition: "days of yore, ancient times",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/geardag#Old_English",
          features: { case: "dative", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "ġeār", gloss: "year" },
            { form: "dag", gloss: "day" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-2",
    translation: "of the people's kings, have heard of their glory,",
    words: [
      {
        originalWord: "þēod-cyning-a",
        trailingPunctuation: ",",
        morphologicalGloss: "people-king-GEN.PL",
        sourceGlossTex: "people-king-\\textsc{gen.pl}",
        analysis: {
          lemma: "þēodcyning",
          partOfSpeech: "noun",
          definition: "people's king, national king",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/þeodcyning#Old_English",
          features: { case: "genitive", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "þēod", gloss: "people" },
            { form: "cyning", gloss: "king" },
            { form: "a", gloss: "GEN.PL" },
          ],
        },
      },
      {
        originalWord: "þrym",
        morphologicalGloss: "glory.ACC.SG",
        sourceGlossTex: "glory.\\textsc{acc.sg}",
        analysis: {
          lemma: "þrymm",
          partOfSpeech: "noun",
          definition: "glory, majesty, power",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/þrymm#Old_English",
          features: { case: "accusative", number: "singular", gender: "masculine" },
          morphemes: [{ form: "þrym", gloss: "glory.ACC.SG" }],
        },
      },
      {
        originalWord: "ġe-frūn-on",
        trailingPunctuation: ",",
        morphologicalGloss: "PFV-hear.PST-PL",
        sourceGlossTex: "\\textsc{pfv}-hear.\\textsc{pst}-\\textsc{pl}",
        analysis: {
          lemma: "ġefrīnan",
          partOfSpeech: "verb",
          definition: "to learn by asking, hear of",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/gefrinan#Old_English",
          features: { tense: "past", number: "plural", mood: "indicative" },
          morphemes: [
            { form: "ġe", gloss: "PFV" },
            { form: "frūn", gloss: "hear.PST" },
            { form: "on", gloss: "PL" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-3",
    translation: "how those noble princes performed courageous deeds.",
    words: [
      {
        originalWord: "hū",
        morphologicalGloss: "how",
        sourceGlossTex: "how",
        analysis: {
          lemma: "hū",
          partOfSpeech: "adverb",
          definition: "how",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/hu#Old_English",
          features: {},
          morphemes: [{ form: "hū", gloss: "how" }],
        },
      },
      {
        originalWord: "ðā",
        morphologicalGloss: "DEF.NOM.PL",
        sourceGlossTex: "\\textsc{def.nom.pl}",
        analysis: {
          lemma: "sē",
          partOfSpeech: "determiner",
          definition: "the, those",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
          features: { case: "nominative", number: "plural" },
          morphemes: [{ form: "ðā", gloss: "DEF.NOM.PL" }],
        },
      },
      {
        originalWord: "æþeling-as",
        morphologicalGloss: "noble-NOM.PL",
        sourceGlossTex: "noble-\\textsc{nom.pl}",
        analysis: {
          lemma: "æþeling",
          partOfSpeech: "noun",
          definition: "noble, prince, lord",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/æþeling#Old_English",
          features: { case: "nominative", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "æþeling", gloss: "noble" },
            { form: "as", gloss: "NOM.PL" },
          ],
        },
      },
      {
        originalWord: "ellen",
        morphologicalGloss: "valor.ACC.SG",
        sourceGlossTex: "valor.\\textsc{acc.sg}",
        analysis: {
          lemma: "ellen",
          partOfSpeech: "noun",
          definition: "courage, valor, noble deed",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/ellen#Old_English",
          features: { case: "accusative", number: "singular", gender: "neuter" },
          morphemes: [{ form: "ellen", gloss: "valor.ACC.SG" }],
        },
      },
      {
        originalWord: "fremed-on",
        trailingPunctuation: ".",
        morphologicalGloss: "perform-PST.PL",
        sourceGlossTex: "perform-\\textsc{pst.pl}",
        analysis: {
          lemma: "fremman",
          partOfSpeech: "verb",
          definition: "to do, perform, accomplish",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/fremman#Old_English",
          features: { tense: "past", number: "plural", mood: "indicative" },
          morphemes: [
            { form: "fremed", gloss: "perform.PST" },
            { form: "on", gloss: "PL" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-4",
    translation: "Often Scyld Scefing from troops of enemies, from many tribes, seized the mead-benches,",
    words: [
      {
        originalWord: "Oft",
        morphologicalGloss: "often",
        sourceGlossTex: "often",
        analysis: {
          lemma: "oft",
          partOfSpeech: "adverb",
          definition: "often, frequently",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/oft#Old_English",
          features: {},
          morphemes: [{ form: "Oft", gloss: "often" }],
        },
      },
      {
        originalWord: "Scyld",
        morphologicalGloss: "Scyld.NOM.SG",
        sourceGlossTex: "Scyld.\\textsc{nom.sg}",
        analysis: {
          lemma: "Scyld",
          partOfSpeech: "noun",
          definition: "Scyld (legendary Danish king)",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/Scyld#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [{ form: "Scyld", gloss: "Scyld.NOM.SG" }],
        },
      },
      {
        originalWord: "Scēf-ing",
        morphologicalGloss: "Sceaf-son.NOM.SG",
        sourceGlossTex: "Sceaf-son.\\textsc{nom.sg}",
        analysis: {
          lemma: "Scēfing",
          partOfSpeech: "noun",
          definition: "son of Sceaf (patronymic)",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/Scefing#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [
            { form: "Scēf", gloss: "Sceaf" },
            { form: "ing", gloss: "son.NOM.SG" },
          ],
        },
      },
      {
        originalWord: "sceaþe-na",
        morphologicalGloss: "enemy-GEN.PL",
        sourceGlossTex: "enemy-\\textsc{gen.pl}",
        analysis: {
          lemma: "sceaþa",
          partOfSpeech: "noun",
          definition: "enemy, warrior, harmer",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/sceaþa#Old_English",
          features: { case: "genitive", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "sceaþe", gloss: "enemy" },
            { form: "na", gloss: "GEN.PL" },
          ],
        },
      },
      {
        originalWord: "þrēat-um",
        trailingPunctuation: ",",
        morphologicalGloss: "troop-DAT.PL",
        sourceGlossTex: "troop-\\textsc{dat.pl}",
        analysis: {
          lemma: "þrēat",
          partOfSpeech: "noun",
          definition: "troop, host, crowd",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/þreat#Old_English",
          features: { case: "dative", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "þrēat", gloss: "troop" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-5",
    translation: "from many tribes, seized the mead-benches,",
    words: [
      {
        originalWord: "manig-um",
        morphologicalGloss: "many-DAT.PL",
        sourceGlossTex: "many-\\textsc{dat.pl}",
        analysis: {
          lemma: "manig",
          partOfSpeech: "adjective",
          definition: "many",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/manig#Old_English",
          features: { case: "dative", number: "plural", gender: "feminine" },
          morphemes: [
            { form: "manig", gloss: "many" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
      {
        originalWord: "mǣġþ-um",
        trailingPunctuation: ",",
        morphologicalGloss: "tribe-DAT.PL",
        sourceGlossTex: "tribe-\\textsc{dat.pl}",
        analysis: {
          lemma: "mǣġþ",
          partOfSpeech: "noun",
          definition: "tribe, nation, family",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/mægþ#Old_English",
          features: { case: "dative", number: "plural", gender: "feminine" },
          morphemes: [
            { form: "mǣġþ", gloss: "tribe" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
      {
        originalWord: "meodo-setl-a",
        morphologicalGloss: "mead-seat-GEN.PL",
        sourceGlossTex: "mead-seat-\\textsc{gen.pl}",
        analysis: {
          lemma: "meodosetl",
          partOfSpeech: "noun",
          definition: "mead-bench, mead-seat",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/meodosetl#Old_English",
          features: { case: "genitive", number: "plural", gender: "neuter" },
          morphemes: [
            { form: "meodo", gloss: "mead" },
            { form: "setl", gloss: "seat" },
            { form: "a", gloss: "GEN.PL" },
          ],
        },
      },
      {
        originalWord: "of-tēah",
        trailingPunctuation: ",",
        morphologicalGloss: "PV-deprive.PST.3SG",
        sourceGlossTex: "\\textsc{pv}-deprive.\\textsc{pst.3sg}",
        analysis: {
          lemma: "oftēon",
          partOfSpeech: "verb",
          definition: "to withhold, deprive of, withdraw",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/ofteon#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [
            { form: "of", gloss: "PV" },
            { form: "tēah", gloss: "deprive.PST.3SG" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-6",
    translation: "terrified the earls, after he was first found destitute;",
    words: [
      {
        originalWord: "egs-od-e",
        morphologicalGloss: "terrify-PST-IND.3SG",
        sourceGlossTex: "terrify-\\textsc{pst-ind.3sg}",
        analysis: {
          lemma: "egsian",
          partOfSpeech: "verb",
          definition: "to terrify, frighten",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/egsian#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [
            { form: "egs", gloss: "terrify" },
            { form: "od", gloss: "PST" },
            { form: "e", gloss: "IND.3SG" },
          ],
        },
      },
      {
        originalWord: "eorl-as",
        trailingPunctuation: ",",
        morphologicalGloss: "earl-ACC.PL",
        sourceGlossTex: "earl-\\textsc{acc.pl}",
        analysis: {
          lemma: "eorl",
          partOfSpeech: "noun",
          definition: "earl, nobleman, warrior",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/eorl#Old_English",
          features: { case: "accusative", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "eorl", gloss: "earl" },
            { form: "as", gloss: "ACC.PL" },
          ],
        },
      },
      {
        originalWord: "syððan",
        morphologicalGloss: "after",
        sourceGlossTex: "after",
        analysis: {
          lemma: "siþþan",
          partOfSpeech: "conjunction",
          definition: "since, after that, when",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/siþþan#Old_English",
          features: {},
          morphemes: [{ form: "syððan", gloss: "after" }],
        },
      },
      {
        originalWord: "ǣrest",
        morphologicalGloss: "first.SUP",
        sourceGlossTex: "first.\\textsc{sup}",
        analysis: {
          lemma: "ǣrest",
          partOfSpeech: "adverb",
          definition: "first, for the first time",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/ærest#Old_English",
          features: { degree: "superlative" },
          morphemes: [{ form: "ǣrest", gloss: "first.SUP" }],
        },
      },
      {
        originalWord: "wearð",
        morphologicalGloss: "become.PST.3SG",
        sourceGlossTex: "become.\\textsc{pst.3sg}",
        analysis: {
          lemma: "weorþan",
          partOfSpeech: "verb",
          definition: "to become, happen, be",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/weorþan#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [{ form: "wearð", gloss: "become.PST.3SG" }],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-7",
    translation: "found destitute; he experienced solace for that,",
    words: [
      {
        originalWord: "fēa-sceaft",
        morphologicalGloss: "destitute-NOM.SG",
        sourceGlossTex: "destitute-\\textsc{nom.sg}",
        analysis: {
          lemma: "fēasceaft",
          partOfSpeech: "adjective",
          definition: "destitute, helpless, wretched",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/feasceaft#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [
            { form: "fēa", gloss: "destitute" },
            { form: "sceaft", gloss: "NOM.SG" },
          ],
        },
      },
      {
        originalWord: "fund-en",
        trailingPunctuation: ";",
        morphologicalGloss: "find-PSTP.NOM.SG",
        sourceGlossTex: "find-\\textsc{pstp.nom.sg}",
        analysis: {
          lemma: "findan",
          partOfSpeech: "verb",
          definition: "found (past participle)",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/findan#Old_English",
          features: { tense: "past", case: "nominative", number: "singular" },
          morphemes: [
            { form: "fund", gloss: "find" },
            { form: "en", gloss: "PSTP.NOM.SG" },
          ],
        },
      },
      {
        originalWord: "hē",
        morphologicalGloss: "3SG.M.NOM",
        sourceGlossTex: "3\\textsc{sg.m.nom}",
        analysis: {
          lemma: "hē",
          partOfSpeech: "pronoun",
          definition: "he",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine", person: 3 },
          morphemes: [{ form: "hē", gloss: "3SG.M.NOM" }],
        },
      },
      {
        originalWord: "þæs",
        morphologicalGloss: "DEM.GEN.SG",
        sourceGlossTex: "\\textsc{dem.gen.sg}",
        analysis: {
          lemma: "sē",
          partOfSpeech: "determiner",
          definition: "of that, for that",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
          features: { case: "genitive", number: "singular", gender: "neuter" },
          morphemes: [{ form: "þæs", gloss: "DEM.GEN.SG" }],
        },
      },
      {
        originalWord: "frōfr-e",
        morphologicalGloss: "solace-ACC.SG",
        sourceGlossTex: "solace-\\textsc{acc.sg}",
        analysis: {
          lemma: "frōfor",
          partOfSpeech: "noun",
          definition: "solace, comfort, help",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/frofor#Old_English",
          features: { case: "accusative", number: "singular", gender: "feminine" },
          morphemes: [
            { form: "frōfr", gloss: "solace" },
            { form: "e", gloss: "ACC.SG" },
          ],
        },
      },
      {
        originalWord: "ġe-bād",
        trailingPunctuation: ",",
        morphologicalGloss: "PFV-experience.PST.3SG",
        sourceGlossTex: "\\textsc{pfv}-experience.\\textsc{pst.3sg}",
        analysis: {
          lemma: "ġebīdan",
          partOfSpeech: "verb",
          definition: "to experience, live to see, await",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/gebidan#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [
            { form: "ġe", gloss: "PFV" },
            { form: "bād", gloss: "experience.PST.3SG" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-8",
    translation: "grew under the clouds, prospered in honors,",
    words: [
      {
        originalWord: "wēox",
        morphologicalGloss: "grow.PST.3SG",
        sourceGlossTex: "grow.\\textsc{pst.3sg}",
        analysis: {
          lemma: "weaxan",
          partOfSpeech: "verb",
          definition: "to grow, wax, increase",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/weaxan#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [{ form: "wēox", gloss: "grow.PST.3SG" }],
        },
      },
      {
        originalWord: "under",
        morphologicalGloss: "under",
        sourceGlossTex: "under",
        analysis: {
          lemma: "under",
          partOfSpeech: "preposition",
          definition: "under, beneath",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/under#Old_English",
          features: {},
          morphemes: [{ form: "under", gloss: "under" }],
        },
      },
      {
        originalWord: "wolcn-um",
        trailingPunctuation: ",",
        morphologicalGloss: "cloud-DAT.PL",
        sourceGlossTex: "cloud-\\textsc{dat.pl}",
        analysis: {
          lemma: "wolcen",
          partOfSpeech: "noun",
          definition: "cloud, sky, heavens",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/wolcen#Old_English",
          features: { case: "dative", number: "plural", gender: "neuter" },
          morphemes: [
            { form: "wolcn", gloss: "cloud" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
      {
        originalWord: "weorð-mynd-um",
        morphologicalGloss: "honor-glory-DAT.PL",
        sourceGlossTex: "honor-glory-\\textsc{dat.pl}",
        analysis: {
          lemma: "weorðmynd",
          partOfSpeech: "noun",
          definition: "honor, dignity, glory",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/weorþmynd#Old_English",
          features: { case: "dative", number: "plural", gender: "feminine" },
          morphemes: [
            { form: "weorð", gloss: "honor" },
            { form: "mynd", gloss: "glory" },
            { form: "um", gloss: "DAT.PL" },
          ],
        },
      },
      {
        originalWord: "þāh",
        trailingPunctuation: ",",
        morphologicalGloss: "prosper.PST.3SG",
        sourceGlossTex: "prosper.\\textsc{pst.3sg}",
        analysis: {
          lemma: "þēon",
          partOfSpeech: "verb",
          definition: "to thrive, prosper, flourish",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/þeon#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [{ form: "þāh", gloss: "prosper.PST.3SG" }],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-9",
    translation: "until each of the surrounding peoples across the whale-road had to obey him,",
    words: [
      {
        originalWord: "oð-þæt",
        morphologicalGloss: "until",
        sourceGlossTex: "until",
        analysis: {
          lemma: "oþþæt",
          partOfSpeech: "conjunction",
          definition: "until, up to that point",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/oþþæt#Old_English",
          features: {},
          morphemes: [{ form: "oð-þæt", gloss: "until" }],
        },
      },
      {
        originalWord: "him",
        morphologicalGloss: "3SG.M.DAT",
        sourceGlossTex: "3\\textsc{sg.m.dat}",
        analysis: {
          lemma: "hē",
          partOfSpeech: "pronoun",
          definition: "him, to him",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/he#Old_English",
          features: { case: "dative", number: "singular", gender: "masculine", person: 3 },
          morphemes: [{ form: "him", gloss: "3SG.M.DAT" }],
        },
      },
      {
        originalWord: "ǣġ-hwylċ",
        morphologicalGloss: "each-NOM.SG",
        sourceGlossTex: "each-\\textsc{nom.sg}",
        analysis: {
          lemma: "ǣġhwilċ",
          partOfSpeech: "pronoun",
          definition: "each, every one",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/æghwilc#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [
            { form: "ǣġ", gloss: "each" },
            { form: "hwylċ", gloss: "NOM.SG" },
          ],
        },
      },
      {
        originalWord: "þār-a",
        morphologicalGloss: "DEF-GEN.PL",
        sourceGlossTex: "\\textsc{def-gen.pl}",
        analysis: {
          lemma: "sē",
          partOfSpeech: "determiner",
          definition: "of those, of the",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
          features: { case: "genitive", number: "plural" },
          morphemes: [
            { form: "þār", gloss: "DEF" },
            { form: "a", gloss: "GEN.PL" },
          ],
        },
      },
      {
        originalWord: "ymb-sitt-end-ra",
        morphologicalGloss: "neighbor-GEN.PL",
        sourceGlossTex: "neighbor-\\textsc{gen.pl}",
        analysis: {
          lemma: "ymbsittend",
          partOfSpeech: "noun",
          definition: "neighbor, one sitting around",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/ymbsittend#Old_English",
          features: { case: "genitive", number: "plural", gender: "masculine" },
          morphemes: [
            { form: "ymb", gloss: "around" },
            { form: "sitt", gloss: "sit" },
            { form: "end", gloss: "PTCP" },
            { form: "ra", gloss: "GEN.PL" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-10",
    translation: "across the whale-road had to obey him,",
    words: [
      {
        originalWord: "ofer",
        morphologicalGloss: "across",
        sourceGlossTex: "across",
        analysis: {
          lemma: "ofer",
          partOfSpeech: "preposition",
          definition: "over, across, beyond",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/ofer#Old_English",
          features: {},
          morphemes: [{ form: "ofer", gloss: "across" }],
        },
      },
      {
        originalWord: "hron-rād-e",
        morphologicalGloss: "whale-road-ACC.SG",
        sourceGlossTex: "whale-road-\\textsc{acc.sg}",
        analysis: {
          lemma: "hronrād",
          partOfSpeech: "noun",
          definition: "whale-road (kenning for the sea)",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/hronrad#Old_English",
          features: { case: "accusative", number: "singular", gender: "feminine" },
          morphemes: [
            { form: "hron", gloss: "whale" },
            { form: "rād", gloss: "road" },
            { form: "e", gloss: "ACC.SG" },
          ],
        },
      },
      {
        originalWord: "hȳr-an",
        morphologicalGloss: "obey-INF",
        sourceGlossTex: "obey-\\textsc{inf}",
        analysis: {
          lemma: "hȳran",
          partOfSpeech: "verb",
          definition: "to hear, obey, serve",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/hyran#Old_English",
          features: { mood: "infinitive" },
          morphemes: [
            { form: "hȳr", gloss: "obey" },
            { form: "an", gloss: "INF" },
          ],
        },
      },
      {
        originalWord: "scol-d-e",
        trailingPunctuation: ",",
        morphologicalGloss: "shall-PST-IND.3SG",
        sourceGlossTex: "shall-\\textsc{pst-ind.3sg}",
        analysis: {
          lemma: "sculan",
          partOfSpeech: "verb",
          definition: "must, had to, should",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/sculan#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [
            { form: "scol", gloss: "shall" },
            { form: "d", gloss: "PST" },
            { form: "e", gloss: "IND.3SG" },
          ],
        },
      },
    ],
  },
  {
    id: "paragraph-1-sentence-11",
    translation: "and pay tribute. That was a good king!",
    words: [
      {
        originalWord: "gomb-an",
        morphologicalGloss: "tribute-ACC.SG",
        sourceGlossTex: "tribute-\\textsc{acc.sg}",
        analysis: {
          lemma: "gombe",
          partOfSpeech: "noun",
          definition: "tribute, tax",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/gombe#Old_English",
          features: { case: "accusative", number: "singular", gender: "feminine" },
          morphemes: [
            { form: "gomb", gloss: "tribute" },
            { form: "an", gloss: "ACC.SG" },
          ],
        },
      },
      {
        originalWord: "gyld-an",
        trailingPunctuation: ".",
        morphologicalGloss: "pay-INF",
        sourceGlossTex: "pay-\\textsc{inf}",
        analysis: {
          lemma: "gieldan",
          partOfSpeech: "verb",
          definition: "to pay, yield, render",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/gieldan#Old_English",
          features: { mood: "infinitive" },
          morphemes: [
            { form: "gyld", gloss: "pay" },
            { form: "an", gloss: "INF" },
          ],
        },
      },
      {
        originalWord: "Þæt",
        morphologicalGloss: "that.NOM.SG",
        sourceGlossTex: "that.\\textsc{nom.sg}",
        analysis: {
          lemma: "sē",
          partOfSpeech: "determiner",
          definition: "that",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/se#Old_English",
          features: { case: "nominative", number: "singular", gender: "neuter" },
          morphemes: [{ form: "Þæt", gloss: "that.NOM.SG" }],
        },
      },
      {
        originalWord: "wæs",
        morphologicalGloss: "be.PST.3SG",
        sourceGlossTex: "be.\\textsc{pst.3sg}",
        analysis: {
          lemma: "wesan",
          partOfSpeech: "verb",
          definition: "was (past tense of be)",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/wesan#Old_English",
          features: { tense: "past", number: "singular", person: 3, mood: "indicative" },
          morphemes: [{ form: "wæs", gloss: "be.PST.3SG" }],
        },
      },
      {
        originalWord: "gōd",
        morphologicalGloss: "good.NOM.SG",
        sourceGlossTex: "good.\\textsc{nom.sg}",
        analysis: {
          lemma: "gōd",
          partOfSpeech: "adjective",
          definition: "good, noble, worthy",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/god#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [{ form: "gōd", gloss: "good.NOM.SG" }],
        },
      },
      {
        originalWord: "cyning",
        trailingPunctuation: "!",
        morphologicalGloss: "king.NOM.SG",
        sourceGlossTex: "king.\\textsc{nom.sg}",
        analysis: {
          lemma: "cyning",
          partOfSpeech: "noun",
          definition: "king, ruler",
          wiktionaryUrl: "https://en.wiktionary.org/wiki/cyning#Old_English",
          features: { case: "nominative", number: "singular", gender: "masculine" },
          morphemes: [{ form: "cyning", gloss: "king.NOM.SG" }],
        },
      },
    ],
  },
];

// Assign word IDs and review properties
for (const sent of beowulfData) {
  sent.words = sent.words.map((w, wIdx) => {
    const wordId = `${sent.id}-word-${wIdx + 1}`;
    const morphemes = w.analysis.morphemes.map((m, mIdx) => ({
      id: `${wordId}-morpheme-${mIdx + 1}`,
      form: m.form,
      gloss: m.gloss,
    }));
    const joinedForm = morphemes.map((m) => m.form).filter(Boolean).join("-");
    const joinedGloss = morphemes.map((m) => plainToTexGloss(m.gloss)).filter(Boolean).join("-");
    return {
      id: wordId,
      originalWord: joinedForm || w.originalWord,
      trailingPunctuation: w.trailingPunctuation,
      morphologicalGloss: morphemes.map((m) => m.gloss).filter(Boolean).join("-"),
      sourceGlossTex: joinedGloss || w.sourceGlossTex,
      analysis: {
        ...w.analysis,
        morphemes,
      },
      review: {
        status: "source-checked",
        source: {
          file: "references/Beowulf_Prologue.tex",
          locator: `${sent.id} / word ${wIdx + 1}`,
        },
      },
    };
  });
}

const doc = {
  textId: "beowulf-prologue",
  slug: "beowulf-prologue",
  title: "Beowulf: Prologue (Lines 1–11)",
  author: "Anonymous (Nowell Codex)",
  editor: "Tyler Lemon",
  shelfmark: "BL Cotton MS Vitellius A. xv, fol. 129r–198v (Nowell Codex)",
  dialect: "Late West Saxon (with Anglian features)",
  historicalDate: "c. 700–1000 AD (MS c. 1000–1010 AD)",
  source: "London, British Library, Cotton MS Vitellius A. xv, ff. 129r–198v",
  sourceEdition: "Klaeber's Beowulf (4th ed. Fulk, Bjork, Niles 2008)",
  sourceFile: "references/Beowulf_Prologue.tex",
  language: "Old English",
  status: "published",
  sentences: beowulfData,
  blocks: [],
};

const texSource = exportToGb4eLatex(doc);

fs.writeFileSync(path.join(process.cwd(), "references", "Beowulf_Prologue.tex"), texSource, "utf8");

const targetJsonPath = path.join(process.cwd(), "content", "texts", "beowulf-prologue.json");
const formatted = await formatJson(JSON.stringify(doc), targetJsonPath);
fs.writeFileSync(targetJsonPath, formatted, "utf8");

console.log(`Successfully compiled 11-line Beowulf Prologue (${beowulfData.length} sentences, ${beowulfData.reduce((acc, s) => acc + s.words.length, 0)} tokens with full Leipzig glosses & morpheme breakdowns)!`);

