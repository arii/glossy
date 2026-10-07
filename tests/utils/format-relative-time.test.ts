import assert from "node:assert/strict";
import { formatRelativeTime } from "../../lib/utils";

console.log("Running formatRelativeTime unit tests...");

// Test 1: Invalid date string returns empty string
assert.equal(formatRelativeTime("invalid-date-string"), "", "Invalid string should return empty string");
assert.equal(formatRelativeTime(""), "", "Empty string should return empty string");

// Test 2: Invalid Date object returns empty string
assert.equal(formatRelativeTime(new Date("invalid")), "", "Invalid Date object should return empty string");

// Test 3: Seconds in the past
const now = Date.now();
const secondsAgo = new Date(now - 15 * 1000);
const secondsResult = formatRelativeTime(secondsAgo);
assert.ok(
  secondsResult.includes("second") || secondsResult.includes("now"),
  `15 seconds ago should format as seconds or now, got: "${secondsResult}"`
);

// Test 4: Minutes in the past
const minutesAgo = new Date(now - 5 * 60 * 1000);
const minutesResult = formatRelativeTime(minutesAgo);
assert.ok(
  minutesResult.includes("minute"),
  `5 minutes ago should contain "minute", got: "${minutesResult}"`
);

// Test 5: Hours in the past
const hoursAgo = new Date(now - 3 * 3600 * 1000);
const hoursResult = formatRelativeTime(hoursAgo);
assert.ok(
  hoursResult.includes("hour"),
  `3 hours ago should contain "hour", got: "${hoursResult}"`
);

// Test 6: Days in the past
const daysAgo = new Date(now - 4 * 24 * 3600 * 1000);
const daysResult = formatRelativeTime(daysAgo);
assert.ok(
  daysResult.includes("day"),
  `4 days ago should contain "day", got: "${daysResult}"`
);

// Test 7: Months in the past
const monthsAgo = new Date(now - 60 * 24 * 3600 * 1000);
const monthsResult = formatRelativeTime(monthsAgo);
assert.ok(
  monthsResult.includes("month"),
  `60 days ago should contain "month", got: "${monthsResult}"`
);

// Test 8: Years in the past
const yearsAgo = new Date(now - 400 * 24 * 3600 * 1000);
const yearsResult = formatRelativeTime(yearsAgo);
assert.ok(
  yearsResult.includes("year"),
  `400 days ago should contain "year", got: "${yearsResult}"`
);

// Test 9: ISO string input handling
const isoString = new Date(now - 2 * 3600 * 1000).toISOString();
const isoResult = formatRelativeTime(isoString);
assert.ok(
  isoResult.includes("hour"),
  `ISO string formatted 2 hours ago should contain "hour", got: "${isoResult}"`
);

console.log("✓ All formatRelativeTime unit tests passed successfully!");
