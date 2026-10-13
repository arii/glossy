import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function normalizeOrthography(form) {
  if (!form) return "";
  return form
    .normalize("NFC")
    .toLowerCase()
    .replace(/[.,;:!?"'“”‘’()\[\]]+$/g, "")
    .replace(/^-+|-+$/g, "")
    .trim();
}

function stripHyphens(form) {
  return form.replace(/-/g, "");
}

function stripDiacritics(form) {
  return form
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC");
}

async function buildIndex() {
  console.log("🚀 Building pre-computed lexicon indexes...");

  const generatedDir = join(process.cwd(), "content", "_generated");
  mkdirSync(generatedDir, { recursive: true });

  const textsDir = join(process.cwd(), "content", "texts");
  const textFiles = readdirSync(textsDir).filter((f) => f.endsWith(".json"));

  // 1. Static Lexicon & Lemmatizer mappings from lib files
  const lexiconFile = readFileSync(join(process.cwd(), "lib", "old-english-lexicon.ts"), "utf8");
  const lemmatizerFile = readFileSync(join(process.cwd(), "lib", "lemmatizer.ts"), "utf8");

  // Surface -> Array of Lemma IDs
  const surfaceMap = {};
  // Lemma ID -> Lemma details & occurrences
  const lexiconIndex = {};
  // Metrics
  let totalTokens = 0;
  const lemmaFrequency = {};
  const posDistribution = {};

  function addSurfaceMapping(surfaceForm, lemmaId) {
    if (!surfaceForm || !lemmaId) return;

    const forms = new Set();
    const k1 = normalizeOrthography(surfaceForm);
    if (k1) forms.add(k1);

    const k2 = stripHyphens(k1);
    if (k2) forms.add(k2);

    const k3 = stripDiacritics(k1);
    if (k3) forms.add(k3);

    const k4 = stripDiacritics(k2);
    if (k4) forms.add(k4);

    for (const key of forms) {
      if (!surfaceMap[key]) surfaceMap[key] = [];
      if (!surfaceMap[key].includes(lemmaId)) {
        surfaceMap[key].push(lemmaId);
      }
    }
  }

  // Parse static mappings in old-english-lexicon.ts and lemmatizer.ts via Regex scanning
  // Lexicon dictionary entries: "surface": { lemma: "...", pos: "...", ... }
  const lexiconEntryRegex = /"([^"]+)":\s*\{\s*lemma:\s*"([^"]+)",\s*pos:\s*"([^"]+)"(?:,\s*wiktionaryUrl:\s*"([^"]+)")?(?:,\s*definition:\s*"([^"]+)")?/g;
  let match;
  while ((match = lexiconEntryRegex.exec(lexiconFile)) !== null) {
    const [, surfaceForm, lemma, pos, wiktionaryUrl, definition] = match;
    addSurfaceMapping(surfaceForm, lemma);

    if (!lexiconIndex[lemma]) {
      lexiconIndex[lemma] = {
        lemma,
        pos,
        definition: definition || "",
        wiktionaryUrl: wiktionaryUrl || `https://en.wiktionary.org/wiki/${encodeURIComponent(lemma)}#Old_English`,
        occurrencesCount: 0,
        occurrences: [],
      };
    }
  }

  // Map entries in lemmatizer maps (VERB_ABLUT_MAP, NOUN_LEMMA_MAP, ADJ_LEMMA_MAP, NUMERAL_MAP, DEMONSTRATIVE_ARTICLE_MAP, DETERMINER_MAP)
  const mapRegex = /"([^"]+)":\s*"([^"]+)"/g;
  while ((match = mapRegex.exec(lemmatizerFile)) !== null) {
    const [, surfaceForm, lemma] = match;
    addSurfaceMapping(surfaceForm, lemma);
  }

  // 2. Scan corpus texts in content/texts/*.json
  for (const file of textFiles.sort()) {
    const filePath = join(textsDir, file);
    const doc = JSON.parse(readFileSync(filePath, "utf8"));
    const textSlug = doc.slug || doc.textId || file.replace(/\.json$/, "");
    const textTitle = doc.title || textSlug;

    const sentences = doc.sentences || [];
    for (const sentence of sentences) {
      const sentenceId = sentence.id;
      const words = sentence.words || [];

      for (const word of words) {
        totalTokens++;
        const wordId = word.id;
        const originalWord = word.originalWord || "";
        const surfaceForm = normalizeOrthography(originalWord);

        const analysis = word.analysis || {};
        const lemma = analysis.lemma || surfaceForm;
        const pos = analysis.partOfSpeech || "noun";
        const definition = analysis.definition || word.morphologicalGloss || "";
        const wiktionaryUrl = analysis.wiktionaryUrl || `https://en.wiktionary.org/wiki/${encodeURIComponent(lemma)}#Old_English`;

        // Update surfaceMap
        addSurfaceMapping(originalWord, lemma);

        // Update lemma frequency
        lemmaFrequency[lemma] = (lemmaFrequency[lemma] || 0) + 1;

        // Update POS distribution
        posDistribution[pos] = (posDistribution[pos] || 0) + 1;

        // Update lexiconIndex
        if (!lexiconIndex[lemma]) {
          lexiconIndex[lemma] = {
            lemma,
            pos,
            definition,
            wiktionaryUrl,
            occurrencesCount: 0,
            occurrences: [],
          };
        } else {
          if (!lexiconIndex[lemma].definition && definition) {
            lexiconIndex[lemma].definition = definition;
          }
          if (!lexiconIndex[lemma].wiktionaryUrl && wiktionaryUrl) {
            lexiconIndex[lemma].wiktionaryUrl = wiktionaryUrl;
          }
        }

        lexiconIndex[lemma].occurrences.push({
          textSlug,
          textTitle,
          sentenceId,
          wordId,
          surface: surfaceForm,
          originalWord,
          morphologicalGloss: word.morphologicalGloss || "",
        });
        lexiconIndex[lemma].occurrencesCount = lexiconIndex[lemma].occurrences.length;
      }
    }
  }

  // Sort candidate lemma IDs in surfaceMap
  const sortedSurfaceMap = {};
  for (const key of Object.keys(surfaceMap).sort()) {
    sortedSurfaceMap[key] = surfaceMap[key].sort();
  }

  // Sort occurrences and entries in lexiconIndex
  const sortedLexiconIndex = {};
  for (const key of Object.keys(lexiconIndex).sort()) {
    const entry = lexiconIndex[key];
    entry.occurrences.sort((a, b) => {
      if (a.textSlug !== b.textSlug) return a.textSlug.localeCompare(b.textSlug);
      if (a.sentenceId !== b.sentenceId) return a.sentenceId.localeCompare(b.sentenceId);
      return a.wordId.localeCompare(b.wordId);
    });
    sortedLexiconIndex[key] = entry;
  }

  // Calculate hapax legomena (lemmas occurring exactly once)
  const hapaxLegomena = Object.keys(lemmaFrequency)
    .filter((lemma) => lemmaFrequency[lemma] === 1)
    .sort();

  // Sort lemma frequency keys
  const sortedLemmaFrequency = {};
  for (const key of Object.keys(lemmaFrequency).sort()) {
    sortedLemmaFrequency[key] = lemmaFrequency[key];
  }

  // Sort POS distribution keys
  const sortedPosDistribution = {};
  for (const key of Object.keys(posDistribution).sort()) {
    sortedPosDistribution[key] = posDistribution[key];
  }

  const vocabularyIndex = {
    totalTokens,
    uniqueLemmas: Object.keys(lemmaFrequency).length,
    uniqueSurfaceForms: Object.keys(sortedSurfaceMap).length,
    hapaxLegomena,
    lemmaFrequency: sortedLemmaFrequency,
    posDistribution: sortedPosDistribution,
  };

  // Write outputs deterministically
  writeFileSync(
    join(generatedDir, "surface-map.json"),
    JSON.stringify(sortedSurfaceMap, null, 2) + "\n"
  );
  writeFileSync(
    join(generatedDir, "lexicon-index.json"),
    JSON.stringify(sortedLexiconIndex, null, 2) + "\n"
  );
  writeFileSync(
    join(generatedDir, "vocabulary-index.json"),
    JSON.stringify(vocabularyIndex, null, 2) + "\n"
  );

  console.log(`✅ Generated lexicon indexes in content/_generated/:`);
  console.log(`   - surface-map.json (${Object.keys(sortedSurfaceMap).length} surface forms)`);
  console.log(`   - lexicon-index.json (${Object.keys(sortedLexiconIndex).length} lemmas)`);
  console.log(`   - vocabulary-index.json (${totalTokens} tokens, ${vocabularyIndex.uniqueLemmas} unique lemmas, ${hapaxLegomena.length} hapax legomena)`);
}

buildIndex().catch((err) => {
  console.error("🚨 Failed to build lexicon indexes:", err);
  process.exit(1);
});
