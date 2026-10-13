import fs from "node:fs";
import path from "node:path";
import type { LexiconEntry, LexiconMap } from "./types";

let cachedLexiconMap: LexiconMap | null = null;

export function loadLexicon(): LexiconMap {
  if (cachedLexiconMap) return cachedLexiconMap;

  const lexiconDir = path.join(process.cwd(), "content", "lexicon");
  const map: LexiconMap = {};

  if (fs.existsSync(lexiconDir)) {
    const files = fs.readdirSync(lexiconDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      try {
        const filePath = path.join(lexiconDir, file);
        const raw = fs.readFileSync(filePath, "utf8");
        const entry = JSON.parse(raw) as LexiconEntry;
        if (entry && entry.id) {
          map[entry.id] = entry;
        }
      } catch (err) {
        console.error(`Failed to load lexicon entry ${file}:`, err);
      }
    }
  }

  cachedLexiconMap = map;
  return map;
}
