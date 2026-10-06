import assert from "node:assert/strict";
import { BUILT_IN_CORPUS, isBuiltInSlug, isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry.ts";
import { isWorkspaceSlug, getWorkspaceTexts, DRAFT_STORAGE_PREFIX, PENDING_MANIFEST_KEY } from "../lib/local-drafts.ts";

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

// Test 7: Simulated Browser Environment with Local Drafts
const mockStore = new Map();
global.window = {
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

// Ingest Cædmon's Hymn into simulated drafts
mockStore.set(
  `${DRAFT_STORAGE_PREFIX}caedmon-hymn`,
  JSON.stringify({
    version: 1,
    doc: {
      textId: "caedmon-hymn",
      slug: "caedmon-hymn",
      title: "Cædmon's Hymn (Local Draft)",
      author: "Cædmon",
      sentences: [],
    },
    baseHash: "test_hash",
    updatedAt: new Date().toISOString(),
  }),
);

assert.equal(isWorkspaceSlug("caedmon-hymn"), true, "Ingested draft caedmon-hymn must be recognized as in workspace");
assert.equal(isWorkspaceSlug("beowulf-prologue"), false, "Uningested beowulf must still not be in workspace");

const textsWithDraft = getWorkspaceTexts();
assert.equal(textsWithDraft.length, 2, "Workspace with draft should contain exactly 2 texts");
assert.deepEqual(
  textsWithDraft.map((t) => t.slug),
  ["ohthere", "caedmon-hymn"],
);

// Delete draft from mock storage
mockStore.delete(`${DRAFT_STORAGE_PREFIX}caedmon-hymn`);
assert.equal(isWorkspaceSlug("caedmon-hymn"), false, "Deleted draft caedmon-hymn must no longer be in workspace");
assert.equal(getWorkspaceTexts().length, 1, "Workspace must revert to 1 text after draft deletion");

delete global.window;

console.log("✓ All draft and corpus registry tests passed successfully!");

