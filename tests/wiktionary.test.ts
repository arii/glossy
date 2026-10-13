import test from "node:test";
import assert from "node:assert";
import { getWiktionaryUrl } from "../lib/wiktionary";

test("getWiktionaryUrl strips combining macrons and formats Old English Wiktionary links", () => {
  // sǣd has macron on ae; stripping combining macron leaves æ -> encoded as %C3%A6
  const url1 = getWiktionaryUrl("sǣd");
  assert.strictEqual(url1, "https://en.wiktionary.org/wiki/s%C3%A6d#Old_English");

  // sād has macron on a; stripping macron leaves sad -> encoded as sad
  const url2 = getWiktionaryUrl("sād");
  assert.strictEqual(url2, "https://en.wiktionary.org/wiki/sad#Old_English");

  // secgan has no macron
  const url3 = getWiktionaryUrl("secgan");
  assert.strictEqual(url3, "https://en.wiktionary.org/wiki/secgan#Old_English");

  // Ōhthere has macron on O; stripping macron leaves Ohthere -> encoded as Ohthere
  const url4 = getWiktionaryUrl("Ōhthere");
  assert.strictEqual(url4, "https://en.wiktionary.org/wiki/Ohthere#Old_English");
});
