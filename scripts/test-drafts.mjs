import assert from "node:assert/strict";
import { BUILT_IN_CORPUS, isBuiltInSlug, isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry.ts";
import {
  isWorkspaceSlug,
  getWorkspaceTexts,
  DRAFT_STORAGE_PREFIX,
  PENDING_MANIFEST_KEY,
  markPending,
  createLocalDocument,
  readDraft,
  listLocalDrafts,
  computeDocumentHash,
} from "../lib/local-drafts.ts";
import { sanitizeDraftForTinaMutation, isTinaAuthenticated, commitPendingDraft } from "../lib/tina-sync.ts";

console.log("Running Drafts & Registry Unit Tests...");

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
assert.equal(isProtectedSlug("the-wanderer"), false, "the-wanderer must NOT be protected");

// Test 3: Metadata retrieval
const ohthereMeta = getBuiltInMetadata("ohthere");
assert.ok(ohthereMeta, "ohthere metadata must exist");
assert.equal(ohthereMeta.protected, true, "ohthere should be protected");
assert.ok(ohthereMeta.title.length > 0, "ohthere title must not be empty");

// Test 4: Workspace slug checks (SSR mode without window)
assert.equal(isWorkspaceSlug("ohthere"), true, "ohthere must be in workspace");
assert.equal(isWorkspaceSlug("ohthere-wulfstan"), true, "ohthere-wulfstan alias must be in workspace");
assert.equal(isWorkspaceSlug("beowulf-prologue"), false, "uningested preset beowulf-prologue must NOT be in workspace");
assert.equal(isWorkspaceSlug("caedmon-hymn"), false, "uningested preset caedmon-hymn must NOT be in workspace");
assert.equal(isWorkspaceSlug("the-wanderer"), false, "uningested preset the-wanderer must NOT be in workspace");
assert.equal(isWorkspaceSlug(""), false, "empty slug must not be in workspace");

// Test 5: getWorkspaceTexts (SSR / Clean Workspace)
const defaultTexts = getWorkspaceTexts();
assert.equal(defaultTexts.length, 1, "Default workspace must contain only 1 text (Ohthere)");
assert.equal(defaultTexts[0].slug, "ohthere");

const ohthereTexts = getWorkspaceTexts({ currentSlug: "ohthere" });
assert.equal(ohthereTexts.length, 1, "Opening ohthere should not duplicate ohthere");

const aliasTexts = getWorkspaceTexts({ currentSlug: "ohthere-wulfstan" });
assert.equal(aliasTexts.length, 1, "ohthere-wulfstan alias should not create a duplicate entry");

// Test 6: Direct preset preview navigation
const beowulfTexts = getWorkspaceTexts({ currentSlug: "beowulf-prologue" });
assert.equal(beowulfTexts.length, 2, "Previewing beowulf should include ohthere and beowulf only");
assert.deepEqual(
  beowulfTexts.map((t) => t.slug),
  ["ohthere", "beowulf-prologue"],
  "Workspace should NOT include caedmon-hymn or the-wanderer when previewing beowulf",
);

// Test 7: sanitizeDraftForTinaMutation unit tests
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

// Test 8: Simulated Browser Environment with Local Drafts & Tina Sync
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
};

// Test isTinaAuthenticated helper
assert.equal(isTinaAuthenticated(), false, "Without token or localhost, isTinaAuthenticated must be false");
mockStore.set("tinacms-auth", "fake-token-123");
assert.equal(isTinaAuthenticated(), true, "With tinacms-auth in localStorage, isTinaAuthenticated must be true");

const mockCms = {
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
assert.equal(isTinaAuthenticated(mockCms), true, "With cms object containing api.tina, isTinaAuthenticated must be true");

// Ingest Cædmon's Hymn into simulated drafts
const caedmonDoc = {
  textId: "caedmon-hymn",
  slug: "caedmon-hymn",
  title: "Cædmon's Hymn (Local Draft)",
  author: "Cædmon",
  sentences: [],
};

mockStore.set(
  `${DRAFT_STORAGE_PREFIX}caedmon-hymn`,
  JSON.stringify({
    version: 1,
    doc: caedmonDoc,
    baseHash: "test_hash",
    updatedAt: new Date().toISOString(),
  }),
);

markPending("caedmon-hymn", caedmonDoc);

const pendingRawBefore = mockStore.get(PENDING_MANIFEST_KEY);
assert.ok(pendingRawBefore, "Pending manifest must exist");
const pendingBefore = JSON.parse(pendingRawBefore);
assert.equal(pendingBefore["caedmon-hymn"].synced, false, "Newly created draft must have synced: false");

// Commit draft via mock CMS
const commitRes = await commitPendingDraft("caedmon-hymn", { cms: mockCms });
assert.equal(commitRes.ok, true, "commitPendingDraft should succeed with mock CMS");

const pendingRawAfter = mockStore.get(PENDING_MANIFEST_KEY);
const pendingAfter = JSON.parse(pendingRawAfter);
assert.equal(pendingAfter["caedmon-hymn"].synced, true, "After commit, pending draft synced flag must be true");

// Test 9: Draft Persistence and Non-Deletion on Baseline Hash Match
const newDocResult = createLocalDocument({
  title: "Beowulf: Prologue (Lines 1–11)",
  slug: "beowulf-prologue",
  author: "Anonymous",
  sentences: [
    {
      id: "sent-1",
      translation: "Listen! We of the Spear-Danes in days of yore...",
      words: [
        {
          id: "w-1",
          originalWord: "Hwæt",
          morphologicalGloss: "listen",
          sourceGlossTex: "listen",
        },
      ],
    },
  ],
  overwrite: true,
});

assert.equal(newDocResult.ok, true, "createLocalDocument should succeed for beowulf-prologue");
const savedDraft = readDraft("beowulf-prologue");
assert.ok(savedDraft, "readDraft must return the newly created beowulf-prologue draft");
assert.equal(savedDraft.doc.title, "Beowulf: Prologue (Lines 1–11)");

// Compute hash and verify equality
const docHash = computeDocumentHash(savedDraft.doc);
assert.equal(docHash, savedDraft.baseHash, "Doc hash should equal stored base hash");

// Ensure draft persists in listLocalDrafts and getWorkspaceTexts
const localDraftsList = listLocalDrafts();
assert.ok(
  localDraftsList.some((d) => d.doc.slug === "beowulf-prologue"),
  "listLocalDrafts must include beowulf-prologue",
);

const updatedWorkspaceTexts = getWorkspaceTexts({ currentSlug: "beowulf-prologue" });
assert.ok(
  updatedWorkspaceTexts.some((t) => t.slug === "beowulf-prologue"),
  "getWorkspaceTexts must list beowulf-prologue",
);
assert.ok(
  updatedWorkspaceTexts.some((t) => t.slug === "ohthere"),
  "getWorkspaceTexts must list ohthere alongside beowulf-prologue",
);

// Clean up
mockStore.delete(`${DRAFT_STORAGE_PREFIX}caedmon-hymn`);
mockStore.delete(`${DRAFT_STORAGE_PREFIX}beowulf-prologue`);
delete global.window;

console.log("✓ All draft and corpus registry tests passed successfully!");
