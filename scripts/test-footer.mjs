import assert from "node:assert/strict";
import { buildFeedbackUrl } from "../components/site-footer.tsx";

console.log("Running Site Footer Feedback URL unit tests...");

// Test 1: Default fallback behavior (dev / 0.1.0)
{
  const urlStr = buildFeedbackUrl(undefined, undefined);
  const url = new URL(urlStr);
  assert.equal(url.origin + url.pathname, "https://github.com/arii/glossy/issues/new");
  assert.equal(url.searchParams.get("template"), "feedback.yml");
  assert.equal(url.searchParams.get("title"), "Feedback / Report [dev]");
  assert.equal(url.searchParams.get("environment"), "Build: v0.1.0 (dev) - commit: dev");
}

// Test 2: Custom full SHA and version
{
  const fullSha = "7b9c3f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e";
  const version = "1.2.3";
  const urlStr = buildFeedbackUrl(fullSha, version);
  const url = new URL(urlStr);

  assert.equal(url.searchParams.get("template"), "feedback.yml");
  assert.equal(url.searchParams.get("title"), "Feedback / Report [7b9c3f1]");
  assert.equal(
    url.searchParams.get("environment"),
    `Build: v1.2.3 (7b9c3f1) - commit: ${fullSha}`
  );
}

// Test 3: Short SHA (< 7 chars)
{
  const shortShaInput = "abc";
  const version = "0.5.0";
  const urlStr = buildFeedbackUrl(shortShaInput, version);
  const url = new URL(urlStr);

  assert.equal(url.searchParams.get("title"), "Feedback / Report [abc]");
  assert.equal(
    url.searchParams.get("environment"),
    "Build: v0.5.0 (abc) - commit: abc"
  );
}

// Test 4: Verify encoding safety in URL
{
  const specialSha = "sha/123#test";
  const urlStr = buildFeedbackUrl(specialSha, "1.0.0");
  const url = new URL(urlStr);
  assert.equal(url.searchParams.get("title"), "Feedback / Report [sha/123]");
  assert.equal(
    url.searchParams.get("environment"),
    "Build: v1.0.0 (sha/123) - commit: sha/123#test"
  );
}

console.log("✓ All Site Footer Feedback URL unit tests passed successfully!");
