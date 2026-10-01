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

const reader = await check("/", [
  "Old English visual gloss",
  "Edit text and glosses",
  "Source gloss line",
  "Ohthere.nom",
]);
if (!reader.includes("/admin/index.html#/collections/manuscript/~") && !reader.includes("/admin/index.html#/collections/text/~")) {
  throw new Error("The reader's edit link does not open the Tina collection.");
}
if (reader.includes("Hear word")) {
  throw new Error("The unreliable browser speech control should not appear in the reader.");
}

await check("/texts/ohthere-wulfstan", ["The voyages of Ohthere and Wulfstan"]);
await check("/texts/ohthere", ["The voyages of Ohthere and Wulfstan"]);
await check("/admin/index.html", ["Tina"]);
console.log(`Smoke test passed for reader, text preview, and Tina admin at ${baseUrl}.`);
