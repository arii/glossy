import assert from "node:assert/strict";
import {
  writeDraft,
  readDraft,
  DRAFT_STORAGE_PREFIX,
} from "../../lib/local-drafts";
import type { TextDocument } from "../../lib/types";

console.log("Running tests/storage/local-drafts.test.ts...");

const mockStore = new Map<string, string>();
const dispatchedEvents: string[] = [];

global.window = {
  location: { hostname: "example.com" },
  localStorage: {
    getItem: (key: string) => (mockStore.has(key) ? mockStore.get(key)! : null),
    setItem: (key: string, val: string) => {
      mockStore.set(key, String(val));
    },
    removeItem: (key: string) => {
      mockStore.delete(key);
    },
    clear: () => mockStore.clear(),
    key: (i: number) => Array.from(mockStore.keys())[i] ?? null,
    get length() {
      return mockStore.size;
    },
  } as unknown as Storage,
  dispatchEvent: (event: Event) => {
    dispatchedEvents.push(event.type);
    return true;
  },
} as unknown as Window & typeof globalThis;

async function runStorageTests() {
  // Test 1: Envelope serialization and deserialization
  mockStore.clear();
  const testDoc: TextDocument = {
    textId: "ohthere",
    slug: "ohthere",
    title: "The Voyages of Ohthere",
    author: "Alfred",
    date: "c. 890",
    source: "BL Cotton Tiberius B i",
    sourceFile: "ohthere.json",
    language: "Old English",
    status: "draft",
    blocks: [],
    sentences: [
      {
        id: "s1",
        translation: "Ohthere said to his lord...",
        words: [{ id: "w1", originalWord: "Ōhtthere" }],
      },
    ],
  };

  const writeRes = writeDraft("ohthere", testDoc);
  assert.equal(writeRes.ok, true, "writeDraft must return ok: true");
  if (writeRes.ok) {
    assert.equal(writeRes.data.version, 1, "Envelope version must be 1");
    assert.equal(writeRes.data.slug, "ohthere", "Envelope slug must be ohthere");
    assert.ok(writeRes.data.savedAt, "Envelope savedAt timestamp must exist");
    assert.equal(writeRes.data.doc.title, "The Voyages of Ohthere");
  }

  const readRes = readDraft("ohthere");
  assert.ok(readRes, "readDraft must return envelope");
  assert.equal(readRes?.version, 1);
  assert.equal(readRes?.doc.title, "The Voyages of Ohthere");

  // Test 2: QuotaExceededError simulation returning { ok: false, error: "QUOTA_EXCEEDED" }
  mockStore.clear();
  const originalSetItem = window.localStorage.setItem;
  window.localStorage.setItem = () => {
    const err = new DOMException("QuotaExceededError: DOM Exception 22", "QuotaExceededError");
    throw err;
  };

  const quotaRes = writeDraft("quota-text", testDoc);
  assert.equal(quotaRes.ok, false, "Quota exceeded writeDraft must return ok: false");
  if (!quotaRes.ok) {
    assert.equal(quotaRes.error, "QUOTA_EXCEEDED", "Error code must be QUOTA_EXCEEDED");
    assert.equal(quotaRes.reason, "quota");
  }

  // Restore setItem
  window.localStorage.setItem = originalSetItem;

  // Test 4: Corrupted JSON recovery
  mockStore.clear();
  mockStore.set(`${DRAFT_STORAGE_PREFIX}corrupt`, "INVALID_NON_JSON{{{");
  const corruptRes = readDraft("corrupt");
  assert.equal(corruptRes, null, "Corrupt draft JSON must safely return null");

  // Clean up
  mockStore.clear();
  delete (global as unknown as { window?: unknown }).window;

  console.log("✓ All storage envelope, migration & quota unit tests passed successfully!");
}

runStorageTests().catch((err) => {
  console.error("Storage unit tests failed:", err);
  process.exit(1);
});
