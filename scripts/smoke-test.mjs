import { existsSync, readFileSync } from "node:fs";

const baseUrl = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const envFile = existsSync(".env") ? readFileSync(".env", "utf8") : "";
const clientId =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID ??
  envFile.match(/^NEXT_PUBLIC_TINA_CLIENT_ID=(.+)$/m)?.[1];

async function check(path, expectedText) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  for (const text of expectedText) {
    if (!body.includes(text)) {
      throw new Error(`${path} did not contain expected text: ${text}`);
    }
  }
  return body;
}

if (!clientId) {
  throw new Error(
    "NEXT_PUBLIC_TINA_CLIENT_ID is not configured; Tina admin login cannot be verified.",
  );
}

const landing = await check("/", [
  "Read a text or work on its glosses.",
  "/read/ohthere-wulfstan",
  "/edit/ohthere-wulfstan",
  "/read/beowulf-prologue",
  "/edit/beowulf-prologue",
]);
const cardCount = [...landing.matchAll(/class="workspace-choice-card"/gu)].length;
if (cardCount < 1) {
  throw new Error(`Expected at least one text on the landing page, found ${cardCount}.`);
}
const reader = await check("/read/ohthere-wulfstan", [
  "Old English visual gloss",
  "Source gloss line",
  "Ohthere",
  "Ohthere said to his lord, King Alfred",
]);
await check("/read/beowulf-prologue", [
  "Beowulf: Prologue (Lines 1–11)",
  "Hwæt!",
  "Gār-Den-a",
  "Listen! We of the Spear-Danes in days of yore,",
]);
if (reader.includes("Edit this text") || reader.includes("Editorial &amp; CMS Tools")) {
  throw new Error("The reader must not contain editing or CMS controls.");
}
if (reader.includes("Hear word")) {
  throw new Error("The unreliable browser speech control should not appear in the reader.");
}

await check("/edit/ohthere-wulfstan", [
  "Editing workspace",
  "Live preview",
  "Source form",
  "Explanation",
  "Read",
  "Paste one or more gb4e",
  "Save to TinaCMS",
]);
await check("/read/ohthere-wulfstan", ["The voyages of Ohthere and Wulfstan"]);
await check("/read/ohthere", ["The voyages of Ohthere and Wulfstan"]);
await check("/docs", ["Documentation &amp; Reference Guides", "Leipzig"]);
await check("/edit/new", ["Gloss a New Old English Text"]);
await check("/admin", ["Tina"]);
await check("/admin/index.html", ["Tina"]);
console.log(`Smoke test passed for landing, reader, editor, docs, ingestion, and Tina CMS admin dashboard at ${baseUrl}.`);
