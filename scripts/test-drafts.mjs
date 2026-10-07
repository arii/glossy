import assert from "node:assert/strict";
import { BUILT_IN_CORPUS, isBuiltInSlug, isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry.ts";
import {
  isWorkspaceSlug,
  getWorkspaceTexts,
  DRAFT_STORAGE_PREFIX,
  PENDING_MANIFEST_KEY,
  markPending,
  writeDraft,
  readDraft,
  listPending,
  deleteLocalDraft,
  getActiveSlug,
  setActiveSlug,
  clearActiveSlug,
} from "../lib/local-drafts.ts";
import { sanitizeDraftForTinaMutation, isTinaAuthenticated, commitPendingDraft } from "../lib/tina-sync.ts";

console.log("Running Unified TinaCMS Commit Pipeline & Sync Status Unit Tests...");

// Test 1: Built-in corpus checks
assert.ok(Array.isArray(BUILT_IN_CORPUS), "BUILT_IN_CORPUS must be an array");
assert.equal(BUILT_IN_CORPUS.length, 1, "BUILT_IN_CORPUS should have exactly 1 core text at startup");
assert.equal(isBuiltInSlug("ohthere"), true, "ohthere should be recognized as built-in");
assert.equal(isBuiltInSlug("ohthere-wulfstan"), true, "ohthere-wulfstan should be recognized as built-in");
assert.equal(isBuiltInSlug("beowulf-prologue"), true, "beowulf-prologue should be recognized as built-in");
assert.equal(isBuiltInSlug("non-existent-random-slug"), false, "random slug should not be built-in");

// Test 2: Protected status checks
assert.equal(isProtectedSlug("ohthere"), true, "ohthere must be protected");
assert.equal(isProtectedSlug("ohthere-wulfstan"), true, "ohthere-wulfstan must be protected");
assert.equal(isProtectedSlug("beowulf-prologue"), false, "beowulf-prologue must NOT be protected");
assert.equal(isProtectedSlug("caedmon-hymn"), false, "caedmon-hymn must NOT be protected");

// Test 3: Metadata retrieval
const ohthereMeta = getBuiltInMetadata("ohthere");
assert.ok(ohthereMeta, "ohthere metadata must exist");
assert.equal(ohthereMeta.protected, true, "ohthere should be protected");

// Test 4: Workspace slug checks
assert.equal(isWorkspaceSlug("ohthere"), true, "ohthere must be in workspace");
assert.equal(isWorkspaceSlug("ohthere-wulfstan"), true, "ohthere-wulfstan alias must be in workspace");
assert.equal(isWorkspaceSlug("beowulf-prologue"), false, "uningested preset beowulf-prologue must NOT be in workspace");

// Test 5: getWorkspaceTexts
const defaultTexts = getWorkspaceTexts();
assert.equal(defaultTexts.length, 1, "Default workspace must contain only 1 text (Ohthere)");
assert.equal(defaultTexts[0].slug, "ohthere");

// Test 6: sanitizeDraftForTinaMutation unit tests
const editorDoc = {
  textId: "test-text",
  slug: "test-text",
  title: "Test Document Title",
  author: "Test Author",
  language: "Old English",
  sentences: [
    {
      id: "sent-1",
      freeTranslation: "This is a test sentence.",
      tokens: [
        {
          id: "tok-1",
          sourceForm: "Hwæt!",
          sourceGloss: "what!",
          literalTexGloss: "what!",
          lemma: "hwæt",
          pos: "interjection",
          explanation: "interjection / listen!",
          morphemes: [],
        },
      ],
    },
  ],
};

const sanitized = sanitizeDraftForTinaMutation(editorDoc);
assert.equal(sanitized.textId, "test-text", "sanitized textId must match input");
assert.equal(sanitized.slug, "test-text", "sanitized slug must match input");
assert.equal(sanitized.title, "Test Document Title", "sanitized title must match input");
assert.equal(Array.isArray(sanitized.sentences), true, "sanitized sentences must be an array");
const firstSent = sanitized.sentences[0];
assert.equal(firstSent.translation, "This is a test sentence.", "translation must be mapped from freeTranslation");
const firstWord = firstSent.words[0];
assert.equal(firstWord.originalWord, "Hwæt!", "originalWord must be mapped from sourceForm");

// Test 7: Simulated Browser Environment with Typed Outcomes & Edit-after-Commit
const mockStore = new Map();
global.window = {
  location: { hostname: "example.com" },
  localStorage: {
    getItem: (key) => (mockStore.has(key) ? mockStore.get(key) : null),
    setItem: (key, val) => mockStore.set(key, String(val)),
    removeItem: (key) => mockStore.delete(key),
    clear: () => mockStore.clear(),
    key: (i) => Array.from(mockStore.keys())[i] ?? null,
    get length() {
      return mockStore.size;
    },
  },
  dispatchEvent: () => {},
};

// 7a. Test unauthenticated outcome (needs-login)
const unauthRes = await commitPendingDraft("non-existent-draft");
assert.equal(unauthRes.ok, false, "Unstored draft commit must return ok: false");
assert.equal(unauthRes.outcome, "rejected", "Unstored draft must return outcome: rejected");

// Ingest Cædmon's Hymn as a local draft
const caedmonDoc = {
  textId: "caedmon-hymn",
  slug: "caedmon-hymn",
  title: "Cædmon's Hymn (Local Draft)",
  language: "Old English",
  author: "Cædmon",
  sentences: [],
};

writeDraft("caedmon-hymn", caedmonDoc);
const pending1 = listPending()["caedmon-hymn"];
assert.equal(pending1.synced, false, "Fresh draft must have synced: false");

// Without cms client or token, commitPendingDraft on remote host returns needs-login
const noAuthRes = await commitPendingDraft("caedmon-hymn");
assert.equal(noAuthRes.outcome, "needs-login", "Unauthenticated commit attempt must yield needs-login outcome");

// 7b. Test GraphQL rejection outcome (rejected)
const mockErrorCms = {
  api: {
    tina: {
      request: async () => ({
        errors: [{ message: "Schema validation failure: invalid sentence ID" }],
      }),
    },
  },
};

const rejectRes = await commitPendingDraft("caedmon-hymn", { cms: mockErrorCms });
assert.equal(rejectRes.ok, false, "Rejected GraphQL response must return ok: false");
assert.equal(rejectRes.outcome, "rejected", "Rejected GraphQL response must return outcome: rejected");
assert.equal(rejectRes.error, "Schema validation failure: invalid sentence ID");

// 7c. Test Successful Commit outcome (committed)
const mockSuccessCms = {
  api: {
    tina: {
      request: async (query, { variables }) => {
        assert.ok(query.includes("mutation UpdateText"), "Mutation query must contain UpdateText");
        assert.equal(variables.relativePath, "caedmon-hymn.json", "relativePath variable must be caedmon-hymn.json");
        return { data: { updateText: { id: "caedmon-hymn", title: "Cædmon's Hymn" } } };
      },
    },
  },
};

const commitRes = await commitPendingDraft("caedmon-hymn", { cms: mockSuccessCms });
assert.equal(commitRes.ok, true, "Successful commit must return ok: true");
assert.equal(commitRes.outcome, "committed", "Successful commit must return outcome: committed");

const pending2 = listPending()["caedmon-hymn"];
assert.equal(pending2.synced, true, "After successful commit, manifest entry must have synced: true");

// 7d. Test Edit-After-Commit scenario
// Re-editing the document changes its content hash, which must reset synced: false in manifest
const updatedCaedmonDoc = {
  ...caedmonDoc,
  title: "Cædmon's Hymn (Revised Edition)",
};
writeDraft("caedmon-hymn", updatedCaedmonDoc);

const pending3 = listPending()["caedmon-hymn"];
assert.equal(pending3.synced, false, "Editing a committed document must reset synced to false");

// Test 8: Legacy Key Migration Tests
mockStore.clear();
const legacyDocKey = "glossy_draft_legacy-text";
const legacyDocVal = {
  textId: "legacy-text",
  slug: "legacy-text",
  title: "Legacy Corpus Text",
  author: "Ancient Author",
  sentences: [
    {
      id: "s1",
      freeTranslation: "Legacy translation.",
      tokens: [
        {
          id: "w1",
          sourceForm: "Word",
          sourceGloss: "gloss",
          lemma: "word",
          pos: "noun",
          explanation: "a word",
        },
      ],
    },
  ],
};
mockStore.set(legacyDocKey, JSON.stringify(legacyDocVal));

const migratedDraft = readDraft("legacy-text");
assert.ok(migratedDraft, "readDraft must migrate legacy document");
assert.equal(migratedDraft.doc.title, "Legacy Corpus Text", "migrated doc title must match");
assert.equal(migratedDraft.doc.sentences[0].words[0].originalWord, "Word", "editor tokens shape must convert to canonical words shape");
assert.equal(mockStore.has(legacyDocKey), false, "legacy key glossy_draft_legacy-text must be removed after migration");
assert.ok(mockStore.has(`${DRAFT_STORAGE_PREFIX}legacy-text`), "migrated draft must be stored under glossy:v1:draft: legacy-text");

// Test 9: Quota Exceeded Behavior
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = () => {
  const err = new Error("QuotaExceededError: DOM Exception 22");
  throw err;
};

const quotaRes = writeDraft("quota-test", { slug: "quota-test", title: "Quota Test" });
assert.equal(quotaRes.ok, false, "Quota exceeded writeDraft must return ok: false");
assert.equal(quotaRes.reason, "quota", "Quota exceeded writeDraft reason must be quota");
assert.ok(quotaRes.message.includes("quota exceeded"), "Quota exceeded message must inform user");

// Restore mock setItem
window.localStorage.setItem = originalSetItem;

// Test 10: Corrupted JSON Parsing Recovery
mockStore.set(`${DRAFT_STORAGE_PREFIX}corrupt-text`, "INVALID_NON_JSON{{{");
const corruptDraft = readDraft("corrupt-text");
assert.equal(corruptDraft, null, "Corrupted JSON in draft key must safely return null without throwing");

// Test 11: Draft Deletion and Manifest Cleanup
mockStore.clear();
writeDraft("text-to-delete", { slug: "text-to-delete", title: "Text To Delete" });
assert.ok(listPending()["text-to-delete"], "Draft must exist in pending manifest");

const deleteRes = deleteLocalDraft("text-to-delete");
assert.equal(deleteRes, true, "deleteLocalDraft must return true");
assert.equal(mockStore.has(`${DRAFT_STORAGE_PREFIX}text-to-delete`), false, "v1 draft key must be removed");
assert.equal(listPending()["text-to-delete"], undefined, "Deleted draft must be removed from pending manifest");

// Test 12: Active Slug Helper Operations
mockStore.clear();
assert.equal(getActiveSlug(), null, "Initial active slug should be null");
setActiveSlug("beowulf");
assert.equal(getActiveSlug(), "beowulf", "getActiveSlug must return set active slug");
clearActiveSlug();
assert.equal(getActiveSlug(), null, "clearActiveSlug must remove active slug");

// Clean up
mockStore.clear();
delete global.window;

console.log("✓ All unified commit pipeline, storage migration, quota & active-slug unit tests passed successfully!");
