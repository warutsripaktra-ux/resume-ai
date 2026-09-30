import test from "node:test";
import assert from "node:assert/strict";
import { parseReviews } from "../lib/reviews.ts";

test("a fresh browser has no saved reviews", () => {
  assert.deepEqual(parseReviews(null), {});
});

test("saved Thai notes and review status survive serialization", () => {
  const saved = { "C-001": { status: "followup", note: "ถามเพิ่มเติมเรื่องระบบ production", updatedAt: "2026-09-22T12:00:00Z" } };
  assert.deepEqual(parseReviews(JSON.stringify(saved)), saved);
});

test("one malformed record does not discard valid notes", () => {
  const valid = { status: "reviewed", note: "", updatedAt: "2026-09-22T12:00:00Z" };
  assert.deepEqual(parseReviews(JSON.stringify({ "C-001": valid, "C-002": { status: "unknown", note: 12 }, "C-003": null })), { "C-001": valid });
});

test("corrupted storage surfaces an error instead of claiming it loaded", () => {
  for (const input of ["{broken", "null", "[]", '"unexpected"']) assert.throws(() => parseReviews(input));
});
