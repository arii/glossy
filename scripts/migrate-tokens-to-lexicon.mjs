import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const textsDir = join(process.cwd(), "content", "texts");
const lexiconDir = join(process.cwd(), "content", "lexicon");

if (!existsSync(lexiconDir)) {
  mkdirSync(lexiconDir, { recursive: true });
}

function normalizePos(pos) {
  if (!pos) return "N";
  const p = pos.toLowerCase();
  if (p === "verb" || p === "v") return "V";
  if (p === "noun" || p === "n") return "N";
  if (p === "adjective" || p === "adj") return "ADJ";
  if (p === "adverb" || p === "adv") return "ADV";
  if (p === "pronoun" || p === "pron" || p === "determiner") return "PRON";
  if (p === "preposition" || p === "prep") return "PREP";
  if (p === "conjunction" || p === "conj") return "CONJ";
  if (p === "interjection" || p === "interj") return "INTERJ";
  return "N";
}

function makeSlug(lemma) {
  return lemma
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ð/g, "th")
    .replace(/þ/g, "th")
    .replace(/ċ/g, "c")
    .replace(/ġ/g, "g")
    .replace(/[^a-z0-9]/g, "");
}

// Map to store constructed lexicon entries: key = lemma + "::" + pos
const lexiconEntriesMap = new Map();

function getOrCreateEntry(lemma, pos, phonetic) {
  const normPos = normalizePos(pos);
  const key = `${lemma}::${normPos}`;
  if (!lexiconEntriesMap.has(key)) {
    const baseSlug = makeSlug(lemma) || "word";
    const entryId = `${baseSlug}-${normPos.toLowerCase()}-1`;
    lexiconEntriesMap.set(key, {
      id: entryId,
      lemma,
      pos: normPos,
      ipa: phonetic,
      sensesMap: new Map(),
      defaultSenseId: "sense-1",
    });
  }
  const entry = lexiconEntriesMap.get(key);
  if (!entry.ipa && phonetic) {
    entry.ipa = phonetic;
  }
  return entry;
}

function addSense(entry, definition, isPrimary = false) {
  if (!definition) return;
  if (isPrimary && entry.sensesMap.has(definition)) {
    // If primary definition is already in sensesMap, keep it
    return;
  }
  if (!entry.sensesMap.has(definition)) {
    if (isPrimary && entry.sensesMap.size > 0) {
      // Re-order so primary definition is sense-1
      const oldSenses = Array.from(entry.sensesMap.keys());
      entry.sensesMap.clear();
      entry.sensesMap.set(definition, "sense-1");
      oldSenses.forEach((def, idx) => {
        if (def !== definition) {
          entry.sensesMap.set(def, `sense-${idx + 2}`);
        }
      });
    } else {
      const senseIndex = entry.sensesMap.size + 1;
      const senseId = `sense-${senseIndex}`;
      entry.sensesMap.set(definition, senseId);
    }
  }
}

// 1. Process seed dictionary definitions from lib/old-english-lexicon.ts
const seedLexiconContent = readFileSync(join(process.cwd(), "lib", "old-english-lexicon.ts"), "utf8");
const entryMatches = seedLexiconContent.matchAll(/lemma:\s*"([^"]+)",\s*pos:\s*"([^"]+)"(?:,\s*wiktionaryUrl:[^,\n]+)?(?:,\s*definition:\s*"([^"]+)")?(?:,\s*ipa:\s*"([^"]+)")?/g);

for (const match of entryMatches) {
  const [, lemma, pos, definition, ipa] = match;
  if (lemma) {
    const entry = getOrCreateEntry(lemma, pos, ipa);
    if (definition) {
      addSense(entry, definition, true);
    }
  }
}

// 2. Gather entries across all text documents
const files = readdirSync(textsDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const filePath = join(textsDir, file);
  const doc = JSON.parse(readFileSync(filePath, "utf8"));
  if (!doc.sentences) continue;

  for (const sentence of doc.sentences) {
    const words = sentence.words || sentence.tokens || [];
    for (const word of words) {
      if (!word.analysis) continue;

      const lemma = word.analysis.lemma || word.originalWord;
      const pos = word.analysis.partOfSpeech;
      const definition = word.analysis.definition || word.morphologicalGloss || lemma;

      const entry = getOrCreateEntry(lemma, pos, word.analysis.phonetic);
      addSense(entry, definition, false);
    }
  }
}

// 3. Save individual lexicon entries into content/lexicon/<id>.json
for (const entry of lexiconEntriesMap.values()) {
  const sensesObj = {};
  for (const [definition, senseId] of entry.sensesMap.entries()) {
    sensesObj[senseId] = {
      id: senseId,
      definition,
    };
  }

  const lexiconEntryRecord = {
    id: entry.id,
    lemma: entry.lemma,
    pos: entry.pos,
    ...(entry.ipa ? { ipa: entry.ipa } : {}),
    senses: sensesObj,
    defaultSenseId: entry.defaultSenseId,
  };

  const entryFilePath = join(lexiconDir, `${entry.id}.json`);
  writeFileSync(entryFilePath, JSON.stringify(lexiconEntryRecord, null, 2) + "\n", "utf8");
}

// 4. Update tokens in content/texts/*.json with lemmaRef and selectedSenseId
let totalUpdatedTokens = 0;

for (const file of files) {
  const filePath = join(textsDir, file);
  const doc = JSON.parse(readFileSync(filePath, "utf8"));
  if (!doc.sentences) continue;

  for (const sentence of doc.sentences) {
    const words = sentence.words || sentence.tokens || [];
    for (const word of words) {
      if (!word.analysis) continue;

      const lemma = word.analysis.lemma || word.originalWord;
      const pos = normalizePos(word.analysis.partOfSpeech);
      const definition = word.analysis.definition || word.morphologicalGloss || lemma;

      const entry = lexiconEntriesMap.get(`${lemma}::${pos}`);
      if (entry) {
        word.lemmaRef = entry.id;
        const senseId = entry.sensesMap.get(definition) || entry.defaultSenseId;
        word.selectedSenseId = senseId;
        totalUpdatedTokens++;
      }
    }
  }

  writeFileSync(filePath, JSON.stringify(doc, null, 2) + "\n", "utf8");
}

console.log(`Successfully generated ${lexiconEntriesMap.size} central lexicon entries in content/lexicon/`);
console.log(`Updated ${totalUpdatedTokens} tokens across corpus files in content/texts/`);
