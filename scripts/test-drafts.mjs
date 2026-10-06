import assert from "node:assert/strict";
import { BUILT_IN_CORPUS, isBuiltInSlug, isProtectedSlug, getBuiltInMetadata } from "../lib/corpus-registry.ts";

console.log("Running Drafts & Registry Unit Tests...");

// Test 1: Built-in corpus checks
assert.ok(Array.isArray(BUILT_IN_CORPUS), "BUILT_IN_CORPUS must be an array");
assert.equal(BUILT_IN_CORPUS.length, 4, "BUILT_IN_CORPUS should have exactly 4 core texts");
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

// Test 2: Metadata retrieval
const ohthereMeta = getBuiltInMetadata("ohthere");
assert.ok(ohthereMeta, "ohthere metadata must exist");
assert.equal(ohthereMeta.protected, true, "ohthere should be protected");
assert.ok(ohthereMeta.title.length > 0, "ohthere title must not be empty");

console.log("✓ All draft and corpus registry tests passed successfully!");
